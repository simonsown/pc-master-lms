'use client';

import React, { Suspense, useRef, useState, useEffect, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

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

class ModelBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() { return this.state.ok ? this.props.children : this.props.fallback; }
}

function FallbackBox({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function GlbInner({ file, color, scale }: { file: string; color: string; scale: number }) {
  const { scene } = useGLTF(file);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    scene.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = false; c.receiveShadow = false; c.material.transparent = false; } });
    setOk(true);
  }, [scene]);
  if (!ok) return null;
  return <primitive object={scene} scale={scale} />;
}

function SafeGlb({ file, color, scale = 1 }: { file: string; color: string; scale?: number }) {
  return (
    <ModelBoundary fallback={<FallbackBox color={color} />}>
      <Suspense fallback={<FallbackBox color={color} />}>
        <GlbInner file={file} color={color} scale={scale} />
      </Suspense>
    </ModelBoundary>
  );
}

function InfoHolo({ text, sub, color }: { text: string; sub: string; color: string }) {
  return (
    <group position={[0, 0.9, 0]}>
      <sprite scale={[2.5, 0.12, 1]} position={[0, 0.04, 0]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 28;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = color; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(text, 256, 14);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.95} depthTest={false} />
      </sprite>
      <sprite scale={[2.8, 0.08, 1]} position={[0, -0.04, 0]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 22;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#8899bb'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(sub, 256, 11);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.8} depthTest={false} />
      </sprite>
    </group>
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

function ClickableItem({ item, onGrab, onRelease, grabbed }: {
  item: typeof ITEMS[0]; onGrab: (id: string) => void; onRelease: () => void; grabbed: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || grabbed) return;
    ref.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 0.6 + ITEMS.indexOf(item)) * 0.04;
  });

  return (
    <group position={[item.pos[0], item.pos[1], item.pos[2]]}>
      <Pedestal color={item.color} />
      <group ref={ref} position={[0, 0.2, 0]}>
        <SafeGlb file={item.file} color={item.color} scale={0.1} />
      </group>
      <InfoHolo text={item.name} sub={item.desc} color={item.color} />
      <mesh position={[0, 0.4, 0]}
        onClick={(e) => { e.stopPropagation(); grabbed ? onRelease() : onGrab(item.id); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function HeldComponent({ item }: { item: typeof ITEMS[0] }) {
  const { camera } = useThree();
  const ref = useRef<THREE.Group>(null);
  const rotRef = useRef(0);

  useFrame(() => {
    if (!ref.current) return;
    const fwd = new THREE.Vector3(0, 0, -1.5).applyQuaternion(camera.quaternion);
    ref.current.position.copy(camera.position.clone().add(fwd));
    ref.current.quaternion.copy(camera.quaternion);

    const h = handDataRef;
    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      const dx = (h.landmarks[8][0] - 0.5) * 2;
      rotRef.current += dx * 0.02;
    } else {
      rotRef.current += 0.01;
    }
    const child = ref.current.children[0];
    if (child) child.rotation.y = rotRef.current;
  });

  return (
    <group ref={ref}>
      <SafeGlb file={item.file} color={item.color} scale={0.15} />
    </group>
  );
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

function Hall() {
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const item = grabbed ? ITEMS.find(i => i.id === grabbed) : null;

  return (
    <group>
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 30, 45]} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#d0d8e8', 0.6]} />
      <directionalLight position={[10, 20, 10]} intensity={1.0} />
      <directionalLight position={[-10, 15, -10]} intensity={0.8} />
      <directionalLight position={[0, 25, 0]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.6} distance={35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, 2.5, -12]}>
        <boxGeometry args={[18, 0.12, 0.3]} />
        <meshPhysicalMaterial color="#d0d8e0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, -11.85]}>
        <planeGeometry args={[16, 2.5]} />
        <meshPhysicalMaterial color="#f0f4ff" roughness={0.05} />
      </mesh>
      <Text position={[0, 3.0, -11.5]} fontSize={0.55} color="#334466" font="monospace" anchorX="center" anchorY="middle">
        PHÒNG TRƯNG BÀY LINH KIỆN PC
      </Text>
      <Text position={[0, 2.55, -11.5]} fontSize={0.22} color="#667799" font="monospace" anchorX="center" anchorY="middle">
        WASD di chuyển • Click cầm/nhả • Webcam xoay góc nhìn
      </Text>
      {ITEMS.map((item) => (
        <ClickableItem key={item.id} item={item} onGrab={setGrabbed} onRelease={() => setGrabbed(null)} grabbed={grabbed === item.id} />
      ))}
      {item && <HeldComponent item={item} />}
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

function HandTracker3D() {
  const { camera } = useThree();
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const h = handDataRef;
    if (!ref.current) return;
    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      const fwd = new THREE.Vector3(0, 0, -0.8).applyQuaternion(camera.quaternion);
      ref.current.position.copy(camera.position.clone().add(fwd));
      ref.current.quaternion.copy(camera.quaternion);
      ref.current.visible = true;
    } else {
      ref.current.visible = false;
    }
  });

  return <group ref={ref} visible={false} />;
}

function CameraPreview() {
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      width: 160, height: 120,
      borderRadius: 12, overflow: 'hidden',
      border: '2px solid rgba(0,255,136,0.4)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      background: '#000',
    }}>
      <div style={{
        position: 'absolute', top: 4, left: 4,
        background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4,
        fontSize: 9, color: '#00ff88', fontFamily: 'monospace', zIndex: 1,
      }}>
        CAM • Face + Hand
      </div>
    </div>
  );
}

export default function ShowroomScene() {
  return (
    <div className="w-full h-screen bg-white relative overflow-hidden">
      <UnifiedTracker />
      <CameraPreview />
      <SceneErrorBoundary>
        <Canvas shadows camera={{ position: [0, 1.7, 4], fov: 60, near: 0.1, far: 50 }}
          onCreated={({ gl }) => { gl.setClearColor('#ffffff'); }}
        >
          <Hall />
          <PlayerController />
          <HandTracker3D />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}