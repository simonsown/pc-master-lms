'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Lock, ArrowRight, Star, Trophy, BookOpen, Cpu, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RoadmapPage() {
  const router = useRouter()
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

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>Đang tải lộ trình...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: '14px' }}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Lộ trình <span style={{ color: 'var(--brand-primary)' }}>Chinh phục</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Theo dõi tiến trình học tập của bạn trên con đường trở thành bậc thầy PC.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block" style={{ background: 'var(--border-default)' }} />

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
                  <div style={{
                    padding: '32px', borderRadius: '24px', border: '1px solid',
                    background: step.status === 'current' ? 'var(--bg-surface)' : step.status === 'completed' ? 'var(--bg-surface)' : 'var(--bg-base)',
                    borderColor: step.status === 'current' ? 'var(--brand-primary)' : 'var(--border-default)',
                    opacity: step.status === 'locked' ? 0.6 : 1,
                    boxShadow: step.status === 'current' ? '0 0 30px color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <span style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        padding: '4px 12px', borderRadius: '999px',
                        background: step.status === 'current' ? 'var(--brand-primary)' : step.status === 'completed' ? 'color-mix(in srgb, #3b82f6 20%, transparent)' : 'var(--bg-elevated)',
                        color: step.status === 'current' ? '#000' : step.status === 'completed' ? '#60a5fa' : 'var(--text-muted)'
                      }}>
                        {step.status === 'current' ? 'Đang học' : step.status === 'completed' ? 'Hoàn thành' : 'Đang khóa'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '14px' }}>Giai đoạn {step.id}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>{step.desc}</p>
                    <button onClick={() => step.status !== 'locked' && router.push('/student/lessons')} style={{
                      width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s',
                      border: 'none', cursor: step.status === 'locked' ? 'not-allowed' : 'pointer',
                      background: step.status === 'locked' ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                      color: step.status === 'locked' ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontFamily: 'inherit'
                    }}
                      onMouseEnter={(e) => { if (step.status !== 'locked') { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = '#000'; } }}
                      onMouseLeave={(e) => { if (step.status !== 'locked') { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    >
                      {step.status === 'locked' ? 'CHƯA MỞ KHÓA' : 'CHI TIẾT'}
                      {step.status !== 'locked' && <ArrowRight size={16} />}
                    </button>
                  </div>
                </motion.div>

                {/* Circle Icon */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 4px 24px var(--shadow-color)', transition: 'all 0.5s', position: 'relative', zIndex: 10,
                  backgroundColor: step.status === 'current' ? 'var(--brand-primary)' : step.status === 'completed' ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                  color: step.status === 'current' ? '#000' : step.status === 'completed' ? 'var(--brand-primary)' : 'var(--text-muted)',
                }}>
                  {step.status === 'completed' ? <CheckCircle2 size={28} /> : step.icon}
                  {step.status === 'current' && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--brand-primary)', opacity: 0.2, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
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
