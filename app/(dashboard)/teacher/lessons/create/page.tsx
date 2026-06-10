'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, ChevronRight, BookOpen, FileText, Video, Image as ImageIcon, Link2, Code, Eye, Plus, Trash2, GripVertical, Upload, FileSearch } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type SectionInput = {
  id: string
  title: string
  type: 'video' | 'text' | 'image' | 'pdf' | 'embed'
  content: string
}

export default function CreateLessonPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [subject, setSubject] = useState('Tin học')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [category, setCategory] = useState('extended')
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Bạn chưa đăng nhập'); setLoading(false); return }

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        subject,
        category,
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
      if (sectionsError) console.error('Sections error:', sectionsError)
    }

    setLoading(false)
    router.push(`/teacher/lessons/${lesson.id}?created=true`)
  }

  const getYouTubeThumbnail = (url: string) => {
    const id = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1]
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/teacher/lessons" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '24px', color: 'var(--text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Quay lại
      </Link>

      <div className="rounded-2xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Tạo bài giảng mới</h1>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Tiêu đề *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                placeholder="VD: Giới thiệu về CPU" />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Thumbnail (URL ảnh)</label>
              <div style={{ width: '100%', height: '160px', background: 'var(--bg-elevated)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', border: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style=\'color:var(--text-muted)\'>Ảnh lỗi</span>' }} />
                ) : (
                  <Upload size={32} color="var(--text-muted)" />
                )}
              </div>
              <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Mô tả</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                placeholder="Mô tả ngắn về bài giảng..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Môn học</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}>
                  <option>Tin học</option>
                  <option>Tin học - Lắp ráp PC</option>
                  <option>Khoa học máy tính</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Thời lượng (phút)</label>
                <input type="number" value={estimatedMinutes} onChange={e => setEstimatedMinutes(Number(e.target.value))} min={5} max={300}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Danh mục</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'textbook', label: 'Sách Giáo Khoa' },
                  { key: 'extended', label: 'Kiến Thức Mở Rộng' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setCategory(key)}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', border: `2px solid ${category === key ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      background: category === key ? 'rgba(var(--brand-primary-rgb),0.1)' : 'transparent',
                      color: category === key ? 'var(--brand-primary)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit'
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Nội dung bài giảng</span>
              <button onClick={addSection}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, background: 'var(--bg-elevated)', color: 'var(--brand-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                <Plus size={16} /> Thêm mục
              </button>
            </div>

            {sections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', borderRadius: '12px', border: '2px dashed var(--border-default)' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Chưa có mục nội dung nào. Nhấn "Thêm mục" để bắt đầu.</p>
              </div>
            )}

            {sections.map((s, idx) => (
              <div key={s.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Mục {idx + 1}</span>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                    {(['video', 'text', 'image', 'pdf', 'embed'] as const).map(type => (
                      <button key={type} onClick={() => updateSection(s.id, 'type', type)}
                        style={{ padding: '6px', borderRadius: '6px', background: s.type === type ? 'var(--brand-primary)' : 'transparent', color: s.type === type ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                        {type === 'video' && <Video size={14} />}
                        {type === 'text' && <FileText size={14} />}
                        {type === 'image' && <ImageIcon size={14} />}
                        {type === 'pdf' && <Link2 size={14} />}
                        {type === 'embed' && <Code size={14} />}
                      </button>
                    ))}
                    <button onClick={() => removeSection(s.id)} style={{ padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <input value={s.title} onChange={e => updateSection(s.id, 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  placeholder="Tiêu đề mục..." />
                {s.type === 'text' ? (
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      {[
                        { icon: <ImageIcon size={14} />, label: 'Ảnh', getInsert: () => { const u = prompt('URL hình ảnh:'); return u ? `\n\n![Image](${u})\n\n` : null; } },
                        { icon: <Video size={14} />, label: 'Video', getInsert: () => { const u = prompt('URL YouTube:'); return u ? `\n\n<div class="video-embed">${u}</div>\n\n` : null; } },
                        { icon: <FileSearch size={14} />, label: 'PDF', getInsert: () => { const u = prompt('URL Google Drive PDF:'); return u ? `\n\n<div class="pdf-embed">${u}</div>\n\n` : null; } },
                      ].map(({ icon, label, getInsert }) => (
                        <button key={label} type="button" onClick={() => { const ins = getInsert(); if (ins) updateSection(s.id, 'content', s.content + ins); }}
                          style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: 'inherit' }}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                    <textarea value={s.content} onChange={e => updateSection(s.id, 'content', e.target.value)} rows={4}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      placeholder="Nội dung markdown... (dùng nút ở trên để chèn ảnh, video, PDF)" />
                  </div>
                ) : (
                  <input value={s.content} onChange={e => updateSection(s.id, 'content', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder={s.type === 'video' ? 'URL YouTube...' : s.type === 'image' ? 'URL hình ảnh...' : s.type === 'embed' ? 'Mã nhúng (iframe)...' : 'URL PDF...'} />
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.2)', color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontFamily: 'inherit' }}>
              Quay lại
            </button>
          ) : <div />}

          {step < 2 ? (
            <button onClick={() => setStep(2)} style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: 'var(--brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              Tiếp theo <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: 'var(--brand-primary)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={16} />}
              {loading ? 'Đang tạo...' : 'Tạo bài giảng (Draft)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
