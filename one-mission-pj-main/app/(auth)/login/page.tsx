'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, LogIn, ArrowLeft, Github, Monitor, Shield, KeyRound } from 'lucide-react'
import { login } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const router = useRouter()

  function handleAdminLogin() {
    if (!adminPass.trim()) { setAdminError('Vui lòng nhập mật khẩu admin'); return }
    setAdminLoading(true)
    setAdminError('')

    setTimeout(() => {
      if (adminPass === 'nguyen200113') {
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_login_time', Date.now().toString())
        router.push('/admin')
      } else {
        setAdminError('Mật khẩu admin không chính xác')
        setAdminLoading(false)
      }
    }, 500)
  }

  async function handleGoogleLogin() {
    setError(null)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (oauthError) {
      setError('Đăng nhập Google thất bại: ' + oauthError.message)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await login(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.success && res.redirectUrl) {
      router.push(res.redirectUrl)
    } else {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, marginBottom: '32px', textDecoration: 'none' }}>
            <ArrowLeft size={18} /> Quay lại trang chủ
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Đăng nhập</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Chào mừng bạn trở lại! Đăng nhập để tiếp tục học tập.</p>
          </div>

          <button onClick={handleGoogleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px' }}>
            <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }}></div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Hoặc qua email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" required value={email} onChange={e => setEmail(e.target.value)} className="lms-input" style={{ paddingLeft: '42px' }} placeholder="diachi@email.com" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" required className="lms-input" style={{ paddingLeft: '42px' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Quên mật khẩu?
              </Link>
            </div>

            {error && (
              <div style={{ background: 'rgba(244,106,106,0.1)', border: '1px solid rgba(244,106,106,0.2)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="lms-btn lms-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</> : <><LogIn size={18} /> Đăng Nhập</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Đăng ký ngay
            </Link>
          </p>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: showAdmin ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px',
                transition: 'all 0.2s', textDecoration: showAdmin ? 'none' : 'underline',
                textDecorationStyle: 'dotted', textUnderlineOffset: '3px'
              }}
            >
              <Shield size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {showAdmin ? 'Đóng truy cập Admin' : 'Đăng nhập với tư cách Admin'}
            </button>

            {showAdmin && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Mật khẩu Admin
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={adminPass}
                      onChange={e => { setAdminPass(e.target.value); setAdminError('') }}
                      onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin() }}
                      placeholder="Nhập mật khẩu admin"
                      style={{
                        height: '42px', borderRadius: '8px', border: '1px solid var(--border-strong)',
                        padding: '0 12px 0 36px', fontFamily: 'inherit', fontSize: '13px',
                        color: 'var(--text-primary)', background: 'var(--bg-surface)',
                        outline: 'none', width: '100%', transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAdminLogin}
                    disabled={adminLoading}
                    style={{
                      padding: '0 20px', borderRadius: '8px', background: 'var(--brand-primary)',
                      color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {adminLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={16} />}
                    Vào
                  </button>
                </div>
                {adminError && (
                  <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--danger)', fontWeight: 600 }}>{adminError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: { xs: 'none', md: 'flex' } as any, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #031f3b 0%, #1a2f53 80%)', padding: '64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(8,158,96,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(40,156,249,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, color: '#fff' }}>
          <Monitor size={80} style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.3 }}>PC Master Builder</h2>
          <p style={{ fontSize: '16px', opacity: 0.7, maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
            Mô phỏng lắp ráp PC 2D tích hợp trí tuệ nhân tạo — học mà như chơi.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 600 }}>AI hướng dẫn</span>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 600 }}>100% Web</span>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 600 }}>Không cài đặt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
