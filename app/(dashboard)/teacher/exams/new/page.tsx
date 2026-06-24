'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Upload, FileText } from 'lucide-react'
import { createExam, addQuestionToExam } from '@/app/actions/exam'
import { parseDocx } from '@/utils/word-parser'

export default function NewExamPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadingWord, setUploadingWord] = useState(false)
  const [wordFileName, setWordFileName] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: '',
    lessonId: '',
    timeLimitMinutes: 45,
    passingScore: 70,
    maxAttempts: 3,
    requireCamera: false,
    availableFrom: '',
    availableUntil: ''
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [questionInput, setQuestionInput] = useState({
    content: '',
    type: 'single_choice' as string,
    points: 10,
    difficulty: 'medium',
    explanation: '',
    options: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }]
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('classes').select('*').eq('teacher_id', user.id).then(({ data }) => setClasses(data || []))
      supabase.from('lessons').select('*').eq('teacher_id', user.id).then(({ data }) => setLessons(data || []))
    })
  }, [])

  function addOption() {
    setQuestionInput(prev => ({ ...prev, options: [...prev.options, { content: '', isCorrect: false }] }))
  }
  function removeOption(i: number) {
    setQuestionInput(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))
  }
  function setOption(index: number, field: string, value: any) {
    setQuestionInput(prev => {
      const opts = [...prev.options]
      opts[index] = { ...opts[index], [field]: value }
      return { ...prev, options: opts }
    })
  }
  function setCorrectOption(index: number) {
    setQuestionInput(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    }))
  }

  function addCurrentQuestion() {
    const q = questionInput
    if (!q.content.trim()) { alert('Nhập nội dung câu hỏi'); return }
    const validOptions = q.options.filter(o => o.content.trim())
    if (q.type !== 'fill_blank' && validOptions.length < 2) { alert('Cần ít nhất 2 đáp án'); return }
    if (!validOptions.some(o => o.isCorrect)) { alert('Chọn đáp án đúng'); return }
    setQuestions(prev => [...prev, { ...q, options: validOptions, id: `temp_${Date.now()}` }])
    setQuestionInput({
      content: '', type: 'single_choice', points: 10, difficulty: 'medium', explanation: '',
      options: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }]
    })
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function handleWordUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.docx')) { alert('Chỉ hỗ trợ file .docx'); return }
    setUploadingWord(true)
    setWordFileName(file.name)
    try {
      const { questions: parsed } = await parseDocx(file)
      if (parsed.length === 0) { alert('Không tìm thấy câu hỏi trong file. Đảm bảo định dạng: "1. Nội dung câu hỏi" và "A. Đáp án"'); return }
      setQuestions(prev => [...prev, ...parsed.map((q, i) => ({ ...q, id: `word_${Date.now()}_${i}` }))])
      alert(`Đã nhập ${parsed.length} câu hỏi từ file Word!`)
    } catch (err: any) {
      alert('Lỗi đọc file: ' + err.message)
    } finally {
      setUploadingWord(false)
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Nhập tên đề thi'); return }
    if (!form.classId) { alert('Chọn lớp học'); return }
    if (questions.length === 0) { alert('Thêm ít nhất 1 câu hỏi'); return }
    setSaving(true)
    try {
      const exam = await createExam({
        title: form.title,
        description: form.description,
        classId: form.classId,
        lessonId: form.lessonId || undefined,
        timeLimitMinutes: form.timeLimitMinutes,
        passingScore: form.passingScore,
        maxAttempts: form.maxAttempts,
        requireCamera: form.requireCamera,
        availableFrom: form.availableFrom || undefined,
        availableUntil: form.availableUntil || undefined
      })

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await addQuestionToExam({
          examId: exam.id,
          content: q.content,
          type: q.type,
          points: q.points,
          difficulty: q.difficulty,
          explanation: q.explanation,
          options: q.options
        })
      }

      router.push(`/teacher/exams/${exam.id}`)
    } catch (e: any) {
      alert('Lỗi: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <button onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Tạo đề thi <span style={{ color: 'var(--brand-primary)' }}>mới</span></h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="lms-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Thông tin đề thi</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Tên đề thi *" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả (hiển thị cho học sinh)" rows={3} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical' }} />

              <select value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
                <option value="">-- Chọn lớp học * --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>

              <select value={form.lessonId} onChange={e => setForm(p => ({ ...p, lessonId: e.target.value }))}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
                <option value="">-- Gắn với bài giảng (không bắt buộc) --</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Thời gian (phút)</label>
                  <input type="number" value={form.timeLimitMinutes} onChange={e => setForm(p => ({ ...p, timeLimitMinutes: +e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Điểm đạt (%)</label>
                  <input type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Mở từ ngày (tùy chọn)</label>
                  <input type="datetime-local" value={form.availableFrom} onChange={e => setForm(p => ({ ...p, availableFrom: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Đến ngày (tùy chọn)</label>
                  <input type="datetime-local" value={form.availableUntil} onChange={e => setForm(p => ({ ...p, availableUntil: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '100%' }} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={form.requireCamera} onChange={e => setForm(p => ({ ...p, requireCamera: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }} />
                Yêu cầu bật camera khi thi (giám sát AI)
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="lms-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Thêm câu hỏi</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={questionInput.content} onChange={e => setQuestionInput(p => ({ ...p, content: e.target.value }))}
                placeholder="Nội dung câu hỏi" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select value={questionInput.type} onChange={e => setQuestionInput(p => ({ ...p, type: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  <option value="single_choice">Trắc nghiệm 1 đáp án</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="fill_blank">Điền khuyết</option>
                  <option value="multiple_choice">Nhiều đáp án</option>
                </select>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" value={questionInput.points} onChange={e => setQuestionInput(p => ({ ...p, points: +e.target.value }))}
                    placeholder="Điểm" style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '100%' }} />
                </div>
              </div>

              {questionInput.type !== 'fill_blank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {questionInput.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => setCorrectOption(i)}
                        style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      <input value={opt.content} onChange={e => setOption(i, 'content', e.target.value)}
                        placeholder={`Đáp án ${i + 1}`} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                      {questionInput.options.length > 2 && (
                        <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addOption} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px dashed var(--border-default)', borderRadius: '10px', padding: '8px', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '12px', justifyContent: 'center' }}>
                    <Plus size={14} /> Thêm đáp án
                  </button>
                </div>
              )}

              {questionInput.type === 'fill_blank' && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Câu điền khuyết: học sinh gõ đáp án, so khớp chính xác (không phân biệt hoa thường)
                </div>
              )}

              <textarea value={questionInput.explanation} onChange={e => setQuestionInput(p => ({ ...p, explanation: e.target.value }))}
                placeholder="Giải thích (hiện sau khi học sinh trả lời)" rows={2}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical' }} />

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Upload size={14} style={{ color: 'var(--brand-primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Nhập từ file Word (.docx)</span>
                </div>
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '10px',
                  background: uploadingWord ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
                  border: '1px dashed rgba(99,102,241,0.3)',
                  cursor: uploadingWord ? 'wait' : 'pointer', fontSize: '13px', fontWeight: 500,
                  color: 'var(--brand-primary)', transition: 'all 0.2s'
                }}>
                  {uploadingWord ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</>
                  ) : (
                    <><Upload size={16} /> Chọn file .docx (định dạng như Azota)</>
                  )}
                  <input type="file" accept=".docx" onChange={handleWordUpload} style={{ display: 'none' }} disabled={uploadingWord} />
                </label>
                {wordFileName && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} /> {wordFileName}
                  </div>
                )}
              </div>

              <button onClick={addCurrentQuestion}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                <Plus size={16} /> Thêm câu hỏi vào đề thi
              </button>
            </div>
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="lms-card" style={{ padding: '24px', marginTop: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Danh sách câu hỏi ({questions.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--brand-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>{q.content}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{q.points}đ</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 600 }}>{q.type === 'single_choice' ? 'TN' : q.type === 'true_false' ? 'Đ/S' : q.type === 'fill_blank' ? 'ĐK' : 'NN'}</span>
                <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
        <button onClick={() => router.back()}
          style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          Hủy
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', borderRadius: '12px', background: 'var(--brand-primary)', border: 'none', color: '#000', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
          {saving ? 'Đang lưu...' : 'Lưu đề thi'}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
