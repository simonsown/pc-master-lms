'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { useAssemblyStore } from '@/lib/useStore';

const HeadTracker = dynamic(() => import('./HeadTracker'), { ssr: false });

function CameraRig() {
  const { camera } = useThree();
  const cameraCoords = useAssemblyStore((s) => s.cameraCoords);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const moveSpeed = 4;
  const faceSensitivity = 3.0;

  const accumulatedYaw = useRef(0);
  const prevFaceYaw = useRef(0);
  const stillnessTimer = useRef(0);
  const viewSaved = useRef(false);
  const mainView2 = useRef({ position: new THREE.Vector3(), quaternion: new THREE.Quaternion() });
  const initialized = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k in keys.current) (keys.current as any)[k] = true; };
    const up = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k in keys.current) (keys.current as any)[k] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    camera.position.set(0, 1.6, 4.5);
    euler.current.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    initialized.current = true;

    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.05);

    const rawPitch = -cameraCoords.pitch * 2.2;
    const rawYaw = cameraCoords.yaw * faceSensitivity;
    const yawMovement = Math.abs(rawYaw - prevFaceYaw.current);

    if (yawMovement > 0.008) {
      const diff = (rawYaw - prevFaceYaw.current) * 0.6;
      accumulatedYaw.current += diff;
      prevFaceYaw.current = rawYaw;
      stillnessTimer.current = 0;
      viewSaved.current = false;
    } else {
      stillnessTimer.current += delta;
      if (stillnessTimer.current >= 1.0 && !viewSaved.current && initialized.current) {
        mainView2.current.position.copy(camera.position);
        mainView2.current.quaternion.copy(camera.quaternion);
        viewSaved.current = true;
        stillnessTimer.current = 0;
      }
    }

    euler.current.set(rawPitch, accumulatedYaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();
    const move = new THREE.Vector3();
    if (keys.current.w) move.add(forward);
    if (keys.current.s) move.sub(forward);
    if (keys.current.a) move.sub(right);
    if (keys.current.d) move.add(right);
    if (move.length() > 0) move.normalize().multiplyScalar(moveSpeed * delta);
    camera.position.add(move);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.5, 4.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.5, 4.0);
    camera.position.y = 1.6;
  });

  return null;
}

function LabBench({ position, size = [3.0, 0.9, 1.2], color = '#cbd5e1' }: { position: [number, number, number]; size?: [number, number, number]; color?: string }) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      <mesh position={[0, h, 0]} castShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, h + 0.03, 0]}>
        <boxGeometry args={[w - 0.1, 0.008, d - 0.1]} />
        <meshPhysicalMaterial color="#f1f5f9" roughness={0.1} metalness={0.3} />
      </mesh>
      {([[-w / 2 + 0.1, h / 2, -d / 2 + 0.1], [-w / 2 + 0.1, h / 2, d / 2 - 0.1], [w / 2 - 0.1, h / 2, -d / 2 + 0.1], [w / 2 - 0.1, h / 2, d / 2 - 0.1]] as const).map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.04, 0.05, h, 8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Beaker({ position, color = '#60a5fa', height = 0.25, radius = 0.08 }: { position: [number, number, number]; color?: string; height?: number; radius?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.85, radius, height, 16]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} metalness={0.1} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, height * 0.35, 0]}>
        <cylinderGeometry args={[radius * 0.75, radius * 0.75, height * 0.35, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, height + 0.02, 0]}>
        <torusGeometry args={[radius * 0.8, 0.008, 8, 16]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Flask({ position, color = '#f97316' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.25, 12]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshPhysicalMaterial color={color} roughness={0.1} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function TestTubes({ position }: { position: [number, number, number] }) {
  const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <group key={i} position={[-0.1 + i * 0.05, 0, 0]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.2, 8]} />
            <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.018, 0.022, 0.08, 8]} />
            <meshPhysicalMaterial color={c} roughness={0.1} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Centrifuge({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.06, 20]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.3} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Microscope({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.25]} />
        <meshPhysicalMaterial color="#475569" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.08]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.35, 0.12]}>
        <cylinderGeometry args={[0.06, 0.04, 0.04, 12]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.18, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.15]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.3} />
      </mesh>
    </group>
  );
}

function DistillationApparatus({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.5]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Main boiling flask */}
      <mesh position={[-0.15, 0.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[-0.15, 0.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial color="#f97316" roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Neck / column */}
      <mesh position={[-0.15, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.25, 12]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      {/* Condenser coil */}
      <mesh position={[0.1, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.25} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Collection flask */}
      <mesh position={[0.35, 0.18, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.35, 0.18, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial color="#22c55e" roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Connector tube */}
      <mesh position={[0.0, 0.35, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.02]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Digital console */}
      <mesh position={[0, 0.08, 0.28]}>
        <boxGeometry args={[0.3, 0.1, 0.04]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0.3]}>
        <planeGeometry args={[0.25, 0.06]} />
        <meshPhysicalMaterial color="#22d3ee" roughness={0.1} emissive="#22d3ee" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function RoboticArmSection() {
  return (
    <group position={[3.5, 0, 0]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.16, 16]} />
        <meshPhysicalMaterial color="#475569" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Arm segment 1 */}
      <mesh position={[0, 0.35, 0.08]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Joint */}
      <mesh position={[0, 0.52, 0.08]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Arm segment 2 */}
      <mesh position={[0.15, 0.58, 0.08]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.25, 0.08, 0.08]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Gripper */}
      <mesh position={[0.3, 0.6, 0.08]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.33, 0.6, 0.04]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.33, 0.6, 0.12]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Flask being held */}
      <mesh position={[0.38, 0.55, 0.08]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.38, 0.55, 0.08]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshPhysicalMaterial color="#a855f7" roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Dispenser unit next to it */}
      <mesh position={[0.5, 0.2, -0.2]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.42, -0.2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.3} />
      </mesh>
    </group>
  );
}

function ComputerStation() {
  const screenData = useRef(new THREE.CanvasTexture(document.createElement('canvas')));
  const [screenReady, setScreenReady] = useState(false);

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 160;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#0c1929'; ctx.fillRect(0, 0, 256, 160);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `hsl(190, 80%, ${40 + Math.random() * 40}%)`;
      ctx.fillRect(10 + Math.random() * 200, 10 + Math.random() * 120, 3 + Math.random() * 20, 2 + Math.random() * 15);
    }
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(40 + Math.random() * 180, 30 + Math.random() * 100, 3 + Math.random() * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(140, 70%, 50%, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = `hsla(140, 70%, 50%, ${0.1 + Math.random() * 0.2})`;
      ctx.fill();
    }
    ctx.font = '10px monospace'; ctx.fillStyle = '#22d3ee'; ctx.textAlign = 'center';
    ctx.fillText('MOLECULAR ANALYSIS v3.2', 128, 148);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    screenData.current = t;
    setScreenReady(true);
  }, []);

  return (
    <group position={[-3.5, 0, -0.5]} rotation={[0, 0.3, 0]}>
      {/* Desk */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.6, 0.04, 0.9]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.5} />
      </mesh>
      {([[-0.7, 0.27, -0.38], [-0.7, 0.27, 0.38], [0.7, 0.27, -0.38], [0.7, 0.27, 0.38]] as const).map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.03, 0.04, 0.55, 8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      {/* Main screen */}
      <mesh position={[-0.25, 0.95, -0.08]}>
        <boxGeometry args={[0.5, 0.35, 0.03]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.1} />
      </mesh>
      <mesh position={[-0.25, 0.95, -0.05]}>
        <planeGeometry args={[0.45, 0.3]} />
        {screenReady && <meshPhysicalMaterial map={screenData.current} roughness={0.05} />}
      </mesh>
      {/* Second screen */}
      <mesh position={[0.35, 0.9, -0.08]}>
        <boxGeometry args={[0.4, 0.28, 0.03]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.1} />
      </mesh>
      <mesh position={[0.35, 0.9, -0.05]}>
        <planeGeometry args={[0.35, 0.23]} />
        {screenReady && <meshPhysicalMaterial map={screenData.current} roughness={0.05} />}
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.58, 0.15]}>
        <boxGeometry args={[0.35, 0.02, 0.12]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Chair */}
      <mesh position={[-0.6, 0.25, 0.45]}>
        <cylinderGeometry args={[0.15, 0.18, 0.05, 12]} />
        <meshPhysicalMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh position={[-0.6, 0.48, 0.45]}>
        <cylinderGeometry args={[0.12, 0.12, 0.42, 12]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.6, 0.7, 0.4]}>
        <boxGeometry args={[0.3, 0.04, 0.25]} />
        <meshPhysicalMaterial color="#334155" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Hologram() {
  const [frame] = useState(() => Math.floor(Math.random() * 100));

  return (
    <group position={[-1.5, 1.0, -1.0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.04, 20]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
        <meshPhysicalMaterial color="#22d3ee" roughness={0.1} emissive="#22d3ee" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      {/* Molecule hologram */}
      {([[0, 0.65, 0], [-0.08, 0.75, 0.05], [0.1, 0.8, -0.03], [-0.05, 0.9, -0.04], [0.12, 0.85, 0.06], [0.0, 0.95, 0.0], [-0.1, 0.7, -0.06]] as const).map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshPhysicalMaterial color="#22d3ee" roughness={0.1} emissive="#22d3ee" emissiveIntensity={0.5} transparent opacity={0.5} />
        </mesh>
      ))}
      {([[-0.04, 0.7, 0.03], [0.01, 0.72, -0.02], [-0.07, 0.72, -0.01], [0.05, 0.72, 0.01]] as const).map((pos, i) => (
        <mesh key={i + 10} position={pos}>
          <boxGeometry args={[0.06, 0.005, 0.005]} />
          <meshPhysicalMaterial color="#67e8f9" roughness={0.1} emissive="#67e8f9" emissiveIntensity={0.3} transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Glow ring */}
      <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 24]} />
        <meshPhysicalMaterial color="#22d3ee" roughness={0.1} emissive="#22d3ee" emissiveIntensity={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function StorageCabinet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.0, 1.2, 0.5]} />
        <meshPhysicalMaterial color="#64748b" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.6, 0.27]}>
        <boxGeometry args={[0.9, 1.1, 0.02]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Shelves visible through glass */}
      <mesh position={[0, 0.3, 0.27]}>
        <boxGeometry args={[0.85, 0.02, 0.02]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.7, 0.27]}>
        <boxGeometry args={[0.85, 0.02, 0.02]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} />
      </mesh>
      {/* Hazmat symbol */}
      <mesh position={[0, 0.9, 0.3]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshPhysicalMaterial color="#ef4444" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0.3]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshPhysicalMaterial color="#fef2f2" roughness={0.5} />
      </mesh>
    </group>
  );
}

function LabWindow() {
  const [campusTex, setCampusTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    const ctx = c.getContext('2d'); if (!ctx) return;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 384);
    sky.addColorStop(0, '#94a3b8'); sky.addColorStop(0.5, '#cbd5e1'); sky.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 512, 384);
    // Buildings
    ctx.fillStyle = '#64748b'; ctx.fillRect(80, 160, 60, 140);
    ctx.fillStyle = '#475569'; ctx.fillRect(100, 140, 50, 160);
    ctx.fillStyle = '#64748b'; ctx.fillRect(170, 130, 80, 170);
    ctx.fillStyle = '#334155'; ctx.fillRect(200, 110, 60, 190);
    ctx.fillStyle = '#64748b'; ctx.fillRect(280, 150, 70, 150);
    ctx.fillStyle = '#475569'; ctx.fillRect(320, 120, 50, 180);
    ctx.fillStyle = '#64748b'; ctx.fillRect(380, 160, 60, 140);
    // Windows on buildings
    ctx.fillStyle = '#94a3b8';
    for (let bx = 0; bx < 5; bx++) {
      for (let by = 0; by < 4; by++) {
        ctx.fillRect(290 + bx * 15, 160 + by * 25, 8, 14);
      }
    }
    // Trees
    ctx.fillStyle = '#4a7c59'; ctx.fillRect(30, 220, 15, 80);
    ctx.beginPath(); ctx.arc(37, 210, 25, 0, Math.PI * 2); ctx.fillStyle = '#3b6b47'; ctx.fill();
    ctx.fillStyle = '#4a7c59'; ctx.fillRect(440, 200, 18, 100);
    ctx.beginPath(); ctx.arc(449, 190, 30, 0, Math.PI * 2); ctx.fillStyle = '#3b6b47'; ctx.fill();
    // Greenery
    ctx.fillStyle = '#5a8f6a'; ctx.fillRect(0, 300, 512, 84);
    ctx.fillStyle = '#4a7c59'; ctx.fillRect(0, 310, 512, 20);
    // Road
    ctx.fillStyle = '#475569'; ctx.fillRect(0, 340, 512, 20);
    ctx.fillStyle = '#eab308'; ctx.fillRect(200, 348, 8, 4); ctx.fillRect(300, 348, 8, 4);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    setCampusTex(t);
  }, []);

  return (
    <group position={[4.85, 1.6, 1.5]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 1.8, 2.0]} />
        <meshPhysicalMaterial color="#334155" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 1.8]} />
        <meshPhysicalMaterial color="#87ceeb" roughness={0.1} transparent opacity={0.2} />
      </mesh>
      <mesh position={[0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 1.6]} />
        {campusTex && <meshPhysicalMaterial map={campusTex} roughness={0.2} />}
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[0.08, 0.06, 2.04]} />
        <meshPhysicalMaterial color="#475569" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.93, 0]}>
        <boxGeometry args={[0.08, 0.06, 2.04]} />
        <meshPhysicalMaterial color="#475569" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 1.03]}>
        <boxGeometry args={[0.08, 1.86, 0.06]} />
        <meshPhysicalMaterial color="#475569" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, -1.03]}>
        <boxGeometry args={[0.08, 1.86, 0.06]} />
        <meshPhysicalMaterial color="#475569" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Window() {
  return (
    <group position={[4.85, 1.5, -1.5]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.6, 1.4]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.5} transparent opacity={0.15} />
      </mesh>
      <mesh position={[0.01, 0, 0]}>
        <planeGeometry args={[1.5, 1.7]} />
        <meshPhysicalMaterial color="#87ceeb" roughness={0.1} metalness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[0.06, 0.04, 1.44]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <boxGeometry args={[0.06, 0.04, 1.44]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.73]}>
        <boxGeometry args={[0.06, 1.64, 0.04]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, -0.73]}>
        <boxGeometry args={[0.06, 1.64, 0.04]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 1.64, 1.44]} />
        <meshPhysicalMaterial color="#475569" roughness={0.6} transparent opacity={0.08} />
      </mesh>
      <mesh position={[0.02, 0.3, 0.15]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshPhysicalMaterial color="#fbbf24" roughness={0.3} emissive="#fbbf24" emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.08, 1.64, 1.44)]} />
        <lineBasicMaterial color="#94a3b8" />
      </lineSegments>
    </group>
  );
}

function LabPoster() {
  const tex = useLoader(THREE.TextureLoader, '/lab-poster.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;

  return (
    <group position={[-4.85, 1.5, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 1.45, 2.78]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.031, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.3]} />
        <meshPhysicalMaterial map={tex} roughness={0.15} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <boxGeometry args={[0.08, 0.05, 2.75]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.67, 0]}>
        <boxGeometry args={[0.08, 0.05, 2.75]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-1.37, 0, 0]}>
        <boxGeometry args={[0.08, 1.4, 0.05]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[1.37, 0, 0]}>
        <boxGeometry args={[0.08, 1.4, 0.05]} />
        <meshPhysicalMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function LabPoster2() {
  const tex = useLoader(THREE.TextureLoader, '/lab-poster2.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;

  return (
    <group position={[4.85, 1.5, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 1.5, 1.5]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-0.031, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshPhysicalMaterial map={tex} roughness={0.15} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.06, 0.04, 1.46]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[0.06, 0.04, 1.46]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.72]}>
        <boxGeometry args={[0.06, 1.46, 0.04]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.72]}>
        <boxGeometry args={[0.06, 1.46, 0.04]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Door() {
  return (
    <group position={[0, 0, 4.85]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.2, 2.2, 0.06]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0.04]}>
        <boxGeometry args={[1.15, 2.15, 0.01]} />
        <meshPhysicalMaterial color="#e2e8f0" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[-0.6, 1.1, 0]}>
        <boxGeometry args={[0.04, 2.22, 0.1]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 1.1, 0]}>
        <boxGeometry args={[0.04, 2.22, 0.1]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.21, 0]}>
        <boxGeometry args={[1.24, 0.04, 0.1]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.45, 1.0, 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshPhysicalMaterial color="#94a3b8" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0.06]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshPhysicalMaterial color="#ef4444" roughness={0.5} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function GameScene() {
  return (
    <div className="w-full h-screen bg-[#f8fafc] relative overflow-hidden">
      <HeadTracker />
      <Canvas shadows camera={{ position: [0, 1.6, 4.5], fov: 60, near: 0.1, far: 25 }}>
        <color attach="background" args={['#ffffff']} />

        <CameraRig />

        <ambientLight intensity={1.4} color="#e8f4ff" />
        <hemisphereLight args={['#ffffff', '#c8dfff', 0.8]} />
        <directionalLight position={[8, 12, 6]} intensity={1.4} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
        <directionalLight position={[-5, 8, 8]} intensity={1.2} color="#ffffff" />
        <pointLight position={[0, 3.5, 0]} intensity={1.6} color="#ffffff" />
        <pointLight position={[2, 3.5, -2]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-2, 3.5, 2]} intensity={0.8} color="#ffffff" />

        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#8ba0b8" roughness={0.3} />
        </mesh>

        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#9ab0c8" roughness={0.4} transparent opacity={0.25} />
        </mesh>

        {([
          { pos: [0, 0.01, -4.98], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [0, 0.01, -3.32], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [0, 0.01, -1.66], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [0, 0.01, 0], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [0, 0.01, 1.66], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [0, 0.01, 3.32], size: [10, 0.02, 0.015], c: '#6b8199' },
          { pos: [-4.98, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
          { pos: [-3.32, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
          { pos: [-1.66, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
          { pos: [1.66, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
          { pos: [3.32, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
          { pos: [4.98, 0.01, 0], size: [0.015, 0.02, 10], c: '#6b8199' },
        ] as const).map((item, i) => (
          <mesh key={i} position={item.pos}>
            <boxGeometry args={item.size} />
            <meshPhysicalMaterial color={item.c} roughness={0.5} transparent opacity={0.6} />
          </mesh>
        ))}

        <mesh position={[0, 1.5, -5]} receiveShadow>
          <boxGeometry args={[10, 3, 0.18]} />
          <meshPhysicalMaterial color="#52525b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-2.8, 1.0, -4.9]}>
          <boxGeometry args={[1.2, 0.8, 0.04]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[2.8, 1.0, -4.9]}>
          <boxGeometry args={[1.2, 0.8, 0.04]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 2.3, -4.9]}>
          <boxGeometry args={[3, 0.4, 0.04]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.25} metalness={0.2} />
        </mesh>

        <mesh position={[0, 1.5, 5]}>
          <boxGeometry args={[10, 3, 0.18]} />
          <meshPhysicalMaterial color="#52525b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[3.5, 1.5, 4.9]}>
          <boxGeometry args={[2, 1.2, 0.04]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[-3.5, 1.5, 4.9]}>
          <boxGeometry args={[2, 1.2, 0.04]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>

        <mesh position={[-5, 1.5, 0]}>
          <boxGeometry args={[0.18, 3, 10]} />
          <meshPhysicalMaterial color="#52525b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-4.9, 1.8, -2.8]}>
          <boxGeometry args={[0.04, 1.0, 1.0]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[-4.9, 1.8, 2.8]}>
          <boxGeometry args={[0.04, 1.0, 1.0]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>

        <mesh position={[5, 1.5, 0]}>
          <boxGeometry args={[0.18, 3, 10]} />
          <meshPhysicalMaterial color="#52525b" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[4.9, 1.8, -3.8]}>
          <boxGeometry args={[0.04, 1.0, 0.8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[4.9, 1.8, 3.8]}>
          <boxGeometry args={[0.04, 1.0, 0.8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.1} transparent opacity={0.35} metalness={0.2} />
        </mesh>

        <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.98, -4]}>
          <boxGeometry args={[0.15, 0.04, 3]} />
          <meshPhysicalMaterial color="#f8faff" roughness={0.3} emissive="#dce8ff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 2.98, 0]}>
          <boxGeometry args={[0.15, 0.04, 3]} />
          <meshPhysicalMaterial color="#f8faff" roughness={0.3} emissive="#dce8ff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 2.98, 4]}>
          <boxGeometry args={[0.15, 0.04, 3]} />
          <meshPhysicalMaterial color="#f8faff" roughness={0.3} emissive="#dce8ff" emissiveIntensity={0.6} />
        </mesh>

        {([[0, 0, -4.9], [0, 0, 4.9], [-4.9, 0, 0], [4.9, 0, 0]] as const).map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={i < 2 ? [10, 0.08, 0.02] : [0.02, 0.08, 10]} />
            <meshPhysicalMaterial color="#6b8199" roughness={0.4} />
          </mesh>
        ))}

        {/* Back wall: storage cabinets */}
        <StorageCabinet position={[-3.5, 0, -4.85]} />
        <StorageCabinet position={[-2.3, 0, -4.85]} />
        <StorageCabinet position={[2.5, 0, -4.85]} />
        <StorageCabinet position={[3.7, 0, -4.85]} />

        {/* Center bench - main work table */}
        <LabBench position={[0, 0, -1.0]} size={[3.5, 0.9, 2.0]} />

        {/* Left bench with computer station */}
        <LabBench position={[-2.5, 0, 1.5]} size={[2.0, 0.9, 1.0]} />
        <ComputerStation />

        {/* Right bench with equipment */}
        <LabBench position={[3.0, 0, 1.0]} size={[2.0, 0.9, 1.0]} />
        <Centrifuge position={[3.0, 0.9, 1.0]} />
        <Microscope position={[2.5, 0.9, 1.3]} />
        <Beaker position={[3.5, 0.9, 1.2]} color="#22c55e" />
        <Flask position={[3.0, 0.9, 0.6]} color="#ef4444" />

        {/* Robotic arm section */}
        <RoboticArmSection />
        <LabBench position={[4.2, 0, -1.8]} size={[1.2, 0.9, 0.8]} color="#94a3b8" />
        <Beaker position={[4.2, 0.9, -1.6]} color="#eab308" height={0.3} radius={0.1} />
        <Beaker position={[4.6, 0.9, -1.8]} color="#ef4444" height={0.2} radius={0.07} />

        {/* Window (right wall, front corner) */}
        <LabWindow />
        <LabPoster />
        <LabPoster2 />
        <Door />
      </Canvas>
    </div>
  );
}
