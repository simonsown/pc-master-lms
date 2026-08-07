'use client';

// CameraEngine: BỘ BẮT CHUYỂN ĐỘNG MỚI HOÀN TOÀN (đầu + tay cùng 1 camera)
// Dùng MediaPipe FaceLandmarker + HandLandmarker.
// - Đầu   : tính yaw/pitch/roll từ hình học khuôn mặt (mũi - 2 mắt - cằm)
// - Tay   : 21 landmark, nhận diện nắm (grab) / mở (release) / chụm (pinch) / chỉ (pointing)
//           và xoay cổ tay (wrist roll)

import { useEffect, useRef } from 'react';
import { headPose, handState } from './tracking-shared';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const FACE = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const isLow = typeof navigator !== 'undefined' && (navigator as any).hardwareConcurrency <= 4;

export default function CameraEngine({ preview = true }: { preview?: boolean }) {
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
          m.FaceLandmarker.createFromOptions(vis, {
            baseOptions: { modelAssetPath: FACE, delegate: 'CPU' },
            runningMode: 'VIDEO', numFaces: 1,
          }),
          m.HandLandmarker.createFromOptions(vis, {
            baseOptions: { modelAssetPath: HAND, delegate: 'CPU' },
            runningMode: 'VIDEO', numHands: 1,
          }),
        ]);
        if (!ok) return;
        fl = f; hl = h;

        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: isLow ? 128 : 320 },
            height: { ideal: isLow ? 96 : 240 },
            facingMode: 'user',
            frameRate: { ideal: isLow ? 12 : 24 },
          },
        });
        if (!ok) { s.getTracks().forEach(t => t.stop()); return; }
        const video = vRef.current;
        if (!video) return;
        video.srcObject = s;
        video.setAttribute('playsinline', '');
        await video.play();

        const canv = cRef.current;
        if (canv) { canv.width = isLow ? 128 : 320; canv.height = isLow ? 96 : 240; }

        const n = isLow ? 4 : 2;
        let skip = 0;
        let sp = 0, sy = 0, sr = 0;
        // bộ lọc cho nắm tay
        let grabFrames = 0;

        const loop = async () => {
          if (!ok || !video || video.readyState < 2) { requestAnimationFrame(loop); return; }
          skip++;
          if (skip % n !== 0) { requestAnimationFrame(loop); return; }
          try {
            // ===== FACE =====
            if (fl) {
              const fr = await fl.detectForVideo(video, performance.now());
              if (fr.faceLandmarks?.length > 0) {
                const lm = fr.faceLandmarks[0];
                const nose = lm[1], le = lm[33], re = lm[263], chin = lm[152];
                if (nose && le && re && chin) {
                  // yaw: lệch mũi so với 2 mắt (quay đầu)
                  const eyeCx = (le.x + re.x) / 2;
                  const yawRaw = (nose.x - eyeCx) * 4;
                  // pitch: lệch khoảng mũi-cằm
                  const pitchRaw = (nose.y - 0.5) * 3;
                  // roll: độ chênh cao 2 mắt
                  const rollRaw = (le.y - re.y) * 2.5;
                  sy += 0.4 * (Math.max(-0.9, Math.min(0.9, yawRaw)) - sy);
                  sp += 0.4 * (Math.max(-0.7, Math.min(0.7, pitchRaw)) - sp);
                  sr += 0.4 * (Math.max(-0.7, Math.min(0.7, rollRaw)) - sr);
                  headPose.yaw = sy; headPose.pitch = sp; headPose.roll = sr;
                  headPose.x = (nose.x - 0.5) * 2;
                  headPose.active = true;
                  headPose.detected = true;
                }
              } else {
                headPose.active = false;
              }
            }

            // ===== HAND =====
            if (hl) {
              const hr = await hl.detectForVideo(video, performance.now());
              if (hr.landmarks?.length > 0) {
                const hand = hr.landmarks[0];
                handState.landmarks = hand.map((p: any) => [p.x, p.y, p.z]);
                handState.active = true;

                // Trung bình khoảng cách đầu ngón tới lòng bàn tay → nắm?
                const palm = hand[9];
                const tips = [hand[8], hand[12], hand[16], hand[20]];
                let grip = 0;
                for (const t of tips) {
                  grip += Math.hypot(t.x - palm.x, t.y - palm.y, t.z - palm.z);
                }
                grip /= 4;
                // grab khi toàn bộ ngón cuc lại gần lòng bàn tay
                const grabNow = grip < 0.16;
                grabFrames += ((grabNow ? 1 : 0) - grabFrames) * 0.4;
                handState.grab = grabFrames > 0.55;
                // release khi năm ngón tay duỗi dài (lòng bàn tay mở)
                let stretch = 0;
                for (const t of [hand[8], hand[12], hand[16], hand[20]]) {
                  stretch += Math.hypot(t.x - palm.x, t.y - palm.y, t.z - palm.z);
                }
                handState.release = stretch > 0.45;

                const thumb = hand[4], index = hand[8];
                const pinchD = Math.hypot(thumb.x - index.x, thumb.y - index.y, thumb.z - index.z);
                handState.pinch = pinchD < 0.055;

                // pointing
                const tip = hand[8], pip = hand[6], mTip = hand[12], mPip = hand[10];
                handState.pointing = tip.y < pip.y && mTip.y > mPip.y;

                // wrist angle (xác định → dùng chênh lệch để xoay vật)
                const wrist0 = hand[0], middle = hand[9];
                const wAngle = Math.atan2(middle.y - wrist0.y, middle.x - wrist0.x);
                let dA = wAngle - handState.wristAngle;
                if (dA > Math.PI) dA -= Math.PI * 2;
                if (dA < -Math.PI) dA += Math.PI * 2;
                handState.rotSpeed = dA;
                handState.wristAngle = wAngle;
                handState.roll = handState.rotSpeed * 3;

                handState.x = 1 - (palm.x - 0.5) * 2; // lật gương
                handState.y = -(palm.y - 0.5) * 2;
              } else {
                handState.active = false;
                handState.grab = false; handState.release = false;
                handState.pinch = false; handState.pointing = false;
                handState.landmarks = null;
              }
            }

            // preview vẽ
            if (canv) {
              const ctx = canv.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0, canv.width, canv.height);
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
      width: isLow ? 150 : 220, height: isLow ? 112 : 165,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(56,224,120,0.35)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      display: preview ? 'block' : 'none',
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
        fontSize: 8, color: '#38e078', fontFamily: 'monospace',
      }}>
        CAM {isLow ? '128×96' : '320×240'} • {handState.grab ? '✊' : handState.pinch ? '🤏' : '✋'}
      </div>
    </div>
  );
}