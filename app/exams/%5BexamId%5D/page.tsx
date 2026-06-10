'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldAlert, ChevronLeft, ChevronRight, Send, HelpCircle, AlertCircle, Maximize2 } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ExamPlayerPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 mins
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const questions = [
    {
      id: 1,
      text: 'CPU Socket AM4 thuộc về hãng sản xuất nào?',
      options: ['Intel', 'AMD', 'NVIDIA', 'Qualcomm'],
      correct: 'AMD'
    },
    {
      id: 2,
      text: 'Thành phần nào sau đây dùng để lưu trữ dữ liệu tạm thời?',
      options: ['HDD', 'SSD', 'RAM', 'ROM'],
      correct: 'RAM'
    },
    {
      id: 3,
      text: 'Tác dụng của lớp kem tản nhiệt là gì?',
      options: ['Làm đẹp CPU', 'Dẫn nhiệt tốt hơn', 'Giảm điện năng', 'Tăng xung nhịp'],
      correct: 'Dẫn nhiệt tốt hơn'
    }
  ]

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    const score = questions.filter((q, idx) => answers[idx] === q.correct).length
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6 text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[#16213e] border border-[#1e293b] p-10 rounded-3xl text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#00d2a0]/10 text-[#00d2a0] rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Hoàn thành bài thi!</h2>
          <p className="text-slate-400 mb-8">Bạn đã hoàn thành bài kiểm tra chương 1.</p>
          
          <div className="bg-[#0f0f1a] rounded-2xl p-6 mb-8 border border-[#1e293b]">
            <p className="text-sm text-slate-500 uppercase font-bold mb-1">Điểm số của bạn</p>
            <p className="text-5xl font-black text-[#00d2a0]">{score}/{questions.length}</p>
          </div>

          <button onClick={() => window.location.href = '/exams'} className="w-full py-4 bg-[#00d2a0] text-black font-bold rounded-xl hover:bg-[#00e6af] transition-all">
            QUAY LẠI DANH SÁCH THI
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      {/* Header */}
      <header className="h-20 bg-[#16213e] border-b border-[#1e293b] flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-[#00d2a0]/10 text-[#00d2a0] rounded-xl flex items-center justify-center">
             <HelpCircle size={20} />
           </div>
           <div>
             <h1 className="font-bold text-sm md:text-base">Kiểm tra chương 1: Linh kiện PC</h1>
             <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-widest mt-0.5">
               <ShieldAlert size={10} /> 
               <span>Chế độ chống gian lận đang bật</span>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase">Thời gian còn lại</span>
             <span className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
               {formatTime(timeLeft)}
             </span>
           </div>
           <button className="hidden md:flex p-2 text-slate-500 hover:text-white transition-colors">
             <Maximize2 size={20} />
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Question */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#0a0a14]">
           <div className="max-w-3xl mx-auto">
             <div className="mb-10">
               <span className="px-3 py-1 bg-[#1e293b] text-[#00d2a0] text-[10px] font-bold uppercase rounded-lg mb-4 inline-block">Câu hỏi {currentQuestion + 1} / {questions.length}</span>
               <h2 className="text-2xl font-bold leading-relaxed">{questions[currentQuestion].text}</h2>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {questions[currentQuestion].options.map((opt, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setAnswers({...answers, [currentQuestion]: opt})}
                   className={`p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                     answers[currentQuestion] === opt 
                       ? 'bg-[#00d2a0]/10 border-[#00d2a0] text-[#00d2a0]' 
                       : 'bg-[#16213e] border-[#1e293b] text-slate-300 hover:border-[#2a3655]'
                   }`}
                 >
                   <div className="flex items-center gap-4">
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                       answers[currentQuestion] === opt ? 'bg-[#00d2a0] text-black' : 'bg-[#0f0f1a] text-slate-500'
                     }`}>
                       {String.fromCharCode(65 + idx)}
                     </span>
                     <span className="font-medium">{opt}</span>
                   </div>
                   {answers[currentQuestion] === opt && <motion.div layoutId="check" className="w-6 h-6 bg-[#00d2a0] rounded-full flex items-center justify-center text-black"><Send size={12} /></motion.div>}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Right Side: Navigation */}
        <div className="w-full lg:w-96 border-l border-[#1e293b] bg-[#0f0f1a] flex flex-col">
           <div className="p-6 border-b border-[#1e293b]">
             <h3 className="font-bold text-sm mb-4">Danh sách câu hỏi</h3>
             <div className="grid grid-cols-5 gap-3">
               {questions.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentQuestion(idx)}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                     currentQuestion === idx ? 'bg-[#00d2a0] text-black border-[#00d2a0]' :
                     answers[idx] ? 'bg-[#1e293b] text-[#00d2a0] border-[#00d2a0]/30' :
                     'bg-[#16213e] text-slate-500 border-[#1e293b]'
                   }`}
                 >
                   {idx + 1}
                 </button>
               ))}
             </div>
           </div>

           <div className="flex-1 p-6 space-y-6">
             <div className="bg-[#16213e] p-4 rounded-xl border border-[#1e293b] flex items-center gap-3">
                <AlertCircle size={18} className="text-yellow-500" />
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Đừng thoát trình duyệt hoặc chuyển tab, hành động này sẽ bị ghi nhận là gian lận.
                </p>
             </div>
           </div>

           <div className="p-6 bg-[#16213e]/50 border-t border-[#1e293b] space-y-3">
             <div className="flex gap-2">
               <button 
                 disabled={currentQuestion === 0}
                 onClick={() => setCurrentQuestion(prev => prev - 1)}
                 className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs disabled:opacity-30 flex items-center justify-center gap-2"
               >
                 <ChevronLeft size={16} /> TRƯỚC
               </button>
               <button 
                 disabled={currentQuestion === questions.length - 1}
                 onClick={() => setCurrentQuestion(prev => prev + 1)}
                 className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs disabled:opacity-30 flex items-center justify-center gap-2"
               >
                 SAU <ChevronRight size={16} />
               </button>
             </div>
             <button 
               onClick={handleSubmit}
               className="w-full py-4 bg-[#00d2a0] text-black font-black rounded-xl hover:bg-[#00e6af] shadow-[0_0_20px_rgba(0,210,160,0.2)] transition-all"
             >
               NỘP BÀI THI
             </button>
           </div>
        </div>
      </main>
    </div>
  )
}
