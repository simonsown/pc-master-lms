'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Mail, Lock, User, Check, ChevronRight, GraduationCap, Building, Image as ImageIcon, MapPin, Calendar, ShieldCheck, Users, Eye, EyeOff } from 'lucide-react'
import { register, completeOAuthRegistration } from '@/lib/auth-actions'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOauth = searchParams.get('oauth') === 'true'
  const initialStep = searchParams.get('step') ? parseInt(searchParams.get('step')!) : 1

  const [isLogin, setIsLogin] = useState(false)
  useEffect(() => { if (isLogin) router.push('/login') }, [isLogin, router])

  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: 'student', classCode: '', schoolCode: '', schoolName: '',
    teacherCode: '', dob: '', province: '', termsAccepted: false
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'password') {
      let s = 0
      if (value.length >= 8) s++
      if (value.match(/[A-Z]/) && value.match(/[a-z]/)) s++
      if (value.match(/[0-9!@#$%^&*]/)) s++
      setPasswordStrength(s)
    }
  }

  const handleNext = () => {
    setError(null)
    if (isOauth && step === 1) { setStep(2); return }
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) { setError('Vui lòng điền đủ thông tin.'); return }
      if (formData.password !== formData.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return }
      if (formData.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return }
      if (!/[A-Z]/.test(formData.password)) { setError('Mật khẩu phải chứa ít nhất 1 chữ hoa.'); return }
      if (!/[0-9]/.test(formData.password)) { setError('Mật khẩu phải chứa ít nhất 1 số.'); return }
    } else if (step === 2) {
      if (formData.role === 'parent' && (!formData.schoolName || !formData.classCode)) { setError('Vui lòng nhập đầy đủ thông tin liên kết tài khoản con.'); return }
    }
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => { setStep(prev => Math.max(prev - 1, 1)); setError(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    if (!formData.termsAccepted) { setError('Bạn cần đồng ý với Điều khoản dịch vụ.'); return }
    setLoading(true)
    const submitData = new FormData()
    submitData.append('role', formData.role)
    if (!isOauth) { submitData.append('full_name', formData.fullName); submitData.append('email', formData.email); submitData.append('password', formData.password) }
    if (formData.teacherCode) submitData.append('teacher_code', formData.teacherCode)
    if (formData.classCode) submitData.append('class_code', formData.classCode)
    if (formData.schoolCode) submitData.append('school_code', formData.schoolCode)
    if (formData.schoolName) submitData.append('school_name', formData.schoolName)
    if (formData.dob) submitData.append('dob', formData.dob)
    if (formData.province) submitData.append('province', formData.province)
    if (avatarFile) submitData.append('avatar', avatarFile)

    const res: any = isOauth ? await completeOAuthRegistration(submitData) : await register(submitData)
    if (res?.error) {
      let msg = res.error
      if (res.error.toLowerCase().includes('already registered') || res.error.toLowerCase().includes('already exists') || res.error.toLowerCase().includes('user_already_exists')) msg = 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập!'
      setError(msg); setLoading(false)
    } else if (res?.success) {
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(m => m.default({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#089e60', '#289cf9', '#ffffff'] }))
      }
      setTimeout(() => router.push(res.redirectUrl || '/'), 1500)
    }
  }

  const strengthColors = ['', 'var(--danger)', 'var(--warning)', 'var(--brand-primary)']

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px',
    border: '1px solid var(--border-default)', background: 'var(--bg-surface)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  return (
    <div className="register-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '16px', position: 'relative' }}>
      <div className="register-back-btn" style={{ position: 'absolute', top: '32px', left: '32px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Quay lại
        </Link>
      </div>

      <div style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '32px', boxShadow: '0 4px 24px var(--shadow-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {isOauth ? 'Hoàn tất hồ sơ' : 'Tạo tài khoản'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {step === 1 && 'Thông tin cơ bản'}
            {step === 2 && 'Bạn là học sinh hay giáo viên?'}
            {step === 3 && 'Hoàn thiện hồ sơ để bắt đầu'}
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
                background: step >= i ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                color: step >= i ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${step >= i ? 'var(--brand-primary)' : 'var(--border-default)'}`
              }}>{step > i ? <Check size={16} /> : i}</div>
              {i < 3 && <div style={{ flex: 1, maxWidth: '60px', height: '3px', borderRadius: '2px', background: step > i ? 'var(--brand-primary)' : 'var(--border-default)' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && !isOauth && (
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '3px', marginBottom: '24px', border: '1px solid var(--border-default)' }}>
            <button type="button" onClick={() => setIsLogin(true)}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Đăng Nhập
            </button>
            <button type="button"
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', cursor: 'default', boxShadow: '0 1px 3px var(--shadow-color)' }}>
              Đăng Ký
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleInputChange} required style={inputStyle} />
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" placeholder="Địa chỉ Email" value={formData.email} onChange={handleInputChange} required style={inputStyle} />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mật khẩu (≥8 ký tự, 1 hoa, 1 số)" value={formData.password} onChange={handleInputChange} required style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ flex: 1, borderRadius: '2px', background: passwordStrength >= i ? strengthColors[i] : 'var(--border-default)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleInputChange} required style={inputStyle} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="register-role-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { role: 'student', icon: <GraduationCap size={20} />, title: 'Học sinh', desc: 'Học & thực hành' },
                  { role: 'teacher', icon: <User size={20} />, title: 'Giáo viên', desc: 'Dạy & quản lý' },
                  { role: 'parent', icon: <Users size={20} />, title: 'Phụ huynh', desc: 'Theo dõi con học' },
                ].map(({ role, icon, title, desc }) => (
                  <button key={role} type="button" onClick={() => setFormData(p => ({ ...p, role }))}
                    style={{
                      padding: '16px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                      background: formData.role === role ? 'rgba(8,158,96,0.08)' : 'var(--bg-elevated)',
                      border: `2px solid ${formData.role === role ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      transition: 'all 0.2s', fontFamily: 'inherit'
                    }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: formData.role === role ? 'var(--brand-primary)' : 'var(--bg-base)', color: formData.role === role ? '#fff' : 'var(--text-muted)' }}>
                      {icon}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
                  </button>
                ))}
              </div>

              {formData.role === 'student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="schoolName" placeholder="Tên trường học của bạn *" value={formData.schoolName} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Users size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="classCode" placeholder="Mã lớp (Nếu có)" value={formData.classCode} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>
              )}
              {formData.role === 'teacher' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="schoolCode" placeholder="Mã trường / Tổ chức (Tùy chọn)" value={formData.schoolCode} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="teacherCode" placeholder="Mã xác thực giáo viên (Tùy chọn)" value={formData.teacherCode} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>
              )}
              {formData.role === 'parent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="schoolName" placeholder="Tên trường học của con *" value={formData.schoolName} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="classCode" placeholder="Mã học sinh của con (Để liên kết tài khoản) *" value={formData.classCode} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--border-default)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative', overflow: 'hidden', background: avatarPreview ? 'transparent' : 'var(--bg-elevated)' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : formData.fullName ? (
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-primary)' }}>{formData.fullName.charAt(0).toUpperCase()}</span>
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '10px', marginTop: '4px' }}>Ảnh đại diện</span>
                    </>
                  )}
                  <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) } }} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} style={{ ...inputStyle, colorScheme: 'light' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select name="province" value={formData.province} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}>
                  <option value="" disabled>Chọn Tỉnh / Thành phố</option>
                  <option value="HN">Hà Nội</option>
                  <option value="HCM">TP. Hồ Chí Minh</option>
                  <option value="DN">Đà Nẵng</option>
                  <option value="Other">Tỉnh thành khác</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '4px' }}>
                <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Tôi đồng ý với <Link href="#" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Điều khoản dịch vụ</Link> và <Link href="#" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Chính sách bảo mật</Link>.
                </span>
              </label>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.2)', color: 'var(--danger)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {step > (isOauth ? 2 : 1) && (
              <button type="button" onClick={handlePrev} disabled={loading}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                Quay lại
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={handleNext}
                style={{ flex: 2, padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
                Tiếp tục <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading || !formData.termsAccepted}
                style={{ flex: 2, padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontFamily: 'inherit', opacity: loading || !formData.termsAccepted ? 0.6 : 1 }}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Hoàn tất Đăng ký'}
              </button>
            )}
          </div>
        </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Đã có tài khoản? <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập</Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .register-page { padding: 12px !important; }
          .register-page > div { padding: 20px 16px !important; }
          .register-role-grid { grid-template-columns: 1fr !important; }
          .register-back-btn { top: 12px !important; left: 12px !important; }
        }
      `}</style>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
