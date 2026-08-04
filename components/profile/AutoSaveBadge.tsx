'use client'

import { CheckCircle2, Loader2, AlertTriangle, Cloud, PenLine } from 'lucide-react'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'

interface Props {
  status: AutoSaveStatus
}

export function AutoSaveBadge({ status }: Props) {
  const base = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid var(--border-default)',
  } as const

  if (status === 'saved') {
    return (
      <span style={{ ...base, color: '#22c55e', background: 'color-mix(in srgb, #22c55e 10%, transparent)', borderColor: 'color-mix(in srgb, #22c55e 25%, transparent)' }}>
        <CheckCircle2 size={14} /> Đã lưu tự động
      </span>
    )
  }
  if (status === 'saving') {
    return (
      <span style={{ ...base, color: 'var(--accent-blue)' }}>
        <Loader2 size={14} className="animate-spin" /> Đang lưu...
      </span>
    )
  }
  if (status === 'dirty') {
    return (
      <span style={{ ...base, color: 'var(--accent-amber)' }}>
        <PenLine size={14} /> Chưa lưu...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span style={{ ...base, color: '#ef4444', background: 'color-mix(in srgb, #ef4444 10%, transparent)', borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)' }}>
        <AlertTriangle size={14} /> Lỗi lưu
      </span>
    )
  }
  return (
    <span style={{ ...base, color: 'var(--text-muted)' }}>
      <Cloud size={14} /> Tự động lưu
    </span>
  )
}
