'use client';

const PART_COLORS = {
  CPU: '#00d4aa', GPU: '#ef4444', RAM: '#6366f1',
  SSD: '#22c55e', PSU: '#f59e0b', COOLER: '#06b6d4', Mainboard: '#8b5cf6'
};

function CPUPreview({ model }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ maxWidth: 180 }}>
      <rect x="25" y="25" width="150" height="150" rx="6" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
      <rect x="35" y="35" width="130" height="130" rx="4" fill="#2d2d44" stroke="#444" strokeWidth="1" />
      <rect x="50" y="50" width="100" height="100" rx="3" fill="#3a3a5c" />
      <text x="100" y="95" textAnchor="middle" fill="#00d4aa" fontSize="11" fontWeight="bold" fontFamily="monospace">CPU</text>
      <text x="100" y="112" textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">{model?.socket || ''}</text>
      <rect x="45" y="155" width="110" height="4" rx="2" fill="#d4a017" opacity="0.7" />
      {[0,1,2,3].map(i => (
        <circle key={i} cx={60+i*28} cy={20} r="3" fill="#d4a017" opacity="0.5" />
      ))}
      {[0,1,2,3].map(i => (
        <circle key={i+4} cx={60+i*28} cy={180} r="3" fill="#d4a017" opacity="0.5" />
      ))}
      <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.power || 0}W</text>
    </svg>
  );
}

function GPUPreview({ model }) {
  return (
    <svg viewBox="0 0 280 160" width="100%" height="100%" style={{ maxWidth: 260 }}>
      <rect x="10" y="30" width="260" height="100" rx="8" fill="#2d1b1b" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="20" y="40" width="240" height="80" rx="6" fill="#1a0f0f" />
      <rect x="40" y="55" width="60" height="50" rx="4" fill="#2d1b1b" stroke="#ef4444" strokeWidth="1" />
      <rect x="110" y="55" width="60" height="50" rx="4" fill="#2d1b1b" stroke="#ef4444" strokeWidth="1" />
      <rect x="180" y="55" width="50" height="50" rx="4" fill="#2d1b1b" stroke="#ef4444" strokeWidth="1" />
      <text x="70" y="83" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">FAN</text>
      <text x="140" y="83" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">FAN</text>
      <text x="205" y="83" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">FAN</text>
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1={22+i*44} y1="130" x2={22+i*44} y2="145" stroke="#d4a017" strokeWidth="2" opacity="0.6" />
      ))}
      <rect x="10" y="145" width="30" height="8" rx="2" fill="#d4a017" opacity="0.4" />
      <text x="140" y="155" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.power || 0}W</text>
    </svg>
  );
}

function RAMPreview({ model }) {
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" style={{ maxWidth: 140 }}>
      <rect x="20" y="15" width="120" height="180" rx="4" fill="#1a1a3e" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="30" y="25" width="100" height="160" rx="3" fill="#252550" />
      {[0,1,2,3].map(i => (
        <rect key={i} x={35+i*24} y="35" width="18" height="40" rx="2" fill="#2d2d60" stroke="#6366f1" strokeWidth="0.5" opacity="0.6" />
      ))}
      <text x="80" y="100" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold" fontFamily="monospace">DDR4</text>
      <text x="80" y="115" textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">{model?.ramType || ''}</text>
      <rect x="30" y="185" width="100" height="12" rx="2" fill="#d4a017" opacity="0.6" />
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={38+i*22} y="187" width="10" height="8" rx="1" fill="#b8860b" opacity="0.8" />
      ))}
      <text x="80" y="212" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.power || 0}W</text>
    </svg>
  );
}

function SSDPreview({ model }) {
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" style={{ maxWidth: 180 }}>
      <rect x="15" y="20" width="170" height="80" rx="6" fill="#0d2818" stroke="#22c55e" strokeWidth="1.5" />
      <rect x="25" y="30" width="150" height="60" rx="4" fill="#143d22" />
      <rect x="35" y="40" width="60" height="40" rx="3" fill="#1a5c30" stroke="#22c55e" strokeWidth="0.5" opacity="0.5" />
      <rect x="105" y="40" width="50" height="40" rx="3" fill="#1a5c30" stroke="#22c55e" strokeWidth="0.5" opacity="0.5" />
      <text x="135" y="63" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="monospace">SSD</text>
      <rect x="15" y="45" width="8" height="30" rx="2" fill="#d4a017" opacity="0.7" />
      <text x="100" y="110" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">M.2 NVMe</text>
    </svg>
  );
}

function PSUPreview({ model }) {
  return (
    <svg viewBox="0 0 220 180" width="100%" height="100%" style={{ maxWidth: 200 }}>
      <rect x="15" y="20" width="190" height="140" rx="6" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="25" y="30" width="170" height="120" rx="4" fill="#2a2a2a" />
      <circle cx="110" cy="75" r="30" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="1" />
      <circle cx="110" cy="75" r="20" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
      <text x="110" y="79" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">FAN</text>
      {[0,1,2,3].map(i => (
        <line key={i} x1={30} y1={120+i*8} x2={38} y2={120+i*8} stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
      ))}
      {[0,1,2,3].map(i => (
        <line key={i} x1={182} y1={120+i*8} x2={190} y2={120+i*8} stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
      ))}
      <text x="110" y="150" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.power || 0}W</text>
    </svg>
  );
}

function COOLERPreview({ model }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ maxWidth: 180 }}>
      <rect x="40" y="20" width="120" height="160" rx="6" fill="#1a2a3a" stroke="#06b6d4" strokeWidth="1.5" />
      <rect x="50" y="30" width="100" height="140" rx="4" fill="#1e3347" />
      {[0,1,2,3,4].map(i => (
        <rect key={i} x="55" y={35+i*26} width="90" height="16" rx="2" fill="#254458" stroke="#06b6d4" strokeWidth="0.3" opacity="0.5" />
      ))}
      <rect x="65" y="70" width="70" height="60" rx="4" fill="#1a2a3a" stroke="#06b6d4" strokeWidth="1" />
      <text x="100" y="103" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="monospace">FAN</text>
      {[0,1,2].map(i => (
        <line key={i} x1={70+i*12} y1={55} x2={70+i*12} y2={65} stroke="#06b6d4" strokeWidth="0.5" opacity="0.4" />
      ))}
      <text x="100" y="145" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.power || 0}W</text>
    </svg>
  );
}

function MainboardPreview({ model }) {
  return (
    <svg viewBox="0 0 260 240" width="100%" height="100%" style={{ maxWidth: 240 }}>
      <rect x="10" y="10" width="240" height="220" rx="8" fill="#1a2f4a" stroke="#8b5cf6" strokeWidth="1.5" />
      <rect x="20" y="20" width="220" height="200" rx="5" fill="#1e3a5f" />
      {/* CPU socket */}
      <rect x="80" y="60" width="100" height="80" rx="4" fill="#2a4a6f" stroke="#8b5cf6" strokeWidth="1" />
      <text x="130" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="bold" fontFamily="monospace">CPU</text>
      {/* RAM slots */}
      {[0,1].map(i => (
        <rect key={i} x={35+i*20} y="160" width="15" height="30" rx="2" fill="#2a4a6f" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.7" />
      ))}
      {[0,1].map(i => (
        <rect key={i} x={210+i*20} y="160" width="15" height="30" rx="2" fill="#2a4a6f" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.7" />
      ))}
      {/* PCIe slots */}
      <rect x="60" y="150" width="60" height="6" rx="1" fill="#2a4a6f" opacity="0.5" />
      <rect x="60" y="165" width="60" height="6" rx="1" fill="#2a4a6f" opacity="0.5" />
      {/* I/O ports */}
      <rect x="20" y="15" width="60" height="12" rx="2" fill="#2a4a6f" opacity="0.4" />
      {[0,1,2,3].map(i => (
        <rect key={i} x={22+i*14} y="17" width="12" height="8" rx="1" fill="#4a6a8f" opacity="0.3" />
      ))}
      <text x="130" y="228" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">{model?.socket || ''}</text>
    </svg>
  );
}

const PREVIEWS = {
  CPU: CPUPreview,
  GPU: GPUPreview,
  RAM: RAMPreview,
  SSD: SSDPreview,
  PSU: PSUPreview,
  COOLER: COOLERPreview,
  Mainboard: MainboardPreview
};

export default function ComponentPreview({ type, model, size = 'normal' }) {
  const Preview = PREVIEWS[type];
  if (!Preview) return null;
  const color = PART_COLORS[type] || '#666';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: `1px solid ${color}30`,
      borderRadius: '12px',
      padding: size === 'large' ? '24px' : '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      width: size === 'large' ? '100%' : 'auto'
    }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Preview model={model} />
      </div>
      {model && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</div>
          <div style={{ fontSize: '11px', color: color, fontWeight: 600 }}>{type} · {(model.price || 0).toLocaleString()}đ</div>
          {model.desc && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{model.desc}</div>}
        </div>
      )}
      {!model && (
        <div style={{ fontSize: '12px', fontWeight: 600, color: color }}>{type}</div>
      )}
    </div>
  );
}
