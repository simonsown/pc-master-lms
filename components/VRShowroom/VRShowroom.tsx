'use client';

import React, { useState, useRef, useEffect, useCallback, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import UnifiedTracker from '../UnifiedTracker';
import PlayerController from './PlayerController';
import ModelDisplay from './ModelDisplay';
import Hand3D from './Hand3D';
import InfoPanel from './InfoPanel';
import UI from './UI';
import { ITEMS } from './ITEMS';

const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4; // i3 / low-end

class MainErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() {
    if (!this.state.ok) {
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f0f4ff', color: '#334466', fontFamily: 'monospace', fontSize: 14,
          gap: 12, padding: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28 }}>⚠</div>
          <div>Đã xảy ra lỗi hiển thị 3D.</div>
          <div style={{ fontSize: 11, color: '#8899bb' }}>Thử refresh trang hoặc tắt extension trình duyệt.</div>
          <button onClick={() => window.location.reload()}
            style={{ padding: '6px 20px', borderRadius: 8, border: '1px solid #667799', background: '#e8ecf4', cursor: 'pointer', fontSize: 12 }}>
            ⟳ Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PlayerPosTracker({ onPos }: { onPos: (v: THREE.Vector3) => void }) {
  useFrame(({ camera }) => {
    onPos(camera.position);
  });
  return null;
}

function makeLabel(text: string, color: string, size: number) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.95, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(6, 0.3, 1);
  return sp;
}

function Hall({ onInteract, playerPos }: { onInteract: (id: string) => void; playerPos: THREE.Vector3 }) {
  const added = useRef(false);

  useFrame(({ scene }) => {
    if (added.current) return;
    added.current = true;
    const t = makeLabel('PHÒNG TRIỂN LÃM LINH KIỆN PC', '#334466', 32);
    t.position.set(0, 3.3, -12.5);
    scene.add(t);
    const i = makeLabel('WASD di chuyển • Chuột xoay • Click chạm vào linh kiện', '#667799', 18);
    i.position.set(0, 2.9, -12.5);
    scene.add(i);
  });

  return (
    <group>
      <color attach="background" args={['#f0f4ff']} />
      <ambientLight intensity={1.0} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#c8d8f0', 0.5]} />
      <directionalLight position={[10, 15, 8]} intensity={1.0} castShadow={!isLowEnd} shadow-mapSize={isLowEnd ? [256, 256] : [512, 512]} />
      <directionalLight position={[-8, 12, -6]} intensity={0.5} color="#d0e0ff" />
      <directionalLight position={[0, 15, 0]} intensity={0.3} color="#ffffff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#e0e4ec" roughness={0.6} />
      </mesh>
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
      <PlayerPosTracker onPos={(v) => { posRef.current.copy(v); }} />
      <PlayerController />
      <Hall onInteract={onInteract} playerPos={playerPos} />
      <Hand3D />
    </>
  );
}

export default function VRShowroom({ onFocus, focusId }: { onFocus?: (id: string | null) => void; focusId?: string | null }) {
  const [camOn, setCamOn] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const camKey = useRef(0);

  const handleInteract = useCallback((id: string) => {
    const next = selectedId === id ? null : id;
    setSelectedId(next);
    if (onFocus) onFocus(next);
  }, [selectedId, onFocus]);

  return (
    <MainErrorBoundary>
      <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
        {camOn && <UnifiedTracker key={camKey.current} />}
        <Canvas camera={{ position: [0, 1.7, 5], fov: 55, near: 0.1, far: 30 }}
          dpr={isLowEnd ? [0.5, 0.75] : [1, 1.2]}
          gl={{ antialias: false, powerPreference: 'low-power' as const }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f0f4ff');
            if (!isLowEnd) { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }
          }}
        >
          <SceneInner onInteract={handleInteract} />
        </Canvas>
        {!focusId && <InfoPanel itemId={selectedId} onClose={() => setSelectedId(null)} />}
        <UI
          camEnabled={camOn}
          handEnabled={false}
          debugMode={debugOn}
          onToggleCam={() => { setCamOn(v => !v); camKey.current++; }}
          onToggleHand={() => {}}
          onReset={() => { setSelectedId(null); camKey.current++; setCamOn(false); if (onFocus) onFocus(null); }}
          onCenter={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }}
          onToggleDebug={() => setDebugOn(v => !v)}
        />
        {debugOn && <FpsOverlay />}
      </div>
    </MainErrorBoundary>
  );
}

function FpsOverlay() {
  const [fps, setFps] = useState(0);
  const ref = useRef({ frames: 0, last: 0 });
  useEffect(() => {
    let id: number;
    ref.current.last = performance.now();
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
      padding: '6px 10px', borderRadius: 8,
      color: '#00ff88', fontSize: 11, fontFamily: 'monospace',
      border: '1px solid rgba(0,255,136,0.2)',
    }}>
      FPS: {fps} {isLowEnd ? '(Low mode)' : ''}
    </div>
  );
}
