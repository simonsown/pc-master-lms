'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { supabase } from '@/lib/supabase'
import {
  Lock, Unlock, BookOpen, Search, ChevronRight, Zap,
  Calendar, Clock, Trophy, BookMarked, GraduationCap,
  Sparkles, Layers, Brain, Star, Shield
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
  { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34d399' },
  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
  { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
  { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', text: '#22d3ee' },
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f1a 100%)', color: 'var(--text-primary)' }}>
      {/* Decorative header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '280px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
              <Brain size={26} color="#fff" />
            </motion.div>
            <h1 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: 900, background: 'linear-gradient(135deg, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ngân Hàng Đề Thi</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 auto 12px', maxWidth: '500px' }}>
            Mỗi ngày mở khóa {DAILY_UNLOCK} chủ đề · {QUIZ_BANK.length} chủ đề · 10 câu hỏi/chủ đề
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
            <motion.div whileHover={{ scale: 1.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
              <Unlock size={14} /> {unlockedCount}/{QUIZ_BANK.length} đã mở
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              <Zap size={14} /> {xpEarned} XP
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {[
            { id: 'bank' as const, label: 'Câu hỏi', icon: Layers, color: '#818cf8' },
            { id: 'dictionary' as const, label: 'Từ điển thuật ngữ', icon: BookMarked, color: '#34d399' },
          ].map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
                borderColor: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? `${tab.color}15` : 'rgba(255,255,255,0.03)',
                color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s'
              }}>
              <tab.icon size={16} /> {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 24px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chủ đề hoặc thuật ngữ..."
            style={{
              width: '100%', padding: '12px 16px 12px 40px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.8)', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit', backdropFilter: 'blur(10px)',
            }} />
        </motion.div>

        {/* Content */}
        {activeTab === 'bank' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence mode="popLayout">
              {filteredQuizzes.map((quiz, index) => {
                const isUnlocked = index < unlockedCount
                const isCompleted = completedQuizzes.includes(quiz.id)
                const color = TOPIC_COLORS[index % TOPIC_COLORS.length]
                const diffColor = DIFFICULTY_COLORS[quiz.difficulty] || '#818cf8'

                return (
                  <motion.div key={quiz.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.03 }}>
                    {isUnlocked ? (
                      <Link href={`/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                        <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                            borderRadius: '16px', background: isCompleted ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                            backdropFilter: 'blur(10px)',
                          }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: isCompleted ? 'rgba(16,185,129,0.15)' : color.bg,
                            border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : color.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            fontSize: '20px',
                          }}>
                            {isCompleted ? <Trophy size={20} color="#34d399" /> : <GraduationCap size={20} color={color.text} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{quiz.title}</span>
                              {isCompleted && (
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontWeight: 600 }}>
                                  ✓ Hoàn thành
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12} /> {quiz.questions?.length || 10} câu</span>
                              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                              <span style={{ color: diffColor, fontWeight: 600, fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: `${diffColor}15` }}>{quiz.difficulty}</span>
                              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}><Zap size={12} /> +{quiz.xp || 100} XP</span>
                            </div>
                          </div>
                          <motion.div whileHover={{ x: 3 }} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.2)' }}>
                            <ChevronRight size={20} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                        borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)', opacity: 0.5,
                      }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Lock size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{quiz.title}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
                            Mở khóa sau · {quiz.questions?.length || 10} câu hỏi
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textAlign: 'center' }}>
              {filteredDictionary.length} thuật ngữ chuyên ngành
            </div>
            {filteredDictionary.map((item, i) => (
              <motion.div key={item.term} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.005, x: 4 }}
                style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'default', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
                    border: '1px solid rgba(52,211,153,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: '11px', fontWeight: 800, color: '#34d399'
                  }}>{item.term.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{item.term}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{item.def}</div>
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
