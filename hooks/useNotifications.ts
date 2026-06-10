'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: any
  action_url: string
  is_read: boolean
  created_at: string
}

export function useNotifications(userId?: string, options?: { filterTypes?: string[] }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()

  const filterTypesStr = options?.filterTypes?.join(',') || ''

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)

      if (options?.filterTypes && options.filterTypes.length > 0) {
        query = query.in('type', options.filterTypes)
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(20)
        
      if (data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }
    loadNotifications()

    const channel = supabase
      .channel('notifications_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new as Notification
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
        toast(newNotif.title, { icon: '🔔' })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, filterTypesStr])

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    
    await supabase.from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
