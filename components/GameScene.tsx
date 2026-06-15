'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Stars, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useAssemblyStore } from '@/lib/useStore';
import PcCase from './PcCase';
import Components from './Components';

function ControlledCamera() {
  const cameraCoords = useAssemblyStore((s) => s.cameraCoords);
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.65, 2.2));
  const lookTarget = useRef(new THREE.Vector3(0, 0.65, 0));

  useFrame(() => {
    const { pitch, yaw, roll } = cameraCoords;

    const dist = bootStatus === 'success' ? 1.6 : 2.2;
    const xOff = yaw * 0.7;
    const yOff = pitch * 0.4 + 0.65;
    const zOff = dist - Math.abs(yaw) * 0.25;

    const target = new THREE.Vector3(xOff, yOff, zOff);
    targetPos.current.lerp(target, 0.06);

    camera.position.copy(targetPos.current);

    const look = new THREE.Vector3(yaw * 0.12, 0.65 + pitch * 0.08, 0);
    lookTarget.current.lerp(look, 0.06);
    camera.lookAt(lookTarget.current);

    const targetRoll = roll * 0.25;
    camera.rotation.z += (targetRoll - camera.rotation.z) * 0.04;
  });

  return null;
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={12}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
      >
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.1, 12]} />
      </directionalLight>
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#4488ff" />
      <directionalLight position={[0, -1, 5]} intensity={0.2} />
      <pointLight position={[0, 2, 1.5]} intensity={0.6} color="#00d4aa" distance={4} decay={1} />
      <pointLight position={[-2, 0.5, -1]} intensity={0.3} color="#4488ff" distance={3} decay={1} />
    </>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#050510" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

function EnvironmentSetup() {
  return (
    <>
      <Environment
        preset="studio"
        environmentIntensity={0.5}
        environmentRotation={[0, Math.PI / 4, 0]}
      >
        <Lightformer form="ring" color="#00d4aa" intensity={0.3} scale={5} position={[0, 2, -3]} />
        <Lightformer form="rect" color="#4488ff" intensity={0.2} scale={4} position={[-3, 1, 3]} />
      </Environment>
      <ContactShadows
        position={[0, -0.14, 0]}
        opacity={0.6}
        scale={8}
        blur={2.5}
        far={4}
        resolution={512}
      />
    </>
  );
}

function AmbientParticles() {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        color="#00d4aa"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function GameScene() {
  const bootStatus = useAssemblyStore((s) => s.bootStatus);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: '#050510', overflow: 'hidden',
    }}>
      <Canvas
        camera={{ position: [0, 0.65, 2.2], fov: 48, near: 0.05, far: 15 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows="percentage"
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 5, 10]} />
        <ControlledCamera />
        <SceneLighting />
        <GroundPlane />
        <Suspense fallback={null}>
          <EnvironmentSetup />
        </Suspense>
        <Suspense fallback={null}>
          <PcCase />
        </Suspense>
        <Suspense fallback={null}>
          <Components />
        </Suspense>
        <AmbientParticles />

        {bootStatus === 'success' && (
          <pointLight position={[0, 1, 0.5]} intensity={3} color="#00d4aa" distance={4} decay={0.5} />
        )}
      </Canvas>
    </div>
  );
}
