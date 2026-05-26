'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video, FileText, Image as ImageIcon, FileSearch, ChevronRight,
  CheckCircle, Clock, Play, BookOpen
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { saveLessonProgress } from '@/lib/lesson-actions'

interface Section {
  id: string
  title: string
  type: string
  content: string
  order_index: number
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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' })
  }

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
                    <ReactMarkdown>{s.content}</ReactMarkdown>
                  </div>
                )}

                {s.type === 'image' && (
                  <img src={s.content} alt={s.title} className="w-full rounded-xl" loading="lazy" />
                )}

                {s.type === 'pdf' && getDriveEmbed(s.content) && (
                  <iframe
                    src={getDriveEmbed(s.content)}
                    className="w-full h-[500px] rounded-xl border-0"
                    title={s.title}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

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
