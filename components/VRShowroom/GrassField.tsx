'use client';

// Mặt đất đồng cỏ: thảm cỏ + hàng nghìn ngọn cỏ InstancedMesh cuộn theo gió
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Tối ưu CPU theo sức máy: máy yếu = ít cỏ + bán kính nhỏ
function pickGrassBudget() {
  const cores = typeof navigator !== 'undefined' ? (navigator as any).hardwareConcurrency || 4 : 4;
  if (cores <= 2) return { count: 2200, radius: 18 };
  if (cores <= 4) return { count: 4200, radius: 26 };
  return { count: 6500, radius: 34 };
}
const GRASS_BUDGET = typeof window !== 'undefined' ? pickGrassBudget() : { count: 6500, radius: 34 };
const GRASS_COUNT = GRASS_BUDGET.count;
const FIELD_RADIUS = GRASS_BUDGET.radius;
const GRASS_HEIGHT = 0.5; // cỏ thấp hơn

// Sân cỏ nền
export function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(90, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4e9e3d', roughness: 1 }), []);
  return <mesh geometry={geo} material={mat} receiveShadow position={[0, -0.05, 0]} />;
}

function makeBladeGeometry() {
  const g = new THREE.BufferGeometry();
  const w = 0.02, h = 1.0, wMid = w * 0.7;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0,  w, 0, 0,  wMid, h, 0,
  ]), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0.5, 1]), 2));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  return g;
}

const GRASS_VERT = `
  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aBase;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vH;
  void main() {
    float h = position.y;
    vH = h;
    vColor = aColor;
    vec3 p = position;
    p.y *= aScale;
    float sway = sin(uTime * 1.6 + aPhase) * h * 0.22 * aScale;
    float sway2 = cos(uTime * 1.2 + aPhase * 1.7) * h * 0.12 * aScale;
    p.x += sway;
    p.z += sway2;
    p += aBase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const GRASS_FRAG = `
  varying vec3 vColor;
  varying float vH;
  void main() {
    vec3 col = mix(vColor * 0.55, vColor * 1.6, clamp(vH, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function GrassField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, material } = useMemo(() => {
    const geometry = makeBladeGeometry();
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: GRASS_VERT,
      fragmentShader: GRASS_FRAG,
      side: THREE.DoubleSide,
    });
    return { geometry, material };
  }, []);

  // Sinh dữ liệu ngẫu nhiên (đế cỏ) ở useEffect để tránh impure trong render
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const base = new Float32Array(GRASS_COUNT * 3);
    const phase = new Float32Array(GRASS_COUNT);
    const scale = new Float32Array(GRASS_COUNT);
    const color = new Float32Array(GRASS_COUNT * 3);
    const c0 = new THREE.Color('#5ec04e');
    const c1 = new THREE.Color('#3f9e3e');
    const c2 = new THREE.Color('#8ad94f');
    const c3 = new THREE.Color('#7fcb46');

    for (let i = 0; i < GRASS_COUNT; i++) {
      const r = Math.sqrt(Math.random()) * FIELD_RADIUS;
      const a = Math.random() * Math.PI * 2;
      base[i * 3] = Math.cos(a) * r;
      base[i * 3 + 1] = 0;
      base[i * 3 + 2] = Math.sin(a) * r;
      phase[i] = Math.random() * Math.PI * 2;
      scale[i] = 0.35 + Math.random() * 0.35; // cỏ thấp: 0.35-0.7
      const pick = Math.random();
      const c = pick < 0.35 ? c0 : pick < 0.7 ? c1 : (Math.random() < 0.5 ? c2 : c3);
      color[i * 3] = c.r; color[i * 3 + 1] = c.g; color[i * 3 + 2] = c.b;
    }

    const bBase = new THREE.InstancedBufferAttribute(base, 3);
    const bPhase = new THREE.InstancedBufferAttribute(phase, 1);
    const bScale = new THREE.InstancedBufferAttribute(scale, 1);
    const bColor = new THREE.InstancedBufferAttribute(color, 3);
    geometry.setAttribute('aBase', bBase);
    geometry.setAttribute('aPhase', bPhase);
    geometry.setAttribute('aScale', bScale);
    geometry.setAttribute('aColor', bColor);
    bBase.setUsage(THREE.StaticDrawUsage);
    bPhase.setUsage(THREE.StaticDrawUsage);
    bScale.setUsage(THREE.StaticDrawUsage);
    bColor.setUsage(THREE.StaticDrawUsage);

    // đặt instance matrix (identity) cho mỗi cỏ
    const dummy = new THREE.Object3D();
    for (let i = 0; i < GRASS_COUNT; i++) {
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [geometry]);

  useFrame((state) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat && mat.uniforms) {
      // eslint-disable-next-line react-hooks/immutability -- cập nhật uniform mỗi frame
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, GRASS_COUNT]}
      frustumCulled={false}
    />
  );
}