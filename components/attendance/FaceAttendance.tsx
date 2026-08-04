'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ScanFace, UserPlus, Loader2, Camera, CameraOff, Trash2, Play, Square,
  AlertTriangle, UserCheck, Users, RefreshCw, Database
} from 'lucide-react'
import {
  buildFaceDescriptor, faceDistance, faceBox, FACE_THRESHOLD,
} from './faceDescriptor'
import type { FaceLandmark } from './faceDescriptor'

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

interface EnrolledFace {
  id: string
  student_id: string
  student_name: string
  descriptor: number[]
}

interface PresentEntry {
  name: string
  time: string
  confidence: number
}

interface Member {
  id: string
  student_id?: string
  student?: { id: string; full_name: string } | null
}

export default function FaceAttendance({ classId, members }: { classId: string; members: Member[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<any>(null)
  const lastFacesRef = useRef<FaceLandmark[][]>([])
  const rafRef = useRef<number | null>(null)

  const runningRef = useRef(false)
  const attendingRef = useRef(false)
  const presentRef = useRef<Set<string>>(new Set())
  const enrolledRef = useRef<EnrolledFace[]>([])
  const modeRef = useRef<'enroll' | 'attend'>('enroll')

  const [loading, setLoading] = useState(true)
  const [dbMissing, setDbMissing] = useState(false)
  const [enrolled, setEnrolled] = useState<EnrolledFace[]>([])
  const [snapshots, setSnapshots] = useState<Record<string, string>>({})
  const [cameraReady, setCameraReady] = useState(false)
  const [camError, setCamError] = useState<string | null>(null)
  const [mode, setMode] = useState<'enroll' | 'attend'>('enroll')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [attending, setAttending] = useState(false)
  const [detectedCount, setDetectedCount] = useState(0)
  const [presentMap, setPresentMap] = useState<Record<string, PresentEntry>>({})
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    enrolledRef.current = enrolled
  }, [enrolled])

  // ── Load data + realtime ──
  useEffect(() => {
    let ok = true
    const todayStr = new Date().toLocaleDateString('en-CA')

    async function load() {
      const [facesRes, recsRes] = await Promise.all([
        supabase.from('attendance_faces').select('*').eq('class_id', classId),
        supabase.from('attendance_records').select('*').eq('class_id', classId).eq('session_date', todayStr),
      ])
      if (!ok) return
      if (facesRes.error) {
        if (/does not exist|relation/.test(facesRes.error.message)) setDbMissing(true)
        setLoading(false)
        return
      }
      const faces: EnrolledFace[] = (facesRes.data || []).map((r: any) => ({
        id: r.id,
        student_id: r.student_id,
        student_name: r.student_name || '',
        descriptor: Array.isArray(r.descriptor) ? r.descriptor : [],
      }))
      setEnrolled(faces)
      if (recsRes.error) {
        setLoading(false)
        return
      }
      const map: Record<string, PresentEntry> = {}
      const present = new Set<string>()
      for (const r of recsRes.data || []) {
        map[r.student_id] = { name: r.student_name || '', time: r.created_at, confidence: Number(r.confidence || 0) }
        present.add(r.student_id)
      }
      presentRef.current = present
      setPresentMap(map)
      setLoading(false)
    }
    void load()

    const ch = supabase.channel(`attendance-${classId}`)
    ch.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `class_id=eq.${classId}` },
      (payload: any) => {
        const n = payload.new
        if (n && n.student_id) {
          setPresentMap(prev => ({
            ...prev,
            [n.student_id]: { name: n.student_name || '', time: n.created_at, confidence: Number(n.confidence || 0) },
          }))
        }
      }
    )
    ch.subscribe()

    return () => {
      ok = false
      supabase.removeChannel(ch)
    }
  }, [classId])

  // ── Camera + landmarker ──
  const startCamera = useCallback(async () => {
    if (streamRef.current) return
    setCamError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'user' },
      })
      streamRef.current = s
      const video = videoRef.current
      if (!video) return
      video.srcObject = s
      video.setAttribute('playsinline', '')
      await video.play()

      const m: any = await import('@mediapipe/tasks-vision')
      const vis = await m.FilesetResolver.forVisionTasks(WASM)
      const fl = await m.FaceLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 10,
      })
      landmarkerRef.current = fl
      setCameraReady(true)
      startLoop()
    } catch (e: any) {
      console.error(e)
      setCamError(e?.message || 'Không thể truy cập camera. Hãy kiểm tra quyền camera của trình duyệt.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    landmarkerRef.current?.close?.()
    landmarkerRef.current = null
    attendingRef.current = false
    setAttending(false)
    setCameraReady(false)
    setDetectedCount(0)
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // ── Detection loop ──
  const recordPresence = useCallback(async (studentId: string, name: string, confidence: number) => {
    const todayStr = new Date().toLocaleDateString('en-CA')
    const { error } = await supabase.from('attendance_records').insert({
      class_id: classId,
      student_id: studentId,
      student_name: name,
      status: 'present',
      session_date: todayStr,
      recognized_by: 'face',
      confidence,
    })
    if (error) {
      if (!/duplicate/i.test(error.message)) console.error('recordPresence error:', error.message)
    } else {
      setPresentMap(prev => ({ ...prev, [studentId]: { name, time: new Date().toISOString(), confidence } }))
    }
  }, [classId])

  const startLoop = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true

    const step = async () => {
      if (!runningRef.current) return
      const video = videoRef.current
      const lm = landmarkerRef.current
      const canvas = canvasRef.current
      if (video && lm && canvas && video.readyState >= 2) {
        try {
          const res = await lm.detectForVideo(video, performance.now())
          const faces: FaceLandmark[][] = res.faceLandmarks || []
          lastFacesRef.current = faces
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const W = canvas.width
            const H = canvas.height
            ctx.clearRect(0, 0, W, H)
            const enrolledNow = enrolledRef.current
            const presentSet = presentRef.current
            const modeNow = modeRef.current
            for (const flm of faces) {
              const box = faceBox(flm)
              if (!box) continue
              let color = modeNow === 'enroll' ? '#00f3ff' : '#f59e0b'
              let label = modeNow === 'enroll' ? 'Khuôn mặt' : 'Chưa xác định'
              if (modeNow === 'attend') {
                const desc = buildFaceDescriptor(flm)
                let best: EnrolledFace | null = null
                let bestDist = Infinity
                for (const e of enrolledNow) {
                  const d = faceDistance(desc, e.descriptor)
                  if (d < bestDist) {
                    bestDist = d
                    best = e
                  }
                }
                if (best && bestDist < FACE_THRESHOLD) {
                  color = '#10b981'
                  const conf = Math.max(0, Math.round((1 - bestDist / FACE_THRESHOLD) * 100))
                  label = `${best.student_name} (${conf}%)`
                  if (attendingRef.current && !presentSet.has(best.student_id)) {
                    presentSet.add(best.student_id)
                    void recordPresence(best.student_id, best.student_name, conf)
                  }
                }
              }
              const x = box.x * W
              const y = box.y * H
              const w = box.w * W
              const h = box.h * H
              ctx.strokeStyle = color
              ctx.lineWidth = 3
              ctx.strokeRect(x, y, w, h)
              ctx.font = '600 13px system-ui, sans-serif'
              const tw = ctx.measureText(label).width
              ctx.fillStyle = color
              ctx.fillRect(x, Math.max(0, y - 22), tw + 14, 22)
              ctx.fillStyle = '#000'
              ctx.fillText(label, x + 7, Math.max(15, y - 7))
            }
          }
          setDetectedCount(faces.length)
        } catch (e) {
          // bỏ qua lỗi từng frame
        }
      }
      if (runningRef.current) rafRef.current = requestAnimationFrame(() => { void step() })
    }
    rafRef.current = requestAnimationFrame(() => { void step() })
  }, [recordPresence])

  // ── Actions ──
  const memberName = useCallback((studentId: string) => {
    const mm = members.find(m => m.student?.id === studentId)
    return mm?.student?.full_name || ''
  }, [members])

  function captureSnapshot(): string | null {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const c = document.createElement('canvas')
    c.width = 120
    c.height = 120
    const ctx = c.getContext('2d')
    if (!ctx) return null
    const vw = video.videoWidth
    const vh = video.videoHeight
    const size = Math.min(vw, vh)
    ctx.drawImage(video, (vw - size) / 2, (vh - size) / 2, size, size, 0, 0, 120, 120)
    return c.toDataURL('image/jpeg', 0.7)
  }

  async function saveFace() {
    if (!selectedStudentId) {
      alert('Hãy chọn học sinh trước khi lưu khuôn mặt')
      return
    }
    const faces = lastFacesRef.current
    if (!faces.length || !faces[0] || faces[0].length < 468) {
      alert('Chưa nhận diện được khuôn mặt. Hãy đứng đối diện camera và đủ ánh sáng.')
      return
    }
    const desc = buildFaceDescriptor(faces[0])
    if (!desc.length) {
      alert('Không thể tạo đặc trưng khuôn mặt')
      return
    }
    setSaving(true)
    try {
      const name = memberName(selectedStudentId) || 'Học sinh'
      const { error } = await supabase
        .from('attendance_faces')
        .upsert(
          { class_id: classId, student_id: selectedStudentId, student_name: name, descriptor: desc },
          { onConflict: 'class_id,student_id' }
        )
      if (error) throw error
      const snap = captureSnapshot()
      setEnrolled(prev => {
        const rest = prev.filter(e => e.student_id !== selectedStudentId)
        return [...rest, { id: `local-${selectedStudentId}`, student_id: selectedStudentId, student_name: name, descriptor: desc }]
      })
      if (snap) setSnapshots(prev => ({ ...prev, [selectedStudentId]: snap }))
    } catch (e: any) {
      alert('Lỗi khi lưu khuôn mặt: ' + (e?.message || 'Lỗi không xác định'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteFace(studentId: string) {
    if (!confirm('Xóa khuôn mặt đã lưu của học sinh này?')) return
    const { error } = await supabase.from('attendance_faces').delete().eq('class_id', classId).eq('student_id', studentId)
    if (error) {
      alert('Lỗi xóa: ' + error.message)
      return
    }
    setEnrolled(prev => prev.filter(e => e.student_id !== studentId))
    setSnapshots(prev => {
      const c = { ...prev }
      delete c[studentId]
      return c
    })
  }

  function startAttendance() {
    setAttending(true)
    attendingRef.current = true
    setEnded(false)
  }

  function endAttendance() {
    setAttending(false)
    attendingRef.current = false
    setEnded(true)
  }

  const studentMembers = members.filter(m => m.student)
  const presentCount = Object.keys(presentMap).length
  const absentList = ended
    ? studentMembers.filter(m => m.student && !presentMap[m.student.id])
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {dbMissing && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '14px', padding: '16px 20px' }}>
          <Database size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '14px', color: '#fbbf24', lineHeight: 1.6 }}>
            <strong>Chưa có bảng điểm danh trong cơ sở dữ liệu.</strong> Hãy chạy file SQL sau trong Supabase
            Dashboard → SQL Editor để tạo bảng <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 6 }}>attendance_faces</code> và{' '}
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 6 }}>attendance_records</code>:
            <br />
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 6, wordBreak: 'break-all' }}>supabase/migrations/20260804000000_face_attendance.sql</code>
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            >
              <RefreshCw size={14} /> Tải lại sau khi đã chạy SQL
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="#00f3ff" />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setMode('enroll')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                background: mode === 'enroll' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                color: mode === 'enroll' ? '#000' : '#8899a6',
              }}
            >
              <UserPlus size={18} /> Lưu khuôn mặt
            </button>
            <button
              onClick={() => setMode('attend')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                background: mode === 'attend' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                color: mode === 'attend' ? '#000' : '#8899a6',
              }}
            >
              <ScanFace size={18} /> Điểm danh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
            {/* Camera */}
            <div style={{ background: 'rgba(12, 20, 36, 0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '14px', overflow: 'hidden', background: '#05080f', border: '1px solid rgba(0,243,255,0.15)' }}>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    const c = canvasRef.current
                    const v = e.currentTarget
                    if (c && v.videoWidth) {
                      c.width = v.videoWidth
                      c.height = v.videoHeight
                    }
                  }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
                />
                {!cameraReady && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#8899a6' }}>
                    <ScanFace size={40} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '14px' }}>Camera đang tắt</span>
                  </div>
                )}
              </div>

              {camError && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '12px', padding: '12px 16px', fontSize: '13px' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {camError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={cameraReady ? stopCamera : () => void startCamera()}
                    disabled={!!camError}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      background: cameraReady ? 'rgba(239,68,68,0.1)' : 'rgba(0,243,255,0.1)',
                      color: cameraReady ? '#f87171' : '#00f3ff',
                      opacity: camError ? 0.5 : 1,
                    }}
                  >
                    {cameraReady ? <CameraOff size={16} /> : <Camera size={16} />}
                    {cameraReady ? 'Tắt camera' : 'Bật camera'}
                  </button>
                </div>
                {cameraReady && (
                  <span style={{ fontSize: '13px', color: '#8899a6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> Khuôn mặt nhận diện: <strong style={{ color: '#00f3ff' }}>{detectedCount}</strong>
                  </span>
                )}
              </div>

              {mode === 'attend' && cameraReady && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!attending ? (
                    <button
                      onClick={startAttendance}
                      disabled={enrolled.length === 0}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '14px',
                        background: 'var(--brand-primary)', color: '#000',
                        opacity: enrolled.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <Play size={18} /> Bắt đầu điểm danh
                    </button>
                  ) : (
                    <button
                      onClick={endAttendance}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '14px',
                        background: 'rgba(239,68,68,0.9)', color: '#fff',
                      }}
                    >
                      <Square size={16} fill="#fff" /> Kết thúc điểm danh
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Side panel */}
            <div style={{ background: 'rgba(12, 20, 36, 0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '420px' }}>
              {mode === 'enroll' ? (
                <>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus size={18} color="#00f3ff" /> Lưu khuôn mặt học sinh
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8899a6' }}>Chọn học sinh, để khuôn mặt vào khung camera, rồi bấm Lưu.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      style={{
                        flex: 1, background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px', padding: '12px 14px', color: '#fff', outline: 'none', fontSize: '14px',
                      }}
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {studentMembers.map(m => {
                        const done = enrolled.some(e => e.student_id === m.student!.id)
                        return (
                          <option key={m.id} value={m.student!.id} style={{ color: '#000' }}>
                            {m.student!.full_name}{done ? ' (đã lưu)' : ''}
                          </option>
                        )
                      })}
                    </select>
                    <button
                      onClick={() => void saveFace()}
                      disabled={saving || !cameraReady}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px',
                        border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '14px',
                        background: 'var(--brand-primary)', color: '#000', opacity: saving || !cameraReady ? 0.5 : 1,
                      }}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                      Lưu
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Khuôn mặt đã lưu ({enrolled.length})
                    </h4>
                    {enrolled.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#4b5563', fontSize: '13px' }}>
                        Chưa có khuôn mặt nào được lưu cho lớp này.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                        {enrolled.map(e => (
                          <div
                            key={e.student_id}
                            style={{ background: 'rgba(5,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative' }}
                          >
                            {snapshots[e.student_id] ? (
                              <img src={snapshots[e.student_id]} alt={e.student_name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,243,255,0.4)' }} />
                            ) : (
                              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,243,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ScanFace size={24} color="#00f3ff" />
                              </div>
                            )}
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {e.student_name}
                            </span>
                            <button
                              onClick={() => void deleteFace(e.student_id)}
                              style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: 4, color: '#f87171', cursor: 'pointer', display: 'flex' }}
                              title="Xóa khuôn mặt"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ScanFace size={18} color="#00f3ff" /> Điểm danh hôm nay
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8899a6' }}>
                      Đã điểm danh: <strong style={{ color: '#10b981' }}>{presentCount}</strong> / {studentMembers.length} học sinh
                      {attending && <span style={{ color: '#f59e0b', marginLeft: 8 }}>● Đang điểm danh</span>}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                    {studentMembers.map(m => {
                      const sid = m.student!.id
                      const rec = presentMap[sid]
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                            padding: '12px 14px', borderRadius: '12px', fontSize: '14px',
                            background: rec ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${rec ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.04)'}`,
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: rec ? '#fff' : '#8899a6', fontWeight: 600 }}>
                            <UserCheck size={16} color={rec ? '#10b981' : '#4b5563'} />
                            {m.student!.full_name}
                          </span>
                          <span style={{ fontSize: '12px', color: rec ? '#10b981' : '#4b5563', fontWeight: 700 }}>
                            {rec
                              ? `${new Date(rec.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · ${rec.confidence}%`
                              : attending ? '...' : 'Chưa điểm danh'}
                          </span>
                        </div>
                      )
                    })}
                    {studentMembers.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '32px', color: '#4b5563', fontSize: '13px' }}>
                        Lớp chưa có học sinh. Hãy mời học sinh tham gia lớp trước.
                      </div>
                    )}
                  </div>

                  {ended && (
                    <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', marginBottom: '8px' }}>
                        Kết quả buổi điểm danh
                      </div>
                      <div style={{ fontSize: '13px', color: '#8899a6', lineHeight: 1.8 }}>
                        <div>Có mặt: <strong style={{ color: '#10b981' }}>{presentCount}</strong></div>
                        <div>
                          Vắng: <strong style={{ color: '#f87171' }}>{absentList.length}</strong>
                          {absentList.length > 0 && (
                            <span style={{ color: '#8899a6', marginLeft: 6 }}>
                              ({absentList.map(m => m.student!.full_name).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
