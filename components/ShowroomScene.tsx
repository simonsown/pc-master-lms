'use client';

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

const MODELS = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', badge: 'CPU', color: '#ff4444', specs: '8 nhân / 16 luồng, 3.0GHz, 100MB Cache' },
  { id: 'gpu4060', file: '/models/msi_gaming_x_rtx_4060ti.glb', name: 'MSI RTX 4060 Ti Gaming X', badge: 'VGA', color: '#ff6600', specs: '8GB GDDR6, 2535 MHz, DLSS 3' },
  { id: 'gpu4090', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', badge: 'VGA', color: '#ff8800', specs: '24GB GDDR6X, 2520 MHz, RGB' },
  { id: 'ram1', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', badge: 'RAM', color: '#6366f1', specs: '2x8GB DDR4 3200MHz, heatsink đỏ' },
  { id: 'ram2', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', badge: 'RAM', color: '#818cf8', specs: '2x16GB DDR5 6000MHz, RGB' },
  { id: 'mb1', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', badge: 'Main', color: '#22c55e', specs: 'AM4, DDR4, PCIe 4.0, Wi-Fi' },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard (chung)', badge: 'Main', color: '#16a34a', specs: 'PCB đa lớp, VRM 12 pha' },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop PC', badge: 'Case', color: '#a855f7', specs: 'ATX, side panel kính, LED RGB' },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro Futuristic PC', badge: 'Case', color: '#f59e0b', specs: 'Phong cách retro, CRT + led neon' },
  { id: 'components', file: '/models/computer_components.glb', name: 'Computer Components', badge: 'Kit', color: '#06b6d4', specs: 'Bộ linh kiện PC đầy đủ' },
];

function GalleryFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhysicalMaterial color="#0a0a1e" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshPhysicalMaterial color="#0d0d24" roughness={0.15} metalness={0.2} transparent opacity={0.6} />
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
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshPhysicalMaterial color="#050510" roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );
}

function AmbientParticles() {
  const count = 40;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#4444ff" transparent opacity={0.25} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function OrbitSelector({ onSelect, hoveredId, setHoveredId }: {
  onSelect: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  return (
    <group>
      <color attach="background" args={['#080818']} />
      <ambientLight intensity={0.3} color="#4444aa" />
      <hemisphereLight args={['#4444aa', '#111122', 0.3]} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#6666ff" />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#4444ff" />
      <pointLight position={[3, 2, 3]} intensity={0.2} color="#6666ff" />
      <GalleryFloor />
      <AmbientParticles />
      {MODELS.map((m, i) => (
        <OrbitItem
          key={m.id}
          model={m}
          index={i}
          total={MODELS.length}
          onSelect={() => onSelect(m.id)}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      ))}
    </group>
  );
}

function OrbitItem({ model, index, total, onSelect, hoveredId, setHoveredId }: {
  model: typeof MODELS[0]; index: number; total: number;
  onSelect: () => void; hoveredId: string | null; setHoveredId: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleOffset = (index / total) * Math.PI * 2;
  const radius = 4.5;
  const isHovered = hoveredId === model.id;
  const { scene } = useGLTF(model.file);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (scene) {
      scene.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      setLoaded(true);
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const angle = angleOffset + Date.now() * 0.00012;
    const yOffset = Math.sin(angle * 0.5) * 0.2;
    groupRef.current.position.set(
      Math.sin(angle) * radius,
      0.6 + yOffset,
      Math.cos(angle) * radius
    );
    const lookTarget = new THREE.Vector3(0, 0.6, 0);
    groupRef.current.lookAt(lookTarget);
    if (!isHovered) {
      groupRef.current.rotation.z += delta * 0.2;
    }
  });

  const scale = isHovered ? 0.15 : 0.1;
  const glowIntensity = isHovered ? 0.8 : 0.05;

  return (
    <group ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredId(model.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {loaded ? (
        <primitive object={scene} scale={scale} />
      ) : (
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshPhysicalMaterial color={model.color} transparent opacity={0.3} />
        </mesh>
      )}
      <mesh position={[0, -0.28, 0]}>
        <RoundedBox args={[0.3, 0.008, 0.3]} radius={0.008}>
          <meshStandardMaterial
            color={model.color}
            emissive={model.color}
            emissiveIntensity={glowIntensity}
          />
        </RoundedBox>
      </mesh>
      <sprite position={[0, -0.34, 0]} scale={[0.4, 0.04, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 24;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(model.name, 128, 12);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.9} depthTest={false} />
      </sprite>
      {isHovered && (
        <sprite position={[0, 0.25, 0]} scale={[0.5, 0.04, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 256; c.height = 24;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = model.color; ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(model.specs, 128, 12);
            return new THREE.CanvasTexture(c);
          })()} transparent opacity={0.8} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function InspectView({ componentId, onBack }: { componentId: string; onBack: () => void }) {
  const model = MODELS.find(m => m.id === componentId)!;
  const { scene } = useGLTF(model.file);
  const pedestalRef = useRef<THREE.Group>(null);
  const [glbReady, setGlbReady] = useState(false);
  const [zoom, setZoom] = useState(0.15);
  const [rotY, setRotY] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  React.useEffect(() => {
    if (!scene) return;
    scene.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = false;
        c.receiveShadow = false;
      }
    });
    setGlbReady(true);
  }, [scene]);

  useFrame((_, delta) => {
    if (!pedestalRef.current) return;
    const h = handDataRef;
    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      const lm = h.landmarks;
      if (h.pinch) {
        const d = Math.hypot(lm[4][0] - lm[8][0], lm[4][1] - lm[8][1]);
        const targetZoom = THREE.MathUtils.clamp(0.08 + (0.05 - d) * 3, 0.06, 0.35);
        setZoom(prev => prev + (targetZoom - prev) * 0.08);
        setAutoRotate(false);
      } else if (h.pointing) {
        const dx = (lm[8][0] - 0.5) * 0.02;
        setRotY(prev => prev + dx);
        setAutoRotate(false);
      } else {
        if (autoRotate) {
          setRotY(prev => prev + delta * 0.3);
        }
        setZoom(prev => prev + (0.15 - prev) * 0.02);
      }
    } else {
      if (autoRotate) {
        setRotY(prev => prev + delta * 0.3);
      }
      setZoom(prev => prev + (0.15 - prev) * 0.02);
    }
    if (pedestalRef.current) {
      pedestalRef.current.rotation.y = rotY;
    }
  });

  return (
    <group>
      <color attach="background" args={['#080818']} />
      <ambientLight intensity={0.4} color="#4444aa" />
      <hemisphereLight args={['#4444aa', '#111122', 0.4]} />
      <directionalLight position={[6, 10, 6]} intensity={0.6} />
      <directionalLight position={[-4, 6, 4]} intensity={0.3} color="#6666ff" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#4444ff" />
      <pointLight position={[2, 2, 2]} intensity={0.2} color="#6666ff" />
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={0.8} intensity={0.5} color="#8888ff" />
      <GalleryFloor />
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 24]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.2} metalness={0.3} emissive="#4444ff" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <RoundedBox args={[0.8, 0.01, 0.8]} radius={0.01}>
          <meshStandardMaterial color={model.color} roughness={0.2} emissive={model.color} emissiveIntensity={0.1} />
        </RoundedBox>
      </mesh>
      <group ref={pedestalRef} position={[0, 0.15, 0]}>
        {glbReady && <primitive object={scene} scale={zoom} />}
        {!glbReady && (
          <mesh>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshPhysicalMaterial color={model.color} transparent opacity={0.5} />
          </mesh>
        )}
      </group>
      <sprite position={[0, -0.4, 0]} scale={[0.6, 0.06, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 48;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#0a0a1e'; ctx.fillRect(0, 0, 512, 48);
          ctx.fillStyle = model.color; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(`${model.name} — ${model.badge}`, 256, 18);
          ctx.fillStyle = '#6688aa'; ctx.font = '10px monospace';
          ctx.fillText(model.specs, 256, 38);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.95} depthTest={false} />
      </sprite>
      <sprite position={[0, 0.8, 0]} scale={[0.8, 0.04, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 24;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#445566'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('Chạm ngón + ngón trỏ để zoom | Chỉ tay để xoay', 256, 12);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.6} depthTest={false} />
      </sprite>
      <HtmlLabel position={[0, -0.55, 0]} text="← Quay lại" onClick={onBack} />
    </group>
  );
}

function HtmlLabel({ position, text, onClick }: { position: [number, number, number]; text: string; onClick: () => void }) {
  const textRef = useRef<THREE.Mesh>(null);
  return (
    <mesh
      ref={textRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <planeGeometry args={[0.5, 0.1]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function CameraLook() {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
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

function Hand3D() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [pts, setPts] = useState<THREE.Vector3[] | null>(null);

  useFrame(() => {
    const h = handDataRef;
    if (!h.active || !h.landmarks || h.landmarks.length < 21) { setPts(null); return; }
    const lm = h.landmarks;
    const scale = 0.4;
    const pts3 = lm.map(p => new THREE.Vector3((p[0] - 0.5) * scale, -(p[1] - 0.5) * scale, p[2] * scale * 0.3));
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
          <mesh
            key={`b-${i}`}
            position={mid}
            quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}
          >
            <cylinderGeometry args={[0.005, 0.005, len, 4]} />
            <meshPhysicalMaterial color="#eebb99" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

const HAND_BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
];

export default function ShowroomScene({ component, onBack }: { component: string | null; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(component);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      const timeout = setTimeout(() => {
        useGLTF.preload(MODELS.map(m => m.file));
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [selected]);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  useEffect(() => {
    const h = handDataRef;
    if (!selected && hoveredId) {
      if (h.active && h.pointing) {
        const interval = setInterval(() => {
          if (handDataRef.pointing && handDataRef.active) {
            setSelected(hoveredId);
          }
        }, 800);
        return () => clearInterval(interval);
      }
    }
  }, [selected, hoveredId]);

  return (
    <div className="w-full h-screen bg-[#080818] relative overflow-hidden">
      <UnifiedTracker />
      <Canvas camera={{ position: [0, 1.8, 0], fov: 55, near: 0.1, far: 30 }}>
        {!selected ? (
          <OrbitSelector onSelect={handleSelect} hoveredId={hoveredId} setHoveredId={setHoveredId} />
        ) : (
          <InspectView componentId={selected} onBack={() => { setSelected(null); onBack(); }} />
        )}
        <CameraLook />
        <Hand3D />
      </Canvas>
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, color: '#6688aa', fontFamily: 'monospace', fontSize: 11,
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <span style={{ color: '#445566' }}>
          {selected
            ? 'Chụm ngón để zoom | Chỉ tay để xoay'
            : 'Webcam: nhìn để xoay | Chỉ tay vào linh kiện để chọn'
          }
        </span>
      </div>
      {selected && (
        <button
          onClick={() => { setSelected(null); onBack(); }}
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 50,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(0,0,0,0.6)', color: '#8af',
            fontFamily: 'monospace', fontSize: 12, textDecoration: 'none',
            border: '1px solid rgba(100,100,255,0.2)', backdropFilter: 'blur(4px)',
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>
      )}
    </div>
  );
}
