'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, BarChart3, CheckCircle, XCircle, Loader2, Eye, EyeOff, Trash2, RefreshCw, User, Mail, Award } from 'lucide-react'
import { getTeacherExam, publishExam, deleteExam } from '@/app/actions/exam'
import { useRouter } from 'next/navigation'

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  const loadExam = useCallback(async () => {
    try {
      const data = await getTeacherExam(id)
      setExam(data)
    } catch (e: any) { console.error(e) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    loadExam()
    const channel = supabase
      .channel(`exam-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts', filter: `quiz_id=eq.${id}` },
        () => loadExam()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_answers' },
        () => loadExam()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, loadExam])

  async function handlePublish() {
    setPublishing(true)
    try {
      await publishExam(id, !exam.is_published)
      loadExam()
    } catch (e: any) { alert(e.message) }
    finally { setPublishing(false) }
  }

  async function handleDelete() {
    if (!confirm('Xóa đề thi này?')) return
    await deleteExam(id)
    router.push('/teacher/exams')
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} /></div>
  if (!exam) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Không tìm thấy đề thi</div>

  const stats = {
    totalStudents: exam.attempts?.length || 0,
    completed: exam.attempts?.filter((a: any) => a.status !== 'in_progress').length || 0,
    inProgress: exam.attempts?.filter((a: any) => a.status === 'in_progress').length || 0,
    passed: exam.attempts?.filter((a: any) => a.status !== 'in_progress' && (a.score || 0) >= (exam.passing_score || 70)).length || 0,
    avgScore: (() => { const done = exam.attempts?.filter((a: any) => a.status !== 'in_progress'); return done.length > 0 ? Math.round(done.reduce((s: number, a: any) => s + (a.score || 0), 0) / done.length * 100) / 100 : 0 })(),
    totalQuestions: exam.questions?.length || 0
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/teacher/exams" style={{ display: 'flex', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-default)', color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>
            {exam.classes?.name || 'Chưa chọn lớp'} · {exam.time_limit_minutes || 45} phút · {stats.totalQuestions} câu hỏi
            {exam.lessons && <> · Bài: {exam.lessons.title}</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePublish} disabled={publishing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: `1px solid ${exam.is_published ? 'rgba(239,68,68,0.3)' : 'var(--brand-primary)'}`, background: exam.is_published ? 'rgba(239,68,68,0.1)' : 'var(--brand-primary)', color: exam.is_published ? '#ef4444' : '#000', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            {exam.is_published ? <><EyeOff size={16} /> Gỡ đăng</> : <><Eye size={16} /> Đăng đề thi</>}
          </button>
          <button onClick={handleDelete}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Học sinh đã làm', value: stats.completed, icon: <CheckCircle size={20} />, color: '#10b981' },
          { label: 'Đang làm', value: stats.inProgress, icon: <RefreshCw size={20} />, color: '#f59e0b' },
          { label: 'Đạt yêu cầu', value: stats.passed, icon: <Award size={20} />, color: '#6366f1' },
          { label: 'Điểm trung bình', value: `${stats.avgScore}%`, icon: <BarChart3 size={20} />, color: '#ec4899' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '2px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="lms-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Kết quả học sinh
          </h2>
          {exam.attempts?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Chưa có học sinh nào làm bài</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
              {exam.attempts?.map((attempt: any) => {
                const correctCount = attempt.quiz_answers?.filter((a: any) => a.is_correct).length || 0
                const totalCount = attempt.quiz_answers?.length || 0
                return (
                  <div key={attempt.id} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                          {attempt.profiles?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{attempt.profiles?.full_name || 'Không tên'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={11} /> {attempt.profiles?.email || ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {attempt.status === 'in_progress' ? (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 600 }}>Đang làm</span>
                        ) : attempt.status === 'submitted' || attempt.status === 'graded' ? (
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: (attempt.score || 0) >= (exam.passing_score || 70) ? '#10b981' : '#ef4444' }}>
                              {attempt.score?.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{correctCount}/{totalCount} đúng</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>Hết hạn</span>
                        )}
                      </div>
                    </div>
                    {attempt.status !== 'in_progress' && totalCount > 0 && (
                      <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--bg-base)', marginTop: '8px' }}>
                        <div style={{ height: '100%', borderRadius: '2px', width: `${(correctCount / totalCount) * 100}%`, background: 'var(--brand-primary)', transition: 'width 0.5s' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lms-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} /> Phân tích câu hỏi
          </h2>
          {exam.questions?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Chưa có câu hỏi nào</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exam.questions?.map((q: any, i: number) => {
                const answers = exam.attempts?.flatMap((a: any) => a.quiz_answers || []).filter((a: any) => a.question_id === q.id) || []
                const correct = answers.filter((a: any) => a.is_correct).length
                const total = answers.length
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0
                return (
                  <div key={q.id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-elevated)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}><span style={{ color: 'var(--brand-primary)' }}>#{i + 1}</span> {q.content?.substring(0, 80)}{q.content?.length > 80 ? '...' : ''}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', flexShrink: 0 }}>
                        {correct}/{total} ({pct}%)
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--bg-base)' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
