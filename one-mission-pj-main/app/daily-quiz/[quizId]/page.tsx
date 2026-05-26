'use client'

import { useState, useEffect, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Trophy, Clock, Loader2, ArrowLeft } from 'lucide-react'

export default function DailyQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({})
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number } | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [error, setError] = useState('')

  useEffect(() => {
    initQuiz()
  }, [])

  useEffect(() => {
    if (finished || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [finished, secondsLeft])

  async function initQuiz() {
    try {
      setLoading(true)
      const { data: quizData, error: qErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      if (qErr || !quizData) { setError('Không tìm thấy bài kiểm tra.'); return }
      setQuiz(quizData)
      setSecondsLeft((quizData.time_limit_minutes || 10) * 60)

      // Fetch questions via the safe student view
      const { data: qs, error: qsErr } = await supabase
        .from('quiz_questions_for_student')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order', { ascending: true })
      if (qsErr) { setError('Lỗi tải câu hỏi.'); return }
      if (!qs || qs.length === 0) { setError('Bài kiểm tra chưa có câu hỏi.'); return }
      setQuestions(qs)

      // Check for existing attempt
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Vui lòng đăng nhập.'); return }

      const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id, status')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing && existing.status === 'submitted') {
        setFinished(true)
        const { data: att } = await supabase
          .from('quiz_attempts')
          .select('score, max_score')
          .eq('id', existing.id)
          .single()
        if (att) setResult({ score: Math.round(att.score || 0), total: att.max_score || 0 })
        setLoading(false)
        return
      }

      if (existing && existing.status === 'in_progress') {
        setAttemptId(existing.id)
      } else {
        const { data: attempt, error: aErr } = await supabase
          .from('quiz_attempts')
          .insert({ quiz_id: quizId, student_id: user.id, status: 'in_progress' })
          .select('id')
          .single()
        if (aErr) { setError('Lỗi tạo bài làm.'); return }
        setAttemptId(attempt.id)
      }

      setLoading(false)
    } catch (err) {
      setError('Có lỗi xảy ra.')
      setLoading(false)
    }
  }

  function handleSelect(qId: string, optionIdx: number) {
    if (confirmedIds.has(qId)) return
    setSelectedOptions(prev => ({ ...prev, [qId]: optionIdx }))
  }

  function handleConfirm() {
    const q = questions[currentIdx]
    if (selectedOptions[q.id] === undefined) return
    setConfirmedIds(prev => new Set(prev).add(q.id))
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      if (!selectedOptions[questions[currentIdx + 1]?.id]) {
        setSelectedOptions(prev => ({ ...prev, [questions[currentIdx + 1].id]: undefined }))
      }
    }
  }

  async function handleSubmit() {
    if (submitting || !attemptId) return
    setSubmitting(true)
    setFinished(true)

    const answerRecords = questions.map((q, i) => {
      const selectedIdx = selectedOptions[q.id]
      let isCorrect = false
      let pointsEarned = 0

      // Grade: check if selected option index matches correct option
      if (selectedIdx !== undefined && q.options && q.options[selectedIdx]) {
        const selectedOptionId = q.options[selectedIdx].id
        isCorrect = true // will correct below
      }

      return {
        attempt_id: attemptId,
        question_id: q.id,
        selected_option_ids: selectedIdx !== undefined && q.options?.[selectedIdx] ? [q.options[selectedIdx].id] : [],
        is_correct: false,
        points_earned: 0,
        time_spent_seconds: 0,
      }
    })

    // Grade properly by fetching correct answers
    const questionIds = questions.map(q => q.id)
    const { data: dbQuestions } = await supabase
      .from('questions')
      .select('id, points, question_options(id, is_correct, "order")')
      .in('id', questionIds)

    let totalScore = 0
    let totalMax = 0

    if (dbQuestions) {
      for (const dbQ of dbQuestions) {
        totalMax += dbQ.points || 10
        const record = answerRecords.find(r => r.question_id === dbQ.id)
        if (!record) continue
        const correctOpt = dbQ.question_options?.find(o => o.is_correct)
        const selectedIds = record.selected_option_ids || []
        const isCorrect = correctOpt ? selectedIds.includes(correctOpt.id) : false
        record.is_correct = isCorrect
        record.points_earned = isCorrect ? (dbQ.points || 10) : 0
        if (isCorrect) totalScore += dbQ.points || 10
      }
    }

    const finalScore = totalMax > 0 ? (totalScore / totalMax) * 100 : 0

    const { error: ansErr } = await supabase.from('quiz_answers').insert(answerRecords)
    if (ansErr) console.error('Answer insert error:', ansErr)

    await supabase.from('quiz_attempts').update({
      score: finalScore,
      max_score: totalMax,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }).eq('id', attemptId)

    setResult({ score: Math.round(finalScore), total: totalMax })

    // Notification (fire and forget)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        await supabase.from('notifications').insert({
          user_id: currentUser.id,
          type: 'quiz_graded',
          title: 'Thử thách hằng ngày đã chấm!',
          body: `Bạn đạt ${Math.round(finalScore)}% - ${finalScore >= 60 ? 'Đạt yêu cầu 🎉' : 'Cố gắng hơn nhé! 💪'}`,
          action_url: `/daily-quiz/${quizId}`,
        })
      }
    } catch {}

    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080910] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#00d4aa] mx-auto mb-4" size={48} />
        <p className="text-[#5a5d72]">Đang tải thử thách hằng ngày...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#080910] flex items-center justify-center p-6">
      <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-8 max-w-md text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#1d1f2a] rounded-full text-sm">
          Về trang chủ
        </button>
      </div>
    </div>
  )

  if (finished && result) return (
    <div className="min-h-screen bg-[#080910] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-10 max-w-md w-full text-center"
      >
        <Trophy className="mx-auto mb-4 text-[#f59e0b]" size={80} />
        <h2 className="text-2xl font-bold text-[#d8dbe8] mb-2">Hoàn thành!</h2>
        <div className="text-5xl font-black text-[#00d4aa] my-6">{result.score}%</div>
        <p className="text-[#5a5d72] mb-6">{result.score >= 60 ? 'Xuất sắc! Bạn đã vượt qua thử thách hôm nay 🎉' : 'Hãy ôn tập thêm và thử lại vào ngày mai nhé! 💪'}</p>
        <button onClick={() => router.push('/')} className="px-8 py-4 bg-[#00d4aa] text-[#080910] rounded-full font-semibold">
          Về bảng điều khiển
        </button>
      </motion.div>
    </div>
  )

  if (finished && !result) return (
    <div className="min-h-screen bg-[#080910] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-10 max-w-md w-full text-center"
      >
        <CheckCircle className="mx-auto mb-4 text-[#00d4aa]" size={80} />
        <h2 className="text-2xl font-bold text-[#d8dbe8] mb-2">Bạn đã hoàn thành thử thách hôm nay rồi!</h2>
        <button onClick={() => router.push('/')} className="mt-6 px-8 py-4 bg-[#00d4aa] text-[#080910] rounded-full font-semibold">
          Về bảng điều khiển
        </button>
      </motion.div>
    </div>
  )

  const q = questions[currentIdx]
  if (!q) return null

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#080910] text-[#d8dbe8] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-[#5a5d72] hover:text-[#d8dbe8] transition">
            <ArrowLeft size={20} />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#5a5d72]">{currentIdx + 1}/{questions.length}</span>
            <div className="flex items-center gap-2 text-[#f59e0b] bg-[#f59e0b]/10 px-4 py-2 rounded-full text-sm font-semibold">
              <Clock size={16} />
              {formatTime(secondsLeft)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-[#1d1f2a] rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-[#00d4aa] rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-8 mb-6"
          >
            <div className="text-xs text-[#f59e0b] uppercase tracking-widest font-semibold mb-4">
              Câu hỏi {currentIdx + 1}
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{q.content || q.question}</h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {(q.options || []).map((opt: any, i: number) => {
              const isSelected = selectedOptions[q.id] === i
              const isConfirmed = confirmedIds.has(q.id)
              const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(q.id, i)}
                  disabled={isConfirmed}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                      : 'border-[#1d1f2a] bg-[#0f1018] hover:border-[#3b82f6]/50'
                  } ${isConfirmed && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    isSelected ? 'bg-[#00d4aa] text-[#080910]' : 'bg-[#1d1f2a] text-[#5a5d72]'
                  }`}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                  <span className="text-base">{opt.content || opt}</span>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          {!confirmedIds.has(q.id) ? (
            <button
              onClick={handleConfirm}
              disabled={selectedOptions[q.id] === undefined}
              className={`px-8 py-4 rounded-full font-semibold transition ${
                selectedOptions[q.id] !== undefined
                  ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                  : 'bg-[#1d1f2a] text-[#5a5d72] cursor-not-allowed'
              }`}
            >
              Xác nhận
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-[#00d4aa] text-[#080910] rounded-full font-semibold hover:bg-[#00b89c] transition"
            >
              {currentIdx < questions.length - 1 ? 'Câu tiếp →' : 'Xem kết quả'}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-4 border border-[#1d1f2a] rounded-full text-sm text-[#5a5d72] hover:text-[#ef4444] hover:border-[#ef4444]/50 transition ml-auto"
          >
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  )
}
