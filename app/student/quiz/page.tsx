'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { HelpCircle, Zap, Star, Loader2, Search, Award, Flame, Play, ArrowLeft, BrainCircuit, RotateCcw, FileText, Clock, Users, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QUIZ_BANK } from '@/data/quiz-bank'

export default function StudentQuizPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ accuracy: '--', streak: '0', totalDone: 0 })
  const [unlockedCount, setUnlockedCount] = useState(3)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchExamsAndStats()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase
        .channel('quiz-list-realtime')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'quiz_attempts', filter: `student_id=eq.${user.id}` },
          () => fetchExamsAndStats()
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    })
  }, [])

  async function fetchExamsAndStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: classes } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id)

      const classIds = classes?.map(c => c.class_id) || []
      if (classIds.length === 0) { setExams([]); setLoading(false); return }

      const { data: quizzes } = await supabase
        .from('quizzes')
        .select(`
          id, title, description, time_limit_minutes, difficulty, passing_score,
          available_from, available_until, is_published, created_at,
          class_id, teacher_id,
          quiz_questions!left (question_id),
          quiz_attempts!left (id, score, status, student_id)
        `)
        .in('class_id', classIds)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (quizzes) {
        const processed = quizzes.map((q: any) => ({
          ...q,
          totalQuestions: q.quiz_questions?.length || 0,
          studentAttempts: q.quiz_attempts?.filter((a: any) => a.student_id === user.id) || [],
          bestScore: Math.max(0, ...(q.quiz_attempts?.filter((a: any) => a.student_id === user.id && a.status !== 'in_progress').map((a: any) => a.score || 0) || [0])),
          hasDone: (q.quiz_attempts?.filter((a: any) => a.student_id === user.id && a.status !== 'in_progress').length || 0) > 0,
          myAttempts: q.quiz_attempts?.filter((a: any) => a.student_id === user.id).length || 0
        }))
        setExams(processed)
      }

      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id, score, status, created_at')
        .eq('student_id', user.id)
        .not('status', 'eq', 'in_progress')

      if (attempts && attempts.length > 0) {
        const totalScore = attempts.reduce((s, a) => s + (a.score || 0), 0)
        const avg = totalScore / attempts.length
        setStats(s => ({ ...s, accuracy: `${Math.round(avg)}%`, totalDone: attempts.length }))

        let streakCount = 0
        const today = new Date()
        const dates = [...new Set(attempts.map(a => a.created_at?.split('T')[0]))].sort().reverse()
        for (const d of dates) {
          const diff = Math.floor((today.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
          if (diff === streakCount) { streakCount++; continue }
          break
        }
        setStats(s => ({ ...s, streak: `${streakCount} ngày` }))
      }

      if (user.created_at) {
        const diff = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
        setUnlockedCount(Math.min(3 + diff, 50))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const hasAccess = (exam: any) => {
    if (!exam.available_from) return true
    return new Date() >= new Date(exam.available_from)
  }

  const filtered = exams.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()))
  const upcomingExams = filtered.filter(e => e.available_from && !hasAccess(e))
  const activeExams = filtered.filter(e => hasAccess(e))

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)', color: 'var(--brand-primary)' }}>
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Đề thi<span style={{ color: 'var(--brand-primary)' }}> & Kiểm tra</span>
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{activeExams.length} đề thi đang mở · {stats.totalDone} bài đã làm</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Tìm kiếm đề thi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none pl-11 pr-4 py-2.5 rounded-2xl text-xs transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={() => router.push('/student')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Quay lại
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, var(--bg-surface))', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)', color: 'var(--brand-primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Đã hoàn thành</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stats.totalDone} bài</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', color: 'var(--accent-amber)' }}>
              <Star size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Điểm TB</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stats.accuracy}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', color: 'var(--accent-orange)' }}>
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Học tập chuyên cần</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stats.streak}</h3>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--brand-primary)' }} />
            <span className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Đang tải đề thi...</span>
          </div>
        ) : activeExams.length === 0 && upcomingExams.length === 0 ? (
          <div className="text-center py-20 rounded-[40px] border-2 border-dashed" style={{ borderColor: 'var(--border-default)' }}>
            <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Giáo viên chưa giao đề thi nào</p>
          </div>
        ) : (
          <>
          {upcomingExams.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Sắp mở ({upcomingExams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingExams.slice(0, 6).map((exam, i) => {
                  const msLeft = new Date(exam.available_from).getTime() - Date.now()
                  const daysLeft = Math.ceil(msLeft / (1000*60*60*24))
                  return (
                    <div key={exam.id} className="border rounded-2xl p-4 opacity-60" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{exam.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        🔓 Mở sau {daysLeft > 0 ? `${daysLeft} ngày` : 'hôm nay'} · {new Date(exam.available_from).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeExams.map((exam, i) => {
              const startUrl = `/student/quiz/${exam.id}`
              return (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border rounded-3xl p-6 transition-all hover:shadow-[0_0_30px_var(--brand-subtle)] flex flex-col justify-between group"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                        <Users size={12} /> Trong lớp
                      </span>
                      {exam.hasDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                          {exam.bestScore?.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--brand-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{exam.description}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      <span><FileText size={12} /> {exam.totalQuestions || 0} câu</span>
                      <span><Clock size={12} /> {exam.time_limit_minutes || 45} phút</span>
                      <span style={{ color: exam.hasDone ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                        {exam.myAttempts > 0 ? `${exam.myAttempts} lần` : 'Chưa làm'}
                      </span>
                    </div>
                    <Link href={startUrl}
                      className="w-full py-3 border font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                      style={{ background: exam.hasDone ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'var(--bg-base)', borderColor: exam.hasDone ? 'color-mix(in srgb, var(--brand-primary) 30%, transparent)' : 'var(--border-default)', color: exam.hasDone ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      {exam.hasDone ? 'Làm lại' : 'BẮT ĐẦU LÀM BÀI'} <Play size={14} fill="currentColor" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
