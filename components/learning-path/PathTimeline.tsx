'use client'

import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="space-y-8"
    >
      {/* Overview Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#1a1c25]/50 border border-gray-800 p-5 rounded-2xl shadow-lg"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-medium text-gray-400" style={{ color: 'var(--text-secondary)' }}>
            Đã hoàn thành <strong className="text-white" style={{ color: 'var(--text-primary)' }}>{completedCount}</strong> / {items.length} bài
          </span>
          <span className="font-bold text-[#00d4aa]" style={{ color: 'var(--brand-primary)' }}>
            Còn khoảng ~{Math.ceil(totalMinutes / 60)} giờ học
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
          <div 
            className="h-full bg-gradient-to-r from-[#00d4aa] to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / (items.length || 1)) * 100}%`, background: 'linear-gradient(to right, var(--brand-primary), #14b8a6)' }}
          ></div>
        </div>
      </motion.div>

      {/* Timeline Steps */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
        }}
        className="relative pl-6 space-y-6"
      >
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#00d4aa] via-teal-900 to-gray-900"
          style={{ background: 'linear-gradient(to bottom, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 50%, transparent), var(--border-default))' }}
        ></div>

        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 }
            }}
            className="relative"
          >
            {/* Timeline Dot Indicator */}
            <div className={`
              absolute -left-[20px] top-[18px] w-[10px] h-[10px] rounded-full border-2 z-10 transition-all duration-300
              ${item.completed ? 'bg-[#00d4aa] border-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.5)]' : item.is_unlocked ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800'}
            `}
              style={item.completed ? { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', boxShadow: '0 0 8px color-mix(in srgb, var(--brand-primary) 50%, transparent)' } : item.is_unlocked ? { background: 'var(--border-default)', borderColor: 'var(--text-muted)' } : { background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            ></div>

            <PathItemCard item={item} index={idx} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
