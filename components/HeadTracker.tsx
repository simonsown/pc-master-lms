'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAssemblyStore } from '@/lib/useStore';

const FACE_LANDMARKER_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';

const LERP_FACTOR = 0.6;
const PITCH_MIN = -0.6;
const PITCH_MAX = 0.6;
const YAW_MIN = -0.8;
const YAW_MAX = 0.8;

export default function HeadTracker() {
  const setCameraCoords = useAssemblyStore((s) => s.setCameraCoords);
  const cameraCoords = useAssemblyStore((s) => s.cameraCoords);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasWebcam, setHasWebcam] = useState(false);
  const [trackingFps, setTrackingFps] = useState(0);

  const smoothPitch = useRef(0);
  const smoothYaw = useRef(0);
  const fpsCount = useRef(0);
  const fpsTime = useRef(0);

  const drawFaceMesh = useCallback(
    (landmarks: { x: number; y: number; z: number }[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(0, 212, 170, 0.6)';
      ctx.lineWidth = 1;

      const FACE_CONNECTIONS: [number, number][] = [
        [10, 338],
        [338, 297],
        [297, 332],
        [332, 284],
        [284, 251],
        [251, 389],
        [389, 356],
        [356, 454],
        [454, 323],
        [323, 361],
        [361, 288],
        [288, 397],
        [397, 365],
        [365, 379],
        [379, 378],
        [378, 400],
        [400, 377],
        [377, 152],
        [152, 148],
        [148, 176],
        [176, 149],
        [149, 150],
        [150, 136],
        [136, 172],
        [172, 58],
        [58, 132],
        [132, 93],
        [93, 234],
        [234, 127],
        [127, 162],
        [162, 21],
        [21, 54],
        [54, 103],
        [103, 67],
        [67, 109],
        [109, 10],
        [10, 338],
        [46, 53],
        [53, 52],
        [52, 65],
        [65, 55],
        [55, 285],
        [285, 295],
        [295, 282],
        [282, 283],
        [283, 276],
        [276, 352],
        [352, 346],
        [346, 340],
        [340, 330],
        [330, 329],
        [329, 450],
        [450, 449],
        [449, 448],
        [448, 261],
        [261, 446],
        [446, 342],
        [342, 445],
        [445, 444],
        [444, 443],
        [443, 442],
        [442, 441],
        [441, 413],
        [413, 414],
        [414, 372],
        [372, 383],
        [383, 300],
        [300, 301],
        [301, 263],
        [263, 466],
        [466, 388],
        [388, 387],
        [387, 386],
        [386, 385],
        [385, 384],
        [384, 398],
        [398, 362],
        [362, 382],
        [382, 381],
        [381, 380],
        [380, 374],
        [374, 373],
        [373, 390],
        [390, 249],
        [249, 64],
        [64, 98],
        [98, 97],
        [97, 96],
        [96, 95],
        [95, 94],
        [94, 93],
        [93, 132],
        [116, 163],
        [163, 123],
        [123, 143],
        [143, 155],
        [155, 154],
        [154, 157],
        [157, 158],
        [158, 159],
        [159, 160],
        [160, 161],
        [161, 243],
        [243, 173],
        [173, 133],
        [133, 245],
        [245, 244],
        [244, 246],
        [246, 247],
        [247, 248],
        [248, 249],
        [33, 246],
        [246, 161],
        [161, 160],
        [160, 159],
        [159, 158],
        [158, 157],
        [157, 173],
        [173, 133],
        [133, 155],
        [155, 154],
        [154, 153],
        [153, 145],
        [145, 144],
        [144, 163],
        [163, 116],
        [168, 9],
        [9, 8],
        [8, 168],
        [168, 6],
        [6, 197],
        [197, 195],
        [195, 5],
        [5, 4],
        [4, 1],
        [1, 19],
        [19, 20],
        [20, 24],
        [24, 4],
        [4, 5],
        [5, 195],
        [197, 6],
        [6, 168],
        [168, 8],
        [8, 9],
      ];

      for (const [i, j] of FACE_CONNECTIONS) {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(0, 212, 170, 0.8)';
      const keyPoints = [1, 4, 5, 6, 8, 9, 10, 33, 133, 152, 159, 249, 263, 362, 386, 454, 466, 468, 473];
      for (const idx of keyPoints) {
        const p = landmarks[idx];
        if (p) {
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const init = async () => {
      try {
        setStatus('loading');
        const { FilesetResolver, FaceLandmarker } = await import(
          '@mediapipe/tasks-vision'
        );

        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_LANDMARKER_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
        });

        if (cancelled) return;
        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        await video.play();
        setHasWebcam(true);
        setStatus('active');
        fpsTime.current = performance.now();
      } catch (err: any) {
        if (cancelled) return;
        const msg =
          err.name === 'NotAllowedError'
            ? 'Webcam access denied. Please allow camera permissions.'
            : err.name === 'NotFoundError'
              ? 'No webcam found.'
              : `Face tracking init failed: ${err.message}`;
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    init();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status !== 'active' || !landmarkerRef.current) return;

    let running = true;
    const video = videoRef.current;

    const predictLoop = async () => {
      if (!running || !landmarkerRef.current || !video || video.readyState < 2)
        return;

      try {
        const results = await landmarkerRef.current.detectForVideo(
          video,
          performance.now()
        );

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const nose = landmarks[1];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];
          const mouth = landmarks[13];

          if (nose && leftEye && rightEye && mouth) {
            const eyeMidX = (leftEye.x + rightEye.x) / 2;
            const eyeMidY = (leftEye.y + rightEye.y) / 2;

            const rawYaw = (nose.x - 0.5) * 2;
            const rawPitch = (nose.y - 0.5) * 2;

            smoothPitch.current +=
              LERP_FACTOR *
              (Math.max(PITCH_MIN, Math.min(PITCH_MAX, rawPitch)) -
                smoothPitch.current);
            smoothYaw.current +=
              LERP_FACTOR *
              (Math.max(YAW_MIN, Math.min(YAW_MAX, rawYaw)) -
                smoothYaw.current);

            setCameraCoords({
              pitch: smoothPitch.current,
              yaw: smoothYaw.current,
              roll: 0,
            });

            fpsCount.current++;
            const now = performance.now();
            if (now - fpsTime.current > 1000) {
              setTrackingFps(fpsCount.current);
              fpsCount.current = 0;
              fpsTime.current = now;
            }
          }

          drawFaceMesh(results.faceLandmarks[0]);
        }
      } catch (e) {
      }

      animRef.current = requestAnimationFrame(predictLoop);
    };

    predictLoop();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [status, setCameraCoords, drawFaceMesh]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMsg('');
    setHasWebcam(false);
    landmarkerRef.current = null;
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        width: 200,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 9999,
        border: '1px solid rgba(0, 212, 170, 0.3)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        background: '#000',
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
        }}
      />
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.85)',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: '2px solid rgba(0,212,170,0.3)',
              borderTopColor: '#00d4aa',
              borderRadius: '50%',
              animation: 'ht-spin 0.8s linear infinite',
            }}
          />
          <span style={{ color: '#00d4aa', fontSize: 10, fontWeight: 600 }}>
            INITIALIZING AI TRACKING
          </span>
        </div>
      )}
      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 12,
            background: 'rgba(0,0,0,0.9)',
          }}
        >
          <span style={{ color: '#ef4444', fontSize: 9, textAlign: 'center' }}>
            {errorMsg}
          </span>
          <button
            onClick={handleRetry}
            style={{
              padding: '4px 12px',
              background: '#00d4aa',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            RETRY
          </button>
        </div>
      )}
      {status === 'active' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.7)',
              padding: '3px 8px',
              borderRadius: 6,
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
            <span
              style={{
                color: '#10b981',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              AI TRACKING ACTIVE
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 8,
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}
          >
            {trackingFps} FPS
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              display: 'flex',
              gap: 8,
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 7,
              fontFamily: 'monospace',
              color: '#64748b',
            }}
          >
            <span>
              P: {(cameraCoords.pitch * 100).toFixed(0)}
            </span>
            <span>
              Y: {(cameraCoords.yaw * 100).toFixed(0)}
            </span>
          </div>
        </>
      )}
      <style>{`@keyframes ht-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
