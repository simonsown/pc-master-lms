'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, LogIn, ArrowLeft, Shield, KeyRound } from 'lucide-react'
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
      {/* Left Panel - Animated Illustration */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #031f3b 0%, #1a2f53 80%)',
        padding: '64px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(8,158,96,0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'floatSlow 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(40,156,249,0.08) 0%, transparent 70%)', borderRadius: '50%', animation: 'floatSlow 10s ease-in-out infinite reverse' }}></div>
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,185,0,0.05) 0%, transparent 70%)', borderRadius: '50%', animation: 'floatSlow 12s ease-in-out infinite 2s' }}></div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, color: '#fff', maxWidth: '480px' }}>
          {/* Animated illustration - nhóm bạn học tập công nghệ */}
          <div style={{ position: 'relative', width: '300px', height: '260px', margin: '0 auto 32px' }}>
            {/* Monitor screen */}
            <svg viewBox="0 0 300 260" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#289cf9" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Desk */}
              <rect x="20" y="195" width="260" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
              <rect x="40" y="203" width="12" height="35" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="248" y="203" width="12" height="35" rx="2" fill="rgba(255,255,255,0.08)" />

              {/* Monitor */}
              <rect x="85" y="60" width="130" height="100" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <rect x="90" y="65" width="120" height="85" rx="4" fill="url(#screenGlow)" />

              {/* Screen content: code lines */}
              <rect x="100" y="75" width="40" height="4" rx="2" fill="rgba(0,212,170,0.5)" />
              <rect x="100" y="85" width="60" height="4" rx="2" fill="rgba(40,156,249,0.4)" />
              <rect x="100" y="95" width="25" height="4" rx="2" fill="rgba(255,185,0,0.4)" />
              <rect x="110" y="105" width="50" height="4" rx="2" fill="rgba(0,212,170,0.3)" />
              <rect x="110" y="115" width="35" height="4" rx="2" fill="rgba(40,156,249,0.3)" />
              <rect x="100" y="130" width="70" height="4" rx="2" fill="rgba(255,185,0,0.5)" />

              {/* CPU icon on screen */}
              <rect x="170" y="75" width="30" height="30" rx="3" fill="none" stroke="rgba(0,212,170,0.4)" strokeWidth="1.5" />
              <rect x="177" y="82" width="16" height="16" rx="2" fill="rgba(0,212,170,0.2)" />
              <rect x="181" y="86" width="8" height="8" rx="1" fill="rgba(0,212,170,0.5)" />

              {/* Monitor stand */}
              <rect x="140" y="160" width="20" height="25" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="125" y="183" width="50" height="6" rx="3" fill="rgba(255,255,255,0.1)" />

              {/* Student 1 - left */}
              <g style={{ animation: 'floatBounce 3s ease-in-out infinite' }}>
                <circle cx="45" cy="175" r="20" fill="rgba(255,255,255,0.08)" />
                <circle cx="45" cy="168" r="12" fill="rgba(255,255,255,0.15)" />
                <circle cx="45" cy="165" r="5" fill="rgba(255,255,255,0.2)" />
                <rect x="37" y="180" width="16" height="25" rx="4" fill="rgba(255,255,255,0.08)" />
                {/* Headphones */}
                <path d="M33 163 Q33 158 38 158 Q45 155 52 158 Q57 158 57 163" fill="none" stroke="rgba(0,212,170,0.3)" strokeWidth="2.5" />
              </g>

              {/* Student 2 - right */}
              <g style={{ animation: 'floatBounce 3.5s ease-in-out infinite 0.5s' }}>
                <circle cx="255" cy="170" r="20" fill="rgba(255,255,255,0.08)" />
                <circle cx="255" cy="163" r="12" fill="rgba(255,255,255,0.15)" />
                <circle cx="255" cy="160" r="5" fill="rgba(255,255,255,0.2)" />
                <rect x="247" y="175" width="16" height="25" rx="4" fill="rgba(255,255,255,0.08)" />
                {/* Glasses */}
                <circle cx="250" cy="163" r="4" fill="none" stroke="rgba(40,156,249,0.4)" strokeWidth="1.5" />
                <circle cx="260" cy="163" r="4" fill="none" stroke="rgba(40,156,249,0.4)" strokeWidth="1.5" />
                <line x1="254" y1="163" x2="256" y2="163" stroke="rgba(40,156,249,0.4)" strokeWidth="1" />
              </g>

              {/* Floating tech elements */}
              <g style={{ animation: 'floatRotate 6s linear infinite', transformOrigin: '150px 130px' }}>
                <circle cx="210" cy="50" r="6" fill="none" stroke="rgba(0,212,170,0.3)" strokeWidth="1.5" />
                <circle cx="210" cy="50" r="2" fill="rgba(0,212,170,0.4)" />
              </g>
              <g style={{ animation: 'floatRotate 8s linear infinite reverse', transformOrigin: '150px 130px' }}>
                <rect x="80" y="40" width="8" height="8" rx="2" fill="none" stroke="rgba(255,185,0,0.3)" strokeWidth="1.5" />
              </g>

              {/* Connection lines */}
              <line x1="65" y1="180" x2="90" y2="160" stroke="rgba(0,212,170,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="235" y1="175" x2="210" y2="160" stroke="rgba(40,156,249,0.15)" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.3 }}>
            PC Master Builder
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.7, maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
            Mô phỏng lắp ráp PC 2D tích hợp trí tuệ nhân tạo — học mà như chơi.
          </p>

          {/* Feature tags */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(0,212,170,0.15)', color: '#00d4aa', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(0,212,170,0.2)' }}>
              AI hướng dẫn
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(40,156,249,0.15)', color: '#289cf9', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(40,156,249,0.2)' }}>
              100% Web
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '99px', background: 'rgba(255,185,0,0.15)', color: '#ffb900', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(255,185,0,0.2)' }}>
              Không cài đặt
            </span>
          </div>

          {/* Testimonial */}
          <div style={{ marginTop: '32px', padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '13px', opacity: 0.6, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
              "Hơn 5,000+ học sinh đang học tập và thực hành lắp ráp PC mỗi ngày."
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -15px); }
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes floatRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
