'use client'

import Link from 'next/link'
import { useMemo } from 'react'
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
import { ChevronRight, Cpu, GraduationCap } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

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
const TODAY_FILL = '#00f3ff'

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function formatMinutes(value: number) {
  return `${value} phút`
}

function useTodayIndex() {
  return useMemo(() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  }, [])
}

function LiveDot({ size = 8 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#22c55e',
        marginRight: 6,
        animation: 'live-pulse 1.5s ease-in-out infinite',
        verticalAlign: 'middle',
      }}
    />
  )
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
    ? DAY_LABELS.map((day, i) => ({
        day,
        minutes: realtimeState.weeklyActivity[i] || 0
      }))
    : chartData
  const todayIndex = useTodayIndex()
  const todayMinutes = liveWeeklyActivity[todayIndex]?.minutes || 0
  const hasStudiedToday = todayMinutes > 0
  const isMobile = useIsMobile()

  return (
    <motion.div className={isMobile ? 'p-4' : 'p-6 md:p-8 lg:p-10'} style={{ background: 'transparent' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="max-w-[1400px] mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', alignItems: 'end' }}>
            <div className="lms-card" style={{ padding: isMobile ? '20px' : '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '8px' }}>Bảng điều khiển</p>
              <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Chào buổi {greeting}, {user.full_name.split(' ').at(-1)}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Hôm nay là {formattedDate} · Streak: {liveStreak} ngày</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/builder" className="lms-btn lms-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  <Cpu size={16} /> Thực hành lắp ráp
                </Link>
                <Link href="/exams" className="lms-btn lms-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
                  <GraduationCap size={16} /> Thi thử
                </Link>
              </div>
            </div>
            <motion.div className="lms-card" style={{ padding: isMobile ? '16px' : '24px', background: 'linear-gradient(135deg, rgba(0,212,170,0.04), transparent)', border: '1px solid rgba(0,212,170,0.15)' }} whileHover={{ scale: 1.02 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '44px', lineHeight: 1 }}>{realtimeState.levelIcon}</div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Cấp độ</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{realtimeState.levelTitle}</div>
                  <div style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: 600 }}>Level {realtimeState.level}</div>
                </div>
              </div>
              <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: '12px' }}>
                <div style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--brand-primary), #00f3ff)', width: `${realtimeState.levelProgress}%`, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>{realtimeState.xpInLevel} / {realtimeState.xpToNext} XP</span>
              </div>
            </motion.div>
          </section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : '2.2fr 1fr' }}>
            <motion.div className="lms-card" style={{
              padding: isMobile ? '16px' : '24px',
              background: hasStudiedToday
                ? 'linear-gradient(135deg, rgba(34,197,94,0.06), transparent)'
                : undefined,
              border: hasStudiedToday ? '1px solid rgba(34,197,94,0.25)' : undefined,
            }} whileHover={{ scale: 1.02 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>
                  <LiveDot /> Học tập hôm nay
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '11px', fontWeight: 700, color: hasStudiedToday ? '#22c55e' : 'var(--text-muted)',
                }}>
                  {hasStudiedToday ? '✓ Đã học' : 'Chưa học'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <motion.span
                  key={todayMinutes}
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, color: 'var(--text-primary)' }}
                >
                  {todayMinutes}
                </motion.span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>phút hôm nay</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
                {hasStudiedToday
                  ? `Tuyệt vời! Bạn đã học ${todayMinutes} phút hôm nay.`
                  : 'Bắt đầu một bài học hoặc lắp ráp PC ngay!'}
              </div>
            </motion.div>

            <motion.div className="lms-card" style={{
              padding: isMobile ? '16px' : '24px',
              background: liveStreak >= 3
                ? 'linear-gradient(135deg, rgba(255,165,0,0.06), transparent)'
                : undefined,
              border: liveStreak >= 3 ? '1px solid rgba(255,165,0,0.2)' : undefined,
            }} whileHover={{ scale: 1.02 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 8 }}>
                Streak hiện tại
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <motion.span
                  key={liveStreak}
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, color: liveStreak >= 3 ? '#f59e0b' : 'var(--text-primary)' }}
                >
                  {liveStreak}
                </motion.span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>ngày liên tiếp</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                {Array.from({ length: Math.min(liveStreak, 7) }).map((_, i) => (
                  <div key={i} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: i < liveStreak ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>🔥</div>
                ))}
              </div>
            </motion.div>
          </section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label: 'Bài hoàn thành', value: `${stats.completedLessons} / ${stats.startedLessons}`, sub: 'Tổng bài đã bắt đầu', live: false },
              { label: 'Tổng giờ học', value: liveTotalHours.toFixed(1), sub: 'Giờ tích lũy', live: true },
              { label: 'Điểm TB quiz', value: stats.averageScore !== null ? `${stats.averageScore}` : '—', sub: 'Điểm trung bình', live: false },
              { label: 'Tổng XP', value: `${realtimeState.xp}`, sub: 'Kinh nghiệm tích lũy', live: true },
            ].map((s, i) => (
              <motion.div key={i} className="lms-card" style={{ padding: isMobile ? '14px' : '20px', position: 'relative', overflow: 'hidden' }} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                {s.live && (
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <LiveDot size={6} />
                  </div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                <motion.div
                  key={s.value}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: 'var(--text-primary)' }}
                >{s.value}</motion.div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
              </motion.div>
            ))}
          </section>
        </motion.div>

        {/* Level Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 * 0.08, duration: 0.4 }}>
          <Link href="/student/level" style={{ textDecoration: 'none' }}>
            <motion.div className="lms-card" style={{ padding: isMobile ? '16px' : '24px', background: 'linear-gradient(135deg, rgba(0,212,170,0.08), transparent)', border: '1px solid rgba(0,212,170,0.2)', cursor: 'pointer', overflow: 'hidden', position: 'relative' }} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
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
          <section className="lms-card" style={{ padding: isMobile ? '16px' : '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700 }}>Hoạt động 7 ngày</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>Thời gian học mỗi ngày</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>
                <LiveDot size={6} /> Trực tiếp
              </div>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={index === todayIndex ? TODAY_FILL : BAR_FILL}
                        style={index === todayIndex ? { filter: 'brightness(1.2)', transition: 'fill 0.3s ease' } : undefined}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </motion.div>

        <style>{`
          @keyframes live-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
        `}</style>
      </div>
    </motion.div>
  )
}
