'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell, AreaChart, Area } from 'recharts'
import { ProgressStats, DailyProgress, LessonProgress, QuizAttempt, BuilderActivity } from '@/lib/progress'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart2, Clock, RefreshCw, BookOpen, Award, Wrench } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface ProgressViewProps {
  data: {
    stats: ProgressStats
    dailyProgress: DailyProgress[]
    lessons: LessonProgress[]
    quizResults: QuizAttempt[]
    builderActivity: BuilderActivity[]
  }
}

const MOTIVATIONAL_QUOTES = [
  "Kiến thức là sức mạnh. Mỗi bài học bạn hoàn thành là một bước tiến!",
  "Lắp ráp PC cũng như xây dựng tương lai - từng linh kiện đều quan trọng!",
  "Sai lầm là một phần của học tập. Hãy thử lại và bạn sẽ làm được!",
  "Hôm nay bạn học được điều gì mới? Mỗi ngày một chút, một năm là cả kho báu!",
  "CPU là não bộ, RAM là trí nhớ - bạn đang rèn luyện cả hai!",
  "Đam mê công nghệ là ngọn lửa không bao giờ tắt. Hãy giữ lửa nhé!",
  "Mỗi dòng code, mỗi con chip đều kể một câu chuyện. Hãy khám phá!",
  "Kiên trì là chìa khóa. Ngày hôm nay mệt mỏi, ngày mai sẽ tiến bộ!",
  "Tương lai thuộc về những ai học hỏi không ngừng. Bạn đang đi đúng hướng!",
  "PC Master không chỉ là lắp ráp, mà là sáng tạo và đam mê!",
  "Học qua thực hành là cách tốt nhất. Builder Lab đang chờ bạn!",
  "Thử thách bản thân mỗi ngày. Học một linh kiện mới, hiểu thêm về công nghệ!",
  "Công nghệ thay đổi từng ngày, và bạn đang bắt kịp!",
  "Mỗi bài quiz hoàn thành là một chiến thắng nhỏ. Tiếp tục nhé!",
  "PC là công cụ mạnh nhất - bạn đang học cách làm chủ nó!",
]

function getDailyQuote(): string {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function ProgressView({ data: initialData }: ProgressViewProps) {
  const router = useRouter()
  const { dailyProgress: initialDaily, lessons: initialLessons, quizResults: initialQuizResults, builderActivity: initialBuilderActivity } = initialData
  const [initialStats] = useState(initialData.stats)
  const [dailyProgress, setDailyProgress] = useState(initialDaily)
  const [lessons, setLessons] = useState(initialLessons)
  const [quizResults, setQuizResults] = useState(initialQuizResults)
  const [builderActivity, setBuilderActivity] = useState(initialBuilderActivity)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all')
  const [sessionTime, setSessionTime] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [quote] = useState(getDailyQuote)
  const startTime = useRef(Date.now())
  const mountedRef = useRef(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true
    mountedRef.current = true

    async function refreshData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return

      const [progressRes, quizRes, builderRes] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('id, lesson_id, status, score, completed_at, completion_percentage, last_accessed, lessons(title)')
          .eq('student_id', user.id)
          .order('last_accessed', { ascending: false }),
        supabase
          .from('quiz_attempts')
          .select('id, quiz_id, score, max_score, status, submitted_at, created_at, quizzes(title, passing_score)')
          .eq('student_id', user.id)
          .in('status', ['graded', 'passed', 'failed', 'submitted'])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('builder_sessions')
          .select('started_at, ended_at')
          .eq('student_id', user.id)
      ])

      if (!mounted) return

      if (progressRes.data) {
        setLessons(progressRes.data.map((row: any) => ({
          id: row.id,
          lesson_id: row.lesson_id,
          lesson_title: row.lessons?.title || 'Bài học',
          type: row.lessons?.title ? 'Lý thuyết' : 'Bài học',
          status: row.status,
          score: row.score,
          completed_at: row.completed_at,
          completion_percentage: row.completion_percentage ?? 0
        })))
      }

      if (quizRes.data) {
        setQuizResults(quizRes.data.map((row: any) => ({
          id: row.id,
          quiz_title: row.quizzes?.title || 'Bài kiểm tra',
          score: row.score,
          passing_score: row.quizzes?.passing_score || 70,
          max_score: row.max_score || 100,
          total_questions: 0,
          correct_count: 0,
          submitted_at: row.submitted_at,
          status: row.status
        })))
      }

      if (builderRes.data) {
        const counts: Record<string, number> = {}
        const today = new Date()
        for (let i = 89; i >= 0; i--) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          counts[d.toISOString().split('T')[0]] = 0
        }
        builderRes.data.forEach((row: any) => {
          if (row.started_at && row.ended_at) {
            const d = new Date(row.started_at).toISOString().split('T')[0]
            if (counts[d] !== undefined) {
              counts[d] += Math.floor((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 60000)
            }
          }
        })
        setBuilderActivity(Object.keys(counts).map(date => ({ date, minutes: counts[date] })))
      }

      setLastUpdated(new Date().toLocaleTimeString('vi-VN'))
    }

    refreshData()

    const channel = supabase
      .channel('progress-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_progress' },
        () => { if (mountedRef.current) refreshData() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts' },
        () => { if (mountedRef.current) refreshData() }
      )
      .subscribe()

    return () => {
      mounted = false
      mountedRef.current = false
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredLessons = lessons.filter(l => {
    if (filter === 'all') return true
    return l.status === filter
  })

  const heatmapCols = 13
  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'var(--bg-elevated)'
    if (minutes < 15) return 'color-mix(in srgb, var(--brand-primary) 40%, transparent)'
    if (minutes < 30) return 'color-mix(in srgb, var(--brand-primary) 60%, transparent)'
    if (minutes < 60) return 'color-mix(in srgb, var(--brand-primary) 80%, transparent)'
    return 'var(--brand-primary)'
  }

  const dailyTimeData = dailyProgress.map(d => ({
    date: d.date,
    minutes: d.minutes
  }))

  return (
    <motion.div
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Workspace Title & Exit Button */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)' }}>
            <BarChart2 size={24} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>Tiến Độ Học Tập Của Bạn</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Tổng quan kết quả, hoạt động phòng Lab và tiến độ hoàn thành khóa học</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Session Timer */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)' }}>
            <Clock size={14} />
            <span>{formatDuration(sessionTime)}</span>
          </div>

          <button
            onClick={() => router.push('/student')}
            className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md group cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>
      </motion.div>

      {/* Daily Motivation */}
      <motion.div variants={itemVariants} className="rounded-2xl p-5 flex items-center gap-4 border" style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--brand-primary) 10%, transparent), color-mix(in srgb, #06b6d4 10%, transparent))', borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
        <span className="text-2xl">💡</span>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{quote}</p>
      </motion.div>

      {/* Section 1 - Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="rounded-2xl p-6 flex items-center justify-between shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Hoàn thành</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{initialStats.completed} <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>/ {initialStats.total}</span></h2>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>✅</div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="rounded-2xl p-6 flex items-center justify-between shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Điểm TB Quiz</p>
            <h2 className={`text-3xl font-bold ${initialStats.avgScore >= 70 ? '' : 'text-red-500'}`} style={{ color: initialStats.avgScore >= 70 ? 'var(--brand-primary)' : undefined }}>{initialStats.avgScore}</h2>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>🎯</div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="rounded-2xl p-6 flex items-center justify-between shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Thời gian học</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{(initialStats.totalSeconds / 3600).toFixed(1)}h</h2>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>⏱️</div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="rounded-2xl p-6 flex items-center justify-between shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Streak</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{initialStats.streak} ngày</h2>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)', color: '#f59e0b' }}>🔥</div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <RefreshCw size={12} />
          {lastUpdated ? `Cập nhật lúc ${lastUpdated}` : 'Theo thời gian thực'}
        </p>
        <p className="text-xs sm:hidden flex items-center gap-1" style={{ color: 'var(--brand-primary)' }}>
          <Clock size={12} />
          {formatDuration(sessionTime)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 2 - 30-day chart */}
        <motion.div variants={itemVariants} className="rounded-[28px] p-6 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Tiến độ 30 ngày</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'minutes') return [`${value} phút`, 'Thời gian học']
                    return [`${value} bài`, 'Bài hoàn thành']
                  }}
                  labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="var(--brand-primary)" strokeWidth={2} fill="url(#colorMinutes)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Thời gian học (phút) mỗi ngày từ bài học & Builder Lab</p>
        </motion.div>

        {/* Section 4 - Phân tích Quiz */}
        <motion.div variants={itemVariants} className="rounded-[28px] p-6 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Phân tích Quiz</h3>
          {quizResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
              <Award size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Chưa có kết quả quiz nào.</p>
              <p className="text-xs mt-1">Hoàn thành bài kiểm tra để xem phân tích tại đây.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizResults} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="quiz_title" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Điểm']}
                    cursor={{ fill: 'color-mix(in srgb, var(--text-primary) 5%, transparent)' }}
                  />
                  <ReferenceLine y={70} stroke="var(--text-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Ngưỡng đạt', fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {
                      quizResults.map((entry, index) => {
                        const color = entry.score >= 90 ? 'var(--brand-primary)' : entry.score >= 70 ? '#4a90e2' : '#e84855'
                        return <Cell key={`cell-${index}`} fill={color} />
                      })
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Section 5 - Builder Lab Activity */}
      <motion.div variants={itemVariants} className="rounded-[28px] p-6 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Builder Lab Activity (90 ngày)</h3>
        {builderActivity.length === 0 || builderActivity.every(b => b.minutes === 0) ? (
          <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-muted)' }}>
            <Wrench size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Chưa có hoạt động Builder Lab.</p>
            <p className="text-xs mt-1">Vào phòng thực hành lắp ráp để bắt đầu!</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4">
              <div className="flex flex-col flex-wrap h-32 gap-1 content-start">
                {builderActivity.map((day, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: getIntensityColor(day.minutes) }}
                    title={`${day.date}: ${day.minutes} phút`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs justify-end" style={{ color: 'var(--text-secondary)' }}>
              <span>Ít</span>
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--brand-primary)', opacity: 0.4 }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--brand-primary)', opacity: 0.6 }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--brand-primary)', opacity: 0.8 }}></div>
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--brand-primary)' }}></div>
              <span>Nhiều</span>
            </div>
          </>
        )}
      </motion.div>

      {/* Section 3 - Danh sách bài học */}
      <motion.div variants={itemVariants} className="rounded-[28px] p-6 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Lịch sử học tập</h3>
          <div className="flex gap-2 p-1 rounded-lg border overflow-x-auto w-full md:w-auto" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)' }}>
            {['all', 'completed', 'in_progress', 'not_started'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filter === f ? 'shadow' : ''}`}
                style={{
                  background: filter === f ? 'var(--bg-elevated)' : 'transparent',
                  color: filter === f ? 'var(--brand-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => { if (filter !== f) e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { if (filter !== f) e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {f === 'all' ? 'Tất cả' : f === 'completed' ? 'Đã xong' : f === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Tên bài</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Loại</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Trạng thái</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Điểm</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Hoàn thành lúc</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((l, i) => (
                <tr key={l.id} className="transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--border-default)' : undefined, background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-base) 50%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td className="py-4 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.lesson_title}</td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{l.type}</td>
                  <td className="py-4 px-4">
                    {l.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>Hoàn thành</span>
                    ) : l.status === 'in_progress' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'color-mix(in srgb, #3b82f6 10%, transparent)', color: '#3b82f6' }}>Đang học ({l.completion_percentage}%)</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)', color: 'var(--text-muted)' }}>Chưa bắt đầu</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{l.score !== null ? l.score : '-'}</td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {l.completed_at ? new Date(l.completed_at).toLocaleString('vi-VN') : '-'}
                  </td>
                </tr>
              ))}
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
