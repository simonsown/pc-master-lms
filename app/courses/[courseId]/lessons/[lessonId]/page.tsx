'use client'

import React, { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Clock, FileText, Play, CheckCircle, Circle,
  Lock, Crown, Star, ChevronRight, Loader2, X, Shield, Zap,
  BookOpen, Video, Image as ImageIcon, FileSearch, HelpCircle
} from 'lucide-react'

const FREE_LESSON_COUNT = 3
const DISCOUNT_PRICE = 199000

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

function getYouTubeEmbed(url: string) {
  if (!url) return ''
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(reg)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1` : ''
}

function getDriveEmbed(url: string) {
  if (!url) return ''
  const id = url.match(/\/d\/(.+?)\//)?.[1]
  return id ? `https://drive.google.com/file/d/${id}/preview` : ''
}

function SimpleMarkdown({ text }: { text: string }) {
  const html = (text || '')
    .replace(/^### (.+)$/gm, '<h3 style="color:#00d2a0;font-size:1.1rem;margin:16px 0 8px;font-weight:700">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#00d2a0;font-size:1.25rem;margin:20px 0 10px;font-weight:700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:white;font-size:1.5rem;margin:24px 0 12px;font-weight:800">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#00d2a0">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#94a3b8">$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:6px 0;color:#94a3b8">$1</li>')
    .replace(/^\|(.+)\|$/gm, (m: string) => {
      const cells = m.split('|').filter(Boolean)
      if (cells.every(c => c.includes('-'))) return '<hr style="border-color:#1e1e3a;margin:8px 0" />'
      return `<tr>${cells.map(c => `<td style="padding:8px 12px;border:1px solid #1e1e3a;color:#94a3b8;font-size:0.85rem">${c.trim()}</td>`).join('')}</tr>`
    })
    .replace(/> (.+)$/gm, '<blockquote style="border-left:3px solid #00d2a0;padding:8px 16px;margin:12px 0;background:#00d2a0/05;border-radius:8px;color:#94a3b8;font-style:italic">$1</blockquote>')
    .replace(/\n/g, '<br/>')
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem' }} />
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = use(params)
  const { courseId, lessonId } = resolvedParams

  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const { data: c } = await supabase.from('courses').select('*').eq('id', courseId).single()
      setCourse(c)

      const { data: l } = await supabase
        .from('lessons')
        .select('*, lesson_sections(*)')
        .eq('id', lessonId)
        .single()
      setLesson(l)

      const { data: allL } = await supabase
        .from('lessons')
        .select('id, title, created_at')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
      setAllLessons(allL || [])

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
          .select('*')
          .eq('student_id', u.id)
          .eq('lesson_id', lessonId)
          .single()
        setIsCompleted(prog?.status === 'completed')
      }

      setLoading(false)
    }
    fetchAll()
  }, [courseId, lessonId])

  const lessonIndex = allLessons.findIndex(l => l.id === lessonId)
  const isFree = lessonIndex < FREE_LESSON_COUNT
  const isUnlocked = isFree || hasPurchased || !user

  const handleComplete = async () => {
    if (!user || !isUnlocked) return
    setCompleting(true)
    const newStatus = !isCompleted
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: user.id,
        lesson_id: lessonId,
        status: newStatus ? 'completed' : 'not_started',
        completion_percentage: newStatus ? 100 : 0,
        last_accessed: new Date().toISOString(),
        completed_at: newStatus ? new Date().toISOString() : null,
      }, { onConflict: 'student_id,lesson_id' })

    if (!error) {
      setIsCompleted(newStatus)
    }
    setCompleting(false)
  }

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#00d2a0]" size={48} />
    </div>
  )

  if (!lesson || !course) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-red-400 font-bold">
      Bài học không tồn tại.
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0a0a14]/95 backdrop-blur border-b border-[#1e1e3a]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            <span>Quay lại khóa học</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Bài {lessonIndex + 1}/{allLessons.length}</span>
            {!isFree && !hasPurchased && (
              <button onClick={() => setShowPayment(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black px-3 py-1.5 rounded-lg font-bold text-xs">
                <Crown size={12} /> Mua khóa học
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UNLOCKED CONTENT */}
      {isUnlocked ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold bg-[#1e1e3a] text-slate-400 px-2.5 py-1 rounded-full">
                Bài {lessonIndex + 1} / {allLessons.length}
              </span>
              {isFree && (
                <span className="text-[11px] font-bold bg-[#00d2a0]/20 text-[#00d2a0] px-2.5 py-1 rounded-full">🆓 Miễn phí</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-2">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-slate-400 text-sm mb-6">{lesson.description}</p>
            )}
            <div className="h-0.5 w-12 bg-gradient-to-r from-[#00d2a0] to-emerald-500 rounded-full mb-8" />
          </motion.div>

          {/* Sections */}
          <div className="space-y-10">
            {(lesson.lesson_sections || []).map((section: any, i: number) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                id={`sec-${section.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#00d2a0]/10 text-[#00d2a0] flex items-center justify-center">
                    {section.content_type === 'video' && <Play size={15} />}
                    {section.content_type === 'text' && <FileText size={15} />}
                    {section.content_type === 'image' && <ImageIcon size={15} />}
                    {section.content_type === 'quiz' && <HelpCircle size={15} />}
                    {section.content_type === 'pdf' && <FileSearch size={15} />}
                  </div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                </div>

                {section.content_type === 'video' && section.content_url && (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {getYouTubeEmbed(section.content_url) ? (
                      <iframe src={getYouTubeEmbed(section.content_url)} className="w-full h-full border-none" allowFullScreen />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                        <Play size={48} />
                      </div>
                    )}
                  </div>
                )}

                {section.content_type === 'image' && section.content_url && (
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={section.content_url} className="w-full h-auto" />
                  </div>
                )}

                {section.content_type === 'text' && section.content_body && (
                  <div className="bg-[#12122a] border border-[#1e1e3a] rounded-2xl p-6 md:p-8 shadow-lg">
                    <SimpleMarkdown text={section.content_body} />
                  </div>
                )}

                {section.content_type === 'pdf' && section.content_url && (
                  <div className="rounded-2xl overflow-hidden border border-[#1e1e3a] bg-[#12122a]">
                    {getDriveEmbed(section.content_url) ? (
                      <iframe src={getDriveEmbed(section.content_url)} className="w-full h-[500px] border-none" />
                    ) : (
                      <div className="p-8 text-center text-slate-500">PDF preview</div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Complete button */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 pt-8 border-t border-[#1e1e3a] flex flex-col items-center gap-4"
            >
              <button
                onClick={handleComplete}
                disabled={completing}
                className={`px-10 py-4 rounded-2xl font-extrabold text-base flex items-center gap-3 transition-all shadow-xl ${isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 shadow-emerald-500/10'
                    : 'bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black shadow-[#00d2a0]/25 hover:shadow-[#00d2a0]/40'
                  }`}
              >
                {completing ? <Loader2 className="animate-spin" size={22} /> :
                  isCompleted ? <><CheckCircle size={22} /> Đã hoàn thành</> :
                    <><Circle size={22} /> Đánh dấu hoàn thành</>}
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {prevLesson ? (
              <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ChevronRight size={16} className="rotate-180" /> Bài trước
              </Link>
            ) : <div />}
            <Link href={`/courses/${courseId}`}
              className="text-sm text-[#00d2a0] hover:underline">
              Danh sách bài học
            </Link>
            {nextLesson ? (
              <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                Bài sau <ChevronRight size={16} />
              </Link>
            ) : <div />}
          </div>
        </div>
      ) : (
        /* ─── LOCKED CONTENT ─── */
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#12122a] border border-[#1e1e3a] rounded-3xl p-10 shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00d2a0]/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-[#00d2a0]/20">
              <Lock size={36} className="text-[#00d2a0]" />
            </div>
            <h2 className="text-2xl font-black mb-3">Bài học đã bị khóa</h2>
            <p className="text-slate-400 text-sm mb-2">
              Bạn đã xem hết {FREE_LESSON_COUNT} bài miễn phí. Mua khóa học để truy cập toàn bộ nội dung!
            </p>
            <p className="text-slate-500 text-xs mb-8">
              Bài {lessonIndex + 1}: {lesson.title}
            </p>

            <div className="bg-[#00d2a0]/5 border border-[#00d2a0]/10 rounded-2xl p-5 mb-8 text-left">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm text-slate-400">Giá khóa học</span>
                <span className="text-2xl font-black text-white">{formatPrice(DISCOUNT_PRICE)}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                {[
                  'Mở khóa tất cả 12 bài học',
                  '8+ giờ video hướng dẫn chi tiết',
                  'Thực hành trên PC Builder Lab',
                  'Chứng chỉ hoàn thành (PDF + QR)',
                  'AI Guru hỗ trợ 24/7',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#00d2a0]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-4 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black font-extrabold text-base rounded-xl hover:from-emerald-400 hover:to-[#00d2a0] transition-all shadow-lg shadow-[#00d2a0]/25 flex items-center justify-center gap-2 mb-4"
            >
              <Crown size={20} /> MUA NGAY - {formatPrice(DISCOUNT_PRICE)}
            </button>

            <Link href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Quay lại khóa học
            </Link>
          </motion.div>
        </div>
      )}

      {/* ─── PAYMENT MODAL ─── */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-4"
          onClick={() => setShowPayment(false)}>
          <div className="bg-[#12122a] border border-[#00d2a0]/20 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00d2a0] to-emerald-500 flex items-center justify-center">
                  <Crown size={20} className="text-black" />
                </div>
                <h3 className="font-bold">Mở khóa khóa học</h3>
              </div>
              <button onClick={() => setShowPayment(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-r from-[#00d2a0]/10 to-emerald-500/10 border border-[#00d2a0]/20 rounded-2xl p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-400">Giá</span>
                  <span className="text-2xl font-black">{formatPrice(DISCOUNT_PRICE)}</span>
                </div>
                <div className="mt-2 space-y-1.5 text-sm text-slate-300">
                  {[
                    'Toàn bộ 12 bài giảng',
                    'Thực hành Lab + Chứng chỉ',
                    'Học trọn đời',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#00d2a0]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-[#00d2a0] to-emerald-500 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00d2a0]/25">
                <Crown size={20} /> XÁC NHẬN THANH TOÁN
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Shield size={12} /> Bảo mật</span>
                <span className="flex items-center gap-1"><Zap size={12} /> Truy cập ngay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
