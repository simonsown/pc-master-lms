'use client'

import { ImageIcon } from 'lucide-react'

interface ComponentCardProps {
  exact_name: string
  estimated_price: string
  image_url: string
  onClick: () => void
}

export default function ComponentCard({ exact_name, estimated_price, image_url, onClick }: ComponentCardProps) {
  return (
    <div onClick={onClick}
      style={{
        padding: '16px', borderRadius: '14px', cursor: 'pointer',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
        color: 'var(--text-primary)', transition: 'all 0.2s'
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none' }}>
      <div style={{
        width: '100%', height: '100px', borderRadius: '10px', marginBottom: '10px',
        background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img
          src={image_url}
          alt={exact_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e: any) => {
            e.target.style.display = 'none'
            e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:12px">Không có ảnh</div>'
          }}
        />
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {exact_name}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-primary)' }}>
        {estimated_price}
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ImageIcon size={12} /> Bấm để xem ảnh
      </div>
    </div>
  )
}
