'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowLeft, Trophy } from 'lucide-react'

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const attemptId = new URLSearchParams(window.location.search).get('attemptId')
      if (attemptId) {
        const stored = sessionStorage.getItem(`quiz-result-${attemptId}`)
        const storedScore = sessionStorage.getItem(`quiz-score-${attemptId}`)
        const storedMax = sessionStorage.getItem(`quiz-max-${attemptId}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setQuestions(parsed)
          const correctCount = parsed.filter((q: any) => q.isCorrect).length
          const total = parsed.length
          setScore(Number(storedScore) || (correctCount * 10))
          setMaxScore(Number(storedMax) || (total * 10))
          setPassed((Number(storedScore) || (correctCount * 10)) >= 80)
        }
      }
    } catch(e) {
      console.error('Error loading quiz results:', e)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const correctCount = questions.filter((q: any) => q.isCorrect).length
  const wrongCount = questions.length - correctCount

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/student/quiz')}
            className="relative z-50 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold transition-all shadow-md cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <h1 className="text-xl sm:text-2xl font-black uppercase" style={{ color: 'var(--text-primary)' }}>Kết Quả Bài Kiểm Tra</h1>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-[28px] p-8 text-center border shadow-2xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <Trophy size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Không có dữ liệu kết quả</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Hãy làm bài kiểm tra trước khi xem kết quả.</p>
            <Link href={`/student/quiz/${resolvedParams.quizId}`} className="px-6 py-3 rounded-xl font-bold inline-block"
              style={{ background: 'var(--brand-primary)', color: 'black' }}>
              Làm bài ngay
            </Link>
          </div>
        ) : (
          <>
            {/* Score Summary */}
            <div className="rounded-[28px] p-6 sm:p-8 border shadow-2xl mb-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <div className="w-32 h-32 mx-auto rounded-full border-8 flex items-center justify-center mb-4"
                style={passed ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', boxShadow: '0 0 20px color-mix(in srgb, var(--brand-primary) 20%, transparent)' } : { borderColor: '#ef4444', color: '#ef4444' }}>
                <span className="text-4xl font-black">{score}</span>
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-widest mb-4`} style={passed ? { color: 'var(--brand-primary)' } : { color: '#ef4444' }}>
                {passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
              </h2>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="px-4 py-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Đúng</p>
                  <p className="text-xl font-black" style={{ color: 'var(--brand-primary)' }}>{correctCount}/{questions.length}</p>
                </div>
                <div className="px-4 py-2 rounded-xl" style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)' }}>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Sai</p>
                  <p className="text-xl font-black" style={{ color: '#ef4444' }}>{wrongCount}</p>
                </div>
              </div>
            </div>

            {/* Per-Question Analysis */}
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Chi tiết từng câu hỏi</h3>
            <div className="space-y-3">
              {questions.map((q: any, i: number) => (
                <div key={i} className="rounded-2xl border overflow-hidden transition-all" style={{ background: 'var(--bg-surface)', borderColor: q.isCorrect ? 'color-mix(in srgb, var(--brand-primary) 30%, transparent)' : 'color-mix(in srgb, #ef4444 30%, transparent)' }}>
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    {q.isCorrect ? (
                      <CheckCircle size={20} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                    ) : (
                      <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    )}
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Câu {i + 1}: {q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                      background: q.isCorrect ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' : 'color-mix(in srgb, #ef4444 15%, transparent)',
                      color: q.isCorrect ? 'var(--brand-primary)' : '#ef4444'
                    }}>
                      {q.isCorrect ? '+10' : '0'}
                    </span>
                    {expandedIndex === i ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {expandedIndex === i && (
                    <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                      <p className="text-sm font-bold pt-3" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                      {q.options.map((opt: string, oi: number) => {
                        let bg = 'transparent'
                        let txt = 'var(--text-secondary)'
                        if (oi === q.correctIndex) {
                          bg = 'color-mix(in srgb, var(--brand-primary) 10%, transparent)'
                          txt = 'var(--brand-primary)'
                        } else if (oi === q.selectedIndex && oi !== q.correctIndex) {
                          bg = 'color-mix(in srgb, #ef4444 10%, transparent)'
                          txt = '#ef4444'
                        }
                        return (
                          <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: bg }}>
                            {oi === q.correctIndex && <CheckCircle size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />}
                            {oi === q.selectedIndex && oi !== q.correctIndex && <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />}
                            <span style={{ color: txt }}>
                              {String.fromCharCode(65 + oi)}. {opt}
                              {oi === q.correctIndex && <span className="ml-1 text-xs font-bold" style={{ color: 'var(--brand-primary)' }}>✓ Đáp án đúng</span>}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Link href="/student/quiz" className="px-6 py-3 border rounded-2xl font-bold text-sm transition-all"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                Về Ngân hàng đề thi
              </Link>
              <Link
                href={`/student/quiz/${resolvedParams.quizId}`}
                className="px-6 py-3 rounded-2xl font-black text-sm transition-all"
                style={{ background: 'var(--brand-primary)', color: 'black' }}
              >
                Làm Lại
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
