'use client';

// Cảnh ngoài trời: bầu trời (gradient sky) + mặt trời + mây trôi
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Bầu trời dạng bán cầu với gradient màu + mây instanced trôi nhẹ
export function Sky() {
  return (
    <>
      {/* Nền trời gradient cam/xanh khi hoàng hôn */}
      <color attach="background" args={['#bfe3ff']} />
      <fog attach="fog" args={['#cfe8ff', 50, 140]} />
      <hemisphereLight args={['#ffffff', '#8fd066', 1.1]} />
      <directionalLight
        position={[20, 30, 10]}
        intensity={2.2}
        color="#fff3d6"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
      {/* Mặt trời */}
      <mesh position={[30, 28, -60]}>
        <sphereGeometry args={[6, 24, 24]} />
        <meshBasicMaterial color="#fff7cc" />
      </mesh>
      <pointLight position={[30, 28, -60]} intensity={1.6} color="#fff0c0" distance={110} />
      <Clouds />
    </>
  );
}

// Đám mây di chuyển theo gió
function Cloud({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);
  const speed = 0.1 + Math.abs(Math.sin(seed * 13.7)) * 0.3;
  const y = 16 + (Math.abs(Math.sin(seed * 7.3)) * 10);
  const z = -40 - (Math.abs(Math.sin(seed * 3.1)) * 50);
  const x0 = (Math.sin(seed * 11.3)) * 70;

  const puffs = useMemo(() => {
    const arr = [];
    const count = 5 + Math.floor(Math.abs(Math.sin(seed)) * 4);
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [
          Math.sin(i * 2.4 + seed) * 3.2,
          Math.cos(i * 1.7 + seed) * 0.8,
          Math.cos(i * 2.9 + seed) * 1.6,
        ],
        scale: 1.6 + (Math.abs(Math.sin(i * 3.3 + seed)) * 1.6),
      });
    }
    return arr;
  }, [seed]);

  useFrame((_, dt) => {
    if (!group.current) return;
    // lặp lại khi bay ra khỏi bầu trời
    group.current.position.x -= speed * dt;
    if (group.current.position.x < -85) group.current.position.x = 85;
  });

  const mat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.92 }),
    []);

  return (
    <group ref={group} position={[x0, y, z]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.pos as any} scale={p.scale} material={mat}>
          <sphereGeometry args={[1, 14, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  return (
    <group>
      {Array.from({ length: 7 }).map((_, i) => <Cloud key={i} seed={i * 3.7 + 1.1} />)}
    </group>
  );
}