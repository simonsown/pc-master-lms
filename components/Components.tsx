'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text, Float, Sparkles, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useAssemblyStore, type ComponentType } from '@/lib/useStore';

const COMPONENT_COLORS: Record<ComponentType, { base: string; emissive: string }> = {
  cpu: { base: '#c0c0c0', emissive: '#00d4aa' },
  cooler: { base: '#2a2a3a', emissive: '#00aaff' },
  ram: { base: '#1a1a2e', emissive: '#6366f1' },
  gpu: { base: '#2d2d2d', emissive: '#ef4444' },
  psu: { base: '#1a1a1a', emissive: '#f59e0b' },
  ssd: { base: '#1a1a2e', emissive: '#22c55e' },
  motherboard: { base: '#1a3a1a', emissive: '#8b5cf6' },
};

const SNAP_DISTANCE = 0.15;

const WORKBENCH_POSITIONS: Record<ComponentType, [number, number, number]> = {
  cpu: [-1.4, 0.12, 1.8],
  cooler: [-0.5, 0.12, 1.8],
  ram: [0.5, 0.12, 1.8],
  gpu: [1.4, 0.12, 1.8],
  psu: [-1.0, 0.12, -1.8],
  ssd: [1.0, 0.12, -1.8],
  motherboard: [0, -0.15, 0],
};

function GoldPins({ count = 20, width = 0.35 }) {
  const pins = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push((i / count - 0.5) * width);
    }
    return arr;
  }, [count, width]);
  return (
    <>
      {pins.map((x, i) => (
        <mesh key={i} position={[x, -0.02, 0]}>
          <boxGeometry args={[0.008, 0.015, 0.01]} />
          <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
    </>
  );
}

function CpuModel({ hovered, position, installed }: { hovered: boolean; position: [number, number, number]; installed: boolean }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.55, 0.04, 0.55]} radius={0.01} smoothness={2}>
        <meshStandardMaterial
          color="#c0c0c0"
          metalness={0.75}
          roughness={0.25}
          emissive={hovered ? '#00d4aa' : '#000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </RoundedBox>
      <mesh position={[0, 0.03, 0]}>
        <RoundedBox args={[0.48, 0.005, 0.48]} radius={0.008}>
          <meshStandardMaterial color="#e8e8e8" metalness={0.6} roughness={0.3} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.24, 0.035, 0.24]} rotation={[0, 0, Math.PI / 4]}>
        <RoundedBox args={[0.025, 0.004, 0.025]} radius={0.003}>
          <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <RoundedBox args={[0.56, 0.012, 0.56]} radius={0.005}>
          <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, -0.035, 0]}>
        <boxGeometry args={[0.4, 0.008, 0.4]} />
        <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.3} />
      </mesh>
      <GoldPins count={16} width={0.28} />
      {installed && (
        <pointLight position={[0, 0.06, 0]} intensity={0.2} color="#00d4aa" distance={0.3} />
      )}
    </group>
  );
}

function CoolerModel({ hovered, position, installed, fanSpeed }: {
  hovered: boolean; position: [number, number, number];
  installed: boolean; fanSpeed: number;
}) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef.current && fanSpeed > 0) {
      fanRef.current.rotation.y += delta * fanSpeed * 12;
    }
  });

  return (
    <group position={position}>
      <RoundedBox args={[0.7, 0.03, 0.7]} radius={0.02}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
        <meshStandardMaterial
          color="#2a2a3a"
          metalness={0.4}
          roughness={0.5}
          emissive={hovered ? '#00aaff' : '#000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      <group ref={fanRef} position={[0, 0.05, 0]}>
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (i / 9) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * 0.2, 0, Math.cos(angle) * 0.2]}
              rotation={[0, -angle, 0.3]}
            >
              <boxGeometry args={[0.04, 0.004, 0.16]} />
              <meshStandardMaterial
                color={installed ? '#6b7280' : '#444'}
                metalness={0.3}
                roughness={0.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.008, 16]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3}>
          <meshStandardMaterial color="#333" metalness={0.5} roughness={0.3} />
        </meshStandardMaterial>
      </mesh>
      {installed && (
        <mesh position={[0, 0.07, 0]}>
          <torusGeometry args={[0.28, 0.006, 8, 32]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00aaff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

function RamModel({ hovered, position, installed }: {
  hovered: boolean; position: [number, number, number]; installed: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[0.07, 0.4, 0.018]} radius={0.005}>
        <meshStandardMaterial color="#0a0a12" roughness={0.85} />
      </RoundedBox>
      <mesh position={[-0.045, 0, 0]}>
        <RoundedBox args={[0.02, 0.32, 0.028]} radius={0.004}>
          <meshStandardMaterial
            color={hovered ? '#6366f1' : '#1a1a2e'}
            metalness={0.5}
            roughness={0.4}
            emissive={hovered ? '#6366f1' : '#000'}
            emissiveIntensity={hovered ? 0.5 : 0}
          />
        </RoundedBox>
      </mesh>
      <mesh position={[0.045, 0, 0]}>
        <RoundedBox args={[0.02, 0.32, 0.028]} radius={0.004}>
          <meshStandardMaterial
            color={hovered ? '#6366f1' : '#1a1a2e'}
            metalness={0.5}
            roughness={0.4}
            emissive={hovered ? '#6366f1' : '#000'}
            emissiveIntensity={hovered ? 0.5 : 0}
          />
        </RoundedBox>
      </mesh>
      <mesh position={[0, -0.19, 0]}>
        <boxGeometry args={[0.065, 0.05, 0.014]} />
        <meshStandardMaterial color="#d4a017" metalness={0.85} roughness={0.15} />
      </mesh>
      {installed && (
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.04, 0.2]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

function GpuModel({ hovered, position, installed, fanSpeed }: {
  hovered: boolean; position: [number, number, number];
  installed: boolean; fanSpeed: number;
}) {
  const fanRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  useFrame((_, delta) => {
    fanRefs.current.forEach((ref) => {
      if (ref && fanSpeed > 0) ref.rotation.y += delta * fanSpeed * 15;
    });
  });

  return (
    <group position={position}>
      <RoundedBox args={[1.5, 0.06, 0.6]} radius={0.01}>
        <meshStandardMaterial
          color="#2d2d2d"
          roughness={0.85}
          emissive={hovered ? '#ef4444' : '#000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </RoundedBox>
      <mesh position={[0, 0.04, 0]}>
        <RoundedBox args={[1.4, 0.008, 0.5]} radius={0.005}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </RoundedBox>
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.075, 0]}>
          <mesh>
            <torusGeometry args={[0.15, 0.012, 8, 24]} />
            <meshStandardMaterial
              color={installed ? '#ef4444' : hovered ? '#ef4444' : '#444'}
              emissive={installed ? '#ef4444' : '#000'}
              emissiveIntensity={installed ? 0.4 : 0}
              transparent
              opacity={0.7}
            />
          </mesh>
          <group ref={(el) => { fanRefs.current[i] = el; }}>
            {Array.from({ length: 9 }).map((_, j) => {
              const angle = (j / 9) * Math.PI * 2;
              return (
                <mesh
                  key={j}
                  position={[Math.sin(angle) * 0.1, 0, Math.cos(angle) * 0.1]}
                  rotation={[0, -angle, 0.3]}
                >
                  <boxGeometry args={[0.025, 0.003, 0.08]} />
                  <meshStandardMaterial color="#555" transparent opacity={0.7} />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}
      <mesh position={[0, -0.035, 0]}>
        <RoundedBox args={[0.6, 0.012, 0.04]} radius={0.005}>
          <meshStandardMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.75, 0, 0]}>
        <RoundedBox args={[0.02, 0.1, 0.08]} radius={0.004}>
          <meshStandardMaterial color="#333" metalness={0.3} roughness={0.5} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

function PsuModel({ hovered, position, installed }: {
  hovered: boolean; position: [number, number, number]; installed: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[1.0, 0.3, 0.6]} radius={0.01}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.4}
          roughness={0.5}
          emissive={hovered ? '#f59e0b' : '#000'}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </RoundedBox>
      <mesh position={[0, 0.14, 0]}>
        <torusGeometry args={[0.25, 0.008, 8, 24]} />
        <meshStandardMaterial color={hovered ? '#f59e0b' : '#333'} />
      </mesh>
      <mesh position={[0.52, 0.06, 0]}>
        <RoundedBox args={[0.02, 0.12, 0.2]} radius={0.005}>
          <meshStandardMaterial color="#111" />
        </RoundedBox>
      </mesh>
      <mesh position={[0.54, 0.06, -0.08]}>
        <boxGeometry args={[0.015, 0.025, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.54, 0.06, 0.08]}>
        <boxGeometry args={[0.015, 0.025, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.52, 0, 0]}>
        <RoundedBox args={[0.025, 0.08, 0.08]} radius={0.004}>
          <meshStandardMaterial color="#333" />
        </RoundedBox>
      </mesh>
      {installed && (
        <mesh position={[0, 0.16, 0]}>
          <pointLight intensity={0.15} color="#f59e0b" distance={0.4} />
        </mesh>
      )}
    </group>
  );
}

function SsdModel({ hovered, position, installed }: {
  hovered: boolean; position: [number, number, number]; installed: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[0.7, 0.012, 0.2]} radius={0.005}>
        <meshStandardMaterial
          color="#0a0a12"
          roughness={0.85}
          emissive={hovered ? '#22c55e' : '#000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </RoundedBox>
      <mesh position={[-0.1, 0.008, 0]}>
        <RoundedBox args={[0.15, 0.006, 0.1]} radius={0.003}>
          <meshStandardMaterial color="#333" roughness={0.7} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.37, 0, 0]}>
        <RoundedBox args={[0.03, 0.006, 0.16]} radius={0.003}>
          <meshStandardMaterial color="#d4a017" metalness={0.85} roughness={0.15} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.37, 0.004, 0]}>
        <boxGeometry args={[0.04, 0.003, 0.18]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function MotherboardModel({ hovered, position, installed }: {
  hovered: boolean; position: [number, number, number]; installed: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[2.2, 0.015, 1.8]} radius={0.01}>
        <meshStandardMaterial
          color="#0d2818"
          roughness={0.9}
          emissive={hovered ? '#8b5cf6' : '#000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </RoundedBox>
      <mesh position={[0.5, 0.01, 0.35]}>
        <RoundedBox args={[0.5, 0.006, 0.5]} radius={0.005}>
          <meshStandardMaterial color="#b0b0b0" metalness={0.4} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.5, 0.014, 0.35]}>
        <RoundedBox args={[0.35, 0.003, 0.35]} radius={0.003}>
          <meshStandardMaterial color="#888" metalness={0.3} roughness={0.5} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.65, 0.01, 0.4]}>
        <RoundedBox args={[0.2, 0.006, 1.0]} radius={0.004}>
          <meshStandardMaterial color="#222" roughness={0.8} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 0.01, -0.4]}>
        <RoundedBox args={[1.2, 0.006, 0.06]} radius={0.003}>
          <meshStandardMaterial color="#444" roughness={0.6} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.7, 0.01, -0.5]}>
        <RoundedBox args={[0.06, 0.006, 0.06]} radius={0.003}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
        </RoundedBox>
      </mesh>
      <mesh position={[-0.2, 0.012, -0.6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.006, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0.012, -0.6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.006, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ModelRenderer({ type, hovered, installed, fanSpeed }: {
  type: ComponentType; hovered: boolean;
  installed: boolean; fanSpeed: number;
}) {
  const pos: [number, number, number] = [0, 0, 0];
  switch (type) {
    case 'cpu': return <CpuModel hovered={hovered} position={pos} installed={installed} />;
    case 'cooler': return <CoolerModel hovered={hovered} position={pos} installed={installed} fanSpeed={fanSpeed} />;
    case 'ram': return <RamModel hovered={hovered} position={pos} installed={installed} />;
    case 'gpu': return <GpuModel hovered={hovered} position={pos} installed={installed} fanSpeed={fanSpeed} />;
    case 'psu': return <PsuModel hovered={hovered} position={pos} installed={installed} />;
    case 'ssd': return <SsdModel hovered={hovered} position={pos} installed={installed} />;
    case 'motherboard': return <MotherboardModel hovered={hovered} position={pos} installed={installed} />;
    default: return null;
  }
}

function DraggableComponent({
  type, slotId, initialPosition,
}: {
  type: ComponentType; slotId: string; initialPosition: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragPos = useRef(new THREE.Vector3(...initialPosition));
  const snapTarget = useRef<THREE.Vector3 | null>(null);
  const snapProgress = useRef(0);
  const isAnimating = useRef(false);

  const { camera, pointer, scene } = useThree();
  const store = useAssemblyStore();
  const installed = store.components.find((c) => c.slotId === slotId)?.installed ?? false;
  const slots = store.slots;
  const fanSpeed = store.fanSpeed;
  const slot = slots.find((s) => s.id === slotId);

  const colors = COMPONENT_COLORS[type];

  const trySnap = useCallback((pos: THREE.Vector3) => {
    let closest = null;
    let closestDist = SNAP_DISTANCE;

    for (const s of slots) {
      if (s.type !== type || s.locked) continue;
      const alreadyOccupied = store.components.some(
        (c) => c.slotId === s.id && c.installed
      );
      if (alreadyOccupied) continue;
      const slotPos = new THREE.Vector3(...s.position);
      const dist = pos.distanceTo(slotPos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = s;
      }
    }
    return closest;
  }, [type, slots, store.components]);

  const playSnapSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.18);
      setTimeout(() => audioCtx.close(), 500);
    } catch {}
  }, []);

  const onPointerDown = useCallback((e: any) => {
    e.stopPropagation();
    if (installed || isAnimating.current) return;
    setDragging(true);
    store.setDraggedComponent(slotId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [installed, slotId, store]);

  const onPointerUp = useCallback(() => {
    if (!dragging || isAnimating.current) return;
    setDragging(false);
    store.setDraggedComponent(null);

    const pos = dragPos.current;
    const target = trySnap(pos);
    if (target) {
      snapTarget.current = new THREE.Vector3(...target.position);
      snapProgress.current = 0;
      isAnimating.current = true;
      playSnapSound();
    }
  }, [dragging, store, slotId, trySnap, playSnapSound]);

  useFrame((_, delta) => {
    if (isAnimating.current && snapTarget.current) {
      snapProgress.current = Math.min(snapProgress.current + delta * 4, 1);
      const eased = 1 - Math.pow(1 - snapProgress.current, 3);
      dragPos.current.lerp(snapTarget.current, eased);
      if (snapProgress.current >= 1) {
        isAnimating.current = false;
        store.installComponent(slotId, `comp_${slotId}`);
      }
      if (groupRef.current) {
        groupRef.current.position.copy(dragPos.current);
      }
      return;
    }

    if (dragging && !installed) {
      const worldPos = new THREE.Vector3(pointer.x, pointer.y, 0.5).unproject(camera);
      const dir = worldPos.sub(camera.position).normalize();
      const dist = -camera.position.y / dir.y;
      const p = camera.position.clone().add(dir.multiplyScalar(dist));
      p.y = Math.max(0.02, p.y);
      p.x = Math.max(-2, Math.min(2, p.x));
      p.z = Math.max(-2, Math.min(2, p.z));
      dragPos.current.copy(p);
    }

    if (groupRef.current) {
      if (!isAnimating.current) {
        groupRef.current.position.lerp(dragPos.current, 0.25);
      }
    }
  });

  if (installed && slot) {
    dragPos.current.set(slot.position[0], slot.position[1], slot.position[2]);
    if (groupRef.current) {
      groupRef.current.position.copy(dragPos.current);
    }
  }

  return (
    <group
      ref={groupRef}
      position={dragPos.current.toArray()}
      scale={dragging ? 1.15 : hovered && !installed ? 1.08 : 1}
    >
      <mesh
        visible={!installed}
        position={[0, 0.1, 0]}
        onPointerOver={(e) => { e.stopPropagation(); if (!installed) { setHovered(true); document.body.style.cursor = 'grab'; }}}
        onPointerOut={() => { if (!installed) { setHovered(false); document.body.style.cursor = 'default'; }}}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <ModelRenderer type={type} hovered={hovered && !installed} installed={installed} fanSpeed={fanSpeed} />

      {hovered && !installed && !dragging && (
        <Html position={[0, 0.35, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.85)', color: colors.emissive,
            padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            border: `1px solid ${colors.emissive}55`,
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {slot?.label || type.toUpperCase()}
          </div>
        </Html>
      )}

      {hovered && !installed && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.38, 32]} />
          <meshBasicMaterial color={colors.emissive} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {dragging && (
        <Sparkles count={10} scale={0.6} size={3} speed={0.3} color={colors.emissive} opacity={0.5} />
      )}
    </group>
  );
}

function SlotIndicator({ position, type, occupied }: {
  position: [number, number, number]; type: ComponentType; occupied: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors = COMPONENT_COLORS[type];

  useFrame(({ clock }) => {
    if (meshRef.current && !occupied) {
      const p = (Math.sin(clock.getElapsedTime() * 2.5) + 1) / 2;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + p * 0.25;
    }
  });

  if (occupied) return null;
  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.003, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.22, 0.3, 48]} />
      <meshStandardMaterial color={colors.emissive} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export default function Components() {
  const slots = useAssemblyStore((s) => s.slots);
  const components = useAssemblyStore((s) => s.components);

  const slotList = useMemo(() =>
    slots.map((slot) => ({
      ...slot,
      occupied: components.some((c) => c.slotId === slot.id && c.installed),
    })),
    [slots, components]
  );

  return (
    <group>
      {slotList.map((slot) => (
        <group key={slot.id}>
          <SlotIndicator position={slot.position} type={slot.type} occupied={slot.occupied} />
          <DraggableComponent type={slot.type} slotId={slot.id} initialPosition={
            WORKBENCH_POSITIONS[slot.type] || [0, 0.1, 0]
          } />
        </group>
      ))}
    </group>
  );
}
