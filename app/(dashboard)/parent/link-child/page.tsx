'use client'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen flex flex-col justify-center items-center p-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0, 212, 170, 0.05)' }} />

        {step === 'input' && (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Liên kết tài khoản con
            </h2>
            <p className="text-xs md:text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Nhập mã học sinh của con bạn (tìm thấy trong mục Hồ sơ của con, dạng <span className="font-mono" style={{ color: 'var(--brand-primary)' }}>PCM-XXXXXXXX</span>) để kết nối và theo dõi học tập.
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
                className="w-full rounded-xl px-4 py-3.5 font-mono text-center text-lg tracking-widest outline-none uppercase transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && (
              <div className="text-xs font-semibold mb-4 rounded-lg p-3" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={searchStudent}
              disabled={loading || !code}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', color: 'var(--brand-primary)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
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
            <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Xác nhận liên kết
            </h2>
            <p className="text-xs md:text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Vui lòng xác nhận thông tin học sinh dưới đây chính xác là con của bạn.
            </p>

            {/* Profile Card */}
            <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {foundStudent.avatar_url ? (
                <img
                  src={foundStudent.avatar_url}
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ border: '1px solid var(--border-default)' }}
                  alt={foundStudent.student_name}
                />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold uppercase" style={{ background: 'var(--bg-base)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}>
                  {foundStudent.student_name[0] || 'S'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{foundStudent.student_name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{foundStudent.school_name || 'Chưa cập nhật trường học'}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Mối quan hệ với học sinh
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="parent">Phụ huynh (Chung)</option>
                <option value="father">Cha</option>
                <option value="mother">Mẹ</option>
                <option value="guardian">Người giám hộ</option>
              </select>
            </div>

            {error && (
              <div className="text-xs font-semibold mb-4 rounded-lg p-3" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
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
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
              <button
                onClick={confirmLink}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(0, 212, 170, 0.15)', border: '1px solid rgba(0, 212, 170, 0.3)', color: 'var(--brand-primary)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0, 212, 170, 0.1)', color: 'var(--brand-primary)' }}>
              <CheckCircle2 size={36} className="animate-pulse" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Liên kết thành công!
            </h3>
            <p className="text-xs md:text-sm mb-8 leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Tài khoản của bạn đã được kết nối với con thành công. Giờ đây bạn có thể xem đầy đủ chi tiết tiến độ học tập.
            </p>
            <a
              href="/parent/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150"
              style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', color: 'var(--brand-primary)' }}
            >
              Về trang Tổng quan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
