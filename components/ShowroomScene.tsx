'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

const MODELS = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', color: '#ff4444' },
  { id: 'gpu4060', file: '/models/msi_gaming_x_rtx_4060ti.glb', name: 'MSI RTX 4060 Ti', color: '#ff6600' },
  { id: 'gpu4090', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', color: '#ff8800' },
  { id: 'ram1', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', color: '#6366f1' },
  { id: 'ram2', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', color: '#818cf8' },
  { id: 'mb1', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', color: '#22c55e' },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard', color: '#16a34a' },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop', color: '#a855f7' },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro PC', color: '#f59e0b' },
  { id: 'components', file: '/models/computer_components.glb', name: 'PC Components', color: '#06b6d4' },
];

function GlbModel({ file, color }: { file: string; color: string }) {
  try {
    const { scene } = useGLTF(file);
    if (scene) {
      const [ready, setReady] = useState(false);
      useEffect(() => {
        if (scene) { scene.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = false; c.receiveShadow = false; } }); setReady(true); }
      }, [scene]);
      if (ready) return <primitive object={scene} />;
    }
  } catch {}
  return (
    <mesh>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function RotatingPlatform({ children, speed = 0.005 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += speed; });
  return <group ref={ref}>{children}</group>;
}

function GalleryItem({ model, index, total, onClick }: { model: typeof MODELS[0]; index: number; total: number; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angle = (index / total) * Math.PI * 2;
  const r = 4;

  useFrame(({ clock }) => {
    if (ref.current) {
      const yOff = Math.sin(clock.elapsedTime * 0.5 + index) * 0.15;
      ref.current.position.set(Math.sin(angle) * r, 0.7 + yOff, Math.cos(angle) * r);
      ref.current.lookAt(0, 0.7, 0);
    }
  });

  return (
    <group ref={ref}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <group scale={hovered ? 0.14 : 0.1}>
        <GlbModel file={model.file} color={model.color} />
      </group>
      <mesh position={[0, -0.28, 0]}>
        <RoundedBox args={[0.3, 0.006, 0.3]} radius={0.006}>
          <meshStandardMaterial color={model.color} emissive={model.color} emissiveIntensity={hovered ? 0.5 : 0.05} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    const model = MODELS.find(m => m.id === selected)!;
    return <InspectView model={model} onBack={() => setSelected(null)} />;
  }

  return (
    <group>
      <color attach="background" args={['#0f0f2a']} />
      <fog attach="fog" args={['#0f0f2a', 10, 18]} />
      <ambientLight intensity={0.6} color="#8888ff" />
      <hemisphereLight args={['#8888ff', '#222244', 0.6]} />
      <directionalLight position={[5, 12, 5]} intensity={1.2} />
      <directionalLight position={[-4, 8, -4]} intensity={0.6} color="#6666ff" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#6666ff" />
      <pointLight position={[4, 3, 4]} intensity={0.4} color="#8888ff" />
      <pointLight position={[-4, 3, -4]} intensity={0.4} color="#8888ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.3} metalness={0.2} />
      </mesh>
      {Array.from({ length: 17 }).map((_, i) => (
        <React.Fragment key={i}>
          <mesh position={[-8 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.005, 16]} /><meshBasicMaterial color="#3333aa" transparent opacity={0.06} /></mesh>
          <mesh position={[0, 0, -8 + i]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 0.005]} /><meshBasicMaterial color="#3333aa" transparent opacity={0.06} /></mesh>
        </React.Fragment>
      ))}
      <RotatingPlatform speed={0.003}>
        {MODELS.map((m, i) => (
          <GalleryItem key={m.id} model={m} index={i} total={MODELS.length} onClick={() => setSelected(m.id)} />
        ))}
      </RotatingPlatform>
    </group>
  );
}

function InspectView({ model, onBack }: { model: typeof MODELS[0]; onBack: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [zoom, setZoom] = useState(0.12);
  const rotRef = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const h = handDataRef;
    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      const lm = h.landmarks;
      if (h.pinch) {
        const d = Math.hypot(lm[4][0] - lm[8][0], lm[4][1] - lm[8][1]);
        setZoom(prev => prev + (THREE.MathUtils.clamp(0.06 + (0.05 - d) * 3, 0.04, 0.3) - prev) * 0.1);
      } else if (h.pointing) {
        rotRef.current += (lm[8][0] - 0.5) * 0.04;
      } else {
        rotRef.current += delta * 0.5;
        setZoom(prev => prev + (0.12 - prev) * 0.02);
      }
    } else {
      rotRef.current += delta * 0.5;
      setZoom(prev => prev + (0.12 - prev) * 0.02);
    }
    ref.current.rotation.y = rotRef.current;
  });

  return (
    <group>
      <color attach="background" args={['#0f0f2a']} />
      <ambientLight intensity={0.7} color="#8888ff" />
      <hemisphereLight args={['#8888ff', '#222244', 0.7]} />
      <directionalLight position={[6, 12, 6]} intensity={1.5} />
      <directionalLight position={[-4, 8, 4]} intensity={0.6} color="#6666ff" />
      <pointLight position={[0, 5, 0]} intensity={1.0} color="#8888ff" />
      <spotLight position={[0, 7, 0]} angle={0.3} penumbra={0.6} intensity={1.2} color="#aaaaff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.15, 32]} />
        <meshPhysicalMaterial color="#222255" roughness={0.2} metalness={0.4} emissive="#4444ff" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <RoundedBox args={[1.0, 0.015, 1.0]} radius={0.015}>
          <meshStandardMaterial color={model.color} roughness={0.2} emissive={model.color} emissiveIntensity={0.1} />
        </RoundedBox>
      </mesh>
      <group ref={ref} position={[0, 0.2, 0]}>
        <group scale={zoom}>
          <GlbModel file={model.file} color={model.color} />
        </group>
      </group>
    </group>
  );
}

function CameraLook() {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  useEffect(() => { camera.position.set(0, 1.8, 3.5); }, [camera]);

  useFrame(() => {
    const rp = -headTrackingRef.pitch * 1.8;
    const ry = headTrackingRef.yaw * 2.0;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.01) {
      ay.current += (ry - py.current) * 0.4;
      py.current = ry;
    }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  });
  return null;
}

export default function ShowroomScene() {
  return (
    <div className="w-full h-screen bg-[#0f0f2a] relative overflow-hidden">
      <UnifiedTracker />
      <Canvas camera={{ position: [0, 1.8, 3.5], fov: 55, near: 0.1, far: 25 }}>
        <Gallery />
        <CameraLook />
      </Canvas>
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, color: '#6666cc', fontFamily: 'monospace', fontSize: 11,
        textAlign: 'center', pointerEvents: 'none',
        background: 'rgba(15,15,42,0.7)', padding: '6px 16px', borderRadius: 20,
        border: '1px solid rgba(100,100,255,0.15)',
      }}>
        Click vào linh kiện để xem • Webcam: nhìn để xoay
      </div>
    </div>
  );
}
