'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Mail, Lock, User, Check, ChevronRight, GraduationCap, Building, Image as ImageIcon, MapPin, Calendar, ShieldCheck, Users } from 'lucide-react'
import { register, completeOAuthRegistration } from '@/lib/auth-actions'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOauth = searchParams.get('oauth') === 'true'
  const initialStep = searchParams.get('step') ? parseInt(searchParams.get('step')!) : 1
  
  // Tab switcher
  const [isLogin, setIsLogin] = useState(false)
  useEffect(() => {
    if (isLogin) router.push('/login')
  }, [isLogin, router])

  // Wizard state
  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // 'student' | 'teacher'
    classCode: '',
    schoolCode: '',
    schoolName: '',
    teacherCode: '',
    dob: '',
    province: '',
    termsAccepted: false
  })

  const [passwordStrength, setPasswordStrength] = useState(0) // 0-3

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Calculate password strength
    if (name === 'password') {
      let strength = 0
      if (value.length >= 8) strength += 1
      if (value.match(/[A-Z]/) && value.match(/[a-z]/)) strength += 1
      if (value.match(/[0-9!@#$%^&*]/)) strength += 1
      setPasswordStrength(strength)
    }
  }

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Vui lòng điền đủ thông tin.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.')
        return
      }
      if (formData.password.length < 8) {
        setError('Mật khẩu phải có ít nhất 8 ký tự.')
        return
      }
      if (!/[A-Z]/.test(formData.password)) {
        setError('Mật khẩu phải chứa ít nhất 1 chữ hoa.')
        return
      }
      if (!/[0-9]/.test(formData.password)) {
        setError('Mật khẩu phải chứa ít nhất 1 số.')
        return
      }
    } else if (step === 2) {
      if (formData.role === 'parent' && (!formData.schoolName || !formData.classCode)) {
        setError('Vui lòng nhập đầy đủ thông tin liên kết tài khoản con.')
        return
      }
    }
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.termsAccepted) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ.')
      return
    }

    setLoading(true)

    // Tạo FormData object để gửi vào server action
    const submitData = new FormData()
    submitData.append('role', formData.role) // FIX: Always append role to send to server

    if (!isOauth) {
      submitData.append('full_name', formData.fullName)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
    }
    if (formData.role === 'teacher' && formData.teacherCode) submitData.append('teacher_code', formData.teacherCode)
    if (formData.classCode) submitData.append('class_code', formData.classCode)
    if (formData.schoolCode) submitData.append('school_code', formData.schoolCode)
    if (formData.schoolName) submitData.append('school_name', formData.schoolName)
    
    // Note: dob, province, teacherCode có thể lưu vào DB sau nếu server action hỗ trợ,
    // hiện tại auth-actions.ts chưa hỗ trợ nhận hết các trường phụ này.

    let res;
    if (isOauth) {
      res = await completeOAuthRegistration(submitData)
    } else {
      res = await register(submitData)
    }

    if (res?.error) {
      let friendlyError = res.error
      if (res.error.toLowerCase().includes('already registered') || 
          res.error.toLowerCase().includes('already_registered') || 
          res.error.toLowerCase().includes('already exists') ||
          res.error.toLowerCase().includes('user_already_exists')) {
        friendlyError = 'Email này đã được đăng ký hoặc liên kết với tài khoản Google từ trước. Vui lòng sử dụng Email khác hoặc quay lại trang Đăng nhập bằng Google!'
      }
      setError(friendlyError)
      setLoading(false)
    } else {
      // Thành công
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00d2a0', '#00b4d8', '#ffffff']
      })
      setTimeout(() => {
        if (isOauth) {
          router.push(formData.role === 'student' ? '/builder' : `/${formData.role}`)
        } else {
          router.push('/check-email')
        }
      }, 2000)
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-[#00d2a0]'
      default: return 'bg-[#1e293b]'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] text-white p-4">
      
      {/* Back button */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Quay lại trang chủ</span>
        </Link>
      </div>

      <div className="w-full max-w-xl bg-[#16213e] rounded-2xl border border-[#1e293b] shadow-2xl p-6 md:p-10 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1e293b] rounded-full z-0">
            <motion.div 
              className="h-full bg-[#00d2a0] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: isOauth ? `${((step - 2) / 1) * 100}%` : `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {(isOauth ? [2, 3] : [1, 2, 3]).map((i, index) => (
            <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${step >= i ? 'bg-[#00d2a0] text-black' : 'bg-[#1e293b] text-slate-400 border border-[#2a3655]'}`}>
              {step > i ? <Check size={14} /> : (isOauth ? index + 1 : i)}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {isOauth ? "Hoàn tất hồ sơ của bạn" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-slate-400 text-sm">
            {step === 1 && "Thông tin cơ bản của bạn"}
            {step === 2 && "Bạn là học sinh hay giáo viên?"}
            {step === 3 && "Hoàn thiện hồ sơ để bắt đầu"}
          </p>
        </div>

        {/* Tab Switcher (Chỉ ở bước 1) */}
        {step === 1 && !isOauth && (
          <div className="relative flex w-full bg-[#0f0f1a] rounded-lg p-1 mb-8 border border-[#1e293b]">
            <div className="absolute inset-0 flex p-1">
               <motion.div 
                 className="w-1/2 bg-[#16213e] rounded-md border border-[#2a3655] shadow-sm"
                 layoutId="activeTabReg"
                 initial={false}
                 animate={{ x: isLogin ? 0 : "100%" }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
               />
            </div>
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white`}
            >
              Đăng Nhập
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors text-white`}
            >
              Đăng Ký
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative min-h-[350px]">
          <input type="hidden" name="role" value={formData.role} />
          <AnimatePresence mode="wait">
            
            {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleInputChange} required
                    className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] text-white"
                  />
                </div>

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" name="email" placeholder="Địa chỉ Email" value={formData.email} onChange={handleInputChange} required
                    className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] text-white"
                  />
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" name="password" placeholder="Mật khẩu (tối thiểu 8 ký tự, 1 chữ hoa, 1 số)" value={formData.password} onChange={handleInputChange} required
                    className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] text-white"
                  />
                </div>
                {/* Strength Meter */}
                <div className="flex gap-1 h-1.5 mt-[-8px] px-1">
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 1 ? getStrengthColor() : 'bg-[#1e293b]'}`}></div>
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 2 ? getStrengthColor() : 'bg-[#1e293b]'}`}></div>
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= 3 ? getStrengthColor() : 'bg-[#1e293b]'}`}></div>
                </div>

                <div className="relative mt-2">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleInputChange} required
                    className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] text-white"
                  />
                </div>
              </motion.div>
            )}

            {/* BƯỚC 2: CHỌN VAI TRÒ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Student option */}
                  <label 
                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-200 ${formData.role === 'student' ? 'border-[#00d2a0] bg-[#00d2a0]/10 shadow-[0_0_15px_rgba(0,210,160,0.15)]' : 'border-[#1e293b] bg-[#0f0f1a] hover:border-[#2a3655]'}`}
                  >
                    <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleInputChange} className="hidden" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.role === 'student' ? 'bg-[#00d2a0] text-black' : 'bg-[#1e293b] text-slate-400'}`}>
                      <GraduationCap size={20} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs mb-1">Học sinh</div>
                      <div className="text-[10px] text-slate-400 leading-tight">Học & thực hành</div>
                    </div>
                  </label>

                  {/* Teacher option */}
                  <label 
                    onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-200 ${formData.role === 'teacher' ? 'border-[#00b4d8] bg-[#00b4d8]/10 shadow-[0_0_15px_rgba(0,180,216,0.15)]' : 'border-[#1e293b] bg-[#0f0f1a] hover:border-[#2a3655]'}`}
                  >
                    <input type="radio" name="role" value="teacher" checked={formData.role === 'teacher'} onChange={handleInputChange} className="hidden" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.role === 'teacher' ? 'bg-[#00b4d8] text-black' : 'bg-[#1e293b] text-slate-400'}`}>
                      <User size={20} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs mb-1">Giáo viên</div>
                      <div className="text-[10px] text-slate-400 leading-tight">Dạy & quản lý</div>
                    </div>
                  </label>

                  {/* Parent option */}
                  <label 
                    onClick={() => setFormData(prev => ({ ...prev, role: 'parent' }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-200 ${formData.role === 'parent' ? 'border-[#00d2a0] bg-[#00d2a0]/10 shadow-[0_0_15px_rgba(0,210,160,0.15)]' : 'border-[#1e293b] bg-[#0f0f1a] hover:border-[#2a3655]'}`}
                  >
                    <input type="radio" name="role" value="parent" checked={formData.role === 'parent'} onChange={handleInputChange} className="hidden" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.role === 'parent' ? 'bg-[#00d2a0] text-black' : 'bg-[#1e293b] text-slate-400'}`}>
                      <Users size={20} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs mb-1">Phụ huynh</div>
                      <div className="text-[10px] text-slate-400 leading-tight">Theo dõi con học</div>
                    </div>
                  </label>
                </div>

                <AnimatePresence mode="wait">
                  {formData.role === 'student' ? (
                    <motion.div key="student-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="schoolName" placeholder="Tên trường học của bạn *" value={formData.schoolName} onChange={handleInputChange} required className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white text-sm" />
                      </div>
                      <div className="relative">
                        <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="classCode" placeholder="Mã lớp (Nếu có)" value={formData.classCode} onChange={handleInputChange} className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white text-sm" />
                      </div>
                    </motion.div>
                  ) : formData.role === 'teacher' ? (
                    <motion.div key="teacher-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="schoolCode" placeholder="Mã trường / Tổ chức (Tùy chọn)" value={formData.schoolCode} onChange={handleInputChange} className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00b4d8] text-white text-sm" />
                      </div>
                      <div className="relative">
                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="teacherCode" placeholder="Mã xác thực giáo viên (Tùy chọn)" value={formData.teacherCode} onChange={handleInputChange} className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00b4d8] text-white text-sm" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="parent-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 mt-2">
                      <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="schoolName" placeholder="Tên trường học của con *" value={formData.schoolName} onChange={handleInputChange} required className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white text-sm" />
                      </div>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" name="classCode" placeholder="Mã học sinh của con (Để liên kết tài khoản) *" value={formData.classCode} onChange={handleInputChange} required className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white text-sm" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* BƯỚC 3: HOÀN THIỆN HỒ SƠ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-24 h-24 rounded-full bg-[#0f0f1a] border-2 border-dashed border-[#2a3655] flex flex-col items-center justify-center text-slate-500 hover:text-[#00d2a0] hover:border-[#00d2a0] cursor-pointer transition-colors relative group">
                    <ImageIcon size={24} className="mb-1" />
                    <span className="text-xs">Tải ảnh lên</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white [color-scheme:dark]" />
                </div>

                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select name="province" value={formData.province} onChange={handleInputChange} className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#00d2a0] text-slate-300 appearance-none">
                    <option value="" disabled>Chọn Tỉnh / Thành phố</option>
                    <option value="HN">Hà Nội</option>
                    <option value="HCM">TP. Hồ Chí Minh</option>
                    <option value="DN">Đà Nẵng</option>
                    <option value="Other">Tỉnh thành khác</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="peer w-5 h-5 appearance-none border border-[#2a3655] rounded bg-[#0f0f1a] checked:bg-[#00d2a0] checked:border-[#00d2a0] transition-colors" />
                    <Check size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-slate-400 leading-snug">
                    Tôi đồng ý với <Link href="#" className="text-[#00d2a0] hover:underline">Điều khoản dịch vụ</Link> và <Link href="#" className="text-[#00d2a0] hover:underline">Chính sách bảo mật</Link> của PC Master Builder LMS.
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute bottom-[-50px] w-full text-center text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
        </form>

        {/* CÁC NÚT ĐIỀU HƯỚNG */}
        <div className="flex gap-3 mt-12">
          {step > (isOauth ? 2 : 1) && (
            <button 
              type="button" 
              onClick={handlePrev}
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl font-bold bg-[#0f0f1a] border border-[#1e293b] hover:bg-[#1e293b] text-white transition-colors"
            >
              Quay lại
            </button>
          )}
          
          {step < 3 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className={`flex-[2] py-3.5 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,210,160,0.2)] hover:shadow-[0_0_20px_rgba(0,210,160,0.3)] ${formData.role === 'teacher' && step === 2 ? 'bg-[#00b4d8] hover:bg-[#00c5eb] shadow-[0_0_15px_rgba(0,180,216,0.2)]' : 'bg-[#00d2a0] hover:bg-[#00e6af]'}`}
            >
              <span>Tiếp tục</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading || !formData.termsAccepted}
              className="flex-[2] py-3.5 rounded-xl font-bold bg-[#00d2a0] hover:bg-[#00e6af] text-black flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,210,160,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Hoàn tất Đăng ký'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00d2a0]" size={48} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
