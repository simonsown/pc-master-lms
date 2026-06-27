'use client'

import React, { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { 
  Trophy, Flame, Clock, Swords,
  CheckCircle, XCircle, ChevronRight, Crosshair,
  Loader2, Sparkles, Star, Heart, Skull,
  Target, Diamond, Zap
} from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

const SHAPES = ['⬠', '◆', '●', '■']
const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function MiniQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params);
  const { quizId } = resolvedParams;

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameEnded, setGameEnded] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizXp, setQuizXp] = useState(100)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    initQuiz()
  }, [])

  async function initQuiz() {
    try {
      setLoading(true)
      const bankTopic = QUIZ_BANK.find(q => q.id === quizId)
      if (bankTopic) {
        const qs = bankTopic.questions.map((q: any) => ({
          question: q.q,
          options: q.options,
          correctIndex: q.answer,
          explanation: q.q,
        }))
        setQuestions(qs)
        setQuizTitle(bankTopic.title)
        setQuizXp(bankTopic.xp || 100)
        setLoading(false)
        setCurrentIdx(0)
        return
      }
      const { data: section } = await supabase
        .from('lesson_sections')
        .select('*, lessons(*)')
        .eq('id', quizId)
        .single()
      if (!section) throw new Error('Không tìm thấy bài trắc nghiệm')
      setQuizTitle(section.lessons?.title || 'Trắc nghiệm')
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: section.lessons.title,
          lessonContent: section.content_body || section.lessons.description,
          count: 5
        })
      })
      const quizData = await res.json()
      setQuestions(quizData)
      setLoading(false)
      setCurrentIdx(0)
    } catch (err) {
      console.error('Quiz init error:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentIdx < 0 || gameEnded || feedback) return
    if (timeLeft <= 0) {
      handleAnswer(-1)
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, currentIdx, gameEnded, feedback])

  const handleAnswer = (index: number) => {
    if (feedback) return
    setSelectedIdx(index)
    
    const correct = index === questions[currentIdx].correctIndex
    if (correct) {
      setFeedback('correct')
      const timeBonus = timeLeft * 10
      const streakBonus = streak * 50
      setScore(prev => prev + 100 + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ['#00d4aa', '#00f3ff', '#a78bfa'] })
    } else {
      setFeedback('wrong')
      setStreak(0)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1)
        setFeedback(null)
        setSelectedIdx(null)
        setTimeLeft(15)
      } else {
        setGameEnded(true)
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 }, colors: ['#00d4aa', '#00f3ff', '#fbbf24', '#a78bfa'] })
      }
    }, 3000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Crosshair size={64} style={{ color: 'var(--brand-primary)' }} />
      </motion.div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginTop: '24px', marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
        LOADING...
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
        Chuẩn bị vũ khí cho bạn
      </p>
    </div>
  )

  if (gameEnded) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy size={100} style={{ color: 'var(--accent-amber)', margin: '0 auto 24px' }} />
        </motion.div>
        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '3px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
          VICTORY!
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
          {quizTitle}
        </p>
        {/* Pixel score display */}
        <div style={{
          display: 'inline-block',
          padding: '16px 32px',
          background: 'var(--bg-surface)',
          border: '2px solid var(--brand-primary)',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>SCORE</div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{score}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/quiz-bank" style={{
            padding: '12px 28px',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ← VỀ TRANG CHỦ
          </Link>
          <button onClick={() => window.location.reload()} style={{
            padding: '12px 28px',
            background: 'var(--brand-primary)',
            color: 'var(--bg-base)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ★ CHƠI LẠI
          </button>
        </div>
      </motion.div>
    </div>
  )

  const q = questions[currentIdx]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Pixel grid background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* HUD */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px 14px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {(currentIdx+1)}/{questions.length}
              </span>
            </div>
            <div style={{
              padding: '6px 14px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Star size={11} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{quizXp} XP</span>
            </div>
            {/* HP Bar */}
            <div style={{
              padding: '6px 12px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Heart size={11} style={{ color: streak > 0 ? '#ef4444' : 'var(--text-muted)' }} />
              <div style={{ width: '50px', height: '8px', background: 'var(--border-subtle)', border: '1px solid var(--border-default)' }}>
                <div style={{
                  width: `${Math.max(10, 100 - (streak > 0 ? 0 : 30))}%`,
                  height: '100%',
                  background: streak > 0 ? '#ef4444' : 'var(--text-muted)',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {streak > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '13px' }}>
                <Flame size={16} style={{ color: 'var(--accent-amber)' }} /> x{streak}
              </motion.div>
            )}
            <div style={{
              padding: '8px 20px',
              border: '1px solid var(--border-default)',
              background: timeLeft <= 5 ? 'color-mix(in srgb, #ef4444 15%, transparent)' : 'var(--bg-surface)',
              fontSize: '22px', fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: timeLeft <= 5 ? '#ef4444' : 'var(--text-primary)',
              transition: 'all 0.3s',
            }}>
              {timeLeft}s
            </div>
          </div>
        </header>

        {/* Title bar */}
        <div style={{
          padding: '8px 14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
            ▸ {quizTitle} ◂
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', marginBottom: '32px', border: '1px solid var(--border-default)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            style={{
              height: '100%',
              background: 'repeating-linear-gradient(90deg, var(--brand-primary) 0px, var(--brand-primary) 4px, var(--brand-light) 4px, var(--brand-light) 8px)',
              transition: 'width 0.5s',
            }}
          />
        </div>

        {/* Question Card */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1, ...(shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}) }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                background: 'var(--bg-surface)',
                padding: '32px',
                border: '1px solid var(--border-default)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Pixel corner decorations */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)' }} />

              {/* Question number badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px',
                border: '1px solid color-mix(in srgb, var(--accent-blue) 30%, transparent)',
                color: 'var(--accent-blue)',
                fontSize: '10px', fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px',
                letterSpacing: '1px',
              }}>
                <Target size={12} />
                QUESTION {currentIdx + 1}
              </div>

              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontWeight: 900,
                lineHeight: 1.3,
                fontFamily: 'var(--font-sans)',
              }}>
                {q.question}
              </h2>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0, zIndex: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: feedback === 'correct'
                        ? 'color-mix(in srgb, var(--brand-primary) 85%, transparent)'
                        : 'color-mix(in srgb, var(--danger) 85%, transparent)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                      {feedback === 'correct'
                        ? <Diamond size={80} style={{ color: 'var(--bg-base)' }} />
                        : <Skull size={80} style={{ color: '#fff' }} />
                      }
                    </motion.div>
                    <h3 style={{
                      fontSize: '32px', fontWeight: 900, marginTop: '12px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '2px',
                      color: feedback === 'correct' ? 'var(--bg-base)' : '#fff',
                    }}>
                      {feedback === 'correct' ? 'CHÍNH XÁC!' : 'SAI RỒI!'}
                    </h3>
                    {/* Show correct answer when wrong */}
                    {feedback === 'wrong' && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        style={{ marginTop: '8px', fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-mono)' }}>
                        Đáp án đúng: <span style={{ color: '#00d4aa' }}>{q.options[q.correctIndex]}</span>
                      </motion.p>
                    )}
                    <p style={{ marginTop: '12px', padding: '0 24px', fontSize: '13px', fontWeight: 500, color: feedback === 'correct' ? 'var(--bg-base)' : 'rgba(255,255,255,0.7)', maxWidth: '500px' }}>
                      {q.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Answer Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {q.options.map((opt: string, i: number) => {
              const isCorrectOption = feedback && i === q.correctIndex
              const isWrongSelected = feedback === 'wrong' && selectedIdx === i

              return (
                <motion.button
                  key={i}
                  whileHover={!feedback ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!feedback ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={!!feedback}
                  style={{
                    background: isCorrectOption
                      ? 'var(--brand-primary)'
                      : isWrongSelected
                        ? 'var(--danger)'
                        : COLORS[i],
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '16px',
                    textAlign: 'left',
                    border: 'none',
                    cursor: feedback ? 'default' : 'pointer',
                    opacity: feedback && !isCorrectOption && !isWrongSelected ? 0.4 : 1,
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Shape indicator */}
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}>
                    {SHAPES[i]}
                  </div>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isCorrectOption && <CheckCircle size={20} />}
                  {isWrongSelected && <XCircle size={20} />}
                </motion.button>
              )
            })}
          </div>
        </main>

        {/* Footer */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <Zap size={12} style={{ color: 'var(--accent-amber)' }} />
            SCORE: {score}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <Swords size={12} />
            STREAK: x{streak}
          </div>
        </div>
      </div>
    </div>
  )
}
