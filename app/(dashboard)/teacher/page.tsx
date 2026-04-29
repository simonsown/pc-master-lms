import React from 'react'

export default function TeacherDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Chào mừng thầy/cô</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Học sinh đang theo học</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>120</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Bài giảng đã tạo</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>8</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Lượt hoàn thành Quiz</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>450</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Tiến độ lớp học</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Bạn chưa tạo lớp học nào.</p>
      </div>
    </div>
  )
}
