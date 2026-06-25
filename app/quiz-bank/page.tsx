'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { supabase } from '@/lib/supabase'
import {
  Lock, Unlock, BookOpen, Search, ChevronRight, Zap,
  Calendar, Clock, Trophy, BookMarked, GraduationCap
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookMarked size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 900 }}>Ngân Hàng Đề Thi</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 auto 8px', maxWidth: '500px' }}>
            Mỗi ngày mở khóa {DAILY_UNLOCK} chủ đề mới · Mỗi chủ đề 10-15 câu hỏi
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Unlock size={14} color="var(--brand-primary)" /> Đã mở khóa: {unlockedCount}/{QUIZ_BANK.length}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={14} color="#f59e0b" /> XP đã nhận: {xpEarned}</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {[
            { id: 'bank' as const, label: 'Câu hỏi', icon: BookOpen, color: 'var(--brand-primary)' },
            { id: 'dictionary' as const, label: 'Từ điển thuật ngữ', icon: BookMarked, color: '#f59e0b' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
                borderColor: activeTab === tab.id ? tab.color : 'var(--border-default)',
                background: activeTab === tab.id ? `${tab.color}15` : 'var(--bg-elevated)',
                color: activeTab === tab.id ? tab.color : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 24px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px',
              border: '1px solid var(--border-default)', background: 'var(--bg-surface)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit'
            }} />
        </div>

        {/* Content */}
        {activeTab === 'bank' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredQuizzes.map((quiz, index) => {
              const isUnlocked = index < unlockedCount
              const isCompleted = completedQuizzes.includes(quiz.id)
              return (
                <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  {isUnlocked ? (
                    <Link href={`/quiz/${quiz.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                        borderRadius: '14px', background: isCompleted ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                        border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--border-default)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(8,158,96,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {isCompleted ? <Trophy size={20} color="#10b981" /> : <GraduationCap size={20} color="var(--brand-primary)" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{quiz.title}</span>
                            {isCompleted && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }}>✓ Hoàn thành</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span>{quiz.questions?.length || 10} câu</span>
                            <span>·</span>
                            <span>{quiz.difficulty}</span>
                            <span>·</span>
                            <span>+{quiz.xp || 100} XP</span>
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                    </Link>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                      borderRadius: '14px', background: 'var(--bg-surface)', opacity: 0.5,
                      border: '1px solid var(--border-default)'
                    }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)' }}>{quiz.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Mở khóa sau · {quiz.questions?.length || 10} câu hỏi
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
              {filteredDictionary.length} thuật ngữ chuyên ngành máy tính
            </div>
            {filteredDictionary.map((item, i) => (
              <motion.div key={item.term} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: '11px', fontWeight: 800, color: '#f59e0b'
                  }}>{item.term.slice(0, 2)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.term}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.def}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
