'use client';

// CameraEngine: BỘ BẮT CHUYỂN ĐỘNG (đầu + tay) cùng 1 camera — MediaPipe
// - ĐẦU: ước lượng yaw/pitch/roll từ hình học mặt (mũi, 2 mắt, cằm) + bộ lọc EMA
// - TAY : 21 landmark, phân loại MỞ / NẮM / CHỤM / CHỈ + xoay cổ tay
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
            width: { ideal: isLow ? 256 : 640 },
            height: { ideal: isLow ? 192 : 480 },
            facingMode: 'user',
            frameRate: { ideal: isLow ? 15 : 30 },
          },
        });
        if (!ok) { s.getTracks().forEach(t => t.stop()); return; }
        const video = vRef.current;
        if (!video) return;
        video.srcObject = s;
        video.setAttribute('playsinline', '');
        await video.play();

        const canv = cRef.current;
        if (canv) { canv.width = 320; canv.height = 240; }

        // bộ lọc EMA mượt
        const head = { yaw: 0, pitch: 0, roll: 0 };
        let grabAcc = 0;
        let lastWrist = 0;
        let rot = 0;
        const SKIP = isLow ? 2 : 1;
        let skip = 0;

        const smooth = (prev: number, t: number, a = 0.4) => prev + (t - prev) * a;

        const loop = async () => {
          if (!ok || !video || video.readyState < 2) { requestAnimationFrame(loop); return; }
          skip++;
          if (skip % SKIP !== 0) { requestAnimationFrame(loop); return; }
          try {
            // ===== FACE =====
            if (fl) {
              const fr = await fl.detectForVideo(video, performance.now());
              if (fr.faceLandmarks?.length > 0) {
                const lm = fr.faceLandmarks[0];
                const nose = lm[1], le = lm[33], re = lm[263], chin = lm[152], fh = lm[10];
                if (nose && le && re && chin && fh) {
                  const eyeCx = (le.x + re.x) / 2;
                  const faceW = Math.hypot(re.x - le.x, re.y - le.y) || 1e-4;
                  // yaw: lệch mũi so với trung điểm mắt, chuẩn hoá theo bề rộng mặt
                  const yawRaw = (nose.x - eyeCx) / faceW * 2.4;
                  // pitch: mũi cao/thấp so với trán-và-cằm
                  const faceMidY = (fh.y + chin.y) / 2;
                  const pitchRaw = (nose.y - faceMidY) / faceW * 2.2;
                  // roll: độ chênh cao 2 mắt
                  const rollRaw = Math.atan2(re.y - le.y, re.x - le.x) * 4.0;

                  head.yaw = smooth(head.yaw, Math.max(-1.2, Math.min(1.2, yawRaw)), 0.5);
                  head.pitch = smooth(head.pitch, Math.max(-1.0, Math.min(1.0, pitchRaw)), 0.5);
                  head.roll = smooth(head.roll, Math.max(-0.8, Math.min(0.8, rollRaw)), 0.5);

                  headPose.yaw = head.yaw;
                  headPose.pitch = head.pitch;
                  headPose.roll = head.roll;
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

                const palm = hand[9];
                const idxTip = hand[8], midTip = hand[12], ringTip = hand[16], pinTip = hand[20];
                const thumb = hand[4];
                // độ co gập: trung bình khoảng cách đầu ngón -> lòng bàn tay
                const reach = [idxTip, midTip, ringTip, pinTip]
                  .reduce((s, t) => s + Math.hypot(t.x - palm.x, t.y - palm.y, t.z - palm.z), 0) / 4;

                // MỞ: ngón duỗi dài; NẮM: ngón cụp gần lòng
                const isOpen = reach > 0.20;
                const isFist = reach < 0.115;

                grabAcc += ((isFist ? 1 : isOpen ? -1 : 0) - grabAcc) * 0.35;
                handState.grab = grabAcc > 0.6;
                handState.release = isOpen;

                // CHỤM ngón cái + trỏ
                const pinchD = Math.hypot(thumb.x - idxTip.x, thumb.y - idxTip.y, thumb.z - idxTip.z);
                handState.pinch = pinchD < 0.05;

                // CHỈ tay (ngón trỏ duỗi, các ngón khác co)
                const mitt = hand[10], ringPip = hand[14], pinPip = hand[18];
                const idxStretch = Math.hypot(idxTip.x - hand[5].x, idxTip.y - hand[5].y, idxTip.z - hand[5].z);
                const othersFold = [mitt, ringPip, pinPip].every(p =>
                  Math.hypot(p.x - palm.x, p.y - palm.y, p.z - palm.z) < 0.09);
                handState.pointing = idxStretch > 0.18 && othersFold;

                // vị trí lòng bàn tay (NDC, lật gương)
                handState.x = 1 - (palm.x - 0.5) * 2;
                handState.y = -(palm.y - 0.5) * 2;

                // xoay cổ tay: góc vector cổ tay -> giữa bàn tay
                const wrist = hand[0];
                const ang = Math.atan2(palm.y - wrist.y, palm.x - wrist.x);
                let dA = ang - lastWrist;
                if (dA > Math.PI) dA -= Math.PI * 2;
                if (dA < -Math.PI) dA += Math.PI * 2;
                if (Math.abs(dA) > 0.5) dA = 0; // nhảy nhảt
                rot = smooth(rot, dA, 0.5);
                lastWrist = ang;
                handState.rotSpeed = rot;
                handState.roll = rot * 2.5;
                handState.wristAngle = ang;
              } else {
                handState.active = false;
                handState.grab = false; handState.release = false;
                handState.pinch = false; handState.pointing = false;
                handState.landmarks = null;
                grabAcc = 0;
              }
            }

            // preview
            if (canv) {
              const ctx = canv.getContext('2d');
              if (ctx) ctx.drawImage(video, 0, 0, canv.width, canv.height);
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
      width: isLow ? 160 : 220, height: isLow ? 120 : 165,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(56,224,120,0.35)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      display: preview ? 'block' : 'none',
      background: '#0f172a',
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
        CAM {isLow ? '256×192' : '640×480'} {handState.grab ? '✊' : handState.pinch ? '🤏' : handState.pointing ? '☝' : '🖐'}
      </div>
    </div>
  );
}