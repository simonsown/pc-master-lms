'use client';

import { useState, useRef, useCallback, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

const PART_COLORS = {
  CPU: '#00d4aa',
  GPU: '#ef4444',
  RAM: '#6366f1',
  SSD: '#22c55e',
  PSU: '#f59e0b',
  MAINBOARD: '#8b5cf6'
};

const BRAND_COLORS = {
  kingston: '#0096d6',
  corsair: '#ff4400',
  gskill: '#00aa00',
  teamgroup: '#00aaff',
  crucial: '#0055aa'
};

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: 200,
      flexDirection: 'column',
      gap: 12
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid var(--border-default, #333)',
        borderTopColor: 'var(--accent, #00d4aa)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 12, color: 'var(--text-muted, #888)' }}>Loading 3D preview...</span>
    </div>
  );
}

function ErrorFallback({ componentType, model }) {
  const color = PART_COLORS[componentType] || '#666';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: 200,
      flexDirection: 'column',
      gap: 8,
      background: 'var(--bg-elevated, #111)',
      borderRadius: 12,
      border: `1px solid ${color}30`,
      padding: 16
    }}>
      <svg viewBox="0 0 200 200" width="140" height="140">
        <rect x="25" y="25" width="150" height="150" rx="6" fill="#1a1a2e" stroke={color} strokeWidth="2" />
        <rect x="35" y="35" width="130" height="130" rx="4" fill="#2d2d44" stroke={color} strokeWidth="1" opacity="0.5" />
        <text x="100" y="100" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold" fontFamily="monospace">{componentType}</text>
        <text x="100" y="120" textAnchor="middle" fill="#666" fontSize="8" fontFamily="monospace">{model?.name || ''}</text>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>3D unavailable - showing 2D preview</span>
    </div>
  );
}

/* ---- CPU 3D Model ---- */
function CPUModel({ brand, socket = 'LGA1700', isHovered }) {
  const groupRef = useRef();
  const socketLabel = brand === 'AMD' ? 'AM5' : 'LGA1700';
  const pinPositions = [];
  for (let x = -0.75; x <= 0.75; x += 0.25) {
    for (let z = -0.75; z <= 0.75; z += 0.25) {
      pinPositions.push([x, z]);
    }
  }
  const capPositions = [];
  for (let x = -0.82; x <= 0.82; x += 0.82) {
    for (let z = -0.82; z <= 0.82; z += 0.82) {
      if (x !== 0 || z !== 0) capPositions.push([x, z]);
    }
  }

  return (
    <group ref={groupRef} scale={isHovered ? 1.05 : 1}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.6, 0.08, 1.6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.7, 0.02, 1.7]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {pinPositions.map(([x, z]) => (
        <mesh key={`pin-${x}-${z}`} position={[x, -0.12, z]}>
          <cylinderGeometry args={[0.025, 0.035, 0.06, 6]} />
          <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.8, 0.25, 0.8]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.01, 0.08]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.12}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {socketLabel}
      </Text>
      {capPositions.map(([x, z]) => (
        <mesh key={`cap-${x}-${z}`} position={[x, 0.22, z]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#888" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- GPU 3D Model ---- */
function GPUModel({ isHovered }) {
  const fanRef1 = useRef();
  const fanRef2 = useRef();
  const fanRef3 = useRef();

  useEffect(() => {
    let running = true;
    function animate() {
      if (!running) return;
      if (fanRef1.current) fanRef1.current.rotation.y += 0.02;
      if (fanRef2.current) fanRef2.current.rotation.y += 0.02;
      if (fanRef3.current) fanRef3.current.rotation.y += 0.02;
      requestAnimationFrame(animate);
    }
    const raf = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, []);

  function FanGroup({ pos, radius, fanRef }) {
    const blades = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      blades.push(
        <mesh
          key={i}
          position={[Math.sin(angle) * radius * 0.5, 0, Math.cos(angle) * radius * 0.5]}
          rotation={[0, -angle, Math.PI / 6]}
        >
          <boxGeometry args={[0.06, 0.01, 0.2]} />
          <meshStandardMaterial color="#555" transparent opacity={0.85} />
        </mesh>
      );
    }
    return (
      <group position={pos}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <group ref={fanRef}>
          {blades}
        </group>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[radius, 0.015, 8, 24]} />
          <meshStandardMaterial color="#444" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  const finPositions = [-0.6, -0.2, 0.2, 0.6];
  const pciePinPositions = [];
  for (let i = 0; i < 12; i++) pciePinPositions.push((i - 6) * 0.09);

  return (
    <group scale={isHovered ? 1.03 : 1}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 0.06, 1.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[2.7, 0.01, 1.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {finPositions.map((x) => (
        <mesh key={`fin-${x}`} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.04, 0.15, 0.9]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.0, 0.03, 0.8]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      <FanGroup pos={[-0.7, 0.18, 0]} radius={0.28} fanRef={fanRef1} />
      <FanGroup pos={[0, 0.18, 0]} radius={0.28} fanRef={fanRef2} />
      <FanGroup pos={[0.7, 0.18, 0]} radius={0.28} fanRef={fanRef3} />
      <mesh position={[0.5, -0.06, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.08]} />
        <meshStandardMaterial color="#b8860b" metalness={0.5} roughness={0.4} />
      </mesh>
      {pciePinPositions.map((offset, i) => (
        <mesh key={`pciepin-${i}`} position={[0.5 + offset, -0.08, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.06]} />
          <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[1.25, 0.04, 0]}>
        <boxGeometry args={[0.12, 0.025, 0.14]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.3, 0.005, 0.3]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

/* ---- RAM 3D Model ---- */
function RAMModel({ brand, isHovered }) {
  const heatspreaderColor = BRAND_COLORS[brand?.toLowerCase()] || '#0096d6';
  const finPositions = [];
  for (let i = 0; i < 8; i++) finPositions.push(0.05 + i * 0.065);
  const goldPinPositions = [];
  for (let i = 0; i < 10; i++) goldPinPositions.push((i - 4.5) * 0.01);
  const chipPositions = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 4; i++) {
      chipPositions.push({ x: side === 0 ? -0.035 : 0.035, y: 0.32 + i * 0.07 });
    }
  }

  return (
    <group scale={isHovered ? 1.05 : 1}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.025]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.075, 0.15, 0]}>
        <boxGeometry args={[0.025, 0.55, 0.04]} />
        <meshStandardMaterial color={heatspreaderColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.075, 0.15, 0]}>
        <boxGeometry args={[0.025, 0.55, 0.04]} />
        <meshStandardMaterial color={heatspreaderColor} metalness={0.4} roughness={0.4} />
      </mesh>
      {finPositions.map((y, i) => (
        <mesh key={`finl-${i}`} position={[-0.09, y, 0]}>
          <boxGeometry args={[0.012, 0.04, 0.045]} />
          <meshStandardMaterial color={heatspreaderColor} metalness={0.3} roughness={0.5} opacity={0.7} transparent />
        </mesh>
      ))}
      {finPositions.map((y, i) => (
        <mesh key={`finr-${i}`} position={[0.09, y, 0]}>
          <boxGeometry args={[0.012, 0.04, 0.045]} />
          <meshStandardMaterial color={heatspreaderColor} metalness={0.3} roughness={0.5} opacity={0.7} transparent />
        </mesh>
      ))}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.11, 0.08, 0.018]} />
        <meshStandardMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
      </mesh>
      {goldPinPositions.map((offset, i) => (
        <mesh key={`goldpin-${i}`} position={[offset, -0.2, 0]}>
          <boxGeometry args={[0.006, 0.06, 0.016]} />
          <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {chipPositions.map((p, i) => (
        <mesh key={`chip-${i}`} position={[p.x, p.y, 0]}>
          <boxGeometry args={[0.025, 0.025, 0.02]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 0.018]}>
        <boxGeometry args={[0.06, 0.06, 0.002]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---- SSD 3D Model ---- */
function SSDModel({ isHovered }) {
  const nandPositions = [-0.5, 0.2, 0.55];
  const m2pinPositions = [];
  for (let i = 0; i < 8; i++) m2pinPositions.push((i - 3.5) * 0.028);

  return (
    <group rotation={[0, 0, 0]} scale={isHovered ? 1.05 : 1}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.015, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      <mesh position={[-0.15, 0.015, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      {nandPositions.map((x) => (
        <mesh key={`nand-${x}`} position={[x, 0.015, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.16]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[-0.15, 0.025, 0]}>
        <boxGeometry args={[0.12, 0.005, 0.08]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.85, 0, 0]}>
        <boxGeometry args={[0.04, 0.012, 0.24]} />
        <meshStandardMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
      </mesh>
      {m2pinPositions.map((offset, i) => (
        <mesh key={`m2pin-${i}`} position={[0.87, 0, offset]}>
          <boxGeometry args={[0.025, 0.01, 0.02]} />
          <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[-0.75, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial color="#666" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.018, 0.08]}>
        <boxGeometry args={[0.3, 0.003, 0.01]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <Text
        position={[0.1, 0.022, 0.11]}
        fontSize={0.04}
        color="#555"
        anchorX="center"
        anchorY="middle"
      >
        M.2 NVMe
      </Text>
    </group>
  );
}

/* ---- PSU 3D Model ---- */
function PSUModel({ isHovered }) {
  const fanBladesRef = useRef();

  useEffect(() => {
    let running = true;
    function animate() {
      if (!running) return;
      if (fanBladesRef.current) fanBladesRef.current.rotation.y += 0.01;
      requestAnimationFrame(animate);
    }
    const raf = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, []);

  const ventPositions = [];
  for (let i = 0; i < 8; i++) ventPositions.push(-0.8 + i * 0.22);

  const screwPositions = [
    [-0.95, 0.25, 0.65],
    [-0.95, -0.25, 0.65],
    [-0.95, 0.25, -0.65],
    [-0.95, -0.25, -0.65]
  ];

  const fanBladePositions = [];
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    fanBladePositions.push({
      x: Math.sin(angle) * 0.18,
      z: Math.cos(angle) * 0.18,
      angle
    });
  }

  const connPinPositions = [];
  for (let i = 0; i < 6; i++) connPinPositions.push(-0.1 + i * 0.06);

  return (
    <group scale={isHovered ? 1.03 : 1}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.6, 1.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.18, 0.02, 1.38]} />
        <meshStandardMaterial color="#333" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0.72]}>
        <boxGeometry args={[0.6, 0.15, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <Text
        position={[0, 0.2, 0.74]}
        fontSize={0.06}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        PSU
      </Text>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.35, 0.015, 8, 24]} />
        <meshStandardMaterial color="#111" metalness={0.2} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={`grill-${i}`} position={[0, 0.33, 0]} rotation={[0, 0, (Math.PI / 2) * i]}>
          <boxGeometry args={[0.65, 0.008, 0.008]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <group ref={fanBladesRef} position={[0, 0.32, 0]}>
        {fanBladePositions.map((p, i) => (
          <mesh key={i} position={[p.x, 0, p.z]} rotation={[0, -p.angle, 0.3]}>
            <boxGeometry args={[0.04, 0.005, 0.15]} />
            <meshStandardMaterial color="#444" transparent opacity={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      <mesh position={[1.12, 0.1, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {connPinPositions.map((y, i) => (
        <mesh key={`connpin-${i}`} position={[1.14, y, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 6]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      {ventPositions.map((x, i) => (
        <mesh key={`vent-${i}`} position={[x, 0, 0.72]}>
          <boxGeometry args={[0.12, 0.01, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {screwPositions.map((pos, i) => (
        <mesh key={`screw-${i}`} position={pos}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
          <meshStandardMaterial color="#666" metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[1.12, 0.25, 0.12]}>
        <boxGeometry args={[0.02, 0.04, 0.025]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

/* ---- Mainboard 3D Model ---- */
function MainboardModel({ isHovered }) {
  const socketHolePositions = [];
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      socketHolePositions.push({ x: -0.25 + x * 0.125, z: 0.2 + z * 0.125 });
    }
  }

  const mountPositions = [
    [-1.4, -1.1],
    [-1.4, 1.1],
    [1.4, -1.1],
    [1.4, 1.1],
    [0, -1.1],
    [0, 1.1]
  ];

  const ioPortPositions = [];
  for (let i = 0; i < 4; i++) ioPortPositions.push(0.4 + i * 0.1);

  const sataPositions = [];
  for (let i = 0; i < 4; i++) sataPositions.push(-0.85 + i * 0.1);

  const capClusterPositions = [];
  for (let i = 0; i < 3; i++) capClusterPositions.push(-0.1 + i * 0.08);

  return (
    <group scale={isHovered ? 1.02 : 1}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.0, 0.02, 2.4]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[2.9, 0.005, 2.3]} />
        <meshStandardMaterial color="#1e4a1e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.03, 0.3]}>
        <boxGeometry args={[0.7, 0.015, 0.7]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.5} />
      </mesh>
      {socketHolePositions.map((p, i) => (
        <mesh key={`sockhole-${i}`} position={[p.x, 0.04, p.z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      <mesh position={[0.38, 0.04, 0.3]}>
        <boxGeometry args={[0.04, 0.005, 0.1]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <Text
        position={[0, 0.05, 0.75]}
        fontSize={0.08}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        CPU
      </Text>
      {[0, 1].map((i) => (
        <mesh key={`ramslot-l${i}`} position={[-0.75 - i * 0.07, 0.03, 0.5]}>
          <boxGeometry args={[0.05, 0.015, 0.35]} />
          <meshStandardMaterial color="#333" roughness={0.7} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`ramslot-r${i}`} position={[0.75 + i * 0.07, 0.03, 0.5]}>
          <boxGeometry args={[0.05, 0.015, 0.35]} />
          <meshStandardMaterial color="#333" roughness={0.7} />
        </mesh>
      ))}
      <Text
        position={[-0.75, 0.05, 0.7]}
        fontSize={0.05}
        color="#aaa"
        anchorX="center"
        anchorY="middle"
      >
        RAM1
      </Text>
      <Text
        position={[0.75, 0.05, 0.7]}
        fontSize={0.05}
        color="#aaa"
        anchorX="center"
        anchorY="middle"
      >
        RAM2
      </Text>
      {[0, 1, 2].map((i) => (
        <mesh key={`pcie-${i}`} position={[0, 0.03, -0.4 - i * 0.25]}>
          <boxGeometry args={[1.2, 0.012, 0.06]} />
          <meshStandardMaterial color="#444" roughness={0.6} />
        </mesh>
      ))}
      <Text
        position={[0, 0.05, -0.4]}
        fontSize={0.05}
        color="#aaa"
        anchorX="center"
        anchorY="middle"
      >
        PCIE
      </Text>
      <mesh position={[-0.2, 0.03, -0.7]}>
        <boxGeometry args={[0.25, 0.025, 0.25]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, 0.04, -0.7]}>
        <boxGeometry args={[0.15, 0.005, 0.15]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[1.52, 0.02, 0.6]}>
        <boxGeometry args={[0.02, 0.015, 0.5]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.4} roughness={0.5} />
      </mesh>
      {ioPortPositions.map((z, i) => (
        <mesh key={`ioport-${i}`} position={[1.55, 0.025, z]}>
          <boxGeometry args={[0.01, 0.01, 0.06]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      {sataPositions.map((z, i) => (
        <mesh key={`sata-${i}`} position={[1.3, 0.025, z]}>
          <boxGeometry args={[0.04, 0.015, 0.02]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
      <mesh position={[-0.5, 0.025, -0.1]}>
        <boxGeometry args={[0.5, 0.008, 0.03]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {capClusterPositions.map((x, i) => (
        <mesh key={`capclust-${i}`} position={[x, 0.025, 0.3]}>
          <cylinderGeometry args={[0.025, 0.025, 0.015, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      ))}
      <mesh position={[1.4, 0.025, -0.1]}>
        <boxGeometry args={[0.02, 0.015, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {mountPositions.map(([x, z], i) => (
        <mesh key={`mount-${i}`} position={[x, 0, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 8]} />
          <meshStandardMaterial color="#888" metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.5, 0.035, 0.95]}>
        <boxGeometry args={[0.3, 0.025, 0.1]} />
        <meshStandardMaterial color="#999" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ---- Model Selector ---- */
function ModelSelector({ componentType, brand, socket, isHovered }) {
  switch (componentType) {
    case 'CPU':
      return <CPUModel brand={brand} socket={socket} isHovered={isHovered} />;
    case 'GPU':
      return <GPUModel isHovered={isHovered} />;
    case 'RAM':
      return <RAMModel brand={brand} isHovered={isHovered} />;
    case 'SSD':
      return <SSDModel isHovered={isHovered} />;
    case 'PSU':
      return <PSUModel isHovered={isHovered} />;
    case 'MAINBOARD':
      return <MainboardModel isHovered={isHovered} />;
    default:
      return null;
  }
}

/* ---- Scene ---- */
function Scene({ componentType, brand, socket, onReady, isHovered, setHovered }) {
  const controlsRef = useRef();
  const [interacted, setInteracted] = useState(false);

  const handlePointerDown = useCallback(() => {
    setInteracted(true);
  }, []);

  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.3} />
      <pointLight position={[0, -2, 2]} intensity={0.15} color="#4488ff" />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={!interacted}
        autoRotateSpeed={2.0}
        minDistance={0.5}
        maxDistance={5.0}
        onPointerDown={handlePointerDown}
      />
      <gridHelper args={[6, 12, '#333', '#222']} position={[0, -0.5, 0]} opacity={0.3} transparent />
      <group
        position={[0, 0, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <Suspense fallback={null}>
          <ModelSelector componentType={componentType} brand={brand} socket={socket} isHovered={isHovered} />
        </Suspense>
      </group>
      {isHovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={PART_COLORS[componentType] || '#00d4aa'}
            transparent
            opacity={0.08}
          />
        </mesh>
      )}
    </>
  );
}

/* ---- Main 3D Canvas ---- */
function ComponentPreview3DCanvas({ componentType, brand, socket, onReady }) {
  const [isHovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(() => {
    setClicked((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: 'inherit',
        overflow: 'hidden'
      }}
    >
      <Canvas
        camera={{ position: [2, 1.5, 2.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
      >
        <Scene
          componentType={componentType}
          brand={brand}
          socket={socket}
          onReady={onReady}
          isHovered={isHovered}
          setHovered={setHovered}
        />
      </Canvas>
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
      {clicked && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: PART_COLORS[componentType] || '#fff',
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'monospace',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)'
        }}>
          {componentType} {brand ? `\u00b7 ${brand}` : ''}
        </div>
      )}
    </div>
  );
}

/* ---- Dynamic import wrapper for SSR ---- */
const DynamicComponentPreview3D = dynamic(
  () => Promise.resolve({ default: ComponentPreview3DCanvas }),
  { ssr: false }
);

/* ---- Exported default wrapper ---- */
export default function ComponentPreview3D({
  componentType = 'CPU',
  componentId,
  brand,
  model,
  style,
  onReady
}) {
  const color = PART_COLORS[componentType] || '#666';

  return (
    <div style={{
      background: 'var(--bg-surface, #111)',
      border: `1px solid ${color}30`,
      borderRadius: 12,
      overflow: 'hidden',
      width: style?.width || 300,
      height: style?.height || 300,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicComponentPreview3D
          componentType={componentType}
          brand={brand || model?.brand}
          socket={model?.socket}
          onReady={onReady}
        />
      </Suspense>
    </div>
  );
}

export { PART_COLORS, ErrorFallback, LoadingSpinner, DynamicComponentPreview3D, CPUModel, GPUModel, RAMModel, SSDModel, PSUModel, MainboardModel };
