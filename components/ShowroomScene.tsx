'use client';

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { handRotationRef } from './hand-rotation-shared';

/* ========== INSTRUMEN CARD ========== */
function InstrumentCard({ lang }: { lang: 'en' | 'vn' }) {
  const t = (en: string, vn: string) => lang === 'en' ? en : vn;
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      borderRadius: 14, padding: '10px 22px', zIndex: 10,
      display: 'flex', gap: 20, alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <span style={{ color: '#8af', fontSize: 13, fontFamily: 'monospace' }}>
        {t('Click a component to inspect', 'Bấm linh kiện để xem chi tiết')}
      </span>
      <span style={{ color: '#888', fontSize: 11, fontFamily: 'monospace' }}>
        WASD {t('move', 'di chuyển')}
      </span>
      <span style={{ color: '#888', fontSize: 11, fontFamily: 'monospace' }}>
        {t('Hand', 'Tay')} → {t('rotate', 'xoay')}
      </span>
    </div>
  );
}

/* ========== HAND TRACKER WRAPPER ========== */
function ShowroomHandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    let animId: number;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user', frameRate: { ideal: 15 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch { /* no camera */ }
    };
    start();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); cancelAnimationFrame(animId); };
  }, []);

  useEffect(() => {
    if (!ready || !videoRef.current) return;
    const video = videoRef.current;
    let prevX = 0, prevY = 0;

    const loop = () => {
      if (video.readyState < 2) { requestAnimationFrame(loop); return; }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) { requestAnimationFrame(loop); return; }
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let sumX = 0, sumY = 0, count = 0;
      const skinLow = [0, 40, 60], skinHigh = [50, 200, 170];

      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          if (r > skinLow[0] && r < skinHigh[0] && g > skinLow[1] && g < skinHigh[1] && b > skinLow[2] && b < skinHigh[2]) {
            sumX += x; sumY += y; count++;
          }
        }
      }

      if (count > 20) {
        const cx = sumX / count / canvas.width;
        const cy = sumY / count / canvas.height;
        const dx = cx - prevX;
        const dy = cy - prevY;
        if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) {
          handRotationRef.x += dx * 6;
          handRotationRef.y += dy * 4;
          handRotationRef.active = true;
        }
        prevX = cx; prevY = cy;
      } else {
        handRotationRef.active = false;
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [ready]);

  return <video ref={videoRef} style={{ display: 'none' }} playsInline muted />;
}

/* ========== FLOOR + ENVIRONMENT ========== */
function ShowroomFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <circleGeometry args={[12, 48]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[11.5, 11.8, 48]} />
        <meshPhysicalMaterial color="#2a2a4e" roughness={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`pillar-${i}`} position={[Math.sin(a) * 7, 1.5, Math.cos(a) * 7]}>
            <cylinderGeometry args={[0.06, 0.08, 3, 8]} />
            <meshPhysicalMaterial color="#2a2a4e" metalness={0.5} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[12, 48]} />
        <meshPhysicalMaterial color="#0a0a1e" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ========== CAMERA RIG ========== */
function ShowroomCamera({ fwdRef }: { fwdRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const k = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = true; };
    const up = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    camera.position.set(0, 1.6, 4);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();
    const m = new THREE.Vector3();
    if (k.current.w) m.add(fwd);
    if (k.current.s) m.sub(fwd);
    if (k.current.a) m.sub(right);
    if (k.current.d) m.add(right);
    if (m.length() > 0) {
      m.normalize().multiplyScalar(4 * d);
      const np = camera.position.clone().add(m);
      np.x = THREE.MathUtils.clamp(np.x, -10, 10);
      np.z = THREE.MathUtils.clamp(np.z, -10, 10);
      np.y = 1.6;
      camera.position.copy(np);
    }
    fwdRef.current.copy(fwd);
  });
  return null;
}

/* ========== PEDESTAL ========== */
function Pedestal({ position, color, label, children, onSelect, isSelected }: {
  position: [number, number, number]; color: string; label: string;
  children: React.ReactNode; onSelect: () => void; isSelected: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const glowIntensity = isSelected ? 0.8 : hovered ? 0.4 : 0.08;

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.24, 12]} />
        <meshPhysicalMaterial color="#222" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.04, 12]} />
        <meshPhysicalMaterial color="#333" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <RoundedBox args={[0.18, 0.008, 0.18]} radius={0.005}>
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2}
            emissive={color} emissiveIntensity={glowIntensity} />
        </RoundedBox>
      </mesh>
      <group position={[0, 0.3, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        {children}
      </group>
      {hovered && !isSelected && (
        <sprite position={[0, 0.44, 0]} scale={[0.2, 0.06, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 128; c.height = 32;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 128, 32, 6); ctx.fill();
            ctx.fillStyle = color; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(label, 64, 16);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      )}
      <mesh position={[0, 0.28, 0]}>
        <RoundedBox args={[0.16, 0.004, 0.16]} radius={0.005}>
          <meshBasicMaterial transparent opacity={0} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

/* ========== COMPONENT MODELS (smaller scale for showroom) ========== */
function ShowroomCPU() {
  const pinPositions = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -0.75; x <= 0.75; x += 0.25)
      for (let z = -0.75; z <= 0.75; z += 0.25)
        arr.push([x, z]);
    return arr;
  }, []);
  const capPositions = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -0.82; x <= 0.82; x += 0.82)
      for (let z = -0.82; z <= 0.82; z += 0.82)
        if (x !== 0 || z !== 0) arr.push([x, z]);
    return arr;
  }, []);

  return (
    <group scale={0.5}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.6, 0.08, 1.6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.7, 0.02, 1.7]} />
        <meshPhysicalMaterial color="#a0a0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshPhysicalMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {pinPositions.map(([x, z]) => (
        <mesh key={`pin-${x}-${z}`} position={[x, -0.12, z]}>
          <cylinderGeometry args={[0.025, 0.035, 0.06, 6]} />
          <meshPhysicalMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.8, 0.25, 0.8]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.01, 0.08]} />
        <meshPhysicalMaterial color="#ff4444" />
      </mesh>
      {capPositions.map(([x, z]) => (
        <mesh key={`cap-${x}-${z}`} position={[x, 0.22, z]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshPhysicalMaterial color="#888" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ShowroomRAM({ color = '#6366f1' }: { color?: string }) {
  return (
    <group scale={0.4} rotation={[0, 0, 0]}>
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[0.028, 0.004, 0.13]} />
        <meshPhysicalMaterial color="#111111" roughness={0.7} metalness={0.05} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={`trace-${i}`} position={[-0.01 + i * 0.01, 0.005, -0.04 + i * 0.035]}>
          <boxGeometry args={[0.002, 0.001, 0.06]} />
          <meshPhysicalMaterial color="#c8a050" metalness={0.6} roughness={0.3} transparent opacity={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.016, 0.008, 0]}>
        <RoundedBox args={[0.006, 0.01, 0.1]} radius={0.003}>
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.016, 0.008, 0]}>
        <RoundedBox args={[0.006, 0.01, 0.1]} radius={0.003}>
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
        </RoundedBox>
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`fin-${i}`} position={[-0.016, 0.013, -0.045 + i * 0.0082]}>
          <boxGeometry args={[0.007, 0.001, 0.003]} />
          <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`fin-r-${i}`} position={[0.016, 0.013, -0.045 + i * 0.0082]}>
          <boxGeometry args={[0.007, 0.001, 0.003]} />
          <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`pin-${i}`} position={[-0.012 + i * 0.0014, 0.001, 0.064]}>
          <boxGeometry args={[0.001, 0.002, 0.004]} />
          <meshPhysicalMaterial color="#d4a017" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[-0.008, 0.005, -0.04]}>
        <boxGeometry args={[0.003, 0.001, 0.002]} />
        <meshPhysicalMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[0.008, 0.005, -0.04]}>
        <boxGeometry args={[0.003, 0.001, 0.002]} />
        <meshPhysicalMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[-0.01, 0.005, 0.035]}>
        <boxGeometry args={[0.004, 0.0015, 0.003]} />
        <meshPhysicalMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <boxGeometry args={[0.002, 0.002, 0.002]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      <sprite position={[0, 0.018, -0.01]} scale={[0.07, 0.02, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 64;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 256, 64);
          ctx.fillStyle = '#aabbcc'; ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('DDR5', 128, 18);
          ctx.fillStyle = '#8899aa'; ctx.font = '8px monospace';
          ctx.fillText('32GB 6400 MT/s CL32', 128, 42);
          const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
          return t;
        })()} transparent opacity={0.9} depthTest={false} />
      </sprite>
    </group>
  );
}

function ShowroomCooler() {
  return (
    <group scale={0.4}>
      <mesh position={[0, 0.003, 0]}>
        <RoundedBox args={[0.08, 0.006, 0.08]} radius={0.003}>
          <meshPhysicalMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
      {[[-0.025, 0, -0.025], [-0.025, 0, 0.025], [0.025, 0, -0.025], [0.025, 0, 0.025]].map((p, i) => (
        <mesh key={`hp-${i}`} position={[p[0], 0.035, p[1]]}>
          <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
          <meshPhysicalMaterial color="#b8860b" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`fin-${i}`} position={[0, 0.01 + i * 0.005, 0]}>
          <boxGeometry args={[0.075, 0.002, 0.075]} />
          <meshPhysicalMaterial color="#d0d0d0" metalness={0.3} roughness={0.4} transparent opacity={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.075, 0]}>
        <torusGeometry args={[0.055, 0.005, 8, 28]} />
        <meshPhysicalMaterial color="#222" roughness={0.6} metalness={0.2} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <mesh key={`blade-${i}`} position={[Math.sin(angle) * 0.032, 0.075, Math.cos(angle) * 0.032]}
            rotation={[0, -angle, 0.55]}>
            <boxGeometry args={[0.005, 0.003, 0.045]} />
            <meshPhysicalMaterial color="#4488cc" transparent opacity={0.35} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.004, 14]} />
        <meshPhysicalMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <torusGeometry args={[0.035, 0.002, 8, 28]} />
        <meshPhysicalMaterial color="#4488cc" transparent opacity={0.2} roughness={0.3} />
      </mesh>
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={`strut-${i}`} position={[Math.sin(angle) * 0.028, 0.075, Math.cos(angle) * 0.028]}
            rotation={[0, -angle + Math.PI / 2, 0]}>
            <boxGeometry args={[0.002, 0.003, 0.022]} />
            <meshPhysicalMaterial color="#333" />
          </mesh>
        );
      })}
    </group>
  );
}

function ShowroomGltfViewer() {
  const { scene } = useGLTF('/models/computer_components.glb');

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive object={scene} scale={0.2} />
  );
}

/* ========== INSPECTED COMPONENT ========== */
function InspectedComponent({ type, onClose }: { type: string | null; onClose: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const baseRot = useRef(0);
  const pitchRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !type) return;

    const h = handRotationRef;
    if (h.active) {
      baseRot.current += h.x * 0.005;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current + h.y * 0.003, -0.8, 0.8);
      h.x = 0;
      h.y = 0;
    } else {
      baseRot.current += delta * 0.3;
    }
    groupRef.current.rotation.y = baseRot.current;
    groupRef.current.rotation.x = pitchRef.current;
  });

  useEffect(() => {
    if (!type) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <group>
      <group ref={groupRef} position={[0, 0.8, -0.8]}>
        {type === 'cpu' && <ShowroomCPU />}
        {type === 'ram' && <ShowroomRAM />}
        {type === 'cooler' && <ShowroomCooler />}
        {type === 'glb' && <ShowroomGltfViewer />}
      </group>
      <sprite position={[0, 1.6, -0.8]} scale={[0.3, 0.07, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 36;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath(); (ctx as any).roundRect(0, 0, 256, 36, 6); ctx.fill();
          ctx.fillStyle = '#8af'; ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('ESC to close  |  Wave hand to rotate', 128, 18);
          const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
          return t;
        })()} transparent opacity={0.95} depthTest={false} />
      </sprite>
    </group>
  );
}

/* ========== SHOWROOM SCENE ========== */
export default function ShowroomScene() {
  const [selected, setSelected] = useState<string | null>(null);
  const fwdRef = useRef(new THREE.Vector3(0, 0, -1));

  const handleSelect = useCallback((type: string) => {
    setSelected(prev => prev === type ? null : type);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const components = useMemo(() => [
    { type: 'cpu', label: 'CPU', color: '#00d4aa', pos: [-2.5, 0, 0] as [number, number, number], comp: <ShowroomCPU /> },
    { type: 'ram', label: 'DDR5 RAM', color: '#6366f1', pos: [0, 0, 2.5] as [number, number, number], comp: <ShowroomRAM /> },
    { type: 'cooler', label: 'CPU Cooler', color: '#00aaff', pos: [2.5, 0, 0] as [number, number, number], comp: <ShowroomCooler /> },
    { type: 'glb', label: 'GLB Model', color: '#f59e0b', pos: [0, 0, -2.5] as [number, number, number], comp: <ShowroomGltfViewer /> },
  ], []);

  return (
    <div className="w-full h-screen bg-[#0a0a1e] relative overflow-hidden">
      <ShowroomHandTracker />
      <Canvas shadows camera={{ position: [0, 1.6, 4], fov: 60, near: 0.1, far: 30 }}>
        <color attach="background" args={['#0a0a1e']} />
        <ShowroomCamera fwdRef={fwdRef} />

        <ambientLight intensity={0.6} color="#4040a0" />
        <hemisphereLight args={['#4040a0', '#1a1a2e', 0.4]} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-3, 6, 4]} intensity={0.4} color="#8080ff" />
        <pointLight position={[0, 3, 0]} intensity={0.6} color="#6060ff" />
        <pointLight position={[3, 2, 3]} intensity={0.3} color="#8080ff" />
        <pointLight position={[-3, 2, -3]} intensity={0.3} color="#8080ff" />

        <ShowroomFloor />

        {components.map((c) => (
          <Pedestal key={c.type} position={c.pos} color={c.color} label={c.label}
            onSelect={() => handleSelect(c.type)} isSelected={selected === c.type}>
            {c.comp}
          </Pedestal>
        ))}

        <InspectedComponent type={selected} onClose={handleClose} />
      </Canvas>
      <InstrumentCard lang="vn" />
    </div>
  );
}
