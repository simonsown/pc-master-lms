'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, Sparkles, Play, Moon, Sun, Maximize2, Minimize2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface SlideDeck {
  id: string
  title: string
  author: string
  badge: string
  color: string
  icon: string
  folder: string      // folder name in /public/slides/
  totalPages: number
  description: string
}

const SLIDE_DECKS: SlideDeck[] = [
  {
    id: 'slide-1',
    title: 'Slide 1: Tổng quan Máy tính & Phần cứng',
    author: 'Giáo trình Kỹ Thuật Máy Tính PC',
    badge: 'Slide Gốc từ Scribd',
    color: '#00d2a0',
    icon: '📑',
    folder: 'slide-1',
    totalPages: 28,
    description: 'Bộ slide tổng quan về máy tính và phần cứng PC từ tài liệu Scribd chuẩn.'
  },
  {
    id: 'chuong1-hardware',
    title: 'Chương 1: Giới thiệu Phần cứng máy tính PC',
    author: 'Giáo trình Kỹ thuật Phần cứng PC Toàn Tập',
    badge: 'Giáo trình Chính Thức',
    color: '#6366f1',
    icon: '🖥️',
    folder: 'chuong1-hardware',
    totalPages: 58,
    description: 'Nội dung chương 1 về lịch sử, cấu trúc và thành phần cơ bản của máy tính PC.'
  },
  {
    id: 'ic3-hardware',
    title: 'IC3 Spark: Phần cứng & Thiết bị Số',
    author: 'Chuẩn IC3 Spark GS5 – Digital Literacy',
    badge: 'Chuẩn Quốc Tế IC3',
    color: '#3b82f6',
    icon: '💻',
    folder: 'ic3-hardware',
    totalPages: 22,
    description: 'Giáo trình IC3 Spark chuẩn quốc tế về phần cứng máy tính và thiết bị kỹ thuật số.'
  },
]

interface SlideViewerProps {
  onBack?: () => void
  isUnlocked?: boolean
  onRequestUpgrade?: () => void
}

export default function SlideViewer({ onBack, isUnlocked = false, onRequestUpgrade }: SlideViewerProps) {
  const [activeDeckId, setActiveDeckId] = useState('slide-1')
  const [isDark, setIsDark] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [imgScale, setImgScale] = useState(1.0)
  const [imgLoading, setImgLoading] = useState(true)

  const activeDeck = SLIDE_DECKS.find(d => d.id === activeDeckId) || SLIDE_DECKS[0]
  const imgSrc = `/slides/${activeDeck.folder}/${pageNumber}.png`
  const pdfSrc = `/api/pdf?file=${activeDeck.folder === 'slide-1' ? '839799900-Slide-1.pdf' : activeDeck.folder === 'chuong1-hardware' ? 'chuong1-gioi-thieu-ve-phan-cung-cua-may-PC.pdf' : 'Giao-Trinh-IC3-Phan-Cung-May-Tinh.pdf'}`

  // Sync theme on mount
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark'
    setIsDark(currentTheme === 'dark')
  }, [])

  // Reset page when deck changes
  useEffect(() => {
    setPageNumber(1)
    setImgLoading(true)
  }, [activeDeckId])

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  const prevPage = () => { if (pageNumber > 1) { setPageNumber(p => p - 1); setImgLoading(true) } }
  const nextPage = () => { if (pageNumber < activeDeck.totalPages) { setPageNumber(p => p + 1); setImgLoading(true) } }
  const zoomIn  = () => setImgScale(s => Math.min(s + 0.15, 2.0))
  const zoomOut = () => setImgScale(s => Math.max(s - 0.15, 0.5))

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevPage()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pageNumber, activeDeck.totalPages])

  // Theme colors
  const bg        = isDark ? '#090d16' : '#f0f4f8'
  const cardBg    = isDark ? '#0f172a' : '#ffffff'
  const cardBorder= isDark ? '#1e293b' : '#e2e8f0'
  const textPri   = isDark ? '#f8fafc' : '#0f172a'
  const textMuted = isDark ? '#94a3b8' : '#64748b'
  const barBg     = isDark ? '#16213e' : '#f8fafc'

  // Thumbnail strip pages: show 5 around current
  const thumbPages: number[] = []
  const start = Math.max(1, pageNumber - 2)
  const end   = Math.min(activeDeck.totalPages, start + 4)
  for (let i = start; i <= end; i++) thumbPages.push(i)

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textPri, transition: 'all 0.3s ease' }}>
      <Navbar />
      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '96px 20px 80px' }}>

        {/* Breadcrumb + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: textMuted }}>
            <Link href="/builder" style={{ color: '#00d2a0', textDecoration: 'none', fontWeight: 700 }}>Builder</Link>
            <span>/</span>
            <span style={{ color: textPri, fontWeight: 600 }}>Slide Bài Học</span>
          </div>
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
            cursor: 'pointer', background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: textPri,
            fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {isDark ? <Sun size={15} style={{ color: '#f59e0b' }} /> : <Moon size={15} style={{ color: '#6366f1' }} />}
            {isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
          </button>
        </div>

        {/* Header */}
        <div style={{
          background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #ede9fe 50%, #f0f9ff 100%)',
          borderRadius: 24, padding: '26px 32px', marginBottom: 20,
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
          boxShadow: isDark ? '0 20px 50px rgba(99,102,241,0.1)' : '0 8px 30px rgba(99,102,241,0.12)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8
            }}>
              <Sparkles size={13} /> Slide Viewer – Phần Cứng PC
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', color: textPri }}>
              Hệ Thống Slide Bài Học Phần Cứng Máy Tính PC
            </h1>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              Xem ảnh slide trực tiếp từ {activeDeck.totalPages} trang — Dùng ← → để lật trang
            </p>
          </div>
          <Link href="/video-courses" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #00d2a0, #00b4d8)',
            color: '#000', fontWeight: 800, fontSize: 13, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,212,170,0.3)', whiteSpace: 'nowrap'
          }}>
            <Play size={15} fill="#000" /> Video 3D Animation
          </Link>
        </div>

        {/* Deck Tabs */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
          {SLIDE_DECKS.map((deck, idx) => {
            const active = deck.id === activeDeckId
            const isDeckLocked = idx >= 1 && !isUnlocked
            return (
              <button key={deck.id} onClick={() => {
                if (isDeckLocked) {
                  if (onRequestUpgrade) onRequestUpgrade()
                } else {
                  setActiveDeckId(deck.id)
                }
              }} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px',
                borderRadius: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                background: active ? `${deck.color}18` : cardBg,
                border: active ? `1.5px solid ${deck.color}` : `1px solid ${cardBorder}`,
                color: active ? textPri : textMuted,
                opacity: isDeckLocked ? 0.7 : 1,
                boxShadow: active ? `0 4px 20px ${deck.color}25` : (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)')
              }}>
                <span style={{ fontSize: 20 }}>{isDeckLocked ? '🔒' : deck.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? textPri : textMuted }}>{deck.title}</div>
                  <div style={{ fontSize: 10, color: isDeckLocked ? '#f59e0b' : deck.color, fontWeight: 600 }}>
                    {isDeckLocked ? '🔒 Gói Pro' : `${deck.badge} · ${deck.totalPages} trang`}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>

          {/* Slide Image Viewer */}
          <div style={{
            background: cardBg, borderRadius: 22,
            border: `1px solid ${isDark ? activeDeck.color + '30' : activeDeck.color + '40'}`,
            overflow: 'hidden',
            boxShadow: isDark ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${activeDeck.color}15` : `0 8px 30px rgba(0,0,0,0.1)`,
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '11px 18px', background: barBg,
              borderBottom: `1px solid ${cardBorder}`,
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{activeDeck.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: textPri }}>{activeDeck.title}</div>
                  <div style={{ fontSize: 11, color: activeDeck.color, fontWeight: 600 }}>{activeDeck.author}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Page nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 8, padding: '3px 8px' }}>
                  <button onClick={prevPage} disabled={pageNumber <= 1}
                    style={{ background: 'none', border: 'none', color: pageNumber <= 1 ? textMuted : textPri, cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', padding: 2 }}>
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 800, color: textPri, minWidth: 70, textAlign: 'center' }}>
                    {pageNumber} / {activeDeck.totalPages}
                  </span>
                  <button onClick={nextPage} disabled={pageNumber >= activeDeck.totalPages}
                    style={{ background: 'none', border: 'none', color: pageNumber >= activeDeck.totalPages ? textMuted : textPri, cursor: pageNumber >= activeDeck.totalPages ? 'not-allowed' : 'pointer', padding: 2 }}>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Zoom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 8, padding: '3px 8px' }}>
                  <button onClick={zoomOut} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 2 }}><ZoomOut size={15} /></button>
                  <span style={{ fontSize: 11, fontWeight: 700, color: textPri, minWidth: 36, textAlign: 'center' }}>{Math.round(imgScale * 100)}%</span>
                  <button onClick={zoomIn} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 2 }}><ZoomIn size={15} /></button>
                </div>

                {/* Download PDF */}
                <a href={pdfSrc} download style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                  fontSize: 12, fontWeight: 700, background: `${activeDeck.color}18`, color: activeDeck.color,
                  border: `1px solid ${activeDeck.color}50`, textDecoration: 'none'
                }}>
                  <Download size={12} /> Tải PDF
                </a>

                <button onClick={() => setIsFullscreen(!isFullscreen)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, background: isDark ? '#1e293b' : '#f1f5f9',
                  border: `1px solid ${cardBorder}`, color: textMuted,
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn'}
                </button>
              </div>
            </div>

            {/* Slide Image Area */}
            <div style={{
              flex: 1, minHeight: isFullscreen ? 'calc(100vh - 220px)' : '70vh',
              background: isDark ? '#0b1120' : '#dde3ea',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'auto', padding: 24, position: 'relative'
            }}>
              {imgLoading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 10, color: textMuted
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `3px solid ${activeDeck.color}40`,
                    borderTop: `3px solid ${activeDeck.color}`,
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Đang tải slide {pageNumber}...</span>
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imgSrc}
                src={imgSrc}
                alt={`Slide ${pageNumber}`}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)}
                style={{
                  display: imgLoading ? 'none' : 'block',
                  maxWidth: '100%',
                  transform: `scale(${imgScale})`,
                  transformOrigin: 'top center',
                  borderRadius: 10,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                  cursor: 'grab',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            <div style={{ padding: '10px 18px', background: barBg, borderTop: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>Xem nhanh:</span>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
                {thumbPages.map(p => (
                  <button key={p} onClick={() => { setPageNumber(p); setImgLoading(true) }} style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                    background: p === pageNumber ? activeDeck.color : (isDark ? '#1e293b' : '#e2e8f0'),
                    color: p === pageNumber ? '#000' : textMuted,
                    border: `1px solid ${p === pageNumber ? activeDeck.color : cardBorder}`
                  }}>
                    Tr.{p}
                  </button>
                ))}
                {pageNumber > 4 && <span style={{ color: textMuted, fontSize: 12, alignSelf: 'center' }}>...</span>}
              </div>
              <span style={{ fontSize: 11, color: activeDeck.color, fontWeight: 800, whiteSpace: 'nowrap' }}>
                ← → phím mũi tên
              </span>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* About */}
            <div style={{ background: cardBg, borderRadius: 18, padding: 18, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Về bài học này
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: textPri, marginBottom: 4 }}>
                {activeDeck.icon} {activeDeck.title}
              </div>
              <div style={{ fontSize: 11, color: activeDeck.color, fontWeight: 700, marginBottom: 10 }}>
                {activeDeck.author}
              </div>
              <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.6, margin: '0 0 12px' }}>
                {activeDeck.description}
              </p>
              {/* Progress Bar */}
              <div style={{ height: 6, background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, transition: 'width 0.3s ease',
                  background: activeDeck.color,
                  width: `${Math.round((pageNumber / activeDeck.totalPages) * 100)}%`
                }} />
              </div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 4, textAlign: 'right' }}>
                {Math.round((pageNumber / activeDeck.totalPages) * 100)}% hoàn thành
              </div>
            </div>

            {/* Other Decks */}
            <div style={{ background: cardBg, borderRadius: 18, padding: 14, border: `1px solid ${cardBorder}`, boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: textPri, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Bộ Slide Khác</span>
                <BookOpen size={14} style={{ color: '#00d2a0' }} />
              </div>
              {SLIDE_DECKS.filter(d => d.id !== activeDeckId).map(deck => (
                <button key={deck.id} onClick={() => setActiveDeckId(deck.id)} style={{
                  width: '100%', padding: '11px 13px', borderRadius: 12, textAlign: 'left',
                  fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 8,
                  background: isDark ? '#16213e' : '#f8fafc',
                  border: `1px solid ${cardBorder}`, color: textMuted, fontWeight: 500
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = deck.color; e.currentTarget.style.color = textPri }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.color = textMuted }}
                >
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{deck.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 2, color: textPri }}>{deck.title}</div>
                  <div style={{ fontSize: 10, color: deck.color }}>{deck.badge} · {deck.totalPages} trang</div>
                </button>
              ))}
            </div>

            {/* Video Link */}
            <div style={{
              background: isDark ? 'rgba(0,212,170,0.06)' : 'rgba(0,212,170,0.08)',
              borderRadius: 18, padding: 16,
              border: `1px solid ${isDark ? 'rgba(0,212,170,0.2)' : 'rgba(0,212,170,0.25)'}`
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: textPri, marginBottom: 5 }}>🎬 Học thêm qua Video 3D</div>
              <p style={{ fontSize: 12, color: textMuted, margin: '0 0 10px', lineHeight: 1.5 }}>
                19 video 3D Animation chi tiết về các linh kiện PC.
              </p>
              <Link href="/video-courses" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px', borderRadius: 10,
                background: 'rgba(0,212,170,0.15)', color: '#00d2a0',
                fontWeight: 700, fontSize: 12, textDecoration: 'none',
                border: '1px solid rgba(0,212,170,0.3)'
              }}>
                <Play size={13} fill="#00d2a0" /> Xem Video 3D Animation
              </Link>
            </div>

          </div>
        </div>

      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
