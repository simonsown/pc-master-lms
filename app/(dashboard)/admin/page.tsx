import React from 'react'

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Tổng quan hệ thống</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Tổng số học sinh</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>1,248</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Tổng số giáo viên</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>56</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Số trường tham gia</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>12</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Hoạt động gần đây</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Chưa có hoạt động nào được ghi nhận hôm nay.</p>
      </div>
    </div>
  )
}
