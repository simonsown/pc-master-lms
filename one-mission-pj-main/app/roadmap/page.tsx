'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Lock, ArrowRight, Star, Trophy, BookOpen, Cpu } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function RoadmapPage() {
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  async function fetchRoadmap() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user progress
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('is_completed', true)

      const completedCount = progress?.length || 0

      // Map mock-like structure but with real status
      const roadmapSteps = [
        { id: 1, title: 'Nhập môn Máy tính', desc: 'Tìm hiểu về các bộ phận cơ bản và lịch sử phát triển.', status: completedCount >= 1 ? 'completed' : 'current', icon: <BookOpen size={24} /> },
        { id: 2, title: 'Linh kiện & Phần cứng', desc: 'Đi sâu vào CPU, Mainboard, RAM và cách chúng làm việc.', status: completedCount >= 3 ? 'completed' : (completedCount >= 1 ? 'current' : 'locked'), icon: <Cpu size={24} /> },
        { id: 3, title: 'Kỹ năng Lắp ráp', desc: 'Thực hành lắp ráp hoàn chỉnh một bộ PC Gaming.', status: completedCount >= 6 ? 'completed' : (completedCount >= 3 ? 'current' : 'locked'), icon: <Star size={24} /> },
        { id: 4, title: 'Cài đặt & Tối ưu', desc: 'Cài đặt hệ điều hành, driver và ép xung cơ bản.', status: completedCount >= 10 ? 'completed' : (completedCount >= 6 ? 'current' : 'locked'), icon: <Trophy size={24} /> }
      ]
      setSteps(roadmapSteps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#00d2a0]">Đang tải lộ trình...</div>

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Lộ trình <span className="text-[#00d2a0]">Chinh phục</span></h1>
          <p className="text-slate-400">Theo dõi tiến trình học tập của bạn trên con đường trở thành bậc thầy PC.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-[#1e293b] -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div key={step.id} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1 w-full"
                >
                  <div className={`p-8 rounded-3xl border transition-all ${
                    step.status === 'current' ? 'bg-[#16213e] border-[#00d2a0] shadow-[0_0_30px_rgba(0,210,160,0.1)]' :
                    step.status === 'completed' ? 'bg-[#16213e] border-[#1e293b]' :
                    'bg-[#0f0f1a] border-[#1e293b] opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        step.status === 'current' ? 'bg-[#00d2a0] text-black' :
                        step.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {step.status === 'current' ? 'Đang học' : step.status === 'completed' ? 'Hoàn thành' : 'Đang khóa'}
                      </span>
                      <span className="text-slate-500 font-bold text-sm">Giai đoạn {step.id}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">{step.desc}</p>
                    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      step.status === 'locked' ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-[#1e293b] hover:bg-[#00d2a0] hover:text-black'
                    }`}>
                      {step.status === 'locked' ? 'CHƯA MỞ KHÓA' : 'CHI TIẾT'}
                      {step.status !== 'locked' && <ArrowRight size={16} />}
                    </button>
                  </div>
                </motion.div>

                {/* Circle Icon */}
                <div className="relative z-10 w-16 h-16 rounded-full border-4 border-[#0f0f1a] flex items-center justify-center shrink-0 shadow-xl transition-all duration-500"
                  style={{
                    backgroundColor: step.status === 'current' ? '#00d2a0' : step.status === 'completed' ? '#16213e' : '#1e293b',
                    color: step.status === 'current' ? '#000' : step.status === 'completed' ? '#00d2a0' : '#475569'
                  }}
                >
                  {step.status === 'completed' ? <CheckCircle2 size={28} /> : step.icon}
                  {step.status === 'current' && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#00d2a0] animate-ping opacity-20" />
                  )}
                </div>

                {/* Empty Spacer for desktop */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
