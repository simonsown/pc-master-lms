'use client'

import { AlertTriangle } from 'lucide-react'
import ComponentCard from './ComponentCard'

interface Component {
  id: string
  exact_name: string
  estimated_price: string
  image_url: string
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  components?: Component[]
  onComponentClick?: (component: Component) => void
  error?: boolean
}

export default function ChatMessage({ role, content, components, onComponentClick, error }: ChatMessageProps) {
  const isUser = role === 'user'

  if (error) {
    return (
      <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>Lỗi</div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{content}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      padding: isUser ? '12px 16px' : '16px',
      borderRadius: '14px',
      background: isUser ? 'var(--bg-surface)' : 'transparent',
      border: isUser ? '1px solid var(--border-default)' : 'none',
      maxWidth: isUser ? '80%' : '100%',
      alignSelf: isUser ? 'flex-end' : 'flex-start'
    }}>
      {!isUser && (
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'var(--brand-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>PC</span>
          Chuyên gia PC
        </div>
      )}
      <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{content}</p>
      {components && components.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(components.length, 3)}, 1fr)`, gap: '10px', marginTop: '4px' }}>
          {components.map((comp) => (
            <ComponentCard
              key={comp.id}
              exact_name={comp.exact_name}
              estimated_price={comp.estimated_price}
              image_url={comp.image_url}
              onClick={() => onComponentClick?.(comp)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
