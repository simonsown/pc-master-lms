'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Layout, HardDrive, Zap, Shield, Microscope, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SkillTreePage() {
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  async function fetchSkills() {
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
      
      // Dynamic calculation logic (simplified for real feel)
      const baseSkills = [
        { id: 'cpu', name: 'Master CPU', level: Math.min(100, completedCount * 15), icon: <Cpu size={24} />, color: '#00d2a0' },
        { id: 'main', name: 'Mainboard Expert', level: Math.min(100, completedCount * 12), icon: <Layout size={24} />, color: '#00b4d8' },
        { id: 'ram', name: 'Memory Specialist', level: Math.min(100, completedCount * 20), icon: <Zap size={24} />, color: '#fbbf24' },
        { id: 'gpu', name: 'Graphics Guru', level: Math.min(100, completedCount * 8), icon: <Microscope size={24} />, color: '#a855f7' },
        { id: 'storage', name: 'Storage Pro', level: Math.min(100, completedCount * 10), icon: <HardDrive size={24} />, color: '#f87171' },
        { id: 'security', name: 'System Security', level: Math.min(100, completedCount * 5), icon: <Shield size={24} />, color: '#6366f1' },
      ]
      setSkills(baseSkills)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#00d2a0]">Đang tải cây kỹ năng...</div>

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/profile" className="p-2 hover:bg-[#16213e] rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Cây kỹ năng <span className="text-[#00d2a0]">Chuyên môn</span></h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative py-10">
          {/* SVG Lines Connector Placeholder (Conceptual) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 hidden lg:block">
            <line x1="15%" y1="20%" x2="50%" y2="50%" stroke="white" strokeWidth="2" />
            <line x1="85%" y1="20%" x2="50%" y2="50%" stroke="white" strokeWidth="2" />
          </svg>

          {skills.map((skill, idx) => (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              <div className="bg-[#16213e] border border-[#1e293b] p-8 rounded-[40px] text-center relative z-10 hover:border-[#00d2a0]/50 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(0,210,160,0.1)]">
                <div 
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform"
                  style={{ backgroundColor: `${skill.color}20`, color: skill.color, border: `2px solid ${skill.color}40` }}
                >
                  {skill.icon}
                </div>
                <h3 className="text-xl font-black mb-2">{skill.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-6">
                   <div className="h-1.5 w-full bg-[#0f0f1a] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full"
                        style={{ backgroundColor: skill.color }}
                      />
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{skill.level}%</span>
                </div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div key={star} className={`w-2 h-2 rounded-full ${star <= Math.round(skill.level/20) ? '' : 'bg-slate-700'}`} style={{ backgroundColor: star <= Math.round(skill.level/20) ? skill.color : '' }} />
                  ))}
                </div>
              </div>
              
              {/* Connector dots */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#00d2a0]/10 rounded-full flex items-center justify-center border border-[#00d2a0]/20 group-hover:bg-[#00d2a0]/30 transition-all">
                <div className="w-2 h-2 bg-[#00d2a0] rounded-full animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-gradient-to-r from-[#16213e] to-[#0f0f1a] border border-[#1e293b] rounded-[40px] flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1">
             <h4 className="text-2xl font-bold mb-4">Mở khóa chứng chỉ Master</h4>
             <p className="text-slate-400 leading-relaxed">
               Hoàn thành tất cả các kỹ năng phần cứng ở mức trên 80% để mở khóa bài thi cuối khóa và nhận chứng chỉ PC Master Academy được công nhận toàn cầu.
             </p>
           </div>
           <button className="px-10 py-5 bg-[#00d2a0] text-black font-black rounded-2xl hover:scale-105 transition-transform shadow-xl">
             BẮT ĐẦU THI NGAY
           </button>
        </div>
      </main>
    </div>
  )
}
