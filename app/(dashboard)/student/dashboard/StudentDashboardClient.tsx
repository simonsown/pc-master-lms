'use client'

import Link from 'next/link'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { motion } from 'framer-motion'
import { useRealtime } from '@/lib/realtime-provider'
import { ChevronRight } from 'lucide-react'

type UserProps = {
  id: string
  email: string
  role: string
  full_name: string
  student_code?: string
}

type ProgressStats = {
  completedLessons: number
  startedLessons: number
  totalHours: number
  averageScore: number | null
  streakDays: number
}

type ChartPoint = {
  day: string
  minutes: number
}

type Props = {
  user: UserProps
  greeting: string
  formattedDate: string
  stats: ProgressStats
  chartData: ChartPoint[]
}

const BAR_FILL = '#00d4aa'

function formatMinutes(value: number) {
  return `${value} phút`
}

export function StudentDashboardClient({
  user,
  greeting,
  formattedDate,
  stats,
  chartData
}: Props) {
  const { state: realtimeState } = useRealtime()
  const liveStreak = realtimeState.streak || stats.streakDays
  const liveTotalHours = realtimeState.studyMinutes > 0 ? (realtimeState.studyMinutes / 60) : stats.totalHours
  const liveWeeklyActivity: { day: string; minutes: number }[] = realtimeState.weeklyActivity.some(v => v > 0)
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => ({
        day,
        minutes: realtimeState.weeklyActivity[i] || 0
      }))
    : chartData

  return (
    <motion.div className="p-6 md:p-8 lg:p-10" style={{ background: 'transparent' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="max-w-[1400px] mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.6fr 1fr', alignItems: 'end' }}>
            <div className="lms-card" style={{ padding: '32px' }}>
              <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '8px' }}>Bảng điều khiển học sinh</p>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Chào buổi {greeting}, {user.full_name.split(' ').at(-1)}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Hôm nay là {formattedDate} · Streak: {liveStreak} ngày</p>
            </div>
          </section>
        </motion.div>


        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'Bài đã hoàn thành', value: `${stats.completedLessons} / ${stats.startedLessons}`, sub: 'Tổng số bài đã bắt đầu' },
              { label: 'Tổng giờ học', value: liveTotalHours.toFixed(1), sub: 'Giờ học tích lũy' },
              { label: 'Điểm TB quiz', value: stats.averageScore !== null ? `${stats.averageScore}` : '—', sub: 'Điểm trung bình' },
              { label: 'Streak', value: `${liveStreak}`, sub: 'Ngày liên tiếp' },
            ].map((s, i) => (
              <motion.div key={i} className="lms-card" style={{ padding: '20px' }} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
              </motion.div>
            ))}
          </section>
        </motion.div>

        {/* Level Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 * 0.08, duration: 0.4 }}>
          <Link href="/student/level" style={{ textDecoration: 'none' }}>
            <motion.div className="lms-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,212,170,0.08), transparent)', border: '1px solid rgba(0,212,170,0.2)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                  <div style={{ fontSize: '36px', lineHeight: 1 }}>{realtimeState.levelIcon}</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                    Level {realtimeState.level}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Cấp Độ</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {realtimeState.levelTitle}
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--brand-primary), #00f3ff)', width: `${realtimeState.levelProgress}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{realtimeState.xpInLevel} / {realtimeState.xpToNext} XP</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-primary)' }}>
                      Xem chi tiết <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4 * 0.08, duration: 0.4 }}>
          <section className="lms-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700 }}>Hoạt động 7 ngày</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>Thời gian học mỗi ngày</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dữ liệu truy cập gần nhất</div>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveWeeklyActivity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={formatMinutes} cursor={{ fill: 'rgba(8, 158, 96, 0.08)' }} contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill={BAR_FILL}>
                    {liveWeeklyActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_FILL} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  )
}
