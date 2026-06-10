'use client';

import { useState, useEffect } from 'react';

const LANG_DATA = {
  vn: {
    title: 'Bản Đồ Nhiệt',
    subtitle: 'Mô phỏng nhiệt độ & luồng khí trong thùng máy',
    loadLabel: 'Tải hệ thống',
    idle: 'Chờ',
    gaming: 'Chơi Game',
    stress: 'Stress Test',
    custom: 'Tùy chỉnh',
    temp: 'Nhiệt độ',
    tdp: 'TDP',
    cpu: 'CPU',
    gpu: 'VGA',
    psu: 'Nguồn',
    ram: 'RAM',
    case: 'Thùng máy',
    systemAvg: 'Nhiệt độ TB Hệ thống',
    hottest: 'Linh kiện nóng nhất',
    throttling: 'Cảnh báo nghẹt nhiệt',
    throttlingOk: 'Không có nghẹt nhiệt',
    fanSpeed: 'Tốc độ quạt',
    efficiency: 'Hiệu suất làm mát',
    pressure: 'Áp suất thùng máy',
    positive: 'Dương',
    neutral: 'Trung tính',
    negative: 'Âm',
    intake: 'Hút vào',
    exhaust: 'Thải ra',
    recommendation: 'Gợi ý cải thiện',
    addRearFan: 'Thêm quạt thải sau',
    addRearFanDesc: 'Nhiệt độ thùng máy > 40°C — quạt thải sau giúp đẩy khí nóng ra ngoài',
    upgradeAio: 'Nâng cấp lên tản nước AIO',
    upgradeAioDesc: 'CPU > 85°C — tản khí không đủ, cần AIO 240mm+',
    addBottomIntake: 'Thêm quạt hút dưới',
    addBottomIntakeDesc: 'GPU > 80°C — quạt hút dưới cấp khí mát trực tiếp cho VGA',
    cleanFilter: 'Vệ sinh lọc bụi',
    cleanFilterDesc: 'Nhiệt độ tổng cao — lọc bụi bẩn làm giảm luồng khí',
    goodCooling: 'Làm mát ổn',
    goodCoolingDesc: 'Tất cả linh kiện trong ngưỡng an toàn',
    exit: 'Thoát',
    loadPercent: 'Tải',
    airflow: 'Luồng khí',
    coolerType: 'Tản nhiệt',
    airCooler: 'Tản khí',
    aio: 'AIO',
    customLoop: 'Custom Loop',
    meshFront: 'Mặt trước lưới',
    glassFront: 'Mặt trước kính',
    caseMesh: 'Lưới',
    caseGlass: 'Kính',
    critical: 'NGUY HIỂM',
    warm: 'ẤM',
    safe: 'AN TOÀN',
    throttlingActive: 'ĐANG NGHẸT NHIỆT!',
    throttlingCpu: 'CPU vượt 85°C — giảm xung để bảo vệ',
    throttlingGpu: 'GPU vượt 85°C — giảm hiệu năng',
  },
  en: {
    title: 'Thermal Heatmap',
    subtitle: 'Real-time heat & airflow simulation inside PC case',
    loadLabel: 'System Load',
    idle: 'Idle',
    gaming: 'Gaming',
    stress: 'Stress Test',
    custom: 'Custom',
    temp: 'Temperature',
    tdp: 'TDP',
    cpu: 'CPU',
    gpu: 'GPU',
    psu: 'PSU',
    ram: 'RAM',
    case: 'Case',
    systemAvg: 'System Avg Temp',
    hottest: 'Hottest Component',
    throttling: 'Throttling Warning',
    throttlingOk: 'No throttling detected',
    fanSpeed: 'Fan Speed',
    efficiency: 'Cooling Efficiency',
    pressure: 'Case Pressure',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    intake: 'Intake',
    exhaust: 'Exhaust',
    recommendation: 'Cooling Recommendations',
    addRearFan: 'Add rear exhaust fan',
    addRearFanDesc: 'Case temp > 40°C — rear fan pushes hot air out',
    upgradeAio: 'Upgrade to AIO cooler',
    upgradeAioDesc: 'CPU > 85°C — air cooler insufficient, need 240mm+ AIO',
    addBottomIntake: 'Add bottom intake fan',
    addBottomIntakeDesc: 'GPU > 80°C — bottom intake feeds cool air directly to GPU',
    cleanFilter: 'Clean dust filters',
    cleanFilterDesc: 'Overall temps high — dust buildup restricts airflow',
    goodCooling: 'Cooling is adequate',
    goodCoolingDesc: 'All components within safe temperature range',
    exit: 'Exit',
    loadPercent: 'Load',
    airflow: 'Airflow',
    coolerType: 'Cooler',
    airCooler: 'Air Cooler',
    aio: 'AIO',
    customLoop: 'Custom Loop',
    meshFront: 'Mesh Front',
    glassFront: 'Glass Front',
    caseMesh: 'Mesh',
    caseGlass: 'Glass',
    critical: 'CRITICAL',
    warm: 'WARM',
    safe: 'SAFE',
    throttlingActive: 'THROTTLING ACTIVE!',
    throttlingCpu: 'CPU exceeds 85°C — clock speed reduced',
    throttlingGpu: 'GPU exceeds 85°C — performance degraded',
  }
};

const THERMAL_PROFILES = {
  cpu: { idleBase: 35, tdpMult: 0.36, maxSafe: 85, critical: 100, labelKey: 'cpu' },
  gpu: { idleBase: 30, tdpMult: 0.28, maxSafe: 83, critical: 90, labelKey: 'gpu' },
  psu: { idleBase: 28, tdpMult: 0.18, maxSafe: 75, critical: 85, labelKey: 'psu' },
  ram: { idleBase: 28, tdpMult: 0.06, maxSafe: 70, critical: 85, labelKey: 'ram' },
  case: { idleBase: 25, tdpMult: 0.02, maxSafe: 45, critical: 55, labelKey: 'case' },
};

const COOLER_EFFICIENCY = {
  air: 0.65,
  aio: 0.85,
  custom: 0.95,
};

const FAN_SPEED_RAMP = [
  { temp: 30, pct: 20 },
  { temp: 50, pct: 45 },
  { temp: 65, pct: 70 },
  { temp: 80, pct: 90 },
  { temp: 100, pct: 100 },
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function getFanSpeed(maxTemp) {
  for (let i = FAN_SPEED_RAMP.length - 1; i >= 0; i--) {
    if (maxTemp >= FAN_SPEED_RAMP[i].temp) return FAN_SPEED_RAMP[i].pct;
  }
  return FAN_SPEED_RAMP[0].pct;
}

function tempColor(t, maxSafe) {
  if (t >= maxSafe + 10) return '#ef4444';
  if (t >= maxSafe) return '#f59e0b';
  return '#22c55e';
}

function heatGradient(t, maxSafe, critical) {
  const ratio = clamp((t - 25) / (critical - 25), 0, 1);
  const r = Math.round(clamp(ratio * 255, 20, 255));
  const g = Math.round(clamp(255 - ratio * 220, 30, 255));
  const b = Math.round(clamp(255 - ratio * 255, 20, 200));
  return { r, g, b, ratio };
}

function calcTemp(profile, tdp, loadPct, coolerEff, meshFactor, distFromFan) {
  const loadFactor = loadPct / 100;
  const heatGen = tdp * profile.tdpMult * loadFactor;
  const coolingEff = coolerEff * meshFactor;
  const distPenalty = 1 + (distFromFan * 0.08);
  const temp = profile.idleBase + (heatGen * (1 - coolingEff + 0.2) * distPenalty);
  return Math.round(temp * 10) / 10;
}

function getPressure(fanCount, meshFront) {
  if (!fanCount) return 0;
  const base = fanCount >= 3 ? 1 : (fanCount >= 2 ? 0 : -1);
  return meshFront ? base + 0.5 : base - 0.5;
}

function pressureLabel(p, lang) {
  const t = LANG_DATA[lang];
  if (p > 0.3) return t.positive;
  if (p < -0.3) return t.negative;
  return t.neutral;
}

function getRecommendations(temps, coolerEff, fanCount, caseTemp, lang) {
  const t = LANG_DATA[lang];
  const recs = [];
  if (caseTemp > 40 && fanCount < 2) recs.push({ type: 'rear_fan', label: t.addRearFan, desc: t.addRearFanDesc, severity: 'warn' });
  if (temps.cpu > 85 && coolerEff < 0.8) recs.push({ type: 'aio', label: t.upgradeAio, desc: t.upgradeAioDesc, severity: 'danger' });
  if (temps.gpu > 80 && fanCount < 3) recs.push({ type: 'bottom_intake', label: t.addBottomIntake, desc: t.addBottomIntakeDesc, severity: 'warn' });
  if (caseTemp > 38 && temps.cpu > 75) recs.push({ type: 'clean', label: t.cleanFilter, desc: t.cleanFilterDesc, severity: 'info' });
  if (recs.length === 0) recs.push({ type: 'ok', label: t.goodCooling, desc: t.goodCoolingDesc, severity: 'ok' });
  return recs;
}

function ThermometerIcon({ temp, maxSafe, size = 14 }) {
  const color = tempColor(temp, maxSafe);
  const fillRatio = clamp(temp / 100, 0, 1);
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="25" r="5" stroke={color} strokeWidth="1.5" fill={`${color}22`} />
      <rect x="8.5" y="4" width="3" height="18" rx="1.5" stroke={color} strokeWidth="1.5" fill={`${color}22`} />
      <rect x="8.5" y={4 + (18 - 18 * fillRatio)} width="3" height={18 * fillRatio} rx="1" fill={color} opacity="0.7" />
    </svg>
  );
}

function ArrowIcon({ dir = 'right', speed = 1, color = '#00d4aa' }) {
  const rotations = { right: 0, left: 180, up: -90, down: 90, upright: -45, upleft: -135, downright: 45, downleft: 135 };
  const dur = Math.max(0.5, 2 - speed * 0.015);
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" style={{ transform: `rotate(${rotations[dir] || 0}deg)`, animation: `arrowPulse ${dur}s ease-in-out infinite` }}>
      <defs>
        <linearGradient id={`arrowGrad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M0 7h16M10 1l6 6-6 6" stroke={`url(#arrowGrad)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Particle({ x, y, dir, speed }) {
  const dur = Math.max(1, 4 - speed * 0.03);
  return (
    <div className="thermal-particle" style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, width: 3, height: 3, borderRadius: '50%',
      background: '#00d4aa', opacity: 0.6, pointerEvents: 'none',
      animation: `floatParticle ${dur}s linear infinite`,
      animationDelay: `${Math.random() * 2}s`,
      '--tx': `${dir === 'right' ? 1 : dir === 'left' ? -1 : 0}`,
      '--ty': `${dir === 'down' ? 1 : dir === 'up' ? -1 : 0}`,
    }} />
  );
}

export default function ThermalHeatmap({ build = {}, lang = 'en', onExit }) {
  const t = LANG_DATA[lang];
  const [loadLevel, setLoadLevel] = useState('idle');
  const [customLoad, setCustomLoad] = useState(50);
  const [showLabels, setShowLabels] = useState(true);
  const [animating, setAnimating] = useState(false);

  const cpuTdp = build?.cpu?.cpu_tdp_watts || 125;
  const gpuTdp = build?.gpu?.gpu_tdp_watts || 250;
  const coolerType = build?.cooler?.cooler_type || 'air';
  const coolerMaxTdp = build?.cooler?.cooler_max_tdp_support || 150;
  const fanSlots = build?.case?.case_fan_slots || 2;
  const meshFront = build?.case?.case_mesh_front ?? true;
  const ramSticks = build?.ram?.length || 2;
  const psuWattage = build?.psu?.psu_wattage || 650;

  const loadMap = { idle: 20, gaming: 70, stress: 100 };
  const loadPct = loadLevel === 'custom' ? customLoad : (loadMap[loadLevel] || 20);

  const coolerEff = COOLER_EFFICIENCY[coolerType] || 0.65;
  const meshFactor = meshFront ? 1.0 : 0.7;

  useEffect(() => {
    setAnimating(true);
    const id = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(id);
  }, [loadPct]);

  const temps = {
    cpu: calcTemp(THERMAL_PROFILES.cpu, cpuTdp, loadPct, coolerEff, meshFactor, 0.6),
    gpu: calcTemp(THERMAL_PROFILES.gpu, gpuTdp, loadPct, coolerEff, meshFactor, 0.8),
    psu: calcTemp(THERMAL_PROFILES.psu, psuWattage * 0.3, loadPct, coolerEff, meshFactor, 0.3),
    ram: calcTemp(THERMAL_PROFILES.ram, 10 * ramSticks, loadPct, coolerEff, meshFactor, 0.7),
    case: calcTemp(THERMAL_PROFILES.case, (cpuTdp + gpuTdp) * 0.05, loadPct, coolerEff, meshFactor, 0),
  };

  const avgTemp = (temps.cpu + temps.gpu + temps.psu + temps.ram) / 4;
  const maxTemp = Math.max(temps.cpu, temps.gpu, temps.psu, temps.ram, temps.case);
  const maxSafeTemp = Math.max(
    THERMAL_PROFILES.cpu.maxSafe,
    THERMAL_PROFILES.gpu.maxSafe,
  );

  const hottestKey = Object.entries(temps).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const hottestName = t[hottestKey] || hottestKey;

  const throttling = temps.cpu > THERMAL_PROFILES.cpu.maxSafe || temps.gpu > THERMAL_PROFILES.gpu.maxSafe;

  const fanSpeedPct = getFanSpeed(maxTemp);
  const effScore = Math.round(clamp(100 - (avgTemp - 25) * 1.4 + (meshFactor ? 10 : 0) + (fanSlots >= 3 ? 10 : 0), 0, 100));
  const pressure = getPressure(fanSlots, meshFront);
  const pressureStr = pressureLabel(pressure, lang);

  const recs = getRecommendations(temps, coolerEff, fanSlots, temps.case, lang);

  const severityColors = { danger: '#ef4444', warn: '#f59e0b', info: '#3b82f6', ok: '#22c55e' };
  const severityBg = { danger: 'rgba(239,68,68,0.1)', warn: 'rgba(245,158,11,0.1)', info: 'rgba(59,130,246,0.1)', ok: 'rgba(34,197,94,0.1)' };

  const cGrad = heatGradient(temps.cpu, THERMAL_PROFILES.cpu.maxSafe, THERMAL_PROFILES.cpu.critical);
  const gGrad = heatGradient(temps.gpu, THERMAL_PROFILES.gpu.maxSafe, THERMAL_PROFILES.gpu.critical);
  const pGrad = heatGradient(temps.psu, THERMAL_PROFILES.psu.maxSafe, THERMAL_PROFILES.psu.critical);
  const rGrad = heatGradient(temps.ram, THERMAL_PROFILES.ram.maxSafe, THERMAL_PROFILES.ram.critical);

  const loadOptions = [
    { id: 'idle', label: t.idle, icon: '⏸' },
    { id: 'gaming', label: t.gaming, icon: '🎮' },
    { id: 'stress', label: t.stress, icon: '⚡' },
    { id: 'custom', label: t.custom, icon: '🎚' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base, #080910)',
      display: 'flex', flexDirection: 'column',
      color: 'var(--text-primary, #d8dbe8)',
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes heatPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes floatParticle {
          0% { transform: translate(0, 0); opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: translate(calc(var(--tx, 1) * 120px), calc(var(--ty, 0) * 60px)); opacity: 0; }
        }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 4px rgba(0,212,170,0.2); }
          50% { box-shadow: 0 0 12px rgba(0,212,170,0.5); }
        }
        @keyframes tempFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .thermal-comp { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .thermal-comp:hover { filter: brightness(1.2); transform: scale(1.03); z-index: 10; }
        .temp-value { transition: color 0.3s; }
        .rec-card { transition: all 0.3s; animation: slideInUp 0.4s ease-out; }
        .rec-card:hover { transform: translateX(4px); }
        .load-btn { transition: all 0.2s; cursor: pointer; }
        .load-btn:hover { background: rgba(0,212,170,0.15); }
        .load-btn.active { background: rgba(0,212,170,0.2); border-color: #00d4aa; }
        .custom-slider { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; }
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #00d4aa; cursor: pointer; box-shadow: 0 0 8px rgba(0,212,170,0.4); }
        .custom-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #00d4aa; cursor: pointer; border: none; }
        .thermometer-fill { transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.06))',
        background: 'var(--bg-surface, #0f1018)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🌡️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.3px' }}>{t.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted, #5a5d72)', marginTop: 1 }}>{t.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted, #5a5d72)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} style={{ accentColor: '#00d4aa' }} />
            {showLabels ? 'Labels' : 'Hide'}
          </label>
          <button onClick={onExit} style={{
            padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border-default, rgba(255,255,255,0.1))',
            background: 'transparent', color: 'var(--text-muted, #5a5d72)', fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#d8dbe8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5d72'; }}
          >
            {t.exit} ✕
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Case visualization */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(0,212,170,0.03) 0%, transparent 70%)',
        }}>
          {/* PC Case SVG */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: 620, aspectRatio: '1.3 / 1',
            background: 'linear-gradient(135deg, var(--bg-surface, #0f1018) 0%, #111520 100%)',
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
            overflow: 'hidden',
          }}>
            {/* Case interior glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 50%, rgba(${cGrad.r},${cGrad.g},${cGrad.b},0.04) 0%, transparent 80%)`,
              pointerEvents: 'none',
            }} />

            {/* Motherboard outline */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 620 480">
              <rect x="120" y="60" width="360" height="340" rx="4" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              {/* CPU Socket */}
              <rect x="215" y="130" width="80" height="80" rx="3" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              {/* RAM slots */}
              <rect x="305" y="145" width="55" height="12" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <rect x="305" y="162" width="55" height="12" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              {/* GPU slot */}
              <rect x="150" y="280" width="260" height="12" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              {/* Chipset */}
              <rect x="345" y="230" width="30" height="30" rx="2" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </svg>

            {/* Particle effects */}
            {fanSpeedPct > 20 && <>
              <Particle x={12} y={35} dir="right" speed={fanSpeedPct} />
              <Particle x={10} y={50} dir="right" speed={fanSpeedPct} />
              <Particle x={8} y={65} dir="right" speed={fanSpeedPct} />
              <Particle x={85} y={30} dir="left" speed={fanSpeedPct} />
              <Particle x={88} y={45} dir="left" speed={fanSpeedPct} />
              <Particle x={82} y={70} dir="up" speed={fanSpeedPct} />
              <Particle x={78} y={72} dir="up" speed={fanSpeedPct} />
            </>}

            {/* ── CPU Cooler ── */}
            <div className="thermal-comp" style={{
              position: 'absolute', left: '36%', top: '27%', width: '14%', height: '18%',
              animation: animating ? 'heatPulse 1.5s ease-in-out infinite' : 'none',
            }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                background: `radial-gradient(ellipse at 50% 50%, rgba(${cGrad.r},${cGrad.g},${cGrad.b},${0.2 + cGrad.ratio * 0.4}) 0%, rgba(${cGrad.r},${cGrad.g},${cGrad.b},0.05) 70%, transparent 100%)`,
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(1px)',
              }}>
                {/* Heatsink fins */}
                <svg width="80%" height="50%" viewBox="0 0 60 30" style={{ position: 'absolute', top: 6 }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <rect key={i} x={3 + i * 5.5} y={2} width="3" height="24" rx="0.5" fill={i % 2 === 0 ? 'rgba(200,200,210,0.15)' : 'rgba(200,200,210,0.08)'} />
                  ))}
                </svg>
                {/* CPU heat center */}
                <div style={{
                  width: '40%', height: '30%', borderRadius: '50%', marginTop: '25%',
                  background: `radial-gradient(circle, rgba(${cGrad.r},${cGrad.g},${cGrad.b},${0.5 + cGrad.ratio * 0.4}) 0%, transparent 100%)`,
                  animation: animating ? 'glowPulse 2s ease-in-out infinite' : 'none',
                }} />
              </div>
              {showLabels && (
                <div style={{
                  position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  animation: 'tempFadeIn 0.3s ease-out',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ThermometerIcon temp={temps.cpu} maxSafe={THERMAL_PROFILES.cpu.maxSafe} size={10} />
                    <span className="temp-value" style={{ fontSize: 11, fontWeight: 700, color: tempColor(temps.cpu, THERMAL_PROFILES.cpu.maxSafe) }}>
                      {Math.round(temps.cpu)}°C
                    </span>
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)' }}>{cpuTdp}W TDP</span>
                </div>
              )}
            </div>

            {/* ── GPU ── */}
            <div className="thermal-comp" style={{
              position: 'absolute', left: '24%', top: '58%', width: '42%', height: '16%',
              animation: animating ? 'heatPulse 1.8s ease-in-out infinite' : 'none',
            }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                background: `radial-gradient(ellipse at 50% 50%, rgba(${gGrad.r},${gGrad.g},${gGrad.b},${0.2 + gGrad.ratio * 0.4}) 0%, rgba(${gGrad.r},${gGrad.g},${gGrad.b},0.05) 80%, transparent 100%)`,
                borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(1px)',
              }}>
                {/* GPU fans */}
                <div style={{ display: 'flex', gap: '8%', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '22%', aspectRatio: '1', borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: `radial-gradient(circle, rgba(${gGrad.r},${gGrad.g},${gGrad.b},0.3) 0%, rgba(${gGrad.r},${gGrad.g},${gGrad.b},0.05) 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: fanSpeedPct > 30 ? `spin ${1.5 - fanSpeedPct * 0.008}s linear infinite` : 'none',
                    }}>
                      <svg width="60%" height="60%" viewBox="0 0 20 20">
                        <path d="M10 2 L11 8 L17 9 L12 13 L14 19 L10 15 L6 19 L8 13 L3 9 L9 8 Z" fill="rgba(255,255,255,0.15)" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
              {showLabels && (
                <div style={{
                  position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  animation: 'tempFadeIn 0.3s ease-out',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ThermometerIcon temp={temps.gpu} maxSafe={THERMAL_PROFILES.gpu.maxSafe} size={10} />
                    <span className="temp-value" style={{ fontSize: 11, fontWeight: 700, color: tempColor(temps.gpu, THERMAL_PROFILES.gpu.maxSafe) }}>
                      {Math.round(temps.gpu)}°C
                    </span>
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)' }}>{gpuTdp}W TDP</span>
                </div>
              )}
            </div>

            {/* ── PSU ── */}
            <div className="thermal-comp" style={{
              position: 'absolute', left: '6%', bottom: '8%', width: '24%', height: '18%',
              animation: animating ? 'heatPulse 2s ease-in-out infinite' : 'none',
            }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                background: `radial-gradient(ellipse at 50% 50%, rgba(${pGrad.r},${pGrad.g},${pGrad.b},${0.15 + pGrad.ratio * 0.35}) 0%, rgba(${pGrad.r},${pGrad.g},${pGrad.b},0.04) 80%, transparent 100%)`,
                borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, backdropFilter: 'blur(1px)',
              }}>
                {/* PSU fan grill */}
                <svg width="50%" height="40%" viewBox="0 0 40 30">
                  <circle cx="20" cy="15" r="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <circle cx="20" cy="15" r="3" fill={`rgba(${pGrad.r},${pGrad.g},${pGrad.b},0.2)`} />
                  <line x1="12" y1="15" x2="8" y2="15" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="28" y1="15" x2="32" y2="15" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="20" y1="7" x2="20" y2="3" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="20" y1="23" x2="20" y2="27" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </svg>
                <span style={{ fontSize: 8, color: 'var(--text-muted, #5a5d72)', letterSpacing: '0.5px' }}>PSU</span>
              </div>
              {showLabels && (
                <div style={{
                  position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  animation: 'tempFadeIn 0.3s ease-out',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ThermometerIcon temp={temps.psu} maxSafe={THERMAL_PROFILES.psu.maxSafe} size={10} />
                    <span className="temp-value" style={{ fontSize: 11, fontWeight: 700, color: tempColor(temps.psu, THERMAL_PROFILES.psu.maxSafe) }}>
                      {Math.round(temps.psu)}°C
                    </span>
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)' }}>{psuWattage}W</span>
                </div>
              )}
            </div>

            {/* ── RAM Sticks ── */}
            {[0, 1].map(i => (
              <div key={`ram-${i}`} className="thermal-comp" style={{
                position: 'absolute', left: `${49 + i * 5.5}%`, top: `${30 + i * 4}%`,
                width: '5%', height: '6%',
                animation: animating ? 'heatPulse 2.2s ease-in-out infinite' : 'none',
              }}>
                <div style={{
                  width: '100%', height: '100%',
                  background: `radial-gradient(ellipse at 50% 50%, rgba(${rGrad.r},${rGrad.g},${rGrad.b},${0.15 + rGrad.ratio * 0.35}) 0%, rgba(${rGrad.r},${rGrad.g},${rGrad.b},0.04) 100%)`,
                  borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(1px)',
                }}>
                  <svg width="60%" height="40%" viewBox="0 0 10 20">
                    <rect x="0" y="0" width="10" height="20" rx="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            ))}
            {showLabels && (
              <div style={{
                position: 'absolute', left: '52%', top: '39%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 3, animation: 'tempFadeIn 0.3s ease-out',
              }}>
                <ThermometerIcon temp={temps.ram} maxSafe={THERMAL_PROFILES.ram.maxSafe} size={8} />
                <span className="temp-value" style={{ fontSize: 9, fontWeight: 700, color: tempColor(temps.ram, THERMAL_PROFILES.ram.maxSafe) }}>
                  {Math.round(temps.ram)}°C
                </span>
              </div>
            )}

            {/* ── Front Intake Fan ── */}
            <div style={{
              position: 'absolute', left: '3%', top: '32%', width: '6%', height: '18%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <div style={{
                width: '70%', aspectRatio: '1', borderRadius: '50%',
                border: '1.5px solid rgba(0,212,170,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,212,170,0.04)',
                animation: fanSpeedPct > 20 ? `spin ${1.8 - fanSpeedPct * 0.01}s linear infinite` : 'none',
              }}>
                <svg width="60%" height="60%" viewBox="0 0 16 16">
                  <path d="M8 1v14M1 8h14" stroke="rgba(0,212,170,0.3)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              {showLabels && <span style={{ fontSize: 7, color: '#00d4aa', letterSpacing: '0.3px' }}>{t.intake}</span>}
              {/* Airflow arrow */}
              <ArrowIcon dir="right" speed={fanSpeedPct} color="#00d4aa" />
            </div>

            {/* ── Rear Exhaust Fan ── */}
            <div style={{
              position: 'absolute', right: '3%', top: '25%', width: '6%', height: '18%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <div style={{
                width: '70%', aspectRatio: '1', borderRadius: '50%',
                border: '1.5px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.04)',
                animation: fanSpeedPct > 20 ? `spin ${1.8 - fanSpeedPct * 0.01}s linear infinite reverse` : 'none',
              }}>
                <svg width="60%" height="60%" viewBox="0 0 16 16">
                  <path d="M8 1v14M1 8h14" stroke="rgba(239,68,68,0.3)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              {showLabels && <span style={{ fontSize: 7, color: '#ef4444', letterSpacing: '0.3px' }}>{t.exhaust}</span>}
              <ArrowIcon dir="left" speed={fanSpeedPct} color="#ef4444" />
            </div>

            {/* ── Top exhaust arrows ── */}
            <div style={{ position: 'absolute', right: '12%', top: '3%', opacity: 0.3 + fanSpeedPct * 0.005 }}>
              <ArrowIcon dir="up" speed={fanSpeedPct} color="#f59e0b" />
            </div>
            <div style={{ position: 'absolute', right: '20%', top: '1%', opacity: 0.2 + fanSpeedPct * 0.005 }}>
              <ArrowIcon dir="upleft" speed={fanSpeedPct} color="#f59e0b" />
            </div>

            {/* ── Airflow direction lines ── */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 620 480">
              <line x1="60" y1="185" x2="180" y2="185" stroke={`rgba(0,212,170,${0.1 + fanSpeedPct * 0.002})`} strokeWidth="1.5" strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset" from="0" to="20" dur={`${2 - fanSpeedPct * 0.01}s`} repeatCount="indefinite" />
              </line>
              <line x1="60" y1="230" x2="200" y2="310" stroke={`rgba(0,212,170,${0.08 + fanSpeedPct * 0.002})`} strokeWidth="1" strokeDasharray="4,4">
                <animate attributeName="stroke-dashoffset" from="0" to="16" dur={`${2.5 - fanSpeedPct * 0.01}s`} repeatCount="indefinite" />
              </line>
              <line x1="530" y1="185" x2="590" y2="185" stroke={`rgba(239,68,68,${0.1 + fanSpeedPct * 0.002})`} strokeWidth="1.5" strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur={`${2 - fanSpeedPct * 0.01}s`} repeatCount="indefinite" />
              </line>
              <line x1="520" y1="250" x2="590" y2="250" stroke={`rgba(239,68,68,${0.08 + fanSpeedPct * 0.002})`} strokeWidth="1" strokeDasharray="4,4">
                <animate attributeName="stroke-dashoffset" from="0" to="-16" dur={`${2.5 - fanSpeedPct * 0.01}s`} repeatCount="indefinite" />
              </line>
              {/* Top airflow */}
              <path d="M 200 185 Q 350 120 530 185" fill="none" stroke={`rgba(245,158,11,${0.06 + fanSpeedPct * 0.002})`} strokeWidth="1" strokeDasharray="4,6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur={`${3 - fanSpeedPct * 0.01}s`} repeatCount="indefinite" />
              </path>
            </svg>

            {/* ── Component labels (non-temperature) ── */}
            {showLabels && (
              <>
                <div style={{ position: 'absolute', left: '38%', top: '14%', fontSize: 8, color: 'var(--text-muted, #5a5d72)', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {t.cpu}
                </div>
                <div style={{ position: 'absolute', left: '26%', top: '76%', fontSize: 8, color: 'var(--text-muted, #5a5d72)', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {t.gpu}
                </div>
              </>
            )}

            {/* ── Legend / cooler info top-right of case ── */}
            <div style={{
              position: 'absolute', top: 8, right: 12, display: 'flex', gap: 6, alignItems: 'center',
              fontSize: 9, color: 'var(--text-muted, #5a5d72)',
            }}>
              <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {coolerType === 'aio' ? t.aio : coolerType === 'custom' ? t.customLoop : t.airCooler}
              </span>
              <span style={{ padding: '2px 6px', borderRadius: 4, background: meshFront ? 'rgba(0,212,170,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${meshFront ? 'rgba(0,212,170,0.2)' : 'rgba(239,68,68,0.2)'}`, color: meshFront ? '#00d4aa' : '#ef4444' }}>
                {meshFront ? t.caseMesh : t.caseGlass}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Thermal Status Panel */}
        <div style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
          borderLeft: '1px solid var(--border-default, rgba(255,255,255,0.06))',
          background: 'var(--bg-surface, #0f1018)',
          overflowY: 'auto',
        }}>
          {/* Load Controls */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #5a5d72)' }}>
                {t.loadLabel}
              </span>
              <div style={{
                flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 1, background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
                  width: `${loadPct}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#00d4aa', minWidth: 36, textAlign: 'right' }}>
                {loadPct}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {loadOptions.map(opt => (
                <button key={opt.id} className={`load-btn ${loadLevel === opt.id ? 'active' : ''}`} onClick={() => setLoadLevel(opt.id)} style={{
                  flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                  border: `1px solid ${loadLevel === opt.id ? 'rgba(0,212,170,0.4)' : 'var(--border-default, rgba(255,255,255,0.06))'}`,
                  background: loadLevel === opt.id ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.02)',
                  color: loadLevel === opt.id ? '#00d4aa' : 'var(--text-muted, #5a5d72)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 14 }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            {loadLevel === 'custom' && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)' }}>0%</span>
                <input type="range" className="custom-slider" min="0" max="100" value={customLoad}
                  onChange={e => setCustomLoad(Number(e.target.value))} />
                <span style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)' }}>100%</span>
              </div>
            )}
          </div>

          {/* Temperature Details */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.06))' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #5a5d72)', marginBottom: 10 }}>
              {t.temp} (°C)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'cpu', label: t.cpu, temp: temps.cpu, profile: THERMAL_PROFILES.cpu, tdp: cpuTdp },
                { key: 'gpu', label: t.gpu, temp: temps.gpu, profile: THERMAL_PROFILES.gpu, tdp: gpuTdp },
                { key: 'psu', label: t.psu, temp: temps.psu, profile: THERMAL_PROFILES.psu, tdp: psuWattage },
                { key: 'ram', label: t.ram, temp: temps.ram, profile: THERMAL_PROFILES.ram, tdp: `${ramSticks * 8}GB` },
              ].map(item => {
                const col = tempColor(item.temp, item.profile.maxSafe);
                const status = item.temp >= item.profile.maxSafe + 10 ? t.critical : (item.temp >= item.profile.maxSafe ? t.warm : t.safe);
                const statusColor = item.temp >= item.profile.maxSafe + 10 ? '#ef4444' : (item.temp >= item.profile.maxSafe ? '#f59e0b' : '#22c55e');
                const fillRatio = clamp(item.temp / item.profile.critical, 0, 1);
                return (
                  <div key={item.key} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', borderRadius: 6,
                    background: status === 'CRITICAL' || status === 'NGUY HIỂM' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.015)',
                    animation: 'tempFadeIn 0.3s ease-out',
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                        <span className="temp-value" style={{ fontSize: 14, fontWeight: 800, color: col }}>{Math.round(item.temp)}°</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)' }}>
                          {item.tdp}{typeof item.tdp === 'number' ? 'W' : ''}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 600, color: statusColor }}>{status}</span>
                      </div>
                    </div>
                    {/* Mini thermometer bar */}
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                      <div className="thermometer-fill" style={{
                        position: 'absolute', bottom: 0, width: '100%',
                        height: `${fillRatio * 100}%`, borderRadius: 2,
                        background: col, transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thermal Status Stats */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.06))' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #5a5d72)', marginBottom: 10 }}>
              {t.title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/* System Avg */}
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 3 }}>{t.systemAvg}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: tempColor(avgTemp, 50) }}>{Math.round(avgTemp)}°</div>
              </div>
              {/* Hottest Component */}
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 3 }}>{t.hottest}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: tempColor(maxTemp, maxSafeTemp) }}>{hottestName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #5a5d72)', marginTop: 1 }}>{Math.round(maxTemp)}°C</div>
              </div>
              {/* Throttling */}
              <div style={{
                padding: '10px 12px', borderRadius: 8, gridColumn: '1 / -1',
                background: throttling ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.06)',
                border: `1px solid ${throttling ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{throttling ? '🔥' : '✅'}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: throttling ? '#ef4444' : '#22c55e' }}>
                    {throttling ? t.throttlingActive : t.throttlingOk}
                  </span>
                </div>
                {throttling && (
                  <div style={{ fontSize: 10, color: '#ef4444', lineHeight: 1.4 }}>
                    {temps.cpu > THERMAL_PROFILES.cpu.maxSafe ? `⚠ ${t.throttlingCpu}` : `⚠ ${t.throttlingGpu}`}
                  </div>
                )}
              </div>
            </div>

            {/* Fan Speed + Efficiency + Pressure in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 2 }}>{t.fanSpeed}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: `hsl(${120 - fanSpeedPct * 1.2}, 70%, 50%)` }}>{fanSpeedPct}%</div>
                <div style={{
                  marginTop: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
                    width: `${fanSpeedPct}%`, transition: 'width 0.4s',
                  }} />
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 2 }}>{t.efficiency}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: effScore > 70 ? '#22c55e' : effScore > 40 ? '#f59e0b' : '#ef4444' }}>{effScore}</div>
                <div style={{
                  marginTop: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)',
                    width: `${effScore}%`, transition: 'width 0.4s',
                  }} />
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 2 }}>{t.pressure}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: pressure > 0.3 ? '#22c55e' : pressure < -0.3 ? '#f59e0b' : '#3b82f6' }}>
                  {pressureStr}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)', marginTop: 2 }}>
                  {pressure > 0 ? '+' : pressure < 0 ? '-' : '±'}{Math.abs(pressure).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Cooling Recommendations */}
          <div style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #5a5d72)', marginBottom: 10 }}>
              {t.recommendation}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recs.map((rec, i) => (
                <div key={i} className="rec-card" style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: severityBg[rec.severity] || 'rgba(255,255,255,0.02)',
                  borderLeft: `3px solid ${severityColors[rec.severity] || '#333'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: severityColors[rec.severity] || '#333',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{rec.label}</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)', lineHeight: 1.4, margin: 0 }}>{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
