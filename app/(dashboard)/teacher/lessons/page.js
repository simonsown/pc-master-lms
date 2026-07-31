'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, Loader2, ArrowLeft, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import { getAllLessons, createLesson, deleteLesson, getClassNames } from '@/lib/lesson-store'

export default function TeacherLessonsPage() {
  const router = useRouter()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setLessons(getAllLessons().map(l => ({ ...l, classNames: getClassNames(l.classCodes || []) })))
      setLoading(false)
    }
    check()
  }, [])

  const refresh = () => {
    setLessons(getAllLessons().map(l => ({ ...l, classNames: getClassNames(l.classCodes || []) })))
  }

  const createNewLesson = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Phiên đăng nhập hết hạn!'); window.location.href = '/login'; return }
    const lesson = createLesson()
    router.push(`/teacher/lessons/${lesson.id}`)
  }

  const handleDelete = (id) => {
    if (!confirm('Xóa bài giảng này? Học sinh sẽ không còn thấy bài này nữa.')) return
    deleteLesson(id)
    refresh()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '28px', fontFamily: 'var(--font-sans)' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/teacher" style={{
            width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', border: '1px solid var(--border-default)'
          }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>
              Quản lý <span style={{ color: 'var(--brand-primary)' }}>Bài Giảng</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Bài giảng được lưu trên trình duyệt này — học sinh trong lớp đã chọn sẽ thấy bài khi bạn xuất bản.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={createNewLesson} className="lms-btn lms-btn-green">
            <Plus size={18} /> Tạo bài mới
          </button>
          <AuthButton />
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {lessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-surface)', borderRadius: '16px', border: '2px dashed var(--border-default)' }}>
            <BookOpen size={56} style={{ color: 'var(--text-muted)', marginBottom: '20px', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 600 }}>Chưa có bài giảng nào</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Nhấn "Tạo bài mới" để bắt đầu</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {lessons.map(lesson => (
              <div key={lesson.id} className="lms-card" style={{
                padding: 0, overflow: 'hidden', transition: 'all 0.25s ease',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{ height: '180px', background: 'var(--bg-elevated)', position: 'relative' }}>
                  {lesson.thumbnail_url ? (
                    <img src={lesson.thumbnail_url} alt={lesson.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', opacity: 0.3 }}>
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                    background: lesson.is_published ? 'var(--brand-primary)' : 'var(--text-muted)',
                    color: '#fff', display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                    {lesson.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                    {lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>{lesson.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {lesson.description || 'Chưa có mô tả'}
                  </p>
                  {lesson.classNames?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {lesson.classNames.map((name, i) => (
                        <span key={i} style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', borderRadius: '99px', fontWeight: 600 }}>{name}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--warning)', margin: '0 0 12px', fontWeight: 600 }}>
                      Chưa gán lớp — học sinh sẽ không thấy bài này
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {lesson.sections?.length || 0} mục
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/teacher/lessons/${lesson.id}`}>
                        <button style={{
                          padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: 'var(--brand-subtle)', color: 'var(--brand-primary)',
                          fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit'
                        }}>
                          <Edit size={14} /> Sửa
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(lesson.id)} style={{
                        padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: 'rgba(244,106,106,0.1)', color: 'var(--danger)', fontFamily: 'inherit'
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
