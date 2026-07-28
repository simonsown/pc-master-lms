'use client'

import React, { useState } from 'react'
import { ExternalLink, FileText, Download, Loader2 } from 'lucide-react'

export default function PdfViewer({ url, title }: { url: string; title?: string }) {
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!url) return null

  const isGoogleDrive = url.includes('drive.google.com')
  const driveId = url.match(/\/d\/(.+?)\/(?:view|preview|\/|$)/)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1]

  let embedUrl = url
  if (isGoogleDrive && driveId) {
    embedUrl = `https://drive.google.com/file/d/${driveId}/preview`
  } else if (!isGoogleDrive && (url.endsWith('.pdf') || url.includes('.pdf?'))) {
    embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
  }

  const directDownloadUrl = isGoogleDrive && driveId
    ? `https://drive.google.com/uc?export=download&id=${driveId}`
    : url

  return (
    <div style={{
      borderRadius: '12px', overflow: 'hidden',
      border: '1px solid var(--border-subtle, #e5e7eb)',
      background: 'var(--bg-elevated, #ffffff)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      {/* Top Header Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'var(--bg-surface, #f9fafb)',
        borderBottom: '1px solid var(--border-subtle, #e5e7eb)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
          <FileText size={16} color="var(--brand-primary, #4f46e5)" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            {title || 'Tài liệu PDF'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={directDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              background: 'var(--bg-elevated, #fff)', border: '1px solid var(--border-default, #d1d5db)',
              color: 'var(--text-primary, #374151)', textDecoration: 'none'
            }}
          >
            <Download size={13} /> Tải PDF
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              background: 'var(--brand-primary, #4f46e5)', color: '#ffffff', textDecoration: 'none'
            }}
          >
            <ExternalLink size={13} /> Mở tab mới
          </a>
        </div>
      </div>

      {/* Frame container */}
      <div style={{ position: 'relative', width: '100%', height: '540px', background: '#f3f4f6' }}>
        {loading && !hasError && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '8px', color: '#6b7280', background: '#f9fafb', zIndex: 1
          }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Đang tải tài liệu PDF...</span>
          </div>
        )}

        {hasError ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: '12px', padding: '24px', textAlign: 'center', color: '#374151'
          }}>
            <FileText size={40} color="#6b7280" />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Không thể xem trực tiếp file PDF này</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#4f46e5', color: '#fff',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none'
              }}
            >
              Mở liên kết trực tiếp
            </a>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setHasError(true); }}
            title={title || 'PDF Viewer'}
            allow="autoplay"
            allowFullScreen
          />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
