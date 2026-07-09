'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { useAssemblyStore, type ComponentType } from '@/lib/useStore';
import { headTrackingRef } from './head-tracker-shared';

const HeadTracker = dynamic(() => import('./HeadTracker'), { ssr: false });

function checkCollision(_x: number, _z: number, _radius = 0.3): boolean {
  return false;
}

function CameraRig() {
  const { camera } = useThree();
  const k = useRef({ w: false, a: false, s: false, d: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const ay = useRef(0);
  const py = useRef(0);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = true; };
    const up = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); if (key in k.current) (k.current as any)[key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    camera.position.set(0, 1.6, 3.5);
    euler.current.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const rp = -headTrackingRef.pitch * 2.2;
    const ry = headTrackingRef.yaw * 3;
    const ym = Math.abs(ry - py.current);
    if (ym > 0.008) {
      ay.current += (ry - py.current) * 0.6;
      py.current = ry;
    }
    euler.current.set(rp, ay.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();
    const m = new THREE.Vector3();
    if (k.current.w) m.add(fwd);
    if (k.current.s) m.sub(fwd);
    if (k.current.a) m.sub(right);
    if (k.current.d) m.add(right);
    if (m.length() > 0) {
      m.normalize().multiplyScalar(4 * d);
      const np = camera.position.clone().add(m);
      np.x = THREE.MathUtils.clamp(np.x, -6.5, 6.5);
      np.z = THREE.MathUtils.clamp(np.z, -6.5, 6);
      np.y = 1.6;
      camera.position.copy(np);
    }
  });
  return null;
}

const COLORS: Record<string, string> = {
  cpu: '#00d4aa', cooler: '#00aaff', ram: '#6366f1',
  gpu: '#ef4444', psu: '#f59e0b', ssd: '#22c55e', motherboard: '#8b5cf6',
};

/* ========== DETAILED 3D COMPONENT MODELS ========== */

function CPUModel() {
  const pinPositions = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -0.75; x <= 0.75; x += 0.25)
      for (let z = -0.75; z <= 0.75; z += 0.25)
        arr.push([x, z]);
    return arr;
  }, []);
  const capPositions = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -0.82; x <= 0.82; x += 0.82)
      for (let z = -0.82; z <= 0.82; z += 0.82)
        if (x !== 0 || z !== 0) arr.push([x, z]);
    return arr;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.6, 0.08, 1.6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.7, 0.02, 1.7]} />
        <meshPhysicalMaterial color="#a0a0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshPhysicalMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {pinPositions.map(([x, z]) => (
        <mesh key={`pin-${x}-${z}`} position={[x, -0.12, z]}>
          <cylinderGeometry args={[0.025, 0.035, 0.06, 6]} />
          <meshPhysicalMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.8, 0.25, 0.8]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.01, 0.08]} />
        <meshPhysicalMaterial color="#ff4444" />
      </mesh>
      {capPositions.map(([x, z]) => (
        <mesh key={`cap-${x}-${z}`} position={[x, 0.22, z]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshPhysicalMaterial color="#888" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function GPUModel() {
  const fanRef1 = useRef<THREE.Group>(null);
  const fanRef2 = useRef<THREE.Group>(null);
  const fanRef3 = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const speed = delta * 1.5;
    if (fanRef1.current) fanRef1.current.rotation.y += speed;
    if (fanRef2.current) fanRef2.current.rotation.y += speed;
    if (fanRef3.current) fanRef3.current.rotation.y += speed;
  });

  function FanGroup({ pos, radius, fanRef }: { pos: [number, number, number]; radius: number; fanRef: React.RefObject<THREE.Group | null> }) {
    const blades = useMemo(() => {
      const arr: { angle: number }[] = [];
      for (let i = 0; i < 8; i++) arr.push({ angle: (i / 8) * Math.PI * 2 });
      return arr;
    }, []);
    return (
      <group position={pos}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
          <meshPhysicalMaterial color="#333" />
        </mesh>
        <group ref={fanRef}>
          {blades.map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.sin(angle) * radius * 0.5, 0, Math.cos(angle) * radius * 0.5]}
                rotation={[0, -angle, Math.PI / 6]}>
                <boxGeometry args={[0.06, 0.01, 0.2]} />
                <meshPhysicalMaterial color="#555" transparent opacity={0.85} />
              </mesh>
            );
          })}
        </group>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[radius, 0.015, 8, 24]} />
          <meshPhysicalMaterial color="#444" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 0.06, 1.2]} />
        <meshPhysicalMaterial color="#2d2d2d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[2.7, 0.01, 1.1]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={`fin-${x}`} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.04, 0.15, 0.9]} />
          <meshPhysicalMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.0, 0.03, 0.8]} />
        <meshPhysicalMaterial color="#a0a0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      <FanGroup pos={[-0.7, 0.18, 0]} radius={0.28} fanRef={fanRef1} />
      <FanGroup pos={[0, 0.18, 0]} radius={0.28} fanRef={fanRef2} />
      <FanGroup pos={[0.7, 0.18, 0]} radius={0.28} fanRef={fanRef3} />
      <mesh position={[0.5, -0.06, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.08]} />
        <meshPhysicalMaterial color="#b8860b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.25, 0.04, 0]}>
        <boxGeometry args={[0.12, 0.025, 0.14]} />
        <meshPhysicalMaterial color="#333" />
      </mesh>
    </group>
  );
}

function RAMModel({ color }: { color: string }) {
  const finPositions = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 8; i++) arr.push(0.05 + i * 0.065);
    return arr;
  }, []);
  const chipPositions = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let side = 0; side < 2; side++)
      for (let i = 0; i < 4; i++)
        arr.push({ x: side === 0 ? -0.035 : 0.035, y: 0.32 + i * 0.07 });
    return arr;
  }, []);

  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.025]} />
        <meshPhysicalMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.075, 0.15, 0]}>
        <boxGeometry args={[0.025, 0.55, 0.04]} />
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.075, 0.15, 0]}>
        <boxGeometry args={[0.025, 0.55, 0.04]} />
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {finPositions.map((y, i) => (
        <React.Fragment key={`fins-${i}`}>
          <mesh position={[-0.09, y, 0]}>
            <boxGeometry args={[0.012, 0.04, 0.045]} />
            <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.5} opacity={0.7} transparent />
          </mesh>
          <mesh position={[0.09, y, 0]}>
            <boxGeometry args={[0.012, 0.04, 0.045]} />
            <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.5} opacity={0.7} transparent />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.11, 0.08, 0.018]} />
        <meshPhysicalMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
      </mesh>
      {chipPositions.map((p, i) => (
        <mesh key={`chip-${i}`} position={[p.x, p.y, 0]}>
          <boxGeometry args={[0.025, 0.025, 0.02]} />
          <meshPhysicalMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

function PSUModel() {
  const fanRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta;
  });

  const fanBladePositions = useMemo(() => {
    const arr: { x: number; z: number; angle: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      arr.push({ x: Math.sin(angle) * 0.18, z: Math.cos(angle) * 0.18, angle });
    }
    return arr;
  }, []);

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.6, 1.4]} />
        <meshPhysicalMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.18, 0.02, 1.38]} />
        <meshPhysicalMaterial color="#333" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0.72]}>
        <boxGeometry args={[0.6, 0.15, 0.01]} />
        <meshPhysicalMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.35, 0.015, 8, 24]} />
        <meshPhysicalMaterial color="#111" metalness={0.2} />
      </mesh>
      <group ref={fanRef} position={[0, 0.32, 0]}>
        {fanBladePositions.map((p, i) => (
          <mesh key={i} position={[p.x, 0, p.z]} rotation={[0, -p.angle, 0.3]}>
            <boxGeometry args={[0.04, 0.005, 0.15]} />
            <meshPhysicalMaterial color="#444" transparent opacity={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.01, 12]} />
          <meshPhysicalMaterial color="#333" />
        </mesh>
      </group>
      <mesh position={[1.12, 0.1, 0]}>
        <boxGeometry args={[0.03, 0.2, 0.3]} />
        <meshPhysicalMaterial color="#111" />
      </mesh>
      {[-0.1, -0.04, 0.02, 0.08, 0.14, 0.2].map((y, i) => (
        <mesh key={`conn-${i}`} position={[1.14, y, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 6]} />
          <meshPhysicalMaterial color="#555" />
        </mesh>
      ))}
    </group>
  );
}

function SSDModel() {
  return (
    <group rotation={[0, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.015, 0.25]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      <mesh position={[-0.15, 0.015, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshPhysicalMaterial color="#333" roughness={0.7} />
      </mesh>
      {[-0.5, 0.2, 0.55].map((x) => (
        <mesh key={`nand-${x}`} position={[x, 0.015, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.16]} />
          <meshPhysicalMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.85, 0, 0]}>
        <boxGeometry args={[0.04, 0.012, 0.24]} />
        <meshPhysicalMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.75, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshPhysicalMaterial color="#666" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

function MainboardModel() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.0, 0.02, 2.4]} />
        <meshPhysicalMaterial color="#1a3a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[2.9, 0.005, 2.3]} />
        <meshPhysicalMaterial color="#1e4a1e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.03, 0.3]}>
        <boxGeometry args={[0.7, 0.015, 0.7]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.4} roughness={0.5} />
      </mesh>
      {(() => {
        const holes: { x: number; z: number }[] = [];
        for (let x = 0; x < 5; x++)
          for (let z = 0; z < 5; z++)
            holes.push({ x: -0.25 + x * 0.125, z: 0.2 + z * 0.125 });
        return holes.map((p, i) => (
          <mesh key={`hole-${i}`} position={[p.x, 0.04, p.z]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
            <meshPhysicalMaterial color="#333" />
          </mesh>
        ));
      })()}
      {[0, 1].map((i) => (
        <mesh key={`ram-l${i}`} position={[-0.75 - i * 0.07, 0.03, 0.5]}>
          <boxGeometry args={[0.05, 0.015, 0.35]} />
          <meshPhysicalMaterial color="#333" roughness={0.7} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`ram-r${i}`} position={[0.75 + i * 0.07, 0.03, 0.5]}>
          <boxGeometry args={[0.05, 0.015, 0.35]} />
          <meshPhysicalMaterial color="#333" roughness={0.7} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`pcie-${i}`} position={[0, 0.03, -0.4 - i * 0.25]}>
          <boxGeometry args={[1.2, 0.012, 0.06]} />
          <meshPhysicalMaterial color="#444" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function DetailedComponentModel({ type }: { type: string }) {
  const c = COLORS[type] || '#888';
  switch (type) {
    case 'cpu': return <CPUModel />;
    case 'cooler': return (
      <group>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.8, 0.15, 0.8]} />
          <meshPhysicalMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.7]} />
          <meshPhysicalMaterial color="#00aaff" metalness={0.3} roughness={0.5} emissive="#00aaff" emissiveIntensity={0.1} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh key={`heatpipe-${i}`} position={[Math.sin(angle) * 0.2, 0.04, Math.cos(angle) * 0.2]} rotation={[0, -angle, 0.3]}>
              < cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
              <meshPhysicalMaterial color="#888" metalness={0.5} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    );
    case 'ram': return <RAMModel color={c} />;
    case 'gpu': return <GPUModel />;
    case 'psu': return <PSUModel />;
    case 'ssd': return <SSDModel />;
    case 'motherboard': return <MainboardModel />;
    default: return <mesh><boxGeometry args={[0.5, 0.06, 0.5]} /><meshPhysicalMaterial color={c} /></mesh>;
  }
}

/* ====== IT CLASSROOM FURNITURE ====== */

function CeilingFan({ position }: { position: [number, number, number] }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (bladeRef.current) bladeRef.current.rotation.y += delta * 4;
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 12]} />
        <meshPhysicalMaterial color="#555" metalness={0.3} roughness={0.5} />
      </mesh>
      <group ref={bladeRef} position={[0, -0.34, 0]}>
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(angle) * 0.5, 0, Math.cos(angle) * 0.5]} rotation={[0, -angle, 0.02]}>
              <boxGeometry args={[0.08, 0.008, 0.9]} />
              <meshPhysicalMaterial color="#e2e8f0" roughness={0.6} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Desk({ position }: { position: [number, number, number] }) {
  const topColor = '#8B7355';
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.6, 0.04, 0.9]} />
        <meshPhysicalMaterial color={topColor} roughness={0.6} metalness={0.05} />
      </mesh>
      {[[-0.7, 0.35, -0.38], [-0.7, 0.35, 0.38], [0.7, 0.35, -0.38], [0.7, 0.35, 0.38]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.025, 0.03, 0.7, 8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Monitor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, -0.02]}>
        <boxGeometry args={[0.45, 0.3, 0.02]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <planeGeometry args={[0.4, 0.26]} />
        <meshPhysicalMaterial color="#0a1628" roughness={0.05} emissive="#112244" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshPhysicalMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.06, 8]} />
        <meshPhysicalMaterial color="#555" metalness={0.3} />
      </mesh>
    </group>
  );
}

function Whiteboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[3.2, 2.2, 0.04]} />
        <meshPhysicalMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.3, 0.025]}>
        <planeGeometry args={[3.1, 2.1]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.42, 0]}>
        <boxGeometry args={[3.24, 0.04, 0.06]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[3.24, 0.04, 0.06]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PcCaseDetailed() {
  const bootStatusVal = useAssemblyStore((s) => s.bootStatus);
  const mb = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'motherboard_1' && c.installed));
  const cpu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'cpu_1' && c.installed));
  const cooler = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'cooler_1' && c.installed));
  const ram = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'ram_1' && c.installed));
  const gpu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'gpu_1' && c.installed));
  const psu = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'psu_1' && c.installed));
  const ssd = useAssemblyStore((s) => s.components.some((c) => c.slotId === 'ssd_1' && c.installed));

  const count = (mb ? 1 : 0) + (cpu ? 1 : 0) + (cooler ? 1 : 0) + (ram ? 1 : 0) + (gpu ? 1 : 0) + (psu ? 1 : 0) + (ssd ? 1 : 0);

  const glowColor = bootStatusVal === 'success' ? '#00ffcc' : bootStatusVal === 'failed' ? '#ff4466' : '#4488ff';
  const glowIntensity = bootStatusVal === 'success' ? 1 : bootStatusVal === 'failed' ? 0.6 : 0.2;

  const installedByType = useMemo(() => ({
    motherboard: mb, cpu, cooler, ram, gpu, psu, ssd,
  }), [mb, cpu, cooler, ram, gpu, psu, ssd]);

  const PARTS = useMemo(() => [
    { type: 'motherboard' as const, pos: [0, -0.15, 0] as [number, number, number] },
    { type: 'cpu' as const, pos: [0.3, 0.3, 0.12] as [number, number, number] },
    { type: 'cooler' as const, pos: [0.3, 0.42, 0.12] as [number, number, number] },
    { type: 'ram' as const, pos: [0.52, 0.27, 0.28] as [number, number, number] },
    { type: 'gpu' as const, pos: [0.3, 0.15, -0.45] as [number, number, number] },
    { type: 'psu' as const, pos: [0, -0.3, 0.6] as [number, number, number] },
    { type: 'ssd' as const, pos: [0.32, 0.18, -0.25] as [number, number, number] },
  ], []);

  return (
    <group position={[0, 0.9, -0.3]}>
      <RoundedBox args={[2.6, 1.3, 2.0]} radius={0.02}>
        <meshPhysicalMaterial color="#2a3a5c" metalness={0.7} roughness={0.25} envMapIntensity={0.8} />
      </RoundedBox>

      <mesh position={[-1.305, 0, 0]}>
        <planeGeometry args={[1.98, 1.26]} />
        <meshPhysicalMaterial color="#88ccff" metalness={0.3} roughness={0.05} transparent opacity={0.15} side={THREE.DoubleSide} envMapIntensity={1.5} />
      </mesh>

      <mesh position={[0, 0.04, 1.015]}>
        <planeGeometry args={[0.35, 0.025]} />
        <meshPhysicalMaterial color={glowColor} transparent opacity={glowIntensity} emissive={glowColor} emissiveIntensity={glowIntensity * 3} />
      </mesh>

      <pointLight position={[0, 0.3, 0.8]} intensity={glowIntensity} color={glowColor} distance={2.5} decay={0.5} />

      <Text fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0.7, 0]}>
        {`${count}/7`}
      </Text>

      {PARTS.map(({ type, pos }) => {
        const installed = installedByType[type];
        if (!installed) return null;
        return (
          <group key={type} position={pos}>
            <group scale={0.35}>
              <DetailedComponentModel type={type} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

function ComponentOnTable({ type, position, slotId }: { type: string; position: [number, number, number]; slotId: string }) {
  const [hovered, setHovered] = useState(false);
  const [msg, setMsg] = useState('');
  const installed = useAssemblyStore((s) => s.components.some((c) => c.slotId === slotId && c.installed));

  const handleClick = () => {
    if (installed) return;
    const dep = useAssemblyStore.getState().checkDependencies(slotId);
    if (!dep.ok) { setMsg('Cần mainboard trước!'); setTimeout(() => setMsg(''), 1500); return; }
    useAssemblyStore.getState().installComponent(slotId, `comp_${slotId}`);
  };

  if (installed) return null;

  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={handleClick}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <group scale={0.35}>
        <DetailedComponentModel type={type} />
      </group>
      <mesh position={[0, -0.3, 0]}>
        <RoundedBox args={[0.7, 0.02, 0.7]} radius={0.01}>
          <meshStandardMaterial color={COLORS[type] || '#888'} metalness={0.2} roughness={0.3}
          emissive={COLORS[type] || '#888'} emissiveIntensity={hovered ? 0.4 : 0.05} />
        </RoundedBox>
      </mesh>
      <sprite position={[0, 0.4, 0]} scale={[0.5, 0.18, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas');
          c.width = 128; c.height = 48;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath(); (ctx as any).roundRect(0, 0, 128, 48, 8); ctx.fill();
          ctx.fillStyle = COLORS[type] || '#fff';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(type.toUpperCase(), 64, 24);
          const t = new THREE.CanvasTexture(c);
          t.needsUpdate = true;
          return t;
        })()} transparent opacity={0.9} depthTest={false} />
      </sprite>
      {msg && (
        <sprite position={[0, 0.5, 0]} scale={[0.6, 0.12, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas');
            c.width = 200; c.height = 40;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(255,50,50,0.85)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 200, 40, 8); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(msg, 100, 20);
            const t = new THREE.CanvasTexture(c);
            t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.9} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function PcCaseShell({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.15, 0.35, 0.25]} radius={0.008}>
        <meshPhysicalMaterial color="#1a1a2e" metalness={0.8} roughness={0.15} envMapIntensity={1.0} />
      </RoundedBox>
      <mesh position={[0.075, 0, 0]}>
        <RoundedBox args={[0.01, 0.32, 0.22]} radius={0.005}>
          <meshPhysicalMaterial color="#88ccff" metalness={0.3} roughness={0.05} transparent opacity={0.12} side={THREE.DoubleSide} envMapIntensity={1.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 0.17, 0.126]}>
        <planeGeometry args={[0.05, 0.02]} />
        <meshPhysicalMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.12, 0.126]}>
        <planeGeometry args={[0.03, 0.015]} />
        <meshPhysicalMaterial color="#ff4466" emissive="#ff4466" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      {[-0.075, -0.025, 0.025, 0.075].map((y, i) => (
        <mesh key={`vent-${i}`} position={[0, y, -0.126]}>
          <boxGeometry args={[0.06, 0.005, 0.005]} />
          <meshPhysicalMaterial color="#333" />
        </mesh>
      ))}
      <mesh position={[-0.076, 0, 0]}>
        <RoundedBox args={[0.004, 0.28, 0.18]} radius={0.003}>
          <meshPhysicalMaterial color="#111" metalness={0.3} roughness={0.8} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, -0.175, 0]}>
        <RoundedBox args={[0.14, 0.006, 0.22]} radius={0.003}>
          <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

function CentralTable({ position }: { position: [number, number, number] }) {
  const topColor = '#8B7355';
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[3.2, 0.04, 1.6]} />
        <meshPhysicalMaterial color={topColor} roughness={0.6} metalness={0.05} />
      </mesh>
      {[[-1.45, 0.35, -0.75], [-1.45, 0.35, 0.75], [1.45, 0.35, -0.75], [1.45, 0.35, 0.75]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.045, 0.7, 8]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      <TableImages position={[0, 0, 0]} />
    </group>
  );
}

function ClickablePart({ children, position, label, color, onClick }: {
  children: React.ReactNode; position: [number, number, number];
  label: string; color: string; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <group>
        {children}
        <mesh position={[0, 0.01, 0]}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
          <boxGeometry args={[0.14, 0.04, 0.14]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
      <mesh position={[0, -0.02, 0]}>
        <RoundedBox args={[0.12, 0.008, 0.12]} radius={0.005}>
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.3}
            emissive={color} emissiveIntensity={hovered ? 0.5 : 0.05} />
        </RoundedBox>
      </mesh>
      {hovered && (
        <sprite position={[0, 0.04, 0]} scale={[0.2, 0.07, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 128; c.height = 32;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 128, 32, 6); ctx.fill();
            ctx.fillStyle = color; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(label, 64, 16);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function TableImages({ position }: { position: [number, number, number] }) {
  const topTex = useTexture('/cpu_top_view.png');
  const sideTex = useTexture('/cpu_side_flat_left.png');

  const sideMats = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: sideTex });
    return [m, m, m, m, m, m];
  }, [sideTex]);

  const topMats = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: topTex });
    return [m, m, m, m, m, m];
  }, [topTex]);

  return (
    <group position={position}>
      <ClickablePart position={[0.6, 0.72, 0]} label="CPU" color="#00d4aa">
        <group>
          <mesh position={[0, 0.011, 0]} material={sideMats} castShadow>
            <boxGeometry args={[0.1, 0.025, 0.1]} />
          </mesh>
          <mesh position={[0, 0.022, 0]} material={topMats}>
            <boxGeometry args={[0.105, 0.004, 0.105]} />
          </mesh>
          <mesh position={[0, 0.001, 0]} material={topMats}>
            <boxGeometry args={[0.105, 0.004, 0.105]} />
          </mesh>
        </group>
      </ClickablePart>

      {/* RAM 1 */}
      <ClickablePart position={[0.42, 0.72, 0.12]} label="DDR5 1" color="#6366f1">
        <RamModel />
      </ClickablePart>
      {/* RAM 2 */}
      <ClickablePart position={[0.42, 0.72, -0.08]} label="DDR5 2" color="#6366f1">
        <RamModel />
      </ClickablePart>

      {/* CPU Cooler */}
      <ClickablePart position={[-0.45, 0.72, 0.35]} label="Cooler" color="#00aaff">
        <CoolerModel />
      </ClickablePart>

      {/* GLB Model Viewer */}
      <GltfViewer position={[-0.45, 0.72, -0.3]} />
    </group>
  );
}

function GltfViewer({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/computer_components.glb');
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const speedRef = useRef(0.5);

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
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speedRef.current;
    }
  });

  const handleClick = () => {
    speedRef.current = speedRef.current === 0.5 ? 2.5 : 0.5;
  };

  return (
    <group position={position}>
      <mesh position={[0, -0.015, 0]}>
        <RoundedBox args={[0.25, 0.006, 0.25]} radius={0.008}>
          <meshStandardMaterial color="#00aaff" metalness={0.2} roughness={0.3}
            emissive="#00aaff" emissiveIntensity={hovered ? 0.5 : 0.05} />
        </RoundedBox>
      </mesh>
      <group ref={groupRef} scale={0.5}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); handleClick(); }}>
        <primitive object={scene} />
      </group>
      {hovered && (
        <sprite position={[0, 0.12, 0]} scale={[0.22, 0.06, 1]}>
          <spriteMaterial map={(() => {
            const c = document.createElement('canvas'); c.width = 200; c.height = 36;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath(); (ctx as any).roundRect(0, 0, 200, 36, 6); ctx.fill();
            ctx.fillStyle = '#00aaff'; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Click để tăng tốc xoay', 100, 18);
            const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
            return t;
          })()} transparent opacity={0.95} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function RamModel() {
  return (
    <group>
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[0.028, 0.004, 0.13]} />
        <meshPhysicalMaterial color="#111111" roughness={0.7} metalness={0.05} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={`trace-${i}`} position={[-0.01 + i * 0.01, 0.005, -0.04 + i * 0.035]}>
          <boxGeometry args={[0.002, 0.001, 0.06]} />
          <meshPhysicalMaterial color="#c8a050" metalness={0.6} roughness={0.3} transparent opacity={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.016, 0.008, 0]}>
        <RoundedBox args={[0.006, 0.01, 0.1]} radius={0.003}>
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.016, 0.008, 0]}>
        <RoundedBox args={[0.006, 0.01, 0.1]} radius={0.003}>
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
        </RoundedBox>
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`fin-${i}`} position={[-0.016, 0.013, -0.045 + i * 0.0082]}>
          <boxGeometry args={[0.007, 0.001, 0.003]} />
          <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`fin-r-${i}`} position={[0.016, 0.013, -0.045 + i * 0.0082]}>
          <boxGeometry args={[0.007, 0.001, 0.003]} />
          <meshPhysicalMaterial color="#222" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`pin-${i}`} position={[-0.012 + i * 0.0014, 0.001, 0.064]}>
          <boxGeometry args={[0.001, 0.002, 0.004]} />
          <meshPhysicalMaterial color="#d4a017" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[-0.008, 0.005, -0.04]}>
        <boxGeometry args={[0.003, 0.001, 0.002]} />
        <meshPhysicalMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[0.008, 0.005, -0.04]}>
        <boxGeometry args={[0.003, 0.001, 0.002]} />
        <meshPhysicalMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[-0.01, 0.005, 0.035]}>
        <boxGeometry args={[0.004, 0.0015, 0.003]} />
        <meshPhysicalMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <boxGeometry args={[0.002, 0.002, 0.002]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      <sprite position={[0, 0.018, -0.01]} scale={[0.07, 0.02, 1]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 64;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 256, 64);
          ctx.fillStyle = '#aabbcc'; ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('DDR5', 128, 18);
          ctx.fillStyle = '#8899aa'; ctx.font = '8px monospace';
          ctx.fillText('32GB 6400 MT/s CL32', 128, 42);
          const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
          return t;
        })()} transparent opacity={0.9} depthTest={false} />
      </sprite>
    </group>
  );
}

function CoolerModel() {
  return (
    <group>
      {/* Base plate */}
      <mesh position={[0, 0.003, 0]}>
        <RoundedBox args={[0.08, 0.006, 0.08]} radius={0.003}>
          <meshPhysicalMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
      {/* Heat pipes — 4 copper pipes */}
      {[[-0.025, 0, -0.025], [-0.025, 0, 0.025], [0.025, 0, -0.025], [0.025, 0, 0.025]].map((p, i) => (
        <mesh key={`hp-${i}`} position={[p[0], 0.035, p[1]]}>
          <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
          <meshPhysicalMaterial color="#b8860b" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Fin stack — 15 aluminum fins */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`fin-${i}`} position={[0, 0.01 + i * 0.005, 0]}>
          <boxGeometry args={[0.075, 0.002, 0.075]} />
          <meshPhysicalMaterial color="#d0d0d0" metalness={0.3} roughness={0.4} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Fan frame */}
      <mesh position={[0, 0.075, 0]}>
        <torusGeometry args={[0.055, 0.005, 8, 28]} />
        <meshPhysicalMaterial color="#222" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Fan blades — 7 blades */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <mesh key={`blade-${i}`} position={[Math.sin(angle) * 0.032, 0.075, Math.cos(angle) * 0.032]}
            rotation={[0, -angle, 0.55]}>
            <boxGeometry args={[0.005, 0.003, 0.045]} />
            <meshPhysicalMaterial color="#4488cc" transparent opacity={0.35} />
          </mesh>
        );
      })}
      {/* Fan hub */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.004, 14]} />
        <meshPhysicalMaterial color="#111" />
      </mesh>
      {/* LED ring (off) */}
      <mesh position={[0, 0.075, 0]}>
        <torusGeometry args={[0.035, 0.002, 8, 28]} />
        <meshPhysicalMaterial color="#4488cc" transparent opacity={0.2} roughness={0.3} />
      </mesh>
      {/* Fan struts */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={`strut-${i}`} position={[Math.sin(angle) * 0.028, 0.075, Math.cos(angle) * 0.028]}
            rotation={[0, -angle + Math.PI / 2, 0]}>
            <boxGeometry args={[0.002, 0.003, 0.022]} />
            <meshPhysicalMaterial color="#333" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function GameScene() {
  return (
    <div className="w-full h-screen bg-[#f8fafc] relative overflow-hidden">
      <HeadTracker />
      <Canvas shadows camera={{ position: [0, 1.6, 3.5], fov: 60, near: 0.1, far: 25 }}>
        <color attach="background" args={['#f0f4ff']} />
        <CameraRig />

        <ambientLight intensity={1.2} color="#e0e8ff" />
        <hemisphereLight args={['#e8f0ff', '#aabbcc', 0.8]} />
        <directionalLight position={[8, 12, 6]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
        <directionalLight position={[-4, 8, 4]} intensity={0.6} color="#d0e0f0" />
        <pointLight position={[0, 3.5, 0]} intensity={0.5} color="#e8f0ff" />
        <pointLight position={[3, 3, 3]} intensity={0.3} color="#d0e8ff" />
        <pointLight position={[-3, 3, -3]} intensity={0.3} color="#d0e8ff" />

        {/* Floor tiles */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshPhysicalMaterial color="#8ba0b8" roughness={0.4} />
        </mesh>

        {/* Floor grid lines */}
        {Array.from({ length: 15 }).map((_, i) => (
          <React.Fragment key={`fline-${i}`}>
            <mesh position={[-7 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.008, 14]} />
              <meshPhysicalMaterial color="#9ab0c8" transparent opacity={0.15} />
            </mesh>
            <mesh position={[0, 0, -7 + i]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[14, 0.008]} />
              <meshPhysicalMaterial color="#9ab0c8" transparent opacity={0.15} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Walls */}
        <mesh position={[0, 1.5, -7]}><boxGeometry args={[14, 3, 0.18]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 1.5, 7]}><boxGeometry args={[14, 3, 0.18]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
        <mesh position={[-7, 1.5, 0]}><boxGeometry args={[0.18, 3, 14]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>
        <mesh position={[7, 1.5, 0]}><boxGeometry args={[0.18, 3, 14]} /><meshPhysicalMaterial color="#e8ecf0" roughness={0.9} side={THREE.DoubleSide} /></mesh>

        {/* Baseboard */}
        {[[0, 0.08, -6.98], [0, 0.08, 6.98], [-6.98, 0.08, 0], [6.98, 0.08, 0]].map((pos, i) => (
          <mesh key={`base-${i}`} position={pos as [number, number, number]}>
            <boxGeometry args={i < 2 ? [14, 0.15, 0.06] : [0.06, 0.15, 14]} />
            <meshPhysicalMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
        ))}

        {/* Ceiling */}
        <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshPhysicalMaterial color="#f0f2f5" roughness={0.8} />
        </mesh>

        {/* Ceiling lights */}
        <mesh position={[0, 2.98, 0]}>
          <boxGeometry args={[1.2, 0.03, 0.2]} />
          <meshPhysicalMaterial color="#f0f9ff" roughness={0.3} emissive="#d0e8ff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 2.98, -3]}>
          <boxGeometry args={[1.2, 0.03, 0.2]} />
          <meshPhysicalMaterial color="#f0f9ff" roughness={0.3} emissive="#d0e8ff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 2.98, 3]}>
          <boxGeometry args={[1.2, 0.03, 0.2]} />
          <meshPhysicalMaterial color="#f0f9ff" roughness={0.3} emissive="#d0e8ff" emissiveIntensity={0.6} />
        </mesh>

        {/* Ceiling Fan */}
        <CeilingFan position={[0, 2.9, 0]} />

        {/* Whiteboard on back wall */}
        <Whiteboard position={[0, 0, -6.85]} />

        {/* AC unit on left wall */}
        <group position={[-6.8, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.6]} />
            <meshPhysicalMaterial color="#f0f0f0" roughness={0.3} />
          </mesh>
          <mesh position={[0.02, 0.08, 0.22]}>
            <boxGeometry args={[0.02, 0.4, 0.12]} />
            <meshPhysicalMaterial color="#e0e0e0" roughness={0.5} />
          </mesh>
          <mesh position={[0.02, -0.04, 0.22]}>
            <boxGeometry args={[0.02, 0.02, 0.05]} />
            <meshPhysicalMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.02, -0.2, 0.25]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.01, 0.15, 0.01]} />
            <meshPhysicalMaterial color="#888" />
          </mesh>
        </group>

        {/* ===== BÀN LỚN Ở GIỮA ===== */}
        <CentralTable position={[0, 0, 0]} />

        {/* ===== 4 BÀN HỌC SINH VỚI MONITOR + CASE NHỎ ĐỨNG BÊN PHẢI ===== */}
        <Desk position={[-3.5, 0, -3.5]} />
        <Monitor position={[-3.5, 0.72, -3.5]} />
        <PcCaseShell position={[-3.1, 0.895, -3.5]} />

        <Desk position={[3.5, 0, -3.5]} />
        <Monitor position={[3.5, 0.72, -3.5]} />
        <PcCaseShell position={[3.9, 0.895, -3.5]} />

        <Desk position={[-3.5, 0, 3.5]} />
        <Monitor position={[-3.5, 0.72, 3.5]} />
        <PcCaseShell position={[-3.1, 0.895, 3.5]} />

        <Desk position={[3.5, 0, 3.5]} />
        <Monitor position={[3.5, 0.72, 3.5]} />
        <PcCaseShell position={[3.9, 0.895, 3.5]} />
      </Canvas>
    </div>
  );
}