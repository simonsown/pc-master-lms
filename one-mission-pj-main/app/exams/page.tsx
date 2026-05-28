'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { FileText, Clock, Trophy, ArrowRight, Loader2, Search, Filter, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ExamsListingPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  async function fetchExams() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('assignments')
        .select('*, classes (name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setExams(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Trung tâm <span style={{ color: 'var(--brand-primary)' }}>Khảo thí</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Danh sách các bài kiểm tra và kỳ thi chính thức dành cho bạn.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm kỳ thi..."
              className="w-full rounded-xl pl-12 pr-4 py-3 outline-none transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
            <Filter size={18} /> Lọc
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--brand-primary)' }} />
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-6 transition-all group"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Thời gian</span>
                    <p className="text-xs font-bold flex items-center gap-1 justify-end mt-1" style={{ color: 'var(--text-primary)' }}>
                      <Clock size={12} /> 45 Phút
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{exam.title}</h3>
                <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-muted)' }}>Lớp: {exam.classes?.name || 'Toàn trường'}</p>

                <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2">
                    <Trophy size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>100 XP</span>
                  </div>
                  <Link
                    href={`/exams/${exam.id}`}
                    className="px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                    style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}
                  >
                    BẮT ĐẦU THI <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-[40px] border-2 border-dashed" style={{ background: 'color-mix(in srgb, var(--bg-surface) 30%, transparent)', borderColor: 'var(--border-default)' }}>
            <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium italic" style={{ color: 'var(--text-muted)' }}>Hiện tại chưa có kỳ thi nào đang diễn ra.</p>
          </div>
        )}
      </main>
    </div>
  )
}
