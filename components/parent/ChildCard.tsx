"use client"

import React from 'react'
import Link from 'next/link'

export interface ChildSummary {
  student_id: string
  student_name: string
  student_code: string
  school_name: string | null
  xp: number
  level: number
  avatar_url: string | null
  lessons_completed: number
  lessons_started: number
  total_time_seconds: number | null
  last_active: string | null
}

function formatTimeAgo(dateString: string | null) {
  if (!dateString) return 'Chưa bắt đầu học'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (isNaN(diffMs)) return 'Chưa bắt đầu học'
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  return `${diffDays} ngày trước`
}

export function ChildCard({ child }: { child: ChildSummary }) {
  const progressPercent = child.lessons_started > 0
    ? Math.round((child.lessons_completed / child.lessons_started) * 100) : 0
  const lastActiveText = formatTimeAgo(child.last_active)
  
  // Kiểm tra hoạt động trong vòng 24 giờ qua
  const isRecentlyActive = child.last_active 
    ? new Date(child.last_active) > new Date(Date.now() - 86400000)
    : false

  return (
    <Link
      href={`/parent/children/${child.student_id}`}
      className="block rounded-xl p-5 transition-all duration-200 group"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Avatar + Tên */}
      <div className="flex items-center gap-3 mb-4">
        {child.avatar_url ? (
          <img src={child.avatar_url} className="w-12 h-12 rounded-full object-cover" style={{ border: '1px solid var(--border-default)' }} alt={child.student_name} />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold uppercase" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}>
            {child.student_name[0] || 'S'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold truncate transition-colors" style={{ color: 'var(--text-primary)' }}>{child.student_name}</div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{child.school_name || 'Chưa cập nhật trường học'}</div>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(0, 212, 170, 0.1)', color: 'var(--brand-primary)' }}>
          Cấp {child.level || 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-xl font-black" style={{ color: 'var(--brand-primary)' }}>{child.lessons_completed}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Bài đã xong</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            {Math.round((child.total_time_seconds ?? 0) / 3600)}h
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Tổng giờ học</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>Tiến độ hoàn thành bài</span>
          <span style={{ color: 'var(--text-primary)' }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div
            className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Last Active Footer */}
      <div className="text-[11px] flex items-center gap-2 pt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
        <span className="w-2 h-2 rounded-full" style={{
          background: isRecentlyActive ? 'var(--brand-primary)' : 'var(--text-muted)',
          boxShadow: isRecentlyActive ? '0 0 8px var(--brand-primary)' : 'none'
        }} />
        <span>Hoạt động: {lastActiveText}</span>
      </div>
    </Link>
  )
}
