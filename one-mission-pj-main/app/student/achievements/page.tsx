'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements'
import { BadgeCard } from '@/components/achievements/BadgeCard'
import { Trophy, RefreshCw } from 'lucide-react'

export default function StudentAchievementsPage() {
  const [badges, setBadges] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [earnedCount, setEarnedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadAchievements = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: earned } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', user.id)

      const earnedMap = new Map((earned || []).map(e => [e.achievement_id, e.earned_at]))

      let pts = 0
      let count = 0

      const processed = ACHIEVEMENT_DEFINITIONS.map(def => {
        const isEarned = earnedMap.has(def.id)
        if (isEarned) {
          pts += def.points
          count++
        }
        return {
          ...def,
          earned: isEarned,
          earnedAt: earnedMap.get(def.id)
        }
      })

      setBadges(processed)
      setTotalPoints(pts)
      setEarnedCount(count)
      setLoading(false)
    }

    loadAchievements()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải bảng huy hiệu...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[100px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 p-6 rounded-2xl shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-amber) 20%, transparent)', color: 'var(--accent-amber)' }}>
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Thành tích & Huy hiệu</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Vượt qua các thử thách thực hành để thu thập điểm và mở khóa huy hiệu danh giá</p>
            </div>
          </div>

          <div className="flex gap-6 pl-6" style={{ borderLeft: '1px solid var(--border-default)' }}>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tổng điểm</p>
              <p className="text-2xl font-black" style={{ color: 'var(--brand-primary)' }}>{totalPoints} PTS</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Đã mở khóa</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{earnedCount} / {badges.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badges.map(b => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>

      </div>
    </div>
  )
}
