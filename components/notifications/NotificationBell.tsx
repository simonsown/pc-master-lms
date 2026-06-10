'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import Link from 'next/link'

export function NotificationBell({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-[#16213e] rounded-full transition-colors"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="
            absolute top-1.5 right-1.5 w-2.5 h-2.5 
            bg-[#e84855] border-2 border-[#0f0f1a] rounded-full
          "></span>
        )}
      </button>

      {/* Dropdown — 5 notifications mới nhất */}
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2 w-80
          bg-[#1a1c25] border border-gray-800
          rounded-xl shadow-2xl z-50 overflow-hidden
        ">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#16213e]/50">
            <span className="text-sm font-bold text-[#dde0ed]">Thông báo</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-[#00d4aa] font-medium hover:underline">
                Đọc tất cả
              </button>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
              ))
            )}
          </div>
          
          <Link 
            href="/notifications" 
            onClick={() => setIsOpen(false)}
            className="
              block text-center py-3 text-xs font-medium text-[#00d4aa]
              border-t border-gray-800 bg-[#16213e]/30 hover:bg-[#16213e] transition-colors
            "
          >
            Xem tất cả thông báo →
          </Link>
        </div>
      )}
    </div>
  )
}
