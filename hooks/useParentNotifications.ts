// Path: hooks/useParentNotifications.ts
'use client'
import { useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface NotificationData {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: any
  action_url: string | null
  is_read: boolean
  created_at: string
}

export function useParentNotifications(parentId: string | null) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [supabase, setSupabase] = useState<any>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    import('@/lib/supabase-ssr-client').then(m => setSupabase(m.createClient()))
  }, [])

  // Fetch initial notifications
  useEffect(() => {
    if (!parentId || !supabase) return

    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', parentId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const list = data ?? []
        setNotifications(list)
        setUnreadCount(list.filter(n => !n.is_read).length)
      } catch (err) {
        console.error('Error fetching initial notifications:', err)
      }
    }

    fetchNotifications()
  }, [parentId])

  // Subscribe to real-time notification changes
  useEffect(() => {
    if (!parentId || !supabase) return

    const channelName = `parent-notif-${parentId}`
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${parentId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotif = payload.new as NotificationData

          // Play warning sound or trigger vibration for alert events (like child low score)
          try {
            if (newNotif.type === 'child_low_score') {
              // Trigger browser vibration API
              if (typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }
              // Play a quick warning alert sound
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const osc = audioCtx.createOscillator()
              const gain = audioCtx.createGain()
              osc.type = 'sine'
              osc.frequency.setValueAtTime(300, audioCtx.currentTime) // Low warning beep
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
              osc.connect(gain)
              gain.connect(audioCtx.destination)
              osc.start()
              osc.stop(audioCtx.currentTime + 0.3)
            }
          } catch (soundErr) {
            console.warn('AudioContext sound failed to play:', soundErr)
          }

          setNotifications(prev => [newNotif, ...prev])
          setUnreadCount(prev => prev + 1)
        } else if (payload.eventType === 'UPDATE') {
          const updatedNotif = payload.new as NotificationData
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotif.id ? updatedNotif : n)
          )
          // Recalculate unread count
          setNotifications(prev => {
            const list = prev.map(n => n.id === updatedNotif.id ? updatedNotif : n)
            setUnreadCount(list.filter(n => !n.is_read).length)
            return list
          })
        }
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [parentId])

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!parentId || !supabase) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', parentId)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  return { notifications, unreadCount, markAllAsRead, markAsRead }
}
