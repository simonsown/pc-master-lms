'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Users, Clock, Eye, EyeOff, Trash2, Loader2, BarChart3, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { getTeacherExams, publishExam, deleteExam } from '@/app/actions/exam'

export default function TeacherExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadExams = useCallback(async () => {
    setLoading(true)
    const data = await getTeacherExams()
    setExams(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadExams() }, [loadExams])

  async function handlePublish(id: string, publish: boolean) {
    try {
      await publishExam(id, publish)
      loadExams()
    } catch (e: any) { alert(e.message) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa đề thi này? Học sinh sẽ không thể làm bài.')) return
    setDeleting(id)
    try {
      await deleteExam(id)
      loadExams()
    } catch (e: any) { alert(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0' }}>Quản lý <span style={{ color: 'var(--brand-primary)' }}>Đề thi</span></h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tạo đề thi, giao cho lớp và theo dõi kết quả theo thời gian thực</p>
        </div>
        <Link href="/teacher/exams/new"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--brand-primary)', color: '#000', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
          <Plus size={18} /> Tạo đề thi
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
        </div>
      ) : exams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed var(--border-default)', borderRadius: '24px' }}>
          <FileText size={64} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Chưa có đề thi nào</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Tạo đề thi đầu tiên và giao cho lớp học</p>
          <Link href="/teacher/exams/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--brand-primary)', color: '#000', fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={18} /> Tạo đề thi
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {exams.map((exam: any) => (
            <div key={exam.id}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: exam.is_published ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {exam.is_published ? <CheckCircle size={22} style={{ color: '#10b981' }} /> : <XCircle size={22} style={{ color: '#ef4444' }} />}
              </div>

              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => router.push(`/teacher/exams/${exam.id}`)}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{exam.title}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {exam.classes?.name || 'Chưa chọn lớp'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {exam.time_limit_minutes || 45} phút</span>
                  {exam._stats && (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart3 size={14} /> {exam._stats.done}/{exam._stats.total} đã làm</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Điểm TB: {exam._stats.avgScore ? `${exam._stats.avgScore.toFixed(1)}%` : '--'}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => handlePublish(exam.id, !exam.is_published)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'transparent', color: exam.is_published ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {exam.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  {exam.is_published ? 'Gỡ' : 'Đăng'}
                </button>
                <button onClick={() => router.push(`/teacher/exams/${exam.id}/edit`)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={14} /> Sửa
                </button>
                <button onClick={() => handleDelete(exam.id)} disabled={deleting === exam.id}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
