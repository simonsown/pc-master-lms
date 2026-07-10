'use client';

import React, { Suspense, useRef, useState, useEffect, Component } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

class ModelLoadBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() { return this.state.ok ? this.props.children : this.props.fallback; }
}

function ModelFallback({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function GlbInner({ file, color, scale, hovered }: { file: string; color: string; scale: number; hovered: boolean }) {
  const { scene } = useGLTF(file);
  const [ready, setReady] = useState(false);
  const emRef = useRef(0);
  const skipRef = useRef(0);

  useEffect(() => {
    scene.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = false;
        c.receiveShadow = false;
        c.material.transparent = false;
      }
    });
    setReady(true);
  }, [scene]);

  useFrame(() => {
    if (!ready) return;
    skipRef.current = (skipRef.current + 1) % 3;
    if (skipRef.current !== 0) return;
    const target = hovered ? 0.5 : 0;
    emRef.current += (target - emRef.current) * 0.1;
    if (Math.abs(emRef.current - target) < 0.01) return;
    scene.traverse(c => {
      if (c instanceof THREE.Mesh && c.material) {
        const mat = c.material as THREE.MeshStandardMaterial;
        if (mat.emissive) mat.emissiveIntensity = emRef.current;
      }
    });
  });

  if (!ready) return null;
  return <primitive object={scene} scale={scale} />;
}

function SafeGlb({ file, color, scale, hovered }: { file: string; color: string; scale: number; hovered: boolean }) {
  return (
    <ModelLoadBoundary fallback={<ModelFallback color={color} />}>
      <Suspense fallback={<ModelFallback color={color} />}>
        <GlbInner file={file} color={color} scale={scale} hovered={hovered} />
      </Suspense>
    </ModelLoadBoundary>
  );
}

export interface ModelDisplayProps {
  file: string;
  color: string;
  position: [number, number, number];
  scale?: number;
  onInteract: () => void;
  playerPos: THREE.Vector3;
}

export default function ModelDisplay({ file, color, position, scale = 0.1, onInteract, playerPos }: ModelDisplayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotRef = useRef(THREE.MathUtils.degToRad(Math.random() * 360));
  const [hovered, setHovered] = useState(false);
  const speedRef = useRef(THREE.MathUtils.degToRad(6 + Math.random() * 4));
  const stoppedRef = useRef(false);

  const skipFrame = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    skipFrame.current = (skipFrame.current + 1) % 3;
    if (skipFrame.current !== 0) return;

    const dist = playerPos.distanceTo(new THREE.Vector3(position[0], 0, position[2]));
    const shouldStop = dist < 2.5;

    if (shouldStop && !stoppedRef.current) {
      stoppedRef.current = true;
    } else if (!shouldStop && stoppedRef.current) {
      stoppedRef.current = false;
    }

    if (!stoppedRef.current && !hovered) {
      rotRef.current += speedRef.current;
    }

    groupRef.current.rotation.y = rotRef.current;
    groupRef.current.position.y = 0.2 + Math.sin(Date.now() * 0.001 + position[0]) * 0.03;
  });

  const glowColor = new THREE.Color(color);

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      <Pedestal color={color} hovered={hovered} />
      <group position={[0, 0.25, 0]}>
        <SafeGlb file={file} color={color} scale={scale} hovered={hovered} />
      </group>
      <InfoHolo text={''} sub={''} color={color} />
      <mesh
        position={[0, 0.35, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onInteract(); }}
      >
        <boxGeometry args={[1.0, 0.8, 1.0]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Pedestal({ color, hovered }: { color: string; hovered: boolean }) {
  const glow = hovered ? 0.3 : 0.03;
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.12, 24]} />
        <meshPhysicalMaterial color="#1a1a3e" roughness={0.3} metalness={0.4} emissive={color} emissiveIntensity={glow} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 0.02, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.1} />
      </mesh>
    </group>
  );
}

function InfoHolo({ text, sub, color }: { text: string; sub: string; color: string }) {
  if (!text) return null;
  return (
    <group position={[0, 0.9, 0]}>
      <sprite scale={[2.5, 0.12, 1]} position={[0, 0.04, 0]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 28;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = color; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(text, 256, 14);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.95} depthTest={false} />
      </sprite>
      <sprite scale={[2.8, 0.08, 1]} position={[0, -0.04, 0]}>
        <spriteMaterial map={(() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 22;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#8899bb'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(sub, 256, 11);
          return new THREE.CanvasTexture(c);
        })()} transparent opacity={0.8} depthTest={false} />
      </sprite>
    </group>
  );
}
