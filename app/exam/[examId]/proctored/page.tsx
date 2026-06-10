'use client'

import React, { useState, useEffect, useRef, use, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ShieldAlert, Monitor, Lock, AlertCircle, CheckCircle2, ScanFace, Zap, ArrowRight, Video, Eye, EyeOff, UserX, UserCheck, Clock, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ExamPlayer from '../ExamPlayer'

const MAX_VIOLATIONS = 3
const SNAPSHOT_INTERVAL = 30000
const FACE_CHECK_INTERVAL = 5000

export default function ProctoredExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const { examId } = resolvedParams;
  const router = useRouter()

  const [step, setStep] = useState<'check' | 'exam'>('check')
  const [hasPermission, setHasPermission] = useState(false)
  const [identityPhoto, setIdentityPhoto] = useState<string | null>(null)
  const [violations, setViolations] = useState(0)
  const [faceVisible, setFaceVisible] = useState(true)
  const [showViolationOverlay, setShowViolationOverlay] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
      }
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Ban da tu choi quyen Camera. Vui long cho phep Camera trong trinh duyet de tham gia ky thi!'
        : err.name === 'NotFoundError'
        ? 'Khong tim thay Webcam. Vui long ket noi Webcam va thu lai.'
        : 'Khong the truy cap Webcam: ' + (err.message || 'Loi khong xac dinh')
      setCameraError(msg)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => { stopCamera(); cancelAnimationFrame(animFrameRef.current) }
  }, [stopCamera])

  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 240
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let skinPixels = 0
    const total = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        skinPixels++
      }
    }
    const ratio = skinPixels / total
    return ratio > 0.05
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240)
      return canvasRef.current.toDataURL('image/png')
    }
    return null
  }, [])

  const recordViolation = useCallback(async (type: string, data?: string) => {
    setViolations(prev => {
      const newCount = prev + 1
      setShowViolationOverlay(true)
      supabase.from('exam_logs').insert({
        exam_id: examId,
        event_type: type,
        event_data: data || `Lan vi pham thu ${newCount}`,
        created_at: new Date().toISOString()
      }).then()
      if (newCount >= MAX_VIOLATIONS) {
        setTimeout(() => {
          alert('Ban da vi pham qua 3 lan. He thong tu dong nop bai!')
          setExamSubmitted(true)
        }, 2000)
      }
      return newCount
    })
  }, [examId])

  useEffect(() => {
    if (step !== 'exam') return

    startCamera()

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
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    })

    const snapshotTimer = setInterval(() => {
      const photo = capturePhoto()
      if (photo) {
        supabase.from('exam_logs').insert({
          exam_id: examId,
          event_type: 'snapshot',
          event_data: photo,
          created_at: new Date().toISOString()
        }).then()
      }
    }, SNAPSHOT_INTERVAL)

    const faceCheckTimer = setInterval(() => {
      if (!hasPermission) return
      const hasFace = detectFace()
      setFaceVisible(!!hasFace)
      if (!hasFace) {
        recordViolation('face_not_visible', 'Khong phat hien khuon mat truoc camera')
      }
    }, FACE_CHECK_INTERVAL)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', disableEvent)
      document.removeEventListener('paste', disableEvent)
      document.removeEventListener('contextmenu', disableEvent)
      clearInterval(snapshotTimer)
      clearInterval(faceCheckTimer)
    }
  }, [step, hasPermission, startCamera, capturePhoto, recordViolation, detectFace])

  const startExam = useCallback(() => {
    const photo = capturePhoto()
    if (!photo) {
      alert('Vui long chup anh xac minh danh tinh truoc!')
      return
    }
    setIdentityPhoto(photo)
    document.documentElement.requestFullscreen().catch(() => {
      alert('Trinh duyet khong ho tro Fullscreen. Vui long dung Chrome/Edge.')
    })
    setStep('exam')
  }, [capturePhoto])

  if (examSubmitted) {
    router.push(`/exam/${examId}/result/proctored`)
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
              <div className="aspect-video rounded-[32px] border-2 overflow-hidden relative group" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                    <Camera size={48} style={{ color: 'var(--danger)' }} />
                    <p className="text-sm font-bold text-center" style={{ color: 'var(--danger)' }}>{cameraError}</p>
                    <button onClick={startCamera} className="px-6 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none' }}>
                      Thu lai
                    </button>
                  </div>
                ) : !hasPermission ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera size={48} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm text-center px-4" style={{ color: 'var(--text-muted)' }}>
                      Can cap quyen Camera de tham gia ky thi co giam sat
                    </p>
                    <button onClick={startCamera} className="px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                      Kich hoat Camera
                    </button>
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                )}
                {identityPhoto && (
                  <div className="absolute inset-0 border-4 rounded-[32px] z-20 pointer-events-none" style={{ borderColor: 'var(--brand-primary)' }}>
                    <div className="absolute top-4 right-4 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: 'var(--brand-primary)' }}>Da xac minh</div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} width="320" height="240" className="hidden" />
              <button onClick={startExam} disabled={!hasPermission}
                className="w-full py-4 font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-30"
                style={{ background: 'var(--brand-primary)', color: '#fff' }}>
                <ScanFace size={20} /> {identityPhoto ? 'Chup lai anh xac thuc' : 'Chup anh xac thuc & bat dau'}
              </button>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Ky thi <span style={{ color: 'var(--brand-primary)' }}>Giam sat</span></h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>He thong AI Proctoring dang bao ve tinh minh bach cua ky thi nay.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Monitor, text: "Bat buoc che do Toan man hinh", color: "var(--accent-blue)" },
                  { icon: ShieldAlert, text: "Phat hien va canh bao khi roi Tab", color: "var(--danger)" },
                  { icon: Lock, text: "Khoa chuc nang Copy, Paste, chuot phai", color: "#8b5cf6" },
                  { icon: Camera, text: "Phat hien khuan mat lien tuc truoc camera", color: "var(--brand-primary)" },
                  { icon: Video, text: "Chup anh webcam ngau nhien de doi soat", color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs font-bold flex items-center gap-2" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={14} />
                  Luu y: Neu ban roi khoi man hinh hoac khong co khuan mat trong khung hinh qua 3 lan, bai thi se tu dong duoc nop.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const realQuestions: any = [
    {
      id: 'q1',
      text: "Trong kien truc may tinh Von Neumann, bo xu ly trung tam (CPU) gom nhung thanh phan cot loi nao?",
      type: 'single',
      options: [
        { id: 'A', text: "Bo dieu khien (CU) va Bo tinh toan so hoc/logic (ALU)" },
        { id: 'B', text: "Bo nho RAM va ROM BIOS" },
        { id: 'C', text: "Thiet bi vao (Input) va Thiet bi ra (Output)" },
        { id: 'D', text: "O cung HDD va nguon dien PSU" }
      ]
    },
    {
      id: 'q2',
      text: "Bo nho dem (Cache) tich hop truc tiep trong CPU co tac dung chinh la gi?",
      type: 'single',
      options: [
        { id: 'A', text: "Tang toc do truy xuat du lieu bang cach luu tru tam thoi cac lenh/du lieu thuong dung tu RAM" },
        { id: 'B', text: "Tang dung luong luu tru tong the cua he dieu hanh" },
        { id: 'C', text: "Ngan chan virus doc hai xam nhap vao nhan xu ly" },
        { id: 'D', text: "Thay the hoan toan bo nho trong RAM khi day dung luong" }
      ]
    },
    {
      id: 'q3',
      text: "Bo nho RAM (Random Access Memory) la bo nho chi doc, khong bi mat du lieu khi mat dien.",
      type: 'boolean'
    },
    {
      id: 'q4',
      text: "Thiet bi nao sau day la thiet bi luu tru thu cap (Secondary Storage) khong bi mat du lieu khi tat nguon dien?",
      type: 'single',
      options: [
        { id: 'A', text: "SSD (Solid State Drive)" },
        { id: 'B', text: "RAM (Random Access Memory)" },
        { id: 'C', text: "Cache L2" },
        { id: 'D', text: "Register (Thanh ghi)" }
      ]
    },
    {
      id: 'q5',
      text: "Muc dich chinh cua cong nghe Hyper-Threading (Sieu phan luong) tren CPU Intel la gi?",
      type: 'single',
      options: [
        { id: 'A', text: "Cho phep mot nhan vat ly (Physical Core) xu ly dong thoi hai luong du lieu logic" },
        { id: 'B', text: "Tu dong tang xung nhip co ban (Base Clock) cua CPU len muc toi da" },
        { id: 'C', text: "Giam 50% luong dien nang tieu thu khi tai nang" },
        { id: 'D', text: "Ho tro CPU ket noi truc tiep voi card do hoa roi khong qua PCIe" }
      ]
    },
    {
      id: 'q6',
      text: "Don vi FLOPS (Floating-point Operations Per Second) thuong duoc dung de do hieu nang cua linh kien nao nhieu nhat?",
      type: 'single',
      options: [
        { id: 'A', text: "GPU (Card do hoa roi / Bo xu ly do hoa)" },
        { id: 'B', text: "Toc do quay cua Quat tan nhiet (RPM)" },
        { id: 'C', text: "Toc do truyen du lieu cua cap mang Lan" },
        { id: 'D', text: "Xung nhip hoat dong cua RAM" }
      ]
    },
    {
      id: 'q7',
      text: "Chuan giao tiep PCIe 4.0 x16 co bang thong ly thuyet toi da la bao nhieu GB/s?",
      type: 'single',
      options: [
        { id: 'A', text: "31.5 GB/s (khoang 32 GB/s)" },
        { id: 'B', text: "15.8 GB/s (khoang 16 GB/s)" },
        { id: 'C', text: "63.0 GB/s (khoang 64 GB/s)" },
        { id: 'D', text: "8.0 GB/s" }
      ]
    },
    {
      id: 'q8',
      text: "Dien ten viet tat cua bo phan cap nguon, chuyen doi dong dien xoay chieu (AC) thanh mot chieu (DC) de nuoi cac linh kien may tinh?",
      type: 'fill'
    },
    {
      id: 'q9',
      text: "Keo tan nhiet (Thermal Paste) co tac dung lap day khoang trong khong khi sieu nho giua be mat CPU va phien tan nhiet nham tang hieu qua truyen nhiet.",
      type: 'boolean'
    },
    {
      id: 'q10',
      text: "Hay trinh bay ngan gon (tu 2-3 cau) ly do tai sao khong nen chon bo nguon PSU kem chat luong (noname) khi lap rap PC cau hinh cao.",
      type: 'essay'
    }
  ]

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <ExamPlayer examId={examId} attemptId="proctored_attempt" questions={realQuestions} timeLimit={60} />

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
                Ban vua roi khoi man hinh thi hoac khong co khuan mat trong khung hinh.
              </p>
              <div className="bg-black/20 p-6 rounded-3xl border border-white/10">
                <div className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">So lan vi pham</div>
                <div className="text-5xl font-black">{violations} / {MAX_VIOLATIONS}</div>
              </div>
              <button onClick={() => { document.documentElement.requestFullscreen(); setShowViolationOverlay(false); }}
                className="px-12 py-5 bg-white text-red-600 font-black uppercase rounded-2xl shadow-2xl hover:scale-105 transition-all">
                Quay lai bai thi ngay
              </button>
              <p className="text-sm opacity-50 font-bold uppercase italic tracking-widest">Hanh dong cua ban da duoc ghi lai va gui den giao vien.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden z-[100] shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror opacity-70" />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${faceVisible ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[8px] font-black uppercase text-white/70">
            {faceVisible ? 'Face OK' : 'No Face'}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-black uppercase text-white/70">REC</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded">
          <Clock size={10} className="text-white/70" />
          <span className="text-[8px] font-black uppercase text-white/70">
            VP: {violations}/{MAX_VIOLATIONS}
          </span>
        </div>
      </div>
    </div>
  )
}
