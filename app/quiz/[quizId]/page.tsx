'use client'

import React, { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { 
  Trophy, Flame, Clock, 
  CheckCircle, XCircle, ChevronRight, 
  Loader2, AlertCircle, Sparkles, Star
} from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

export default function MiniQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params);
  const { quizId } = resolvedParams;

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameEnded, setGameEnded] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizXp, setQuizXp] = useState(100)

  useEffect(() => {
    initQuiz()
  }, [])

  async function initQuiz() {
    try {
      setLoading(true)

      // Check if quizId is from QUIZ_BANK first
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

      // Fallback: Fetch Lesson Section from Supabase
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

  // Timer Logic
  useEffect(() => {
    if (currentIdx < 0 || gameEnded || feedback) return
    if (timeLeft <= 0) {
      handleAnswer(-1) // Time out
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, currentIdx, gameEnded, feedback])

  const handleAnswer = (index: number) => {
    if (feedback) return // Prevent double click
    
    const correct = index === questions[currentIdx].correctIndex
    if (correct) {
      setFeedback('correct')
      const timeBonus = timeLeft * 10
      const streakBonus = streak * 50
      setScore(prev => prev + 100 + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } })
    } else {
      setFeedback('wrong')
      setStreak(0)
    }

    // Move to next after delay
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1)
        setFeedback(null)
        setTimeLeft(15)
      } else {
        setGameEnded(true)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      }
    }, 2500)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white p-10 text-center">
       <Loader2 className="animate-spin text-[#00d2a0] mb-6" size={64} />
       <h1 className="text-3xl font-black mb-2 animate-pulse">Đang tải câu hỏi...</h1>
       <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Chuẩn bị bộ đề cho bạn</p>
    </div>
  )

  if (gameEnded) return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white p-10">
       <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Trophy className="text-[#f59e0b] mx-auto mb-6" size={120} />
          <h1 className="text-5xl font-black mb-4">HOÀN THÀNH!</h1>
          <p className="text-xl text-slate-400 mb-4">{quizTitle}</p>
          <div className="text-8xl font-black text-[#00d2a0] mb-2">{score}</div>
          <p className="text-slate-500 mb-8">điểm</p>
          <div className="flex gap-4 justify-center">
             <Link href="/quiz-bank" className="px-10 py-4 bg-[#16213e] border border-[#1e293b] rounded-2xl font-black uppercase">Về ngân hàng đề</Link>
             <button onClick={() => window.location.reload()} className="px-10 py-4 bg-[#00d2a0] text-black rounded-2xl font-black uppercase">Chơi lại</button>
          </div>
       </motion.div>
    </div>
  )

  const q = questions[currentIdx]
  const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col p-6 overflow-hidden">
      
      {/* HUD */}
      <header className="flex items-center justify-between mb-6">
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div className="bg-[#16213e] px-4 py-2 rounded-full border border-[#1e293b]">
              <span className="text-xs font-black text-[#00d2a0]">{(currentIdx+1)}/{questions.length}</span>
           </div>
           <div className="bg-[#16213e] px-4 py-2 rounded-full border border-[#1e293b] flex items-center gap-2">
              <Star size={12} className="text-[#f59e0b]" />
              <span className="text-xs font-black text-slate-400">{quizXp} XP</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
            {streak > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-orange-500 font-black">
                <Flame className="animate-bounce" /> x{streak}
              </motion.div>
            )}
            <div className="bg-[#16213e] px-6 py-3 rounded-2xl border border-[#1e293b] text-2xl font-mono font-bold">
               {timeLeft}s
            </div>
         </div>
      </header>
      <div className="bg-[#16213e] px-4 py-2 rounded-xl border border-[#1e293b] text-center mb-6">
        <span className="text-sm font-bold text-slate-300">{quizTitle}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#16213e] rounded-full mb-12 overflow-hidden">
         <motion.div 
           className="h-full bg-[#00d2a0]" 
           initial={{ width: 0 }}
           animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
         />
      </div>

      {/* Question Card */}
      <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-10">
         <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="bg-[#16213e] p-10 rounded-[40px] border border-[#1e293b] text-center shadow-2xl relative"
            >
               <h2 className="text-3xl md:text-5xl font-black leading-tight">
                 {q.question}
               </h2>
               
               {/* Feedback Overlay */}
               <AnimatePresence>
                 {feedback && (
                   <motion.div 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[40px] backdrop-blur-md
                       ${feedback === 'correct' ? 'bg-[#00d2a0]/80' : 'bg-[#ef4444]/80'}
                     `}
                   >
                     {feedback === 'correct' ? <CheckCircle size={100} color="black" /> : <XCircle size={100} color="white" />}
                     <h3 className="text-4xl font-black mt-4 text-black">
                       {feedback === 'correct' ? 'CHÍNH XÁC!' : 'SAI RỒI!'}
                     </h3>
                     <p className="mt-4 px-10 text-lg font-bold text-black/70 italic">
                        {q.explanation}
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
         </AnimatePresence>

         {/* 4 Answer Buttons (Kahoot Style) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {q.options.map((opt: string, i: number) => (
               <motion.button
                 key={i}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => handleAnswer(i)}
                 disabled={!!feedback}
                 style={{ background: colors[i] }}
                 className="p-8 rounded-3xl text-2xl font-black text-white text-left flex items-center gap-6 shadow-xl hover:brightness-110 transition-all disabled:opacity-50"
               >
                 <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                    {['▲', '◆', '●', '■'][i]}
                 </div>
                 {opt}
               </motion.button>
            ))}
         </div>
      </main>

      {/* Decorative floating icons */}
      <div className="absolute top-1/4 left-10 opacity-10 animate-pulse"><Sparkles size={100} /></div>
      <div className="absolute bottom-1/4 right-10 opacity-10 animate-bounce"><Trophy size={100} /></div>
    </div>
  )
}
