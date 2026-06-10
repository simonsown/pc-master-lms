'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Play, FileText, CheckCircle, Lock, MessageSquare, Download, Bookmark, Share2, MoreVertical, Layers, ArrowLeft, HelpCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function LessonDetailPage() {
  const { courseId, lessonId } = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('resources')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showPopupQuiz, setShowPopupQuiz] = useState(false)
  const [quizAnswered, setQuizAnswered] = useState(false)

  // Simulation of a timestamp trigger for quiz
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!quizAnswered) setShowPopupQuiz(true)
    }, 10000) // Show quiz after 10 seconds of "watching"
    return () => clearTimeout(timer)
  }, [quizAnswered])

  const [lesson, setLesson] = useState<any>(null)
  const [courseLessons, setCourseLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessonData()
  }, [lessonId])

  async function fetchLessonData() {
    try {
      setLoading(true)
      // Fetch current lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lesson_sections')
        .select(`
          *,
          lessons:lesson_id (
            title,
            teacher_id
          )
        `)
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true })

      if (lessonData && lessonData.length > 0) {
        setLesson(lessonData[0]) // Get the first section as main content for now
        
        // Fetch all sections for the sidebar
        const { data: allSections } = await supabase
          .from('lesson_sections')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: true })
        
        setCourseLessons(allSections || [])
      }
    } catch (err) {
      console.error('Error fetching lesson:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#00d2a0]">Đang tải bài học...</div>
  if (!lesson) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-red-500">Bài học không tồn tại hoặc chưa được xuất bản.</div>

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      <Navbar />

      <main className="pt-20 flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* CỘT TRÁI - NỘI DUNG CHÍNH (70%) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a14]">
          {/* Video Player Section */}
          <div className="aspect-video bg-black w-full relative group overflow-hidden">
            {lesson.content_type === 'video' ? (
              <iframe 
                src={lesson.content_url?.includes('youtube.com') ? lesson.content_url.replace('watch?v=', 'embed/') : lesson.content_url} 
                className="w-full h-full border-none"
                allowFullScreen
                title={lesson.title}
              ></iframe>
            ) : lesson.content_type === 'pdf' ? (
              <iframe 
                src={lesson.content_url} 
                className="w-full h-full border-none"
                title="PDF Document"
              ></iframe>
            ) : lesson.content_type === 'image' ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={lesson.content_url} alt={lesson.title} className="max-w-full max-h-full object-contain rounded-xl" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-[#0f0f1a] p-10 text-center">
                <FileText size={64} className="mb-4 text-[#00d2a0] opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Tài liệu Bài học</h3>
                <p className="max-w-md">Vui lòng sử dụng các tab bên dưới để xem chi tiết bài học hoặc tải về tài liệu đính kèm.</p>
              </div>
            )}

            <AnimatePresence>
              {showPopupQuiz && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50"
                >
                  <div className="max-w-md w-full bg-[#16213e] border border-[#00d2a0]/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,210,160,0.2)]">
                    <div className="w-12 h-12 bg-[#00d2a0]/10 text-[#00d2a0] rounded-xl flex items-center justify-center mb-6">
                      <HelpCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Câu hỏi nhanh! ⚡</h3>
                    <p className="text-slate-400 mb-8 text-sm">Để tiếp tục bài giảng, hãy chọn câu trả lời đúng cho câu hỏi sau:</p>
                    <p className="font-bold mb-6">Linh kiện nào được ví như "bộ não" của máy tính?</p>
                    
                    <div className="space-y-3">
                      {['GPU', 'CPU', 'RAM', 'Mainboard'].map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => {
                            if (opt === 'CPU') {
                              setQuizAnswered(true)
                              setShowPopupQuiz(false)
                            }
                          }}
                          className="w-full p-4 bg-[#0f0f1a] border border-[#1e293b] rounded-xl text-left text-sm font-medium hover:border-[#00d2a0] transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 text-[#00d2a0] text-sm font-medium mb-2">
                  <Link href={`/courses/${courseId}`} className="hover:underline">{lesson.lessons?.title || 'Khóa học'}</Link>
                  <ChevronRight size={14} />
                  <span>Bài {courseLessons.findIndex(l => l.id === lesson.id) + 1}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-xl border border-[#1e293b] transition-all ${isBookmarked ? 'bg-[#00d2a0] text-black border-[#00d2a0]' : 'bg-[#16213e] text-slate-400 hover:text-white'}`}
                >
                  <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button className="p-3 bg-[#16213e] text-slate-400 hover:text-white border border-[#1e293b] rounded-xl transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="border-b border-[#1e293b] flex gap-8 mb-8 overflow-x-auto custom-scrollbar no-scrollbar whitespace-nowrap">
              {['resources', 'q&a', 'notes', 'discussion'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === tab ? 'text-[#00d2a0]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'resources' ? 'Tài nguyên' : tab === 'q&a' ? 'Hỏi & Đáp' : tab === 'notes' ? 'Ghi chú' : 'Cộng đồng'}
                  {activeTab === tab && (
                    <motion.div layoutId="lessonTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d2a0]" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeTab === 'resources' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="bg-[#16213e] border border-[#1e293b] p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Tài liệu bài giảng (PDF)</p>
                          <p className="text-xs text-slate-500">2.4 MB</p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-[#00d2a0] transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'q&a' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="bg-[#16213e] border border-[#1e293b] p-6 rounded-xl">
                      <p className="text-slate-400 text-center text-sm py-10">Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                      <button className="w-full py-3 bg-[#1e293b] hover:bg-[#2a3655] rounded-lg text-sm font-bold transition-all">
                        Đặt câu hỏi mới
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <textarea 
                      placeholder="Viết ghi chú của bạn tại đây..."
                      className="w-full bg-[#16213e] border border-[#1e293b] rounded-xl p-6 min-h-[200px] outline-none focus:border-[#00d2a0] transition-all text-sm leading-relaxed"
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                      <button className="px-6 py-2 bg-[#00d2a0] text-black font-bold rounded-lg hover:bg-[#00e6af] transition-all text-sm">
                        Lưu ghi chú
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'discussion' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-[#2a3655] shrink-0" />
                      <div className="flex-1">
                        <textarea 
                          placeholder="Chia sẻ suy nghĩ của bạn về bài học này..."
                          className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-4 text-sm outline-none focus:border-[#00d2a0] transition-all min-h-[100px]"
                        ></textarea>
                        <div className="mt-3 flex justify-end">
                          <button className="px-5 py-2 bg-[#1e293b] text-white text-xs font-bold rounded-lg hover:bg-[#2a3655] transition-all">
                            ĐĂNG BÌNH LUẬN
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6">
                      {[1, 2].map(i => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00d2a0] to-[#00b4d8] shrink-0" />
                          <div className="flex-1 bg-[#16213e]/50 p-4 rounded-2xl border border-[#1e293b]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold">Người dùng {i}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">2 giờ trước</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">Bài học này rất bổ ích, mình đã hiểu rõ hơn về các loại Socket trên Mainboard Intel và AMD!</p>
                            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                              <button className="hover:text-[#00d2a0] transition-colors font-bold">THÍCH</button>
                              <button className="hover:text-[#00d2a0] transition-colors font-bold">TRẢ LỜI</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI - SIDEBAR (30%) */}
        <div className="w-full lg:w-[400px] border-l border-[#1e293b] bg-[#0f0f1a] flex flex-col h-full lg:h-[calc(100vh-80px)]">
          <div className="p-6 border-b border-[#1e293b]">
            <h3 className="font-bold flex items-center gap-2">
              <Layers size={18} className="text-[#00d2a0]" /> Nội dung khóa học
            </h3>
            <div className="mt-4 bg-[#16213e] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00d2a0] h-full" style={{ width: '25%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Hoàn thành 1/4 bài học</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {courseLessons.map((l, index) => (
              <button 
                key={l.id}
                disabled={l.locked}
                className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-all relative ${
                  l.active ? 'bg-[#1e293b]/50 border-l-4 border-[#00d2a0]' : 'hover:bg-[#16213e]/30'
                } ${l.locked ? 'opacity-50 grayscale' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  l.completed ? 'bg-[#00d2a0]/10 text-[#00d2a0]' : 
                  l.active ? 'bg-[#00d2a0] text-black' : 
                  'bg-[#1e293b] text-slate-500'
                }`}>
                  {l.locked ? <Lock size={14} /> : l.completed ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <div className="flex-1 pr-4">
                  <p className={`text-sm font-semibold truncate ${l.active ? 'text-white' : 'text-slate-300'}`}>
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {l.type === 'video' ? <Play size={12} className="text-slate-500" /> : <FileText size={12} className="text-slate-500" />}
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{l.type === 'video' ? 'Video' : l.type === 'lab' ? 'Lab 3D' : 'Bài đọc'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 bg-[#16213e]/50 border-t border-[#1e293b]">
            <button className="w-full py-4 bg-[#00d2a0] text-black font-black rounded-xl hover:bg-[#00e6af] transition-all shadow-[0_0_20px_rgba(0,210,160,0.15)] flex items-center justify-center gap-2">
              BÀI TIẾP THEO <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
