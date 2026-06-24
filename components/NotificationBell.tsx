'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationBell() {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setUserId(user?.id ?? null)
    })
    return () => { mounted = false }
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications(userId ?? undefined)

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-label="Notifications"
        className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.02)]"
        onClick={() => setIsOpen(prev => !prev)}
        style={{ cursor: 'pointer' }}
      >
        <Bell size={18} />
      </button>
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)' }}
          className="text-xs bg-[#f03060] text-white rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          width: '360px', maxHeight: '480px', overflow: 'hidden',
          background: 'var(--bg-surface)', borderRadius: '12px',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border-default)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Thông báo</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  <CheckCheck size={14} /> Đã đọc tất cả
                </button>
              )}
              <button onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', background: n.is_read ? 'transparent' : 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                  transition: 'background 0.15s',
                }}
                  onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: n.is_read ? 500 : 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {n.body}
                        </div>
                      )}
                    </div>
                    {!n.is_read && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)', flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(n.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
