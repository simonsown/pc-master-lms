'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { handDataRef } from '../hand-shared';

const LANDMARK_NAMES = ['WRIST', 'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP', 'INDEX_MCP', 'INDEX_PIP', 'INDEX_DIP', 'INDEX_TIP', 'MIDDLE_MCP', 'MIDDLE_PIP', 'MIDDLE_DIP', 'MIDDLE_TIP', 'RING_MCP', 'RING_PIP', 'RING_DIP', 'RING_TIP', 'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'];

const FINGER_INDICES: [number, number, number][] = [
  [1, 2, 3], [2, 3, 4],
  [5, 6, 7], [6, 7, 8],
  [9, 10, 11], [10, 11, 12],
  [13, 14, 15], [14, 15, 16],
  [17, 18, 19], [18, 19, 20],
];

const BONE_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const SKIN_COLOR = '#e8b88a';
const JOINT_RADIUS = 0.008;
const BONE_RADIUS = 0.005;

function makeJointGeo() {
  const geo = new THREE.SphereGeometry(JOINT_RADIUS, 8, 6);
  return geo;
}

function makeBoneGeo(from: THREE.Vector3, to: THREE.Vector3) {
  const dir = new THREE.Vector3().copy(to).sub(from);
  const len = dir.length();
  if (len < 0.001) return null;
  const geo = new THREE.CylinderGeometry(BONE_RADIUS, BONE_RADIUS, len, 4, 1);
  const mid = new THREE.Vector3().copy(from).add(dir.clone().multiplyScalar(0.5));
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { geo, pos: mid, quat };
}

export default function Hand3D() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const jointsRef = useRef<THREE.InstancedMesh | null>(null);
  const bonesRef = useRef<THREE.Group>(null);
  const palmRef = useRef<THREE.Mesh>(null);
  const smoothLandmarks = useRef<number[][]>(Array.from({ length: 21 }, () => [0, 0, 0]));
  const prevActive = useRef(false);

  const jointMat = useRef(new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.5, metalness: 0.1 }));
  const boneMat = useRef(new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.6, metalness: 0.05 }));
  const palmMat = useRef(new THREE.MeshStandardMaterial({ color: SKIN_COLOR, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.85 }));

  useFrame(() => {
    const g = groupRef.current;
    const h = handDataRef;
    if (!g) return;

    if (h.active && h.landmarks && h.landmarks.length >= 21) {
      g.visible = true;
      prevActive.current = true;

      const lm = h.landmarks;
      const fwd = new THREE.Vector3(0, 0, -0.7).applyQuaternion(camera.quaternion);
      g.position.copy(camera.position.clone().add(fwd));
      g.quaternion.copy(camera.quaternion);

      const points: THREE.Vector3[] = [];
      for (let i = 0; i < 21; i++) {
        const raw = lm[i];
        smoothLandmarks.current[i][0] += (raw[0] - 0.5 - smoothLandmarks.current[i][0]) * 0.35;
        smoothLandmarks.current[i][1] += (0.5 - raw[1] - smoothLandmarks.current[i][1]) * 0.35;
        smoothLandmarks.current[i][2] += (-raw[2] - smoothLandmarks.current[i][2]) * 0.35;
        points.push(new THREE.Vector3(
          smoothLandmarks.current[i][0] * 0.25,
          smoothLandmarks.current[i][1] * 0.25,
          smoothLandmarks.current[i][2] * 0.25
        ));
      }

      g.children.forEach(child => { if (child !== palmRef.current) g.remove(child); });

      for (const [a, b] of BONE_PAIRS) {
        const bone = makeBoneGeo(points[a], points[b]);
        if (!bone) continue;
        const mesh = new THREE.Mesh(bone.geo, boneMat.current);
        mesh.position.copy(bone.pos);
        mesh.quaternion.copy(bone.quat);
        g.add(mesh);
      }

      for (let i = 0; i < 21; i++) {
        const joint = new THREE.Mesh(makeJointGeo(), jointMat.current);
        joint.position.copy(points[i]);
        g.add(joint);
      }

      if (palmRef.current) {
        const palmPos = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < 5; i++) palmPos.add(points[i]);
        palmPos.divideScalar(5);
        palmRef.current.position.copy(palmPos);
        const scaleX = points[5].distanceTo(points[17]) * 0.4;
        const scaleZ = points[0].distanceTo(points[9]) * 0.3;
        palmRef.current.scale.set(Math.max(scaleX, 0.04), 1, Math.max(scaleZ, 0.04));
      }
    } else {
      if (prevActive.current) {
        g.visible = false;
        prevActive.current = false;
      }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={palmRef}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <primitive object={palmMat.current} />
      </mesh>
    </group>
  );
}
