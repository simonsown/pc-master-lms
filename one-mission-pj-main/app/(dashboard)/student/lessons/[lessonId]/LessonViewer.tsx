'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Video, FileText, Image as ImageIcon, FileSearch, Code, ChevronRight,
  CheckCircle, Clock, Play, BookOpen, HelpCircle, ExternalLink
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { saveLessonProgress } from '@/lib/lesson-actions'
import { getKeyQuestions } from '@/data/key-questions'
import { QUIZ_BANK } from '@/data/quiz-bank'

const EXTRA_VIDEOS: Record<string, { title: string; id: string }[]> = {
  'cpu': [
    { title: 'CPU là gì? - Giải thích chi tiết', id: 'cWzB7GvN6vs' },
    { title: 'Cách chọn CPU phù hợp', id: '7j3I7X7Gz6M' },
  ],
  'mainboard': [
    { title: 'Bo mạch chủ là gì?', id: 'Q_sBq0-iV4I' },
  ],
  'ram': [
    { title: 'RAM là gì? Giải thích DDR4 vs DDR5', id: 'qTQ7vg1JFDA' },
  ],
  'gpu': [
    { title: 'Card đồ họa (GPU) hoạt động thế nào?', id: 'OQ6fMGMiVPE' },
  ],
  'ổ cứng': [
    { title: 'SSD vs HDD - Nên chọn loại nào?', id: 'YQEjGKYXjw8' },
  ],
  'nguồn': [
    { title: 'Nguồn máy tính (PSU) - Hướng dẫn chọn', id: 'Pco0vPjV0wk' },
  ],
  'case': [
    { title: 'Case máy tính - Các loại và cách chọn', id: 'O8HQzP3QwL8' },
  ],
}

interface Section {
  id: string
  title: string
  type: string
  content: string
  order_index: number
  source?: string
}

interface Lesson {
  id: string
  title: string
  description: string
  estimated_minutes?: number
}

interface Progress {
  is_completed?: boolean
  completion_percentage?: number
  time_spent_seconds?: number
}

export default function LessonViewer({
  lesson, sections, initialProgress, userId,
}: {
  lesson: Lesson
  sections: Section[]
  initialProgress: Progress | null
  userId: string
}) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')
  const [completed, setCompleted] = useState(initialProgress?.is_completed || false)
  const [timeSpent, setTimeSpent] = useState(initialProgress?.time_spent_seconds || 0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      setTimeSpent(prev => {
        const newTime = prev + 30
        saveLessonProgress(lesson.id, 0, false)
        return newTime
      })
    }, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [lesson.id])

  const handleComplete = useCallback(async () => {
    setCompleted(true)
    await saveLessonProgress(lesson.id, 100, true)
    router.refresh()
  }, [lesson.id, router])

  const getYouTubeEmbed = (url: string) => {
    if (!url) return ''
    const id = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    )?.[1]
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : ''
  }

  const getDriveEmbed = (url: string) => {
    if (!url) return ''
    const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1]
    return id ? `https://drive.google.com/file/d/${id}/preview` : ''
  }

  const getPdfEmbedUrl = (url: string) => {
    if (!url) return ''
    const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1]
    if (id) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`
      return `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`
    }
    return url
  }

  const parseRichContent = (content: string) => {
    const parts: { type: 'markdown' | 'video' | 'pdf', content?: string, url?: string }[] = []
    const regex = /<div class="(video-embed|pdf-embed)">([\s\S]*?)<\/div>/g
    let lastIndex = 0, match
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push({ type: 'markdown', content: content.substring(lastIndex, match.index) })
      parts.push({ type: match[1] === 'video-embed' ? 'video' : 'pdf', url: match[2].trim() })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < content.length) parts.push({ type: 'markdown', content: content.substring(lastIndex) })
    if (parts.length === 0) parts.push({ type: 'markdown', content })
    return parts
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' })
  }

  const keyQuestions = getKeyQuestions(lesson.title)
  const relatedQuizzes = QUIZ_BANK.filter(q => q.lessonTitle === lesson.title && q.questions.length > 0)
  const [showKeyQuestions, setShowKeyQuestions] = useState(false)

  if (sections.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Bài giảng chưa có nội dung.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>
          {lesson.estimated_minutes && (
            <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={13} /> ~{lesson.estimated_minutes} phút
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <div
              key={s.id}
              ref={(el) => { sectionRefs.current[s.id] = el }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  {s.type === 'video' && <Video size={18} style={{ color: 'var(--brand-primary)' }} />}
                  {s.type === 'text' && <FileText size={18} style={{ color: 'var(--brand-primary)' }} />}
                  {s.type === 'image' && <ImageIcon size={18} style={{ color: 'var(--brand-primary)' }} />}
                  {s.type === 'pdf' && <FileSearch size={18} style={{ color: 'var(--brand-primary)' }} />}
                  {s.type === 'embed' && <Code size={18} style={{ color: 'var(--brand-primary)' }} />}
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
              </div>

              <div className="px-6 pb-6">
                {s.type === 'video' && getYouTubeEmbed(s.content) && (
                  <div className="aspect-video rounded-xl overflow-hidden" style={{ background: '#000' }}>
                    <iframe
                      src={getYouTubeEmbed(s.content)}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                      title={s.title}
                    />
                  </div>
                )}

                {s.type === 'text' && (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {parseRichContent(s.content).map((part, i) => {
                      if (part.type === 'video') {
                        const embedUrl = getYouTubeEmbed(part.url!)
                        return embedUrl ? (
                          <div key={i} className="aspect-video rounded-xl overflow-hidden my-4" style={{ background: '#000' }}>
                            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Video" loading="lazy" />
                          </div>
                        ) : null
                      }
                      if (part.type === 'pdf') {
                        const embedUrl = getPdfEmbedUrl(part.url!)
                        return embedUrl ? (
                          <div key={i} className="my-4 rounded-xl overflow-hidden" style={{ background: '#0a0f1a', border: '1px solid var(--border-subtle)' }}>
                            <iframe src={embedUrl} className="w-full h-[500px] border-0" title="PDF" loading="lazy" />
                          </div>
                        ) : null
                      }
                      return <ReactMarkdown key={i}>{part.content!}</ReactMarkdown>
                    })}
                  </div>
                )}

                {s.type === 'image' && (
                  <img src={s.content} alt={s.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }} loading="lazy" />
                )}

                {s.type === 'pdf' && getPdfEmbedUrl(s.content) && (
                  <iframe
                    src={getPdfEmbedUrl(s.content)}
                    className="w-full h-[500px] rounded-xl border-0"
                    title={s.title}
                    loading="lazy"
                  />
                )}

                {s.type === 'embed' && s.content && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                    <div dangerouslySetInnerHTML={{ __html: s.content }} />
                  </div>
                )}

                {s.source && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen size={12} /> Nguồn: {s.source}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(() => {
          const matchKey = Object.keys(EXTRA_VIDEOS).find(k => lesson.title.toLowerCase().includes(k))
          const videos = matchKey ? EXTRA_VIDEOS[matchKey] : null
          if (!videos) return null
          return (
            <div className="rounded-2xl mt-8 p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={16} style={{ color: '#ef4444' }} />
                </span>
                Video kiến thức mở rộng
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {videos.map((v, i) => (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                      <iframe src={`https://www.youtube-nocookie.com/embed/${v.id}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title={v.title} loading="lazy" />
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', margin: 0 }}>{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div className="rounded-2xl overflow-hidden mt-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowKeyQuestions(!showKeyQuestions)}
            className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <HelpCircle size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Câu hỏi trọng tâm ({keyQuestions.length})
              </span>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)', transform: showKeyQuestions ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showKeyQuestions && (
            <div className="px-6 pb-6 space-y-4">
              {keyQuestions.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có câu hỏi trọng tâm cho bài này.</p>
              ) : (
                keyQuestions.map((kq, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--brand-primary)' }}>Q{i + 1}.</span> {kq.q}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{kq.a}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {relatedQuizzes.length > 0 && (
          <div className="rounded-2xl mt-6 p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Bài kiểm tra liên quan</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {relatedQuizzes.map(q => (
                <Link
                  key={q.id}
                  href={`/student/quiz/${q.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}
                >
                  <ExternalLink size={14} />
                  {q.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="sticky bottom-6 mt-8 flex justify-center">
          <button
            onClick={handleComplete}
            disabled={completed}
            className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg disabled:opacity-60"
            style={{
              background: completed ? 'var(--bg-elevated)' : 'var(--brand-primary)',
              color: completed ? 'var(--text-secondary)' : '#000',
              border: completed ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            {completed ? (
              <><CheckCircle size={18} /> Đã hoàn thành</>
            ) : (
              <><Play size={18} /> Đánh dấu hoàn thành</>
            )}
          </button>
        </div>
      </div>

      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="sticky top-6 rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-xs font-bold uppercase mb-4 tracking-wider" style={{ color: 'var(--text-muted)' }}>Nội dung</h3>
          <div className="flex flex-col gap-1.5">
            {sections.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors"
                style={{
                  background: activeSection === s.id ? 'var(--bg-surface)' : 'transparent',
                  color: activeSection === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <span className="text-xs font-bold w-5 shrink-0" style={{ color: 'var(--brand-primary)' }}>{idx + 1}</span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
