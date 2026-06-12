'use client';

import { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  CPUModel, GPUModel, RAMModel, SSDModel, PSUModel, MainboardModel,
} from './ComponentPreview3D';

const MODEL_POSITIONS = {
  MAINBOARD: { pos: [0, 0, 0], scale: 1 },
  CPU: { pos: [0, 0.18, 0.30], scale: 1 },
  COOLER: { pos: [0, 0.55, 0.30], scale: 0.8 },
  RAM_LEFT: { pos: [-0.75, 0.12, 0.50], scale: 1 },
  RAM_RIGHT: { pos: [0.75, 0.12, 0.50], scale: 1 },
  GPU: { pos: [0, 0.12, -0.40], scale: 1 },
  PSU: { pos: [1.50, -0.15, 1.00], scale: 1 },
  SSD: { pos: [-0.20, 0.05, -0.70], scale: 1 },
};

const HOTSPOTS = {
  MAINBOARD: [
    { id: 'cpu-socket', label: 'CPU Socket', pos: [0, 0.04, 0.30], desc: 'Khe cắm CPU — LGA1700/AM5, nơi đặt bộ vi xử lý. Chân cắm mạ vàng chịu dòng cao.', related: ['CPU', 'Cooler'], brands: 'ASUS, Gigabyte, MSI, ASRock', color: '#00d4aa' },
    { id: 'ram-slot-l', label: 'RAM Slot A', pos: [-0.75, 0.04, 0.50], desc: 'Khe RAM DDR5/DDR4 — Kênh A. Ưu tiên lắp ở khe A2 và B2 để chạy Dual Channel.', related: ['RAM'], brands: 'Corsair, G.Skill, Kingston, TeamGroup', color: '#22c55e' },
    { id: 'ram-slot-r', label: 'RAM Slot B', pos: [0.75, 0.04, 0.50], desc: 'Khe RAM DDR5/DDR4 — Kênh B. Kết hợp A2 tạo Dual Channel tăng băng thông gấp đôi.', related: ['RAM'], brands: 'Corsair, G.Skill, Kingston', color: '#22c55e' },
    { id: 'pcie-slot', label: 'PCIe x16', pos: [0, 0.04, -0.40], desc: 'Khe PCIe 5.0 x16 — Dành cho GPU. Băng thông 32 GB/s. Có khóa ngàm giữ card.', related: ['GPU'], brands: '—', color: '#ef4444' },
    { id: 'm2-slot', label: 'M.2 Slot', pos: [-0.20, 0.04, -0.70], desc: 'Khe M.2 NVMe/SATA — Gắn SSD tốc độ cao. PCIe 4.0 đạt 7000 MB/s.', related: ['SSD'], brands: 'Samsung, WD, Crucial', color: '#06b6d4' },
    { id: 'sata-ports', label: 'SATA Port', pos: [1.25, 0.04, 0.60], desc: 'Cổng SATA III 6Gbps — Kết nối HDD, SSD SATA, ổ quang. Có thể dùng SSD M.2 SATA.', related: ['SSD', 'HDD'], brands: '—', color: '#f59e0b' },
    { id: 'io-ports', label: 'I/O Ports', pos: [1.55, 0.04, 0.20], desc: 'Cổng kết nối mặt sau — USB 3.2, HDMI, 2.5G LAN, WiFi 6E, Audio 7.1.', related: ['Monitor', 'Keyboard', 'Mouse'], brands: '—', color: '#8b5cf6' },
  ],
  CPU: [
    { id: 'cpu-ihs', label: 'IHS', pos: [0, 0.25, 0.30], desc: 'Heat Spreader — Tản nhiệt trên CPU, phân tán nhiệt từ chip sang cooler. Chất liệu niken hoặc indium.', related: ['Cooler', 'Mainboard'], brands: 'Intel, AMD', color: '#94a3b8' },
    { id: 'cpu-pins', label: 'Chân CPU', pos: [0, 0.10, 0.30], desc: 'LGA (Intel) hoặc PGA (AMD) — kết nối CPU với mainboard. LGA1700: 1700 chân, AM5: 1718 chân.', related: ['Mainboard'], brands: 'Intel, AMD', color: '#eab308' },
  ],
  GPU: [
    { id: 'gpu-pcie', label: 'PCIe Connector', pos: [0.50, 0.10, -0.40], desc: 'Đầu cắm PCIe x16 — Kết nối GPU với mainboard. Có khóa giữ. Gold-plated contacts.', related: ['Mainboard'], brands: 'NVIDIA, AMD, Intel', color: '#eab308' },
    { id: 'gpu-power', label: 'Power Connector', pos: [1.25, 0.10, -0.40], desc: 'Đầu nguồn 6+2 pin hoặc 12VHPWR — Cấp nguồn cho GPU. RTX 4090 cần 450W+.', related: ['PSU'], brands: '—', color: '#ef4444' },
    { id: 'gpu-fan', label: 'Fan GPU', pos: [0, 0.22, -0.40], desc: 'Quạt tản nhiệt — Axial fans làm mát VRAM, lõi GPU. Có chế độ idle stop.', related: ['Cooler'], brands: '—', color: '#3b82f6' },
    { id: 'gpu-vram', label: 'VRAM', pos: [0.80, 0.08, -0.40], desc: 'Bộ nhớ GDDR6/GDDR7 — Lưu texture, frame buffer. Dung lượng 6-24GB.', related: ['GPU'], brands: 'Samsung, Micron, SK Hynix', color: '#22c55e' },
  ],
  RAM: [
    { id: 'ram-heatspreader', label: 'Heatspreader', pos: [-0.75, 0.30, 0.50], desc: 'Tản nhiệt nhôm — Tỏa nhiệt cho chip RAM. Có thể tích hợp RGB LED.', related: ['RAM'], brands: 'Corsair Dominator, G.Skill Trident', color: '#6366f1' },
    { id: 'ram-pins', label: 'Gold Pins', pos: [-0.75, 0.02, 0.50], desc: 'Chân cắm mạ vàng — 288 chân (DDR4/DDR5). Anti-bending design.', related: ['Mainboard'], brands: '—', color: '#eab308' },
  ],
  PSU: [
    { id: 'psu-24pin', label: '24-pin ATX', pos: [1.90, -0.10, 1.30], desc: 'Đầu nguồn chính 24-pin — Cấp nguồn +3.3V, +5V, +12V cho mainboard. Dây dày nhất.', related: ['Mainboard'], brands: 'Corsair, Seasonic, EVGA', color: '#d4a030' },
    { id: 'psu-cpu8', label: 'CPU 8-pin EPS', pos: [1.90, 0.05, 1.20], desc: 'Đầu nguồn CPU 8-pin EPS12V — Cấp nguồn riêng +12V cho CPU. Cao cấp có 2 đầu.', related: ['CPU', 'Mainboard'], brands: '—', color: '#94a3b8' },
    { id: 'psu-pcie', label: 'PCIe 6+2 pin', pos: [1.90, 0.15, 1.10], desc: 'Đầu nguồn PCIe — Cấp nguồn GPU. 6+2 pin linh hoạt cho mọi card đồ họa.', related: ['GPU'], brands: '—', color: '#ef4444' },
    { id: 'psu-sata', label: 'SATA Power', pos: [1.90, 0.25, 1.00], desc: 'Đầu nguồn SATA 15-pin — Cấp nguồn cho ổ cứng/SSD SATA, hub fan, RGB controller.', related: ['SSD'], brands: '—', color: '#cc8800' },
  ],
  SSD: [
    { id: 'ssd-nand', label: 'NAND Flash', pos: [-0.20, 0.06, -0.65], desc: 'Chip nhớ NAND — Lưu trữ dữ liệu. Loại TLC (3-bit) phổ biến, QLC (4-bit) rẻ hơn.', related: ['SSD'], brands: 'Samsung, Micron, Kioxia', color: '#06b6d4' },
    { id: 'ssd-controller', label: 'Controller', pos: [-0.40, 0.06, -0.72], desc: 'Bộ điều khiển SSD — Quản lý đọc/ghi, wear leveling, garbage collection.', related: ['SSD'], brands: 'Phison, Samsung, Silicon Motion', color: '#f59e0b' },
    { id: 'ssd-m2', label: 'M.2 Connector', pos: [0.85, 0.04, -0.70], desc: 'Đầu cắm M.2 Key M — Kết nối SSD với mainboard qua PCIe 4.0 x4 (7000 MB/s).', related: ['Mainboard'], brands: '—', color: '#eab308' },
  ],
};

const CONNECTION_RULES = [
  { from: 'CPU', fromPort: 'CPU Socket', to: 'Mainboard', toPort: 'CPU Socket', cable: null, desc: 'CPU gắn trực tiếp lên socket mainboard' },
  { from: 'CPU', fromPort: 'IHS', to: 'Cooler', toPort: 'Base', cable: null, desc: 'Cooler gắn trên IHS với thermal paste' },
  { from: 'RAM', fromPort: 'Gold Pins', to: 'Mainboard', toPort: 'RAM Slot', cable: null, desc: 'RAM cắm thẳng vào khe DIMM' },
  { from: 'GPU', fromPort: 'PCIe Connector', to: 'Mainboard', toPort: 'PCIe x16', cable: null, desc: 'GPU cắm vào khe PCIe x16' },
  { from: 'GPU', fromPort: 'Power Connector', to: 'PSU', toPort: 'PCIe 6+2 pin', cable: 'PCIe Power', desc: 'Cáp PCIe nguồn từ PSU lên GPU' },
  { from: 'Mainboard', fromPort: '24-pin ATX', to: 'PSU', toPort: '24-pin ATX', cable: '24-pin ATX', desc: 'Cáp nguồn chính ATX 24-pin' },
  { from: 'CPU', fromPort: 'Chân CPU', to: 'PSU', toPort: 'CPU 8-pin EPS', cable: 'CPU 8-pin', desc: 'Cáp nguồn CPU 8-pin từ PSU' },
  { from: 'SSD', fromPort: 'M.2 Connector', to: 'Mainboard', toPort: 'M.2 Slot', cable: null, desc: 'SSD M.2 cắm thẳng vào khe M.2' },
  { from: 'SSD', fromPort: 'NAND Flash', to: 'PSU', toPort: 'SATA Power', cable: 'SATA Power', desc: 'Cáp nguồn SATA cho ổ cứng' },
];

function ConnectionLine({ from, to, color = '#d4a030', dashed = false }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3((from[0] + to[0]) / 2 + 0.2, (from[1] + to[1]) / 2 + 0.3, (from[2] + to[2]) / 2),
    new THREE.Vector3(...to),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(20);
  return (
    <mesh>
      <tubeGeometry args={[new THREE.CatmullRomCurve3(curvePoints), 20, 0.02, 8, false]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

function GlowRing({ position, color }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.15);
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.08, 0.13, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

function HotspotDot({ hotspot, isActive, isHovered, onClick, onHover }) {
  const dotRef = useRef();
  const color = hotspot.color;
  return (
    <group position={hotspot.pos}>
      <mesh ref={dotRef}
        onClick={onClick}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onPointerOver={e => { document.body.style.cursor = 'pointer'; e.stopPropagation(); }}
        onPointerOut={e => { document.body.style.cursor = 'default'; }}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 1 : isHovered ? 0.9 : 0.6} />
      </mesh>
      {isActive && <GlowRing position={[0, 0, 0]} color={color} />}
      {isHovered && (
        <mesh>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function InfoTooltip({ hotspot, onClose }) {
  return (
    <Html position={[hotspot.pos[0] + 0.3, hotspot.pos[1] + 0.1, hotspot.pos[2]]}
      center style={{ pointerEvents: 'none', zIndex: 100 }}>
      <div style={{
        background: 'rgba(8,8,18,0.95)', backdropFilter: 'blur(10px)',
        border: `1px solid ${hotspot.color}44`, borderRadius: 10,
        padding: '10px 14px', maxWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.12s', pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ color: hotspot.color, fontWeight: 700, fontSize: 12 }}>{hotspot.label}</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, lineHeight: 1.6, marginBottom: 6 }}>{hotspot.desc}</div>
        {hotspot.related && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Kết nối: </span>
            {hotspot.related.join(' · ')}
          </div>
        )}
        {hotspot.brands && hotspot.brands !== '—' && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Thương hiệu: </span>
            {hotspot.brands}
          </div>
        )}
      </div>
    </Html>
  );
}

function EmptySlot({ label, position, color = '#333', hotspots }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.02, 0.6]} />
        <meshStandardMaterial color={color} transparent opacity={0.12} wireframe />
      </mesh>
      <Html position={[0, 0.25, 0]} center>
        <div onClick={() => setShowInfo(p => !p)}
          style={{
            color, fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 4,
            border: `1px dashed ${color}44`, cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
          ✦ {label}
        </div>
      </Html>
      {showInfo && hotspots && (
        <Html position={[0, -0.35, 0]} center>
          <div style={{
            background: 'rgba(8,8,18,0.95)', backdropFilter: 'blur(8px)',
            border: `1px solid ${color}33`, borderRadius: 8, padding: 8, maxWidth: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}>
            <div style={{ color: color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {hotspots.map(h => (
              <div key={h.id} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, padding: '1px 0' }}>
                • {h.label}
              </div>
            ))}
            <button onClick={() => setShowInfo(false)}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 9, marginTop: 4, padding: 0 }}>✕ Đóng</button>
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraAnimator({ target }) {
  const controlsRef = useRef();
  useFrame(() => {
    if (!controlsRef.current || !target) return;
    controlsRef.current.target.lerp(target, 0.05);
  });
  return <orbitControls ref={controlsRef} />;
}

export default function AssembledPCView({ parts }) {
  const controlsRef = useRef();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [eduMode, setEduMode] = useState(true);
  const [showConnections, setShowConnections] = useState(false);

  const hasCpu = !!parts.cpu;
  const hasGpu = !!parts.gpu;
  const hasRam = (parts.ram?.length || 0) > 0;
  const hasPsu = !!parts.psu;
  const hasSsd = (parts.ssd?.length || 0) > 0;
  const hasCooler = !!parts.cooler;

  const handleHotspotClick = useCallback((h) => {
    if (activeHotspot?.id === h.id) {
      setActiveHotspot(null);
    } else {
      setActiveHotspot(h);
    }
    setHoveredId(null);
  }, [activeHotspot]);

  const renderHotspots = (hotspots, visible) => {
    if (!visible) return null;
    return hotspots.map(h => {
      const isActive = activeHotspot?.id === h.id;
      const isHov = hoveredId === h.id;
      return (
        <group key={h.id}>
          <HotspotDot hotspot={h} isActive={isActive} isHovered={isHov}
            onClick={() => handleHotspotClick(h)}
            onHover={(v) => setHoveredId(v ? h.id : null)} />
          {eduMode && !isActive && !isHov && (
            <Html position={[h.pos[0], h.pos[1] + 0.18, h.pos[2]]} center>
              <div style={{
                color: h.color, fontSize: 7, fontWeight: 600, fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.5)', padding: '1px 5px', borderRadius: 3,
                border: `1px solid ${h.color}22`, pointerEvents: 'none',
                opacity: 0.6, whiteSpace: 'nowrap',
              }}>{h.label}</div>
            </Html>
          )}
          {(isActive || isHov) && (
            <InfoTooltip hotspot={h} onClose={() => setActiveHotspot(null)} />
          )}
        </group>
      );
    });
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)',
      borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-default)',
    }}>
      <Canvas camera={{ position: [3.5, 2.5, 4], fov: 35 }}
        dpr={[1, 2]} gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => { setActiveHotspot(null); setHoveredId(null); }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <directionalLight position={[-3, 4, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.2} />
        <pointLight position={[0, -2, 2]} intensity={0.1} color="#4488ff" />
        <OrbitControls ref={controlsRef}
          enablePan={true} enableZoom={true} enableRotate={true}
          autoRotate={!activeHotspot} autoRotateSpeed={1.2}
          minDistance={1.5} maxDistance={8}
          target={activeHotspot ? [activeHotspot.pos[0], activeHotspot.pos[1], activeHotspot.pos[2]] : [0.3, 0.1, 0.1]}
        />
        <gridHelper args={[5, 10, '#1e293b', '#0f172a']} position={[0.3, -0.25, 0.1]} />

        {/* Mainboard */}
        <MainboardModel isHovered={false} />
        {renderHotspots(HOTSPOTS.MAINBOARD, true)}

        {/* CPU */}
        {hasCpu ? (
          <group position={MODEL_POSITIONS.CPU.pos} scale={MODEL_POSITIONS.CPU.scale}>
            <CPUModel brand={parts.cpu.brand} socket={parts.cpu.cpu_socket} isHovered={false} />
          </group>
        ) : (
          <EmptySlot label="CPU" position={MODEL_POSITIONS.CPU.pos} color="#00d4aa" hotspots={HOTSPOTS.CPU} />
        )}
        {renderHotspots(HOTSPOTS.CPU, hasCpu)}

        {/* Cooler */}
        {hasCooler ? (
          <group position={MODEL_POSITIONS.COOLER.pos} scale={MODEL_POSITIONS.COOLER.scale}>
            <mesh><boxGeometry args={[0.9, 0.7, 0.9]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
            <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.35, 0.35, 0.05, 24]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
            <mesh position={[0, 0.10, 0]}><cylinderGeometry args={[0.38, 0.38, 0.02, 16]} /><meshStandardMaterial color="#333" transparent opacity={0.3} /></mesh>
          </group>
        ) : null}

        {/* RAM */}
        {hasRam ? (
          <>
            <group position={MODEL_POSITIONS.RAM_LEFT.pos} scale={MODEL_POSITIONS.RAM_LEFT.scale}>
              <RAMModel brand={parts.ram[0]?.brand} isHovered={false} />
            </group>
            {(parts.ram.length > 1) && (
              <group position={MODEL_POSITIONS.RAM_RIGHT.pos} scale={MODEL_POSITIONS.RAM_RIGHT.scale}>
                <RAMModel brand={parts.ram[1]?.brand} isHovered={false} />
              </group>
            )}
          </>
        ) : (
          <>
            <EmptySlot label="RAM A" position={MODEL_POSITIONS.RAM_LEFT.pos} color="#22c55e" hotspots={HOTSPOTS.RAM} />
            <EmptySlot label="RAM B" position={MODEL_POSITIONS.RAM_RIGHT.pos} color="#22c55e" />
          </>
        )}
        {renderHotspots(HOTSPOTS.RAM, hasRam)}

        {/* GPU */}
        {hasGpu ? (
          <group position={MODEL_POSITIONS.GPU.pos} scale={MODEL_POSITIONS.GPU.scale}>
            <GPUModel isHovered={false} />
          </group>
        ) : (
          <EmptySlot label="GPU" position={MODEL_POSITIONS.GPU.pos} color="#ef4444" hotspots={HOTSPOTS.GPU} />
        )}
        {renderHotspots(HOTSPOTS.GPU, hasGpu)}

        {/* PSU */}
        {hasPsu ? (
          <group position={MODEL_POSITIONS.PSU.pos} scale={MODEL_POSITIONS.PSU.scale}>
            <PSUModel isHovered={false} />
          </group>
        ) : (
          <EmptySlot label="PSU" position={MODEL_POSITIONS.PSU.pos} color="#f59e0b" hotspots={HOTSPOTS.PSU} />
        )}
        {renderHotspots(HOTSPOTS.PSU, hasPsu)}

        {/* SSD */}
        {hasSsd ? (
          <group position={MODEL_POSITIONS.SSD.pos} scale={MODEL_POSITIONS.SSD.scale}>
            <SSDModel isHovered={false} />
          </group>
        ) : null}
        {renderHotspots(HOTSPOTS.SSD, hasSsd)}

        {/* Connection lines */}
        {showConnections && hasPsu && hasCpu && (
          <ConnectionLine from={[1.90, -0.10, 1.30]} to={[1.30, 0.04, 0.20]} color="#d4a030" />
        )}
        {showConnections && hasPsu && hasCpu && (
          <ConnectionLine from={[1.90, 0.05, 1.20]} to={[0.10, 0.10, 0.30]} color="#94a3b8" />
        )}
        {showConnections && hasPsu && hasGpu && (
          <ConnectionLine from={[1.90, 0.15, 1.10]} to={[1.25, 0.10, -0.40]} color="#ef4444" />
        )}
      </Canvas>

      {/* Overlay Controls */}
      <div style={{
        position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6,
      }}>
        <button onClick={() => setEduMode(p => !p)}
          style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: eduMode ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.05)',
            color: eduMode ? '#00d4aa' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 9, fontWeight: 600, fontFamily: 'monospace',
          }}>
          {eduMode ? '📖 Edu ON' : '📖 Edu OFF'}
        </button>
        <button onClick={() => setShowConnections(p => !p)}
          style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: showConnections ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            color: showConnections ? '#818cf8' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 9, fontWeight: 600, fontFamily: 'monospace',
          }}>
          {showConnections ? '🔌 Cable ON' : '🔌 Cable OFF'}
        </button>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.15)', fontSize: 8, fontFamily: 'monospace',
        pointerEvents: 'none', textAlign: 'center',
      }}>
        Click chấm tròn để xem thông tin · Kéo xoay · Scroll zoom
      </div>

      {/* Active detail panel */}
      {activeHotspot && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(8,8,18,0.92)', backdropFilter: 'blur(10px)',
          border: `1px solid ${activeHotspot.color}33`, borderRadius: 10,
          padding: '10px 16px', maxWidth: 450, width: '90%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.15s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeHotspot.color, flexShrink: 0 }} />
            <span style={{ color: activeHotspot.color, fontWeight: 700, fontSize: 13 }}>{activeHotspot.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 8, fontFamily: 'monospace', marginLeft: 'auto', flexShrink: 0 }}>
              {activeHotspot.id}
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.6 }}>{activeHotspot.desc}</div>
          {activeHotspot.related && (
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>Kết nối với:</span>
              {activeHotspot.related.map(r => (
                <span key={r} style={{
                  background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3,
                  fontSize: 9, color: 'rgba(255,255,255,0.4)',
                }}>{r}</span>
              ))}
            </div>
          )}
          {activeHotspot.brands && activeHotspot.brands !== '—' && (
            <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>Thương hiệu:</span>
              {activeHotspot.brands.split(', ').map(b => (
                <span key={b} style={{
                  background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3,
                  fontSize: 8, color: 'rgba(255,255,255,0.35)',
                }}>{b}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
