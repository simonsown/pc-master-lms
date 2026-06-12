'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { type ComponentRenderSpec, MM_TO_3D } from '@/data/componentSpecs';

interface ComponentViewer3DProps {
  spec: ComponentRenderSpec;
  width?: number;
  height?: number;
}

function CPU3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const d = spec.dimensions.depth_mm * s;
  const h = spec.dimensions.height_mm * s;
  return (
    <group>
      <mesh position={[0, -h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={spec.colors.pcb} roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]}>
        <boxGeometry args={[w * 0.8, 0.02, d * 0.8]} />
        <meshStandardMaterial color={spec.colors.heatsink || '#c0c0c0'} metalness={0.7} roughness={0.2} />
      </mesh>
      <Text position={[0, h / 2 + 0.03, 0]} fontSize={0.04} color={spec.colors.accent || '#fff'}
        anchorX="center" anchorY="middle">
        {spec.brand}
      </Text>
    </group>
  );
}

function GPU3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color={spec.colors.pcb} roughness={0.7} />
      </mesh>
      <mesh position={[0, d / 2 + 0.01, 0]}>
        <boxGeometry args={[w * 0.85, 0.02, h * 0.85]} />
        <meshStandardMaterial color={spec.colors.shroud || spec.colors.heatsink || '#333'} roughness={0.6} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[w * (0.15 + i * 0.25), d / 2 + 0.02, 0]}>
          <cylinderGeometry args={[h * 0.12, h * 0.12, 0.01, 24]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
    </group>
  );
}

function Motherboard3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color={spec.colors.pcb} roughness={0.8} />
      </mesh>
      {spec.connectors.slice(0, 4).map((conn, i) => {
        const cx = (conn.position.x / 100 - 0.5) * w;
        const cz = (conn.position.y / 100 - 0.5) * h;
        return (
          <mesh key={conn.id} position={[cx, d / 2 + 0.005, cz]}>
            <boxGeometry args={[0.06, 0.01, 0.12]} />
            <meshStandardMaterial color={conn.color} />
          </mesh>
        );
      })}
    </group>
  );
}

function RAM3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color={spec.colors.pcb} roughness={0.6} />
      </mesh>
      <mesh position={[0, d / 2 + 0.01, 0]}>
        <boxGeometry args={[w * 0.85, 0.02, h * 0.85]} />
        <meshStandardMaterial color={spec.colors.heatsink || '#2c2c2c'} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PSU3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color={spec.colors.heatsink || '#222'} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, d / 2 + 0.01, 0]}>
        <cylinderGeometry args={[h * 0.2, h * 0.2, 0.01, 24]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function SSD3D({ spec }: { spec: ComponentRenderSpec }) {
  const s = MM_TO_3D;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color={spec.colors.pcb} roughness={0.7} />
      </mesh>
      <mesh position={[w * 0.02, d / 2 + 0.005, 0]}>
        <boxGeometry args={[w * 0.6, 0.01, h * 0.7]} />
        <meshStandardMaterial color={spec.colors.heatsink || '#c0c0c0'} metalness={0.3} roughness={0.5} opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

function Model3D({ spec }: { spec: ComponentRenderSpec }) {
  switch (spec.type) {
    case 'cpu': return <CPU3D spec={spec} />;
    case 'gpu': return <GPU3D spec={spec} />;
    case 'motherboard': return <Motherboard3D spec={spec} />;
    case 'ram': return <RAM3D spec={spec} />;
    case 'psu': return <PSU3D spec={spec} />;
    case 'ssd': case 'hdd': return <SSD3D spec={spec} />;
    default:
      return (
        <mesh>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color={spec.colors.pcb} />
        </mesh>
      );
  }
}

function Scene({ spec }: { spec: ComponentRenderSpec }) {
  const [interacted, setInteracted] = useState(false);
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        autoRotate={!interacted}
        autoRotateSpeed={0.3}
        minDistance={0.3}
        maxDistance={3}
        onStart={() => setInteracted(true)}
      />
      <Suspense fallback={null}>
        <Model3D spec={spec} />
      </Suspense>
    </>
  );
}

export default function ComponentViewer3D({ spec, width = 400, height = 300 }: ComponentViewer3DProps) {
  return (
    <div style={{
      width, height,
      background: '#f8fafc',
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <Canvas
        camera={{ position: [2, 1.5, 2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene spec={spec} />
      </Canvas>
    </div>
  );
}
