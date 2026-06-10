// Path: app/(dashboard)/parent/dashboard/error.tsx
'use client'
import { useEffect } from 'react'

export default function ParentDashboardError({
  error, reset
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '24px',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Có lỗi xảy ra khi tải Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '380px' }}>
          {error.message || 'Hệ thống gặp sự cố tải dữ liệu realtime. Vui lòng tải lại trang.'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            background: 'rgba(0, 212, 170, 0.15)',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            color: 'var(--brand-primary)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'colors 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 212, 170, 0.25)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 212, 170, 0.15)'}
        >
          Tải lại dữ liệu
        </button>
      </div>
    </div>
  )
}
