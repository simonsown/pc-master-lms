'use client'

import React, { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'

export default function PdfViewer({ url, title }: { url: string; title?: string }) {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)

  if (!url) return null

  const isGoogleDrive = url.includes('drive.google.com')
  const isPdf = url.toLowerCase().endsWith('.pdf')

  let embedUrl = url
  if (isGoogleDrive) {
    const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1]
    if (id) {
      embedUrl = `https://docs.google.com/gview?url=https://drive.google.com/uc?export=download&id=${id}&embedded=true`
    }
  }

  if (isGoogleDrive || !isPdf) {
    return (
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '80vh', border: 'none' }}
          title={title || 'PDF Viewer'}
          loading="lazy"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="pdf-viewer" style={{
      borderRadius: '12px', overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-elevated)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
              color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)', opacity: page <= 1 ? 0.4 : 1
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Trang {page} / {totalPages || '--'}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)', opacity: page >= totalPages ? 0.4 : 1
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            style={{ padding: '6px 8px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(2, s + 0.25))}
            style={{ padding: '6px 8px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
      <div style={{
        position: 'relative', width: '100%', minHeight: '300px',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: '16px', overflow: 'auto',
        background: 'var(--bg-base)'
      }}>
        {loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            color: 'var(--text-muted)'
          }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '12px' }}>Đang tải PDF...</span>
          </div>
        )}
        <iframe
          src={`${embedUrl}#page=${page}`}
          style={{
            width: '100%', maxWidth: '800px', height: '70vh', border: 'none',
            borderRadius: '8px', opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s'
          }}
          onLoad={() => setLoading(false)}
          title={title || 'PDF'}
          loading="lazy"
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
