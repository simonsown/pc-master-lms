'use client';

// Vật tương tác: máy tính PC để người dùng cầm (grab), nắm tay để xoay cổ tay quay.
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { handState, sceneCtrl } from './tracking-shared';

const BASE_POS = new THREE.Vector3(0, 1.0, -6);
const GRAB_SPEED = 0.2;

export function PcCase() {
  const group = useRef<THREE.Group>(null);
  const hanging = useRef(true);
  const spin = useRef(0);
  const { camera } = useThree();

  const caseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1f2937', metalness: 0.6, roughness: 0.35,
  }), []);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0f172a', metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.9,
  }), []);
  const fanMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8', metalness: 0.7, roughness: 0.4,
  }), []);
  const glowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#38e078', emissive: '#38e078', emissiveIntensity: 1.2,
  }), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const h = handState;

    // Khoảng cách tay đến máy trên màn hình
    const objNDC = g.position.clone().project(camera);

    if (h.active) {
      const handX = h.x, handY = h.y;
      const dx = handX - objNDC.x;
      const dy = handY - objNDC.y;
      const handNear = Math.hypot(dx, dy) < 0.3;

      if (h.grab && handNear && !sceneCtrl.grabHeld) {
        sceneCtrl.grabHeld = true;
        hanging.current = true;
      }
      // thả khi mở lòng bàn tay
      if (h.release && sceneCtrl.grabHeld) {
        sceneCtrl.grabHeld = false;
        hanging.current = false;
      }
    }

    if (sceneCtrl.grabHeld) {
      // Kéo máy theo tay (nhẹ nhàng)
      const target = new THREE.Vector3(
        camera.position.x + h.x * 4,
        camera.position.y * 0.4 + (1 - h.y) * 2.5,
        camera.position.z - 3.2
      );
      g.position.lerp(target, GRAB_SPEED * d * 30 * 0.05);
      // Xoay máy theo cổ tay
      g.rotation.y += h.rotSpeed * 2.5;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -h.y * 1.2, 0.05);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, h.rotSpeed * -1.2, 0.05);
      spin.current += Math.abs(h.rotSpeed);
    } else {
      // Trả về vị trí mặc định hoặc lơ lửng giữa
      g.position.x += (0 - g.position.x) * 0.04;
      g.position.y += (1.0 - g.position.y) * 0.04;
      g.position.z += (-3.2 - g.position.z) * 0.04;
      // đối xứng xoay nhẹ
      g.rotation.y += d * 0.6;
      g.rotation.x = 0;
      g.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 1.0, -3.2]} rotation={[0, 0, 0]}>
      {/* Case */}
      <mesh material={caseMat} castShadow>
        <boxGeometry args={[0.9, 1.4, 0.5]} />
      </mesh>
      {/* kính bên hông */}
      <mesh position={[0.455, 0.1, 0]} material={glassMat}>
        <boxGeometry args={[0.01, 0.9, 0.42]} />
      </mesh>
      {/* quạt */}
      <mesh position={[0.458, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={fanMat}>
        <torusGeometry args={[0.16, 0.03, 8, 24]} />
      </mesh>
      <mesh position={[0.458, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={glowMat}>
        <circleGeometry args={[0.1, 16]} />
      </mesh>
    </group>
  );
}