'use client'

import React, { useState } from 'react'
import { findStudentByCode, requestLinkToStudent } from '@/lib/parent-actions'
import { Search, ShieldCheck, Heart, User, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

export default function LinkChildPage() {
  const [code, setCode] = useState('')
  const [foundStudent, setFoundStudent] = useState<any>(null)
  const [relationship, setRelationship] = useState('parent')
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Nhập mã và tìm kiếm
  async function searchStudent() {
    if (!code || code.trim().length < 4) {
      setError('Vui lòng nhập mã học sinh hợp lệ')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await findStudentByCode(code.trim().toUpperCase())
      if (res.student) {
        setFoundStudent(res.student)
        setStep('confirm')
      } else {
        setError(res.error || 'Không tìm thấy học sinh với mã này')
      }
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Xác nhận liên kết
  async function confirmLink() {
    if (!foundStudent) return

    setLoading(true)
    setError(null)

    try {
      const res = await requestLinkToStudent(foundStudent.id, relationship)
      if (res.success) {
        setStep('success')
      } else {
        setError(res.error || 'Lỗi khi thực hiện liên kết')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thực hiện liên kết')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c11] text-[#dde0ed] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-[#111318] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />

        {step === 'input' && (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-[#dde0ed] mb-2 flex items-center gap-2">
              Liên kết tài khoản con
            </h2>
            <p className="text-[#636678] text-xs md:text-sm mb-6 leading-relaxed">
              Nhập mã học sinh của con bạn (tìm thấy trong mục Hồ sơ của con, dạng <span className="font-mono text-[#00d4aa]">PCM-XXXXXXXX</span>) để kết nối và theo dõi học tập.
            </p>

            <div className="relative mb-4">
              <input
                value={code}
                onChange={(e) => {
                  setError(null)
                  setCode(e.target.value.toUpperCase())
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') searchStudent()
                }}
                placeholder="PCM-XXXXXXXX"
                maxLength={12}
                disabled={loading}
                className="w-full bg-[#1a1c25] border border-white/10 rounded-xl px-4 py-3.5 text-[#dde0ed] font-mono text-center text-lg tracking-widest focus:border-[#00d4aa]/40 outline-none uppercase transition-all placeholder:text-[#636678]"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs font-semibold mb-4 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={searchStudent}
              disabled={loading || !code}
              className="w-full py-3.5 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/25 border border-[#00d4aa]/30 hover:border-[#00d4aa]/60 text-[#00d4aa] rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={16} />
                  Tìm kiếm học sinh
                </>
              )}
            </button>
          </>
        )}

        {step === 'confirm' && foundStudent && (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-[#dde0ed] mb-2">
              Xác nhận liên kết
            </h2>
            <p className="text-[#636678] text-xs md:text-sm mb-6 leading-relaxed">
              Vui lòng xác nhận thông tin học sinh dưới đây chính xác là con của bạn.
            </p>

            {/* Profile Card */}
            <div className="bg-[#1a1c25] border border-white/5 rounded-xl p-4 mb-6 flex items-center gap-4">
              {foundStudent.avatar_url ? (
                <img
                  src={foundStudent.avatar_url}
                  className="w-14 h-14 rounded-full object-cover border border-white/10"
                  alt={foundStudent.student_name}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1f2130] flex items-center justify-center text-2xl font-bold text-[#00d4aa] border border-white/5 uppercase">
                  {foundStudent.student_name[0] || 'S'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-[#dde0ed] text-base truncate">{foundStudent.student_name}</div>
                <div className="text-xs text-[#636678] truncate">{foundStudent.school_name || 'Chưa cập nhật trường học'}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#636678] mb-2">
                Mối quan hệ với học sinh
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                disabled={loading}
                className="w-full bg-[#1a1c25] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#dde0ed] outline-none focus:border-[#00d4aa]/40 transition-all cursor-pointer"
              >
                <option value="parent">Phụ huynh (Chung)</option>
                <option value="father">Cha</option>
                <option value="mother">Mẹ</option>
                <option value="guardian">Người giám hộ</option>
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-xs font-semibold mb-4 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setError(null)
                  setStep('input')
                }}
                disabled={loading}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-[#636678] hover:text-[#dde0ed] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
              <button
                onClick={confirmLink}
                disabled={loading}
                className="flex-1 py-3 bg-[#00d4aa]/15 hover:bg-[#00d4aa]/30 border border-[#00d4aa]/30 hover:border-[#00d4aa]/70 text-[#00d4aa] rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Xác nhận
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#00d4aa]/10 text-[#00d4aa] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(0,212,170,0.1)]">
              <CheckCircle2 size={36} className="animate-pulse" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#dde0ed] mb-2">
              Liên kết thành công!
            </h3>
            <p className="text-[#636678] text-xs md:text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              Tài khoản của bạn đã được kết nối với con thành công. Giờ đây bạn có thể xem đầy đủ chi tiết tiến độ học tập.
            </p>
            <a
              href="/parent/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/25 border border-[#00d4aa]/30 hover:border-[#00d4aa]/60 text-[#00d4aa] rounded-xl font-bold text-sm transition-all duration-150 shadow-[0_0_15px_rgba(0,212,170,0.05)]"
            >
              Về trang Tổng quan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
