'use client';

// Tay giả VR: khi camera nhận diện được tay -> hiện bàn tay 3D bám theo landmarks
// Bàn tay gắn vào KHÔNG GIAN CAMERA: xoay đầu/camera thì tay xoay theo góc nhìn (đồng bộ)
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
const HAND_SCALE = 0.6;   // bàn tay rộng ~0.35m
const DEPTH = -0.85;      // cách mặt ~0.85m về phía trước (camera -Z)

export default function HandPaw() {
  const root = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Mesh>(null);
  const palmRef = useRef<THREE.Mesh>(null);
  const bonesRef = useRef<THREE.Mesh[]>([]);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const smooth = useRef<number[][]>(Array.from({ length: 21 }, () => [0, 0, 0]));
  const visible = useRef(false);

  const skin = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#ffc9a3', roughness: 0.55 }), []);
  const jointMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: '#f0a878', roughness: 0.45 }), []);

  useFrame(({ camera }) => {
    const g = root.current;
    const h = handState;
    if (!g) return;

    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      g.visible = true;
      visible.current = true;

      const lm = h.landmarks;
      // Gắn toàn bộ tay vào camera -> quay góc nhìn thì tay xoay đồng bộ theo
      g.position.copy(camera.position);
      g.quaternion.copy(camera.quaternion);

      // Xây mới joint/bone nếu thiếu
      while (bonesRef.current.length < BONE_COUNT) {
        const geo = new THREE.CylinderGeometry(0.012, 0.012, 1, 5, 1);
        const m = new THREE.Mesh(geo, skin);
        g.add(m);
        bonesRef.current.push(m);
      }
      while (jointsRef.current.length < 21) {
        const geo = new THREE.SphereGeometry(0.015, 7, 5);
        const m = new THREE.Mesh(geo, jointMat);
        g.add(m);
        jointsRef.current.push(m);
      }

      // Toạ độ camera-local: +x = phải, +y = lên, -z = phía trước mặt
      const pts = new Array(21);
      for (let i = 0; i < 21; i++) {
        const r = lm[i];
        // lật gương x theo preview, lật y (ảnh gốc hướng xuống)
        const tx = (1 - r[0] - 0.5) * HAND_SCALE;
        const ty = (0.5 - r[1]) * HAND_SCALE;
        const tz = DEPTH + Math.max(-0.25, Math.min(0.15, r[2])) * 0.8;
        smooth.current[i][0] += (tx - smooth.current[i][0]) * SPEED;
        smooth.current[i][1] += (ty - smooth.current[i][1]) * SPEED;
        smooth.current[i][2] += (tz - smooth.current[i][2]) * SPEED;
        pts[i] = new THREE.Vector3(
          smooth.current[i][0],
          smooth.current[i][1],
          smooth.current[i][2]
        );
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

      // lòng bàn tay (khớp 9) + cổ tay (khớp 0)
      if (palmRef.current) {
        palmRef.current.visible = true;
        palmRef.current.position.copy(pts[9]);
      }
      if (wristRef.current) {
        wristRef.current.visible = true;
        wristRef.current.position.copy(pts[0]);
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
        <sphereGeometry args={[0.06, 8, 6]} />
        <primitive object={skin} attach="material" />
      </mesh>
      {/* cổ tay */}
      <mesh ref={wristRef} visible={false}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <primitive object={jointMat} attach="material" />
      </mesh>
    </group>
  );
}
