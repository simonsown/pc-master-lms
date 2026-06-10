'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { HelpCircle, Zap, Star, Loader2, Search, Award, Flame, Play, ArrowLeft, BrainCircuit, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QUIZ_BANK } from '@/data/quiz-bank'

function Flashcards() {
  const [cards] = useState(() => {
    const all = QUIZ_BANK.slice(0, 15).map(q => ({
      front: q.title,
      back: `${Math.min(q.questions.length, 10)} câu hỏi về ${q.lessonTitle} - ${q.difficulty}`
    }))
    return all
  })
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <BrainCircuit size={20} style={{ color: 'var(--brand-primary)' }} />
        Flashcard Thuật Ngữ ({current + 1}/{cards.length})
      </h2>
      <div className="relative" style={{ perspective: '1000px', height: '180px' }}>
        <motion.div
          key={current}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="w-full h-full cursor-pointer"
          onClick={() => setFlipped(!flipped)}
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          <div className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', backfaceVisibility: 'hidden' }}>
            <span className="text-lg font-bold text-center" style={{ color: 'var(--text-primary)' }}>{cards[current].front}</span>
            <span className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Chạm để xem chi tiết</span>
          </div>
          <div className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, var(--bg-surface))', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-sm text-center" style={{ color: 'var(--text-primary)' }}>{cards[current].back}</span>
          </div>
        </motion.div>
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={() => { setFlipped(false); setCurrent(c => Math.max(0, c - 1)) }} disabled={current === 0}
          className="px-4 py-2 rounded-xl text-xs disabled:opacity-30 transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          ← Trước
        </button>
        <button onClick={() => { setFlipped(false); setCurrent(c => (c + 1) % cards.length) }}
          className="px-4 py-2 rounded-xl text-xs transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          Sau →
        </button>
        <button onClick={() => { setFlipped(false); setCurrent(Math.floor(Math.random() * cards.length)) }}
          className="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)', color: 'var(--brand-primary)' }}>
          <RotateCcw size={12} /> Ngẫu nhiên
        </button>
      </div>
    </div>
  )
}

export default function StudentQuizPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [motivation, setMotivation] = useState('Đang tải...')
  const [accuracy, setAccuracy] = useState('Đang tải...')
  const [streak, setStreak] = useState('Đang tải...')
  const [xpBoost, setXpBoost] = useState(false)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [daysSinceRegister, setDaysSinceRegister] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const channelRef = useRef<any>(null)

  useEffect(() => {
    setQuizzes(QUIZ_BANK.map(q => ({
      id: q.id,
      title: q.title,
      lessons: { title: q.lessonTitle },
      estimated_minutes: q.estimated_minutes,
      difficulty: q.difficulty,
      xp: q.xp,
      totalQuestions: Math.min(q.questions.length, 10)
    })))
    fetchRealTimeStats()
    setLoading(false)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        channelRef.current = supabase
          .channel('quiz-page-realtime')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'quiz_attempts', filter: `student_id=eq.${user.id}` },
            () => fetchRealTimeStats()
          )
          .subscribe()
      }
    })

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  async function fetchRealTimeStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAccuracy('Đăng nhập để xem')
        setMotivation('Đăng nhập để làm quiz!')
        setStreak('0 Ngày')
        setUnlockedCount(3)
        setDaysSinceRegister(0)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_score, created_at')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.created_at) {
        const created = new Date(profile.created_at)
        const now = new Date()
        const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        setDaysSinceRegister(diff)
        setUnlockedCount(Math.min(3 + diff, QUIZ_BANK.length))
      } else {
        setUnlockedCount(3)
      }

      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score, total_questions, created_at, student_id')
        .eq('student_id', user.id)

      if (attempts && attempts.length > 0) {
        const totalScore = attempts.reduce((s, a) => s + (a.score || 0), 0)
        const totalQ = attempts.reduce((s, a) => s + (a.total_questions || 0), 0)
        const avg = totalQ > 0 ? Math.round(totalScore / (totalQ * 10) * 100) : 0
        setAccuracy(`${avg}%`)

        const today = new Date().toISOString().split('T')[0]
        const todayAttempts = attempts.filter(a =>
          a.created_at && a.created_at.startsWith(today)
        )
        const hasDoneToday = todayAttempts.length > 0
        setXpBoost(!hasDoneToday)
        setMotivation(!hasDoneToday ? 'X2 điểm XP hôm nay' : 'Đã nhận thưởng hôm nay')
      } else {
        setAccuracy('0%')
        setMotivation('Làm quiz ngay để nhận XP!')
      }

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false })

      if (progress && progress.length > 0) {
        let streakCount = 0
        const today = new Date()
        for (let i = 0; i < progress.length; i++) {
          const d = new Date(progress[i].completed_at)
          const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
          if (diff === streakCount || diff === 0) {
            streakCount++
            today.setDate(today.getDate() - 1)
          } else break
        }
        setStreak(`${streakCount} Ngày`)
      } else {
        setStreak('0 Ngày')
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setAccuracy('0%')
      setMotivation('Làm quiz ngay!')
      setStreak('0 Ngày')
      setUnlockedCount(3)
    }
  }

  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.lessons?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[100px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />

      <div className="max-w-6xl mx-auto relative z-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)', color: 'var(--brand-primary)' }}>
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Ngân Hàng <span style={{ color: 'var(--brand-primary)' }}>Đề Thi & Quiz</span>
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{unlockedCount}/{QUIZ_BANK.length} bài đã mở khóa · Mỗi ngày mở thêm 1 bài</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm bài trắc nghiệm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none pl-11 pr-4 py-2.5 rounded-2xl text-xs transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              onClick={() => router.push('/builder')}
              className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md group cursor-pointer" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại
            </button>
          </div>
        </div>

        <div className="relative w-full sm:hidden mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm bài trắc nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none pl-11 pr-4 py-2 rounded-2xl text-xs transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, var(--bg-surface))', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)', color: 'var(--brand-primary)' }}>
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Động lực học tập</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{motivation}</h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', color: 'var(--accent-amber)' }}>
              <Star size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Độ chính xác trung bình</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{accuracy}</h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-6 rounded-3xl flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', color: 'var(--accent-orange)' }}>
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Học tập chuyên cần</p>
              <h3 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{streak}</h3>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--brand-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang đồng bộ ngân hàng đề thi...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => {
                const realIndex = QUIZ_BANK.findIndex(q => q.id === quiz.id)
                const isUnlocked = realIndex < unlockedCount
                const daysUntilUnlock = realIndex - unlockedCount + 1
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border rounded-3xl p-6 transition-all flex flex-col justify-between group ${isUnlocked ? 'hover:shadow-[0_0_30px_var(--brand-subtle)]' : 'opacity-50'}`}
                    style={{ background: 'var(--bg-surface)', borderColor: isUnlocked ? 'var(--border-default)' : 'color-mix(in srgb, var(--border-default) 50%, transparent)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                          {quiz.lessons?.title || 'Chương Trình PC'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          !isUnlocked ? '' :
                          quiz.difficulty === 'Dễ' ? 'bg-green-500/10 text-green-400' :
                          quiz.difficulty === 'Khó' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`} style={!isUnlocked ? { background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)', color: 'var(--text-muted)' } : {}}>
                          {isUnlocked ? (quiz.difficulty || 'Trung bình') : '🔒 Khóa'}
                        </span>
                      </div>

                      <h3 className={`text-lg font-bold mb-4 line-clamp-2 ${isUnlocked ? 'group-hover:text-[var(--brand-primary)] transition-colors' : ''}`} style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {quiz.title}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        <span>📝 {quiz.totalQuestions || 10} câu hỏi</span>
                        <span>⏱️ {quiz.estimated_minutes || 15} phút</span>
                        <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>⚡ +{quiz.xp || 100} XP</span>
                      </div>

                      {isUnlocked ? (
                          <Link
                            href={`/student/quiz/${quiz.id}`}
                            className="w-full py-3 border font-bold rounded-2xl flex items-center justify-center gap-2 transition-all" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)' }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                          >
                          BẮT ĐẦU LÀM BÀI <Play size={14} fill="currentColor" />
                        </Link>
                      ) : (
                        <div className="w-full py-3 border font-bold rounded-2xl flex items-center justify-center gap-2 text-sm" style={{ background: 'color-mix(in srgb, var(--bg-base) 50%, transparent)', color: 'var(--text-muted)', borderColor: 'color-mix(in srgb, var(--border-default) 50%, transparent)' }}>
                          🔒 Mở khóa sau {daysUntilUnlock} ngày
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Flashcards />
          </>
        )}
      </div>
    </div>
  )
}
