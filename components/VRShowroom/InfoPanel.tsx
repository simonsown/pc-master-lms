'use client';

import { useEffect, useState } from 'react';
import { ITEMS_BY_ID } from './ITEMS';

interface InfoPanelProps {
  itemId: string | null;
  onClose: () => void;
}

export default function InfoPanel({ itemId, onClose }: InfoPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (itemId) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [itemId]);

  if (!itemId) return null;

  const item = ITEMS_BY_ID.get(itemId);
  if (!item) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        padding: '16px 24px',
        maxWidth: 420,
        width: '90%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        color: '#e2e8f0',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: item.color,
          boxShadow: `0 0 8px ${item.color}`,
        }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' }}>
          {item.name}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, paddingLeft: 20 }}>
        {item.desc}
      </div>
      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6, paddingLeft: 20 }}>
        Danh mục: {item.category}
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: 4, marginLeft: 20,
          padding: '4px 14px',
          fontSize: 11,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: '#cbd5e1',
          cursor: 'pointer',
          fontFamily: 'monospace',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
      >
        ✕ Đóng
      </button>
    </div>
  );
}
