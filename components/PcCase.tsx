'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useAssemblyStore } from '@/lib/useStore';

function GlassPanel({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#88ccff"
        metalness={0.3}
        roughness={0.05}
        transparent
        opacity={0.18}
        envMapIntensity={1.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CaseFan({ position, fanSpeed, rgbActive }: {
  position: [number, number, number];
  fanSpeed: number;
  rgbActive: boolean;
}) {
  const bladeRef = useRef<THREE.Group>(null);
  const hue = useMemo(() => Math.floor(Math.random() * 360), []);
  const color1 = `hsl(${hue}, 100%, 60%)`;
  const color2 = `hsl(${(hue + 60) % 360}, 100%, 60%)`;

  useFrame((_, delta) => {
    if (bladeRef.current && fanSpeed > 0) {
      bladeRef.current.rotation.z += delta * fanSpeed * 25;
    }
  });

  const ringColor = rgbActive ? color1 : '#445588';
  const ringIntensity = rgbActive ? 1 : 0;

  return (
    <group position={position}>
      <mesh>
        <torusGeometry args={[0.14, 0.015, 8, 28]} />
        <meshPhysicalMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={ringIntensity}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={rgbActive ? 1 : 0.4}
        />
      </mesh>
      <group ref={bladeRef} position={[0, 0, 0]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * 0.09, Math.cos(angle) * 0.09, 0]}
              rotation={[0, 0, angle + Math.PI / 2]}
            >
              <planeGeometry args={[0.04, 0.18]} />
              <meshPhysicalMaterial
                color={rgbActive ? '#667799' : '#445566'}
                metalness={0.6}
                roughness={0.3}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.008, 12]} />
          <meshStandardMaterial color="#667799" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      {rgbActive && (
        <>
          <pointLight position={[0, 0, 0]} intensity={0.3} color={color1} distance={0.8} />
          <pointLight position={[0, 0, 0]} intensity={0.15} color={color2} distance={0.5} />
        </>
      )}
    </group>
  );
}

function MotherboardTray() {
  return (
    <group position={[0, 0.015, 0]}>
      <RoundedBox args={[2.2, 0.008, 1.8]} radius={0.005}>
        <meshPhysicalMaterial
          color="#1a3a2a"
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.4}
        />
      </RoundedBox>
      <mesh position={[0.5, 0.002, 0.35]}>
        <RoundedBox args={[0.5, 0.004, 0.5]} radius={0.005}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.6, 0.002, 0.35]}>
        <RoundedBox args={[0.18, 0.004, 0.9]} radius={0.004}>
          <meshStandardMaterial color="#334455" roughness={0.7} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 0.002, -0.4]}>
        <RoundedBox args={[1.2, 0.004, 0.04]} radius={0.003}>
          <meshStandardMaterial color="#556677" roughness={0.5} metalness={0.3} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.7, 0.002, -0.5]}>
        <RoundedBox args={[0.04, 0.004, 0.04]} radius={0.003}>
          <meshStandardMaterial color="#d0d0d0" metalness={0.7} roughness={0.2} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.2, 0.003, -0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 0.003, -0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.7} roughness={0.2} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -0.9 + (i % 3) * 0.9;
        const z = -0.7 + Math.floor(i / 3) * 1.4;
        return (
          <mesh key={i} position={[x, -0.002, z]}>
          <cylinderGeometry args={[0.012, 0.015, 0.006, 8]} />
          <meshStandardMaterial color="#aaaacc" metalness={0.7} roughness={0.2} />
        </mesh>
        );
      })}
      <mesh position={[0.5, 0.003, 0.35]}>
        <RoundedBox args={[0.35, 0.002, 0.35]} radius={0.003}>
          <meshStandardMaterial color="#999" metalness={0.4} roughness={0.4} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

export default function PcCase() {
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const fanSpeed = useAssemblyStore((s) => s.fanSpeed);
  const rgbActive = useAssemblyStore((s) => s.rgbActive);
  const isDefaultRgb = bootStatus === 'idle';

  const glowColor = useMemo(() => {
    if (bootStatus === 'success') return '#00ffcc';
    if (bootStatus === 'failed') return '#ff4466';
    return '#4488ff';
  }, [bootStatus]);

  const glowIntensity = useMemo(() => {
    if (bootStatus === 'success') return 1;
    if (bootStatus === 'failed') return 0.6;
    return 0.2;
  }, [bootStatus]);

  const caseColor = '#2a3a5c';
  const caseMetalness = 0.7;
  const caseRoughness = 0.25;

  return (
    <group position={[0, 0.35, 0]}>
      <RoundedBox args={[2.6, 1.3, 2.0]} radius={0.02}>
        <meshPhysicalMaterial
          color={caseColor}
          metalness={caseMetalness}
          roughness={caseRoughness}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      <mesh position={[0, 0.66, 0]}>
        <RoundedBox args={[2.62, 0.015, 2.02]} radius={0.005}>
          <meshPhysicalMaterial color="#3a4a6c" metalness={0.7} roughness={0.2} />
        </RoundedBox>
      </mesh>

      <mesh position={[0, -0.66, 0]}>
        <RoundedBox args={[2.62, 0.015, 2.02]} radius={0.005}>
          <meshPhysicalMaterial color="#1a2a4a" metalness={0.5} roughness={0.3} />
        </RoundedBox>
      </mesh>

      <mesh position={[1.31, 0, 0]}>
        <planeGeometry args={[2.02, 1.3]} />
        <meshPhysicalMaterial
          color="#2a3a5c"
          metalness={0.6}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <GlassPanel position={[-1.305, 0, 0]} size={[1.98, 1.26] as [number, number]} />

      <mesh position={[0, 0, 1.01]}>
        <planeGeometry args={[2.5, 1.15]} />
        <meshPhysicalMaterial
          color="#3a4a6c"
          metalness={0.7}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -1.01]}>
        <planeGeometry args={[2.5, 1.15]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          metalness={0.4}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.04, 1.015]}>
        <planeGeometry args={[0.35, 0.025]} />
        <meshPhysicalMaterial
          color={glowColor}
          transparent
          opacity={glowIntensity}
          emissive={glowColor}
          emissiveIntensity={glowIntensity * 3}
        />
      </mesh>

      <mesh position={[0, 0, 1.015]}>
        <planeGeometry args={[0.12, 0.012]} />
        <meshPhysicalMaterial
          color={glowColor}
          transparent
          opacity={glowIntensity * 0.5}
          emissive={glowColor}
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      <pointLight position={[0, 0.3, 0.8]} intensity={glowIntensity} color={glowColor} distance={2.5} decay={0.5} />

      <CaseFan position={[-0.7, 0.4, 1.01]} fanSpeed={fanSpeed || (isDefaultRgb ? 0.3 : 0)} rgbActive={rgbActive || isDefaultRgb} />
      <CaseFan position={[0.7, 0.4, 1.01]} fanSpeed={fanSpeed || (isDefaultRgb ? 0.3 : 0)} rgbActive={rgbActive || isDefaultRgb} />
      <CaseFan position={[-0.7, -0.3, 1.01]} fanSpeed={fanSpeed || (isDefaultRgb ? 0.3 : 0)} rgbActive={rgbActive || isDefaultRgb} />
      <CaseFan position={[0.7, -0.3, 1.01]} fanSpeed={fanSpeed || (isDefaultRgb ? 0.3 : 0)} rgbActive={rgbActive || isDefaultRgb} />

      <MotherboardTray />

      <mesh position={[0, 0.2, 1.015]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.01, 0.01]} />
        <meshPhysicalMaterial
          color="#ffffff"
          emissive={glowColor}
          emissiveIntensity={glowIntensity * 2}
        />
      </mesh>
    </group>
  );
}
