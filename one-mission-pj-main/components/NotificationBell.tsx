'use client'

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationBell() {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setUserId(user?.id ?? null)
    })
    return () => { mounted = false }
  }, [supabase])

  const { unreadCount, notifications, markAllAsRead } = useNotifications(userId ?? undefined)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button aria-label="Notifications" className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.02)]">
        <Bell size={18} />
      </button>
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)' }}
          className="text-xs bg-[#f03060] text-white rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  )
}
