'use client';

import { useEffect, useRef } from 'react';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const FACE = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const isLow = typeof navigator !== 'undefined' && (navigator as any).hardwareConcurrency <= 4;

export default function UnifiedTracker() {
  const vRef = useRef<HTMLVideoElement>(null);
  const cRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let ok = true;
    let fl: any = null, hl: any = null;

    (async () => {
      try {
        const m = await import('@mediapipe/tasks-vision');
        if (!ok) return;
        const vis = await m.FilesetResolver.forVisionTasks(WASM);
        if (!ok) return;
        const [f, h] = await Promise.all([
          m.FaceLandmarker.createFromOptions(vis, { baseOptions: { modelAssetPath: FACE, delegate: 'CPU' }, runningMode: 'VIDEO', numFaces: 1 }),
          m.HandLandmarker.createFromOptions(vis, { baseOptions: { modelAssetPath: HAND, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 1 }),
        ]);
        if (!ok) return;
        fl = f; hl = h;

        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: isLow ? 80 : 160 }, height: { ideal: isLow ? 60 : 120 }, facingMode: 'user', frameRate: { ideal: isLow ? 10 : 15 } },
        });
        if (!ok) { s.getTracks().forEach(t => t.stop()); return; }
        const video = vRef.current;
        if (!video) return;
        video.srcObject = s;
        video.setAttribute('playsinline', '');
        await video.play();

        const canv = cRef.current;
        if (canv) { canv.width = isLow ? 80 : 160; canv.height = isLow ? 60 : 120; }

        let skip = 0;
        const n = isLow ? 5 : 3;
        let sp = 0, sy = 0;

        const loop = async () => {
          if (!ok || !video || video.readyState < 2) { requestAnimationFrame(loop); return; }
          skip++;
          if (skip % n !== 0) { requestAnimationFrame(loop); return; }
          try {
            if (fl) {
              const fr = await fl.detectForVideo(video, performance.now());
              if (fr.faceLandmarks?.length > 0) {
                const lm = fr.faceLandmarks[0];
                const nose = lm[1], le = lm[33], re = lm[263];
                if (nose && le && re) {
                  const ry = (nose.x - 0.5) * 2, rp = (nose.y - 0.5) * 2;
                  sp += 0.35 * (Math.max(-0.6, Math.min(0.6, rp)) - sp);
                  sy += 0.35 * (Math.max(-0.8, Math.min(0.8, ry)) - sy);
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
                      const conn: [number, number][] = [[10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10]];
                      for (const [a, b] of conn) {
                        const p1 = flm[a], p2 = flm[b];
                        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.x * canv.width, p1.y * canv.height); ctx.lineTo(p2.x * canv.width, p2.y * canv.height); ctx.stroke(); }
                      }
                    }
                  }
                }
              }
            }
            if (hl) {
              const hr = await hl.detectForVideo(video, performance.now());
              if (hr.landmarks?.length > 0) {
                const hand = hr.landmarks[0];
                handDataRef.landmarks = hand.map((p: any) => [p.x, p.y, p.z]);
                handDataRef.active = true;
                const tip = hand[8], pip = hand[6], mTip = hand[12], mPip = hand[10];
                const tTip = hand[4], iTip = hand[8], rTip = hand[12], pTip = hand[16];
                handDataRef.pointing = tip.y < pip.y && mTip.y > mPip.y;
                const dx = tTip.x - iTip.x, dy = tTip.y - iTip.y;
                handDataRef.pinch = Math.sqrt(dx * dx + dy * dy) < 0.05;
                const palm = hand[0];
                const d1 = Math.hypot(tTip.x - palm.x, tTip.y - palm.y, tTip.z - palm.z);
                const d2 = Math.hypot(iTip.x - palm.x, iTip.y - palm.y, iTip.z - palm.z);
                const d3 = Math.hypot(rTip.x - palm.x, rTip.y - palm.y, rTip.z - palm.z);
                const d4 = Math.hypot(pTip.x - palm.x, pTip.y - palm.y, pTip.z - palm.z);
                handDataRef.grab = d1 < 0.08 && d2 < 0.08 && d3 < 0.08 && d4 < 0.08;
              } else {
                handDataRef.active = false;
                handDataRef.pointing = false;
                handDataRef.pinch = false;
                handDataRef.grab = false;
                handDataRef.landmarks = null;
              }
            }
          } catch {}
          requestAnimationFrame(loop);
        };
        loop();
      } catch {}
    })();
    return () => { ok = false; };
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 9999,
      width: isLow ? 120 : 200, height: isLow ? 90 : 150,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(0,255,136,0.3)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    }}>
      <video ref={vRef} muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
      />
      <canvas ref={cRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
      />
      <div style={{
        position: 'absolute', top: 4, left: 4,
        background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4,
        fontSize: 8, color: '#00ff88', fontFamily: 'monospace',
      }}>
        {isLow ? '80×60' : '160×120'}
      </div>
    </div>
  );
}
