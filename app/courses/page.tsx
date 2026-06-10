'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, BookOpen, Clock, Star, Play, ChevronRight, Layers, LayoutGrid, List, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function CoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      setCourses(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Danh mục <span className="text-[#00d2a0]">Khóa học</span></h1>
          <p className="text-slate-400 max-w-2xl">
            Hệ thống bài giảng được thiết kế lộ trình bài bản, từ cơ bản đến nâng cao dành cho mọi đối tượng.
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài học, chủ đề..."
              className="w-full bg-[#16213e] border border-[#1e293b] rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-[#00d2a0] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3.5 bg-[#16213e] border border-[#1e293b] rounded-2xl hover:bg-[#1e293b] transition-all text-sm font-medium">
              <Filter size={18} /> Lọc bài học
            </button>
            <div className="h-10 w-[1px] bg-[#1e293b] mx-1"></div>
            <div className="bg-[#16213e] border border-[#1e293b] rounded-xl p-1 flex gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00d2a0] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#00d2a0] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d2a0]" size={48} /></div>
        ) : courses.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star size={20} className="text-yellow-500" /> Đề xuất cho bạn
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, idx) => (
                <CourseCard key={course.id} course={course} idx={idx} viewMode={viewMode} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#16213e]/30 border border-dashed border-[#1e293b] rounded-[40px]">
             <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
             <p className="text-slate-500 font-medium italic">Hiện tại chưa có khóa học nào được xuất bản.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function CourseCard({ course, idx, viewMode }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`group bg-[#16213e] border border-[#1e293b] rounded-2xl overflow-hidden hover:border-[#00d2a0]/50 transition-all shadow-xl hover:shadow-[#00d2a0]/5 ${
        viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-[300px] shrink-0' : 'aspect-video'}`}>
        <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=60'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            course.level === 'Cơ bản' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            course.level === 'Trung cấp' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {course.level || 'Cơ bản'}
          </span>
        </div>
        {(course.progress || 0) > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <div className="h-full bg-[#00d2a0]" style={{ width: `${course.progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 group-hover:text-[#00d2a0] transition-colors">{course.title}</h3>
        <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {course.duration}</span>
            <span className="flex items-center gap-1.5"><Layers size={14} /> {course.lessons} bài</span>
          </div>
          
          <Link href={`/courses/${course.id}`} className="p-2.5 bg-[#1e293b] hover:bg-[#00d2a0] hover:text-black rounded-xl transition-all group/btn">
            <ChevronRight size={20} className="transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
