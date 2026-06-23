'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const SNAPSHOT_INTERVAL = 60000
const FACE_CHECK_INTERVAL = 1500
const MAX_VIOLATIONS = 3

export type ViolationType = 'tab_switch' | 'fullscreen_exit' | 'face_not_visible' | 'multiple_faces' | 'looking_away' | 'no_face_match'

export interface ProctorState {
  status: 'idle' | 'loading' | 'active' | 'error'
  faceDetected: boolean
  faceMatch: boolean
  multipleFaces: boolean
  lookingAway: boolean
  violations: number
  maxViolations: number
  cameraError: string | null
  stream: MediaStream | null
  identityCapture: string | null
  gazeDirection: { yaw: number; pitch: number }
}

interface ProctorOptions {
  examId: string
  attemptId: string
  identityPhoto?: string | null
  onViolation?: (type: ViolationType) => void
  onMaxViolations?: () => void
}

const FACE_LANDMARKER_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'

export function useProctorEngine({ examId, attemptId, identityPhoto, onViolation, onMaxViolations }: ProctorOptions) {
  const [state, setState] = useState<ProctorState>({
    status: 'idle',
    faceDetected: false,
    faceMatch: false,
    multipleFaces: false,
    lookingAway: false,
    violations: 0,
    maxViolations: MAX_VIOLATIONS,
    cameraError: null,
    stream: null,
    identityCapture: null,
    gazeDirection: { yaw: 0, pitch: 0 },
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const faceCheckTimerRef = useRef<any>(null)
  const snapshotTimerRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const violationCountRef = useRef(0)

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240)
        return canvasRef.current.toDataURL('image/png')
      }
    }
    return null
  }, [])

  const recordViolation = useCallback(async (type: ViolationType, data?: string) => {
    if (!mountedRef.current) return
    violationCountRef.current += 1

    setState(prev => ({ ...prev, violations: violationCountRef.current }))

    const snapshot = capturePhoto()
    const violationData = {
      type,
      message: data || `Vi pham lan ${violationCountRef.current}`,
      snapshot: snapshot || null,
      violationCount: violationCountRef.current,
    }

    supabase.from('exam_logs').insert({
      exam_id: examId,
      attempt_id: attemptId,
      event_type: type,
      event_data: JSON.stringify(violationData),
      created_at: new Date().toISOString(),
    }).then()

    onViolation?.(type)

    if (violationCountRef.current >= MAX_VIOLATIONS) {
      onMaxViolations?.()
    }
  }, [examId, attemptId, capturePhoto, onViolation, onMaxViolations])

  const startCamera = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading', cameraError: null }))
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 240 }, height: { ideal: 180 }, facingMode: 'user', frameRate: { ideal: 15 } },
      })
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState(prev => ({ ...prev, status: 'active', stream }))
      return stream
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Ban da tu choi quyen Camera. Vui long cho phep Camera trong trinh duyet!'
        : err.name === 'NotFoundError'
          ? 'Khong tim thay Webcam. Vui long ket noi Webcam va thu lai.'
          : 'Loi camera: ' + (err.message || 'Loi khong xac dinh')
      setState(prev => ({ ...prev, status: 'error', cameraError: msg }))
      return null
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setState(prev => ({ ...prev, stream: null, status: 'idle' }))
  }, [])

  const initMediaPipe = useCallback(async () => {
    try {
      const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_LANDMARKER_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: false,
      })
      if (mountedRef.current) landmarkerRef.current = landmarker
    } catch (e) {
      console.warn('MediaPipe init failed, falling back to canvas detection:', e)
    }
  }, [])

  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return { face: false, multiple: false, yaw: 0, pitch: 0 }
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return { face: false, multiple: false, yaw: 0, pitch: 0 }

    const w = video.videoWidth || 240
    const h = video.videoHeight || 180
    canvas.width = w
    canvas.height = h
    ctx.drawImage(video, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    let skinPixels = 0
    const total = data.length / 4
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skinPixels++
    }
    const ratio = skinPixels / (total / 4)
    return { face: ratio > 0.05, multiple: false, yaw: 0, pitch: 0 }
  }, [])

  const startFaceDetection = useCallback(async () => {
    await initMediaPipe()

    const runDetection = async () => {
      if (!mountedRef.current || !videoRef.current || videoRef.current.readyState < 2) return

      try {
        let face = false, multiple = false, yaw = 0, pitch = 0

        if (landmarkerRef.current) {
          const results = await landmarkerRef.current.detectForVideo(videoRef.current, performance.now())
          if (results.faceLandmarks?.length > 0) {
            face = true
            multiple = results.faceLandmarks.length > 1

            const nose = results.faceLandmarks[0][1]
            if (nose) {
              yaw = (nose.x - 0.5) * 2
              pitch = (nose.y - 0.5) * 2
            }
          }
        } else {
          const result = detectFace()
          face = result.face
        }

        if (!mountedRef.current) return

        setState(prev => ({
          ...prev,
          faceDetected: face,
          multipleFaces: multiple,
          lookingAway: Math.abs(yaw) > 0.4 || Math.abs(pitch) > 0.35,
          gazeDirection: { yaw, pitch },
        }))

        if (multiple) {
          recordViolation('multiple_faces', 'Phat hien nhieu hon 1 khuon mat trong khung hinh')
        }

        if (!face) {
          recordViolation('face_not_visible', 'Khong phat hien khuon mat truoc camera')
        } else if (Math.abs(yaw) > 0.4 || Math.abs(pitch) > 0.35) {
          recordViolation('looking_away', `Nhin sang huong khac (yaw=${yaw.toFixed(2)}, pitch=${pitch.toFixed(2)})`)
        }
      } catch (e) {
      }
    }

    faceCheckTimerRef.current = setInterval(runDetection, FACE_CHECK_INTERVAL)
    snapshotTimerRef.current = setInterval(() => {
      const photo = capturePhoto()
      if (photo) {
        supabase.from('exam_logs').insert({
          exam_id: examId,
          attempt_id: attemptId,
          event_type: 'snapshot',
          event_data: photo,
          created_at: new Date().toISOString(),
        }).then()
      }
    }, SNAPSHOT_INTERVAL)
  }, [initMediaPipe, detectFace, recordViolation, capturePhoto, examId, attemptId])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopCamera()
      clearInterval(faceCheckTimerRef.current)
      clearInterval(snapshotTimerRef.current)
      cancelAnimationFrame(animRef.current)
      landmarkerRef.current = null
    }
  }, [stopCamera])

  const captureIdentity = useCallback(() => {
    const photo = capturePhoto()
    if (photo) {
      setState(prev => ({ ...prev, identityCapture: photo }))
    }
    return photo
  }, [capturePhoto])

  return {
    state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    startFaceDetection,
    recordViolation,
    captureIdentity,
    capturePhoto,
  }
}
