'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Award, ArrowRight, Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { saveLessonProgress } from '@/lib/lesson-actions'

type QuizInteractiveProps = {
  lessonId: string;
  userId: string;
  initialProgress: any;
}

// Dummy data for Mega Prompt requirement
const QUIZ_DATA = [
  {
    id: 1,
    question: "CPU đóng vai trò gì trong máy tính?",
    options: [
      { id: 'A', text: "Lưu trữ dữ liệu dài hạn" },
      { id: 'B', text: "Xử lý các lệnh và tính toán (Bộ não)" },
      { id: 'C', text: "Cung cấp năng lượng cho toàn hệ thống" },
      { id: 'D', text: "Hiển thị hình ảnh lên màn hình" }
    ],
    correctAnswer: 'B',
    explanation: "CPU (Central Processing Unit) là bộ vi xử lý trung tâm, được ví như bộ não của máy tính, chịu trách nhiệm xử lý mọi tính toán và điều khiển các thành phần khác."
  },
  {
    id: 2,
    question: "RAM là bộ nhớ gì?",
    options: [
      { id: 'A', text: "Bộ nhớ truy cập ngẫu nhiên (Tạm thời)" },
      { id: 'B', text: "Bộ nhớ chỉ đọc (Cố định)" },
      { id: 'C', text: "Bộ nhớ lưu trữ (Ổ cứng)" },
      { id: 'D', text: "Bộ nhớ đồ họa (VRAM)" }
    ],
    correctAnswer: 'A',
    explanation: "RAM (Random Access Memory) lưu trữ dữ liệu tạm thời để CPU có thể truy xuất nhanh chóng. Khi tắt máy, dữ liệu trong RAM sẽ bị xóa sạch."
  }
]

export default function QuizInteractive({ lessonId, userId, initialProgress }: QuizInteractiveProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(initialProgress?.is_completed || false)
  const [isSaving, setIsSaving] = useState(false)

  const activeQuestion = QUIZ_DATA[currentQuestion]

  const handleSelect = (optionId: string) => {
    if (!isSubmitted) setSelectedAnswer(optionId)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) return
    setIsSubmitted(true)

    let currentScore = score
    if (selectedAnswer === activeQuestion.correctAnswer) {
      currentScore += 10
      setScore(currentScore)
      // Bắn pháo hoa nhỏ nếu trả lời đúng
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#00d2a0']
      })
    }

    // Nếu là câu cuối cùng => Hoàn thành bài học
    if (currentQuestion === QUIZ_DATA.length - 1) {
      setIsSaving(true)
      // Gọi Server Action để lưu kết quả realtime vào DB
      await saveLessonProgress(lessonId, currentScore, true)
      setIsSaving(false)
      setIsCompleted(true)
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#00d2a0', '#00b4d8', '#ffffff']
      })
    }
  }

  const handleNext = () => {
    if (currentQuestion < QUIZ_DATA.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setIsSubmitted(false)
    }
  }

  if (isCompleted && currentQuestion === QUIZ_DATA.length - 1 && isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#00d2a0]/20 to-[#00b4d8]/20 p-8 md:p-12 rounded-3xl border border-[#00d2a0]/50 text-center shadow-[0_0_50px_rgba(0,210,160,0.15)] relative overflow-hidden"
      >
        <Award size={64} className="text-[#00d2a0] mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Chúc mừng bạn!</h2>
        <p className="text-slate-300 mb-6 text-lg">Bạn đã hoàn thành bài học và đạt <strong className="text-white">{score} XP</strong>.</p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(0,210,160,0.4)]">
          <CheckCircle size={20} /> Đã lưu tiến trình
        </div>
      </motion.div>
    )
  }

  return (
    <section className="bg-[#16213e] p-6 md:p-10 rounded-3xl border border-[#1e293b] shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#00b4d8]/10 text-[#00b4d8] flex items-center justify-center text-lg">?</span>
          Kiểm tra kiến thức
        </h2>
        <div className="text-sm font-semibold text-slate-400 bg-[#0f0f1a] px-4 py-2 rounded-full border border-[#2a3655]">
          Câu {currentQuestion + 1} / {QUIZ_DATA.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-8 leading-snug">{activeQuestion.question}</h3>
          
          <div className="flex flex-col gap-3 mb-8">
            {activeQuestion.options.map(opt => {
              const isSelected = selectedAnswer === opt.id
              const isCorrect = opt.id === activeQuestion.correctAnswer
              
              let stateClass = "border-[#2a3655] bg-[#0f0f1a] hover:border-[#00d2a0]"
              if (isSelected) stateClass = "border-[#00d2a0] bg-[#00d2a0]/10"
              
              if (isSubmitted) {
                if (isCorrect) stateClass = "border-[#00d2a0] bg-[#00d2a0]/20 shadow-[0_0_15px_rgba(0,210,160,0.2)]"
                else if (isSelected && !isCorrect) stateClass = "border-red-500 bg-red-500/10"
                else stateClass = "border-[#2a3655] bg-[#0f0f1a] opacity-50"
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isSubmitted}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${stateClass}`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm
                    ${isSubmitted && isCorrect ? 'bg-[#00d2a0] border-[#00d2a0] text-black' : 
                      (isSubmitted && isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' : 
                      (isSelected ? 'border-[#00d2a0] text-[#00d2a0]' : 'border-slate-500 text-slate-400'))}
                  `}>
                    {isSubmitted && isCorrect ? <CheckCircle size={16} /> : (isSubmitted && isSelected && !isCorrect ? <XCircle size={16} /> : opt.id)}
                  </div>
                  <span className="flex-1 font-medium text-lg">{opt.text}</span>
                </button>
              )
            })}
          </div>

          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl mb-8 ${selectedAnswer === activeQuestion.correctAnswer ? 'bg-[#00d2a0]/10 border border-[#00d2a0]/30' : 'bg-red-500/10 border border-red-500/30'}`}
            >
              <h4 className={`font-bold mb-2 flex items-center gap-2 ${selectedAnswer === activeQuestion.correctAnswer ? 'text-[#00d2a0]' : 'text-red-400'}`}>
                {selectedAnswer === activeQuestion.correctAnswer ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {selectedAnswer === activeQuestion.correctAnswer ? 'Chính xác!' : 'Sai rồi!'}
              </h4>
              <p className="text-slate-300 leading-relaxed">{activeQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex justify-end">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              currentQuestion < QUIZ_DATA.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3.5 bg-[#00d2a0] text-black font-bold rounded-xl hover:bg-[#00e6af] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,160,0.3)]"
                >
                  Câu tiếp theo <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-[#00d2a0] text-black font-bold rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,160,0.3)] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Đang hoàn tất...'}
                </button>
              )
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
