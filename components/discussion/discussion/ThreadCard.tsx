'use client'

import React from 'react'
import { Thread } from '@/hooks/useDiscussion'
import { MessageSquare, ArrowUp, User } from 'lucide-react'

interface Props {
  thread: Thread
  onSelect: (thread: Thread) => void
}

export function ThreadCard({ thread, onSelect }: Props) {
  const getBadgeColor = () => {
    switch (thread.type) {
      case 'announcement': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'discussion': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default: return 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
    }
  }

  const getBadgeText = () => {
    switch (thread.type) {
      case 'announcement': return 'Thông báo'
      case 'discussion': return 'Thảo luận'
      default: return 'Câu hỏi'
    }
  }

  return (
    <div 
      onClick={() => onSelect(thread)}
      className="p-4 bg-[#1e202f]/50 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-[#1e202f] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-[#dde0ed] line-clamp-1 group-hover:text-white transition-colors">
          {thread.title}
        </h4>
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getBadgeColor()}`}>
          {getBadgeText()}
        </span>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 mb-4">
        {thread.body}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {thread.author?.avatar_url ? (
            <img src={thread.author.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
              <User size={10} className="text-gray-400" />
            </div>
          )}
          <span className="truncate max-w-[100px]">{thread.author?.full_name || 'Ẩn danh'}</span>
          {thread.author?.role === 'teacher' && (
            <span className="text-[9px] bg-[#00d4aa]/10 text-[#00d4aa] px-1 rounded uppercase font-bold border border-[#00d4aa]/20">GV</span>
          )}
        </div>

        <div className="flex items-center gap-3">
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
