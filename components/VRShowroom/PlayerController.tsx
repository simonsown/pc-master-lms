'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { headTrackingRef } from '../head-tracker-shared';

const SPEED_WALK = 4;
const SPEED_RUN = 8;
const JUMP_FORCE = 5;
const GRAVITY = -12;
const MOUSE_SENSITIVITY = 0.002;
const SMOOTH_SPEED = 0.15;

export default function PlayerController() {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const onGround = useRef(true);
  const pointerLocked = useRef(false);
  const mouseSmooth = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    camera.position.set(0, 1.7, 5);
    camera.rotation.set(0, 0, 0);

    const onKey = (e: KeyboardEvent, add: boolean) => {
      keys.current[add ? 'add' : 'delete'](e.code);
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      pointerLocked.current = true;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      pitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch.current));
    };

    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onCanvasClick = () => {
      gl.domElement.requestPointerLock();
    };

    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    gl.domElement.addEventListener('click', onCanvasClick);

    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      gl.domElement.removeEventListener('click', onCanvasClick);
    };
  }, [camera, gl]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);

    const headYaw = headTrackingRef.yaw * 0.5;
    const headPitch = -headTrackingRef.pitch * 0.5;

    const targetYaw = yaw.current + headYaw;
    const targetPitch = pitch.current + headPitch;
    mouseSmooth.current.yaw += (targetYaw - mouseSmooth.current.yaw) * SMOOTH_SPEED;
    mouseSmooth.current.pitch += (targetPitch - mouseSmooth.current.pitch) * SMOOTH_SPEED;

    const euler = new THREE.Euler(mouseSmooth.current.pitch, mouseSmooth.current.yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const speed = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? SPEED_RUN : SPEED_WALK;
    const move = new THREE.Vector3();
    if (keys.current.has('KeyW')) move.add(fwd);
    if (keys.current.has('KeyS')) move.sub(fwd);
    if (keys.current.has('KeyA')) move.sub(right);
    if (keys.current.has('KeyD')) move.add(right);

    if (move.length() > 0) {
      move.normalize().multiplyScalar(speed * d);
      const np = camera.position.clone().add(move);
      np.x = THREE.MathUtils.clamp(np.x, -14, 14);
      np.z = THREE.MathUtils.clamp(np.z, -14, 14);
      camera.position.x = np.x;
      camera.position.z = np.z;
    }

    velocity.current.y += GRAVITY * d;
    camera.position.y += velocity.current.y * d;
    if (camera.position.y <= 1.7) {
      camera.position.y = 1.7;
      velocity.current.y = 0;
      onGround.current = true;
    }

    if ((keys.current.has('Space')) && onGround.current) {
      velocity.current.y = JUMP_FORCE;
      onGround.current = false;
    }
  });

  return null;
}
