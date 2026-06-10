'use client'

import React from 'react'
import { Lock } from 'lucide-react'

interface Props {
  badge: {
    id: string
    title: string
    description: string
    icon: string
    points: number
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
    earned: boolean
    earnedAt?: string
  }
}

export function BadgeCard({ badge }: Props) {
  const getRarityStyles = () => {
    switch (badge.rarity) {
      case 'legendary': return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/30'
      }
      case 'rare': return {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-500/30'
      }
      case 'uncommon': return {
        badge: 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20',
        glow: 'shadow-[0_0_15px_rgba(0,212,170,0.15)] border-[#00d4aa]/30'
      }
      default: return {
        badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        glow: 'border-gray-800'
      }
    }
  }

  const styles = getRarityStyles()

  return (
    <div className={`
      relative p-6 bg-[#1a1c25]/80 border rounded-2xl flex flex-col items-center text-center transition-all duration-300 overflow-hidden
      ${badge.earned ? `${styles.glow} bg-gradient-to-b from-[#1a1c25]/80 to-[#1e202f]/40` : 'border-gray-900 bg-gray-950/20 grayscale opacity-45'}
    `}>
      {/* Badge Icon */}
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 relative z-10
        ${badge.earned ? 'bg-[#16213e]/60 border border-white/10' : 'bg-gray-900 border border-gray-850'}
      `}>
        {badge.earned ? badge.icon : '🔒'}
      </div>

      {/* Rarity Tag */}
      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 border ${styles.badge}`}>
        {badge.rarity === 'legendary' ? 'Huyền thoại' : badge.rarity === 'rare' ? 'Hiếm' : badge.rarity === 'uncommon' ? 'Không phổ biến' : 'Thông thường'}
      </span>

      {/* Title */}
      <h3 className="font-bold text-white text-base mb-1">
        {badge.earned ? badge.title : 'Thành tích ẩn'}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-400 max-w-[200px] mb-4">
        {badge.earned ? badge.description : '? Bí mật. Cần khám phá thêm để mở khóa.'}
      </p>

      {/* Earned Date or Point value */}
      <div className="mt-auto w-full pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
        <span>+{badge.points} PTS</span>
        {badge.earned && badge.earnedAt && (
          <span className="text-[#00d4aa]">Đạt: {new Date(badge.earnedAt).toLocaleDateString('vi-VN')}</span>
        )}
      </div>
    </div>
  )
}
