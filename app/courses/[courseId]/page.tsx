'use client'

import React, { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Star, Play, ChevronRight,
  Layers, CheckCircle, Lock, HelpCircle, FileText, Loader2,
  Users, Award, Shield, Zap, MonitorPlay, Sparkles,
  X, CreditCard, Smartphone, ShieldCheck, Gift,
  ChevronDown, BarChart3, GraduationCap, Quote,
  ArrowLeft, Download, Check, Crown, Flame, Eye
} from 'lucide-react'
import Link from 'next/link'

const FREE_LESSON_COUNT = 3
const PRICE = 199000
const DISCOUNT_PRICE = 199000
const ORIGINAL_PRICE = 599000

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { courseId } = resolvedParams;

  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, minutes: 30, seconds: 22 })

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      setCourse(courseData)

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*, lesson_sections(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
      setLessons(lessonData || [])

      if (u) {
        const { data: purchase } = await supabase
          .from('course_purchases')
          .select('*')
          .eq('user_id', u.id)
          .eq('course_id', courseId)
          .eq('status', 'completed')
          .single()
        setHasPurchased(!!purchase)

        const { data: prog } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('student_id', u.id)
          .in('lesson_id', (lessonData || []).map(l => l.id))
        const completed = new Set((prog || []).map(p => p.lesson_id))
        setCompletedLessons(completed)
      }

      setLoading(false)
    }
    fetchAll()
  }, [courseId])

  useEffect(() => {
    if (lessons.length > 0) {
      const total = lessons.length
      const completed = completedLessons.size
      setProgress(Math.round((completed / total) * 100))
    }
  }, [lessons, completedLessons])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const total = prev.days * 86400 + prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1
        if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        return {
          days: Math.floor(total / 86400),
          hours: Math.floor((total % 86400) / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const isLessonUnlocked = (index: number) => {
    if (!user) return index < FREE_LESSON_COUNT
    return index < FREE_LESSON_COUNT || hasPurchased
  }

  const getLessonIcon = (sections: any[]) => {
    if (!sections || sections.length === 0) return <FileText size={16} className="text-blue-400" />
    const types = sections.map(s => s.content_type)
    if (types.includes('video')) return <Play size={16} className="text-[#00d2a0]" />
    if (types.includes('quiz')) return <HelpCircle size={16} className="text-orange-400" />
    return <FileText size={16} className="text-blue-400" />
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#00d2a0]" size={48} />
        <p className="text-slate-500 font-medium">Đang tải khóa học...</p>
      </div>
    </div>
  )

  if (!course) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="text-center">
        <BookOpen size={64} className="mx-auto text-slate-600 mb-4" />
        <p className="text-red-400 font-bold text-lg">Khóa học không tồn tại</p>
        <Link href="/courses" className="text-[#00d2a0] hover:underline mt-4 inline-block">Quay lại danh sách</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={course.thumbnail_url} className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a14]/80 to-[#0a0a14]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00d2a0]/10 border border-[#00d2a0]/20 rounded-full text-[#00d2a0] text-xs font-bold uppercase tracking-widest mb-4">
                <GraduationCap size={14} /> {course.level || 'Cơ bản'}
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{course.title}</h1>
              <p className="text-slate-400 text-base md:text-lg mb-6 max-w-2xl leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <span>{course.rating || 4.8}</span>
                  <span className="text-slate-500">({(course.student_count || 1247).toLocaleString('vi-VN')} học viên)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Users size={18} className="text-[#00d2a0]" />
                  <span>{course.student_count?.toLocaleString('vi-VN') || '1.247'} học viên</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Clock size={18} className="text-[#00d2a0]" />
                  <span>{course.total_hours || 8} giờ học</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Layers size={18} className="text-[#00d2a0]" />
                  <span>{lessons.length} bài học</span>
                </div>
              </div>

              {/* What you'll learn */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-[#00d2a0] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={16} /> Bạn sẽ học được
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Nhận biết và phân loại tất cả linh kiện phần cứng',
                    'Hiểu CPU, RAM, GPU, Mainboard, PSU, ổ cứng, tản nhiệt',
                    'Kỹ năng build PC hoàn chỉnh từ A-Z',
                    'Chuẩn đoán và sửa lỗi phần cứng thường gặp',
                    'Kiến thức về các ngành nghề phần cứng máy tính',
                    'Thực hành trên PC Builder Lab mô phỏng 3D'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-[#00d2a0] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── PRICING CARD ─── */}
            <div className="lg:w-[380px] shrink-0 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12122a] border border-[#00d2a0]/20 rounded-3xl overflow-hidden shadow-2xl shadow-[#00d2a0]/5"
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#1a1a3e] to-[#0a0a14] flex items-center justify-center group cursor-pointer overflow-hidden">
                  <img src={course.thumbnail_url} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#00d2a0]/90 rounded-full flex items-center justify-center shadow-2xl shadow-[#00d2a0]/40 group-hover:scale-110 transition-transform">
                      <Play size={28} fill="black" className="text-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Eye size={12} /> Xem trailer
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-black text-white">{formatPrice(DISCOUNT_PRICE)}</span>
                    <span className="text-lg text-slate-500 line-through">{formatPrice(ORIGINAL_PRICE)}</span>
                    <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full">-67%</span>
                  </div>

                  {/* Countdown */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Flame size={14} /> Ưu đãi kết thúc trong
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[
                        { label: 'Ngày', value: countdown.days },
                        { label: 'Giờ', value: countdown.hours },
                        { label: 'Phút', value: countdown.minutes },
                        { label: 'Giây', value: countdown.seconds }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-lg font-black text-red-400">
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-4 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black font-extrabold text-base rounded-xl hover:from-emerald-400 hover:to-[#00d2a0] transition-all shadow-lg shadow-[#00d2a0]/25 mb-3 flex items-center justify-center gap-2"
                  >
                    <Crown size={20} /> MUA KHÓA HỌC
                  </button>

                  <div className="flex items-center justify-center gap-2 mb-5 text-xs text-slate-500">
                    <ShieldCheck size={14} className="text-[#00d2a0]" />
                    Thanh toán an toàn • Học mọi lúc • Hỗ trợ 24/7
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Play, text: '12 bài giảng chuyên sâu' },
                      { icon: Clock, text: '8+ giờ video hướng dẫn' },
                      { icon: MonitorPlay, text: 'Thực hành trên PC Builder Lab' },
                      { icon: Award, text: 'Chứng chỉ hoàn thành (PDF + QR)' },
                      { icon: Zap, text: 'AI Guru hỗ trợ 24/7' },
                      { icon: Users, text: 'Cộng đồng học viên 1.200+' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <item.icon size={16} className="text-[#00d2a0] shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher" className="w-10 h-10 rounded-full bg-slate-700" />
                      <div>
                        <p className="text-sm font-bold">Nguyễn Phúc Khanh Sơn</p>
                        <p className="text-xs text-slate-500">Kỹ sư Phần cứng - Sáng lập PC Master</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ─── CURRICULUM ─── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen size={24} className="text-[#00d2a0]" />
                Lộ trình học tập
              </h2>
              <span className="text-sm text-slate-400">{lessons.length} bài học</span>
            </div>

            {/* Progress */}
            {user && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold">Tiến độ của bạn</span>
                  <span className="text-sm text-[#00d2a0] font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#00d2a0] to-emerald-400 rounded-full"
                  />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>✅ {completedLessons.size} hoàn thành</span>
                  <span>📚 {lessons.length - completedLessons.size} còn lại</span>
                  {!hasPurchased && <span className="text-[#00d2a0]">🆓 {FREE_LESSON_COUNT} bài miễn phí</span>}
                </div>
              </div>
            )}

            {/* Lesson list */}
            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const unlocked = isLessonUnlocked(idx)
                const completed = completedLessons.has(lesson.id)
                const isExpanded = expandedLesson === lesson.id

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-2xl overflow-hidden border transition-all ${completed
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : unlocked
                        ? 'border-white/10 bg-white/[0.03] hover:border-[#00d2a0]/30'
                        : 'border-white/[0.04] bg-white/[0.01] opacity-60'
                    }`}
                  >
                    <div
                      onClick={() => {
                        if (unlocked) {
                          setExpandedLesson(isExpanded ? null : lesson.id)
                        } else {
                          setShowPayment(true)
                        }
                      }}
                      className="p-4 flex items-center gap-4 cursor-pointer"
                    >
                      {/* Number / Status */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${completed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : unlocked
                          ? 'bg-[#00d2a0]/10 text-[#00d2a0]'
                          : 'bg-slate-800 text-slate-600'
                      }`}>
                        {completed ? <Check size={18} /> : unlocked ? idx + 1 : <Lock size={16} />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {!unlocked && (
                            <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock size={10} /> Trả phí
                            </span>
                          )}
                          {completed && (
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Đã học</span>
                          )}
                          {unlocked && idx < FREE_LESSON_COUNT && !completed && (
                            <span className="text-[10px] font-bold bg-[#00d2a0]/20 text-[#00d2a0] px-2 py-0.5 rounded-full">🆓 Miễn phí</span>
                          )}
                        </div>
                        <h3 className={`font-bold text-sm ${completed ? 'text-emerald-300' : unlocked ? 'text-white' : 'text-slate-500'}`}>
                          Bài {idx + 1}: {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            {getLessonIcon(lesson.lesson_sections)}
                            <span>{(lesson.lesson_sections?.length || 0)} phần</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock size={11} />
                            <span>{lesson.estimated_minutes || 30} phút</span>
                          </span>
                        </div>
                      </div>

                      <ChevronRight size={18} className={`text-slate-600 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Expanded sections */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-1">
                            {(lesson.lesson_sections || []).map((section: any, si: number) => (
                              <div key={section.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                                <div className="flex items-center gap-3">
                                  {section.content_type === 'video' ? <Play size={13} className="text-[#00d2a0]" /> :
                                    section.content_type === 'quiz' ? <HelpCircle size={13} className="text-orange-400" /> :
                                      section.content_type === 'image' ? <Eye size={13} className="text-purple-400" /> :
                                        <FileText size={13} className="text-blue-400" />}
                                  <span className="text-xs text-slate-400">{section.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-600 uppercase">{section.content_type}</span>
                              </div>
                            ))}
                            <Link
                              href={`/courses/${courseId}/lessons/${lesson.id}`}
                              className="flex items-center justify-center gap-2 mt-3 py-2.5 bg-[#00d2a0]/10 hover:bg-[#00d2a0]/20 text-[#00d2a0] text-sm font-bold rounded-xl transition-all"
                            >
                              {completed ? '📖 Học lại' : '🎬 Bắt đầu học'} <ChevronRight size={16} />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Testimonials */}
            <div className="mt-16">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Quote size={20} className="text-[#00d2a0]" /> Học viên nói gì về khóa học
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Nguyễn Văn A', role: 'Học sinh THPT', text: 'Sau 3 bài đầu đã hiểu rõ phần cứng, quyết định mua khóa học và không hối hận!', stars: 5 },
                  { name: 'Trần Thị B', role: 'Sinh viên CNTT', text: 'Phần thực hành build PC rất chi tiết. Mình đã tự build được PC đầu tiên nhờ khóa học này.', stars: 5 },
                  { name: 'Lê Văn C', role: 'Kỹ thuật viên IT', text: 'Kiến thức ngành nghề rất hữu ích, giúp mình định hướng được con đường sự nghiệp.', stars: 4 },
                  { name: 'Phạm Thị D', role: 'Giáo viên Tin học', text: 'Tôi dùng khóa học này để dạy học sinh, nội dung bám sát thực tế và rất trực quan.', stars: 5 },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5"
                  >
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.stars }).map((_, si) => (
                        <Star key={si} size={14} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d2a0] to-emerald-500 flex items-center justify-center text-xs font-bold text-black">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── SIDEBAR ─── */}
          <div className="lg:w-[300px] shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Course stats card */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <h4 className="text-sm font-bold mb-4">Thông tin khóa học</h4>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: BarChart3, label: 'Trình độ', value: course.level || 'Cơ bản' },
                    { icon: Clock, label: 'Thời lượng', value: `${course.total_hours || 8} giờ` },
                    { icon: Layers, label: 'Bài học', value: `${lessons.length} bài` },
                    { icon: Users, label: 'Học viên', value: `${(course.student_count || 1247).toLocaleString('vi-VN')}` },
                    { icon: Award, label: 'Chứng chỉ', value: 'Có (PDF + QR)' },
                    { icon: Star, label: 'Đánh giá', value: `${course.rating || 4.8}/5` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-400">
                        <item.icon size={14} className="text-[#00d2a0]" /> {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA mini */}
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-4 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black font-extrabold text-base rounded-xl hover:from-emerald-400 hover:to-[#00d2a0] transition-all shadow-lg shadow-[#00d2a0]/25 flex items-center justify-center gap-2"
              >
                <Crown size={20} /> MUA NGAY - {formatPrice(DISCOUNT_PRICE)}
              </button>

              <div className="text-center text-xs text-slate-500">
                <ShieldCheck size={14} className="inline mr-1 text-[#00d2a0]" />
                Thanh toán an toàn qua VNPay/Momo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PAYMENT OVERLAY ─── */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#12122a] border border-[#00d2a0]/20 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                <button
                  onClick={() => setShowPayment(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d2a0] to-emerald-500 flex items-center justify-center">
                    <Crown size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mở khóa toàn bộ khóa học</h3>
                    <p className="text-xs text-slate-400">Tiếp tục hành trình chinh phục phần cứng máy tính</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Pricing */}
                <div className="bg-gradient-to-r from-[#00d2a0]/10 to-emerald-500/10 border border-[#00d2a0]/20 rounded-2xl p-5">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm text-slate-300">Giá khóa học</span>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-2xl font-black text-white">{formatPrice(DISCOUNT_PRICE)}</span>
                        <span className="text-sm text-slate-500 line-through">{formatPrice(ORIGINAL_PRICE)}</span>
                      </div>
                      <span className="text-xs text-red-400">🔥 Tiết kiệm {formatPrice(ORIGINAL_PRICE - DISCOUNT_PRICE)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    {[
                      'Học mọi lúc, mọi nơi, trọn đời',
                      '12 bài giảng chuyên sâu + thực hành Lab',
                      'Chứng chỉ hoàn thành PDF + QR xác thực',
                      'Hỗ trợ AI Guru 24/7',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-[#00d2a0]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment methods */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Phương thức thanh toán</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: '💳', name: 'Thẻ ATM/Visa' },
                      { icon: '📱', name: 'Momo' },
                      { icon: '🏦', name: 'VNPay' },
                    ].map((method, i) => (
                      <button
                        key={i}
                        className="flex flex-col items-center gap-2 py-4 px-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-[#00d2a0]/30 transition-all"
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="w-full py-4 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black font-extrabold text-base rounded-xl hover:from-emerald-400 hover:to-[#00d2a0] transition-all shadow-lg shadow-[#00d2a0]/25 flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Crown size={20} /> XÁC NHẬN THANH TOÁN - {formatPrice(DISCOUNT_PRICE)}
                </button>

                {/* Trust */}
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Shield size={12} /> Bảo mật tuyệt đối</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> Nhận quyền truy cập ngay</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
