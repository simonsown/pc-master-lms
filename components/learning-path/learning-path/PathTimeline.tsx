'use client'

import React from 'react'
import { PathItemWithUnlock } from '@/lib/learning-path'
import { PathItemCard } from './PathItemCard'

interface Props {
  items: PathItemWithUnlock[]
}

export function PathTimeline({ items }: Props) {
  const completedCount = items.filter(i => i.completed).length
  const totalMinutes = items.filter(i => !i.completed).reduce((acc, i) => acc + (i.estimated_minutes || 0), 0)

  return (
    <div className="space-y-8">
      {/* Overview Progress bar */}
      <div className="bg-[#1a1c25]/50 border border-gray-800 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-medium text-gray-400">
            Đã hoàn thành <strong className="text-white">{completedCount}</strong> / {items.length} bài
          </span>
          <span className="font-bold text-[#00d4aa]">
            Còn khoảng ~{Math.ceil(totalMinutes / 60)} giờ học
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#00d4aa] to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / (items.length || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#00d4aa] via-teal-900 to-gray-900"></div>

        {items.map((item, idx) => (
          <div key={item.id} className="relative">
            {/* Timeline Dot Indicator */}
            <div className={`
              absolute -left-[20px] top-[18px] w-[10px] h-[10px] rounded-full border-2 z-10 transition-all duration-300
              ${item.completed ? 'bg-[#00d4aa] border-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.5)]' : item.is_unlocked ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800'}
            `}></div>

            <PathItemCard item={item} index={idx} />
          </div>
        ))}
      </div>
    </div>
  )
}
