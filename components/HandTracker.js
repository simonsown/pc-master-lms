'use client';

import { useEffect, useRef, useState } from 'react';

const MODEL_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
  'https://unpkg.com/@mediapipe/tasks-vision@0.10.18/wasm',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm',
];

const LANDMARKER_URLS = [
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  'https://cdn.jsdelivr.net/gh/simonsown/pc-master-lms@main/public/models/hand_landmarker.task',
];

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    return true;
  } catch { return false; }
}

const HandTracker = ({ onLandmarks, numHands = 1 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo AI...');
  const retryCountRef = useRef(0);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const mountedRef = useRef(true);
  const frameSkipRef = useRef(0);
  const lastLMCallbackRef = useRef(null);

  useEffect(() => {
    lastLMCallbackRef.current = onLandmarks;
  }, [onLandmarks]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const loadModel = async () => {
      setLoading(true);
      setLoadingMessage('Đang tải mô hình AI...');
      const hasWebGL = checkWebGLSupport();

      let lastError = null;
      for (let attempt = 0; attempt < MODEL_URLS.length * 2; attempt++) {
        if (cancelled) return;
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 8000)));
        }

        const visionUrlIdx = attempt % MODEL_URLS.length;
        const modelUrlIdx = Math.floor(attempt / MODEL_URLS.length) % LANDMARKER_URLS.length;

        try {
          const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');

          if (cancelled) return;
          setLoadingMessage(`Đang tải AI... (thử ${attempt + 1})`);

          const vision = await FilesetResolver.forVisionTasks(MODEL_URLS[visionUrlIdx]);
          if (cancelled) return;

          const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
          const landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: LANDMARKER_URLS[modelUrlIdx],
              delegate: isLowEnd ? 'CPU' : (hasWebGL ? 'GPU' : 'CPU')
            },
            runningMode: 'VIDEO',
            numHands: numHands
          });

          if (cancelled) return;
          setHandLandmarker(landmarker);
          setLoading(false);
          setTimeout(() => setWebcamRunning(true), 100);
          return;
        } catch (err) {
          lastError = err;
          console.warn(`HandTracker attempt ${attempt + 1} failed:`, err.message);
        }
      }

      if (!cancelled) {
        setError(lastError?.message?.includes('NetworkError') || lastError?.message?.includes('Failed to fetch')
          ? 'Không thể tải mô hình AI do mạng yếu. Vui lòng thử lại hoặc dùng mạng mạnh hơn.'
          : 'Không thể tải mô hình AI. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    loadModel();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!handLandmarker || !webcamRunning) return;
    let cancelled = false;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Trình duyệt không hỗ trợ camera.');
          return;
        }

        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user', frameRate: { ideal: isLowEnd ? 20 : 30 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');

        await video.play();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const predictLoop = async () => {
          if (!mountedRef.current) return;

          const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
          const skipFrames = isLowEnd ? 3 : 2;
          frameSkipRef.current++;
          if (frameSkipRef.current % skipFrames !== 0) {
            animRef.current = requestAnimationFrame(predictLoop);
            return;
          }

          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          try {
            const results = await handLandmarker.detectForVideo(video, performance.now());

            if (results.landmarks && results.landmarks.length > 0) {
              const mirrored = results.landmarks.map((hand) =>
                hand.map(p => ({ ...p, x: 1 - p.x }))
              );
              if (lastLMCallbackRef.current) {
                lastLMCallbackRef.current(mirrored);
              }
            } else {
              if (lastLMCallbackRef.current) {
                lastLMCallbackRef.current([]);
              }
            }
          } catch (e) {
            console.warn('detect error:', e);
          }
          animRef.current = requestAnimationFrame(predictLoop);
        };

        predictLoop();
      } catch (err) {
        if (cancelled) return;
        const msg = err.name === 'NotAllowedError'
          ? 'Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong trình duyệt.'
          : 'Không thể truy cập camera: ' + err.message;
        setError(msg);
      }
    };

    startCamera();
    return () => { cancelled = true; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [handLandmarker, webcamRunning]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setHandLandmarker(null);
    setWebcamRunning(false);
    setLoading(true);
    setLoadingMessage('Đang thử lại...');
    retryCountRef.current = 0;
  };

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#ef4444', gap: '12px', padding: '16px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ fontSize: '13px', textAlign: 'center', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>{error}</p>
        <button onClick={handleRetry} style={{ padding: '8px 20px', background: '#00d4aa', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black', overflow: 'hidden', borderRadius: '4px' }}>
      <video
        ref={videoRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', display: 'none' }}
      />
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#020617' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #00d4aa', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>{loadingMessage}</span>
          <span style={{ color: '#666', fontSize: '11px' }}>Sử dụng mô hình AI MediaPipe</span>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default HandTracker;
