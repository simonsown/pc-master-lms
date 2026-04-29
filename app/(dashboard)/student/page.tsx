import React from 'react'
import Link from 'next/link'

export default function StudentDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Không gian học tập</h1>
      
      <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Khóa học hiện tại</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Bạn chưa hoàn thành bài tập thực hành tuần này.</p>
        <Link href="/builder" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--brand-primary)', color: '#000', borderRadius: '8px', fontWeight: 700 }}>
          Vào phòng thực hành 2D
        </Link>
      </div>
    </div>
  )
}
