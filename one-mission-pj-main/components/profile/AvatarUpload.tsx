'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Camera, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Props {
  userId: string
  currentAvatarUrl?: string
  onUploadSuccess: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận ảnh đại diện định dạng ảnh (JPEG/PNG/GIF).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 2MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (dbError) throw dbError

      onUploadSuccess(publicUrl)
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải ảnh lên.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center" style={{ border: '2px solid var(--border-default)', background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)' }}>
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={40} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        <label className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center" style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}>
          {uploading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Chấp nhận JPG, PNG tối đa 2MB</span>
    </div>
  )
}
