'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const SNAPSHOT_INTERVAL = 60000
const FACE_CHECK_INTERVAL = 1500
const AUDIO_CHECK_INTERVAL = 3000
const IDLE_CHECK_INTERVAL = 5000
const SCREEN_REC_CHECK_INTERVAL = 30000
const MAX_VIOLATIONS = 5
const IDLE_THRESHOLD = 30
const AUDIO_THRESHOLD = 0.15
const GAZE_YAW_THRESHOLD = 0.4
const GAZE_PITCH_THRESHOLD = 0.35

export type ViolationType = 'tab_switch' | 'fullscreen_exit' | 'face_not_visible' | 'multiple_faces' | 'looking_away' | 'no_face_match' | 'audio_anomaly' | 'prolonged_idle' | 'screen_recording' | 'vm_detected'

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
  audioLevel: number
  isIdle: boolean
  idleTime: number
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
    audioLevel: 0,
    isIdle: false,
    idleTime: 0,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<any>(null)
  const faceCheckTimerRef = useRef<any>(null)
  const snapshotTimerRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const violationCountRef = useRef(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const idleTimeRef = useRef<number>(0)
  const audioCheckTimerRef = useRef<any>(null)
  const idleCheckTimerRef = useRef<any>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const activityHandlerRef = useRef<(() => void) | null>(null)
  const screenRecCheckTimerRef = useRef<any>(null)
  const vmCheckedRef = useRef<boolean>(false)

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
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 240 }, height: { ideal: 180 }, facingMode: 'user', frameRate: { ideal: 15 } },
          audio: true,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 240 }, height: { ideal: 180 }, facingMode: 'user', frameRate: { ideal: 15 } },
        })
      }
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

  const setupAudioDetection = useCallback(() => {
    const stream = streamRef.current
    if (!stream) return
    try {
      const audioTrack = stream.getAudioTracks()[0]
      if (!audioTrack) return

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

      audioCheckTimerRef.current = setInterval(() => {
        if (!analyserRef.current || !audioDataRef.current) return
        analyserRef.current.getByteFrequencyData(audioDataRef.current)
        const sum = audioDataRef.current.reduce((a, b) => a + b, 0)
        const average = sum / audioDataRef.current.length
        const level = average / 255

        setState(prev => ({ ...prev, audioLevel: level }))

        if (level > AUDIO_THRESHOLD) {
          recordViolation('audio_anomaly', `Phat hien am thanh bat thuong (muc do: ${level.toFixed(2)})`)
        }
      }, AUDIO_CHECK_INTERVAL)
    } catch {
    }
  }, [recordViolation])

  const setupIdleDetection = useCallback(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      idleTimeRef.current = 0
    }
    activityHandlerRef.current = updateActivity

    window.addEventListener('mousemove', updateActivity)
    window.addEventListener('mousedown', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('touchstart', updateActivity)

    idleCheckTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - lastActivityRef.current) / 1000
      idleTimeRef.current = elapsed
      setState(prev => ({ ...prev, isIdle: elapsed > IDLE_THRESHOLD, idleTime: Math.floor(elapsed) }))

      if (Math.floor(elapsed) === IDLE_THRESHOLD + 1) {
        recordViolation('prolonged_idle', `Khong co hoat dong chuot/ban phim trong ${Math.floor(elapsed)} giay`)
      }
    }, IDLE_CHECK_INTERVAL)
  }, [recordViolation])

  const detectScreenRecording = useCallback(() => {
    try {
      // @ts-ignore
      if (navigator.mediaSession?.playbackState === 'recording') {
        recordViolation('screen_recording', 'Phat hien phan mem ghi man hinh (mediaSession)')
        return
      }
    } catch {}

    try {
      // @ts-ignore
      if (window.screenRecording || window.__RECORDING__) {
        recordViolation('screen_recording', 'Phat hien phan mem ghi man hinh (window flag)')
        return
      }
    } catch {}
  }, [recordViolation])

  const detectVM = useCallback(() => {
    if (vmCheckedRef.current) return
    vmCheckedRef.current = true

    const vmIndicators: string[] = []

    if (navigator.webdriver) {
      vmIndicators.push('webdriver')
    }

    const platform = navigator.platform?.toLowerCase() || ''
    if (platform.includes('vm') || platform.includes('virtual')) {
      vmIndicators.push('platform')
    }

    const { width, height } = window.screen
    if ((width === 1024 && height === 768) || (width === 800 && height === 600)) {
      vmIndicators.push('resolution')
    }

    if (navigator.hardwareConcurrency <= 2) {
      vmIndicators.push('low_cores')
    }

    for (let i = 0; i < navigator.plugins.length; i++) {
      const name = navigator.plugins[i].name.toLowerCase()
      if (name.includes('vmware') || name.includes('virtualbox') || name.includes('hyper-v') || name.includes('virtual machine')) {
        vmIndicators.push('vmm_plugin')
        break
      }
    }

    if (vmIndicators.length >= 2) {
      recordViolation('vm_detected', `Phat hien may ao (dau hieu: ${vmIndicators.join(', ')})`)
    }
  }, [recordViolation])

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
          lookingAway: Math.abs(yaw) > GAZE_YAW_THRESHOLD || Math.abs(pitch) > GAZE_PITCH_THRESHOLD,
          gazeDirection: { yaw, pitch },
        }))

        if (multiple) {
          recordViolation('multiple_faces', 'Phat hien nhieu hon 1 khuon mat trong khung hinh')
        }

        if (!face) {
          recordViolation('face_not_visible', 'Khong phat hien khuon mat truoc camera')
        } else if (Math.abs(yaw) > GAZE_YAW_THRESHOLD || Math.abs(pitch) > GAZE_PITCH_THRESHOLD) {
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

    setupAudioDetection()
    setupIdleDetection()
    screenRecCheckTimerRef.current = setInterval(detectScreenRecording, SCREEN_REC_CHECK_INTERVAL)
    detectVM()
  }, [initMediaPipe, detectFace, recordViolation, capturePhoto, examId, attemptId, setupAudioDetection, setupIdleDetection, detectScreenRecording, detectVM])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopCamera()
      clearInterval(faceCheckTimerRef.current)
      clearInterval(snapshotTimerRef.current)
      landmarkerRef.current = null

      clearInterval(audioCheckTimerRef.current)
      clearInterval(idleCheckTimerRef.current)
      clearInterval(screenRecCheckTimerRef.current)

      if (activityHandlerRef.current) {
        window.removeEventListener('mousemove', activityHandlerRef.current)
        window.removeEventListener('mousedown', activityHandlerRef.current)
        window.removeEventListener('keydown', activityHandlerRef.current)
        window.removeEventListener('touchstart', activityHandlerRef.current)
        activityHandlerRef.current = null
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
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
