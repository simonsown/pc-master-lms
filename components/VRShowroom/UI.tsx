'use client';

interface UIProps {
  camEnabled: boolean;
  handEnabled: boolean;
  debugMode: boolean;
  onToggleCam: () => void;
  onToggleHand: () => void;
  onReset: () => void;
  onCenter: () => void;
  onToggleDebug: () => void;
}

const btnBase: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 11,
  fontFamily: 'monospace',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s',
  background: 'rgba(15,23,42,0.75)',
  backdropFilter: 'blur(8px)',
  color: '#cbd5e1',
  whiteSpace: 'nowrap',
};

export default function UI({ camEnabled, handEnabled, debugMode, onToggleCam, onToggleHand, onReset, onCenter, onToggleDebug }: UIProps) {
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998,
      display: 'flex', gap: 8, alignItems: 'center',
      background: 'rgba(15,23,42,0.7)',
      backdropFilter: 'blur(10px)',
      padding: '8px 14px',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      <button style={{
        ...btnBase,
        background: camEnabled ? 'rgba(0,200,100,0.25)' : 'rgba(15,23,42,0.75)',
        borderColor: camEnabled ? 'rgba(0,200,100,0.4)' : 'rgba(255,255,255,0.15)',
      }} onClick={onToggleCam}>
        📷 {camEnabled ? 'ON' : 'OFF'}
      </button>
      <button style={{
        ...btnBase,
        background: handEnabled ? 'rgba(0,200,100,0.25)' : 'rgba(15,23,42,0.75)',
        borderColor: handEnabled ? 'rgba(0,200,100,0.4)' : 'rgba(255,255,255,0.15)',
      }} onClick={onToggleHand}>
        ✋ {handEnabled ? 'ON' : 'OFF'}
      </button>
      <button style={{ ...btnBase, background: 'rgba(15,23,42,0.75)' }} onClick={onReset}>
        ⟲ Reset
      </button>
      <button style={{ ...btnBase, background: 'rgba(15,23,42,0.75)' }} onClick={onCenter}>
        ⊞ Center
      </button>
      <button style={{
        ...btnBase,
        background: debugMode ? 'rgba(200,100,0,0.25)' : 'rgba(15,23,42,0.75)',
        borderColor: debugMode ? 'rgba(200,100,0,0.4)' : 'rgba(255,255,255,0.15)',
      }} onClick={onToggleDebug}>
        🛠 Debug
      </button>
      <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>
        Click vào màn hình để khóa chuột • WASD di chuyển • Shift chạy • Space nhảy
      </div>
    </div>
  );
}
