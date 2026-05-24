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
      className="block bg-[#111318] border border-white/5 rounded-xl p-5 hover:border-[#00d4aa]/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,170,0.03)] group"
    >
      {/* Avatar + Tên */}
      <div className="flex items-center gap-3 mb-4">
        {child.avatar_url ? (
          <img src={child.avatar_url} className="w-12 h-12 rounded-full object-cover border border-white/10" alt={child.student_name} />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1f2130] flex items-center justify-center text-xl font-bold text-[#00d4aa] border border-white/5 uppercase">
            {child.student_name[0] || 'S'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[#dde0ed] truncate group-hover:text-[#00d4aa] transition-colors">{child.student_name}</div>
          <div className="text-xs text-[#636678] truncate">{child.school_name || 'Chưa cập nhật trường học'}</div>
        </div>
        <div className="bg-[#00d4aa]/10 text-[#00d4aa] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Cấp {child.level || 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1a1c25] rounded-xl p-3 text-center border border-white/5">
          <div className="text-xl font-black text-[#00d4aa]">{child.lessons_completed}</div>
          <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Bài đã xong</div>
        </div>
        <div className="bg-[#1a1c25] rounded-xl p-3 text-center border border-white/5">
          <div className="text-xl font-black text-[#dde0ed]">
            {Math.round((child.total_time_seconds ?? 0) / 3600)}h
          </div>
          <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Tổng giờ học</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-bold text-[#636678] mb-1">
          <span>Tiến độ hoàn thành bài</span>
          <span className="text-[#dde0ed]">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-[#1a1c25] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Last Active Footer */}
      <div className="text-[11px] text-[#636678] flex items-center gap-2 pt-3 border-t border-white/5">
        <span className={`w-2 h-2 rounded-full ${
          isRecentlyActive ? 'bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.5)]' : 'bg-[#636678]'
        }`} />
        <span>Hoạt động: {lastActiveText}</span>
      </div>
    </Link>
  )
}
