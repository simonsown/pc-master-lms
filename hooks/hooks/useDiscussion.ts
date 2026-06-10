'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type Thread = {
  id: string
  lesson_id: string
  author_id: string
  title: string
  body: string
  type: 'question' | 'discussion' | 'announcement'
  status: 'open' | 'resolved' | 'pinned' | 'closed'
  upvote_count: number
  reply_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  author?: {
    full_name: string
    avatar_url: string
    role: string
  }
}

export type Reply = {
  id: string
  thread_id: string
  parent_reply_id: string | null
  author_id: string
  body: string
  is_teacher_answer: boolean
  upvote_count: number
  is_deleted: boolean
  created_at: string
  author?: {
    full_name: string
    avatar_url: string
    role: string
  }
}

export function useDiscussion(lessonId: string, activeTab: 'all' | 'unanswered' | 'pinned') {
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true)
      let query = supabase
        .from('discussion_threads')
        .select(`
          *,
          author:profiles(full_name, avatar_url, role)
        `)
        .eq('lesson_id', lessonId)
        .eq('is_deleted', false)

      if (activeTab === 'pinned') {
        query = query.eq('status', 'pinned')
      } else if (activeTab === 'unanswered') {
        query = query.eq('reply_count', 0)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (!error && data) {
        setThreads(data as any[])
      }
      setIsLoading(false)
    }

    fetchThreads()

    // Realtime channel for new threads
    const channel = supabase
      .channel(`lesson-discussion-${lessonId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'discussion_threads',
        filter: `lesson_id=eq.${lessonId}`
      }, () => {
        fetchThreads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lessonId, activeTab, supabase])

  const createThread = async (title: string, body: string, type: string, authorId: string) => {
    // Basic Rate Limit Check (5 threads per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const { count } = await supabase
      .from('discussion_threads')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', authorId)
      .gt('created_at', oneHourAgo)

    if (count !== null && count >= 5) {
      throw new Error('Bạn đã đạt giới hạn đăng 5 bài viết mỗi giờ.')
    }

    const { data, error } = await supabase
      .from('discussion_threads')
      .insert({
        lesson_id: lessonId,
        author_id: authorId,
        title,
        body,
        type
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return { threads, isLoading, createThread }
}

export function useThreadReplies(threadId: string) {
  const [replies, setReplies] = useState<Reply[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchReplies = async () => {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          author:profiles(full_name, avatar_url, role)
        `)
        .eq('thread_id', threadId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setReplies(data as any[])
      }
    }

    fetchReplies()

    // Realtime replies subscription
    const channel = supabase
      .channel(`thread-replies-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'discussion_replies',
        filter: `thread_id=eq.${threadId}`
      }, (payload) => {
        const fetchNewReplyAuthor = async () => {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', payload.new.author_id)
            .single()
          
          const newReply: Reply = {
            ...(payload.new as Reply),
            author: data || { full_name: 'Ẩn danh', avatar_url: '', role: 'student' }
          }
          setReplies(prev => [...prev, newReply])
        }
        fetchNewReplyAuthor()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [threadId, supabase])

  const addReply = async (body: string, authorId: string, parentReplyId: string | null = null) => {
    // Rate limit check (20 replies per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const { count } = await supabase
      .from('discussion_replies')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', authorId)
      .gt('created_at', oneHourAgo)

    if (count !== null && count >= 20) {
      throw new Error('Bạn đã đạt giới hạn 20 bình luận mỗi giờ.')
    }

    // Check if author is teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authorId)
      .single()

    const isTeacher = profile?.role === 'teacher'

    const { data, error } = await supabase
      .from('discussion_replies')
      .insert({
        thread_id: threadId,
        parent_reply_id: parentReplyId,
        author_id: authorId,
        body,
        is_teacher_answer: isTeacher
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return { replies, addReply }
}
