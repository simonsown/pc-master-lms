'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Cpu, Wrench, RefreshCw, CheckCircle2, AlertTriangle,
  HelpCircle, Loader2, Monitor, Zap, Thermometer, Wifi, HardDrive,
  Keyboard, Mouse, Users, Shield, Puzzle, Star, BookOpen,
  Toolbox, Disc, Radio, Gauge
} from 'lucide-react'

interface QAStep {
  q: string
  a: string
}

interface DiagnosisResult {
  problem: string
  cause: string
  fixSteps: string[]
  partsNeeded: string[]
  repairShop: string
  xpReward: number
}

interface AiResponse {
  type: 'question' | 'diagnosis'
  message: string
  options: string[]
  diagnosis?: DiagnosisResult
  model?: string
}

interface Scenario {
  id: string
  title: string
  icon: string
  description: string
  difficulty: 'Dễ' | 'Trung bình' | 'Khó'
  xpReward: number
  symptoms: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'no_display',
    title: 'Máy không lên màn hình',
    icon: '🖥️',
    description: 'Đèn nguồn sáng, quạt chạy nhưng màn hình đen',
    difficulty: 'Trung bình',
    xpReward: 30,
    symptoms: 'Máy tính không lên màn hình, có đèn nguồn nhưng không boot',
  },
  {
    id: 'no_power',
    title: 'Máy không lên nguồn',
    icon: '⚡',
    description: 'Không có đèn, không quạt, không phản ứng gì',
    difficulty: 'Dễ',
    xpReward: 20,
    symptoms: 'Máy tính không lên nguồn, không có đèn và quạt',
  },
  {
    id: 'bsod',
    title: 'Màn hình xanh (BSOD)',
    icon: '💙',
    description: 'Máy bị xanh màn hình khi đang dùng',
    difficulty: 'Khó',
    xpReward: 40,
    symptoms: 'Máy bị màn hình xanh (BSOD) khi đang sử dụng',
  },
  {
    id: 'overheating',
    title: 'Máy quá nhiệt',
    icon: '🌡️',
    description: 'Nhiệt độ CPU/GPU cao, quạt kêu to',
    difficulty: 'Dễ',
    xpReward: 20,
    symptoms: 'Nhiệt độ CPU cao, quạt kêu to, máy nóng',
  },
  {
    id: 'slow',
    title: 'Máy chạy chậm',
    icon: '🐢',
    description: 'Máy bị treo, đơ, chạy chậm bất thường',
    difficulty: 'Trung bình',
    xpReward: 30,
    symptoms: 'Máy tính chạy chậm, bị treo, đơ',
  },
  {
    id: 'network',
    title: 'Mất kết nối mạng',
    icon: '🌐',
    description: 'Không vào được internet, WiFi/LAN lỗi',
    difficulty: 'Dễ',
    xpReward: 20,
    symptoms: 'Máy không kết nối được internet, wifi hoặc mạng LAN',
  },
  {
    id: 'auto_shutdown',
    title: 'Máy tự tắt nguồn',
    icon: '🔌',
    description: 'Máy tự tắt khi đang dùng hoặc khi chơi game',
    difficulty: 'Khó',
    xpReward: 40,
    symptoms: 'Máy tính tự tắt nguồn khi đang sử dụng',
  },
  {
    id: 'no_boot',
    title: 'Máy không boot Windows',
    icon: '💿',
    description: 'Máy vào BIOS hoặc logo hãng rồi treo',
    difficulty: 'Khó',
    xpReward: 35,
    symptoms: 'Máy không boot được vào Windows',
  },
  {
    id: 'usb_not_recognized',
    title: 'USB không được nhận',
    icon: '🔌',
    description: 'Cắm USB không thấy, hoặc báo lỗi driver',
    difficulty: 'Dễ',
    xpReward: 15,
    symptoms: 'USB cắm vào không được nhận, không thấy ổ USB',
  },
  {
    id: 'ram_error',
    title: 'Lỗi RAM',
    icon: '🧩',
    description: 'Máy báo lỗi RAM, beep khi khởi động',
    difficulty: 'Trung bình',
    xpReward: 30,
    symptoms: 'Máy báo lỗi RAM, có tiếng bíp khi khởi động',
  },
  {
    id: 'vga_error',
    title: 'Lỗi card màn hình',
    icon: '🎮',
    description: 'Màn hình có sọc, nhấp nháy, hoặc không có hình',
    difficulty: 'Khó',
    xpReward: 45,
    symptoms: 'Màn hình bị sọc, nhấp nháy hoặc không có tín hiệu từ card màn hình',
  },
  {
    id: 'keyboard_mouse',
    title: 'Bàn phím/Chuột không hoạt động',
    icon: '⌨️',
    description: 'Bàn phím hoặc chuột không được nhận',
    difficulty: 'Dễ',
    xpReward: 15,
    symptoms: 'Bàn phím hoặc chuột không hoạt động',
  },
]

const TOOLS = [
  { icon: <Gauge size={18} />, name: 'HWMonitor', desc: 'Theo dõi nhiệt độ, điện áp', action: 'Mở HWMonitor' },
  { icon: <Disc size={18} />, name: 'CrystalDiskInfo', desc: 'Kiểm tra sức khỏe ổ cứng', action: 'Mở CrystalDiskInfo' },
  { icon: <Radio size={18} />, name: 'MemTest86', desc: 'Kiểm tra lỗi RAM', action: 'Tạo USB boot MemTest' },
  { icon: <Shield size={18} />, name: 'Windows Defender', desc: 'Quét virus toàn bộ hệ thống', action: 'Mở Windows Security' },
  { icon: <Cpu size={18} />, name: 'CPU-Z', desc: 'Xem thông tin CPU, RAM, mainboard', action: 'Mở CPU-Z' },
  { icon: <Monitor size={18} />, name: 'GPU-Z', desc: 'Xem thông tin card màn hình', action: 'Mở GPU-Z' },
  { icon: <Wrench size={18} />, name: 'DDU', desc: 'Gỡ driver VGA tận gốc', action: 'Chạy DDU safe mode' },
  { icon: <HardDrive size={18} />, name: 'HD Tune', desc: 'Kiểm tra bad sector ổ cứng', action: 'Mở HD Tune' },
]

const MODEL_LABELS: Record<string, { label: string; color: string }> = {
  gemini: { label: 'Gemini 1.5 Flash', color: '#4285F4' },
  openai: { label: 'OpenAI', color: '#00A67E' },
  huggingface: { label: 'HuggingFace', color: '#FFD21E' },
  'rule-based': { label: 'Local Engine', color: '#f59e0b' },
}

const TOTAL_XP = SCENARIOS.reduce((sum, s) => sum + s.xpReward, 0)

export default function ChanDoanPcPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [symptoms, setSymptoms] = useState('')
  const [history, setHistory] = useState<QAStep[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [activeModel, setActiveModel] = useState<string>('')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [showScenarioPicker, setShowScenarioPicker] = useState(true)
  const [showToolbox, setShowToolbox] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [earnedXp, setEarnedXp] = useState(0)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [lastXpAmount, setLastXpAmount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, currentMessage])

  async function startDiagnosis(scenario?: Scenario) {
    const symptomText = scenario ? scenario.symptoms : symptoms
    if (!symptomText.trim()) return
    setLoading(true)
    setStarted(true)
    setSelectedScenario(scenario || null)
    setActiveModel('')
    try {
      const res = await fetch('/api/ai/diagnose-pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomText.trim(), answers: [] })
      })
      const data: AiResponse = await res.json()
      setActiveModel(data.model || '')
      if (data.type === 'diagnosis' && data.diagnosis) {
        data.diagnosis.xpReward = scenario?.xpReward || 25
        setDiagnosis(data.diagnosis)
        setCurrentMessage(data.message)
        setOptions([])
        awardXp(data.diagnosis.xpReward)
      } else {
        setCurrentMessage(data.message)
        setOptions(data.options || [])
      }
    } catch { setCurrentMessage('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setLoading(false) }
  }

  async function handleOption(option: string) {
    const newHistory = [...history, { q: currentMessage, a: option }]
    setHistory(newHistory)
    setLoading(true)
    setCurrentMessage('')
    setOptions([])
    setActiveModel('')
    try {
      const res = await fetch('/api/ai/diagnose-pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedScenario?.symptoms || symptoms, answers: newHistory })
      })
      const data: AiResponse = await res.json()
      setActiveModel(data.model || '')
      if (data.type === 'diagnosis' && data.diagnosis) {
        data.diagnosis.xpReward = selectedScenario?.xpReward || 25
        setDiagnosis(data.diagnosis)
        setCurrentMessage(data.message)
        setOptions([])
        awardXp(data.diagnosis.xpReward)
      } else {
        setCurrentMessage(data.message)
        setOptions(data.options || [])
      }
    } catch { setCurrentMessage('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setLoading(false) }
  }

  function awardXp(amount: number) {
    setLastXpAmount(amount)
    setEarnedXp(prev => prev + amount)
    setCompletedCount(prev => prev + 1)
    setShowXpAnimation(true)
    setTimeout(() => setShowXpAnimation(false), 2500)
  }

  function reset() {
    setStarted(false)
    setHistory([])
    setCurrentMessage('')
    setOptions([])
    setDiagnosis(null)
    setSymptoms('')
    setActiveModel('')
    setSelectedScenario(null)
    setShowScenarioPicker(true)
  }

  function selectScenario(scenario: Scenario) {
    setShowScenarioPicker(false)
    setSelectedScenario(scenario)
    setSymptoms(scenario.symptoms)
    startDiagnosis(scenario)
  }

  const modelInfo = activeModel ? MODEL_LABELS[activeModel] : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* XP Banner */}
      <AnimatePresence>
        {showXpAnimation && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
              background: 'linear-gradient(135deg, #f59e0b, #eab308)',
              color: '#000', textAlign: 'center', padding: '10px',
              fontWeight: 800, fontSize: '16px',
              boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
            }}
          >
            <Star size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            +{lastXpAmount} XP! Chuẩn đoán hoàn tất!
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b p-4 flex items-center gap-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold cursor-pointer"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Quay lại
        </button>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wrench size={16} style={{ color: '#000' }} />
        </div>
        <div>
          <h1 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Chẩn đoán PC thông minh</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mô tả lỗi → AI hỏi ngược → Chẩn đoán chính xác</p>
        </div>
        {modelInfo && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: `${modelInfo.color}15`, border: `1px solid ${modelInfo.color}30`, fontSize: '11px', fontWeight: 700 }}>
            {modelInfo.label}
          </div>
        )}
        <button onClick={() => setShowToolbox(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold cursor-pointer"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <Toolbox size={14} /> Hộp dụng cụ
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {!started ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ paddingTop: '20px' }}>
            {/* XP Progress */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} style={{ color: '#f59e0b' }} />
                <span><strong style={{ color: '#f59e0b' }}>{earnedXp}</strong> / {TOTAL_XP} XP</span>
              </div>
              <span>|</span>
              <span>Đã hoàn thành: <strong>{completedCount}</strong> ca</span>
            </div>

            {/* Scenario Picker */}
            {showScenarioPicker && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Chọn kịch bản chẩn đoán</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Chọn một trong các tình huống PC thường gặp dưới đây</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
                  {SCENARIOS.map((scenario) => (
                    <motion.button
                      key={scenario.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectScenario(scenario)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 14px', borderRadius: '12px',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: '12px',
                        fontFamily: 'inherit', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{scenario.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{scenario.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{scenario.description}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span style={{
                            fontSize: '9px', padding: '1px 6px', borderRadius: '4px',
                            background: scenario.difficulty === 'Dễ' ? 'rgba(16,185,129,0.15)' : scenario.difficulty === 'Trung bình' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                            color: scenario.difficulty === 'Dễ' ? '#10b981' : scenario.difficulty === 'Trung bình' ? '#f59e0b' : '#ef4444',
                          }}>
                            {scenario.difficulty}
                          </span>
                          <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                            +{scenario.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>HOẶC nhập triệu chứng tự do</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
                  <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && startDiagnosis()}
                    placeholder="Nhập triệu chứng (VD: máy tính không lên màn hình)..."
                    style={{ flex: 1, padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button onClick={() => startDiagnosis()} disabled={!symptoms.trim() || loading}
                    style={{ padding: '14px 28px', borderRadius: '14px', border: 'none', background: !symptoms.trim() || loading ? 'var(--text-muted)' : 'var(--brand-primary)', color: '#000', fontWeight: 800, cursor: !symptoms.trim() || loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Chẩn đoán'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 2s infinite' }} />
              <span>Đang chẩn đoán: {selectedScenario ? selectedScenario.title : symptoms}</span>
              {selectedScenario && (
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  +{selectedScenario.xpReward} XP
                </span>
              )}
            </div>

            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HelpCircle size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{h.q}</span>
                  </div>
                </div>
                <div style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', marginLeft: '24px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)' }}>Bạn:</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{h.a}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>AI đang phân tích triệu chứng...</span>
              </div>
            )}

            {currentMessage && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {modelInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span>Phân tích bởi: <span style={{ color: modelInfo.color }}>{modelInfo.label}</span></span>
                  </div>
                )}
                {diagnosis ? (
                  <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--brand-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Kết quả chẩn đoán</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{diagnosis.problem}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.6' }}>{currentMessage}</p>

                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '8px' }}>Nguyên nhân:</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{diagnosis.cause}</p>
                    </div>

                    {diagnosis.fixSteps.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '8px' }}>Các bước khắc phục:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {diagnosis.fixSteps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', fontSize: '13px', lineHeight: '1.4' }}>
                              <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--brand-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ color: 'var(--text-primary)' }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diagnosis.partsNeeded.length > 0 && (
                      <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>Linh kiện cần thay/mua:</h4>
                        {diagnosis.partsNeeded.map((p, i) => (
                          <div key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', padding: '2px 0' }}>• {p}</div>
                        ))}
                      </div>
                    )}

                    <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8', marginBottom: '4px' }}>Lời khuyên:</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{diagnosis.repairShop}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                      <button onClick={reset}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                        <RefreshCw size={14} /> Chẩn đoán PC khác
                      </button>
                      <button onClick={() => setShowToolbox(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                        <Toolbox size={14} /> Dụng cụ sửa chữa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <HelpCircle size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{currentMessage}</span>
                    </div>
                    {options.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {options.map((opt, i) => (
                          <button key={i} onClick={() => handleOption(opt)}
                            style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.background = 'rgba(0,212,170,0.08)' }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Toolbox Modal */}
      <AnimatePresence>
        {showToolbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowToolbox(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '100%', background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-default)', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Toolbox size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Hộp dụng cụ sửa chữa PC</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Các công cụ cần thiết cho kỹ thuật viên</p>
                </div>
                <button onClick={() => setShowToolbox(false)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontFamily: 'inherit' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                {TOOLS.map((tool, i) => (
                  <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                        {tool.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{tool.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tool.desc}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 600, cursor: 'pointer' }}>{tool.action} →</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', color: 'var(--text-muted)' }}>
                <strong style={{ color: '#f59e0b' }}>Pro tip:</strong> Các công cụ trên đều miễn phí. Luôn kiểm tra sức khỏe ổ cứng và nhiệt độ trước khi thay linh kiện!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  )
}
