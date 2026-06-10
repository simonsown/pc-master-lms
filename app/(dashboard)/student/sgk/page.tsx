'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, ChevronLeft, ChevronRight, Maximize2, Minimize2, ExternalLink, Youtube, Download } from 'lucide-react'

export const SGK_BOOKS = [
  {
    id: 'tin10',
    title: 'Tin học 10 - Kết nối tri thức',
    pdfUrl: '/api/pdf?file=sach-tin10.pdf',
    pdfDirectUrl: '/sach-tin10.pdf',
    color: '#289cf9',
    chapters: [
      'Chương 1: Máy tính và xã hội tri thức',
      'Chương 2: Mạng máy tính và Internet',
      'Chương 3: Đạo đức, pháp luật và văn hóa trong môi trường số',
      'Chương 4: Ứng dụng tin học',
      'Chương 5: Giải quyết vấn đề với sự trợ giúp của máy tính',
    ],
    videos: [
      { title: 'Bài 1: Thông tin và xử lý thông tin', id: 'ROqVwWXivrU' },
      { title: 'Bài 2: Sự ưu việt của máy tính', id: 'iksSNRTCZYg' },
    ]
  },
  {
    id: 'tin11',
    title: 'Tin học 11 - Tin học ứng dụng',
    pdfUrl: '/api/pdf?file=sach-tin11.pdf',
    pdfDirectUrl: '/sach-tin11.pdf',
    color: '#8b5cf6',
    chapters: [
      'Chương 1: Hệ cơ sở dữ liệu',
      'Chương 2: Hệ quản trị cơ sở dữ liệu',
      'Chương 3: Phần mềm bảng tính và ứng dụng',
      'Chương 4: Phần mềm trình chiếu nâng cao',
    ],
    videos: [
      { title: 'Bài 1: Hệ cơ sở dữ liệu', id: 'OICNS79D-OI' },
    ]
  }
]

export default function SGKPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [tab, setTab] = useState<'book' | 'video'>('book')
  const [origin, setOrigin] = useState('')

  React.useEffect(() => { setOrigin(window.location.origin) }, [])

  const book = SGK_BOOKS.find(s => s.id === selectedBook)

  if (selectedBook && book) {
    return (
      <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-[9999] bg-[#0f0f1a]' : ''}`}>
        <div className="flex items-center justify-between p-4" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <ChevronLeft size={18} /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-surface)' }}>
              <button onClick={() => setTab('book')}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: tab === 'book' ? book.color + '30' : 'transparent',
                  color: tab === 'book' ? book.color : 'var(--text-muted)',
                  fontWeight: tab === 'book' ? 700 : 400, fontSize: '12px', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                <BookOpen size={14} /> Sách
              </button>
              <button onClick={() => setTab('video')}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: tab === 'video' ? '#ef444420' : 'transparent',
                  color: tab === 'video' ? '#ef4444' : 'var(--text-muted)',
                  fontWeight: tab === 'video' ? 700 : 400, fontSize: '12px', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                <Youtube size={14} /> Video
              </button>
            </div>
            {tab === 'book' && <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Trang {pageNum}</span>
              <button onClick={() => setFullscreen(!fullscreen)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: book.color + '20', color: book.color, textDecoration: 'none', border: `1px solid ${book.color}40` }}>
                <ExternalLink size={14} /> Mở ngoài
              </a>
            </>}
          </div>
        </div>

        {tab === 'book' ? (
          <>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" style={{ background: '#1a1a2e' }}>
              {origin ? (
                <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(origin + book.pdfDirectUrl)}&embedded=true`} className="w-full h-full rounded-lg shadow-2xl" style={{ border: 'none', maxWidth: fullscreen ? '100%' : '900px' }} title={book.title} />
              ) : (
                <iframe src={book.pdfUrl + '#view=FitH'} className="w-full h-full rounded-lg shadow-2xl" style={{ border: 'none', maxWidth: fullscreen ? '100%' : '900px' }} title={book.title} />
              )}
            </div>
            <div className="flex items-center justify-center gap-4 p-3" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
              <a href={book.pdfDirectUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: book.color + '20', color: book.color, textDecoration: 'none', border: `1px solid ${book.color}40` }}>
                <Download size={14} /> Tải PDF
              </a>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6" style={{ background: '#0f0f1a' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Youtube size={22} color="#ef4444" />
                Video bài giảng - {book.title}
              </h2>
              <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {book.videos.map((v, i) => (
                  <div key={i} style={{
                    borderRadius: '14px', overflow: 'hidden',
                    background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${v.id}`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={v.title}
                      />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '13px', margin: 0 }}>{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Sách giáo khoa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>Tra cứu sách giáo khoa Tin học trực tuyến.</p>
      </motion.div>

      <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {SGK_BOOKS.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => { setSelectedBook(s.id); setTab('book'); }}
            className="lms-card"
            style={{
              padding: '28px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s',
              border: `1px solid ${s.color}20`,
              background: `linear-gradient(135deg, ${s.color}08, transparent)`
            }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BookOpen size={28} color={s.color} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{s.title}</h2>
            <div className="flex flex-col gap-2 mb-4">
              {s.chapters.map((ch, j) => (
                <div key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <FileText size={14} style={{ color: s.color, opacity: 0.6 }} />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: s.color }}>
                <BookOpen size={16} /> Xem sách
              </div>
              {s.videos.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#ef4444' }}>
                  <Youtube size={16} /> {s.videos.length} video
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
