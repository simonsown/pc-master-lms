'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Play, Search, Clock, Sparkles, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface VideoItem {
  id: string
  youtubeId: string
  title: string
  category: string
  description: string
  duration: string
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao'
  author: string
  topics: string[]
}

// Video bài giảng sẽ được giáo viên đăng tải qua hệ thống LMS
// Danh sách trống - chờ nội dung từ giáo viên
const VIDEO_LESSONS: VideoItem[] = []

const CATEGORIES = [
  'Tất cả',
  'Bo Mạch Chủ',
  'Vi Xử Lý CPU',
  'Card Đồ Họa GPU',
  'Ổ Cứng SSD',
  'Bộ Nhớ RAM',
  'Tản Nhiệt CPU',
  'Quạt Case'
]

export default function VideoCoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    const currentTheme = root.getAttribute('data-theme')
    setIsDark(currentTheme !== 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  const filteredVideos = useMemo(() => {
    return VIDEO_LESSONS.filter(video => {
      const matchCat = selectedCategory === 'Tất cả' || video.category === selectedCategory
      const matchSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [selectedCategory, searchQuery])

  // Dynamic Theme Colors
  const bg = isDark ? '#0b1120' : '#f0f4f8'
  const textPrimary = isDark ? '#f8fafc' : '#0f172a'
  const textMuted = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? '#0f172a' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0'
  const inputBg = isDark ? '#0f172a' : '#ffffff'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textPrimary, transition: 'all 0.3s ease' }}>
      <Navbar />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '96px 20px 80px' }}>
        {/* Navigation Breadcrumb & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: textMuted }}>
            <Link href="/builder" style={{ color: '#00d2a0', textDecoration: 'none', fontWeight: 600 }}>Trang chủ Builder</Link>
            <span>/</span>
            <span style={{ color: textPrimary }}>Thư viện Video 3D Animation Linh Kiện</span>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              color: textPrimary,
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {isDark ? <Sun size={15} style={{ color: '#f59e0b' }} /> : <Moon size={15} style={{ color: '#6366f1' }} />}
            {isDark ? 'Sáng' : 'Tối'}
          </button>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #ede9fe 50%, #f0f9ff 100%)',
            borderRadius: 24, padding: '36px 36px', color: textPrimary,
            border: `1px solid ${isDark ? 'rgba(0, 212, 170, 0.25)' : 'rgba(0, 212, 170, 0.3)'}`,
            boxShadow: isDark ? '0 20px 50px rgba(0, 212, 170, 0.08)' : '0 8px 30px rgba(0,212,170,0.12)',
            marginBottom: 32, position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 780 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)',
              padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              color: '#00d2a0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14
            }}>
              <Sparkles size={14} /> 19 Videos 3D Animation Linh Kiện PC
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.3, letterSpacing: '-0.02em', color: textPrimary }}>
              Thư Viện Video 3D Animation Linh Kiện Máy Tính
            </h1>
            <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.6, margin: 0 }}>
              Mô phỏng 3D trực quan chi tiết về cấu tạo, nguyên lý hoạt động và quy trình xử lý dữ liệu của 7 nhóm linh kiện PC quan trọng nhất.
            </p>
          </div>
        </motion.div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 520 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm video linh kiện (CPU, RAM, GPU, Mainboard...)..."
              style={{
                width: '100%', padding: '14px 16px 14px 46px', borderRadius: 14,
                border: `1px solid ${cardBorder}`, background: inputBg, fontSize: 14,
                outline: 'none', color: textPrimary, boxSizing: 'border-box',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: active ? '1px solid #00d2a0' : `1px solid ${cardBorder}`,
                    whiteSpace: 'nowrap', transition: 'all 0.15s',
                    background: active ? 'rgba(0,212,170,0.15)' : cardBg,
                    color: active ? '#00d2a0' : textMuted,
                    boxShadow: active ? '0 4px 14px rgba(0,212,170,0.15)' : (isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.04)'),
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Video Grid */}
        <motion.div
          layout
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 26 }}
        >
          <AnimatePresence>
            {filteredVideos.map(video => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveVideo(video)}
                style={{
                  background: cardBg, borderRadius: 18, overflow: 'hidden',
                  border: `1px solid ${cardBorder}`, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                {/* Thumbnail Container */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#1e1b4b' }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('hqdefault.jpg')) {
                        target.src = `https://i.ytimg.com/vi/${video.youtubeId}/sddefault.jpg`;
                      }
                    }}
                  />
                  
                  {/* Play overlay button */}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00d2a0, #00b4d8)', color: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 6px 24px rgba(0,212,170,0.4)'
                    }}>
                      <Play size={22} style={{ marginLeft: 3, fill: '#000' }} />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(15,23,42,0.85)', color: '#ffffff',
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <Clock size={12} /> {video.duration}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#00d2a0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {video.category}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                      background: video.level === 'Cơ bản' ? 'rgba(16,185,129,0.15)' : video.level === 'Trung cấp' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: video.level === 'Cơ bản' ? '#10b981' : video.level === 'Trung cấp' ? '#f59e0b' : '#ef4444',
                      border: `1px solid ${video.level === 'Cơ bản' ? 'rgba(16,185,129,0.3)' : video.level === 'Trung cấp' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>
                      {video.level}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 800, color: textPrimary, margin: '0 0 10px', lineHeight: 1.4 }}>
                    {video.title}
                  </h3>

                  <p style={{
                    fontSize: 13, color: textMuted, margin: '0 0 18px', lineHeight: 1.6, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {video.description}
                  </p>

                  {/* Topics tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {video.topics.map(t => (
                      <span key={t} style={{
                        fontSize: 11, background: isDark ? '#1e293b' : '#f1f5f9',
                        color: textMuted, padding: '3px 9px', borderRadius: 6, fontWeight: 500,
                        border: `1px solid ${cardBorder}`
                      }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Video Modal Player */}
      {activeVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setActiveVideo(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 940, background: cardBg, borderRadius: 24,
              overflow: 'hidden', border: '1px solid rgba(0,212,170,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,170,0.15)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 28px', borderBottom: `1px solid ${cardBorder}`, background: cardBg
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00d2a0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeVideo.category}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: textPrimary, margin: '4px 0 0' }}>{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: `1px solid ${cardBorder}`,
                  background: isDark ? '#1e293b' : '#f1f5f9', color: textMuted, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* YouTube Embed */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: 28, background: cardBg }}>
              <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, margin: '0 0 20px' }}>
                {activeVideo.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: textMuted, paddingTop: 16, borderTop: `1px solid ${cardBorder}` }}>
                <span>Kênh sản xuất: <strong style={{ color: '#00d2a0' }}>{activeVideo.author}</strong></span>
                <span>Thời lượng: <strong style={{ color: textPrimary }}>{activeVideo.duration}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
