'use client'

import { useState, useEffect, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, Trophy, Loader2, ArrowLeft,
  Sparkles, Share2, Home
} from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']
const DAILY_TOPIC_IDS = new Set([
  'cpu-arch', 'ram-storage', 'gpu-graphics', 'motherboard',
  'psu-cooling', 'storage-devices', 'pc-assembly', 'bios-uefi',
  'network', 'peripherals', 'os-windows', 'troubleshooting',
  'laptop-mobile', 'monitor-display', 'ai-tech', 'overclocking',
  'benchmark', 'pc-gaming', 'server-workstation', 'cable-connectivity',
  'virtual-reality', 'cybersecurity',
])

interface Question {
  id: string
  text: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function DailyQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [questions, setQuestions] = useState<Question[]>([])
  const [topicTitle, setTopicTitle] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; xpEarned: number } | null>(null)
  const [answers, setAnswers] = useState<Record<string, { selected: number; correct: number }>>({})

  const isDailyTopic = DAILY_TOPIC_IDS.has(quizId)

  useEffect(() => {
    if (isDailyTopic) {
      initDailyQuiz()
    } else {
      initLegacyQuiz()
    }
  }, [])

  async function initDailyQuiz() {
    try {
      setLoading(true)
      const res = await fetch(`/api/daily-quiz?topicId=${quizId}`)
      if (!res.ok) throw new Error('Không tìm thấy chủ đề')
      const data = await res.json()

      if (data.completed) {
        setFinished(true)
        setResult({ score: 0, total: 0, xpEarned: 0 })
        setLoading(false)
        return
      }

      setQuestions(data.questions)
      setTopicTitle(data.topic?.title || quizId)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
      setLoading(false)
    }
  }

  async function initLegacyQuiz() {
    try {
      setLoading(true)
      const { data: quizData, error: qErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      if (qErr || !quizData) { setError('Không tìm thấy bài kiểm tra.'); return }

      setTopicTitle(quizData.title || '')

      const { data: qs, error: qsErr } = await supabase
        .from('quiz_questions_for_student')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order', { ascending: true })
      if (qsErr) { setError('Lỗi tải câu hỏi.'); return }
      if (!qs || qs.length === 0) { setError('Bài kiểm tra chưa có câu hỏi.'); return }

      const mapped = qs.map((q: any) => ({
        id: q.id,
        text: q.content || q.question || '',
        question: q.content || q.question || '',
        options: (q.options || []).map((o: any) => o.content || o.text || o),
        correct: 0,
        explanation: q.explanation || '',
      }))
      setQuestions(mapped)
      setLoading(false)
    } catch {
      setError('Có lỗi xảy ra.')
      setLoading(false)
    }
  }

  function handleSelect(idx: number) {
    if (confirmed) return
    setSelectedIdx(idx)
  }

  function handleConfirm() {
    if (selectedIdx === null) return
    setConfirmed(true)
    const q = questions[currentIdx]
    setAnswers(prev => ({
      ...prev,
      [q.id]: { selected: selectedIdx, correct: q.correct },
    }))
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedIdx(null)
      setConfirmed(false)
    }
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setFinished(true)

    if (!isDailyTopic) {
      setResult({ score: 0, total: questions.length, xpEarned: 0 })
      setSubmitting(false)
      return
    }

    let correctCount = 0
    for (const q of questions) {
      const ans = answers[q.id]
      if (ans && ans.selected === q.correct) correctCount++
    }
    const xpEarned = correctCount * 5

    try {
      const res = await fetch('/api/daily-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: quizId,
          score: correctCount,
          total: questions.length,
          xpEarned,
        }),
      })
      const json = await res.json()
      setResult({
        score: correctCount,
        total: questions.length,
        xpEarned: json.xpAwarded || xpEarned,
      })
    } catch {
      setResult({ score: correctCount, total: questions.length, xpEarned })
    }

    setSubmitting(false)
  }

  async function handleShare() {
    if (!result) return
    const shareData = {
      title: 'PC Master - Thử thách hằng ngày',
      text: `Mình vừa đạt ${result.score}/${result.total} trong thử thách hằng ngày "${topicTitle}"! 🎯 Kiếm được ${result.xpEarned} XP trên PC Master.`,
      url: window.location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.text)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--brand-primary)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Đang tải câu hỏi...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ borderRadius: '24px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '32px', maxWidth: '448px', width: '100%', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => router.push(isDailyTopic ? '/daily-quiz' : '/')} style={{ padding: '12px 24px', background: 'var(--border-strong)', borderRadius: '9999px', border: 'none', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
          Quay lại
        </button>
      </div>
    </div>
  )

  if (finished && result && result.score === 0 && result.total === 0) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ borderRadius: '24px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '40px', maxWidth: '448px', width: '100%', textAlign: 'center' }}
      >
        <CheckCircle style={{ margin: '0 auto 16px', color: 'var(--brand-primary)' }} size={80} />
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Bạn đã hoàn thành thử thách hôm nay rồi!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Hãy quay lại vào ngày mai để nhận thử thách mới.</p>
        <button onClick={() => router.push('/daily-quiz')} style={{ padding: '16px 32px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '9999px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          Về danh sách
        </button>
      </motion.div>
    </div>
  )

  if (finished && result) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ borderRadius: '24px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '40px', maxWidth: '448px', width: '100%', textAlign: 'center' }}
      >
        <Trophy style={{ margin: '0 auto 16px', color: 'var(--accent-amber)' }} size={72} />
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Hoàn thành!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{topicTitle}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '16px 0' }}>
          <span style={{ fontSize: '48px', fontWeight: 900, color: 'var(--brand-primary)' }}>{result.score}</span>
          <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>/ {result.total}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-amber) 30%, transparent)', borderRadius: '9999px', color: 'var(--accent-amber)', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
          <Sparkles size={16} />
          +{result.xpEarned} XP
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleShare}
            style={{ width: '100%', padding: '16px 32px', border: '1px solid var(--border-strong)', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '16px' }}
          >
            <Share2 size={18} />
            Chia sẻ kết quả
          </button>
          <button
            onClick={() => router.push('/daily-quiz')}
            style={{ width: '100%', padding: '16px 32px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            <Home size={18} />
            Về danh sách
          </button>
        </div>
      </motion.div>
    </div>
  )

  if (questions.length === 0) return null

  const q = questions[currentIdx]
  const currentAnswer = answers[q.id]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '16px' }} className="md:p-8">
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/daily-quiz')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{currentIdx + 1}/{questions.length}</span>
              <span style={{ fontSize: '12px', padding: '4px 10px', background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)', borderRadius: '9999px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {Object.keys(answers).length}/{questions.length} đã trả lời
              </span>
            </div>
            {isDailyTopic && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
                <Sparkles size={14} />
                <span>5 XP / câu</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', height: '8px', background: 'var(--border-strong)', borderRadius: '9999px', marginBottom: '32px', overflow: 'hidden' }}>
          <div
            style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: '9999px', transition: 'width 0.5s', width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            style={{ borderRadius: '24px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '32px', marginBottom: '24px' }}
          >
            <div style={{ fontSize: '12px', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>
              Câu hỏi {currentIdx + 1}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.625 }} className="md:text-2xl">{q.text || q.question}</h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {q.options.map((opt: string, i: number) => {
              const isSelected = selectedIdx === i
              const isCorrectOption = confirmed && i === q.correct
              const isWrongOption = confirmed && isSelected && i !== q.correct

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={confirmed}
                  style={{
                    width: '100%', textAlign: 'left', padding: '20px', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', gap: '16px', cursor: confirmed ? 'default' : 'pointer',
                    border: '1px solid',
                    borderColor: isCorrectOption
                      ? 'var(--brand-primary)'
                      : isWrongOption
                        ? '#ef4444'
                        : isSelected
                          ? 'var(--accent-blue)'
                          : 'var(--border-strong)',
                    background: isCorrectOption
                      ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)'
                      : isWrongOption
                        ? 'color-mix(in srgb, #ef4444 10%, transparent)'
                        : isSelected
                          ? 'color-mix(in srgb, var(--accent-blue) 10%, transparent)'
                          : 'var(--bg-surface)',
                    opacity: confirmed && !isSelected && !isCorrectOption ? 0.5 : 1,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                    fontSize: '16px'
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0,
                    background: isCorrectOption
                      ? 'var(--brand-primary)'
                      : isWrongOption
                        ? '#ef4444'
                        : isSelected
                          ? 'var(--accent-blue)'
                          : 'var(--border-strong)',
                    color: isCorrectOption
                      ? 'var(--bg-base)'
                      : isWrongOption || isSelected
                        ? 'white'
                        : 'var(--text-muted)'
                  }}>
                    {isCorrectOption ? <CheckCircle size={22} /> : isWrongOption ? <XCircle size={22} /> : LABELS[i]}
                  </div>
                  <span style={{ fontSize: '16px' }}>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Explanation */}
        <AnimatePresence>
          {confirmed && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '16px', padding: '20px', borderRadius: '16px',
                border: '1px solid',
                borderColor: currentAnswer?.selected === q.correct
                  ? 'color-mix(in srgb, var(--brand-primary) 30%, transparent)'
                  : 'color-mix(in srgb, #ef4444 30%, transparent)',
                background: currentAnswer?.selected === q.correct
                  ? 'color-mix(in srgb, var(--brand-primary) 5%, transparent)'
                  : 'color-mix(in srgb, #ef4444 5%, transparent)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {currentAnswer?.selected === q.correct
                  ? <CheckCircle style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} size={20} />
                  : <XCircle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} size={20} />
                }
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    {currentAnswer?.selected === q.correct ? 'Chính xác! 🎉' : 'Sai rồi! 😅'}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{q.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={selectedIdx === null}
              style={{
                padding: '16px 32px', borderRadius: '9999px', fontWeight: 600, border: 'none', cursor: selectedIdx !== null ? 'pointer' : 'not-allowed', fontSize: '16px',
                background: selectedIdx !== null ? 'var(--accent-blue)' : 'var(--border-strong)',
                color: selectedIdx !== null ? 'white' : 'var(--text-muted)'
              }}
            >
              Xác nhận
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{ padding: '16px 32px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '9999px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              {currentIdx < questions.length - 1 ? 'Câu tiếp →' : 'Xem kết quả'}
            </button>
          )}

          {(() => {
            const unanswered = questions.length - Object.keys(answers).length
            const showWarning = unanswered > 0 && currentIdx >= questions.length - 1 && confirmed
            if (!showWarning) return null
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '12px 20px', borderRadius: '12px', background: 'color-mix(in srgb, #ef4444 10%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)', color: '#ef4444', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', width: 'fit-content' }}
              >
                <XCircle size={18} />
                Còn {unanswered} câu chưa trả lời
              </motion.div>
            )
          })()}
            <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
            style={{ padding: '16px 24px', border: '1px solid var(--border-strong)', borderRadius: '9999px', fontSize: '14px', color: Object.keys(answers).length < questions.length ? 'var(--text-muted)' : 'var(--text-primary)', background: 'transparent', cursor: submitting || Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer', marginLeft: 'auto', opacity: submitting || Object.keys(answers).length < questions.length ? 0.5 : 1 }}
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </div>
  )
}
