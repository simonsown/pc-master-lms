'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Notification } from '@/hooks/useNotifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { CheckCheck, ArrowLeft, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setNotifications(data as Notification[])
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Đang tải thông báo...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* High-tech overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#00d4aa]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Title & Exit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Tất Cả Thông Báo</h1>
              <p className="text-xs text-gray-400 mt-0.5">Cập nhật tin tức, nhiệm vụ và tiến độ học tập mới nhất</p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/builder')}
            className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        <div className="flex justify-end mb-4 relative z-50">
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-[#00d4aa] hover:bg-[#00d4aa]/10 px-4 py-2 rounded-lg transition-colors text-sm font-bold pointer-events-auto cursor-pointer"
          >
            <CheckCheck size={18} />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="bg-[#11121d]/80 rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl backdrop-blur-md relative z-10">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">
              Bạn không có thông báo nào.
            </div>
          ) : (
            notifications.map((notif, index) => (
              <div key={notif.id} className={index !== notifications.length - 1 ? 'border-b border-gray-800' : ''}>
                <NotificationItem 
                  notification={notif} 
                  onRead={markAsRead} 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
