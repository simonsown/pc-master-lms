'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Cpu, BookOpen, Trophy, ArrowRight, X } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function Onboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const isDone = localStorage.getItem('onboarding_done')
    if (!isDone) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (step === 4) {
      handleClose()
    } else {
      setStep(step + 1)
      if (step === 3) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }
  }

  const handleClose = () => {
    localStorage.setItem('onboarding_done', 'true')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    {
      id: 1,
      title: 'Chào mừng bạn đến với PC Master! 🎉',
      desc: 'Nền tảng học tập lắp ráp máy tính thông minh nhất dành cho bạn.',
      icon: <Sparkles className="text-yellow-400" size={48} />,
      color: 'bg-yellow-400/10'
    },
    {
      id: 2,
      title: 'Phòng Lab 3D thực tế 💻',
      desc: 'Lắp ráp hơn 50+ linh kiện thật với thông số vật lý chính xác 100%.',
      icon: <Cpu className="text-[#00d2a0]" size={48} />,
      color: 'bg-[#00d2a0]/10'
    },
    {
      id: 3,
      title: 'Học từ chuyên gia 🎓',
      desc: 'Hệ thống bài giảng video tương tác và sự hỗ trợ của AI Guru 24/7.',
      icon: <BookOpen className="text-blue-400" size={48} />,
      color: 'bg-blue-400/10'
    },
    {
      id: 4,
      title: 'Sẵn sàng chưa? 🚀',
      desc: 'Bắt đầu hành trình chinh phục công nghệ của bạn ngay bây giờ!',
      icon: <Trophy className="text-purple-400" size={48} />,
      color: 'bg-purple-400/10'
    }
  ]

  const currentStep = steps[step - 1]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={handleClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#16213e] border border-[#1e293b] rounded-[32px] overflow-hidden shadow-2xl"
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 md:p-12 text-center">
            <motion.div 
              key={step}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-24 h-24 ${currentStep.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl`}
            >
              {currentStep.icon}
            </motion.div>

            <motion.div
              key={`text-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 mb-10"
            >
              <h2 className="text-3xl font-black text-white leading-tight">{currentStep.title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed">{currentStep.desc}</p>
            </motion.div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleNext}
                className="w-full py-4 bg-[#00d2a0] hover:bg-[#00e6af] text-black font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(0,210,160,0.3)] flex items-center justify-center gap-2 group"
              >
                {step === 4 ? 'BẮT ĐẦU NGAY' : 'TIẾP TỤC'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex justify-center gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === step ? 'w-8 bg-[#00d2a0]' : 'w-2 bg-[#1e293b]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
