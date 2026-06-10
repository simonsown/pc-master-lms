'use client'

import React from 'react'
import { PathItemWithUnlock } from '@/lib/learning-path'
import { BookOpen, HelpCircle, Cpu, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Props {
  item: PathItemWithUnlock
  index: number
}

export function PathItemCard({ item, index }: Props) {
  const getIcon = () => {
    switch (item.item_type) {
      case 'quiz': return <HelpCircle size={20} className="text-purple-400" />
      case 'lab_session': return <Cpu size={20} className="text-blue-400" />
      default: return <BookOpen size={20} className="text-[#00d4aa]" />
    }
  }

  const getUnlockConditionText = () => {
    if (item.is_unlocked) return null
    if (item.unlock_reason === 'need_complete_previous') {
      return 'Cần hoàn thành nhiệm vụ trước'
    }
    if (item.unlock_reason.startsWith('need_quiz_score_above')) {
      const minScore = item.unlock_reason.split('_').pop()
      return `Cần điểm bài trắc nghiệm trước đạt ≥ ${minScore}%`
    }
    return 'Chưa mở khóa'
  }

  const cardContent = (
    <div className={`
      relative p-5 bg-[#1a1c25]/80 border rounded-2xl flex items-center justify-between gap-4 transition-all duration-200
      ${item.completed ? 'border-[#00d4aa]/40 bg-[#00d4aa]/5' : item.is_unlocked ? 'border-gray-800 hover:border-gray-700' : 'border-gray-900 bg-gray-950/40 opacity-60'}
    `}>
      <div className="flex items-center gap-4">
        {/* Step Badge */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
          ${item.completed ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : item.is_unlocked ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-500'}
        `}>
          {index + 1}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getIcon()}
            <h4 className={`font-semibold ${item.is_unlocked ? 'text-white' : 'text-gray-500'}`}>
              {item.title}
            </h4>
          </div>
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">
            {item.description || 'Không có mô tả'}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
            <span>⏱️ {item.estimated_minutes} phút</span>
            {item.is_optional && <span className="bg-gray-850 px-1.5 py-0.5 rounded text-gray-400 uppercase">Tùy chọn</span>}
            {!item.is_unlocked && (
              <span className="text-red-400 flex items-center gap-1 font-bold">
                <Lock size={10} /> {getUnlockConditionText()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action / State */}
      <div>
        {item.completed ? (
          <CheckCircle size={24} className="text-[#00d4aa]" />
        ) : item.is_unlocked ? (
          <button className="px-4 py-2 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity">
            Học ngay
          </button>
        ) : (
          <Lock size={20} className="text-gray-600 mr-2" />
        )}
      </div>

      {/* Locked overlay */}
      {!item.is_unlocked && (
        <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-blur-[1px] pointer-events-none"></div>
      )}
    </div>
  )

  if (!item.is_unlocked) {
    return <div className="select-none">{cardContent}</div>
  }

  const getHref = () => {
    if (item.item_type === 'quiz') return `/student/quiz/${item.item_id}`
    if (item.item_type === 'lab_session') return `/builder`
    return `/student/lessons/${item.item_id}`
  }

  return (
    <Link href={getHref()} className="block hover:no-underline">
      {cardContent}
    </Link>
  )
}
