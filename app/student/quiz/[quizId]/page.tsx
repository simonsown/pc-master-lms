'use client'

import React, { useState, useEffect, useRef, use, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, RefreshCw, AlertTriangle, BookOpen, X, Search } from 'lucide-react'
import { startQuizAttempt, submitQuizAttempt } from '@/app/actions/quiz'
import { GLOSSARY, findTerms } from '@/data/glossary'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function TermHighlight({ text, onTermClick }: { text: string; onTermClick: (term: string) => void }) {
  const parts = useMemo(() => {
    const sorted = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
    const nodes: React.ReactNode[] = [text]
    for (const term of sorted) {
      const len = nodes.length
      for (let i = 0; i < len; i++) {
        const node = nodes[i]
        if (typeof node !== 'string') continue
        const lower = node.toLowerCase()
        const idx = lower.indexOf(term.toLowerCase())
        if (idx === -1) continue
        const before = node.slice(0, idx)
        const match = node.slice(idx, idx + term.length)
        const after = node.slice(idx + term.length)
        const replacement: React.ReactNode[] = []
        if (before) replacement.push(before)
        replacement.push(
          <span key={`${term}-${i}`} onClick={(e) => { e.stopPropagation(); onTermClick(term) }}
            className="term-link" style={{ color: 'var(--brand-primary)', borderBottom: '1px dashed var(--brand-primary)', cursor: 'pointer', fontWeight: 600 }}>
            {match}
          </span>
        )
        if (after) replacement.push(after)
        nodes.splice(i, 1, ...replacement)
        break
      }
    }
    return nodes
  }, [text, onTermClick])
  return <>{parts}</>
}

export default function QuizTakingPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params)
  const router = useRouter()

  const [examData, setExamData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(45 * 60)
  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [showGlossary, setShowGlossary] = useState(false)
  const [glossarySearch, setGlossarySearch] = useState('')
  const [error, setError] = useState('')

  const scoreRef = useRef(0)
  const supabaseRef = useRef(createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!))
  const finishedRef = useRef(false)
  const questionsRef = useRef<any[]>([])
  const answersRef = useRef<any[]>([])

  useEffect(() => {
    initQuiz()
    async function initQuiz() {
      try {
        const res = await startQuizAttempt(quizId)
        setAttemptId(res.attemptId)
        setExamData({ timeLimit: res.timeLimit })

        const qs = res.questions.map((q: any) => ({
          id: q.id,
          question: q.content,
          type: q.type,
          points: q.points,
          options: shuffleArray((q.options || []).map((o: any) => ({ id: o.id, content: o.content }))),
          correctOptionId: null
        }))

        questionsRef.current = qs
        setQuestions(qs)
        setSecondsLeft((res.timeLimit || 45) * 60)
        setLoaded(true)

        const channel = supabaseRef.current
          .channel(`quiz-live-${res.attemptId}`)
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'quiz_attempts', filter: `id=eq.${res.attemptId}` },
            (payload: any) => {
              if (payload.new?.status !== 'in_progress') {
                finishedRef.current = true
                setIsFinished(true)
                setScore(payload.new?.score || 0)
              }
            }
          )
          .subscribe()
      } catch (e: any) {
        setError(e.message || 'Không thể tải đề thi')
        console.error(e)
      }
    }
  }, [quizId])

  useEffect(() => {
    if (isFinished || !loaded || !examData?.timeLimit) return
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(interval); finishQuiz(scoreRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isFinished, loaded, examData?.timeLimit])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const el = document.getElementById('term-tooltip')
      if (el && !el.contains(e.target as Node)) setActiveTerm(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTermClick = useCallback((term: string) => {
    setActiveTerm(prev => prev === term ? null : term)
  }, [])

  const currentQ = questions[currentQIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
    setActiveTerm(null)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQ) return
    setIsAnswered(true)
    answersRef.current[currentQIndex] = { questionId: currentQ.id, selectedOptionIds: [currentQ.options[selectedOption]?.id], timeSpentSeconds: 0 }
    const correctOpt = currentQ.options.find((o: any) => o.isCorrect)
    if (correctOpt && currentQ.options[selectedOption]?.id === correctOpt.id) {
      scoreRef.current += (currentQ.points || 10)
      setScore(scoreRef.current)
    }
  }

  const handleNextQuestion = () => {
    if (!currentQ) return
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setActiveTerm(null)
    } else {
      finishQuiz(scoreRef.current)
    }
  }

  async function finishQuiz(finalScore: number) {
    if (finishedRef.current) return
    finishedRef.current = true
    setIsFinished(true)
    setScore(finalScore)
    setSubmitting(true)
    try {
      if (attemptId) {
        await submitQuizAttempt(attemptId, answersRef.current)
      }
    } catch (e) { console.error('Lỗi nộp bài:', e) }
    finally { setSubmitting(false) }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const filteredGlossary = Object.entries(GLOSSARY).filter(([term]) => term.toLowerCase().includes(glossarySearch.toLowerCase()))

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <AlertTriangle size={48} className="mb-4" style={{ color: 'var(--brand-primary)' }} />
        <h2 className="text-2xl font-bold mb-2">Không thể vào thi</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button onClick={() => router.push('/student/quiz')} className="px-6 py-3 border rounded-xl font-bold" style={{ background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: 'white' }}>
          Quay lại
        </button>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-4">Đề thi chưa có câu hỏi</h2>
        <button onClick={() => router.push('/student/quiz')} className="px-6 py-3 border rounded-xl font-bold" style={{ background: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', color: 'white' }}>
          Quay lại
        </button>
      </div>
    )
  }

  if (isFinished) {
    const maxScore = questions.reduce((s, q) => s + (q.points || 10), 0)
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        {submitting ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
            <h2 className="text-xl font-bold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>Đang nộp bài...</h2>
          </div>
        ) : (
          <div className="border p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <Trophy size={64} className={`mx-auto mb-6 ${score >= 70 ? 'text-yellow-400' : ''}`} style={score < 70 ? { color: 'var(--text-muted)' } : {}} />
            <h2 className="text-3xl font-black mb-2 uppercase">Kết quả làm bài</h2>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-blue-400 mb-8 drop-shadow-[0_0_15px_rgba(0,212,170,0.4)]">
              {score}/{maxScore}
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => router.push(`/student/quiz/${quizId}/results?attemptId=${attemptId}`)}
                className="px-6 py-3 rounded-xl font-black transition-all" style={{ background: 'var(--brand-primary)', color: 'black' }}>
                Xem Chi Tiết
              </button>
              <button onClick={() => router.push('/student/quiz')}
                className="px-6 py-3 border rounded-xl font-bold transition-all" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                Quay Lại
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <header className="border-b p-4 sm:px-8 flex justify-between items-center backdrop-blur-md relative z-50 sticky top-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/student/quiz')}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold transition-all shadow-md cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
            <ArrowLeft size={14} /> Thoát
          </button>
          <h2 className="font-black text-sm md:text-base hidden sm:block" style={{ color: 'var(--text-primary)' }}>Đề thi</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGlossary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)', color: 'var(--brand-primary)' }}>
            <BookOpen size={14} /> Tra cứu
          </button>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-xl border ${secondsLeft < 60 ? 'border-red-500/50 animate-pulse' : ''}`}
            style={secondsLeft < 60 ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444' } : { background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)' }}>
            <Clock size={18} /> {formatTime(secondsLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 relative z-10 flex flex-col justify-center">
        <div className="mb-8 p-6 border rounded-2xl shadow-xl backdrop-blur-sm relative" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}>
              Câu hỏi {currentQIndex + 1} / {questions.length}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Điểm: {score}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
            <TermHighlight text={currentQ?.question || ''} onTermClick={handleTermClick} />
          </h3>
        </div>

        <div className="space-y-3">
          {currentQ?.options.map((opt: any, i: number) => {
            const isSelected = selectedOption === i
            let stateStyle: React.CSSProperties = {}

            if (isAnswered) {
              const isCorrect = currentQ.correctOptionId === opt.id
              if (isCorrect) {
                stateStyle = { background: 'rgba(16,185,129,0.1)', borderColor: '#10b981', color: '#10b981' }
              } else if (isSelected) {
                stateStyle = { background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', color: '#ef4444' }
              } else {
                stateStyle = { background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }
              }
            } else if (isSelected) {
              stateStyle = { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: 'white' }
            } else {
              stateStyle = { background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }
            }

            return (
              <label key={i} onClick={() => handleSelectOption(i)}
                className="flex items-center gap-4 p-5 sm:p-6 border-2 rounded-2xl transition-all cursor-pointer" style={stateStyle}>
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={isAnswered && currentQ.correctOptionId === opt.id ? { borderColor: '#10b981' } : isSelected ? { borderColor: 'transparent' } : { borderColor: 'var(--border-default)' }}>
                  {isAnswered && currentQ.correctOptionId === opt.id ? <CheckCircle size={24} className="text-green-500 bg-black rounded-full" /> :
                  isAnswered && isSelected ? <XCircle size={24} className="text-red-500 bg-black rounded-full" /> :
                  isSelected ? <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}><div className="w-2.5 h-2.5 bg-black rounded-full" /></div> : null}
                </div>
                <span className="text-lg font-medium"><TermHighlight text={opt.content} onTermClick={handleTermClick} /></span>
              </label>
            )
          })}
        </div>
      </main>

      <footer className="border-t p-4 sm:p-6 flex justify-end items-center relative z-50 backdrop-blur-xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        {!isAnswered ? (
          <button onClick={handleCheckAnswer} disabled={selectedOption === null}
            className="px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
            style={selectedOption !== null ? { background: '#2563eb', color: 'white' } : { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
            Kiểm tra đáp án
          </button>
        ) : (
          <button onClick={handleNextQuestion}
            className="px-8 py-3 text-black rounded-xl font-black transition-all flex items-center gap-2 hover:opacity-80" style={{ background: 'var(--brand-primary)' }}>
            {currentQIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành Bài Thi'}
          </button>
        )}
      </footer>

      {showGlossary && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-2xl max-h-[80vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-3"><BookOpen size={20} style={{ color: 'var(--brand-primary)' }} /><h2 className="text-xl font-black uppercase">Tra Cứu Thuật Ngữ</h2></div>
              <button onClick={() => setShowGlossary(false)} className="p-2 rounded-xl hover:bg-white/5" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Tìm thuật ngữ..." value={glossarySearch} onChange={e => setGlossarySearch(e.target.value)}
                  className="w-full outline-none pl-11 pr-4 py-3 rounded-2xl text-sm transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredGlossary.map(([term, def]) => (
                <div key={term} className="p-4 rounded-2xl border" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--brand-primary)' }}>{term}</span>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{def}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
