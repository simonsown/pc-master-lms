'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Book, Play, CheckCircle, Clock, Star, ArrowRight, Layers, ArrowLeft, Plus, KeyRound, Trash2 } from 'lucide-react'
import { getAssignedLessons, getMyClassCodes, setMyClassCodes, joinClass, getLessonProgress } from '@/lib/lesson-store'
import './lessons-theme.css'

export default function LessonsListPage() {
  const [classCodes, setClassCodes] = useState([])
  const [lessons, setLessons] = useState([])
  const [codeInput, setCodeInput] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const codes = getMyClassCodes()
    setClassCodes(codes)
    refreshLessons(codes)
    setReady(true)
  }, [])

  const refreshLessons = (codes) => {
    const assigned = []
    codes.forEach(code => {
      getAssignedLessons(code).forEach(l => {
        if (!assigned.some(x => x.id === l.id)) assigned.push(l)
      })
    })
    assigned.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    setLessons(assigned)
  }

  const addCode = () => {
    const code = codeInput.trim()
    if (!code) return
    const next = [...classCodes, code]
    setMyClassCodes(next)
    setClassCodes(next)
    setCodeInput('')
    refreshLessons(next)
  }

  const removeCode = (code) => {
    const next = classCodes.filter(c => c.toLowerCase() !== code.toLowerCase())
    setMyClassCodes(next)
    setClassCodes(next)
    refreshLessons(next)
  }

  return (
    <div className="lessons-page">
      <div className="lessons-container">
        <header className="lessons-header">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/student" className="lessons-back-btn">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="lessons-title">
                Bài Giảng Từ <span className="lessons-title-accent">Giáo Viên</span>
              </h1>
            </div>
            <p className="lessons-subtitle">
              Chỉ hiển thị bài giảng mà giáo viên gán cho lớp của bạn. Nhập mã lớp (giáo viên cung cấp) để xem bài giảng riêng của lớp.
            </p>
          </div>
          <div className="lessons-stats-card">
            <div className="lessons-stats-icon">
              <Layers size={24} />
            </div>
            <div>
              <div className="lessons-stats-label">Bài giảng của bạn</div>
              <div className="lessons-stats-value">{lessons.length} Bài học</div>
            </div>
          </div>
        </header>

        {/* Class code selector */}
        <div style={{
          background: 'var(--bg-elevated, #0f172a)', border: '1px solid var(--border-subtle, #1e293b)',
          borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', display: 'flex',
          flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} style={{ color: 'var(--brand-primary, #00d2a0)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #e2e8f0)' }}>Lớp của bạn:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
              {classCodes.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>Chưa có mã lớp — hãy nhập mã bên dưới</span>
              )}
              {classCodes.map(code => (
                <span key={code} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700,
                  padding: '5px 12px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: '99px',
                  fontFamily: 'monospace'
                }}>
                  {code}
                  <button onClick={() => removeCode(code)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCode() }}
              placeholder="Nhập mã lớp (VD: 10A1)..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-surface, #0a0f1a)',
                border: '1px solid var(--border-default, #1e293b)', color: 'var(--text-primary, #e2e8f0)',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
              }}
            />
            <button onClick={addCode} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px',
              background: 'var(--brand-primary, #00d2a0)', color: '#000', border: 'none', fontWeight: 800,
              fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit'
            }}>
              <Plus size={16} /> Thêm lớp
            </button>
          </div>
        </div>

        <div className="lessons-grid">
          {lessons.map((lesson) => {
            const progress = getLessonProgress(lesson.id)
            const isCompleted = progress.completed

            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="lessons-card"
              >
                <div className="lessons-card-cover">
                  <img
                    src={lesson.thumbnail_url || "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1074&auto=format&fit=crop"}
                    alt={lesson.title}
                    className="lessons-card-img"
                  />
                  <div className="lessons-card-gradient"></div>

                  {isCompleted && (
                    <div className="lessons-completed-badge">
                      <CheckCircle size={20} />
                    </div>
                  )}

                  <div className="lessons-card-meta">
                    <div className="lessons-meta-chip">
                      <Clock size={12} className="lessons-meta-icon" />
                      {lesson.estimated_minutes || 15} phút
                    </div>
                    <div className="lessons-meta-chip">
                      <Star size={12} className="text-yellow-400" />
                      4.9
                    </div>
                  </div>
                </div>

                <div className="lessons-card-body">
                  <h3 className="lessons-card-title">
                    {lesson.title}
                  </h3>
                  <p className="lessons-card-desc">
                    {lesson.description}
                  </p>

                  <div className="lessons-card-footer">
                    <div className="lessons-card-action">
                      {isCompleted ? 'XEM LẠI' : 'BẮT ĐẦU HỌC'}
                      <ArrowRight size={16} />
                    </div>
                    <div className="lessons-card-count">
                      Bài giảng giáo viên
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {ready && lessons.length === 0 && (
            <div className="lessons-empty">
              <Book size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Chưa có bài giảng nào được gán cho lớp của bạn.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Kiểm tra mã lớp với giáo viên, hoặc đợi giáo viên xuất bản bài giảng cho lớp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
