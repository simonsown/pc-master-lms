'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, ChevronRight, BookOpen, FileText, Video, Image as ImageIcon, Link2, Eye, Plus, Trash2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase-ssr-client'

type SectionInput = {
  id: string
  title: string
  type: 'video' | 'text' | 'image' | 'pdf'
  content: string
}

export default function CreateLessonPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('Tin học')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [sections, setSections] = useState<SectionInput[]>([])

  const addSection = () => {
    setSections(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      title: '',
      type: 'text',
      content: '',
    }])
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const updateSection = (id: string, field: keyof SectionInput, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề bài giảng'); return }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Bạn chưa đăng nhập'); setLoading(false); return }

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim(),
        subject,
        estimated_minutes: estimatedMinutes,
        is_published: false,
      })
      .select()
      .single()

    if (lessonError || !lesson) {
      setError(lessonError?.message || 'Không thể tạo bài giảng')
      setLoading(false)
      return
    }

    if (sections.length > 0) {
      const { error: sectionsError } = await supabase.from('lesson_sections').insert(
        sections.map((s, idx) => ({
          lesson_id: lesson.id,
          title: s.title || `Mục ${idx + 1}`,
          type: s.type,
          content_type: s.type,
          content: s.content,
          order_index: idx,
        }))
      )
      if (sectionsError) {
        console.error('Sections error:', sectionsError)
      }
    }

    setLoading(false)
    router.push(`/teacher/lessons/${lesson.id}?created=true`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link
        href="/teacher/lessons"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Quay lại
      </Link>

      <div className="rounded-2xl p-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Tạo bài giảng mới</h1>

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tiêu đề *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                placeholder="VD: Giới thiệu về CPU"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Mô tả</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors resize-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                placeholder="Mô tả ngắn về bài giảng..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Môn học</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option>Tin học</option>
                  <option>Tin học - Lắp ráp PC</option>
                  <option>Khoa học máy tính</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Thời lượng (phút)</label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(Number(e.target.value))}
                  min={5}
                  max={300}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nội dung bài giảng</span>
              <button
                onClick={addSection}
                className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}
              >
                <Plus size={16} /> Thêm mục
              </button>
            </div>

            {sections.length === 0 && (
              <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
                <FileText size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chưa có mục nội dung nào. Nhấn "Thêm mục" để bắt đầu.</p>
              </div>
            )}

            {sections.map((s, idx) => (
              <div key={s.id} className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Mục {idx + 1}</span>
                  <div className="flex gap-1 ml-auto">
                    {(['video', 'text', 'image', 'pdf'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => updateSection(s.id, 'type', type)}
                        className="p-1.5 rounded-lg text-xs transition-colors"
                        style={{
                          background: s.type === type ? 'var(--brand-primary)' : 'transparent',
                          color: s.type === type ? '#000' : 'var(--text-muted)',
                        }}
                        title={type}
                      >
                        {type === 'video' && <Video size={14} />}
                        {type === 'text' && <FileText size={14} />}
                        {type === 'image' && <ImageIcon size={14} />}
                        {type === 'pdf' && <Link2 size={14} />}
                      </button>
                    ))}
                    <button onClick={() => removeSection(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <input
                  value={s.title}
                  onChange={e => updateSection(s.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Tiêu đề mục..."
                />
                <div style={{ minHeight: '100px' }}>
                  {s.type === 'text' ? (
                    <textarea
                      value={s.content}
                      onChange={e => updateSection(s.id, 'content', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      placeholder="Nội dung markdown..."
                    />
                  ) : (
                    <input
                      value={s.content}
                      onChange={e => updateSection(s.id, 'content', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      placeholder={s.type === 'video' ? 'URL YouTube...' : s.type === 'image' ? 'URL hình ảnh...' : 'URL PDF...'}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 border border-red-500/20" style={{ color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
              Quay lại
            </button>
          ) : <div />}

          {step < 2 ? (
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5" style={{ background: 'var(--brand-primary)', color: '#000' }}>
              Tiếp theo <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background: 'var(--brand-primary)', color: '#000' }}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
              {loading ? 'Đang tạo...' : 'Tạo bài giảng (Draft)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
