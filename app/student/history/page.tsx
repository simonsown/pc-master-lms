'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, BookOpen, Award, Clock, ChevronRight, Wrench, Cpu,
  Monitor, Smartphone, HardDrive, Shield, Zap, Star, Trophy,
  BrainCircuit, Sparkles, RefreshCw, Calendar, Filter, ArrowUpDown,
  CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react'
import { format, isSameDay, parseISO, startOfDay } from 'date-fns'

type ActivityType = 'lesson' | 'quiz' | 'exam' | 'builder' | 'xp'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  details: string
  time: string
  score: number | null
  xpEarned: number
  icon: React.ReactNode
  color: string
  status?: string
}

const TYPE_CONFIG: Record<ActivityType, { label: string; color: string; gradient: string }> = {
  lesson: { label: 'Bài Học', color: '#10B981', gradient: 'from-emerald-500 to-green-600' },
  quiz: { label: 'Bài Kiểm Tra', color: '#6366F1', gradient: 'from-indigo-500 to-purple-600' },
  exam: { label: 'Kỳ Thi', color: '#EF4444', gradient: 'from-red-500 to-rose-600' },
  builder: { label: 'Lắp Ráp PC', color: '#06B6D4', gradient: 'from-cyan-500 to-blue-600' },
  xp: { label: 'Kinh Nghiệm', color: '#F59E0B', gradient: 'from-amber-500 to-yellow-600' },
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'Vừa xong'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return format(d, 'dd/MM/yyyy')
}

function formatTimeDisplay(dateStr: string): string {
  const d = new Date(dateStr)
  return format(d, 'HH:mm')
}

export default function StudentHistoryPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [sortAsc, setSortAsc] = useState(false)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getIconForType = (type: ActivityType): React.ReactNode => {
    const props = { size: 18 }
    switch (type) {
      case 'lesson': return <BookOpen {...props} />
      case 'quiz': return <BrainCircuit {...props} />
      case 'exam': return <Award {...props} />
      case 'builder': return <Wrench {...props} />
      case 'xp': return <Zap {...props} />
    }
  }

  const fetchHistory = useCallback(async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setLoading(false); return }
      setUserId(u.id)

      const [lessonsRes, quizRes, examRes, builderRes, xpRes] = await Promise.all([
        supabase.from('lesson_progress')
          .select('lesson_id, status, completed_at, last_accessed, time_spent_seconds, score, completion_percentage, lessons(title)')
          .eq('student_id', u.id)
          .not('last_accessed', 'is', null)
          .order('last_accessed', { ascending: false })
          .limit(50),
        supabase.from('quiz_attempts')
          .select('id, quiz_id, score, status, submitted_at, created_at, quizzes(title)')
          .eq('student_id', u.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('exam_attempts')
          .select('id, exam_id, score, status, started_at, submitted_at, exams(title)')
          .eq('student_id', u.id)
          .order('started_at', { ascending: false })
          .limit(50),
        supabase.from('builder_sessions')
          .select('started_at, ended_at')
          .eq('student_id', u.id)
          .not('started_at', 'is', null)
          .order('started_at', { ascending: false })
          .limit(50),
        supabase.from('xp_transactions')
          .select('amount, reason, reference_type, created_at')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      const items: Activity[] = []

      ;(lessonsRes.data || []).forEach((l: any) => {
        items.push({
          id: `lesson-${l.lesson_id}-${l.last_accessed}`,
          type: 'lesson',
          title: l.lessons?.title || 'Bài học',
          description: l.status === 'completed' ? 'Hoàn thành bài học' : `Đang học (${Math.round(l.completion_percentage || 0)}%)`,
          details: l.status === 'completed'
            ? `Hoàn thành lúc ${formatTimeDisplay(l.completed_at || l.last_accessed)}`
            : `Đã học ${Math.round((l.time_spent_seconds || 0) / 60)} phút`,
          time: l.completed_at || l.last_accessed,
          score: l.score,
          xpEarned: l.status === 'completed' ? 50 : 0,
          icon: getIconForType('lesson'),
          color: TYPE_CONFIG.lesson.color,
          status: l.status,
        })
      })

      ;(quizRes.data || []).forEach((q: any) => {
        const isComplete = q.status === 'submitted' || q.status === 'passed' || q.status === 'failed'
        items.push({
          id: `quiz-${q.id}-${q.created_at}`,
          type: 'quiz',
          title: q.quizzes?.title || 'Bài kiểm tra',
          description: isComplete ? `Điểm: ${q.score}/100` : 'Chưa hoàn thành',
          details: isComplete
            ? `Hoàn thành lúc ${formatTimeDisplay(q.submitted_at)}`
            : `Bắt đầu lúc ${formatTimeDisplay(q.created_at)}`,
          time: q.submitted_at || q.created_at,
          score: q.score,
          xpEarned: isComplete ? Math.round(q.score * 2) : 0,
          icon: getIconForType('quiz'),
          color: TYPE_CONFIG.quiz.color,
          status: q.status,
        })
      })

      ;(examRes.data || []).forEach((e: any) => {
        const isComplete = e.status === 'submitted' || e.status === 'passed' || e.status === 'failed'
        items.push({
          id: `exam-${e.id}-${e.started_at}`,
          type: 'exam',
          title: e.exams?.title || 'Kỳ thi',
          description: isComplete ? `Điểm: ${e.score}/100` : 'Đang làm bài',
          details: isComplete
            ? `Hoàn thành lúc ${formatTimeDisplay(e.submitted_at)}`
            : `Bắt đầu lúc ${formatTimeDisplay(e.started_at)}`,
          time: e.submitted_at || e.started_at,
          score: e.score,
          xpEarned: isComplete ? Math.round((e.score || 0) * 3) : 0,
          icon: getIconForType('exam'),
          color: TYPE_CONFIG.exam.color,
          status: e.status,
        })
      })

      ;(builderRes.data || []).forEach((b: any) => {
        const duration = b.ended_at
          ? Math.round((new Date(b.ended_at).getTime() - new Date(b.started_at).getTime()) / 60000)
          : 0
        items.push({
          id: `builder-${b.started_at}`,
          type: 'builder',
          title: 'Phòng thực hành lắp ráp',
          description: duration > 0 ? `Thời gian: ${duration} phút` : 'Đã truy cập',
          details: b.ended_at
            ? `Kết thúc lúc ${formatTimeDisplay(b.ended_at)}`
            : 'Đang thực hành',
          time: b.started_at,
          score: null,
          xpEarned: duration > 10 ? 100 : duration > 5 ? 50 : 20,
          icon: getIconForType('builder'),
          color: TYPE_CONFIG.builder.color,
        })
      })

      ;(xpRes.data || []).forEach((x: any) => {
        items.push({
          id: `xp-${x.created_at}-${x.amount}`,
          type: 'xp',
          title: x.reason || 'Nhận XP',
          description: `+${x.amount} XP`,
          details: x.reference_type
            ? `Từ: ${x.reference_type.replace(/_/g, ' ')}`
            : 'Giao dịch kinh nghiệm',
          time: x.created_at,
          score: null,
          xpEarned: x.amount,
          icon: getIconForType('xp'),
          color: TYPE_CONFIG.xp.color,
        })
      })

      items.sort((a, b) => {
        const cmp = new Date(b.time).getTime() - new Date(a.time).getTime()
        return sortAsc ? -cmp : cmp
      })

      setActivities(items.slice(0, 100))
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
  }, [sortAsc, supabase])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('student-history-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_progress', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exam_attempts', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'builder_sessions', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'xp_transactions', filter: `user_id=eq.${userId}` },
        () => fetchHistory()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase, fetchHistory])

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  const groupedByDate: { [key: string]: Activity[] } = {}
  filteredActivities.forEach(activity => {
    const dayKey = startOfDay(parseISO(activity.time)).toISOString()
    if (!groupedByDate[dayKey]) groupedByDate[dayKey] = []
    groupedByDate[dayKey].push(activity)
  })

  const today = startOfDay(new Date()).toISOString()
  const yesterday = startOfDay(new Date(Date.now() - 86400000)).toISOString()

  function getDateLabel(dateKey: string): string {
    if (dateKey === today) return 'Hôm nay'
    if (dateKey === yesterday) return 'Hôm qua'
    return format(parseISO(dateKey), 'EEEE, dd/MM/yyyy')
  }

  const FILTERS: { key: ActivityType | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Tất cả', icon: <Sparkles size={14} /> },
    { key: 'lesson', label: 'Bài học', icon: <BookOpen size={14} /> },
    { key: 'quiz', label: 'Kiểm tra', icon: <BrainCircuit size={14} /> },
    { key: 'exam', label: 'Kỳ thi', icon: <Award size={14} /> },
    { key: 'builder', label: 'Lắp ráp', icon: <Wrench size={14} /> },
    { key: 'xp', label: 'XP', icon: <Zap size={14} /> },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={32} style={{ color: 'var(--brand-primary)' }} />
        </motion.div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Đang tải lịch sử...
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full filter blur-[120px] pointer-events-none"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }} />

        <div className="max-w-3xl mx-auto px-4 pt-8 pb-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{
                background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                color: 'var(--brand-primary)'
              }}>
                <History size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Lịch Sử Hoạt Động</h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Theo dõi toàn bộ hoạt động học tập theo thời gian thực
                </p>
              </div>
            </div>
            <button onClick={() => { setSortAsc(!sortAsc); fetchHistory() }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <ArrowUpDown size={14} />
              {sortAsc ? 'Cũ nhất' : 'Mới nhất'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer"
                style={{
                  background: filter === f.key
                    ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)'
                    : 'var(--bg-surface)',
                  border: filter === f.key
                    ? '1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent)'
                    : '1px solid var(--border-default)',
                  color: filter === f.key ? 'var(--brand-primary)' : 'var(--text-muted)',
                }}>
                {f.icon}
                {f.label}
                {filter === f.key && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
                    {filteredActivities.length}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {filteredActivities.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-8 rounded-3xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Clock size={56} style={{ color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 16px' }} />
              </motion.div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Chưa có hoạt động nào
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Bắt đầu học để xem lịch sử hoạt động tại đây!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([dateKey, items], groupIdx) => (
                <motion.div key={dateKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.05 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar size={14} style={{ color: 'var(--brand-primary)' }} />
                    <h3 className="text-sm font-black uppercase tracking-wider"
                      style={{ color: 'var(--text-primary)' }}>
                      {getDateLabel(dateKey)}
                    </h3>
                    <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', color: 'var(--text-muted)' }}>
                      {items.length} hoạt động
                    </span>
                  </div>

                  <div className="relative ml-4">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5"
                      style={{ background: 'var(--border-default)' }} />

                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <motion.div key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          whileHover={{ x: 4 }}
                          className="relative pl-10"
                        >
                          <div className="absolute left-[11px] top-[18px] w-[17px] h-[17px] rounded-full border-[3px] z-10"
                            style={{
                              background: 'var(--bg-base)',
                              borderColor: item.color,
                            }}>
                            <div className="absolute inset-[3px] rounded-full"
                              style={{ background: `${item.color}30` }} />
                          </div>

                          <div className="p-3.5 rounded-xl transition-all duration-200"
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                            }}>
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: `${item.color}15`,
                                  color: item.color,
                                }}>
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                      {item.title}
                                    </p>
                                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: item.color }}>
                                      {item.description}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] font-bold whitespace-nowrap"
                                      style={{ color: 'var(--text-muted)' }}>
                                      {formatTimeAgo(item.time)}
                                    </p>
                                    {item.score != null && (
                                      <p className="text-xs font-black mt-0.5"
                                        style={{
                                          color: item.score >= 80 ? '#10B981'
                                            : item.score >= 50 ? '#F59E0B'
                                            : '#EF4444'
                                        }}>
                                        {item.score}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {item.details}
                                  </p>
                                  {item.xpEarned > 0 && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                      style={{
                                        background: 'color-mix(in srgb, #F59E0B 12%, transparent)',
                                        color: '#F59E0B',
                                        border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)',
                                      }}>
                                      <Zap size={8} />+{item.xpEarned}XP
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredActivities.length > 0 && activities.length >= 100 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
              Hiển thị 100 hoạt động gần nhất. Dữ liệu cũ hơn có thể được tải thêm.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
