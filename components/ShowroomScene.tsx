'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { headTrackingRef } from './head-tracker-shared';
import { handDataRef } from './hand-shared';
import UnifiedTracker from './UnifiedTracker';

/* ========== FLOOR ========== */
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshPhysicalMaterial color="#e8ecf0" roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[7.5, 7.8, 32]} />
        <meshPhysicalMaterial color="#d0d8e0" roughness={0.3} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshPhysicalMaterial color="#f0f2f5" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ========== CAMERA LOOK (face tracking) ========== */
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
  const [pinching, setPinching] = useState(false);

  useFrame(() => {
    const h = handDataRef;
    if (!h.active || !h.landmarks || h.landmarks.length < 21) {
      setPts(null); setPointing(false); setPinching(false);
      return;
    }
    setPointing(h.pointing);
    setPinching(h.pinch);

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
  });

  if (!pts || pts.length < 21) return null;

  return (
    <group ref={groupRef}>
      {pts.map((p, i) => (
        <mesh key={`j-${i}`} position={p}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshPhysicalMaterial
            color={pointing && i === 8 ? '#00ff88' : pinching && (i === 4 || i === 8) ? '#ff8800' : '#ffccaa'}
            emissive={pointing && i === 8 ? '#00ff88' : pinching && (i === 4 || i === 8) ? '#ff8800' : '#ff8844'}
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
      {pointing && (
        <sprite position={[pts[8].x, pts[8].y + 0.03, pts[8].z]} scale={[0.05, 0.018, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 64; c.height = 20;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = '#00ff88'; ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('CHON', 32, 10);
            return new THREE.CanvasTexture(c);
          })()} transparent opacity={0.9} depthTest={false} />
        </sprite>
      )}
      {pinching && (
        <sprite position={[pts[4].x + 0.02, pts[4].y + 0.02, pts[4].z]} scale={[0.05, 0.018, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 64; c.height = 20;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = '#ff8800'; ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('XOAY', 32, 10);
            return new THREE.CanvasTexture(c);
          })()} transparent opacity={0.9} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

/* ========== ORBITING GLB ========== */
function OrbitingGlb() {
  const { scene } = useGLTF('/models/computer_components.glb');
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);
  const radiusRef = useRef(2.0);
  const targetRadius = useRef(2.0);
  const spinRef = useRef(0);
  const [state, setState] = useState<'orbit' | 'approaching' | 'showing' | 'spinning'>('orbit');

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const h = handDataRef;

    if (h.pointing && state === 'orbit') {
      setState('approaching');
    }
    if (h.pinch && (state === 'showing' || state === 'approaching')) {
      setState('spinning');
    }
    if (!h.active && state !== 'orbit') {
      setState('orbit');
    }

    switch (state) {
      case 'orbit':
        angleRef.current += delta * 0.4;
        targetRadius.current = 2.0;
        break;
      case 'approaching':
        angleRef.current += delta * 0.1;
        targetRadius.current = 0.6;
        if (Math.abs(radiusRef.current - 0.6) < 0.02) setState('showing');
        break;
      case 'showing':
        targetRadius.current = 0.6;
        if (h.pinch) setState('spinning');
        if (!h.active) setState('orbit');
        break;
      case 'spinning':
        targetRadius.current = 0.6;
        spinRef.current += delta * 2.0;
        groupRef.current.rotation.x = Math.sin(spinRef.current) * 0.3;
        groupRef.current.rotation.z = Math.cos(spinRef.current * 0.7) * 0.2;
        if (!h.pinch) setState('showing');
        if (!h.active) setState('orbit');
        break;
    }

    radiusRef.current += (targetRadius.current - radiusRef.current) * 3 * delta;
    const x = Math.sin(angleRef.current) * radiusRef.current;
    const z = Math.cos(angleRef.current) * radiusRef.current;
    groupRef.current.position.set(x, 0.6, z);
    groupRef.current.lookAt(0, 0.6, 0);

    if (state !== 'spinning') {
      spinRef.current += delta * 0.5;
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.z = 0;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <RoundedBox args={[0.4, 0.006, 0.4]} radius={0.008}>
          <meshStandardMaterial color="#4488ff" roughness={0.2} metalness={0.3}
            emissive="#4488ff" emissiveIntensity={state !== 'orbit' ? 0.8 : 0.05} />
        </RoundedBox>
      </mesh>
      <group ref={groupRef} position={[2, 0.6, 0]} scale={0.12}>
        <primitive object={scene} />
      </group>
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
      <span style={{ color: '#8af', fontSize: 12, fontFamily: 'monospace' }}>Chi tay → linh kien chay lai</span>
      <span style={{ color: '#888', fontSize: 12, fontFamily: 'monospace' }}>|</span>
      <span style={{ color: '#f80', fontSize: 12, fontFamily: 'monospace' }}>Chup ngon tay → xoay linh kien</span>
    </div>
  );
}

/* ========== MAIN ========== */
export default function ShowroomScene() {
  useGLTF.preload('/models/computer_components.glb');

  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
      <UnifiedTracker />
      <Canvas shadows camera={{ position: [0, 1.6, 3.5], fov: 60, near: 0.1, far: 15 }}>
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
        <OrbitingGlb />
        <Hand3D />
      </Canvas>
      <Overlay />
    </div>
  );
}
