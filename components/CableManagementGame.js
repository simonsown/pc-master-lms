'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const LANG = {
  vn: {
    title: 'Quản lý Cáp',
    subtitle: 'Kéo cáp vào đúng cổng trên bo mạch chủ',
    timer: 'Thời gian',
    score: 'Điểm',
    mistakes: 'Lỗi',
    level: 'Cấp độ',
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
    exit: 'Thoát',
    cablesLeft: 'Cáp còn lại',
    connected: 'Đã kết nối',
    wrongCable: 'Sai cổng! Hãy thử lại.',
    dropHere: 'Thả vào cổng tương thích',
    congrats: 'Chúc mừng!',
    completed: 'Đã hoàn thành',
    yourTime: 'Thời gian',
    yourScore: 'Điểm số',
    yourMistakes: 'Số lỗi',
    stars: 'Sao',
    retry: 'Chơi lại',
    perfect: 'Hoàn hảo - Không lỗi nào!',
    goodJob: 'Tốt - Chỉ {n} lỗi',
    completedText: 'Đã hoàn thành',
    selectLevel: 'Chọn cấp độ để bắt đầu',
    start: 'Bắt đầu',
    atx24: '24-pin ATX',
    cpu8: '8-pin CPU',
    pcie: 'PCIe GPU',
    sata: 'SATA',
    frontpanel: 'Front Panel',
    usb: 'USB Header',
    fan: 'Fan Cable',
  },
  en: {
    title: 'Cable Management',
    subtitle: 'Drag cables to correct ports on the motherboard',
    timer: 'Time',
    score: 'Score',
    mistakes: 'Mistakes',
    level: 'Level',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    exit: 'Exit',
    cablesLeft: 'Cables left',
    connected: 'Connected',
    wrongCable: 'Wrong port! Try again.',
    dropHere: 'Drop onto a compatible port',
    congrats: 'Congratulations!',
    completed: 'Completed',
    yourTime: 'Time',
    yourScore: 'Score',
    yourMistakes: 'Mistakes',
    stars: 'Stars',
    retry: 'Retry',
    perfect: 'Perfect - No mistakes!',
    goodJob: 'Good - Only {n} mistakes',
    completedText: 'Completed',
    selectLevel: 'Select a level to start',
    start: 'Start',
    atx24: '24-pin ATX',
    cpu8: '8-pin CPU',
    pcie: 'PCIe GPU',
    sata: 'SATA',
    frontpanel: 'Front Panel',
    usb: 'USB Header',
    fan: 'Fan Cable',
  },
};

const CABLES = [
  { id: 'atx24', labelKey: 'atx24', color: '#FFD700', level: 'easy', portLabel: 'ATX_24V' },
  { id: 'cpu8', labelKey: 'cpu8', color: '#FF4757', level: 'easy', portLabel: 'CPU_PWR' },
  { id: 'pcie', labelKey: 'pcie', color: '#3742FA', level: 'easy', portLabel: 'PCIe_x16' },
  { id: 'sata', labelKey: 'sata', color: '#FF6348', level: 'medium', portLabel: 'SATA' },
  { id: 'frontpanel', labelKey: 'frontpanel', color: '#A29BFE', level: 'medium', portLabel: 'F_PANEL' },
  { id: 'usb', labelKey: 'usb', color: '#00CEC9', level: 'hard', portLabel: 'USB_HD' },
  { id: 'fan', labelKey: 'fan', color: '#55E6C1', level: 'hard', portLabel: 'FAN' },
];

const PORT_POSITIONS = {
  atx24: { top: '46%', left: '74%', w: 72, h: 34 },
  cpu8: { top: '5%', left: '4%', w: 68, h: 30 },
  pcie: { top: '40%', left: '3%', w: 68, h: 30 },
  sata: { top: '78%', left: '62%', w: 62, h: 28 },
  frontpanel: { top: '78%', left: '32%', w: 66, h: 28 },
  usb: { top: '78%', left: '2%', w: 62, h: 28 },
  fan: { top: '5%', left: '60%', w: 62, h: 28 },
};

const LEVEL_CONFIG = {
  easy: { cables: ['atx24', 'cpu8', 'pcie'], labelKey: 'easy' },
  medium: { cables: ['atx24', 'cpu8', 'pcie', 'sata', 'frontpanel'], labelKey: 'medium' },
  hard: { cables: ['atx24', 'cpu8', 'pcie', 'sata', 'frontpanel', 'usb', 'fan'], labelKey: 'hard' },
};

const SNAP_DISTANCE = 50;

function StarRating({ stars, size }) {
  const s = size || 28;
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          style={{
            fontSize: s,
            color: i <= stars ? '#FFD700' : 'rgba(255,255,255,0.2)',
            textShadow: i <= stars ? '0 0 12px rgba(255,215,0,0.6)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function MotherboardDiagram({ connectedCables, hoveredPort, cables, connectionLines }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        background: '#1a3a1a',
        borderRadius: 12,
        border: '2px solid #2a5a2a',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,170,0.08)',
        overflow: 'hidden',
        padding: '12px',
      }}
    >
      <div style={{
        position: 'absolute', inset: 4,
        background: 'rgba(0,0,0,0.15)',
        borderRadius: 8,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
      }} />

      {/* CPU Socket */}
      <div style={{
        position: 'absolute',
        top: '12%', left: '28%',
        width: '26%', height: '28%',
        background: '#0d0d0d',
        border: '2px solid #3a3a3a',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
      }}>
        <div style={{
          width: '60%', height: '60%',
          background: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '40%', height: '40%',
            background: 'linear-gradient(135deg, #2a2a2a, #444)',
            borderRadius: 2,
          }} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 600, letterSpacing: '0.5px' }}>
          CPU
        </span>
      </div>

      {/* RAM Slots */}
      {[0, 1, 2, 3].map(i => (
        <div key={`ram-${i}`} style={{
          position: 'absolute',
          top: `${13 + i * 7}%`,
          left: '58%',
          width: '8%', height: '5.5%',
          background: i % 2 === 0 ? '#1a2a3a' : '#152535',
          border: '1px solid #2a4a6a',
          borderRadius: 2,
        }} />
      ))}
      <span style={{
        position: 'absolute', top: '5%', left: '58%',
        color: 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 600,
        letterSpacing: '0.5px',
      }}>DIMM</span>

      {/* Chipset */}
      <div style={{
        position: 'absolute',
        top: '52%', left: '30%',
        width: '16%', height: '12%',
        background: '#0d0d0d',
        border: '1px solid #3a3a3a',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, fontWeight: 600 }}>Z790</span>
      </div>

      {/* PCIe Slots */}
      {[0, 1, 2].map(i => (
        <div key={`pcie-${i}`} style={{
          position: 'absolute',
          top: `${48 + i * 10}%`,
          left: '4%',
          width: '30%', height: '4%',
          background: i === 0 ? '#1a2a2a' : '#111',
          border: `1px solid ${i === 0 ? '#3a5a3a' : '#2a2a2a'}`,
          borderRadius: 2,
        }} />
      ))}

      {/* PSU Area indicator */}
      <div style={{
        position: 'absolute', bottom: '8%', right: '8%',
        width: '20%', height: '10%',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 7 }}>PSU</span>
      </div>

      {/* Ports */}
      {cables.map(cable => {
        const pos = PORT_POSITIONS[cable.id];
        const isConnected = connectedCables.includes(cable.id);
        const isHovered = hoveredPort === cable.id;
        return (
          <div
            key={cable.id}
            id={`port-${cable.id}`}
            data-port-id={cable.id}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              width: pos.w,
              height: pos.h,
              background: isConnected
                ? `linear-gradient(135deg, ${cable.color}44, ${cable.color}22)`
                : isHovered
                  ? `linear-gradient(135deg, ${cable.color}66, ${cable.color}33)`
                  : 'rgba(255,255,255,0.04)',
              border: `2px solid ${isConnected
                ? cable.color
                : isHovered
                  ? cable.color + '88'
                  : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isConnected
                ? `0 0 16px ${cable.color}66, inset 0 0 12px ${cable.color}33`
                : isHovered
                  ? `0 0 12px ${cable.color}44`
                  : 'none',
              pointerEvents: 'auto',
              zIndex: isConnected ? 5 : 2,
              animation: isConnected ? 'cmg-glow-pulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {isConnected ? (
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: cable.color,
                boxShadow: `0 0 10px ${cable.color}`,
              }} />
            ) : (
              <div style={{
                width: 8, height: 8,
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '50%',
              }} />
            )}
            <span style={{
              color: isConnected ? cable.color : 'rgba(255,255,255,0.4)',
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: '0.3px',
              marginTop: 1,
              textShadow: isConnected ? `0 0 8px ${cable.color}88` : 'none',
            }}>
              {cable.portLabel}
            </span>
          </div>
        );
      })}

      {/* Connection indicators - colored dots at port for connected cables */}
      {connectedCables.length > 0 && connectionLines.map(line => {
        const cable = CABLES.find(c => c.id === line.cableId);
        if (!cable) return null;
        const pos = PORT_POSITIONS[line.cableId];
        return (
          <div
            key={line.cableId}
            style={{
              position: 'absolute',
              left: `calc(${pos.left} + ${pos.w / 2 - 3}px)`,
              bottom: '4%',
              width: 6, height: '4%',
              background: `linear-gradient(to top, ${cable.color}, transparent)`,
              borderRadius: '0 0 3px 3px',
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 3,
              animation: 'cmg-line-appear 0.4s ease-out',
            }}
          />
        );
      })}

      {/* Labels */}
      <div style={{
        position: 'absolute', top: '2%', left: '2%',
        color: 'rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 800,
        letterSpacing: '1px', fontFamily: 'monospace',
      }}>
        PCB-24ATX v1.0
      </div>
    </div>
  );
}

function CableItem({ cable, isConnected, isDragging, onMouseDown, lang }) {
  const t = LANG[lang];
  return (
    <div
      onMouseDown={(e) => { if (!isConnected) onMouseDown(cable.id, e); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 8,
        background: isConnected
          ? 'rgba(0,255,0,0.08)'
          : isDragging
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.06)',
        border: `2px solid ${isConnected
          ? '#00d4aa'
          : isDragging
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.1)'}`,
        cursor: isConnected ? 'default' : 'grab',
        opacity: isConnected ? 0.7 : isDragging ? 0.4 : 1,
        transition: 'all 0.2s',
        userSelect: 'none',
        minWidth: 0,
        flexShrink: 0,
      }}
      onMouseOver={e => {
        if (!isConnected && !isDragging) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }
      }}
      onMouseOut={e => {
        if (!isConnected && !isDragging) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      }}
    >
      <div style={{
        width: 14, height: 14,
        borderRadius: '50%',
        background: cable.color,
        boxShadow: `0 0 8px ${cable.color}66`,
        flexShrink: 0,
      }} />
      <span style={{
        color: isConnected ? '#00d4aa' : 'var(--text-primary, #dde0ed)',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {cable.labelKey ? t[cable.labelKey] : cable.id}
      </span>
      {isConnected && (
        <span style={{ color: '#00d4aa', fontSize: 12, marginLeft: 'auto' }}>✓</span>
      )}
    </div>
  );
}

export default function CableManagementGame({ lang = 'vn', onComplete, onExit }) {
  const t = LANG[lang];
  const gameRef = useRef(null);
  const [level, setLevel] = useState(null);
  const [started, setStarted] = useState(false);
  const [connectedCables, setConnectedCables] = useState([]);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(0);

  const [dragState, setDragState] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCableId, setErrorCableId] = useState(null);
  const [flashCableId, setFlashCableId] = useState(null);
  const [hoveredPort, setHoveredPort] = useState(null);
  const [connectionLines, setConnectionLines] = useState([]);

  const dragPosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [, forceRender] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const shakeTimeoutRef = useRef(null);
  const flashTimeoutRef = useRef(null);

  const activeCables = level ? CABLES.filter(c => LEVEL_CONFIG[level].cables.includes(c.id)) : [];
  const availableCables = activeCables.filter(c => !connectedCables.includes(c.id));

  useEffect(() => {
    if (!document.getElementById('cmg-styles')) {
      const style = document.createElement('style');
      style.id = 'cmg-styles';
      style.textContent = `
        @keyframes cmg-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes cmg-flash {
          0% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.6); }
          50% { box-shadow: 0 0 30px 10px rgba(0, 212, 170, 0.3); }
          100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0); }
        }
        @keyframes cmg-glow-pulse {
          0%, 100% { box-shadow: 0 0 16px var(--c, #00d4aa)66, inset 0 0 12px var(--c, #00d4aa)33; }
          50% { box-shadow: 0 0 24px var(--c, #00d4aa)88, inset 0 0 16px var(--c, #00d4aa)44; }
        }
        @keyframes cmg-line-appear {
          from { stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 0.7; }
        }
        @keyframes cmg-fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes cmg-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (started && !isComplete) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [started, isComplete]);

  useEffect(() => {
    const total = LEVEL_CONFIG[level]?.cables.length || 0;
    if (started && total > 0 && connectedCables.length === total) {
      clearInterval(timerRef.current);
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(finalTime);

      const baseScore = 1000;
      const timeBonus = Math.max(0, 500 - finalTime * 5);
      const accuracyPenalty = errors * 100;
      const finalScore = Math.max(0, baseScore + timeBonus - accuracyPenalty);
      setScore(finalScore);

      let finalStars = 1;
      if (errors === 0) finalStars = 3;
      else if (errors <= 2) finalStars = 2;
      setStars(finalStars);

      setIsComplete(true);

      if (onComplete) {
        onComplete({
          score: finalScore,
          timeSeconds: finalTime,
          errors,
          level,
          stars: finalStars,
        });
      }
    }
  }, [connectedCables, level, started, errors, onComplete]);

  const handleStartLevel = useCallback((lvl) => {
    setLevel(lvl);
    setStarted(true);
    setConnectedCables([]);
    setErrors(0);
    setTime(0);
    setScore(0);
    setIsComplete(false);
    setDragState(null);
    setErrorMsg('');
    setErrorCableId(null);
    setFlashCableId(null);
    setHoveredPort(null);
    setConnectionLines([]);
    setStars(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleCableMouseDown = useCallback((cableId, e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    dragPosRef.current = { x: e.clientX, y: e.clientY };
    setDragState({ cableId });
    setErrorMsg('');
    setErrorCableId(null);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragState) return;
    dragPosRef.current = { x: e.clientX, y: e.clientY };
    forceRender(n => n + 1);

    if (gameRef.current) {
      const gameRect = gameRef.current.getBoundingClientRect();
      const mouseX = e.clientX - gameRect.left;
      const mouseY = e.clientY - gameRect.top;

      const cableCfg = CABLES.find(c => c.id === dragState.cableId);
      if (cableCfg) {
        const pos = PORT_POSITIONS[cableCfg.id];
        const portEl = document.querySelector(`[data-port-id="${cableCfg.id}"]`);
        if (portEl) {
          const portRect = portEl.getBoundingClientRect();
          const portCX = portRect.left + portRect.width / 2;
          const portCY = portRect.top + portRect.height / 2;
          const dist = Math.sqrt(
            Math.pow(e.clientX - portCX, 2) + Math.pow(e.clientY - portCY, 2)
          );
          setHoveredPort(dist < 60 ? cableCfg.id : null);
        }
      }
    }
  }, [dragState]);

  const handleMouseUp = useCallback((e) => {
    if (!dragState) return;
    const cableId = dragState.cableId;
    setDragState(null);
    setHoveredPort(null);

    if (connectedCables.includes(cableId)) return;

    const cableCfg = CABLES.find(c => c.id === cableId);
    if (!cableCfg) return;

    if (gameRef.current) {
      const gameRect = gameRef.current.getBoundingClientRect();
      const pos = PORT_POSITIONS[cableId];
      const portEl = document.querySelector(`[data-port-id="${cableId}"]`);
      if (portEl) {
        const portRect = portEl.getBoundingClientRect();
        const portCX = portRect.left + portRect.width / 2;
        const portCY = portRect.top + portRect.height / 2;
        const dist = Math.sqrt(
          Math.pow(e.clientX - portCX, 2) + Math.pow(e.clientY - portCY, 2)
        );

        if (dist <= SNAP_DISTANCE) {
          setConnectedCables(prev => [...prev, cableId]);
          setConnectionLines(prev => [...prev, { cableId }]);
          setFlashCableId(cableId);
          if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
          flashTimeoutRef.current = setTimeout(() => setFlashCableId(null), 600);
          return;
        }
      }
    }

    setErrors(prev => prev + 1);
    setErrorCableId(cableId);
    setErrorMsg(t.wrongCable);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => {
      setErrorCableId(null);
      setErrorMsg('');
    }, 800);
  }, [dragState, connectedCables, t.wrongCable]);

  useEffect(() => {
    if (!dragState) return;
    const onMove = (e) => handleMouseMove(e);
    const onUp = (e) => handleMouseUp(e);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [dragState, handleMouseMove, handleMouseUp]);

  const retry = useCallback(() => {
    if (level) handleStartLevel(level);
  }, [level, handleStartLevel]);

  if (!started) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg-base, #0d0e13)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'var(--bg-surface, #0f0f1a)',
          borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.08))',
        }}>
          <h2 style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 18, fontWeight: 700, margin: 0 }}>
            ⚡ {t.title}
          </h2>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted, #636678)', padding: '6px 16px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
            }}
            type="button"
          >
            {t.exit} ✕
          </button>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 32,
          padding: 40,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔌</div>
            <h1 style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 28, fontWeight: 800, margin: 0 }}>
              {t.title}
            </h1>
            <p style={{ color: 'var(--text-muted, #636678)', fontSize: 14, marginTop: 8, maxWidth: 400 }}>
              {t.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['easy', 'medium', 'hard'].map(lvl => (
              <button
                key={lvl}
                onClick={() => handleStartLevel(lvl)}
                style={{
                  padding: '20px 32px',
                  borderRadius: 12,
                  background: 'var(--bg-surface, #0f0f1a)',
                  border: '1px solid var(--border-default, rgba(255,255,255,0.08))',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: 160,
                  transition: 'all 0.25s',
                  fontFamily: 'inherit',
                  color: 'var(--text-primary, #dde0ed)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary, #00d4aa)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,170,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default, rgba(255,255,255,0.08))';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                type="button"
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>
                  {lvl === 'easy' ? '🟢' : lvl === 'medium' ? '🟡' : '🔴'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {t[lvl]}
                </div>
                <div style={{ color: 'var(--text-muted, #636678)', fontSize: 12 }}>
                  {LEVEL_CONFIG[lvl].cables.length} {t.cablesLeft.toLowerCase()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dragCable = dragState ? CABLES.find(c => c.id === dragState.cableId) : null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-base, #0d0e13)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
        userSelect: 'none',
      }}
      ref={gameRef}
    >
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'var(--bg-surface, #0f0f1a)',
        borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.08))',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 16, fontWeight: 700 }}>
            {t.title}
          </span>
          <span style={{
            background: 'var(--brand-subtle, rgba(0,212,170,0.12))',
            color: 'var(--brand-primary, #00d4aa)',
            padding: '2px 10px', borderRadius: 99,
            fontSize: 11, fontWeight: 700,
          }}>
            {t[level]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>
              {t.timer}
            </div>
            <div style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>
              {String(Math.floor(time / 60)).padStart(2, '0')}:{String(time % 60).padStart(2, '0')}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>
              {t.score}
            </div>
            <div style={{ color: 'var(--brand-primary, #00d4aa)', fontSize: 18, fontWeight: 700 }}>
              {score || 0}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>
              {t.mistakes}
            </div>
            <div style={{ color: errors > 0 ? 'var(--danger, #e84855)' : 'var(--text-muted, #636678)', fontSize: 18, fontWeight: 700 }}>
              {errors}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>
              {t.cablesLeft}
            </div>
            <div style={{ color: 'var(--accent-blue, #4a90e2)', fontSize: 18, fontWeight: 700 }}>
              {availableCables.length}/{activeCables.length}
            </div>
          </div>

          <button
            onClick={onExit}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted, #636678)', padding: '6px 16px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
            }}
            type="button"
          >
            {t.exit} ✕
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px 24px',
        overflow: 'auto',
        position: 'relative',
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Motherboard */}
        <MotherboardDiagram
          connectedCables={connectedCables}
          hoveredPort={hoveredPort}
          cables={activeCables}
          connectionLines={connectionLines}
        />

        {/* Error message */}
        {errorMsg && (
          <div style={{
            textAlign: 'center',
            color: 'var(--danger, #e84855)',
            fontSize: 13,
            fontWeight: 600,
            padding: '6px 16px',
            background: 'rgba(232,72,85,0.1)',
            borderRadius: 8,
            animation: 'cmg-shake 0.4s ease-in-out',
            border: '1px solid rgba(232,72,85,0.2)',
          }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* Cable Tray */}
        <div style={{
          background: 'var(--bg-surface, #0f0f1a)',
          border: '1px solid var(--border-default, rgba(255,255,255,0.08))',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12,
          }}>
            <span style={{ color: 'var(--text-muted, #636678)', fontSize: 11, fontWeight: 600 }}>
              📦 {t.cablesLeft} ({availableCables.length})
            </span>
            {isComplete && (
              <button
                onClick={retry}
                style={{
                  background: 'var(--brand-subtle, rgba(0,212,170,0.12))',
                  border: '1px solid rgba(0,212,170,0.2)',
                  color: 'var(--brand-primary, #00d4aa)',
                  padding: '4px 14px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                }}
                type="button"
              >
                🔄 {t.retry}
              </button>
            )}
          </div>
          <div style={{
            display: 'flex', gap: 10,
            flexWrap: 'wrap',
          }}>
            {activeCables.map(cable => {
              const isConnected = connectedCables.includes(cable.id);
              const isDragging = dragState?.cableId === cable.id;
              const isShaking = errorCableId === cable.id;
              const isFlashing = flashCableId === cable.id;
              return (
                <div
                  key={cable.id}
                  style={{
                    animation: isShaking
                      ? 'cmg-shake 0.4s ease-in-out'
                      : isFlashing
                        ? 'cmg-flash 0.5s ease-out'
                        : 'none',
                    display: 'flex',
                  }}
                >
                  <CableItem
                    cable={cable}
                    isConnected={isConnected}
                    isDragging={isDragging}
                    onMouseDown={handleCableMouseDown}
                    lang={lang}
                  />
                </div>
              );
            })}
            {availableCables.length === 0 && !isComplete && (
              <div style={{
                color: 'var(--brand-primary, #00d4aa)',
                fontSize: 13, fontWeight: 600, padding: 8,
                animation: 'cmg-fade-in 0.3s',
              }}>
                ✅ {t.connected}
              </div>
            )}
          </div>
        </div>

        {/* Drop hint */}
        {dragState && (
          <div style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            padding: '8px 20px', borderRadius: 99,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12, fontWeight: 600,
            zIndex: 100,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {t.dropHere}
          </div>
        )}
      </div>

      {/* Drag ghost */}
      {dragCable && (
        <div
          style={{
            position: 'fixed',
            left: dragPosRef.current.x - dragOffsetRef.current.x,
            top: dragPosRef.current.y - dragOffsetRef.current.y,
            zIndex: 10000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 8,
            background: `linear-gradient(135deg, ${dragCable.color}33, ${dragCable.color}11)`,
            border: `2px solid ${dragCable.color}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${dragCable.color}44`,
            opacity: 0.9,
          }}
        >
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: dragCable.color,
            boxShadow: `0 0 10px ${dragCable.color}`,
          }} />
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {dragCable.labelKey ? t[dragCable.labelKey] : dragCable.id}
          </span>
        </div>
      )}

      {/* Completion Overlay */}
      {isComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'cmg-fade-in 0.3s',
        }}>
          <div style={{
            background: 'var(--bg-surface, #0f0f1a)',
            border: '1px solid var(--border-default, rgba(255,255,255,0.08))',
            borderRadius: 16,
            padding: '40px',
            textAlign: 'center',
            maxWidth: 420,
            width: '90%',
            animation: 'cmg-slide-up 0.4s ease-out',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <h2 style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>
              {t.congrats}
            </h2>
            <p style={{ color: 'var(--text-muted, #636678)', fontSize: 14, margin: '0 0 20px' }}>
              {t.completed} - {t[level]}
            </p>

            <StarRating stars={stars} size={36} />

            <div style={{
              color: stars === 3
                ? 'var(--brand-primary, #00d4aa)'
                : stars === 2
                  ? 'var(--accent-amber, #f59e0b)'
                  : 'var(--accent-blue, #4a90e2)',
              fontSize: 13, fontWeight: 600, margin: '12px 0 20px',
            }}>
              {stars === 3 ? t.perfect : stars === 2 ? t.goodJob.replace('{n}', errors) : t.completedText}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8, padding: '12px 8px',
              }}>
                <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>{t.yourTime}</div>
                <div style={{ color: 'var(--text-primary, #dde0ed)', fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>
                  {String(Math.floor(time / 60)).padStart(2, '0')}:{String(time % 60).padStart(2, '0')}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8, padding: '12px 8px',
              }}>
                <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>{t.yourScore}</div>
                <div style={{ color: 'var(--brand-primary, #00d4aa)', fontSize: 20, fontWeight: 700 }}>{score}</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8, padding: '12px 8px',
              }}>
                <div style={{ color: 'var(--text-muted, #636678)', fontSize: 10, fontWeight: 600 }}>{t.yourMistakes}</div>
                <div style={{
                  color: errors > 0 ? 'var(--danger, #e84855)' : 'var(--brand-primary, #00d4aa)',
                  fontSize: 20, fontWeight: 700,
                }}>
                  {errors}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={retry}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  background: 'var(--brand-subtle, rgba(0,212,170,0.12))',
                  border: '1px solid var(--brand-primary, #00d4aa)',
                  color: 'var(--brand-primary, #00d4aa)',
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.12)'; }}
                type="button"
              >
                🔄 {t.retry}
              </button>
              <button
                onClick={onExit}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted, #636678)',
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                type="button"
              >
                {t.exit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
