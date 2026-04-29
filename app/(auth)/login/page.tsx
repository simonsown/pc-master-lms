'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react'
import { login } from '@/lib/auth-actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Cột trái: Form Login */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '40px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Quay lại trang chủ
        </Link>
        
        <div style={{ background: 'var(--bg-surface)', padding: '48px', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '40px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Đăng nhập <span style={{ color: 'var(--brand-primary)' }}>LMS</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@school.edu.vn"
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)', 
              color: '#000', fontSize: '16px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px',
              transition: 'all 0.2s'
            }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Đăng Nhập'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--brand-light)', fontWeight: 600 }}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>
      
      {/* Cột phải: Image/Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', borderLeft: '1px solid var(--border-subtle)' }}>
        <img src="/showcase.png" alt="Showcase" style={{ width: '80%', maxWidth: '600px', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid var(--border-subtle)' }} />
      </div>
    </div>
  )
}
