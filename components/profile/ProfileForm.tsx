'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/actions/profile'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveBadge } from '@/components/profile/AutoSaveBadge'

interface Props {
  profile: {
    full_name: string
    bio?: string
    school?: string
    grade?: string
    email: string
  }
  onSaved?: (data: { full_name: string, bio: string, school: string, grade: string }) => void
}

export function ProfileForm({ profile, onSaved }: Props) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [school, setSchool] = useState(profile.school || '')
  const [grade, setGrade] = useState(profile.grade || '')

  const draft = JSON.stringify({
    full_name: fullName,
    bio: bio.slice(0, 200),
    school,
    grade
  })

  const { status, flush } = useAutoSave<string>({
    values: draft,
    onSave: async (snapshot) => {
      const data = JSON.parse(snapshot)
      await updateProfile(data)
      onSaved?.(data)
    },
  })

  const inputStyle = {
    width: '100%',
    background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  } as const

  return (
    <form className="space-y-4" onBlur={() => flush()}>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Email tài khoản</label>
        <input
          type="email"
          disabled
          value={profile.email}
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none cursor-not-allowed"
          style={{ ...inputStyle, color: 'var(--text-muted)' }}
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
            onBlur={() => flush()}
            placeholder="VD: Nguyễn Văn A"
            className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Lớp</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            onBlur={() => flush()}
            placeholder="VD: 10A1, 11B2..."
            className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Trường học</label>
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          onBlur={() => flush()}
          placeholder="Tên trường THPT..."
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors"
          style={inputStyle}
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
          onBlur={() => flush()}
          placeholder="Một vài dòng giới thiệu về bản thân..."
          className="w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors resize-none"
          style={inputStyle}
        />
      </div>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--border-default)' }}>
        <AutoSaveBadge status={status} />
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          Thay đổi được lưu tự động khi bạn gõ
        </span>
      </div>
    </form>
  )
}
