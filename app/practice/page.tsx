'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  FileQuestion, BookOpen, BarChart3, ArrowRight,
  GraduationCap, Sparkles, ChevronRight,
  AlertTriangle, Cpu, HardDrive, CircuitBoard,
  Monitor, Battery, Wrench, Send, MessageSquare
} from 'lucide-react'

const TABS = [
  { id: 'exams', label: 'Kỳ Thi', icon: FileQuestion, color: '#6366f1', desc: 'Đề thi do giáo viên giao' },
  { id: 'bank', label: 'Ngân Hàng Đề Thi', icon: BookOpen, color: '#00d4aa', desc: '22 chủ đề phần cứng, mở khóa theo ngày' },
  { id: 'leaderboard', label: 'Xếp Hạng', icon: BarChart3, color: '#f59e0b', desc: 'Bảng xếp hạng toàn hệ thống' },
  { id: 'error-analysis', label: 'Phân Tích Lỗi Sai', icon: AlertTriangle, color: '#ef4444', desc: 'Phân tích lỗi thường gặp khi lắp ráp PC' },
]

const TAB_LINKS: Record<string, string> = {
  exams: '/exams',
  bank: '/daily-quiz',
  leaderboard: '/leaderboard',
}

const CATEGORIES = [
  {
    id: 'cpu', label: 'CPU', icon: Cpu, color: '#6366f1',
    mistakes: [
      { id: 'socket', title: 'Sai socket CPU', desc: 'Lắp CPU vào sai socket có thể làm cong hoặc gãy chân cắm. Mỗi dòng CPU chỉ tương thích với một số chipset nhất định.', tip: 'Luôn kiểm tra socket trên mainboard (LGA 1700, AM5...) trước khi mua CPU.' },
      { id: 'cooler', title: 'Quên lắp tản nhiệt', desc: 'Khởi động máy không có tản nhiệt sẽ khiến CPU đạt nhiệt độ nguy hiểm (90-100°C+) trong vài giây, gây tắt máy hoặc hỏng vĩnh viễn.', tip: 'Luôn lắp tản nhiệt kèm keo tản nhiệt trước khi cấp nguồn lần đầu.' },
      { id: 'thermal', title: 'Bôi keo tản nhiệt sai', desc: 'Bôi quá nhiều keo gây tràn ra ngoài, bôi quá ít làm giảm khả năng dẫn nhiệt. Cả hai đều ảnh hưởng đến hiệu suất.', tip: 'Bôi một lượng bằng hạt đậu xanh ở giữa CPU, tản nhiệt sẽ tự ép đều.' },
    ]
  },
  {
    id: 'ram', label: 'RAM', icon: HardDrive, color: '#00d4aa',
    mistakes: [
      { id: 'channel', title: 'Cắm sai kênh Dual Channel', desc: 'Cắm 2 thanh RAM vào cùng một kênh (cùng màu) thay vì xen kẽ sẽ làm giảm băng thông bộ nhớ đáng kể.', tip: 'Cắm RAM vào khe thứ 2 và thứ 4 (tính từ CPU) để kích hoạt Dual Channel.' },
      { id: 'speed', title: 'Không bật XMP/DOCP', desc: 'Chạy RAM ở tốc độ mặc định (2133/2400MHz) thay vì tốc độ nhà sản xuất ghi trên vỏ.', tip: 'Vào BIOS bật XMP (Intel) hoặc DOCP (AMD) để đạt tốc độ RAM tối đa.' },
    ]
  },
  {
    id: 'mainboard', label: 'Mainboard', icon: CircuitBoard, color: '#a855f7',
    mistakes: [
      { id: 'standoff', title: 'Thiếu chân đế mainboard', desc: 'Bắt vít mainboard trực tiếp vào case mà không có chân đế có thể gây chập mạch, hỏng linh kiện.', tip: 'Luôn lắp đủ chân đế (standoff) trước khi đặt mainboard vào case.' },
      { id: 'io-shield', title: 'Quên IO Shield', desc: 'Lắp mainboard xong mới phát hiện quên IO Shield ở mặt sau, phải tháo ra lắp lại từ đầu.', tip: 'Lắp IO Shield vào case TRƯỚC khi bắt vít mainboard.' },
    ]
  },
  {
    id: 'gpu', label: 'GPU', icon: Monitor, color: '#22c55e',
    mistakes: [
      { id: 'pcie', title: 'Cắm PCIe không chốt', desc: 'Không cắm GPU hết hàng hoặc quên chốt an toàn có thể làm GPU bị lỏng, gây mất tín hiệu.', tip: 'Đẩy GPU cho đến khi nghe tiếng "click" của chốt PCIe.' },
      { id: 'power', title: 'Quên cấp nguồn GPU', desc: 'GPU cao cấp cần cáp nguồn riêng (6/8 pin). Nhiều người lắp xong không cắm nguồn cho GPU.', tip: 'Luôn kiểm tra GPU cần bao nhiêu đầu nối nguồn trước khi lắp.' },
    ]
  },
  {
    id: 'psu', label: 'PSU', icon: Battery, color: '#f59e0b',
    mistakes: [
      { id: 'wattage', title: 'Chọn PSU thiếu công suất', desc: 'Dùng PSU công suất thấp hơn yêu cầu gây treo máy, restart ngẫu nhiên khi tải nặng.', tip: 'Tính tổng TDP các linh kiện và chọn PSU dư 20-30% công suất.' },
      { id: 'modular', title: 'Không quản lý dây nguồn', desc: 'Dây nguồn lộn xộn cản trở luồng khí, làm nhiệt độ linh kiện tăng cao.', tip: 'Dùng PSU modular và gọn dây bằng dây rút hoặc ống dẫn cáp.' },
    ]
  },
  {
    id: 'assembly', label: 'Lắp ráp', icon: Wrench, color: '#06b6d4',
    mistakes: [
      { id: 'static', title: 'Không chống tĩnh điện', desc: 'Tĩnh điện từ cơ thể có thể phá hủy linh kiện nhạy cảm như RAM, CPU, mainboard.', tip: 'Đeo dây chống tĩnh điện hoặc chạm vào vỏ case kim loại trước khi chạm linh kiện.' },
      { id: 'cable', title: 'Sắp xếp dây lộn xộn', desc: 'Dây cáp vướng vào quạt hoặc che khuất các cổng kết nối quan trọng.', tip: 'Luồn dây ra mặt sau case và dùng dây rút để cố định.' },
    ]
  },
]

let questionId = 0

export default function PracticePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('exams')
  const [selectedCategory, setSelectedCategory] = useState('cpu')
  const [expandedMistake, setExpandedMistake] = useState<string | null>(null)
  const [questions, setQuestions] = useState<{ id: number; text: string }[]>([])
  const [questionInput, setQuestionInput] = useState('')

  const handleAddQuestion = () => {
    const text = questionInput.trim()
    if (!text) return
    setQuestions(prev => [...prev, { id: ++questionId, text }])
    setQuestionInput('')
  }

  const ErrorAnalysisContent = () => {
    const category = CATEGORIES.find(c => c.id === selectedCategory)
    return (
      <div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon
            const isCatSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setExpandedMistake(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', border: '1px solid',
                  borderColor: isCatSelected ? cat.color : 'var(--border-default)',
                  background: isCatSelected ? `${cat.color}15` : 'var(--bg-elevated)',
                  color: isCatSelected ? cat.color : 'var(--text-muted)',
                  fontWeight: isCatSelected ? 700 : 500,
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <CatIcon size={16} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {category && (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}
          >
            {category.mistakes.map(mistake => {
              const isExpanded = expandedMistake === mistake.id
              return (
                <motion.div
                  key={mistake.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--bg-surface)', borderRadius: '14px',
                    border: '1px solid', borderColor: isExpanded ? category.color : 'var(--border-default)',
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => setExpandedMistake(isExpanded ? null : mistake.id)}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `${category.color}15`, color: category.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{mistake.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Lỗi thường gặp - Nhấn để xem phân tích
                      </p>
                    </div>
                    <ChevronRight size={18} style={{
                      color: 'var(--text-muted)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s'
                    }} />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 20px 20px 72px' }}>
                          <div style={{
                            background: 'var(--bg-base)',
                            borderRadius: '10px', padding: '16px',
                            border: '1px solid var(--border-default)'
                          }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
                              {mistake.desc}
                            </p>
                            <div style={{
                              display: 'flex', gap: '8px', alignItems: 'flex-start',
                              background: `${category.color}08`, borderRadius: '8px', padding: '12px'
                            }}>
                              <Sparkles size={16} style={{ color: category.color, flexShrink: 0, marginTop: '1px' }} />
                              <div>
                                <span style={{ fontWeight: 700, fontSize: '12px', color: category.color }}>Mẹo: </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{mistake.tip}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <div style={{
          background: 'var(--bg-surface)', borderRadius: '16px',
          border: '1px solid var(--border-default)', padding: '20px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} style={{ color: 'var(--brand-primary)' }} />
            Câu hỏi của bạn
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Nhập vấn đề bạn gặp phải, hệ thống sẽ tạo thẻ phân tích AI
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={questionInput}
              onChange={e => setQuestionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddQuestion() }}
              placeholder="VD: PC không lên nguồn, CPU bị quá nhiệt..."
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '10px',
                background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleAddQuestion}
              style={{
                padding: '10px 16px', borderRadius: '10px', border: 'none',
                background: 'var(--brand-primary)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: 600, fontSize: '13px', fontFamily: 'inherit'
              }}
            >
              <Send size={16} /> Gửi
            </button>
          </div>

          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Chưa có câu hỏi nào. Hãy nhập câu hỏi của bạn ở trên!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AnimatePresence>
                {questions.map(q => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    style={{
                      background: 'var(--bg-elevated)', borderRadius: '12px',
                      border: '1px solid var(--border-default)', padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                            background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                            color: 'var(--brand-primary)', padding: '2px 8px', borderRadius: '4px'
                          }}>
                            AI Phân tích
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {q.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: isMobile ? '24px 12px' : '48px 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 900 }}>Thi Thử</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
            Kiểm tra kiến thức phần cứng với đề thi, ngân hàng câu hỏi, bảng xếp hạng và phân tích lỗi sai
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', gap: isMobile ? '8px' : '12px',
            marginBottom: '32px', flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: isMobile ? '10px 16px' : '12px 24px',
                  borderRadius: '12px', border: '1px solid',
                  borderColor: isActive ? tab.color : 'var(--border-default)',
                  background: isActive ? `${tab.color}12` : 'var(--bg-surface)',
                  color: isActive ? tab.color : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: isMobile ? '12px' : '14px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={isMobile ? 16 : 18} />
                {isMobile ? tab.label.split(' ')[0] : tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {TABS.map(tab => {
              if (tab.id !== activeTab) return null
              if (tab.id === 'error-analysis') {
                return <ErrorAnalysisContent />
              }
              const Icon = tab.icon
              return (
                <div
                  key={tab.id}
                  style={{
                    borderRadius: '20px', border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)', padding: isMobile ? '24px' : '40px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '20px',
                    background: `${tab.color}15`, color: tab.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Icon size={36} />
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{tab.label}</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                    {tab.desc}
                  </p>
                  <button
                    onClick={() => router.push(TAB_LINKS[tab.id])}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '12px 28px', borderRadius: '12px', border: 'none',
                      background: tab.color, color: '#fff', fontWeight: 700,
                      fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    Vào ngay <ArrowRight size={18} />
                  </button>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            marginTop: '32px', flexWrap: 'wrap'
          }}
        >
          {TABS.map(tab => {
            if (tab.id === activeTab) return null
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (TAB_LINKS[tab.id]) {
                    router.push(TAB_LINKS[tab.id])
                  } else {
                    setActiveTab(tab.id)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 500
                }}
              >
                <tab.icon size={14} /> {tab.label} <ChevronRight size={14} />
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
