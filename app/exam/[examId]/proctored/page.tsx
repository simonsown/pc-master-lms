'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, ShieldAlert, Monitor, Lock, AlertCircle, CheckCircle2, ScanFace, Zap,
  ArrowRight, Video, Eye, EyeOff, UserX, UserCheck, Clock, AlertTriangle, RefreshCw,
  Gauge, Maximize, Fingerprint, Wifi
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ExamPlayer from '../ExamPlayer'
import { useProctorEngine } from '@/hooks/useProctorEngine'

const MOCK_EXAM_ID = 'proctored-mock-exam'
const QUESTIONS: any = [
  { id: 'q1', text: "Trong kien truc may tinh Von Neumann, bo xu ly trung tam (CPU) gom nhung thanh phan cot loi nao?", type: 'single', options: [{ id: 'A', text: "Bo dieu khien (CU) va Bo tinh toan so hoc/logic (ALU)" }, { id: 'B', text: "Bo nho RAM va ROM BIOS" }, { id: 'C', text: "Thiet bi vao (Input) va Thiet bi ra (Output)" }, { id: 'D', text: "O cung HDD va nguon dien PSU" }] },
  { id: 'q2', text: "Bo nho dem (Cache) tich hop truc tiep trong CPU co tac dung chinh la gi?", type: 'single', options: [{ id: 'A', text: "Tang toc do truy xuat du lieu bang cach luu tru tam thoi cac lenh/du lieu thuong dung tu RAM" }, { id: 'B', text: "Tang dung luong luu tru tong the cua he dieu hanh" }, { id: 'C', text: "Ngan chan virus doc hai xam nhap vao nhan xu ly" }, { id: 'D', text: "Thay the hoan toan bo nho trong RAM khi day dung luong" }] },
  { id: 'q3', text: "Bo nho RAM (Random Access Memory) la bo nho chi doc, khong bi mat du lieu khi mat dien.", type: 'boolean' },
  { id: 'q4', text: "Thiet bi nao sau day la thiet bi luu tru thu cap (Secondary Storage) khong bi mat du lieu khi tat nguon dien?", type: 'single', options: [{ id: 'A', text: "SSD (Solid State Drive)" }, { id: 'B', text: "RAM (Random Access Memory)" }, { id: 'C', text: "Cache L2" }, { id: 'D', text: "Register (Thanh ghi)" }] },
  { id: 'q5', text: "Muc dich chinh cua cong nghe Hyper-Threading (Sieu phan luong) tren CPU Intel la gi?", type: 'single', options: [{ id: 'A', text: "Cho phep mot nhan vat ly (Physical Core) xu ly dong thoi hai luong du lieu logic" }, { id: 'B', text: "Tu dong tang xung nhip co ban (Base Clock) cua CPU len muc toi da" }, { id: 'C', text: "Giam 50% luong dien nang tieu thu khi tai nang" }, { id: 'D', text: "Ho tro CPU ket noi truc tiep voi card do hoa roi khong qua PCIe" }] },
  { id: 'q6', text: "Don vi FLOPS (Floating-point Operations Per Second) thuong duoc dung de do hieu nang cua linh kien nao nhieu nhat?", type: 'single', options: [{ id: 'A', text: "GPU (Card do hoa roi / Bo xu ly do hoa)" }, { id: 'B', text: "Toc do quay cua Quat tan nhiet (RPM)" }, { id: 'C', text: "Toc do truyen du lieu cua cap mang Lan" }, { id: 'D', text: "Xung nhip hoat dong cua RAM" }] },
  { id: 'q7', text: "Chuan giao tiep PCIe 4.0 x16 co bang thong ly thuyet toi da la bao nhieu GB/s?", type: 'single', options: [{ id: 'A', text: "31.5 GB/s (khoang 32 GB/s)" }, { id: 'B', text: "15.8 GB/s (khoang 16 GB/s)" }, { id: 'C', text: "63.0 GB/s (khoang 64 GB/s)" }, { id: 'D', text: "8.0 GB/s" }] },
  { id: 'q8', text: "Dien ten viet tat cua bo phan cap nguon, chuyen doi dong dien xoay chieu (AC) thanh mot chieu (DC) de nuoi cac linh kien may tinh?", type: 'fill' },
  { id: 'q9', text: "Keo tan nhiet (Thermal Paste) co tac dung lap day khoang trong khong khi sieu nho giua be mat CPU va phien tan nhiet nham tang hieu qua truyen nhiet.", type: 'boolean' },
  { id: 'q10', text: "Hay trinh bay ngan gon (tu 2-3 cau) ly do tai sao khong nen chon bo nguon PSU kem chat luong (noname) khi lap rap PC cau hinh cao.", type: 'essay' },
]

export default function ProctoredExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const router = useRouter()
  const [step, setStep] = useState<'check' | 'exam'>('check')
  const [hasPermission, setHasPermission] = useState(false)
  const [showViolationOverlay, setShowViolationOverlay] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [violationHistory, setViolationHistory] = useState<{ time: string; type: string }[]>([])
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  const { state, videoRef, canvasRef, startCamera, stopCamera, startFaceDetection, captureIdentity, recordViolation } = useProctorEngine({
    examId: MOCK_EXAM_ID,
    attemptId: 'proctored-attempt',
    identityPhoto: null,
    onViolation: (type) => {
      setViolationHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), type }])
      setShowViolationOverlay(true)
    },
    onMaxViolations: () => {
      setTimeout(() => {
        alert('Ban da vi pham qua 3 lan. He thong tu dong nop bai!')
        setExamSubmitted(true)
      }, 2000)
    },
  })

  useEffect(() => {
    if (step !== 'exam') return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordViolation('tab_switch')
      }
    }
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen_exit')
      }
    }
    const disableEvent = (e: any) => e.preventDefault()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('copy', disableEvent)
    document.addEventListener('paste', disableEvent)
    document.addEventListener('contextmenu', disableEvent)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'p', 'u'].includes(e.key.toLowerCase())) e.preventDefault()
    })

    startCamera().then(stream => {
      if (stream) {
        setHasPermission(true)
        startFaceDetection()
      }
    })

    let realtimeChannel: any = null
    try {
      realtimeChannel = supabase
        .channel(`proctor-${MOCK_EXAM_ID}`)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setRealtimeConnected(true)
        })
    } catch (e) {}

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', disableEvent)
      document.removeEventListener('paste', disableEvent)
      document.removeEventListener('contextmenu', disableEvent)
      stopCamera()
      if (realtimeChannel) supabase.removeChannel(realtimeChannel)
    }
  }, [step, startCamera, startFaceDetection, recordViolation, stopCamera])

  const startExam = useCallback(() => {
    const photo = captureIdentity()
    if (!photo) {
      alert('Vui long chup anh xac thuc danh tinh truoc!')
      return
    }
    document.documentElement.requestFullscreen().catch(() => {
      alert('Trinh duyet khong ho tro Fullscreen. Vui long dung Chrome/Edge.')
    })
    setStep('exam')
  }, [captureIdentity])

  if (examSubmitted) {
    router.push(`/exam/${MOCK_EXAM_ID}/result/proctored`)
    return null
  }

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 blur-[120px]" style={{ background: 'var(--brand-primary)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 blur-[120px]" style={{ background: 'var(--accent-blue)' }}></div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full rounded-[48px] p-10 md:p-16 shadow-2xl relative z-10"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="aspect-video rounded-[32px] border-2 overflow-hidden relative group"
                style={{ background: 'var(--bg-elevated)', borderColor: state.cameraError ? 'var(--danger)' : 'var(--border-default)' }}>
                {state.cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                    <Camera size={48} style={{ color: 'var(--danger)' }} />
                    <p className="text-sm font-bold text-center" style={{ color: 'var(--danger)' }}>{state.cameraError}</p>
                    <button onClick={startCamera} className="px-6 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                      style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none' }}>
                      <RefreshCw size={14} className="inline mr-2" />Thu lai
                    </button>
                  </div>
                ) : !hasPermission ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera size={48} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm text-center px-4" style={{ color: 'var(--text-muted)' }}>
                      Can cap quyen Camera de tham gia ky thi co giam sat
                    </p>
                    <button onClick={startCamera}
                      className="px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all flex items-center gap-2"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                      <Video size={16} />Kich hoat Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                    {state.identityCapture && (
                      <div className="absolute inset-0 border-4 rounded-[32px] z-20 pointer-events-none border-green-500">
                        <div className="absolute top-4 right-4 bg-green-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                          <CheckCircle2 size={12} />Da xac minh
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <div className={`w-2 h-2 rounded-full ${state.faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-[10px] font-bold text-white/80">
                        {state.faceDetected ? 'Da phat hien khuon mat' : 'Dang tim khuon mat...'}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <canvas ref={canvasRef} width="320" height="240" className="hidden" />

              <button onClick={startExam} disabled={!state.identityCapture && !state.faceDetected}
                className="w-full py-4 font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-30"
                style={{ background: 'var(--brand-primary)', color: '#fff' }}>
                <ScanFace size={20} />
                {state.identityCapture ? 'Chup lai anh xac thuc' : 'Chup anh xac thuc & bat dau'}
              </button>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Ky thi <span style={{ color: 'var(--brand-primary)' }}>Giam sat</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                  He thong AI Proctoring voi MediaPipe FaceLandmarker dang bao ve tinh minh bach cua ky thi.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Monitor, text: "Bat buoc che do Toan man hinh", color: "var(--accent-blue)" },
                  { icon: ShieldAlert, text: "Phat hien va canh bao khi roi Tab", color: "var(--danger)" },
                  { icon: Lock, text: "Khoa chuc nang Copy, Paste, chuot phai", color: "#8b5cf6" },
                  { icon: Fingerprint, text: "Phat hien khuon mat bang AI (MediaPipe)", color: "var(--brand-primary)" },
                  { icon: Gauge, text: "Theo doi huong nhin & phat hien nhieu mat", color: "#f59e0b" },
                  { icon: Wifi, text: "Canh bao thoi gian thuc den giao vien", color: "#06b6d4" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs font-bold flex items-center gap-2" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={14} />
                  Neu ban roi khoi man hinh, khong co khuon mat, hoac phat hien nhieu nguoi qua 3 lan, bai thi se tu dong nop.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <ExamPlayer examId={MOCK_EXAM_ID} attemptId="proctored_attempt" questions={QUESTIONS} timeLimit={60} />

      <AnimatePresence>
        {showViolationOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] backdrop-blur-xl flex items-center justify-center p-10 text-center text-white"
            style={{ background: 'rgba(244,67,54,0.95)' }}>
            <div className="max-w-xl space-y-8">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto border-4 border-white/20 animate-pulse">
                <AlertCircle size={64} />
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic">Canh bao vi pham!</h1>
              <p className="text-2xl font-bold opacity-80 leading-relaxed">
                Phat hien hanh vi bat thuong trong qua trinh thi.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">So lan VP</div>
                  <div className="text-4xl font-black">{state.violations} / {state.maxViolations}</div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Trang thai</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${state.faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-lg font-bold">{state.faceDetected ? 'Co mat' : 'Mat mat'}</span>
                  </div>
                </div>
              </div>

              {violationHistory.length > 0 && (
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10 max-w-sm mx-auto">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Lich su VP</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {violationHistory.slice(-5).map((v, i) => (
                      <div key={i} className="text-xs opacity-80 flex justify-between">
                        <span>{v.time}</span>
                        <span className="font-bold">{v.type.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { document.documentElement.requestFullscreen(); setShowViolationOverlay(false) }}
                className="px-12 py-5 bg-white text-red-600 font-black uppercase rounded-2xl shadow-2xl hover:scale-105 transition-all">
                Quay lai bai thi ngay
              </button>
              <p className="text-sm opacity-50 font-bold uppercase italic tracking-widest">
                Hanh dong cua ban da duoc ghi lai va gui den giao vien.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 w-56 rounded-xl overflow-hidden z-[100] shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <div className="relative aspect-video">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror opacity-80" />
          {state.multipleFaces && (
            <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center">
              <UserX size={32} className="text-red-500" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${state.faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[9px] font-black uppercase text-white/80">
              {state.faceDetected ? (state.multipleFaces ? 'NHIEU MAT!' : 'FACE OK') : 'NO FACE'}
            </span>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase text-white/70">REC</span>
          </div>
          {realtimeConnected && (
            <div className="absolute top-2 right-12 bg-green-500/80 text-black px-1.5 py-0.5 rounded text-[8px] font-black">
              LIVE
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
            <Clock size={10} className="text-white/70" />
            <span className="text-[8px] font-black text-white/70">
              VP: {state.violations}/{state.maxViolations}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded">
            <span className="text-[8px] font-mono text-white/60">
              Y:{state.gazeDirection.yaw.toFixed(1)} P:{state.gazeDirection.pitch.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5"
          style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-default)' }}>
          <span className="text-[8px] font-bold uppercase" style={{ color: state.lookingAway ? 'var(--danger)' : 'var(--text-muted)' }}>
            {state.lookingAway ? 'Dang nhin di cho khac!' : 'Dang tap trung'}
          </span>
          <Maximize size={10} style={{ color: 'var(--text-muted)' }} onClick={() => document.documentElement.requestFullscreen()} className="cursor-pointer" />
        </div>
      </div>
    </div>
  )
}
