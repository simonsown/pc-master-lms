'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useAssemblyStore } from '@/lib/useStore';

function GlassPanel({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#0a0a1a"
        metalness={0.1}
        roughness={0.05}
        transparent
        opacity={0.25}
        envMapIntensity={0.5}
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

  useFrame((_, delta) => {
    if (bladeRef.current && fanSpeed > 0) {
      bladeRef.current.rotation.z += delta * fanSpeed * 20;
    }
  });

  const ringColor = rgbActive ? '#00d4aa' : '#1a1a2e';
  const ringIntensity = rgbActive ? 0.8 : 0;

  return (
    <group position={position}>
      <mesh>
        <torusGeometry args={[0.14, 0.015, 8, 28]} />
        <meshPhysicalMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={ringIntensity}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={rgbActive ? 0.9 : 0.3}
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
                color="#2a2a3a"
                metalness={0.4}
                roughness={0.5}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.008, 12]} />
          <meshStandardMaterial color="#333" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>
      {rgbActive && (
        <pointLight position={[0, 0, 0]} intensity={0.2} color="#00d4aa" distance={0.6} />
      )}
    </group>
  );
}

function MotherboardTray() {
  return (
    <group position={[0, 0.015, 0]}>
      <RoundedBox args={[2.2, 0.008, 1.8]} radius={0.005}>
        <meshPhysicalMaterial
          color="#0d2818"
          roughness={0.9}
          metalness={0.1}
          envMapIntensity={0.2}
        />
      </RoundedBox>
      <mesh position={[0.5, 0.002, 0.35]}>
        <RoundedBox args={[0.5, 0.004, 0.5]} radius={0.005}>
          <meshStandardMaterial color="#a0a0a0" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.6, 0.002, 0.35]}>
        <RoundedBox args={[0.18, 0.004, 0.9]} radius={0.004}>
          <meshStandardMaterial color="#222" roughness={0.8} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 0.002, -0.4]}>
        <RoundedBox args={[1.2, 0.004, 0.04]} radius={0.003}>
          <meshStandardMaterial color="#444" roughness={0.6} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.7, 0.002, -0.5]}>
        <RoundedBox args={[0.04, 0.004, 0.04]} radius={0.003}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.2, 0.003, -0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0.003, -0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -0.9 + (i % 3) * 0.9;
        const z = -0.7 + Math.floor(i / 3) * 1.4;
        return (
          <mesh key={i} position={[x, -0.002, z]}>
          <cylinderGeometry args={[0.012, 0.015, 0.006, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </mesh>
        );
      })}
    </group>
  );
}

export default function PcCase() {
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const fanSpeed = useAssemblyStore((s) => s.fanSpeed);
  const rgbActive = useAssemblyStore((s) => s.rgbActive);

  const glowColor = useMemo(() => {
    if (bootStatus === 'success') return '#00d4aa';
    if (bootStatus === 'failed') return '#ef4444';
    return '#000000';
  }, [bootStatus]);

  const glowIntensity = useMemo(() => {
    if (bootStatus === 'success') return 1;
    if (bootStatus === 'failed') return 0.5;
    return 0;
  }, [bootStatus]);

  const edgeColor = useMemo(() => {
    if (bootStatus === 'success') return '#00d4aa';
    if (bootStatus === 'failed') return '#ef4444';
    return '#1a1a2e';
  }, [bootStatus]);

  return (
    <group position={[0, 0.35, 0]}>
      <RoundedBox args={[2.6, 1.3, 2.0]} radius={0.02}>
        <meshPhysicalMaterial
          color="#0a0a12"
          metalness={0.6}
          roughness={0.3}
          envMapIntensity={0.4}
        />
      </RoundedBox>

      <mesh position={[0, 0.66, 0]}>
        <RoundedBox args={[2.62, 0.015, 2.02]} radius={0.005}>
          <meshPhysicalMaterial color="#12121e" metalness={0.5} roughness={0.3} />
        </RoundedBox>
      </mesh>

      <mesh position={[0, -0.66, 0]}>
        <RoundedBox args={[2.62, 0.015, 2.02]} radius={0.005}>
          <meshPhysicalMaterial color="#05050a" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      </mesh>

      <mesh position={[1.31, 0, 0]}>
        <planeGeometry args={[2.02, 1.3]} />
        <meshPhysicalMaterial
          color="#0f0f1a"
          metalness={0.5}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <GlassPanel position={[-1.305, 0, 0]} size={[1.98, 1.26]} />

      <mesh position={[0, 0, 1.01]}>
        <planeGeometry args={[2.5, 1.15]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.6}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -1.01]}>
        <planeGeometry args={[2.5, 1.15]} />
        <meshPhysicalMaterial
          color="#05050a"
          metalness={0.3}
          roughness={0.7}
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

      {bootStatus === 'success' && (
        <pointLight position={[0, 0.3, 0.8]} intensity={1.5} color="#00d4aa" distance={2} decay={0.5} />
      )}
      {bootStatus === 'failed' && (
        <pointLight position={[0, 0.3, 0.8]} intensity={1} color="#ef4444" distance={2} decay={0.5} />
      )}

      <CaseFan position={[-0.7, 0.4, 1.01]} fanSpeed={fanSpeed} rgbActive={rgbActive} />
      <CaseFan position={[0.7, 0.4, 1.01]} fanSpeed={fanSpeed} rgbActive={rgbActive} />
      <CaseFan position={[-0.7, -0.3, 1.01]} fanSpeed={fanSpeed} rgbActive={rgbActive} />
      <CaseFan position={[0.7, -0.3, 1.01]} fanSpeed={fanSpeed} rgbActive={rgbActive} />

      <MotherboardTray />

      <mesh position={[-1.31, -0.3, 1.01]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
        <meshPhysicalMaterial
          color={edgeColor}
          emissive={edgeColor}
          emissiveIntensity={glowIntensity * 0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
