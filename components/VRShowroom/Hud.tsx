'use client';

import { useState, useEffect } from 'react';
import { handState, headPose, sceneCtrl } from './tracking-shared';

export default function Hud({ camOn }: { camOn: boolean }) {
  const [, force] = useState(0);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const loop = () => {
      force(v => (v + 1) % 1e9);
      id = setTimeout(loop, 120);
    };
    id = setTimeout(loop, 120);
    return () => clearTimeout(id);
  }, []);

  const h = handState, hp = headPose;

  const camActive = camOn && (h.active || hp.active);

  const statusColor = !camOn
    ? '#f59e0b'
    : sceneCtrl.grabHeld
      ? '#ff4d6d'
      : h.grab
        ? '#ffaa00'
        : h.pinch
          ? '#22c55e'
          : hp.active
            ? '#38e078'
            : '#94a3b8';

  const statusText = !camOn
    ? '⏸ Bật CAMERA để bắt chuyển động'
    : !hp.detected && !h.active
      ? '📷 Đưa mặt & tay vào camera...'
      : sceneCtrl.grabHeld
        ? '✊ ĐANG CẦM MÁY — xoay cổ tay để xoay'
        : h.grab
          ? '✊ Nắm tay — chạm máy để cầm'
          : h.pinch
            ? '🤏 Chụm ngón cái + trỏ'
            : '🖐 Mở lòng bàn tay để bắt';

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: 'rgba(8,12,26,0.85)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14, padding: '12px 16px', minWidth: 240,
      fontFamily: 'monospace', color: '#e2e8f0', fontSize: 12,
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}`, flexShrink: 0 }} />
        <span style={{ color: statusColor, fontWeight: 700 }}>{statusText}</span>
      </div>

      {/* Trong camera: vị trí đầu */}
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
        🧠 Đầu: Yaw <b style={{ color: '#f1f5f9' }}>{hp.yaw.toFixed(2)}</b> • Pitch <b style={{ color: '#f1f5f9' }}>{hp.pitch.toFixed(2)}</b>
        {hp.active ? ' (đang nhận)' : ' (chờ)'}
      </div>

      {/* Viền giữa máy trên camera */}
      <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.6 }}>
        👁 Quay ĐẦU → xoay hướng nhìn như VR<br />
        ✊ NẮM tay khi tay gần máy → CẦM máy<br />
        🔄 XOAY cổ tay (cuộn tay) → quay máy<br />
        🖐 MỞ tay → THẢ máy
      </div>
    </div>
  );
}