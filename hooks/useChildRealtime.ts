// Path: hooks/useChildRealtime.ts
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase-ssr-client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RecentActivity {
  id: string
  type: 'lesson_completed' | 'lesson_started' | 'quiz_graded' | 'login'
  title: string
  timestamp: string
  score?: number
  lessonTitle?: string
}

export interface ChildRealtimeData {
  isOnline: boolean
  lastSeen: string | null
  lessonsCompleted: number
  totalLessonsStarted: number
  totalTimeSeconds: number
  averageQuizScore: number | null
  recentActivities: RecentActivity[]
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export function useChildRealtime(studentId: string | null): ChildRealtimeData {
  const [data, setData] = useState<ChildRealtimeData>({
    isOnline: false,
    lastSeen: null,
    lessonsCompleted: 0,
    totalLessonsStarted: 0,
    totalTimeSeconds: 0,
    averageQuizScore: null,
    recentActivities: [],
    connectionStatus: 'connecting',
  })
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!studentId) return

    setData(prev => ({ ...prev, connectionStatus: 'connecting' }))

    try {
      const [progressRes, quizRes, profileRes] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('status, time_spent_seconds, completed_at, last_accessed')
          .eq('student_id', studentId)
          .order('last_accessed', { ascending: false }),
        supabase
          .from('quiz_attempts')
          .select('score, max_score, submitted_at, quiz_title, status')
          .eq('student_id', studentId)
          .eq('status', 'graded')
          .order('submitted_at', { ascending: false })
          .limit(10),
        supabase
          .from('profiles')
          .select('is_online, last_seen_at')
          .eq('id', studentId)
          .single(),
      ])

      const progress = progressRes.data ?? []
      const quizzes = quizRes.data ?? []
      const profile = profileRes.data

      const completed = progress.filter(p => p.status === 'completed')
      const totalTime = progress.reduce((sum, p) => sum + (p.time_spent_seconds ?? 0), 0)
      const avgScore = quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + (Number(q.score) ?? 0), 0) / quizzes.length
        : null

      // Build recent activities list
      const activities: RecentActivity[] = []

      // From lesson progress (last 5 completed/active)
      progress.forEach(p => {
        if (p.status === 'completed' && p.completed_at) {
          activities.push({
            id: `lesson-${p.completed_at}`,
            type: 'lesson_completed',
            title: 'Hoàn thành bài học',
            timestamp: p.completed_at,
          })
        } else if (p.status === 'in_progress' && p.last_accessed) {
          activities.push({
            id: `lesson-started-${p.last_accessed}`,
            type: 'lesson_started',
            title: 'Đang học bài',
            timestamp: p.last_accessed,
          })
        }
      })

      // From quiz attempts (last 5 graded)
      quizzes.forEach(q => {
        if (q.submitted_at) {
          activities.push({
            id: `quiz-${q.submitted_at}`,
            type: 'quiz_graded',
            title: `Kết quả: ${q.quiz_title}`,
            timestamp: q.submitted_at,
            score: Number(q.score) ?? 0,
          })
        }
      })

      // Sort activities descending by timestamp
      activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setData({
        isOnline: profile?.is_online ?? false,
        lastSeen: profile?.last_seen_at ?? null,
        lessonsCompleted: completed.length,
        totalLessonsStarted: progress.length,
        totalTimeSeconds: totalTime,
        averageQuizScore: avgScore,
        recentActivities: activities.slice(0, 8),
        connectionStatus: 'connecting', // will update after WebSocket connects
      })
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setData(prev => ({ ...prev, connectionStatus: 'error' }))
    }
  }, [studentId])

  useEffect(() => {
    if (!studentId) {
      setData({
        isOnline: false,
        lastSeen: null,
        lessonsCompleted: 0,
        totalLessonsStarted: 0,
        totalTimeSeconds: 0,
        averageQuizScore: null,
        recentActivities: [],
        connectionStatus: 'disconnected',
      })
      return
    }

    fetchInitialData()

    // 1. Create a specific child monitoring realtime channel
    const channelName = `parent-watch-${studentId}`
    const channel = supabase.channel(channelName)

    channelRef.current = channel

    // 2. Subscribe to lesson_progress table changes
    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lesson_progress',
        filter: `student_id=eq.${studentId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const record = payload.new as any

          setData(prev => {
            const isComp = record.status === 'completed'
            const newActivity: RecentActivity = {
              id: `lesson-${record.lesson_id}-${Date.now()}`,
              type: isComp ? 'lesson_completed' : 'lesson_started',
              title: isComp ? 'Hoàn thành bài học' : 'Đang học bài',
              timestamp: new Date().toISOString(),
            }

            // Recalculate lessons completed & started
            const completedCount = isComp ? prev.lessonsCompleted + 1 : prev.lessonsCompleted

            return {
              ...prev,
              lessonsCompleted: completedCount,
              totalTimeSeconds: prev.totalTimeSeconds + (record.time_spent_seconds ?? 0),
              recentActivities: [newActivity, ...prev.recentActivities].slice(0, 8),
            }
          })
        }
      })

      // 3. Subscribe to quiz_attempts table changes (when graded)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_attempts',
        filter: `student_id=eq.${studentId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const record = payload.new as any
          if (record.status === 'graded') {
            setData(prev => {
              const newActivity: RecentActivity = {
                id: `quiz-${record.id}-${Date.now()}`,
                type: 'quiz_graded',
                title: `Kết quả: ${record.quiz_title}`,
                timestamp: record.submitted_at ?? new Date().toISOString(),
                score: Number(record.score) ?? 0,
              }

              // Recalculate average quiz score
              const currentQuizActivities = prev.recentActivities.filter(a => a.type === 'quiz_graded')
              const scores = currentQuizActivities.map(a => a.score ?? 0)
              scores.unshift(Number(record.score) ?? 0)
              const avgScore = scores.reduce((s, sc) => s + sc, 0) / scores.length

              return {
                ...prev,
                averageQuizScore: avgScore,
                recentActivities: [newActivity, ...prev.recentActivities].slice(0, 8),
              }
            })
          }
        }
      })

      // 4. Subscribe to profile table changes (online / active state)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${studentId}`,
      }, (payload) => {
        const record = payload.new as any
        setData(prev => ({
          ...prev,
          isOnline: record.is_online ?? false,
          lastSeen: record.last_seen_at ?? prev.lastSeen,
        }))
      })

      // 5. Connect and subscribe to channel updates
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setData(prev => ({ ...prev, connectionStatus: 'connected' }))
        } else if (status === 'CHANNEL_ERROR') {
          setData(prev => ({ ...prev, connectionStatus: 'error' }))
        } else if (status === 'CLOSED') {
          setData(prev => ({ ...prev, connectionStatus: 'disconnected' }))
        } else {
          setData(prev => ({ ...prev, connectionStatus: 'connecting' }))
        }
      })

    // 6. Cleanup channel on unmount or child selection change (Channel Cleanup Rule)
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [studentId, fetchInitialData])

  return data
}
