'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { supabase } from '@/lib/supabase'
import {
  Lock, Unlock, Search, ChevronRight, Zap,
  Trophy, BookMarked, GraduationCap,
  Sparkles, Layers, Brain, Star, Swords,
  Crosshair, Diamond, Heart
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import Link from 'next/link'

const DICTIONARY = [
  { term: 'CPU', def: 'Central Processing Unit - Bộ xử lý trung tâm, não của máy tính' },
  { term: 'GPU', def: 'Graphics Processing Unit - Bộ xử lý đồ họa, xử lý hình ảnh' },
  { term: 'RAM', def: 'Random Access Memory - Bộ nhớ tạm thời, lưu dữ liệu đang xử lý' },
  { term: 'SSD', def: 'Solid State Drive - Ổ cứng thể rắn, lưu trữ dữ liệu tốc độ cao' },
  { term: 'HDD', def: 'Hard Disk Drive - Ổ cứng cơ, lưu trữ dung lượng lớn' },
  { term: 'PSU', def: 'Power Supply Unit - Bộ nguồn máy tính' },
  { term: 'TDP', def: 'Thermal Design Power - Công suất tỏa nhiệt tối đa' },
  { term: 'PCIe', def: 'Peripheral Component Interconnect Express - Chuẩn kết nối linh kiện' },
  { term: 'BIOS', def: 'Basic Input/Output System - Hệ thống xuất nhập cơ bản' },
  { term: 'UEFI', def: 'Unified Extensible Firmware Interface - Giao diện firmware hiện đại' },
  { term: 'VRAM', def: 'Video RAM - Bộ nhớ đồ họa trên GPU' },
  { term: 'DLSS', def: 'Deep Learning Super Sampling - Công nghệ nâng cao hình ảnh AI' },
  { term: 'XMP', def: 'Extreme Memory Profile - Hồ sơ ép xung RAM của Intel' },
  { term: 'DOCP', def: 'Direct Over Clock Profile - Hồ sơ ép xung RAM của AMD' },
  { term: 'NVMe', def: 'Non-Volatile Memory Express - Giao thức SSD tốc độ cao' },
  { term: 'M.2', def: 'Chuẩn kết nối SSD nhỏ gọn, tốc độ cao' },
  { term: 'SATA', def: 'Serial ATA - Chuẩn kết nối ổ cứng truyền thống' },
  { term: 'RGB', def: 'Red Green Blue - Hệ thống đèn LED màu trên linh kiện' },
  { term: 'AIO', def: 'All-In-One - Hệ thống tản nhiệt nước khép kín' },
  { term: 'RGB Header', def: 'Chân cắm đèn LED RGB trên mainboard' },
  { term: 'Form Factor', def: 'Kích thước chuẩn của mainboard (ATX, Micro-ATX, Mini-ITX)' },
  { term: 'Overclocking', def: 'Ép xung - Chạy linh kiện ở tốc độ cao hơn mặc định' },
  { term: 'Thermal Throttling', def: 'Giảm hiệu năng do quá nhiệt' },
  { term: 'Dual Channel', def: 'Chạy 2 thanh RAM song song để tăng băng thông' },
  { term: 'Cache', def: 'Bộ nhớ đệm tốc độ cao trong CPU' },
  { term: 'Pipeline', def: 'Dây chuyền xử lý lệnh trong CPU' },
  { term: 'Hyper-Threading', def: 'Công nghệ đa luồng của Intel' },
  { term: 'ECC RAM', def: 'Error-Correcting Code RAM - RAM sửa lỗi cho máy chủ' },
  { term: 'CAS Latency', def: 'Độ trễ của RAM, CL càng thấp càng nhanh' },
  { term: 'Ray Tracing', def: 'Mô phỏng tia sáng thực tế trong đồ họa' },
]

const UNLOCK_KEY = 'quiz_bank_unlock_date'
const DAILY_UNLOCK = 2

const TOPIC_COLORS = [
  { bg: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)', border: 'color-mix(in srgb, var(--accent-blue) 25%, transparent)', text: 'var(--accent-blue)' },
  { bg: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', border: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)', text: 'var(--brand-primary)' },
  { bg: 'color-mix(in srgb, var(--accent-amber) 12%, transparent)', border: 'color-mix(in srgb, var(--accent-amber) 25%, transparent)', text: 'var(--accent-amber)' },
  { bg: 'color-mix(in srgb, var(--danger) 12%, transparent)', border: 'color-mix(in srgb, var(--danger) 25%, transparent)', text: 'var(--danger)' },
  { bg: 'color-mix(in srgb, var(--accent-purple) 12%, transparent)', border: 'color-mix(in srgb, var(--accent-purple) 25%, transparent)', text: 'var(--accent-purple)' },
  { bg: 'color-mix(in srgb, var(--primary-neon) 12%, transparent)', border: 'color-mix(in srgb, var(--primary-neon) 25%, transparent)', text: 'var(--primary-neon)' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  'Dễ': '#34d399',
  'Trung bình': '#fbbf24',
  'Khó': '#f87171',
}

export default function QuizBankPage() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'bank' | 'dictionary'>('bank')
  const [searchTerm, setSearchTerm] = useState('')
  const [unlockedCount, setUnlockedCount] = useState(2)
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([])
  const [xpEarned, setXpEarned] = useState(0)

  useEffect(() => {
    checkDailyUnlock()
    loadCompletedQuizzes()
  }, [])

  function checkDailyUnlock() {
    const stored = localStorage.getItem(UNLOCK_KEY)
    const today = new Date().toISOString().slice(0, 10)
    if (stored !== today) {
      localStorage.setItem(UNLOCK_KEY, today)
      const baseUnlocked = 2
      const extra = Math.floor(QUIZ_BANK.length / 2)
      setUnlockedCount(Math.min(baseUnlocked + extra, QUIZ_BANK.length))
    } else {
      const saved = localStorage.getItem('quiz_bank_unlocked_count')
      setUnlockedCount(saved ? parseInt(saved) : 2)
    }
  }

  async function loadCompletedQuizzes() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('quiz_attempts')
        .select('quiz_id')
        .eq('student_id', user.id)
        .eq('status', 'passed')
      if (data) {
        setCompletedQuizzes(data.map(d => d.quiz_id))
      }
    } catch (e) {}
  }

  const filteredQuizzes = useMemo(() => {
    return QUIZ_BANK.filter(q =>
      !searchTerm || q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const filteredDictionary = useMemo(() => {
    if (!searchTerm) return DICTIONARY
    return DICTIONARY.filter(d =>
      d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.def.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const progressPercent = (completedQuizzes.length / QUIZ_BANK.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '280px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, color-mix(in srgb, var(--accent-blue) 8%, transparent) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>

        {/* Pixel Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '56px', height: '56px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px color-mix(in srgb, var(--accent-blue) 40%, transparent)',
                imageRendering: 'pixelated',
              }}>
              <Crosshair size={28} color="#fff" />
            </motion.div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '34px', fontWeight: 900,
              background: 'linear-gradient(135deg, var(--accent-blue), var(--brand-primary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '1px',
            }}>
              NGÂN HÀNG ĐỀ THI
            </h1>
          </div>

          {/* Pixel progress bar */}
          <div style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Tiến độ</span>
              <span>{completedQuizzes.length}/{QUIZ_BANK.length}</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--border-default)', imageRendering: 'pixelated' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
                style={{
                  height: '100%', borderRadius: '1px',
                  background: 'repeating-linear-gradient(90deg, var(--brand-primary) 0px, var(--brand-primary) 6px, var(--brand-light) 6px, var(--brand-light) 12px)',
                  transition: 'width 0.8s ease',
                }} />
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 auto 12px', maxWidth: '500px' }}>
            Mỗi ngày mở khóa {DAILY_UNLOCK} chủ đề · {QUIZ_BANK.length} chủ đề · 10 câu hỏi/chủ đề
          </p>

          {/* Stats badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
            <motion.div whileHover={{ scale: 1.05, y: -1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              <Unlock size={13} /> {unlockedCount}/{QUIZ_BANK.length}
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-amber) 20%, transparent)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              <Zap size={13} /> {xpEarned} XP
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', justifyContent: 'center' }}>
          {[
            { id: 'bank' as const, label: 'Câu hỏi', icon: Swords, color: 'var(--accent-blue)' },
            { id: 'dictionary' as const, label: 'Từ điển thuật ngữ', icon: BookMarked, color: 'var(--brand-primary)' },
          ].map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '12px', fontWeight: activeTab === tab.id ? 800 : 500,
                borderColor: activeTab === tab.id ? tab.color : 'var(--border-default)',
                background: activeTab === tab.id ? 'color-mix(in srgb, ' + tab.color + ' 12%, transparent)' : 'transparent',
                color: activeTab === tab.id ? tab.color : 'var(--text-muted)',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
              <tab.icon size={14} /> {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 24px' }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="🔍 Tìm kiếm chủ đề hoặc thuật ngữ..."
            style={{
              width: '100%', padding: '10px 16px 10px 38px', borderRadius: '4px',
              border: '1px solid var(--border-default)', background: 'transparent',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
              fontFamily: 'inherit',
            }} />
        </motion.div>

        {/* Content */}
        {activeTab === 'bank' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence mode="popLayout">
              {filteredQuizzes.map((quiz, index) => {
                const isUnlocked = index < unlockedCount
                const isCompleted = completedQuizzes.includes(quiz.id)
                const color = TOPIC_COLORS[index % TOPIC_COLORS.length]
                const diffColor = DIFFICULTY_COLORS[quiz.difficulty] || 'var(--accent-blue)'

                return (
                  <motion.div key={quiz.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.03 }}>
                    {isUnlocked ? (
                      <Link href={`/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                        <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                            borderRadius: isCompleted ? '4px' : '4px',
                            background: isCompleted ? 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' : 'var(--bg-surface)',
                            border: `1px solid ${isCompleted ? 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' : 'var(--border-default)'}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                            position: 'relative', overflow: 'hidden',
                          }}>
                          {/* Pixel corner decorations */}
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderTop: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: isCompleted ? 0.5 : 0.2 }} />
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', borderTop: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: isCompleted ? 0.5 : 0.2 }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: isCompleted ? 0.5 : 0.2 }} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: isCompleted ? 0.5 : 0.2 }} />

                          <div style={{
                            width: '44px', height: '44px', borderRadius: '4px',
                            background: isCompleted ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' : color.bg,
                            border: `1px solid ${isCompleted ? 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' : color.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {isCompleted ? <Diamond size={18} style={{ color: 'var(--brand-primary)' }} /> : <Swords size={18} style={{ color: color.text }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{quiz.title}</span>
                              {isCompleted && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '2px', background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                  CLEAR
                                </motion.span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)' }}>
                                <Layers size={11} /> {quiz.questions?.length || 10}
                              </span>
                              <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                              <span style={{ color: diffColor, fontWeight: 700, fontSize: '10px', padding: '1px 5px', borderRadius: '2px', border: `1px solid ${diffColor}40`, fontFamily: 'var(--font-mono)' }}>{quiz.difficulty}</span>
                              <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                                <Zap size={11} /> +{quiz.xp || 100}
                              </span>
                            </div>
                          </div>
                          <motion.div whileHover={{ x: 3 }} style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                            <ChevronRight size={18} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)', opacity: 0.5,
                      }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Lock size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{quiz.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            🔒 Mở khóa sau · {quiz.questions?.length || 10} câu hỏi
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              [{filteredDictionary.length} thuật ngữ]
            </div>
            {filteredDictionary.map((item, i) => (
              <motion.div key={item.term} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.005, x: 4 }}
                style={{ padding: '10px 14px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', cursor: 'default', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '2px',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 15%, transparent), color-mix(in srgb, var(--brand-primary) 5%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: '10px', fontWeight: 800, color: 'var(--brand-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}>{item.term.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.term}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{item.def}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
