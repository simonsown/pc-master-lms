'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import { showroomRef } from './showroom-shared';
import UnifiedTracker from './UnifiedTracker';

/* ========== FLOOR ========== */
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <circleGeometry args={[8, 24]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[7.5, 7.8, 24]} />
        <meshPhysicalMaterial color="#d0d8e0" roughness={0.3} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 24]} />
        <meshPhysicalMaterial color="#f0f2f5" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ========== CAMERA LOOK ========== */
function CameraLook() {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  useFrame(() => {
    const rp = -headTrackingRef.pitch * 2.2;
    const ry = headTrackingRef.yaw * 3;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.008) {
      ay.current += (ry - py.current) * 0.6;
      py.current = ry;
    }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
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
  const locRef = useRef<THREE.Vector3[]>([]);
  const [pointing, setPointing] = useState(false);

  useFrame(() => {
    const h = handDataRef;
    if (!h.active || !h.landmarks || h.landmarks.length < 21) {
      setPts(null); setPointing(false);
      showroomRef.handActive = false;
      showroomRef.pointing = false;
      return;
    }
    setPointing(h.pointing);
    showroomRef.handActive = true;
    showroomRef.pointing = h.pointing;

    const lm = h.landmarks;
    const scale = 0.35;
    const pts3 = lm.map(p => new THREE.Vector3(
      (p[0] - 0.5) * scale, -(p[1] - 0.5) * scale, p[2] * scale * 0.3
    ));
    locRef.current = pts3;
    setPts([...pts3]);

    if (!groupRef.current) return;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const pos = camera.position.clone().add(fwd.multiplyScalar(1.0));
    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(camera.quaternion);

    const idxTip = pts3[8].clone();
    idxTip.applyQuaternion(camera.quaternion);
    idxTip.add(pos);
    showroomRef.indexTipWorld.copy(idxTip);
  });

  if (!pts || pts.length < 21) return null;

  return (
    <group ref={groupRef}>
      {pts.map((p, i) => (
        <mesh key={`j-${i}`} position={p}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshPhysicalMaterial
            color={pointing && i === 8 ? '#00ff88' : '#ffccaa'}
            emissive={pointing && i === 8 ? '#00ff88' : '#ff8844'}
            emissiveIntensity={0.6}
            roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {HAND_BONES.map(([a, b], i) => {
        if (!pts[a] || !pts[b]) return null;
        const mid = new THREE.Vector3().addVectors(pts[a], pts[b]).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(pts[b], pts[a]);
        const len = dir.length();
        if (len < 0.002) return null;
        return (
          <mesh key={`b-${i}`} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), dir.clone().normalize()
          )}>
            <cylinderGeometry args={[0.004, 0.004, len, 4]} />
            <meshPhysicalMaterial color="#eebb99" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ========== ORBITING GLB ========== */
function OrbitingGlb({ onLoaded }: { onLoaded: () => void }) {
  const { scene } = useGLTF('/models/computer_components.glb');
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);
  const radiusRef = useRef(2.0);
  const targetRadius = useRef(2.0);
  const [ready, setReady] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    setReady(true);
    onLoaded();
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current || !ready) return;

    const idx = showroomRef.indexTipWorld;
    const compPos = groupRef.current.position;
    const dist = idx.distanceTo(compPos);

    if (showroomRef.handActive && showroomRef.pointing && dist < 2.5) {
      touched.current = true;
    }

    if (touched.current) {
      targetRadius.current = 0.5;
      const targetAngle = angleRef.current;
      angleRef.current += (targetAngle - angleRef.current) * 3 * delta;
    } else {
      angleRef.current += delta * 0.3;
      targetRadius.current = 2.0;
    }

    radiusRef.current += (targetRadius.current - radiusRef.current) * 3 * delta;
    const x = Math.sin(angleRef.current) * radiusRef.current;
    const z = Math.cos(angleRef.current) * radiusRef.current;
    groupRef.current.position.set(x, 0.6, z);

    if (!touched.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
    groupRef.current.lookAt(0, 0.6, 0);
  });

  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <RoundedBox args={[0.4, 0.006, 0.4]} radius={0.008}>
          <meshStandardMaterial color="#4488ff" roughness={0.2} metalness={0.3}
            emissive="#4488ff" emissiveIntensity={touched.current ? 0.9 : 0.05} />
        </RoundedBox>
      </mesh>
      {ready && (
        <group ref={groupRef} position={[2, 0.6, 0]} scale={0.12}>
          <primitive object={scene} />
        </group>
      )}
    </group>
  );
}

/* ========== OVERLAY ========== */
function Overlay() {
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 16, alignItems: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      borderRadius: 12, padding: '8px 20px', zIndex: 10,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <span style={{ color: '#8af', fontSize: 12, fontFamily: 'monospace' }}>Chi tay vao linh kien</span>
    </div>
  );
}

/* ========== MAIN ========== */
function LoadingScreen({ progress }: { progress: { tracker: boolean; glb: boolean } }) {
  const pct = [progress.tracker, progress.glb].filter(Boolean).length / 2;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#f0f4ff', color: '#4488ff', fontFamily: 'monospace', fontSize: 13,
      transition: 'opacity 0.5s', opacity: pct >= 1 ? 0 : 1, pointerEvents: pct >= 1 ? 'none' : 'auto',
    }}>
      <div style={{ marginBottom: 20 }}>Dang tai...</div>
      <div style={{ width: 160, height: 3, background: '#d0d8e0', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: '#4488ff', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <div style={{ color: '#88aacc', fontSize: 11 }}>
        {!progress.tracker ? 'Dang tai AI...' : !progress.glb ? 'Dang tai mo hinh 3D...' : 'San sang!'}
      </div>
    </div>
  );
}

export default function ShowroomScene() {
  useGLTF.preload('/models/computer_components.glb');
  const [progress, setProgress] = useState({ tracker: false, glb: false });

  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
      <LoadingScreen progress={progress} />
      <UnifiedTracker onReady={() => setProgress(p => ({ ...p, tracker: true }))} />
      <Canvas shadows camera={{ position: [0, 1.6, 3.5], fov: 60, near: 0.1, far: 15 }}
        onCreated={() => setProgress(p => ({ ...p, glb: p.glb }))}>
        <color attach="background" args={['#f0f4ff']} />
        <CameraLook />
        <ambientLight intensity={1.4} color="#d8e8ff" />
        <hemisphereLight args={['#c8d8ff', '#aabbcc', 0.6]} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 6, 4]} intensity={0.6} color="#d0e0f0" />
        <pointLight position={[0, 3.5, 0]} intensity={0.8} color="#c0d8ff" />
        <pointLight position={[3, 3, 3]} intensity={0.4} color="#d0e8ff" />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#d0e8ff" />
        <Floor />
        <OrbitingGlb onLoaded={() => setProgress(p => ({ ...p, glb: true }))} />
        <Hand3D />
      </Canvas>
      <Overlay />
    </div>
  );
}
