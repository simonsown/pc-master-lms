'use client'

import { X } from 'lucide-react'

interface ImageModalProps {
  component: { exact_name: string; image_url: string } | null
  onClose: () => void
}

export default function ImageModal({ component, onClose }: ImageModalProps) {
  if (!component) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="relative max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{component.exact_name}</h3>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="relative w-full" style={{ height: '400px' }}>
          <img
            src={component.image_url}
            alt={component.exact_name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e: any) => {
              e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80'
            }}
          />
        </div>
      </div>
    </div>
  )
}
