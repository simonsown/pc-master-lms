'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

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

type InProgressLesson = {
  lesson_id: string
  status: string | null
  completion_percentage: number | null
  last_accessed: string | null
  lessons?: {
    title: string | null
    thumbnail_url: string | null
  } | null
}

type Achievement = {
  id: string
  title: string
  icon: string
  description: string
}

type DailyQuiz = {
  id: string
  title: string
  description: string | null
  time_limit_minutes: number | null
}

type DailyAttempt = {
  id: string
  score: number | null
  status: string | null
  submitted_at: string | null
}

type Props = {
  user: UserProps
  greeting: string
  formattedDate: string
  stats: ProgressStats
  progressPercent: number
  chartData: ChartPoint[]
  inProgressLesson: InProgressLesson | null
  recentAchievements: Achievement[]
  dailyQuiz: DailyQuiz | null
  dailyAttempt: DailyAttempt | null
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
  progressPercent,
  chartData,
  inProgressLesson,
  recentAchievements,
  dailyQuiz,
  dailyAttempt
}: Props) {
  const thumbnailUrl = inProgressLesson?.lessons?.thumbnail_url ?? '/lesson-summary.png'
  const lessonTitle = inProgressLesson?.lessons?.title ?? 'Chưa có bài học dở'
  const progressValue = Math.max(0, Math.min(progressPercent, 100))
  const percentageLabel = `${progressValue}%`

  const dailyQuizCompleted = dailyAttempt?.status === 'submitted'

  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_progress' },
        () => router.refresh()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts' },
        () => router.refresh()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <motion.div className="p-6 md:p-8 lg:p-10" style={{ background: 'transparent' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="max-w-[1400px] mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.6fr 1fr', alignItems: 'end' }}>
            <div className="lms-card" style={{ padding: '32px' }}>
              <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '8px' }}>Bảng điều khiển học sinh</p>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Chào buổi {greeting}, {user.full_name.split(' ').at(-1)}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Hôm nay là {formattedDate} · Streak: {stats.streakDays} ngày</p>
            </div>
            <div className="lms-card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>Tổng tiến trình</div>
              <div style={{ display: 'flex', alignItems: 'end', gap: '16px' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>{percentageLabel}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hoàn thành lộ trình</div>
              </div>
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Dựa trên bài học đã hoàn thành trong toàn bộ lộ trình.</p>
            </div>
          </section>
        </motion.div>

        {/* Daily Quiz Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 * 0.08, duration: 0.4 }}>
          {dailyQuiz && (
            <section>
              <motion.div className="lms-card" style={{ padding: '24px', background: 'var(--bg-surface)' }} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--warning), #d48a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                      {dailyQuizCompleted ? '✅' : '📝'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--warning)', fontWeight: 700 }}>
                        {dailyQuizCompleted ? 'Đã hoàn thành' : 'Thử thách hằng ngày'}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{dailyQuiz.title}</div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {dailyQuizCompleted
                          ? `Bạn đạt ${dailyAttempt?.score?.toFixed(1) ?? 0}% · ${dailyAttempt?.submitted_at ? new Date(dailyAttempt.submitted_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}`
                          : `${dailyQuiz.description ?? '5 câu hỏi nhanh để ôn tập.'} · ⏱ ${dailyQuiz.time_limit_minutes ?? 10} phút`}
                      </p>
                    </div>
                  </div>
                  {dailyQuizCompleted ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>Điểm: {dailyAttempt?.score?.toFixed(0) ?? 0}%</div>
                  ) : (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link href={`/daily-quiz/${dailyQuiz.id}`} style={{ padding: '10px 24px', borderRadius: '99px', background: 'var(--warning)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '14px', flexShrink: 0 }}>
                        Làm ngay →
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </section>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'Bài đã hoàn thành', value: `${stats.completedLessons} / ${stats.startedLessons}`, sub: 'Tổng số bài đã bắt đầu' },
              { label: 'Tổng giờ học', value: stats.totalHours.toFixed(1), sub: 'Giờ học tích lũy' },
              { label: 'Điểm TB quiz', value: stats.averageScore !== null ? `${stats.averageScore}` : '—', sub: 'Điểm trung bình' },
              { label: 'Streak', value: `${stats.streakDays}`, sub: 'Ngày liên tiếp' },
            ].map((s, i) => (
              <motion.div key={i} className="lms-card" style={{ padding: '20px' }} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
              </motion.div>
            ))}
          </section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 * 0.08, duration: 0.4 }}>
          <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: '2fr 1.2fr' }}>
            <div className="lms-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700 }}>Tiến độ lộ trình</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>Theo dõi mức độ hoàn thành</div>
                </div>
                <div style={{ padding: '4px 14px', borderRadius: '99px', border: '1px solid var(--brand-primary)', fontSize: '13px', fontWeight: 700, color: 'var(--brand-primary)' }}>{percentageLabel}</div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={18} data={[{ name: 'Hoàn thành', value: progressValue, fill: BAR_FILL }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={999} background />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 700, fill: 'var(--text-primary)' }}>
                      {percentageLabel}
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <motion.div className="lms-card" style={{ padding: 0, overflow: 'hidden' }} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700 }}>Tiếp tục học</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{lessonTitle}</div>
                  </div>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link href={inProgressLesson ? `/lessons/${inProgressLesson.lesson_id}` : '/lessons'} className="lms-btn lms-btn-primary" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '99px' }}>
                      Tiếp tục →
                    </Link>
                  </motion.div>
                </div>
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-base)', marginBottom: '12px' }}>
                    <Image src={thumbnailUrl} alt={lessonTitle} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 320px" />
                  </div>
                  <div>
                    <div style={{ height: '8px', borderRadius: '99px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', background: 'var(--brand-primary)', width: `${inProgressLesson?.completion_percentage ?? 0}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{inProgressLesson ? `${Math.round(inProgressLesson.completion_percentage ?? 0)}% hoàn thành` : 'Chưa có bài học dở'}</span>
                      <span>{inProgressLesson ? 'Đang tiếp tục' : 'Bắt đầu hành trình'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="lms-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '16px' }}>Thành tích gần nhất</div>
                {recentAchievements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentAchievements.map((achievement) => (
                      <div key={achievement.id} className="lms-card" style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(8,158,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          {achievement.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{achievement.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', border: '2px dashed var(--border-default)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Hoàn thành bài học để nhận huy hiệu đầu tiên.
                  </div>
                )}
              </div>
            </div>
          </section>
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
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={formatMinutes} cursor={{ fill: 'rgba(8, 158, 96, 0.08)' }} contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill={BAR_FILL}>
                    {chartData.map((entry, index) => (
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
