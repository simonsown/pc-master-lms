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
        badge: 'text-amber-400',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
      }
      case 'rare': return {
        badge: 'text-blue-400',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
      }
      case 'uncommon': return {
        badge: 'text-[var(--brand-primary)]',
        glow: 'shadow-[0_0_15px_rgba(0,212,170,0.15)]'
      }
      default: return {
        badge: 'text-gray-400',
        glow: ''
      }
    }
  }

  const styles = getRarityStyles()

  return (
    <div className={`
      relative p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 overflow-hidden
      ${badge.earned ? `${styles.glow}` : 'opacity-45 grayscale'}
    `} style={{
      background: badge.earned ? 'var(--bg-surface)' : 'color-mix(in srgb, var(--bg-surface) 30%, transparent)',
      border: badge.earned ? '1px solid var(--border-default)' : '1px solid color-mix(in srgb, var(--border-default) 50%, transparent)'
    }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 relative z-10" style={{
        background: badge.earned ? 'var(--bg-elevated)' : 'var(--bg-base)',
        border: badge.earned ? '1px solid var(--border-default)' : '1px solid color-mix(in srgb, var(--border-default) 50%, transparent)'
      }}>
        {badge.earned ? badge.icon : '🔒'}
      </div>

      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 border ${styles.badge}`} style={{
        background: 'color-mix(in srgb, currentColor 10%, transparent)',
        borderColor: 'color-mix(in srgb, currentColor 20%, transparent)'
      }}>
        {badge.rarity === 'legendary' ? 'Huyền thoại' : badge.rarity === 'rare' ? 'Hiếm' : badge.rarity === 'uncommon' ? 'Không phổ biến' : 'Thông thường'}
      </span>

      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
        {badge.earned ? badge.title : 'Thành tích ẩn'}
      </h3>

      <p className="text-xs max-w-[200px] mb-4" style={{ color: 'var(--text-muted)' }}>
        {badge.earned ? badge.description : '? Bí mật. Cần khám phá thêm để mở khóa.'}
      </p>

      <div className="mt-auto w-full pt-3 flex items-center justify-between text-[10px] font-bold" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
        <span>+{badge.points} PTS</span>
        {badge.earned && badge.earnedAt && (
          <span style={{ color: 'var(--brand-primary)' }}>Đạt: {new Date(badge.earnedAt).toLocaleDateString('vi-VN')}</span>
        )}
      </div>
    </div>
  )
}
