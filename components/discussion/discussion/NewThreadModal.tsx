'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, body: string, type: 'question' | 'discussion' | 'announcement') => Promise<void>
  userRole: string
}

export function NewThreadModal({ isOpen, onClose, onSubmit, userRole }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<'question' | 'discussion' | 'announcement'>('question')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setLoading(true)
    setError('')
    try {
      await onSubmit(title, body, type)
      setTitle('')
      setBody('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đăng chủ đề.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1c25] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#16213e]/30">
          <h3 className="font-bold text-white text-lg">Đặt câu hỏi mới</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Tiêu đề thảo luận
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Làm thế nào để tính công suất nguồn (TDP)?"
              className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Loại chủ đề
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
              >
                <option value="question">❓ Câu hỏi</option>
                <option value="discussion">💬 Thảo luận</option>
                {userRole === 'teacher' && <option value="announcement">📢 Thông báo</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Nội dung chi tiết (hỗ trợ Markdown)
            </label>
            <textarea 
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Mô tả chi tiết thắc mắc của bạn..."
              className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d4aa] text-[#0d0e13] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Đăng chủ đề'}
          </button>
        </form>
      </div>
    </div>
  )
}
