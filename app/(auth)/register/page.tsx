'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, Lock, User, Building } from 'lucide-react'
import { register } from '@/lib/auth-actions'
import RoleSelector, { type RoleType } from '../../../components/auth/RoleSelector'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<RoleType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('role', role || 'student')
    
    const res = await register(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Cột trái: Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', borderRight: '1px solid var(--border-subtle)' }}>
        <img src="/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '32px', filter: 'drop-shadow(0 0 20px rgba(0,198,174,0.3))' }} />
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>Tham gia hệ sinh thái <br/> PC Master LMS</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>Hệ thống quản lý học tập thực hành lắp ráp máy tính hiện đại nhất dành cho trường học.</p>
      </div>

      {/* Cột phải: Form */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', padding: '40px', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <Link href={step === 1 ? "/login" : "#"} onClick={() => step > 1 && setStep(step - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '40px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Quay lại {step === 1 ? 'Đăng nhập' : 'Chọn vai trò'}
        </Link>
        
        <div style={{ background: 'var(--bg-surface)', padding: '48px', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {step === 1 ? 'Bạn là ai?' : 'Thông tin tài khoản'}
            </h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '32px', height: '6px', borderRadius: '4px', background: step >= 1 ? 'var(--brand-primary)' : 'var(--border-strong)' }}></div>
              <div style={{ width: '32px', height: '6px', borderRadius: '4px', background: step >= 2 ? 'var(--brand-primary)' : 'var(--border-strong)' }}></div>
            </div>
          </div>

          {step === 1 && (
            <div>
              <RoleSelector selectedRole={role} onSelect={setRole} />
              <button 
                onClick={() => setStep(2)} 
                disabled={!role}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)', 
                  color: '#000', fontSize: '16px', fontWeight: 700, border: 'none', 
                  cursor: !role ? 'not-allowed' : 'pointer', opacity: !role ? 0.5 : 1, transition: 'all 0.2s'
                }}>
                Tiếp Tục
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Họ và tên</label>
                  <div style={{ position: 'relative' }}>
                    <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                    <input type="text" name="full_name" required placeholder="Nguyễn Văn A" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Mã trường (nếu có)</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                    <input type="text" name="school_code" placeholder="VD: THPT01" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                  <input type="email" name="email" required placeholder="name@school.edu.vn" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                  <input type="password" name="password" required placeholder="Ít nhất 6 ký tự" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)', color: 'white', fontSize: '16px' }} />
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px',
                transition: 'all 0.2s'
              }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Tạo Tài Khoản'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
