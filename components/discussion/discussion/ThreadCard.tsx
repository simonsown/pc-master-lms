'use client'

import React from 'react'
import { Thread } from '@/hooks/useDiscussion'
import { MessageSquare, ArrowUp, User, Clock } from 'lucide-react'

interface Props {
  thread: Thread
  onSelect: (thread: Thread) => void
}

export function ThreadCard({ thread, onSelect }: Props) {
  const getBadgeStyle = () => {
    switch (thread.type) {
      case 'announcement':
        return {
          background: 'color-mix(in srgb, var(--accent-amber) 15%, transparent)',
          color: 'var(--accent-amber)',
          border: '1px solid color-mix(in srgb, var(--accent-amber) 25%, transparent)'
        }
      case 'discussion':
        return {
          background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
          color: 'var(--brand-primary)',
          border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)'
        }
      default:
        return {
          background: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)',
          color: 'var(--accent-blue)',
          border: '1px solid color-mix(in srgb, var(--accent-blue) 25%, transparent)'
        }
    }
  }

  const getBadgeText = () => {
    switch (thread.type) {
      case 'announcement': return 'Thông báo'
      case 'discussion': return 'Thảo luận'
      default: return 'Câu hỏi'
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins}p trước`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h trước`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} ngày trước`
    return then.toLocaleDateString('vi-VN')
  }

  return (
    <div 
      onClick={() => onSelect(thread)}
      className="p-4 rounded-xl transition-all cursor-pointer"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold line-clamp-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {thread.title}
        </h4>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded" style={getBadgeStyle()}>
          {getBadgeText()}
        </span>
      </div>

      <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
        {thread.body}
      </p>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          {thread.author?.avatar_url ? (
            <img src={thread.author.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
              <User size={10} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <span className="truncate max-w-[100px]">{thread.author?.full_name || 'Ẩn danh'}</span>
          {thread.author?.role === 'teacher' && (
            <span className="text-[9px] px-1 rounded uppercase font-bold" style={{ background: 'var(--brand-subtle)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>GV</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {timeAgo(thread.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <ArrowUp size={14} /> {thread.upvote_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={14} /> {thread.reply_count}
          </span>
        </div>
      </div>
    </div>
  )
}
