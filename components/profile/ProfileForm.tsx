'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/actions/profile'
import { toast } from 'react-hot-toast'

interface Props {
  profile: {
    full_name: string
    bio?: string
    school?: string
    grade?: string
    email: string
  }
}

export function ProfileForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [school, setSchool] = useState(profile.school || '')
  const [grade, setGrade] = useState(profile.grade || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        full_name: fullName,
        bio: bio.slice(0, 200),
        school,
        grade
      })
      toast.success('Đã lưu thông tin cá nhân!')
    } catch (err: any) {
      toast.error('Lỗi khi lưu thông tin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Email tài khoản</label>
        <input
          type="email"
          disabled
          value={profile.email}
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none cursor-not-allowed"
          style={{ background: 'color-mix(in srgb, var(--bg-elevated) 30%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Họ và tên</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
            style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Lớp</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="VD: 10A1, 11B2..."
            className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
            style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Trường học</label>
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="Tên trường THPT..."
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
          style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tiểu sử ngắn</label>
          <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{bio.length}/200</span>
        </div>
        <textarea
          rows={3}
          value={bio}
          maxLength={200}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Một vài dòng giới thiệu về bản thân..."
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors resize-none"
          style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}
      >
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}
