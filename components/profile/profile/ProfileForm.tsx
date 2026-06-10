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
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email tài khoản</label>
        <input 
          type="email" 
          disabled 
          value={profile.email} 
          className="w-full bg-[#1e202f]/30 border border-gray-850 text-gray-500 rounded-xl px-4 py-3 text-xs focus:outline-none cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Họ và tên</label>
          <input 
            type="text" 
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-550 focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lớp</label>
          <input 
            type="text" 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="VD: 10A1, 11B2..."
            className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-555 focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trường học</label>
        <input 
          type="text" 
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="Tên trường THPT..."
          className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-560 focus:outline-none focus:border-[#00d4aa] transition-colors"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tiểu sử ngắn</label>
          <span className="text-[10px] text-gray-500 font-bold">{bio.length}/200</span>
        </div>
        <textarea 
          rows={3}
          value={bio}
          maxLength={200}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Một vài dòng giới thiệu về bản thân..."
          className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-565 focus:outline-none focus:border-[#00d4aa] transition-colors resize-none"
        />
      </div>

      <button 
        type="submit" 
        disabled={saving}
        className="w-full py-3 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}
