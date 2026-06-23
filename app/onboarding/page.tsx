'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users, GraduationCap, ArrowRight, Loader2, Building, Calendar, MapPin, Mail, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'student' | 'teacher' | 'parent' | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [province, setProvince] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [lang, setLang] = useState<'en' | 'vn'>('vn')
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'vn') setLang(saved as 'en' | 'vn');
    } catch {}
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

  const T = (en: string, vn: string) => lang === 'en' ? en : vn

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id)
        setEmail(data.user.email || '')
        setFullName(data.user.user_metadata?.full_name || '')
      } else {
        router.push('/login')
      }
    })
  }, [router, supabase])

  const handleComplete = async () => {
    if (!role || !fullName.trim() || !userId) return
    setLoading(true)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email: email,
      full_name: fullName.trim(),
      role: role,
      dob: dob || null,
      province: province || null,
      school_name: schoolName || null,
      updated_at: new Date().toISOString()
    })

    setLoading(false)

    if (error) {
      alert('Có lỗi xảy ra: ' + error.message)
    } else {
      const redirectUrl = role === 'teacher' ? '/teacher' : role === 'parent' ? '/parent' : '/builder'
      router.push(redirectUrl)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] p-4 text-white">
      <div className="w-full max-w-lg bg-[#16213e] rounded-2xl border border-[#1e293b] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#00d2a0]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 bg-[#00d2a0]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00d2a0]">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">{T('Complete Profile', 'Hoàn thiện hồ sơ')}</h1>
          <p className="text-slate-400 text-sm">{T('Email auto-saved from Google account. Please fill in the remaining info.', 'Email đã được lưu tự động từ tài khoản Google. Vui lòng nhập thông tin còn lại.')}</p>
        </div>

        <div className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{T('Email (auto from Google)', 'Email (tự động từ Google)')}</label>
            <div className="flex items-center gap-2 bg-[#0f0f1a] border border-[#1e293b] rounded-xl px-4 py-3 text-slate-400">
              <Mail size={16} />
              <span>{email}</span>
              <CheckCircle size={16} className="ml-auto text-[#00d2a0]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{T('Full Name *', 'Họ và tên *')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={T('e.g. Nguyen Van A', 'Ví dụ: Nguyễn Văn A')}
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl px-4 py-3 outline-none focus:border-[#00d2a0] text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{T('What is your role? *', 'Bạn tham gia với vai trò? *')}</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'student' as const, icon: <User size={24} />, title: T('Student', 'Học viên') },
                { key: 'teacher' as const, icon: <Users size={24} />, title: T('Teacher', 'Giáo viên') },
                { key: 'parent' as const, icon: <GraduationCap size={24} />, title: T('Parent', 'Phụ huynh') },
              ].map(({ key, icon, title }) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === key
                      ? 'border-[#00d2a0] bg-[#00d2a0]/10'
                      : 'border-[#1e293b] bg-[#0f0f1a] hover:border-slate-600'
                  }`}
                >
                  <div className={`mb-2 ${role === key ? 'text-[#00d2a0]' : 'text-slate-500'}`}>{icon}</div>
                  <span className={`font-semibold text-sm ${role === key ? 'text-white' : 'text-slate-400'}`}>{title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{T('Date of Birth', 'Ngày sinh')}</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{T('Province/City', 'Tỉnh/Thành phố')}</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                <select value={province} onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white transition-colors appearance-none">
                  <option value="" disabled>{T('Select', 'Chọn')}</option>
                  <option value="HN">Hà Nội</option>
                  <option value="HCM">TP. Hồ Chí Minh</option>
                  <option value="DN">Đà Nẵng</option>
                  <option value="Other">{T('Other', 'Tỉnh thành khác')}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{T('School', 'Trường học')}</label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                placeholder={T('School name (optional)', 'Tên trường (không bắt buộc)')}
                className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00d2a0] text-white transition-colors" />
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!role || !fullName.trim() || loading}
            className="w-full mt-2 bg-[#00d2a0] hover:bg-[#00e6af] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>{T('Complete', 'Hoàn tất')} <ArrowRight size={18} /></>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            {T('Next login with Google will go straight in without re-entering info.', 'Lần sau đăng nhập bằng Google sẽ tự động vào thẳng mà không cần nhập lại thông tin.')}
          </p>
        </div>
      </div>
    </div>
  )
}
