'use client';

import React, { Suspense, useRef, useState, useEffect, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text, OrbitControls, useProgress, Environment, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';
import { useAssemblyStore } from '@/lib/useStore';

const ITEMS = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', desc: 'CPU 8 nhân/16 luồng | 3.0GHz | 100MB Cache', color: '#ff4444', pos: [-5, 0, -5] },
  { id: 'gpu', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', desc: 'VGA 24GB GDDR6X | 2520 MHz | RGB', color: '#ff8800', pos: [5, 0, -5] },
  { id: 'ram', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', desc: 'RAM 2x16GB DDR5 | 6000MHz | RGB', color: '#818cf8', pos: [-5, 0, 0] },
  { id: 'mb', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', desc: 'Mainboard AM4 | DDR4 | PCIe 4.0 | Wi-Fi', color: '#22c55e', pos: [5, 0, 0] },
  { id: 'xpg', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', desc: 'RAM 2x8GB DDR4 | 3200MHz | Heatsink đỏ', color: '#6366f1', pos: [-5, 0, 5] },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard (Kit)', desc: 'PCB đa lớp | VRM 12 pha', color: '#16a34a', pos: [5, 0, 5] },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop PC', desc: 'Case ATX | Side panel kính | LED RGB', color: '#a855f7', pos: [-2, 0, -8] },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro Futuristic PC', desc: 'Phong cách Retro | CRT + LED Neon', color: '#f59e0b', pos: [2, 0, -8] },
  { id: 'kit', file: '/models/computer_components.glb', name: 'PC Components Kit', desc: 'Bộ linh kiện máy tính đầy đủ', color: '#06b6d4', pos: [0, 0, 8] },
];

// Preload GLB models for instant rendering
if (typeof window !== 'undefined') {
  ITEMS.forEach(i => {
    try { useGLTF.preload(i.file); } catch (e) {}
  });
}

/* ── Loading Overlay ── */
function LoadingOverlay() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (!visible) return null;
  const pct = Math.round(progress);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      transition: 'opacity 0.4s ease', opacity: visible ? 1 : 0,
    }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🖥️</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Showroom 3D Linh Kiện</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Đang tải mô hình 3D...</div>
      </div>

      <div style={{ width: 280, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
          <span>Tiến độ tải</span>
          <span style={{ color: '#818cf8', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
            borderRadius: 99, transition: 'width 0.2s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Fullscreen 3D Component Viewer Modal ── */
function FullscreenViewer({ item, onClose, onPrev, onNext, hasPrev, hasNext }: {
  item: typeof ITEMS[0]; onClose: () => void; onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9997, background: '#090d16',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeInUp 0.2s cubic-bezier(.4,0,.2,1)',
    }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Top Navigation Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px', background: 'linear-gradient(to bottom, rgba(9,13,22,0.95), transparent)',
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            CHI TIẾT LINH KIỆN 3D
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>{item.name}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
        </div>

        <button
          onClick={onClose}
          style={{
            pointerEvents: 'auto',
            width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 20,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        >
          ✕
        </button>
      </div>

      {/* Interactive 3D Canvas */}
      <div style={{ flex: 1, width: '100%', height: '100%' }}>
        <Canvas
          camera={{ position: [0, 0.4, 2.2], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 10, 5]} intensity={1.6} />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#818cf8" />
          <pointLight position={[0, 2, 0]} intensity={0.8} color={item.color} />
          <Suspense fallback={null}>
            <GlbViewer file={item.file} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls
            enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={1.2}
            minDistance={0.4} maxDistance={5} target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      {/* Bottom Controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '24px', background: 'linear-gradient(to top, rgba(9,13,22,0.95), transparent)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16
      }}>
        <button
          onClick={onPrev} disabled={!hasPrev}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            background: hasPrev ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hasPrev ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: hasPrev ? '#ffffff' : 'rgba(255,255,255,0.3)', cursor: hasPrev ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          ← Linh kiện trước
        </button>

        <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
          🖱️ Kéo chuột để xoay · Cuộn chuột để Phóng to/Thu nhỏ · ESC để Đóng
        </div>

        <button
          onClick={onNext} disabled={!hasNext}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            background: hasNext ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hasNext ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: hasNext ? '#ffffff' : 'rgba(255,255,255,0.3)', cursor: hasNext ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          Linh kiện tiếp →
        </button>
      </div>
    </div>
  );
}

function GlbViewer({ file }: { file: string }) {
  const { scene } = useGLTF(file);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0 && ref.current) {
      const scale = 1.3 / maxDim;
      ref.current.scale.setScalar(scale);
      const center = box.getCenter(new THREE.Vector3());
      ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
  }, [scene]);

  return <primitive ref={ref} object={scene} />;
}

/* ── Scene Components ── */
class ModelBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() { return this.state.ok ? this.props.children : this.props.fallback; }
}

class SceneErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() { return this.state.ok ? this.props.children : <FallbackScene />; }
}

function FallbackScene() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#44aaff" />
    </mesh>
  );
}

function FallbackBox({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function GlbInner({ file, scale }: { file: string; scale: number }) {
  const { scene } = useGLTF(file);
  return <primitive object={scene} scale={scale} />;
}

function SafeGlb({ file, color, scale = 1 }: { file: string; color: string; scale?: number }) {
  return (
    <ModelBoundary fallback={<FallbackBox color={color} />}>
      <Suspense fallback={<FallbackBox color={color} />}>
        <GlbInner file={file} scale={scale} />
      </Suspense>
    </ModelBoundary>
  );
}

function Pedestal({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.12, 20]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.3} metalness={0.4} emissive={color} emissiveIntensity={0.03} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 0.02, 20]} />
        <meshPhysicalMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function ClickableItem({ item, onFocus }: {
  item: typeof ITEMS[0]; onFocus: (id: string) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const pointerDownPos = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 0.6 + ITEMS.indexOf(item)) * 0.04;
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    if (dx < 6 && dy < 6) {
      onFocus(item.id);
    }
  };

  return (
    <group position={[item.pos[0], item.pos[1], item.pos[2]]}>
      <Pedestal color={item.color} />
      <group ref={ref} position={[0, 0.2, 0]}>
        <SafeGlb file={item.file} color={item.color} scale={0.1} />
      </group>

      {/* 2D HTML Floating Button */}
      <Html position={[0, 1.1, 0]} center distanceFactor={12}>
        <div
          onClick={(e) => { e.stopPropagation(); onFocus(item.id); }}
          style={{
            background: 'rgba(15,23,42,0.9)', color: '#ffffff', border: `1.5px solid ${item.color}`,
            padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            backdropFilter: 'blur(6px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span style={{ color: item.color }}>🔍</span> {item.name}
        </div>
      </Html>

      {/* Invisible Click Target */}
      <mesh
        position={[0, 0.5, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ── Central Desk & Blinking PC Case on Mainboard ── */
function BlinkingSlotShowroom({
  slotId,
  label,
  pos,
  color,
  size = [0.3, 0.08, 0.3] as [number, number, number],
}: {
  slotId: string;
  label: string;
  pos: [number, number, number];
  color: string;
  size?: [number, number, number];
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const installed = useAssemblyStore((s) => s.components.some((c) => c.slotId === slotId && c.installed));

  useFrame((state) => {
    if (!matRef.current) return;
    const pulse = (Math.sin(state.clock.getElapsedTime() * 6) + 1) / 2;
    matRef.current.emissiveIntensity = 0.4 + pulse * 2.2;
    matRef.current.opacity = 0.45 + pulse * 0.45;
  });

  const handleClick = () => {
    if (installed) return;
    const dep = useAssemblyStore.getState().checkDependencies(slotId);
    if (!dep.ok) {
      alert('⚠️ Cần lắp Mainboard trước!');
      return;
    }
    useAssemblyStore.getState().installComponent(slotId, `comp_${slotId}`);
  };

  if (installed) return null;

  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); handleClick(); }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          wireframe={true}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[size[0] * 0.9, size[1] * 0.9, size[2] * 0.9]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.5 : 0.22} />
      </mesh>

      <sprite position={[0, size[1] / 2 + 0.12, 0]} scale={[0.5, 0.16, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 80;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.beginPath(); (ctx as any).roundRect(0, 0, 256, 80, 10); ctx.fill();
          ctx.strokeStyle = color; ctx.lineWidth = 4;
          ctx.beginPath(); (ctx as any).roundRect(2, 2, 252, 76, 8); ctx.stroke();
          ctx.fillStyle = color; ctx.font = 'bold 22px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(`⚡ ${label}`, 128, 28);
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Nhấp để lắp', 128, 56);
          const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
          return t;
        })()} transparent opacity={0.95} depthTest={false} />
      </sprite>
    </group>
  );
}

function CentralDeskWithBlinkingCase({ position }: { position: [number, number, number] }) {
  const mb = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'motherboard_1' && c.installed));
  const cpu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'cpu_1' && c.installed));
  const cooler = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'cooler_1' && c.installed));
  const ram = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'ram_1' && c.installed));
  const gpu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'gpu_1' && c.installed));
  const psu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'psu_1' && c.installed));
  const ssd = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'ssd_1' && c.installed));

  const count = (mb ? 1 : 0) + (cpu ? 1 : 0) + (cooler ? 1 : 0) + (ram ? 1 : 0) + (gpu ? 1 : 0) + (psu ? 1 : 0) + (ssd ? 1 : 0);

  const SLOTS = [
    { slotId: 'motherboard_1', label: 'MAINBOARD', pos: [0, -0.05, -0.1] as [number, number, number], color: '#8b5cf6', size: [1.2, 0.04, 1.0] as [number, number, number] },
    { slotId: 'cpu_1', label: 'SOCKET CPU', pos: [0.15, 0.12, 0.02] as [number, number, number], color: '#00d4aa', size: [0.22, 0.05, 0.22] as [number, number, number] },
    { slotId: 'cooler_1', label: 'TẢN NHIỆT', pos: [0.15, 0.24, 0.02] as [number, number, number], color: '#00aaff', size: [0.3, 0.12, 0.3] as [number, number, number] },
    { slotId: 'ram_1', label: 'KHE RAM', pos: [0.38, 0.12, 0.1] as [number, number, number], color: '#6366f1', size: [0.1, 0.1, 0.25] as [number, number, number] },
    { slotId: 'gpu_1', label: 'CARD GRAPHICS', pos: [0.15, -0.02, -0.25] as [number, number, number], color: '#ef4444', size: [0.75, 0.1, 0.22] as [number, number, number] },
    { slotId: 'psu_1', label: 'NGUỒN PSU', pos: [-0.3, -0.25, 0.35] as [number, number, number], color: '#f59e0b', size: [0.55, 0.2, 0.35] as [number, number, number] },
    { slotId: 'ssd_1', label: 'SSD NVMe', pos: [0.22, 0.02, -0.12] as [number, number, number], color: '#22c55e', size: [0.25, 0.03, 0.08] as [number, number, number] },
  ];

  return (
    <group position={position}>
      {/* Central Desk Surface */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[3.4, 0.05, 1.8]} />
        <meshPhysicalMaterial color="#8B7355" roughness={0.5} metalness={0.1} />
      </mesh>
      
      {/* Desk Legs */}
      {[[-1.5, 0.35, -0.75], [-1.5, 0.35, 0.75], [1.5, 0.35, -0.75], [1.5, 0.35, 0.75]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.045, 0.05, 0.7, 12]} />
          <meshPhysicalMaterial color="#334155" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}

      {/* PC Case Sitting on Desk */}
      <group position={[0, 1.2, 0]}>
        <RoundedBox args={[1.5, 0.95, 1.2]} radius={0.02}>
          <meshPhysicalMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Front Glass Panel */}
        <mesh position={[0, 0, 0.605]}>
          <planeGeometry args={[1.42, 0.88]} />
          <meshPhysicalMaterial color="#88ccff" metalness={0.2} roughness={0.05} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>

        {/* Progress Header 3D */}
        <Text fontSize={0.075} color="#00ffcc" anchorX="center" anchorY="middle" position={[0, 0.56, 0.3]}>
          {`CASE TRUNG TÂM SHOWROOM: ${count}/7 LINH KIỆN`}
        </Text>

        {/* Blinking Component Slots on Mainboard */}
        {SLOTS.map((s) => (
          <BlinkingSlotShowroom
            key={s.slotId}
            slotId={s.slotId}
            label={s.label}
            pos={s.pos}
            color={s.color}
            size={s.size}
          />
        ))}
      </group>
    </group>
  );
}

function Hall({ onFocusItem }: { onFocusItem: (id: string) => void }) {
  return (
    <group>
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 30, 45]} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#d0d8e8', 0.6]} />
      <directionalLight position={[10, 20, 10]} intensity={1.0} />
      <directionalLight position={[-10, 15, -10]} intensity={0.8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.8} metalness={0} />
      </mesh>

      <Text position={[0, 3.0, -11.5]} fontSize={0.55} color="#334466" font="monospace" anchorX="center" anchorY="middle">
        PHÒNG TRƯNG BÀY LINH KIỆN PC 3D
      </Text>
      <Text position={[0, 2.55, -11.5]} fontSize={0.22} color="#667799" font="monospace" anchorX="center" anchorY="middle">
        Bấm vào thẻ linh kiện để xoay & xem chi tiết 3D toàn màn hình
      </Text>

      {/* ===== BÀN TRUNG TÂM & CASE MÁY TÍNH VỚI VỊ TRÍ LINH KIỆN NHẤP NHÁY ===== */}
      <CentralDeskWithBlinkingCase position={[0, 0, 0]} />

      {ITEMS.map((item) => (
        <ClickableItem key={item.id} item={item} onFocus={onFocusItem} />
      ))}
    </group>
  );
}

function PlayerController() {
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const yaw = useRef(0);
  const prevYaw = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k in keys.current) (keys.current as any)[k] = true; };
    const up = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k in keys.current) (keys.current as any)[k] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    camera.position.set(0, 1.7, 4);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [camera]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const ry = headTrackingRef.yaw * 2.0;
    if (Math.abs(ry - prevYaw.current) > 0.008) {
      yaw.current += (ry - prevYaw.current) * 0.4;
      prevYaw.current = ry;
    }
    const pitch = -headTrackingRef.pitch * 1.8;
    euler.current.set(pitch, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);

    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion); right.y = 0; right.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const move = new THREE.Vector3();
    if (keys.current.w) move.add(fwd);
    if (keys.current.s) move.sub(fwd);
    if (keys.current.a) move.sub(right);
    if (keys.current.d) move.add(right);
    if (keys.current.q) move.sub(up);
    if (keys.current.e) move.add(up);
    if (move.length() > 0) {
      move.normalize().multiplyScalar(4 * d);
      const np = camera.position.clone().add(move);
      np.x = THREE.MathUtils.clamp(np.x, -12, 12);
      np.z = THREE.MathUtils.clamp(np.z, -12, 12);
      np.y = THREE.MathUtils.clamp(np.y, 0.5, 6);
      camera.position.copy(np);
    }
  });
  return null;
}

export default function ShowroomScene() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const focusedItem = focusedId ? ITEMS.find(i => i.id === focusedId) : null;
  const focusedIdx = focusedId ? ITEMS.findIndex(i => i.id === focusedId) : -1;

  const handlePrev = () => {
    if (focusedIdx > 0) setFocusedId(ITEMS[focusedIdx - 1].id);
  };
  const handleNext = () => {
    if (focusedIdx < ITEMS.length - 1) setFocusedId(ITEMS[focusedIdx + 1].id);
  };

  return (
    <div className="w-full h-screen bg-white relative overflow-hidden">
      <LoadingOverlay />
      <UnifiedTracker />

      <SceneErrorBoundary>
        <Canvas
          shadows={false}
          camera={{ position: [0, 1.7, 4], fov: 60, near: 0.1, far: 50 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => { gl.setClearColor('#ffffff'); }}
        >
          <Suspense fallback={null}>
            <Hall onFocusItem={setFocusedId} />
          </Suspense>
          <PlayerController />
        </Canvas>
      </SceneErrorBoundary>

      {/* Fullscreen 3D Component Viewer */}
      {focusedItem && (
        <FullscreenViewer
          item={focusedItem}
          onClose={() => setFocusedId(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={focusedIdx > 0}
          hasNext={focusedIdx < ITEMS.length - 1}
        />
      )}
    </div>
  );
}