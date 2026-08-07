'use client';

// Tay giả VR: khi camera nhận diện được tay -> hiện bàn tay 3D bám theo landmarks
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { handState } from './tracking-shared';

// 21 khớp tay MediaPipe
const BONE_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
const BONE_COUNT = BONE_PAIRS.length;
const SPEED = 0.35;

export default function HandPaw() {
  const root = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Mesh>(null);
  const palmRef = useRef<THREE.Mesh>(null);
  const bonesRef = useRef<THREE.Mesh[]>([]);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const smooth = useRef<number[][]>(Array.from({ length: 21 }, () => [0, 0, 0]));
  const visible = useRef(false);

  const skin = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#ffb07a', roughness: 0.6 }), []);
  const jointMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#e69259', roughness: 0.5 }), []);

  useFrame(({ camera }) => {
    const g = root.current;
    const h = handState;
    if (!g) return;

    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      g.visible = true;
      visible.current = true;

      const lm = h.landmarks;
      // Định vị lòng bàn tay cách camera khoảng 0.8m, phía trước
      const fwd = new THREE.Vector3(0, 0, -0.8).applyQuaternion(camera.quaternion);
      g.position.copy(camera.position.clone().add(fwd));

      // Xây mới joint/bone nếu thiếu
      while (bonesRef.current.length < BONE_COUNT) {
        const geo = new THREE.CylinderGeometry(0.012, 0.012, 1, 5, 1);
        const m = new THREE.Mesh(geo, skin);
        m.castShadow = true;
        g.add(m);
        bonesRef.current.push(m);
      }
      while (jointsRef.current.length < 21) {
        const geo = new THREE.SphereGeometry(0.014, 7, 5);
        const m = new THREE.Mesh(geo, jointMat);
        g.add(m);
        jointsRef.current.push(m);
      }

// Smooth + mô phỏng toạ độ 3D (nghiêng nhẹ cho trông 3D)
      const h3 = 0.18;
      const pts = new Array(21);
      for (let i = 0; i < 21; i++) {
        const r = lm[i];
        smooth.current[i][0] += ((r[0] - 0.5) - smooth.current[i][0]) * SPEED;
        smooth.current[i][1] += ((0.5 - r[1]) - smooth.current[i][1]) * SPEED;
        smooth.current[i][2] += ((-r[2]) - smooth.current[i][2]) * SPEED;
        pts[i] = new THREE.Vector3(
          smooth.current[i][0] * 1.1,
          smooth.current[i][1] * 1.1 + 0.2,
          smooth.current[i][2] * 1.1
        ).multiplyScalar(h3);
      }

      for (let i = 0; i < BONE_COUNT; i++) {
        const [a, b] = BONE_PAIRS[i];
        const dir = new THREE.Vector3().copy(pts[b]).sub(pts[a]);
        const len = dir.length();
        const m = bonesRef.current[i];
        if (len < 0.004) { m.visible = false; continue; }
        m.visible = true;
        m.scale.set(1, len, 1);
        m.position.copy(pts[a].clone().add(dir.clone().multiplyScalar(0.5)));
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      }
      for (let i = 0; i < 21; i++) {
        jointsRef.current[i].position.copy(pts[i]);
        jointsRef.current[i].visible = true;
      }
    } else {
      if (visible.current) {
        g.visible = false;
        visible.current = false;
      }
    }
  });

  return (
    <group ref={root} visible={false}>
      {/* lòng bàn tay */}
      <mesh ref={palmRef} visible={false}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <primitive object={skin} attach="material" />
      </mesh>
      {/* cổ tay */}
      <mesh ref={wristRef} visible={false}>
        <sphereGeometry args={[0.02, 8, 6]} />
      </mesh>
    </group>
  );
}