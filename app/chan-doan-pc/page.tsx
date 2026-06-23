'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Cpu, Wrench, RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Monitor, Zap, Cpu as CpuIcon } from 'lucide-react'

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
}

interface AiResponse {
  type: 'question' | 'diagnosis'
  message: string
  options: string[]
  diagnosis?: DiagnosisResult
}

export default function ChanDoanPcPage() {
  const router = useRouter()
  const [symptoms, setSymptoms] = useState('')
  const [history, setHistory] = useState<QAStep[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, currentMessage])

  async function startDiagnosis() {
    if (!symptoms.trim()) return
    setLoading(true)
    setStarted(true)
    try {
      const res = await fetch('/api/ai/diagnose-pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptoms.trim(), answers: [] })
      })
      const data: AiResponse = await res.json()
      if (data.type === 'diagnosis' && data.diagnosis) {
        setDiagnosis(data.diagnosis)
        setCurrentMessage(data.message)
        setOptions([])
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
    try {
      const res = await fetch('/api/ai/diagnose-pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, answers: newHistory })
      })
      const data: AiResponse = await res.json()
      if (data.type === 'diagnosis' && data.diagnosis) {
        setDiagnosis(data.diagnosis)
        setCurrentMessage(data.message)
        setOptions([])
      } else {
        setCurrentMessage(data.message)
        setOptions(data.options || [])
      }
    } catch { setCurrentMessage('Lỗi kết nối. Vui lòng thử lại.') }
    finally { setLoading(false) }
  }

  function reset() {
    setStarted(false)
    setHistory([])
    setCurrentMessage('')
    setOptions([])
    setDiagnosis(null)
    setSymptoms('')
  }

  const quickSymptoms = [
    { icon: <Monitor size={16} />, text: 'Máy không lên màn hình' },
    { icon: <Zap size={16} />, text: 'Máy bị treo, đơ' },
    { icon: <CpuIcon size={16} />, text: 'Nhiệt độ CPU cao' },
    { icon: <AlertTriangle size={16} />, text: 'Máy bị xanh màn hình' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
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
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {!started ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔧</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>PC của bạn đang gặp vấn đề gì?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              Mô tả triệu chứng, tôi sẽ hỏi ngược lại để chẩn đoán chính xác và đưa ra cách khắc phục
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              {quickSymptoms.map((s, i) => (
                <button key={i} onClick={() => setSymptoms(s.text)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                  {s.icon} {s.text}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
              <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startDiagnosis()}
                placeholder="Hoặc nhập triệu chứng (VD: máy tính không lên màn hình, có đèn nhưng không boot)..."
                style={{ flex: 1, padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={startDiagnosis} disabled={!symptoms.trim() || loading}
                style={{ padding: '14px 28px', borderRadius: '14px', border: 'none', background: !symptoms.trim() || loading ? 'var(--text-muted)' : 'var(--brand-primary)', color: '#000', fontWeight: 800, cursor: !symptoms.trim() || loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Chẩn đoán'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 2s infinite' }} />
              Đang chẩn đoán: {symptoms}
            </div>

            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HelpCircle size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{h.q}</span>
                  </div>
                </div>
                <div style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(var(--brand-primary), 0.08)', border: '1px solid rgba(var(--brand-primary), 0.2)', marginLeft: '24px', marginBottom: '8px' }}>
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

                    <button onClick={reset}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', marginTop: '20px', fontFamily: 'inherit' }}>
                      <RefreshCw size={14} /> Chẩn đoán PC khác
                    </button>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  )
}
