'use client'

import React, { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { 
  BookOpen, Clock, Star, Play, ChevronRight, 
  Layers, CheckCircle, Lock, HelpCircle, FileText, Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { courseId } = resolvedParams;

  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseDetails()
  }, [])

  async function fetchCourseDetails() {
    try {
      setLoading(true)
      // 1. Fetch Course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      
      setCourse(courseData)

      // 2. Fetch Lessons in this course
      const { data: lessonData } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_sections (*)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      setLessons(lessonData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
       <Loader2 className="animate-spin text-[#00d2a0]" size={48} />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-red-500 font-bold">
       Khóa học không tồn tại.
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={course.thumbnail_url} className="w-full h-full object-cover opacity-20 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#00d2a0]/10 border border-[#00d2a0]/20 rounded-full text-[#00d2a0] text-xs font-bold uppercase tracking-widest mb-6">
                 <Star size={14} /> {course.level}
               </div>
               <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                 {course.title}
               </h1>
               <p className="text-slate-400 text-lg mb-8 max-w-2xl leading-relaxed">
                 {course.description}
               </p>
               <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={20} className="text-[#00d2a0]" /> <span>4 giờ học</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Layers size={20} className="text-[#00d2a0]" /> <span>{lessons.length} bài học</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={20} className="text-[#00d2a0]" /> <span>Cấp chứng chỉ</span>
                  </div>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="lg:w-[450px] shrink-0">
               <div className="bg-[#16213e] border border-[#1e293b] rounded-[40px] p-2 shadow-2xl overflow-hidden relative group">
                  <div className="aspect-video rounded-[32px] overflow-hidden">
                    <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm pointer-events-none">
                     <div className="w-20 h-20 bg-[#00d2a0] text-black rounded-full flex items-center justify-center shadow-2xl shadow-[#00d2a0]/40">
                        <Play size={32} fill="currentColor" />
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CURRICULUM SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
         <h2 className="text-3xl font-bold mb-10">Lộ trình <span className="text-[#00d2a0]">Bài giảng</span></h2>
         
         <div className="space-y-6">
            {lessons.map((lesson, idx) => (
              <motion.div 
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#16213e] border border-[#1e293b] rounded-3xl overflow-hidden"
              >
                 <div className="p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] flex items-center justify-center text-slate-500 font-black">
                          {idx + 1}
                       </div>
                       <div>
                          <h3 className="font-bold text-lg group-hover:text-[#00d2a0] transition-colors">{lesson.title}</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">4 phần • 45 phút</p>
                       </div>
                    </div>
                    <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="px-6 py-2.5 bg-white/5 hover:bg-[#00d2a0] hover:text-black rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                       HỌC NGAY <ChevronRight size={16} />
                    </Link>
                 </div>

                 {/* Sections list inside lesson */}
                 <div className="px-6 pb-6 pt-2 border-t border-[#1e293b]/50 space-y-3">
                    {lesson.lesson_sections?.map((section: any) => (
                       <div key={section.id} className="flex items-center justify-between py-2 px-4 rounded-xl hover:bg-[#0f0f1a]/50 transition-colors">
                          <div className="flex items-center gap-3">
                             {section.content_type === 'video' ? <Play size={14} className="text-[#00d2a0]" /> : 
                              section.content_type === 'quiz' ? <HelpCircle size={14} className="text-orange-500" /> : 
                              <FileText size={14} className="text-blue-500" />}
                             <span className="text-sm text-slate-400">{section.title}</span>
                          </div>
                          {section.content_type === 'quiz' && (
                            <Link href={`/quiz/${section.id}`} className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20">
                               LÀM QUIZ
                            </Link>
                          )}
                       </div>
                    ))}
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  )
}
