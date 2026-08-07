'use client';

import React, { useState, useRef, useEffect, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CameraEngine from './CameraEngine';
import CameraRig from './CameraRig';
import { Sky } from './SkyScene';
import { Ground, GrassField } from './GrassField';
import { PcCase } from './PcCase';
import HandPaw from './HandPaw';
import UI from './UI';
import Hud from './Hud';
import { headPose } from './tracking-shared';

const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;

class MainErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { ok: true };
  static getDerivedStateFromError() { return { ok: false }; }
  render() {
    if (!this.state.ok) {
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#cfe8ff', color: '#334466', fontFamily: 'monospace', fontSize: 14,
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

function SceneInner() {
  return (
    <>
      <Sky />
      <Ground />
      <GrassField />
      <HandPaw />
      <CameraRig />
      <PcCase />
    </>
  );
}

export default function VRShowroom() {
  const [camOn, setCamOn] = useState(true);

  const reset = () => {
    headPose.yaw = 0; headPose.pitch = 0; headPose.roll = 0;
  };

  return (
    <MainErrorBoundary>
      <div className="w-full h-screen bg-[#bfe3ff] relative overflow-hidden">
        <CameraEngine preview={camOn} />
        <Canvas
          camera={{ position: [0, 1.6, 3], fov: 60, near: 0.1, far: 200 }}
          dpr={isLowEnd ? [0.5, 0.75] : [0.75, 1]}
          gl={{
            antialias: false,
            powerPreference: 'low-power' as const,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.35,
          }}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor('#bfe3ff');
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <SceneInner />
        </Canvas>
        <Hud camOn={camOn} />
        <UI
          camEnabled={camOn}
          onToggleCam={() => setCamOn(v => !v)}
          onReset={reset}
          onCenter={reset}
        />
      </div>
    </MainErrorBoundary>
  );
}