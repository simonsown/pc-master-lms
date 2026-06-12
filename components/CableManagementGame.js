'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const LANG = {
  vn: {
    title: 'Lắp ráp PC', timer: 'Thời gian', score: 'Điểm', mistakes: 'Lỗi',
    level: 'Cấp độ', easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', exit: 'Thoát',
    cablesLeft: 'Còn', connected: 'Xong', wrongCable: 'Sai cổng!',
    congrats: 'Chúc mừng!', completed: 'Hoàn thành',
    yourTime: 'Thời gian', yourScore: 'Điểm', yourMistakes: 'Lỗi', stars: 'Sao',
    retry: 'Chơi lại', perfect: 'Hoàn hảo!',
    goodJob: 'Tốt! {n} lỗi', hint: 'Kéo cáp từ khay → thả vào cổng',
  },
  en: {
    title: 'PC Assembly', timer: 'Time', score: 'Score', mistakes: 'Mistakes',
    level: 'Level', easy: 'Easy', medium: 'Medium', hard: 'Hard', exit: 'Exit',
    cablesLeft: 'Left', connected: 'Done', wrongCable: 'Wrong port!',
    congrats: 'Congratulations!', completed: 'Completed',
    yourTime: 'Time', yourScore: 'Score', yourMistakes: 'Mistakes', stars: 'Stars',
    retry: 'Retry', perfect: 'Perfect!', goodJob: 'Good! {n} mistakes', hint: 'Drag cable from tray → drop on port',
  },
};

const CABLES = [
  {
    id: 'atx24', label: 'ATX 24-pin', portLabel: 'ATX24', correctPort: 'atx24_p',
    pins: 24, rows: 2, cols: 12, pinW: 1.8, pinH: 2.8, gap: 0.8,
    bodyW: 32, bodyH: 12, bodyR: 1.5, color: '#3d3d3d', accent: '#d4a030',
    wireColor: '#5a5a5a', hasClip: true,
    tooltip: 'Nguồn chính cho mainboard', diff: 1,
    entry: { x: 92, y: 50 }, cp1: { x: 15, y: -25 }, cp2: { x: -15, y: -15 },
  },
  {
    id: 'cpu8', label: 'CPU 8-pin EPS', portLabel: 'CPU_PWR', correctPort: 'cpu_pwr',
    pins: 8, rows: 2, cols: 4, pinW: 2, pinH: 3, gap: 1,
    bodyW: 16, bodyH: 14, bodyR: 1.2, color: '#333', accent: '#ccc',
    wireColor: '#4a4a4a', split: 4,
    tooltip: 'Nguồn cho CPU', diff: 1,
    entry: { x: 10, y: -2 }, cp1: { x: -5, y: 10 }, cp2: { x: 0, y: 10 },
  },
  {
    id: 'pcie', label: 'PCIe 6+2', portLabel: 'GPU_PWR', correctPort: 'gpu_pwr',
    pins: 8, rows: 2, cols: [6, 2], pinW: 1.8, pinH: 2.8, gap: 0.8,
    bodyW: [26, 12], bodyH: 12, bodyR: 1.2, color: '#2a2525', accent: '#cc4444',
    wireColor: '#4a3a3a',
    tooltip: 'Nguồn cho card đồ họa', diff: 1,
    entry: { x: 50, y: 104 }, cp1: { x: 8, y: -18 }, cp2: { x: -5, y: -10 },
  },
  {
    id: 'sata_data', label: 'SATA Data', portLabel: 'SATA_D', correctPort: 'sata_d',
    pins: 7, rows: 1, cols: 7, pinW: 1.5, pinH: 2, gap: 0.6,
    bodyW: 20, bodyH: 6, bodyR: 0.5, color: '#222', accent: '#888',
    wireColor: '#3a3a3a',
    tooltip: 'Dữ liệu ổ cứng / SSD', diff: 1,
    entry: { x: 75, y: 104 }, cp1: { x: 5, y: -20 }, cp2: { x: -5, y: -10 },
  },
  {
    id: 'sata_power', label: 'SATA Power', portLabel: 'SATA_P', correctPort: 'sata_p',
    pins: 15, rows: 3, cols: 5, pinW: 1.2, pinH: 2, gap: 0.5,
    bodyW: 22, bodyH: 10, bodyR: 0.5, color: '#1a1a1a', accent: '#cc8800',
    wireColor: '#3a3a2a',
    tooltip: 'Nguồn cho ổ cứng / SSD', diff: 2,
    entry: { x: 80, y: 104 }, cp1: { x: 3, y: -18 }, cp2: { x: -3, y: -8 },
  },
  {
    id: 'frontpanel', label: 'Front Panel', portLabel: 'F_PANEL', correctPort: 'fp',
    pins: 9, rows: 2, cols: [5, 4], pinW: 1.2, pinH: 1.8, gap: 0.6,
    bodyW: 14, bodyH: 10, bodyR: 0.8, color: '#2a2a3a', accent: '#9a8acc',
    wireColor: '#3a3a4a', multiWire: true,
    tooltip: 'Nút nguồn, LED từ case', diff: 1,
    entry: { x: 35, y: 104 }, cp1: { x: 2, y: -20 }, cp2: { x: -2, y: -8 },
  },
  {
    id: 'usb3', label: 'USB 3.0', portLabel: 'USB3', correctPort: 'usb3_h',
    pins: 19, rows: 2, cols: 10, pinW: 1.2, pinH: 2, gap: 0.5,
    bodyW: 22, bodyH: 10, bodyR: 1, color: '#1a2a4a', accent: '#4a8acc',
    wireColor: '#2a3a5a',
    tooltip: 'Cổng USB mặt trước', diff: 2,
    entry: { x: 5, y: 104 }, cp1: { x: 5, y: -20 }, cp2: { x: 0, y: -12 },
  },
  {
    id: 'hd_audio', label: 'HD Audio', portLabel: 'HD_AUDIO', correctPort: 'hd_au',
    pins: 9, rows: 2, cols: 5, pinW: 1.2, pinH: 2, gap: 0.6,
    bodyW: 14, bodyH: 10, bodyR: 0.8, color: '#1a1a1a', accent: '#66bb77',
    wireColor: '#2a2a2a',
    tooltip: 'Âm thanh HD từ case', diff: 3,
    entry: { x: 60, y: -2 }, cp1: { x: -5, y: 10 }, cp2: { x: -3, y: 8 },
  },
];

const PORT_POS = {
  atx24_p: { t: 43, l: 70, w: 18, h: 8 },
  cpu_pwr: { t: 3, l: 4, w: 15, h: 7 },
  gpu_pwr: { t: 52, l: 4, w: 11, h: 6 },
  sata_d: { t: 75, l: 60, w: 12, h: 5 },
  sata_p: { t: 78, l: 60, w: 14, h: 5 },
  fp: { t: 76, l: 28, w: 15, h: 6 },
  usb3_h: { t: 75, l: 2, w: 14, h: 6 },
  hd_au: { t: 3, l: 66, w: 10, h: 5 },
};

const LEVEL_CONF = {
  easy: { cables: ['atx24', 'cpu8', 'pcie', 'sata_data', 'frontpanel'], showNames: true, showTooltip: true },
  medium: { cables: ['atx24', 'cpu8', 'pcie', 'sata_data', 'sata_power', 'frontpanel', 'usb3'], showNames: false, showTooltip: true },
  hard: { cables: ['atx24', 'cpu8', 'pcie', 'sata_data', 'sata_power', 'frontpanel', 'usb3', 'hd_audio'], showNames: false, showTooltip: false },
};

function PSUArea() {
  return (
    <svg style={{ position: 'absolute', right: '0%', top: '55%', width: '18%', height: '18%', zIndex: 1 }} viewBox="0 0 40 40">
      <rect x={2} y={2} width={36} height={36} rx={3} fill="#111" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      <text x={20} y={20} fill="rgba(255,255,255,0.06)" fontSize={5} textAnchor="middle" fontFamily="monospace" fontWeight={700}>PSU</text>
      <text x={20} y={28} fill="rgba(255,255,255,0.04)" fontSize={3} textAnchor="middle">RM750x</text>
      <rect x={10} y={4} width={6} height={2} rx={0.5} fill="#222" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      <rect x={24} y={4} width={6} height={2} rx={0.5} fill="#222" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      <rect x={30} y={24} width={8} height={10} rx={1} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)" strokeWidth={0.3} />
      <circle cx={34} cy={29} r={2} fill="rgba(255,255,255,0.03)" />
    </svg>
  );
}

function GPUCard() {
  return (
    <svg style={{ position: 'absolute', bottom: '20%', left: '2%', width: '36%', height: 'auto', zIndex: 2 }} viewBox="0 0 120 28">
      <defs>
        <linearGradient id="gpc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
      <rect x={0} y={3} width={120} height={22} rx={2.5} fill="url(#gpc)" stroke="rgba(255,255,255,0.04)" strokeWidth={0.4} />
      <rect x={0} y={3} width={120} height={3} rx={0.5} fill="rgba(255,255,255,0.015)" />
      <text x={60} y={17} fill="rgba(255,255,255,0.08)" fontSize={4.5} textAnchor="middle" fontFamily="monospace" fontWeight={700}>RTX 4060 GIGABYTE</text>
      <rect x={42} y={12} width={32} height={11} rx={1.5} fill="#151515" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      <circle cx={50} cy={17} r={3} fill="rgba(255,255,255,0.03)" />
      <circle cx={58} cy={17} r={4.5} fill="rgba(255,255,255,0.03)" />
      <circle cx={66} cy={17} r={3} fill="rgba(255,255,255,0.03)" />
      <rect x={12} y={16} width={14} height={6} rx={0.8} fill="#2a2020" stroke="#cc4444" strokeWidth={0.6} />
      <text x={19} y={20.5} fill="#cc4444" fontSize={2.5} textAnchor="middle" fontWeight={700}>6+2</text>
      <rect x={104} y={16} width={12} height={6} rx={0.4} fill="#111" stroke="rgba(255,255,255,0.04)" strokeWidth={0.2} />
      <text x={110} y={20} fill="rgba(255,255,255,0.05)" fontSize={2} textAnchor="middle">PCIe</text>
      <rect x={0} y={14} width={6} height={10} rx={0.5} fill="#181818" stroke="rgba(255,255,255,0.03)" strokeWidth={0.2} />
    </svg>
  );
}

function ConnectorSVG({ cfg, size = 1, showPins = true }) {
  const s = size;
  const bodyW = (Array.isArray(cfg.bodyW) ? cfg.bodyW[0] : cfg.bodyW) * s;
  const bodyH = cfg.bodyH * s;
  const pinW = cfg.pinW * s;
  const pinH = cfg.pinH * s;
  const gap = cfg.gap * s;
  const r = cfg.bodyR * s;

  const renderPins = () => {
    if (Array.isArray(cfg.cols)) {
      return cfg.cols.flatMap((n, ri) => {
        const offsetY = ri * (pinH + gap * (ri === 1 ? 2.5 : 0.5));
        const rowY = (bodyH - pinH) / 2 + offsetY;
        const totalW = n * (pinW + gap) - gap;
        const rowOffsetX = ri === 1 && n < cfg.cols[0] ? (cfg.cols[0] - n) * (pinW + gap) / 2 : 0;
        return Array.from({ length: n }, (_, c) => {
          const x = (bodyW - totalW) / 2 + c * (pinW + gap) + rowOffsetX;
          return (
            <rect key={`p${ri}-${c}`} x={x} y={rowY} width={pinW} height={pinH}
              rx={0.5 * s} fill="#0a0a0a" stroke="rgba(255,255,255,0.2)" strokeWidth={0.3} />
          );
        });
      });
    }
    const perRow = Math.ceil(cfg.pins / cfg.rows);
    return Array.from({ length: cfg.rows }, (_, r) => {
      const n = r < cfg.rows - 1 ? perRow : cfg.pins - r * perRow;
      const totalW = n * (pinW + gap) - gap;
      return Array.from({ length: n }, (_, c) => {
        const x = (bodyW - totalW) / 2 + c * (pinW + gap);
        const y = (bodyH - cfg.rows * pinH - (cfg.rows - 1) * gap * 0.5) / 2 + r * (pinH + gap * 0.5);
        return (
          <rect key={`p${r}-${c}`} x={x} y={y} width={pinW} height={pinH}
            rx={0.5 * s} fill="#0a0a0a" stroke="rgba(255,255,255,0.2)" strokeWidth={0.3} />
        );
      });
    });
  };

  const gId = `g${cfg.id.replace(/[^a-z0-9]/g, '')}`;

  return (
    <svg width={bodyW} height={bodyH} viewBox={`0 0 ${bodyW} ${bodyH}`}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cfg.color} />
          <stop offset="40%" stopColor={lighten(cfg.color, 10)} />
          <stop offset="100%" stopColor={cfg.color} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={bodyW} height={bodyH} rx={r}
        fill={`url(#${gId})`} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      <rect x={0.5 * s} y={0.5 * s} width={bodyW - 1 * s} height={bodyH - 1 * s} rx={Math.max(0.2, r - 0.2 * s)}
        fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={0.3} />
      {cfg.hasClip && (
        <rect x={bodyW / 2 - 3 * s} y={0} width={6 * s} height={1.5 * s}
          rx={0.5 * s} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.3} />
      )}
      {cfg.split && (
        <line x1={bodyW / 2} y1={0.5 * s} x2={bodyW / 2} y2={bodyH - 0.5 * s}
          stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} strokeDasharray="1 2" />
      )}
      {showPins && renderPins()}
      {cfg.multiWire && (
        <g>
          {[{ color: '#e84855' }, { color: '#4a90e2' }, { color: '#f59e0b' }, { color: '#00d4aa' }].map((w, i) => (
            <line key={i} x1={-1.5 * s} y1={2.5 + i * 2.2 * s} x2={0.5 * s} y2={2.5 + i * 2.2 * s}
              stroke={w.color} strokeWidth={1.5 * s} strokeLinecap="round" />
          ))}
        </g>
      )}
    </svg>
  );
}

function lighten(hex, amt) {
  let c = parseInt(hex.replace('#',''), 16);
  return `rgb(${Math.min(255,(c>>16)+amt)},${Math.min(255,((c>>8)&0xff)+amt)},${Math.min(255,(c&0xff)+amt)})`;
}

function CablePathSVG({ cfg, port, dims }) {
  if (!dims || !cfg.entry || !port) return null;
  const w = dims.width, h = dims.height;
  const x1 = (cfg.entry.x / 100) * w;
  const y1 = (cfg.entry.y / 100) * h;
  const x2 = (port.l / 100) * w + (port.w / 100) * w / 2;
  const y2 = (port.t / 100) * h + (port.h / 100) * h / 2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cx1 = mx + (cfg.cp1.x / 100) * w, cy1 = my + (cfg.cp1.y / 100) * h;
  const cx2 = x2 + (cfg.cp2?.x ?? 0) / 100 * w, cy2 = y2 + (cfg.cp2?.y ?? 0) / 100 * h;
  const d = `M ${x1} ${y1} C ${(x1+cx1)/2} ${(y1+cy1)/2}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const col = cfg.wireColor || '#555';
  const acc = cfg.accent || '#888';

  return (
    <g>
      <path d={d} fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" opacity={0.4} />
      <path d={d} fill="none" stroke={col} strokeWidth="3.5" strokeLinecap="round" opacity={0.85} />
      <path d={d} fill="none" stroke={acc} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="4 4" opacity={0.4} style={{ animation: 'flow 1.2s linear infinite' }} />
      <path d={d} fill="none" stroke={acc} strokeWidth="0.5" strokeLinecap="round" opacity={0.2} />
    </g>
  );
}

function StarRating({ stars, size }) {
  const s = size || 28;
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          fontSize: s, color: i <= stars ? '#FFD700' : 'rgba(255,255,255,0.2)',
          textShadow: i <= stars ? '0 0 12px rgba(255,215,0,0.6)' : 'none',
        }}>★</span>
      ))}
    </div>
  );
}

export default function CableManagementGame({ lang = 'vn', onComplete, onExit }) {
  const t = LANG[lang];
  const boardRef = useRef(null);
  const [level, setLevel] = useState(null);
  const [started, setStarted] = useState(false);
  const [connected, setConnected] = useState([]);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [dragItem, setDragItem] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [hoverPort, setHoverPort] = useState(null);
  const [errId, setErrId] = useState(null);
  const [okId, setOkId] = useState(null);
  const [dims, setDims] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const t2 = useRef(null);
  const t3 = useRef(null);
  const boardRect = useRef(null);

  const lvlConf = level ? LEVEL_CONF[level] : null;
  const active = level ? CABLES.filter(c => lvlConf.cables.includes(c.id)) : [];
  const avail = active.filter(c => !connected.includes(c.id));

  useEffect(() => {
    if (document.getElementById('cmg-s')) return;
    const s = document.createElement('style');
    s.id = 'cmg-s';
    s.textContent = `
      @keyframes flow { 0%{stroke-dashoffset:16} 100%{stroke-dashoffset:0} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 50%{transform:translateX(4px)} 75%{transform:translateX(-2px)} }
      @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 100%{transform:scale(1)} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 6px rgba(0,212,170,0.4)} 50%{box-shadow:0 0 14px rgba(0,212,170,0.8)} }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!boardRef.current) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setDims({ width: r.width, height: r.height });
      boardRect.current = r;
    });
    ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, [started]);

  useEffect(() => {
    if (started && !complete) {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => setTime(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [started, complete]);

  useEffect(() => {
    const total = lvlConf?.cables.length || 0;
    if (started && total > 0 && connected.length === total) {
      clearInterval(timerRef.current);
      const ft = Math.floor((Date.now() - startRef.current) / 1000);
      setTime(ft);
      setScore(Math.max(0, 1000 + Math.max(0, 500 - ft * 5) - errors * 100));
      setStars(errors === 0 ? 3 : errors <= 2 ? 2 : 1);
      setComplete(true);
      onComplete?.({ score: Math.max(0, 1000 + Math.max(0, 500 - ft * 5) - errors * 100), timeSeconds: ft, errors, level, stars: errors === 0 ? 3 : errors <= 2 ? 2 : 1 });
    }
  }, [connected, level, started, errors, onComplete, lvlConf]);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl); setStarted(true); setConnected([]); setErrors(0);
    setTime(0); setScore(0); setComplete(false); setStars(0);
    setDragItem(null); setDragPos(null); setHoverPort(null);
    setErrId(null); setOkId(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleDragStart = useCallback((e, cfg) => {
    if (connected.includes(cfg.id)) return;
    setDragItem(cfg);
    setDragPos({ x: e.clientX - 40, y: e.clientY - 16 });
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  }, [connected]);

  const handleDrag = useCallback((e) => {
    if (!dragItem) return;
    e.preventDefault();
    setDragPos({ x: e.clientX - 40, y: e.clientY - 16 });
    if (boardRect.current) {
      const bw = boardRect.current.width, bh = boardRect.current.height;
      const mx = e.clientX - boardRect.current.left, my = e.clientY - boardRect.current.top;
      const pX = mx / bw * 100, pY = my / bh * 100;
      const found = Object.entries(PORT_POS).find(([id]) => {
        if (connected.some(c => CABLES.find(x => x.id === c)?.correctPort === id)) return false;
        const pos = id;
        const p = PORT_POS[id];
        return pX >= p.l && pX <= p.l + p.w && pY >= p.t && pY <= p.t + p.h;
      });
      setHoverPort(found ? found[0] : null);
      if (found && dragItem && lvlConf?.showTooltip) {
        const pc = CABLES.find(c => c.correctPort === found[0]);
        setTooltip(pc ? { cable: pc, x: e.clientX, y: e.clientY } : null);
      } else setTooltip(null);
    }
  }, [dragItem, connected, lvlConf]);

  const handleDrop = useCallback(() => {
    if (!dragItem) { setDragItem(null); setDragPos(null); return; }
    if (hoverPort && dragItem.correctPort === hoverPort) {
      setConnected(p => [...p, dragItem.id]);
      setOkId(dragItem.id);
      if (t2.current) clearTimeout(t2.current);
      t2.current = setTimeout(() => setOkId(null), 500);
    } else {
      setErrors(p => p + 1);
      setErrId(dragItem.id);
      if (t3.current) clearTimeout(t3.current);
      t3.current = setTimeout(() => setErrId(null), 600);
    }
    setDragItem(null); setDragPos(null); setHoverPort(null); setTooltip(null);
  }, [dragItem, hoverPort]);

  const retry = useCallback(() => { if (level) startLevel(level); }, [level, startLevel]);

  if (!started) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#0d0e13', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', background:'#0f0f1a', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ color:'#dde0ed', fontSize:18, fontWeight:700, margin:0 }}>⚡ {t.title}</h2>
          <button onClick={onExit} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#636678', padding:'6px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>{t.exit} ✕</button>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28, padding:40 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🖥️</div>
            <h1 style={{ color:'#dde0ed', fontSize:26, fontWeight:800, margin:0 }}>{t.title}</h1>
            <p style={{ color:'#636678', fontSize:13, marginTop:6 }}>Kéo cáp từ khay → thả vào cổng trên mainboard</p>
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
            {['easy','medium','hard'].map(lvl => {
              const lc = LEVEL_CONF[lvl];
              const lvC = CABLES.filter(c => lc.cables.includes(c.id));
              return (
                <button key={lvl} onClick={() => startLevel(lvl)}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#00d4aa'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,212,170,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                  style={{ padding:'14px 18px', borderRadius:12, background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', textAlign:'center', minWidth:160, transition:'all 0.25s', color:'#dde0ed', fontFamily:'inherit' }}>
                  <div style={{ display:'flex', gap:4, justifyContent:'center', marginBottom:8, flexWrap:'wrap' }}>
                    {lvC.slice(0,4).map(c => (
                      <div key={c.id} style={{ width:22, height:14 }}><ConnectorSVG cfg={c} size={0.4} /></div>
                    ))}
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{t[lvl]}</div>
                  <div style={{ color:'#636678', fontSize:10 }}>{lvC.length} loại cáp</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#0d0e13', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif', userSelect:'none' }}
      onDragOver={handleDrag} onDrop={handleDrop} onDragEnd={() => { setDragItem(null); setDragPos(null); setHoverPort(null); setTooltip(null); }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px', background:'#0f0f1a', borderBottom:'1px solid rgba(255,255,255,0.08)', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>⚡</span>
          <span style={{ color:'#dde0ed', fontSize:14, fontWeight:700 }}>{t.title}</span>
          <span style={{ background:'rgba(0,212,170,0.12)', color:'#00d4aa', padding:'1px 8px', borderRadius:99, fontSize:10, fontWeight:700 }}>{t[level]}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {[
            { l:t.timer, v:`${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`, c:'#dde0ed' },
            { l:t.score, v:score||0, c:'#00d4aa' },
            { l:t.mistakes, v:errors, c:errors>0?'#e84855':'#636678' },
            { l:t.cablesLeft, v:`${avail.length}/${active.length}`, c:'#4a90e2' },
          ].map(item => (
            <div key={item.l} style={{ textAlign:'center' }}>
              <div style={{ color:'#636678', fontSize:8, fontWeight:600 }}>{item.l}</div>
              <div style={{ color:item.c, fontSize:14, fontWeight:700 }}>{item.v}</div>
            </div>
          ))}
          <button onClick={onExit} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#636678', padding:'4px 12px', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit' }}>{t.exit} ✕</button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px', overflow:'hidden', maxWidth:960, width:'100%', margin:'0 auto' }}>
        <div style={{ flex:1, position:'relative', minHeight:0 }}>
          <div ref={boardRef} style={{ position:'absolute', inset:0, borderRadius:6, overflow:'hidden', background:'#060606' }}>
            <img src="/chỗ-cần-cắm-cáp.png" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.45 }} />
            <PSUArea />
            <GPUCard />
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:4 }}>
              {connected.map(id => {
                const c = CABLES.find(x => x.id === id);
                if (!c) return null;
                return <CablePathSVG key={id} cfg={c} port={PORT_POS[c.correctPort]} dims={dims} />;
              })}
            </svg>
            {active.map(c => {
              const p = PORT_POS[c.correctPort];
              if (!p) return null;
              const con = connected.includes(c.id);
              const err = errId === c.id;
              const ok = okId === c.id;
              const hover = hoverPort === c.correctPort;
              return (
                <div key={c.correctPort}
                  style={{
                    position:'absolute', top:`${p.t}%`, left:`${p.l}%`,
                    width:`${p.w}%`, height:`${p.h}%`,
                    zIndex: con ? 6 : 3, display:'flex', alignItems:'center', justifyContent:'center',
                    animation: err?'shake 0.3s ease-in-out':ok?'pop 0.3s ease-out':'none',
                    transition:'all 0.2s',
                  }}>
                  <div style={{
                    width:'100%', height:'100%',
                    border: con ? '1.5px solid #00d4aa' : err ? '1.5px solid #e84855' : hover ? `1.5px solid ${dragItem?.accent||'#00d4aa'}` : '1px solid transparent',
                    borderRadius:3, background: con ? 'rgba(0,212,170,0.06)' : err ? 'rgba(232,72,85,0.06)' : hover ? 'rgba(0,212,170,0.04)' : 'rgba(255,255,255,0.01)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:1,
                    boxShadow: con ? '0 0 10px rgba(0,212,170,0.15)' : hover ? '0 0 6px rgba(0,212,170,0.1)' : 'none',
                    opacity: con ? 1 : 0.55,
                    transition:'all 0.2s',
                  }}>
                    {con ? (
                      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                        <ConnectorSVG cfg={c} size={0.22} showPins={false} />
                        <span style={{ color:'#00d4aa', fontSize:4.5, fontWeight:700 }}>✓</span>
                      </div>
                    ) : (
                      <>
                        <ConnectorSVG cfg={c} size={0.22} />
                        {lvlConf?.showNames && (
                          <span style={{ color:'rgba(255,255,255,0.2)', fontSize:4, fontWeight:600 }}>{c.portLabel}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {tooltip && lvlConf?.showTooltip && (
              <div style={{
                position:'fixed', left:tooltip.x+10, top:tooltip.y-8, zIndex:9999,
                background:'rgba(10,10,20,0.92)', backdropFilter:'blur(6px)',
                border:`1px solid ${tooltip.cable.accent}55`, borderRadius:6,
                padding:'6px 10px', pointerEvents:'none', animation:'fadeIn 0.12s',
                boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
              }}>
                <div style={{ color:tooltip.cable.accent, fontSize:11, fontWeight:700 }}>{tooltip.cable.portLabel}</div>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:9 }}>{tooltip.cable.tooltip}</div>
              </div>
            )}
          </div>
        </div>

        {dragItem && dragPos && (
          <div style={{
            position:'fixed', pointerEvents:'none', zIndex:9999,
            left:dragPos.x, top:dragPos.y, transform:'scale(1.15)',
            filter:'drop-shadow(0 10px 28px rgba(0,0,0,0.8))',
            transition:'transform 0.05s',
          }}>
            <ConnectorSVG cfg={dragItem} size={2} />
          </div>
        )}

        <div style={{ height:74, flexShrink:0, marginTop:8 }}>
          <div style={{
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.05)', borderRadius:6,
            height:'100%', display:'flex', alignItems:'center', padding:'6px 12px', gap:8,
          }}>
            <span style={{ color:'#636678', fontSize:9, fontWeight:600, whiteSpace:'nowrap', marginRight:2 }}>
              🔌 {avail.length}
            </span>
            <div style={{ flex:1, display:'flex', gap:8, overflowX:'auto', alignItems:'center', justifyContent:'center', padding:'2px 0' }}>
              {active.map(c => {
                if (connected.includes(c.id)) return null;
                const err = errId === c.id;
                const ok = okId === c.id;
                return (
                  <div key={c.id} draggable onDragStart={e => handleDragStart(e, c)}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center', gap:1,
                      padding:'4px 10px', borderRadius:5, cursor:'grab',
                      border:`1px solid ${c.accent}33`, background:`${c.accent}08`,
                      transition:'all 0.12s', minWidth:50,
                      animation: err?'shake 0.3s ease-in-out':ok?'pop 0.3s ease-out':'none',
                    }}>
                    <ConnectorSVG cfg={c} size={0.6} />
                    {lvlConf?.showNames && (
                      <span style={{ color:'#636678', fontSize:6, fontWeight:600 }}>{c.portLabel}</span>
                    )}
                    {!lvlConf?.showNames && (
                      <span style={{ width:10, height:1.5, borderRadius:0.5, background:c.accent }} />
                    )}
                  </div>
                );
              })}
            </div>
            <span style={{ color:'#636678', fontSize:8 }}>{connected.length}/{active.length}</span>
          </div>
        </div>
      </div>

      {dragItem && hoverPort && (
        <div style={{
          position:'fixed', bottom:86, left:'50%', transform:'translateX(-50%)',
          zIndex:100, animation:'fadeIn 0.1s',
          color: dragItem.correctPort === hoverPort ? '#00d4aa' : '#e84855',
          fontSize:10, fontWeight:700, background:'rgba(0,0,0,0.7)', padding:'4px 14px', borderRadius:99,
        }}>
          {dragItem.correctPort === hoverPort ? `✓ ${dragItem.portLabel}` : `✕ ${t.wrongCable}`}
        </div>
      )}

      {complete && (
        <div style={{
          position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.7)',
          backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center',
          animation:'fadeIn 0.3s',
        }}>
          <div style={{
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:14, padding:32, textAlign:'center', maxWidth:360, width:'90%',
            animation:'slideUp 0.4s ease-out', boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize:40, marginBottom:4 }}>🎉</div>
            <h2 style={{ color:'#dde0ed', fontSize:20, fontWeight:800, margin:'0 0 2px' }}>{t.congrats}</h2>
            <p style={{ color:'#636678', fontSize:12, margin:'0 0 12px' }}>{t.completed} - {t[level]}</p>
            <StarRating stars={stars} size={28} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'14px 0' }}>
              {[
                { l:t.yourTime, v:`${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`, c:'#dde0ed' },
                { l:t.yourScore, v:score, c:'#00d4aa' },
                { l:t.yourMistakes, v:errors, c:errors>0?'#e84855':'#00d4aa' },
              ].map(item => (
                <div key={item.l} style={{ background:'rgba(255,255,255,0.04)', borderRadius:6, padding:'8px 4px' }}>
                  <div style={{ color:'#636678', fontSize:8, fontWeight:600 }}>{item.l}</div>
                  <div style={{ color:item.c, fontSize:16, fontWeight:700 }}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={retry}
                style={{ padding:'8px 20px', borderRadius:8, background:'rgba(0,212,170,0.12)', border:'1px solid #00d4aa', color:'#00d4aa', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>🔄 {t.retry}</button>
              <button onClick={onExit}
                style={{ padding:'8px 20px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#636678', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit' }}>{t.exit}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
