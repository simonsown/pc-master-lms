'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

/* ========== DATA ========== */
const MODELS = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', badge: 'CPU', color: '#ff4444', specs: '8 nhan / 16 luong, 3.0GHz, 100MB Cache' },
  { id: 'gpu4060', file: '/models/msi_gaming_x_rtx_4060ti.glb', name: 'MSI RTX 4060 Ti Gaming X', badge: 'VGA', color: '#ff6600', specs: '8GB GDDR6, 2535 MHz, DLSS 3' },
  { id: 'gpu4090', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', badge: 'VGA', color: '#ff8800', specs: '24GB GDDR6X, 2520 MHz, RGB' },
  { id: 'ram1', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', badge: 'RAM', color: '#6366f1', specs: '2x8GB DDR4 3200MHz, heatsink do' },
  { id: 'ram2', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', badge: 'RAM', color: '#818cf8', specs: '2x16GB DDR5 6000MHz, RGB' },
  { id: 'mb1', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', badge: 'Main', color: '#22c55e', specs: 'AM4, DDR4, PCIe 4.0, Wi-Fi' },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard (chung)', badge: 'Main', color: '#16a34a', specs: 'PCB da lop, VRM 12 pha' },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop PC', badge: 'Case', color: '#a855f7', specs: 'ATX, side panel kinh, LED RGB' },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro Futuristic PC', badge: 'Case', color: '#f59e0b', specs: 'Phong cach retro, CRT + led neon' },
];

/* ========== UV CAU (ORBIT SELECTION) ========== */
function OrbitSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [loadedCount, setLoadedCount] = useState(0);

  return (
    <group>
      <color attach="background" args={['#0a0a1e']} />
      <ambientLight intensity={0.6} color="#4040a0" />
      <hemisphereLight args={['#4040a0', '#1a1a2e', 0.4]} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#6060ff" />
      {MODELS.map((m, i) => (
        <OrbitItem key={m.id} model={m} index={i} total={MODELS.length} onSelect={() => onSelect(m.id)} onLoad={() => setLoadedCount(p => p + 1)} />
      ))}
    </group>
  );
}

function OrbitItem({ model, index, total, onSelect, onLoad }: {
  model: typeof MODELS[0]; index: number; total: number;
  onSelect: () => void; onLoad: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleOffset = (index / total) * Math.PI * 2;
  const radius = 3.5;
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { scene } = useGLTF(model.file);

  React.useEffect(() => {
    if (scene) { setLoaded(true); onLoad(); }
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const angle = angleOffset + Date.now() * 0.00015;
    groupRef.current.position.set(Math.sin(angle) * radius, 0.5 + Math.sin(angle * 0.7) * 0.3, Math.cos(angle) * radius);
    groupRef.current.lookAt(0, 0.5, 0);
    groupRef.current.rotation.z += delta * 0.3;
  });

  return (
    <group ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {loaded && (
        <primitive object={scene} scale={0.1} />
      )}
      {!loaded && (
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshPhysicalMaterial color={model.color} transparent opacity={0.3} />
        </mesh>
      )}
      <mesh position={[0, -0.22, 0]}>
        <RoundedBox args={[0.22, 0.006, 0.22]} radius={0.005}>
          <meshStandardMaterial color={model.color} emissive={model.color} emissiveIntensity={hovered ? 0.8 : 0.05} />
        </RoundedBox>
      </mesh>
      <sprite position={[0, -0.26, 0]} scale={[0.3, 0.035, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 28;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(model.name, 128, 14);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.9} depthTest={false} />
      </sprite>
    </group>
  );
}

/* ========== LOP HOC (CLASSROOM) ========== */
function Classroom({ componentId }: { componentId: string }) {
  const model = MODELS.find(m => m.id === componentId)!;
  const { scene } = useGLTF(model.file);
  const [glbReady, setGlbReady] = useState(false);
  const pedestalRef = useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (!scene) return;
    scene.traverse((c) => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });
    setGlbReady(true);
  }, [scene]);

  return (
    <group>
      <color attach="background" args={['#eef4ff']} />
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.4} />
      </mesh>
      {/* Grid */}
      {Array.from({ length: 17 }).map((_, i) => (
        <React.Fragment key={`g-${i}`}>
          <mesh position={[-8 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.004, 16]} /><meshPhysicalMaterial color="#d0d8e4" transparent opacity={0.1} /></mesh>
          <mesh position={[0, 0, -8 + i]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 0.004]} /><meshPhysicalMaterial color="#d0d8e4" transparent opacity={0.1} /></mesh>
        </React.Fragment>
      ))}
      {/* Walls */}
      <mesh position={[0, 1.6, -8]}><boxGeometry args={[16, 3.2, 0.1]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.6, 8]}><boxGeometry args={[16, 3.2, 0.1]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-8, 1.6, 0]}><boxGeometry args={[0.1, 3.2, 16]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh position={[8, 1.6, 0]}><boxGeometry args={[0.1, 3.2, 16]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      {/* Windows */}
      {[[0, 2, -7.94], [0, 2, 7.94]].map((pos, wi) => (
        <group key={`win-${wi}`} position={pos as [number, number, number]}>
          <mesh><planeGeometry args={[12, 2]} /><meshPhysicalMaterial color="#b8d4f0" transparent opacity={0.12} roughness={0.1} side={THREE.DoubleSide} /></mesh>
          {[-6, -2, 2, 6].map(x => (
            <mesh key={`wf-${x}`} position={[x, 0, 0.01]}><planeGeometry args={[1.5, 2.2]} /><meshPhysicalMaterial color="#c8e0ff" transparent opacity={0.06} side={THREE.DoubleSide} /></mesh>
          ))}
        </group>
      ))}
      {/* Side windows */}
      {[[-7.94, 2, -1], [-7.94, 2, 1], [7.94, 2, -1], [7.94, 2, 1]].map((pos, wi) => (
        <mesh key={`ws-${wi}`} position={pos as [number, number, number]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 1.8]} /><meshPhysicalMaterial color="#c8e0ff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Whiteboard */}
      <group position={[0, 1.4, -7.94]}>
        <mesh><planeGeometry args={[4, 1.8]} /><meshPhysicalMaterial color="#1a1a2e" roughness={0.6} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.95, 0.005]}><planeGeometry args={[3.6, 0.12]} /><meshPhysicalMaterial color="#222" roughness={0.5} side={THREE.DoubleSide} /></mesh>
        {/* Specs text on board */}
        <sprite position={[0, 0.5, 0.005]} scale={[2.8, 0.6, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 512; c.height = 120;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = '#0a0a1e'; ctx.fillRect(0, 0, 512, 120);
            ctx.fillStyle = '#88bbcc'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText(model.name, 256, 22);
            ctx.fillStyle = '#ddeeff'; ctx.font = '10px monospace';
            ctx.fillText(model.badge, 128, 50);
            ctx.fillStyle = '#6688aa'; ctx.font = '10px monospace';
            ctx.fillText(model.specs, 256, 80);
            ctx.fillStyle = '#445566'; ctx.font = '9px monospace';
            ctx.fillText('Dung tay de xoay | WASD di chuyen', 256, 108);
            return new THREE.CanvasTexture(c);
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      </group>
      {/* Ceiling */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial color="#f0f2f5" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Pedestal with component */}
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.3, 0.35, 0.24, 16]} /><meshPhysicalMaterial color="#d0d8e0" roughness={0.3} metalness={0.1} /></mesh>
      <mesh position={[0, 0.26, 0]}><cylinderGeometry args={[0.35, 0.3, 0.04, 16]} /><meshPhysicalMaterial color="#e0e6f0" roughness={0.2} metalness={0.1} /></mesh>
      <mesh position={[0, 0.28, 0]}><RoundedBox args={[0.6, 0.008, 0.6]} radius={0.008}><meshStandardMaterial color={model.color} roughness={0.2} emissive={model.color} emissiveIntensity={0.15} /></RoundedBox></mesh>
      <group ref={pedestalRef} position={[0, 0.3, 0]}>
        {glbReady && <primitive object={scene} scale={0.12} />}
        {!glbReady && (
          <mesh><boxGeometry args={[0.15, 0.15, 0.15]} /><meshPhysicalMaterial color={model.color} transparent opacity={0.5} /></mesh>
        )}
      </group>
    </group>
  );
}

/* ========== CAMERA LOOK ========== */
function CameraLook() {
  const { camera } = useThree();
  const k = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = true; };
    const up = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    camera.position.set(0, 1.6, 0);
    euler.current.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const rp = -headTrackingRef.pitch * 2.2;
    const ry = headTrackingRef.yaw * 3;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.008) { ay.current += (ry - py.current) * 0.6; py.current = ry; }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();
    const m = new THREE.Vector3();
    if (k.current.w) m.add(fwd); if (k.current.s) m.sub(fwd);
    if (k.current.a) m.sub(right); if (k.current.d) m.add(right);
    if (m.length() > 0) {
      m.normalize().multiplyScalar(3 * d);
      const np = camera.position.clone().add(m);
      np.x = THREE.MathUtils.clamp(np.x, -7, 7);
      np.z = THREE.MathUtils.clamp(np.z, -7, 7);
      np.y = 1.6; camera.position.copy(np);
    }
  });
  return null;
}

/* ========== 3D HAND ========== */
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
    const scale = 0.35;
    const pts3 = lm.map(p => new THREE.Vector3((p[0] - 0.5) * scale, -(p[1] - 0.5) * scale, p[2] * scale * 0.3));
    setPts([...pts3]);
    if (!groupRef.current) return;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const pos = camera.position.clone().add(fwd.multiplyScalar(1.0));
    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  if (!pts || pts.length < 21) return null;
  return (
    <group ref={groupRef}>
      {pts.map((p, i) => (
        <mesh key={`j-${i}`} position={p}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshPhysicalMaterial color={handDataRef.pointing && i === 8 ? '#00ff88' : '#ffccaa'} emissive={handDataRef.pointing && i === 8 ? '#00ff88' : '#ff8844'} emissiveIntensity={0.6} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {HAND_BONES.map(([a, b], i) => {
        if (!pts[a] || !pts[b]) return null;
        const mid = new THREE.Vector3().addVectors(pts[a], pts[b]).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(pts[b], pts[a]);
        const len = dir.length();
        if (len < 0.002) return null;
        return (
          <mesh key={`b-${i}`} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
            <cylinderGeometry args={[0.004, 0.004, len, 4]} />
            <meshPhysicalMaterial color="#eebb99" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ========== MAIN ========== */
export default function ShowroomScene({ component, onBack }: { component: string | null; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(component);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
    MODELS.forEach(m => useGLTF.preload(m.file));
  }, []);

  if (!selected) {
    return (
      <div className="w-full h-screen bg-[#0a0a1e] relative overflow-hidden">
        <UnifiedTracker />
        <Canvas camera={{ position: [0, 1.6, 0], fov: 60, near: 0.1, far: 20 }} onCreated={() => {}}>
          <OrbitSelector onSelect={handleSelect} />
          <Hand3D />
        </Canvas>
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: '#6688aa', fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>
          Chon linh kien de kham pha<br/>
          <span style={{ color: '#445566', fontSize: 10 }}>Webcam: mat nhin + tay chi</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#eef4ff] relative overflow-hidden">
      <UnifiedTracker />
      <button onClick={() => { setSelected(null); onBack(); }} style={{
        position: 'fixed', top: 16, right: 16, zIndex: 50,
        padding: '8px 16px', borderRadius: 8,
        background: 'rgba(0,0,0,0.5)', color: '#8af',
        fontFamily: 'monospace', fontSize: 12, textDecoration: 'none',
        border: '1px solid rgba(100,100,255,0.2)', backdropFilter: 'blur(4px)',
        cursor: 'pointer',
      }}>Chon lai</button>

      <Canvas shadows camera={{ position: [0, 1.6, 4], fov: 60, near: 0.1, far: 25 }}>
        <CameraLook />
        <ambientLight intensity={1.4} color="#d8e8ff" />
        <hemisphereLight args={['#c8d8ff', '#aabbcc', 0.6]} />
        <directionalLight position={[8, 12, 6]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 6, 4]} intensity={0.6} color="#d0e0f0" />
        <pointLight position={[0, 3.5, 0]} intensity={0.6} color="#c0d8ff" />
        <pointLight position={[4, 3, 4]} intensity={0.4} color="#d0e8ff" />
        <pointLight position={[-4, 3, -4]} intensity={0.4} color="#d0e8ff" />
        <Classroom componentId={selected} />
        <Hand3D />
      </Canvas>
    </div>
  );
}
