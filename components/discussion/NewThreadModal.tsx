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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Đặt câu hỏi mới</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg" style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Tiêu đề thảo luận
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Làm thế nào để tính công suất nguồn (TDP)?"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Loại chủ đề
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="question">❓ Câu hỏi</option>
                <option value="discussion">💬 Thảo luận</option>
                {userRole === 'teacher' && <option value="announcement">📢 Thông báo</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Nội dung chi tiết (hỗ trợ Markdown)
            </label>
            <textarea 
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Mô tả chi tiết thắc mắc của bạn..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-xl transition-opacity disabled:opacity-50"
            style={{ background: 'var(--brand-primary)', color: '#000' }}
          >
            {loading ? 'Đang gửi...' : 'Đăng chủ đề'}
          </button>
        </form>
      </div>
    </div>
  )
}
