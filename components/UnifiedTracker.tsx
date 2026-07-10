'use client';

import { useEffect, useRef } from 'react';
import { useAssemblyStore } from '@/lib/useStore';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export default function UnifiedTracker({ onReady }: { onReady?: () => void }) {
  const setCameraCoords = useAssemblyStore((s) => s.setCameraCoords);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let faceLandmarker: any = null;
    let handLandmarker: any = null;
    let video: HTMLVideoElement | null = null;

    const init = async () => {
      try {
        const { FilesetResolver, FaceLandmarker, HandLandmarker } = await import('@mediapipe/tasks-vision');
        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;

        const isLowEnd = (navigator as any).hardwareConcurrency <= 4;
        const delegate = isLowEnd ? 'CPU' : 'GPU';

        const [fl, hl] = await Promise.all([
          FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate },
            runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: false,
          }),
          HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate },
            runningMode: 'VIDEO', numHands: 1,
          }),
        ]);
        if (cancelled) return;
        faceLandmarker = fl;
        handLandmarker = hl;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: isLowEnd ? 160 : 320 },
            height: { ideal: isLowEnd ? 120 : 240 },
            facingMode: 'user', frameRate: { ideal: isLowEnd ? 15 : 20 },
          },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        await video.play();

        onReady?.();

        let smoothPitch = 0, smoothYaw = 0;
        let skip = 0;
        const skipEvery = isLowEnd ? 3 : 2;

        const loop = async () => {
          if (!mountedRef.current || !faceLandmarker || !handLandmarker || !video || video.readyState < 2) {
            animRef.current = requestAnimationFrame(loop);
            return;
          }
          skip++;
          if (skip % skipEvery !== 0) { animRef.current = requestAnimationFrame(loop); return; }

          try {
            const [faceResult, handResult] = await Promise.all([
              faceLandmarker.detectForVideo(video, performance.now()),
              handLandmarker.detectForVideo(video, performance.now()),
            ]);

            if (faceResult.faceLandmarks?.length > 0) {
              const lm = faceResult.faceLandmarks[0];
              const nose = lm[1], leftEye = lm[33], rightEye = lm[263];
              if (nose && leftEye && rightEye) {
                const rawYaw = (nose.x - 0.5) * 2;
                const rawPitch = (nose.y - 0.5) * 2;
                smoothPitch += 0.5 * (Math.max(-0.6, Math.min(0.6, rawPitch)) - smoothPitch);
                smoothYaw += 0.5 * (Math.max(-0.8, Math.min(0.8, rawYaw)) - smoothYaw);
                headTrackingRef.pitch = smoothPitch;
                headTrackingRef.yaw = smoothYaw;
                setCameraCoords({ pitch: smoothPitch, yaw: smoothYaw, roll: 0 });
              }
            }

            if (handResult.landmarks?.length > 0) {
              const hand = handResult.landmarks[0];
              handDataRef.landmarks = hand.map((p: any) => [p.x, p.y, p.z]);
              handDataRef.active = true;
              const tip = hand[8], pip = hand[6], mTip = hand[12], mPip = hand[10];
              const thumbTip = hand[4], indexTip = hand[8];
              handDataRef.pointing = tip.y < pip.y && mTip.y > mPip.y;
              const dx = thumbTip.x - indexTip.x;
              const dy = thumbTip.y - indexTip.y;
              handDataRef.pinch = Math.sqrt(dx * dx + dy * dy) < 0.05;
            } else {
              handDataRef.active = false;
              handDataRef.pointing = false;
              handDataRef.pinch = false;
              handDataRef.landmarks = null;
            }
          } catch { }
          animRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch { }
    };
    init();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return <video ref={videoRef} style={{ display: 'none' }} playsInline muted />;
}
