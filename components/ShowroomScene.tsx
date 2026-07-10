'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

const MODELS = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', badge: 'CPU', color: '#ff4444' },
  { id: 'gpu4060', file: '/models/msi_gaming_x_rtx_4060ti.glb', name: 'MSI RTX 4060 Ti', badge: 'VGA', color: '#ff6600' },
  { id: 'gpu4090', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', badge: 'VGA', color: '#ff8800' },
  { id: 'ram1', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', badge: 'RAM', color: '#6366f1' },
  { id: 'ram2', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', badge: 'RAM', color: '#818cf8' },
  { id: 'mb1', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', badge: 'Main', color: '#22c55e' },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard (chung)', badge: 'Main', color: '#16a34a' },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop PC', badge: 'Case', color: '#a855f7' },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro Futuristic PC', badge: 'Case', color: '#f59e0b' },
  { id: 'components', file: '/models/computer_components.glb', name: 'Computer Components', badge: 'Kit', color: '#06b6d4' },
];

function Environment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhysicalMaterial color="#0a0a1e" roughness={0.2} metalness={0.1} />
      </mesh>
      {Array.from({ length: 21 }).map((_, i) => (
        <React.Fragment key={`g-${i}`}>
          <mesh position={[-10 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.006, 20]} />
            <meshPhysicalMaterial color="#1a1a3e" transparent opacity={0.08} />
          </mesh>
          <mesh position={[0, 0, -10 + i]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 0.006]} />
            <meshPhysicalMaterial color="#1a1a3e" transparent opacity={0.08} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

function ComponentModel({ file, color }: { file: string; color: string }) {
  try {
    const { scene } = useGLTF(file);
    if (scene) return <primitive object={scene} />;
  } catch {}
  return (
    <mesh>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshPhysicalMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

function GalleryScene({ onSelect }: { onSelect: (id: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <group>
      <color attach="background" args={['#080818']} />
      <ambientLight intensity={0.4} color="#4444aa" />
      <hemisphereLight args={['#4444aa', '#111122', 0.4]} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#6666ff" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#4444ff" />
      <Environment />
      {MODELS.map((m, i) => {
        const angle = (i / MODELS.length) * Math.PI * 2;
        const x = Math.sin(angle) * 4.5;
        const z = Math.cos(angle) * 4.5;
        const isHovered = hoveredId === m.id;
        return (
          <group
            key={m.id}
            position={[x, 0.6, z]}
            onClick={(e) => { e.stopPropagation(); onSelect(m.id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredId(m.id); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
          >
            <group scale={isHovered ? 0.15 : 0.1}>
              <ComponentModel file={m.file} color={m.color} />
            </group>
            <mesh position={[0, -0.3, 0]}>
              <RoundedBox args={[0.35, 0.008, 0.35]} radius={0.008}>
                <meshStandardMaterial
                  color={m.color}
                  emissive={m.color}
                  emissiveIntensity={isHovered ? 0.8 : 0.05}
                />
              </RoundedBox>
            </mesh>
            <Label3D text={m.name} position={[0, -0.36, 0]} color="#ffffff" size={0.4} />
            {isHovered && (
              <Label3D text={`${m.badge} • ${m.name}`} position={[0, 0.3, 0]} color={m.color} size={0.5} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function Label3D({ text, position, color, size }: { text: string; position: [number, number, number]; color: string; size: number }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 512, 48);
  ctx.fillStyle = color;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 24);
  const texture = new THREE.CanvasTexture(canvas);
  return (
    <sprite position={position} scale={[size, size * 0.1, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.9} depthTest={false} />
    </sprite>
  );
}

function InspectView({ componentId, onBack }: { componentId: string; onBack: () => void }) {
  const model = MODELS.find(m => m.id === componentId)!;
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
        const target = THREE.MathUtils.clamp(0.06 + (0.05 - d) * 3, 0.04, 0.3);
        setZoom(prev => prev + (target - prev) * 0.1);
      } else if (h.pointing) {
        rotRef.current += (lm[8][0] - 0.5) * 0.03;
      } else {
        rotRef.current += delta * 0.3;
        setZoom(prev => prev + (0.12 - prev) * 0.02);
      }
    } else {
      rotRef.current += delta * 0.3;
      setZoom(prev => prev + (0.12 - prev) * 0.02);
    }
    ref.current.rotation.y = rotRef.current;
  });

  return (
    <group>
      <color attach="background" args={['#080818']} />
      <ambientLight intensity={0.5} color="#4444aa" />
      <hemisphereLight args={['#4444aa', '#111122', 0.5]} />
      <directionalLight position={[6, 10, 6]} intensity={0.8} />
      <directionalLight position={[-4, 6, 4]} intensity={0.4} color="#6666ff" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#4444ff" />
      <spotLight position={[0, 6, 0]} angle={0.4} penumbra={0.8} intensity={0.6} color="#8888ff" />
      <Environment />
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.12, 24]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.2} metalness={0.3} emissive="#4444ff" emissiveIntensity={0.03} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <RoundedBox args={[1, 0.012, 1]} radius={0.012}>
          <meshStandardMaterial color={model.color} roughness={0.2} emissive={model.color} emissiveIntensity={0.08} />
        </RoundedBox>
      </mesh>
      <group ref={ref} position={[0, 0.18, 0]}>
        <group scale={zoom}>
          <ComponentModel file={model.file} color={model.color} />
        </group>
      </group>
      <Label3D text={`${model.name} — ${model.badge}`} position={[0, -0.55, 0]} color={model.color} size={0.7} />
      <Label3D text="Chụm ngón: zoom | Chỉ tay: xoay" position={[0, 0.6, 0]} color="#445566" size={0.5} />
    </group>
  );
}

function CameraLook() {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  useEffect(() => {
    camera.position.set(0, 1.8, 0);
  }, [camera]);

  useFrame(() => {
    const rp = -headTrackingRef.pitch * 2.0;
    const ry = headTrackingRef.yaw * 2.5;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.008) {
      ay.current += (ry - py.current) * 0.5;
      py.current = ry;
    }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  });
  return null;
}

const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
];

function Hand3D() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [pts, setPts] = useState<THREE.Vector3[] | null>(null);

  useFrame(() => {
    const h = handDataRef;
    if (!h.active || !h.landmarks || h.landmarks.length < 21) { setPts(null); return; }
    const lm = h.landmarks;
    const pts3 = lm.map(p => new THREE.Vector3((p[0] - 0.5) * 0.4, -(p[1] - 0.5) * 0.4, p[2] * 0.12));
    setPts([...pts3]);
    if (!groupRef.current) return;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const pos = camera.position.clone().add(fwd.multiplyScalar(1.2));
    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  if (!pts || pts.length < 21) return null;
  return (
    <group ref={groupRef}>
      {pts.map((p, i) => (
        <mesh key={`j-${i}`} position={p}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshPhysicalMaterial
            color={handDataRef.pointing && i === 8 ? '#00ff88' : '#ffccaa'}
            emissive={handDataRef.pointing && i === 8 ? '#00ff88' : '#ff8844'}
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
      {HAND_BONES.map(([a, b], i) => {
        if (!pts[a] || !pts[b]) return null;
        const mid = new THREE.Vector3().addVectors(pts[a], pts[b]).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(pts[b], pts[a]);
        const len = dir.length();
        if (len < 0.002) return null;
        return (
          <mesh key={`b-${i}`} position={mid}
            quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
            <cylinderGeometry args={[0.005, 0.005, len, 4]} />
            <meshPhysicalMaterial color="#eebb99" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ShowroomScene() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full h-screen bg-[#080818] relative overflow-hidden">
      <UnifiedTracker />
      <Canvas camera={{ position: [0, 1.8, 3.5], fov: 55, near: 0.1, far: 30 }}>
        {!selected ? (
          <GalleryScene onSelect={setSelected} />
        ) : (
          <InspectView componentId={selected} onBack={() => setSelected(null)} />
        )}
        <CameraLook />
        <Hand3D />
      </Canvas>
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, color: '#6688aa', fontFamily: 'monospace', fontSize: 11,
        textAlign: 'center', pointerEvents: 'none',
      }}>
        {selected
          ? 'Chụm ngón để zoom | Chỉ tay để xoay'
          : 'Click vào linh kiện để xem chi tiết • Webcam: nhìn để xoay góc'}
      </div>
      {selected && (
        <button onClick={() => setSelected(null)}
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 50,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(0,0,0,0.6)', color: '#8af',
            fontFamily: 'monospace', fontSize: 12,
            border: '1px solid rgba(100,100,255,0.2)', backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}>
          ← Quay lại
        </button>
      )}
    </div>
  );
}
