import React from 'react'

export default function ParentDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Thông tin học tập của con</h1>
      
      <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Hồ sơ học sinh</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Bạn chưa liên kết tài khoản với học sinh nào. Vui lòng lấy mã liên kết từ giáo viên chủ nhiệm.</p>
      </div>
    </div>
  )
}
