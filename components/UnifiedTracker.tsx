'use client';

import { useEffect, useRef } from 'react';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const isLowEnd = typeof navigator !== 'undefined' && (navigator as any).hardwareConcurrency <= 4;

export default function UnifiedTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef(0);

  useEffect(() => {
    let active = true;
    let faceLm: any = null;
    let handLm: any = null;

    const start = async () => {
      try {
        const mod = await import('@mediapipe/tasks-vision');
        if (!active) return;
        const vision = await mod.FilesetResolver.forVisionTasks(WASM_BASE);
        if (!active) return;

        const delegate = 'CPU';
        const [f, h] = await Promise.all([
          mod.FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate },
            runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: false,
          }),
          mod.HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate },
            runningMode: 'VIDEO', numHands: 1,
          }),
        ]);
        if (!active) return;
        faceLm = f; handLm = h;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: isLowEnd ? 80 : 160 },
            height: { ideal: isLowEnd ? 60 : 120 },
            facingMode: 'user', frameRate: { ideal: isLowEnd ? 10 : 15 },
          },
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        await video.play();

        const canv = canvasRef.current;
        if (canv) {
          canv.width = isLowEnd ? 80 : 160;
          canv.height = isLowEnd ? 60 : 120;
        }

        let skip = 0;
        const skipN = isLowEnd ? 5 : 3;
        let sp = 0, sy = 0;

        const loop = async () => {
          if (!active || !video || video.readyState < 2) { animRef.current = requestAnimationFrame(loop); return; }
          skip++;
          if (skip % skipN !== 0) { animRef.current = requestAnimationFrame(loop); return; }

          try {
            if (faceLm) {
              const fr = await faceLm.detectForVideo(video, performance.now());
              if (fr.faceLandmarks?.length > 0) {
                const lm = fr.faceLandmarks[0];
                const nose = lm[1], le = lm[33], re = lm[263];
                if (nose && le && re) {
                  const ry = (nose.x - 0.5) * 2;
                  const rp = (nose.y - 0.5) * 2;
                  sp += 0.4 * (Math.max(-0.6, Math.min(0.6, rp)) - sp);
                  sy += 0.4 * (Math.max(-0.8, Math.min(0.8, ry)) - sy);
                  headTrackingRef.pitch = sp;
                  headTrackingRef.yaw = sy;
                }
                if (canv) {
                  const ctx = canv.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(video, 0, 0, canv.width, canv.height);
                    const flm = fr.faceLandmarks[0];
                    if (flm) {
                      ctx.strokeStyle = '#00ff88';
                      ctx.lineWidth = 0.5;
                      const connections: [number, number][] = [
                        [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
                        [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
                        [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
                        [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
                        [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
                        [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
                        [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157],
                        [157, 173], [173, 133], [133, 155], [155, 154], [154, 153], [153, 145],
                        [145, 144], [144, 163], [163, 116],
                      ];
                      for (const [a, b] of connections) {
                        const p1 = flm[a], p2 = flm[b];
                        if (p1 && p2) {
                          ctx.beginPath();
                          ctx.moveTo(p1.x * canv.width, p1.y * canv.height);
                          ctx.lineTo(p2.x * canv.width, p2.y * canv.height);
                          ctx.stroke();
                        }
                      }
                    }
                  }
                }
              }
            }

            if (handLm) {
              const hr = await handLm.detectForVideo(video, performance.now());
              if (hr.landmarks?.length > 0) {
                const hand = hr.landmarks[0];
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
            }
          } catch {}
          animRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch {}
    };
    start();
    return () => {
      active = false;
      cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 9999,
      width: isLowEnd ? 120 : 200, height: isLowEnd ? 90 : 150,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(0,255,136,0.3)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    }}>
      <video ref={videoRef} muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
      />
      <canvas ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
      />
      <div style={{
        position: 'absolute', top: 4, left: 4,
        background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4,
        fontSize: 8, color: '#00ff88', fontFamily: 'monospace',
      }}>
        {isLowEnd ? '80×60' : '160×120'}
      </div>
    </div>
  );
}
