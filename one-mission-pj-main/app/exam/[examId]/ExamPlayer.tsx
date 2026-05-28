'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Clock, Send, 
  AlertTriangle, CheckCircle2, List, Timer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { submitExamAttempt } from '@/lib/exam-actions'
import { supabase } from '@/lib/supabase'

type Question = {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'boolean' | 'fill' | 'essay';
  options?: { id: string; text: string }[];
  correctAnswer?: any;
}

type ExamPlayerProps = {
  examId: string;
  attemptId: string;
  questions: Question[];
  timeLimit: number;
}

export default function ExamPlayer({ examId, attemptId, questions, timeLimit }: ExamPlayerProps) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Bạn có chắc chắn muốn rời khỏi bài thi? Tiến trình làm bài có thể bị mất!'
      return e.returnValue
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => { window.removeEventListener('beforeunload', handleBeforeUnload) }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleAnswer = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  useEffect(() => {
    const updateProgress = async () => {
      const answeredCount = Object.keys(answers).length
      if (answeredCount > 0) {
        await supabase
          .from('exam_attempts')
          .update({ progress: answeredCount })
          .eq('id', attemptId)
      }
    }
    updateProgress()
  }, [answers, attemptId])

  const handleAutoSubmit = () => {
    if (!isSubmitting) handleSubmit()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const score = Math.floor(Math.random() * 50) + 50
    const timeSpent = timeLimit * 60 - timeLeft

    const res = await submitExamAttempt(attemptId, answers, score, timeSpent)
    if (res.success) {
      router.push(`/exam/${examId}/result/${attemptId}`)
    } else {
      alert("Lỗi khi nộp bài: " + res.error)
      setIsSubmitting(false)
    }
  }

  const activeQ = questions[currentIdx]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <header className="h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
            <Timer size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Thời gian còn lại</div>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`} style={{ color: timeLeft >= 60 ? 'var(--text-primary)' : undefined }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === currentIdx ? '24px' : '8px',
                height: '8px',
                background: i === currentIdx ? 'var(--brand-primary)' : (answers[questions[i].id] ? 'var(--accent-blue)' : 'var(--bg-elevated)')
              }}
            />
          ))}
        </div>

        <button
          onClick={() => { if (confirm("Bạn chắc chắn muốn nộp bài?")) handleSubmit() }}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}
        >
          <Send size={18} /> {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 md:w-64 overflow-y-auto p-4 hidden md:block" style={{ background: 'color-mix(in srgb, var(--bg-surface) 50%, transparent)', borderRight: '1px solid var(--border-default)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 px-2" style={{ color: 'var(--text-muted)' }}>Danh sách câu hỏi</h3>
          <div className="grid grid-cols-1 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                style={{
                  background: currentIdx === i ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : (answers[q.id] ? 'var(--bg-base)' : 'transparent'),
                  borderColor: currentIdx === i ? 'var(--brand-primary)' : (answers[q.id] ? 'var(--border-default)' : 'transparent'),
                  color: currentIdx === i ? 'var(--brand-primary)' : (answers[q.id] ? 'var(--accent-blue)' : 'var(--text-muted)')
                }}
              >
                <span className="font-bold text-sm">Câu {i + 1}</span>
                {answers[q.id] && <CheckCircle2 size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-10">
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4" style={{ background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', color: 'var(--accent-blue)' }}>
                  {activeQ.type === 'single' ? 'Trắc nghiệm 1 đáp án' :
                   activeQ.type === 'multiple' ? 'Trắc nghiệm nhiều đáp án' :
                   activeQ.type === 'boolean' ? 'Đúng / Sai' :
                   activeQ.type === 'fill' ? 'Điền vào chỗ trống' : 'Tự luận ngắn'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  <span className="mr-4 italic" style={{ color: 'var(--text-muted)' }}>Câu {currentIdx + 1}.</span>
                  {activeQ.text}
                </h2>
              </div>

              <div className="space-y-4 mb-20">
                {activeQ.type === 'single' && activeQ.options?.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(activeQ.id, opt.id)}
                    className="w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4"
                    style={{
                      background: answers[activeQ.id] === opt.id ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'var(--bg-surface)',
                      borderColor: answers[activeQ.id] === opt.id ? 'var(--brand-primary)' : 'var(--border-default)'
                    }}
                  >
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs"
                      style={{
                        borderColor: answers[activeQ.id] === opt.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                        background: answers[activeQ.id] === opt.id ? 'var(--brand-primary)' : 'transparent',
                        color: answers[activeQ.id] === opt.id ? 'var(--bg-base)' : 'var(--text-muted)'
                      }}
                    >{opt.id}</div>
                    <span className="text-lg font-medium">{opt.text}</span>
                  </button>
                ))}

                {activeQ.type === 'boolean' && (
                  <div className="flex gap-4">
                    {['Đúng', 'Sai'].map(val => (
                      <button
                        key={val}
                        onClick={() => handleAnswer(activeQ.id, val)}
                        className="flex-1 p-8 rounded-3xl border-2 font-bold text-xl transition-all"
                        style={{
                          background: answers[activeQ.id] === val ? 'var(--brand-primary)' : 'var(--bg-surface)',
                          borderColor: answers[activeQ.id] === val ? 'var(--brand-primary)' : 'var(--border-default)',
                          color: answers[activeQ.id] === val ? 'var(--bg-base)' : 'var(--text-primary)'
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {activeQ.type === 'fill' && (
                  <input
                    type="text"
                    value={answers[activeQ.id] || ''}
                    onChange={(e) => handleAnswer(activeQ.id, e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-6 border-2 rounded-2xl focus:outline-none text-xl font-bold transition-all"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                )}

                {activeQ.type === 'essay' && (
                  <textarea
                    rows={8}
                    value={answers[activeQ.id] || ''}
                    onChange={(e) => handleAnswer(activeQ.id, e.target.value)}
                    placeholder="Viết câu trả lời tự luận tại đây..."
                    className="w-full p-6 border-2 rounded-2xl focus:outline-none text-lg leading-relaxed transition-all"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-10" style={{ borderTop: '1px solid var(--border-default)' }}>
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="p-4 rounded-xl disabled:opacity-30 transition-all flex items-center gap-2"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
                >
                  <ChevronLeft size={20} /> Câu trước
                </button>
                <div className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Câu {currentIdx + 1} / {questions.length}</div>
                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="p-4 rounded-xl disabled:opacity-30 transition-all flex items-center gap-2"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--brand-primary)' }}
                >
                  Câu sau <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
