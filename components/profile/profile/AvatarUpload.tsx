'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Camera, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Props {
  userId: string
  currentAvatarUrl?: string
  onUploadSuccess: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Client-side Validation (Rule 3)
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

      // 2. Upload to storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      // 4. Update Profile Table
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
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-800 bg-[#1e202f]/50 flex items-center justify-center">
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" // Rule 3
            />
          ) : (
            <User size={40} className="text-gray-600" />
          )}
        </div>

        {/* Floating Upload Trigger */}
        <label className="
          absolute bottom-0 right-0 p-2 bg-[#00d4aa] text-[#0d0e13] rounded-full cursor-pointer
          hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center
        ">
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
      <span className="text-[10px] text-gray-500 font-bold">Chấp nhận JPG, PNG tối đa 2MB</span>
    </div>
  )
}
