'use client';

// CameraRig: quay đầu (quay/ngẩng/nghiêng theo khuôn mặt) -> xoay camera như VR
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { headPose } from './tracking-shared';

const HEAD_GAIN_YAW = 2.6;    // độ nhạy quay đầu
const HEAD_GAIN_PITCH = 1.8;
const HEAD_GAIN_ROLL = 0.8;
const SMOOTH = 0.1;

export default function CameraRig() {
  const { camera } = useThree();
  const target = useRef({ yaw: 0, pitch: 0, roll: 0 });
  const cur = useRef({ yaw: 0, pitch: 0, roll: 0 });

  useFrame(() => {
    const t = target.current;
    const h = headPose;
    t.yaw = h.yaw * HEAD_GAIN_YAW;
    t.pitch = h.pitch * HEAD_GAIN_PITCH;
    t.roll = h.roll * HEAD_GAIN_ROLL;

    const s = SMOOTH;
    cur.current.yaw += (t.yaw - cur.current.yaw) * s;
    cur.current.pitch += (t.pitch - cur.current.pitch) * s;
    cur.current.roll += (t.roll - cur.current.roll) * s;

    const e = new THREE.Euler(
      cur.current.pitch,
      cur.current.yaw,
      cur.current.roll * 0.3,
      'YXZ'
    );
    camera.quaternion.setFromEuler(e);
  });

  return null;
}