'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (query: string) => void
  loading: boolean
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Nhập tên linh kiện (ví dụ: So sánh giá CPU i5 12400F)..."
        disabled={loading}
        style={{
          flex: 1, padding: '12px 16px', borderRadius: '12px', border: 'none',
          background: 'var(--bg-surface)', color: 'var(--text-primary)',
          fontSize: '14px', outline: 'none', fontFamily: 'inherit'
        }}
      />
      <button onClick={handleSubmit} disabled={loading || !value.trim()}
        style={{
          padding: '12px 20px', borderRadius: '12px', border: 'none',
          background: loading ? 'var(--text-muted)' : 'var(--brand-primary)',
          color: '#000', cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'inherit'
        }}>
        {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        {loading ? 'Đang tra...' : 'Tra cứu'}
      </button>
    </div>
  )
}
