'use client';

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { headTrackingRef } from './head-tracker-shared';

const HeadTracker = dynamic(() => import('./HeadTracker'), { ssr: false });

/* ========== LIGHTWEIGHT HAND TRACKING (no MediaPipe) ========== */
const handRef = { x: 0, y: 0, pointing: false, active: false };

function SimpleHandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    let animId: number;
    let mounted = true;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user', frameRate: { ideal: 15 } },
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = 160; canvas.height = 120;
        const ctx = canvas.getContext('2d')!;
        let prevX = 0, prevY = 0;

        const loop = () => {
          if (!mounted) return;
          ctx.drawImage(video, 0, 0, 160, 120);
          const imageData = ctx.getImageData(0, 0, 160, 120);
          const data = imageData.data;
          let sumX = 0, sumY = 0, count = 0;
          let topY = 120, topX = 0;

          for (let y = 0; y < 120; y += 3) {
            for (let x = 0; x < 160; x += 3) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              const isSkin = r > 40 && r < 220 && g > 30 && g < 200 && b > 15 && b < 170
                && r > g * 0.6 && g > b * 0.5 && r - g > 8;
              if (isSkin) {
                sumX += x; sumY += y; count++;
                if (y < topY) { topY = y; topX = x; }
              }
            }
          }

          if (count > 30) {
            const cx = sumX / count / 160;
            const cy = sumY / count / 120;
            handRef.x = cx;
            handRef.y = cy;
            handRef.active = true;
            let pixelCount = 0;
            for (let dy = 0; dy < 15; dy++) {
              for (let dx = -5; dx <= 5; dx++) {
                const px = Math.round(topX + dx);
                const py = Math.round(topY + dy);
                if (px >= 0 && px < 160 && py >= 0 && py < 120) {
                  const idx = (py * 160 + px) * 4;
                  if (data[idx] > 60) pixelCount++;
                }
              }
            }
            handRef.pointing = pixelCount > 10 && topY < 40;
          } else {
            handRef.active = false;
            handRef.pointing = false;
          }
          animId = requestAnimationFrame(loop);
        };
        loop();
      } catch { /* no camera */ }
    };
    start();
    return () => { mounted = false; if (stream) stream.getTracks().forEach(t => t.stop()); cancelAnimationFrame(animId); };
  }, []);

  return <video ref={videoRef} style={{ display: 'none' }} playsInline muted />;
}

/* ========== FLOOR ========== */
function ShowroomFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <circleGeometry args={[10, 32]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[9.5, 9.8, 32]} />
        <meshPhysicalMaterial color="#d0d8e0" roughness={0.3} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 32]} />
        <meshPhysicalMaterial color="#f0f2f5" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ========== CAMERA RIG ========== */
function ShowroomCamera() {
  const { camera } = useThree();
  const k = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = true; };
    const up = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    camera.position.set(0, 1.6, 3.5);
    euler.current.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const rp = -headTrackingRef.pitch * 2.2;
    const ry = headTrackingRef.yaw * 3;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.008) {
      ay.current += (ry - py.current) * 0.6;
      py.current = ry;
    }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
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
      np.x = THREE.MathUtils.clamp(np.x, -8, 8);
      np.z = THREE.MathUtils.clamp(np.z, -8, 8);
      np.y = 1.6;
      camera.position.copy(np);
    }
  });
  return null;
}

/* ========== 3D HAND MODEL ========== */
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
];

function Hand3D() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !handRef.active) return;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const pos = camera.position.clone().add(fwd.multiplyScalar(1.2));
    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  if (!handRef.active) return null;

  const hx = (handRef.x - 0.5) * 0.3;
  const hy = -(handRef.y - 0.5) * 0.3;

  const base = new THREE.Vector3(hx, hy, -0.1);
  const joints: THREE.Vector3[] = [
    base, base.clone().add(new THREE.Vector3(0.01, -0.01, 0)),
    base.clone().add(new THREE.Vector3(0.015, -0.015, 0.005)),
    base.clone().add(new THREE.Vector3(0.02, -0.018, 0.005)),
    base.clone().add(new THREE.Vector3(0.025, -0.02, 0.005)),
    base.clone().add(new THREE.Vector3(0, 0.01, 0)),
    base.clone().add(new THREE.Vector3(0, 0.025, 0)),
    base.clone().add(new THREE.Vector3(0, 0.035, 0.002)),
    base.clone().add(new THREE.Vector3(0, 0.048, 0.005)),
    base.clone().add(new THREE.Vector3(0.008, 0.01, 0)),
    base.clone().add(new THREE.Vector3(0.012, 0.025, 0.002)),
    base.clone().add(new THREE.Vector3(0.015, 0.03, 0.005)),
    base.clone().add(new THREE.Vector3(0.018, 0.04, 0.005)),
    base.clone().add(new THREE.Vector3(-0.008, 0.01, 0)),
    base.clone().add(new THREE.Vector3(-0.012, 0.02, 0)),
    base.clone().add(new THREE.Vector3(-0.015, 0.028, 0.002)),
    base.clone().add(new THREE.Vector3(-0.018, 0.035, 0.002)),
    base.clone().add(new THREE.Vector3(-0.015, 0, 0)),
    base.clone().add(new THREE.Vector3(-0.022, -0.005, 0)),
    base.clone().add(new THREE.Vector3(-0.028, -0.005, 0.002)),
    base.clone().add(new THREE.Vector3(-0.035, -0.008, 0.002)),
  ];

  const idxTip = joints[8];

  return (
    <group ref={groupRef}>
      {joints.map((p, i) => (
        <mesh key={`j-${i}`} position={p}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshPhysicalMaterial
            color={handRef.pointing && i === 8 ? '#00ff88' : '#ffccaa'}
            emissive={handRef.pointing && i === 8 ? '#00ff88' : '#ff8844'}
            emissiveIntensity={handRef.pointing && i === 8 ? 0.8 : 0.1}
            roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {CONNECTIONS.map(([a, b], i) => {
        if (!joints[a] || !joints[b]) return null;
        const mid = new THREE.Vector3().addVectors(joints[a], joints[b]).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(joints[b], joints[a]);
        const len = dir.length();
        if (len < 0.001) return null;
        return (
          <mesh key={`b-${i}`} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), dir.clone().normalize()
          )}>
            <cylinderGeometry args={[0.005, 0.005, len, 4]} />
            <meshPhysicalMaterial color="#eebb99" roughness={0.6} />
          </mesh>
        );
      })}
      {handRef.pointing && (
        <sprite position={[idxTip.x, idxTip.y + 0.04, idxTip.z]} scale={[0.06, 0.02, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 64; c.height = 24;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = '#00ff88'; ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('CHON', 32, 12);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.9} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

/* ========== PEDESTAL + GLB VIEWER ========== */
function GlbViewer({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  const { scene } = useGLTF('/models/computer_components.glb');
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const rotRef = useRef(0);
  const targetPos = useRef(new THREE.Vector3(0, 0.45, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0.34, 0));

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material?.clone();
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!selected) {
      rotRef.current += delta * 0.5;
    }
    groupRef.current.rotation.y = rotRef.current;
    targetPos.current.y = selected ? 0.45 : 0.34;
    currentPos.current.lerp(targetPos.current, delta * 3);
    groupRef.current.position.y = currentPos.current.y;
  });

  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
        <meshPhysicalMaterial color="#d0d8e0" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.04, 16]} />
        <meshPhysicalMaterial color="#e0e6f0" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <RoundedBox args={[0.28, 0.008, 0.28]} radius={0.006}>
          <meshStandardMaterial color="#4488ff" roughness={0.2} metalness={0.3}
            emissive="#4488ff" emissiveIntensity={selected ? 0.9 : hovered ? 0.4 : 0.05} />
        </RoundedBox>
      </mesh>
      <group ref={groupRef} position={[0, 0.34, 0]} scale={selected ? 0.1 : 0.14}
        onPointerOver={(e) => { e.stopPropagation(); if (!selected) { setHovered(true); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={() => { setHovered(false); if (!selected) document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <primitive object={scene} />
      </group>
      {hovered && !selected && (
        <sprite position={[0, 0.55, 0]} scale={[0.25, 0.07, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 128; c.height = 32;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 128, 32, 6); ctx.fill();
            ctx.fillStyle = '#4488ff'; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Bam de chon', 64, 16);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      )}
      {selected && (
        <sprite position={[0, 0.55, 0]} scale={[0.3, 0.07, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 200; c.height = 32;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(0,20,40,0.8)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 200, 32, 6); ctx.fill();
            ctx.fillStyle = '#88ccff'; ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Da chon - Bam lai de bo chon', 100, 16);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

/* ========== OVERLAY ========== */
function Overlay({ selected }: { selected: boolean }) {
  return (
    <>
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        borderRadius: 10, padding: '8px 18px', zIndex: 10,
        border: '1px solid rgba(255,255,255,0.08)', color: '#fff',
        fontFamily: 'monospace', fontSize: 12,
      }}>
        {selected
          ? 'Da chon — di chuyen de xem xung quanh'
          : 'Bam hoac gio ngon tro de chon linh kien'}
      </div>
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, alignItems: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '8px 20px', zIndex: 10,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ color: '#8af', fontSize: 12, fontFamily: 'monospace' }}>WASD di chuyen</span>
        <span style={{ color: '#888', fontSize: 12, fontFamily: 'monospace' }}>|</span>
        <span style={{ color: '#6cf', fontSize: 12, fontFamily: 'monospace' }}>Webcam: mat nhin + tay chi</span>
      </div>
    </>
  );
}

/* ========== MAIN ========== */
export default function ShowroomScene() {
  const [selected, setSelected] = useState(false);

  const handleSelect = useCallback(() => {
    setSelected(p => !p);
  }, []);

  useGLTF.preload('/models/computer_components.glb');

  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
      <HeadTracker />
      <SimpleHandTracker />
      <Canvas shadows camera={{ position: [0, 1.6, 3.5], fov: 60, near: 0.1, far: 20 }}>
        <color attach="background" args={['#f0f4ff']} />
        <ShowroomCamera />

        <ambientLight intensity={1.4} color="#e8f0ff" />
        <hemisphereLight args={['#d0e0ff', '#aabbcc', 0.6]} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 6, 4]} intensity={0.6} color="#d0e0f0" />
        <pointLight position={[0, 3.5, 0]} intensity={0.8} color="#c0d8ff" />
        <pointLight position={[3, 3, 3]} intensity={0.4} color="#d0e8ff" />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#d0e8ff" />

        <ShowroomFloor />

        <GlbViewer selected={selected} onSelect={handleSelect} />

        <Hand3D />
      </Canvas>
      <Overlay selected={selected} />
    </div>
  );
}
