'use client';

import React, { useRef, useState, useEffect } from 'react';
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

function Glb({ file, color, scale = 1 }: { file: string; color: string; scale?: number }) {
  let scene: THREE.Group | null = null;
  try { scene = useGLTF(file).scene; } catch {}
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (scene) { scene.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = false; c.receiveShadow = false; } }); setOk(true); }
  }, [scene]);
  if (scene && ok) return <primitive object={scene} scale={scale} />;
  return <mesh><boxGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color={color} /></mesh>;
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
  const floatRef = useRef(0);

  useFrame(({ clock }) => {
    if (!ref.current || grabbed) return;
    ref.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 0.6 + ITEMS.indexOf(item)) * 0.04;
  });

  return (
    <group position={[item.pos[0], item.pos[1], item.pos[2]]}>
      <Pedestal color={item.color} />
      <group ref={ref} position={[0, 0.2, 0]}>
        <group scale={0.1}>
          <Glb file={item.file} color={item.color} />
        </group>
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
      const lm = h.landmarks;
      const dx = (lm[8][0] - 0.5) * 2;
      rotRef.current += dx * 0.02;
    } else {
      rotRef.current += 0.01;
    }
    const child = ref.current.children[0];
    if (child) child.rotation.y = rotRef.current;
  });

  return (
    <group ref={ref}>
      <group scale={0.15}>
        <Glb file={item.file} color={item.color} />
      </group>
    </group>
  );
}

function Hall() {
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const item = grabbed ? ITEMS.find(i => i.id === grabbed) : null;

  return (
    <group>
      <color attach="background" args={['#e8ecf4']} />
      <fog attach="fog" args={['#e8ecf4', 25, 40]} />
      <ambientLight intensity={0.9} color="#c8d8ff" />
      <hemisphereLight args={['#d8e8ff', '#8899bb', 0.8]} />
      <directionalLight position={[10, 20, 10]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 10, 6]} intensity={0.6} color="#b0c8ff" />
      <directionalLight position={[4, 8, -6]} intensity={0.4} color="#d0e0ff" />
      <pointLight position={[0, 8, 0]} intensity={1.8} color="#d0e0ff" distance={30} />
      {[[-6, 8, -6], [6, 8, -6], [-6, 8, 6], [6, 8, 6]].map((p, i) => (
        <pointLight key={i} position={p as [number, number, number]} intensity={0.8} color="#c0d8ff" distance={20} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#c8d0dc" roughness={0.6} metalness={0.05} />
      </mesh>
      {Array.from({ length: 21 }).map((_, i) => (
        <React.Fragment key={i}>
          <mesh position={[-10 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.01, 20]} /><meshBasicMaterial color="#b0bcc8" transparent opacity={0.15} /></mesh>
          <mesh position={[0, 0, -10 + i]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[20, 0.01]} /><meshBasicMaterial color="#b0bcc8" transparent opacity={0.15} /></mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, 5, -12]}><boxGeometry args={[16, 0.15, 0.3]} /><meshPhysicalMaterial color="#8899aa" /></mesh>
      <mesh position={[0, 3, -11.85]}><planeGeometry args={[14, 3]} /><meshPhysicalMaterial color="#f0f4ff" roughness={0.05} emissive="#c8d8ff" emissiveIntensity={0.2} /></mesh>
      {ITEMS.map((item) => (
        <ClickableItem key={item.id} item={item} onGrab={setGrabbed} onRelease={() => setGrabbed(null)} grabbed={grabbed === item.id} />
      ))}
      {item && <HeldComponent item={item} />}
      <Text position={[0, 5.5, -11.5]} fontSize={0.6} color="#334466" font="monospace" anchorX="center" anchorY="middle">
        PHÒNG TRƯNG BÀY LINH KIỆN PC
      </Text>
      <Text position={[0, 5.0, -11.5]} fontSize={0.25} color="#667799" font="monospace" anchorX="center" anchorY="middle">
        WASD di chuyển • Click để cầm/nhả linh kiện • Webcam xoay góc nhìn
      </Text>
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

export default function ShowroomScene() {
  return (
    <div className="w-full h-screen bg-[#e8ecf4] relative overflow-hidden">
      <UnifiedTracker />
      <Canvas shadows camera={{ position: [0, 1.7, 4], fov: 60, near: 0.1, far: 50 }}>
        <Hall />
        <PlayerController />
        <HandTracker3D />
      </Canvas>
    </div>
  );
}
