'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { handDataRef } from '../hand-shared';

const BONE_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const BONE_COUNT = BONE_PAIRS.length; // 24
const JOINT_COUNT = 21;

const SKIN_COLOR = '#e8b88a';
const J_RAD = 0.008;
const B_RAD = 0.005;

export default function Hand3D() {
  const { camera } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const bonesRef = useRef<THREE.Mesh[]>([]);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const palmRef = useRef<THREE.Mesh>(null);
  const smooth = useRef<number[][]>(Array.from({ length: 21 }, () => [0, 0, 0]));
  const skip = useRef(0);
  const matJoint = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.5 }), []);
  const matBone = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.6 }), []);
  const matPalm = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.5, transparent: true, opacity: 0.85 }), []);

  useFrame(() => {
    const g = rootRef.current;
    const h = handDataRef;
    if (!g) return;

    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      g.visible = true;

      skip.current = (skip.current + 1) % 3;
      if (skip.current !== 0) return;

      const lm = h.landmarks;
      const fwd = new THREE.Vector3(0, 0, -0.7).applyQuaternion(camera.quaternion);
      g.position.copy(camera.position.clone().add(fwd));
      g.quaternion.copy(camera.quaternion);

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 21; i++) {
        const r = lm[i];
        smooth.current[i][0] += (r[0] - 0.5 - smooth.current[i][0]) * 0.3;
        smooth.current[i][1] += (0.5 - r[1] - smooth.current[i][1]) * 0.3;
        smooth.current[i][2] += (-r[2] - smooth.current[i][2]) * 0.3;
        pts.push(new THREE.Vector3(
          smooth.current[i][0] * 0.25,
          smooth.current[i][1] * 0.25,
          smooth.current[i][2] * 0.25
        ));
      }

      while (bonesRef.current.length < BONE_COUNT) {
        const geo = new THREE.CylinderGeometry(B_RAD, B_RAD, 1, 4, 1);
        const m = new THREE.Mesh(geo, matBone);
        g.add(m);
        bonesRef.current.push(m);
      }
      while (jointsRef.current.length < JOINT_COUNT) {
        const geo = new THREE.SphereGeometry(J_RAD, 6, 4);
        const m = new THREE.Mesh(geo, matJoint);
        g.add(m);
        jointsRef.current.push(m);
      }
      for (let i = 0; i < BONE_COUNT; i++) {
        const [a, b] = BONE_PAIRS[i];
        const dir = new THREE.Vector3().copy(pts[b]).sub(pts[a]);
        const len = dir.length();
        const m = bonesRef.current[i];
        if (len < 0.002) { m.visible = false; continue; }
        m.visible = true;
        m.scale.y = len;
        const mid = new THREE.Vector3().copy(pts[a]).add(dir.clone().multiplyScalar(0.5));
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      }
      for (let i = 0; i < JOINT_COUNT; i++) {
        jointsRef.current[i].position.copy(pts[i]);
        jointsRef.current[i].visible = true;
      }

      if (palmRef.current) {
        const center = new THREE.Vector3();
        for (let i = 0; i < 5; i++) center.add(pts[i]);
        center.divideScalar(5);
        palmRef.current.position.copy(center);
        const sx = pts[5].distanceTo(pts[17]) * 0.4;
        const sz = pts[0].distanceTo(pts[9]) * 0.3;
        palmRef.current.scale.set(Math.max(sx, 0.04), 1, Math.max(sz, 0.04));
        palmRef.current.visible = true;
      }
    } else {
      if (g.visible) {
        g.visible = false;
        bonesRef.current = [];
        jointsRef.current = [];
      }
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      <mesh ref={palmRef} visible={false}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <primitive object={matPalm} />
      </mesh>
    </group>
  );
}
