'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { HelpCircle, Zap, Star, ArrowRight, Loader2, Search } from 'lucide-react'
import Link from 'next/link'

export default function QuizzesListingPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('lesson_sections')
        .select(`
          *,
          lessons (title)
        `)
        .eq('content_type', 'quiz')
        .limit(20)

      setQuizzes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Thử thách <span className="text-[#00d2a0]">Nhanh</span></h1>
          <p className="text-slate-400">Kiểm tra kiến thức tức thì với các bài trắc nghiệm ngắn từ bài giảng.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-gradient-to-br from-[#00d2a0]/20 to-[#00b4d8]/20 border border-[#00d2a0]/30 rounded-3xl">
             <Zap size={32} className="text-[#00d2a0] mb-4" />
             <h3 className="font-bold">Động lực học</h3>
             <p className="text-xs text-slate-500 mt-1">Trả lời đúng nhận x2 XP</p>
          </div>
          <div className="p-6 bg-[#16213e] border border-[#1e293b] rounded-3xl">
             <Star size={32} className="text-yellow-500 mb-4" />
             <h3 className="font-bold">Bảng vàng</h3>
             <p className="text-xs text-slate-500 mt-1">Top 10 nhận huy hiệu</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#00d2a0]" size={40} />
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <motion.div 
                key={quiz.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#16213e] border border-[#1e293b] rounded-3xl p-6 hover:shadow-[0_0_30px_rgba(0,210,160,0.1)] transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1e293b] text-[#00d2a0] rounded-xl flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{quiz.lessons?.title}</span>
                </div>

                <h3 className="text-lg font-bold mb-6 min-h-[50px]">{quiz.title}</h3>

                <Link 
                  href={`/quiz/${quiz.id}`}
                  className="w-full py-4 bg-[#0f0f1a] text-white border border-[#1e293b] group-hover:border-[#00d2a0] group-hover:text-[#00d2a0] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  LÀM BÀI NGAY <Zap size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#16213e]/30 border border-dashed border-[#1e293b] rounded-[40px]">
             <Zap size={48} className="mx-auto text-slate-600 mb-4" />
             <p className="text-slate-500 font-medium italic">Chưa có bài trắc nghiệm nào được tạo.</p>
          </div>
        )}
      </main>
    </div>
  )
}
