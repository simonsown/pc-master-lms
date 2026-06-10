'use client'

import React from 'react'
import Link from 'next/link'
import { Notification } from '@/hooks/useNotifications'
import { CheckCircle, BookOpen, Clock, MessageSquare, Trophy, FileText, Bell } from 'lucide-react'

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const getIcon = () => {
    switch (notification.type) {
      case 'quiz_graded': return <CheckCircle size={16} className="text-[#00d4aa]" />
      case 'lesson_unlocked': return <BookOpen size={16} className="text-blue-400" />
      case 'deadline_reminder': return <Clock size={16} className="text-orange-400" />
      case 'teacher_message': return <MessageSquare size={16} className="text-purple-400" />
      case 'achievement_earned': return <Trophy size={16} className="text-yellow-400" />
      case 'certificate_ready': return <FileText size={16} className="text-pink-400" />
      default: return <Bell size={16} className="text-gray-400" />
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  return (
    <Link 
      href={notification.action_url || '#'}
      onClick={() => {
        if (!notification.is_read) onRead(notification.id)
      }}
      className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!notification.is_read ? 'bg-[#00d4aa]/5' : ''}`}
    >
      <div className="flex gap-3">
        <div className="mt-1 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-white font-bold' : 'text-gray-300'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            {timeAgo(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-[#e84855] rounded-full mt-2 flex-shrink-0"></div>
        )}
      </div>
    </Link>
  )
}
