'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import UnifiedTracker from '../UnifiedTracker';
import PlayerController from './PlayerController';
import ModelDisplay from './ModelDisplay';
import Hand3D from './Hand3D';
import InfoPanel from './InfoPanel';
import UI from './UI';
import { ITEMS } from './ITEMS';

function PlayerPosTracker({ onPos }: { onPos: (v: THREE.Vector3) => void }) {
  useFrame(({ camera }: { camera: THREE.Camera }) => {
    onPos(camera.position);
  });
  return null;
}

function Hall({ onInteract, playerPos }: { onInteract: (id: string) => void; playerPos: THREE.Vector3 }) {
  return (
    <group>
      <color attach="background" args={['#f0f4ff']} />
      <fog attach="fog" args={['#f0f4ff', 25, 45]} />
      <ambientLight intensity={1.0} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#c8d8f0', 0.5]} />
      <directionalLight position={[10, 20, 8]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-8, 16, -6]} intensity={0.6} color="#d0e0ff" />
      <directionalLight position={[0, 20, 0]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 8, 0]} intensity={0.4} distance={30} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#e0e4ec" roughness={0.3} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.5, -13]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.15, 0.4]} />
        <meshPhysicalMaterial color="#c8d0dc" roughness={0.5} />
      </mesh>
      <Text position={[0, 3.3, -12.5]} fontSize={0.5} color="#334466" font="monospace" anchorX="center" anchorY="middle">
        PHÒNG TRIỂN LÃM LINH KIỆN PC
      </Text>
      <Text position={[0, 2.9, -12.5]} fontSize={0.2} color="#667799" font="monospace" anchorX="center" anchorY="middle">
        WASD di chuyển • Chuột xoay • Click chạm vào linh kiện
      </Text>
      {ITEMS.map((item) => (
        <ModelDisplay
          key={item.id}
          file={item.file}
          color={item.color}
          position={item.pos}
          onInteract={() => onInteract(item.id)}
          playerPos={playerPos}
        />
      ))}
    </group>
  );
}

function SceneInner({ onInteract }: { onInteract: (id: string) => void }) {
  const posRef = useRef(new THREE.Vector3(0, 1.7, 0));
  const playerPos = posRef.current;

  return (
    <>
      <PlayerPosTracker onPos={(v: THREE.Vector3) => { posRef.current.copy(v); }} />
      <PlayerController />
      <Hall onInteract={onInteract} playerPos={playerPos} />
      <Hand3D />
    </>
  );
}

export default function VRShowroom() {
  const [camOn, setCamOn] = useState(false);
  const [handOn, setHandOn] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const camKey = useRef(0);

  const handleInteract = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
      {camOn && <UnifiedTracker key={camKey.current} />}
      <Canvas shadows camera={{ position: [0, 1.7, 5], fov: 60, near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#f0f4ff');
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SceneInner onInteract={handleInteract} />
      </Canvas>
      <InfoPanel itemId={selectedId} onClose={() => setSelectedId(null)} />
      <UI
        camEnabled={camOn}
        handEnabled={handOn}
        debugMode={debugOn}
        onToggleCam={() => { setCamOn(v => !v); camKey.current++; }}
        onToggleHand={() => setHandOn(v => !v)}
        onReset={() => {
          setSelectedId(null);
          camKey.current++;
          setCamOn(false);
          setHandOn(false);
        }}
        onCenter={() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        }}
        onToggleDebug={() => setDebugOn(v => !v)}
      />
      {debugOn && <DebugOverlay />}
    </div>
  );
}

function DebugOverlay() {
  const [fps, setFps] = useState(0);
  const ref = useRef({ frames: 0, last: performance.now() });
  useEffect(() => {
    let id: number;
    const loop = () => {
      ref.current.frames++;
      const n = performance.now();
      if (n - ref.current.last >= 1000) {
        setFps(ref.current.frames);
        ref.current.frames = 0;
        ref.current.last = n;
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      padding: '8px 12px', borderRadius: 10,
      color: '#00ff88', fontSize: 11, fontFamily: 'monospace',
      border: '1px solid rgba(0,255,136,0.2)',
    }}>
      FPS: {fps}
    </div>
  );
}
