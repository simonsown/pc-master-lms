'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Maximize2, RotateCw, Play, Pause, RefreshCw, Eye, Info,
  Cpu, HardDrive, Zap, ShieldAlert, CheckCircle2, ChevronRight, Sparkles, X, ArrowLeft
} from 'lucide-react';

// Types for components
export interface PCComponentData {
  id: string;
  name: string;
  category: string;
  color: string;
  basePos: [number, number, number];
  explodeDir: [number, number, number]; // Direction vector * distance
  specs: { [key: string]: string };
  description: string;
  role: string;
  disassemblySteps: string[];
}

export const PC_PARTS_DATA: Record<string, PCComponentData> = {
  glass: {
    id: 'glass',
    name: 'Mặt Kính Cường Lực (Side Glass)',
    category: 'Vỏ Case',
    color: '#88ccff',
    basePos: [-1.3, 0.2, 0],
    explodeDir: [-2.2, 0, 0],
    specs: {
      'Loại': 'Kính cường lực 4mm',
      'Tính năng': 'Chống xước, truyền sáng 92%',
      'Cố định': '4 Ốc vặn tay cao su'
    },
    description: 'Tấm kính bên hông bảo vệ các linh kiện bên trong khỏi bụi bẩn và tạo thẩm mỹ show dàn đèn RGB.',
    role: 'Bảo vệ linh kiện & cách âm, tạo dòng khí lưu thông chuẩn.',
    disassemblySteps: ['Vặn 4 ốc núm cao su ở 4 góc', 'Nâng nhẹ kính ra khỏi gờ đỡ bottom']
  },
  case_frame: {
    id: 'case_frame',
    name: 'Khung Vỏ Case (ATX Mid Tower)',
    category: 'Vỏ Case',
    color: '#3a4a6c',
    basePos: [0, 0, 0],
    explodeDir: [0, -0.2, 0],
    specs: {
      'Chuẩn Main': 'ATX / Micro-ATX / Mini-ITX',
      'Chất liệu': 'Thép SPCC 0.8mm',
      'Hỗ trợ quạt': 'Tối đa 6 quạt 120mm'
    },
    description: 'Bộ khung thép chịu lực giữ tất cả linh kiện cố định và tạo khe đi dây cáp gọn gàng.',
    role: 'Nền tảng lắp ráp, phân bổ luồng khí tản nhiệt.',
    disassemblySteps: ['Tháo 2 nắp hông', 'Tháo mặt nạ trước (Front panel)']
  },
  motherboard: {
    id: 'motherboard',
    name: 'Bo Mạch Chủ (MSI B550 Gaming Plus)',
    category: 'Mainboard',
    color: '#8b5cf6',
    basePos: [0, 0.2, -0.3],
    explodeDir: [0, 0, -1.2],
    specs: {
      'Socket': 'AMD AM4',
      'Chipset': 'B550 High-Performance',
      'Khe RAM': '4x DDR4 DIMM (Up to 128GB)',
      'Khe cắm': 'PCIe 4.0 x16, 2x M.2 NVMe'
    },
    description: 'Trái tim kết nối tất cả linh kiện PC với nhau, cung cấp năng lượng và truyền dữ liệu tốc độ cao.',
    role: 'Định tuyến tín hiệu giữa CPU, RAM, GPU và ổ cứng.',
    disassemblySteps: ['Rút hết dây nguồn 24-pin & 8-pin CPU', 'Tháo 9 ốc ốc bắt Standoff trên khung case']
  },
  cpu: {
    id: 'cpu',
    name: 'Bộ Vi Xử Lý (AMD Ryzen 7 5700X3D)',
    category: 'CPU',
    color: '#00d4aa',
    basePos: [0, 0.35, -0.15],
    explodeDir: [-0.6, 1.4, 0.5],
    specs: {
      'Số nhân/luồng': '8 Nhân / 16 Luồng',
      'Xung nhịp': '3.0 GHz - 4.1 GHz',
      'Bộ nhớ đệm': '100MB 3D V-Cache',
      'TDP': '105W'
    },
    description: 'Bộ não xử lý logic, tính toán các thuật toán game và ứng dụng đồ họa nặng.',
    role: 'Thực thi mọi câu lệnh điều khiển và tính toán hệ thống.',
    disassemblySteps: ['Gạt cần giữ Socket AM4 lên 90°', 'Nhấc thẳng CPU vuông góc theo chiều đứng']
  },
  cooler: {
    id: 'cooler',
    name: 'Tản Nhiệt Khí RGB (Dual Heatpipe Air Cooler)',
    category: 'Tản nhiệt',
    color: '#00aaff',
    basePos: [0, 0.7, -0.15],
    explodeDir: [0, 2.2, 0.2],
    specs: {
      'Ống đồng': '4x Heatpipe 6mm tiếp xúc trực tiếp',
      'Quạt': '120mm PWM Silent Fan',
      'LED': 'Addressable RGB 5V 3-Pin'
    },
    description: 'Hấp thụ nhiệt lượng tỏa ra từ IHS của CPU và giải nhiệt qua lá nhôm cùng quạt gió.',
    role: 'Giữ CPU hoạt động mát mẻ dưới 75°C, tránh nghẽn xung nhiệt (Thermal Throttling).',
    disassemblySteps: ['Rút dây quạt CPU_FAN', 'Vặn nới lỏng 2 ốc ngoàm giữ ngàm tản', 'Xoay nhẹ khối tản để ngắt keo tản nhiệt']
  },
  ram: {
    id: 'ram',
    name: 'Bộ Nhớ Trong (Corsair Dominator RGB 32GB)',
    category: 'RAM',
    color: '#6366f1',
    basePos: [-0.55, 0.4, -0.05],
    explodeDir: [-1.8, 1.0, 0.4],
    specs: {
      'Dung lượng': '32GB (2x16GB Dual Channel)',
      'Chuẩn/Tốc độ': 'DDR4 3600MHz CL18',
      'Tản nhiệt': 'Nhôm nguyên khối phay xước'
    },
    description: 'Bộ nhớ truy xuất ngẫu nhiên tốc độ cực cao chứa dữ liệu tạm thời cho CPU làm việc.',
    role: 'Tăng tốc độ đa nhiệm, giữ game và phần mềm chạy mượt không bị giật khựng.',
    disassemblySteps: ['Bấm gạt 2 ngàm khóa ở đầu khe RAM', 'Rút thanh RAM thẳng đứng lên trên']
  },
  gpu: {
    id: 'gpu',
    name: 'Card Đồ Họa (ASUS ROG RTX 4090 24GB)',
    category: 'GPU',
    color: '#ef4444',
    basePos: [0.1, 0.1, 0.2],
    explodeDir: [2.2, 0.4, 0.8],
    specs: {
      'Bộ nhớ VRAM': '24GB GDDR6X 384-bit',
      'Nhân CUDA': '16,384 Cores',
      'Nguồn khuyến nghị': '850W - 1000W'
    },
    description: 'Card đồ họa khủng xử lý hiệu ứng 3D, Ray Tracing, AI DLSS và xuất hình ảnh ra màn hình.',
    role: 'Xử lý tính toán đồ họa 3D, dựng video và render mô hình.',
    disassemblySteps: ['Bấm ngàm lẫy PCIe trên Mainboard', 'Tháo ốc vặn gá PCI khe sau case', 'Rút card thẳng ra']
  },
  ssd: {
    id: 'ssd',
    name: 'Ổ Cứng NVMe M.2 SSD (Kingston NV2 1TB)',
    category: 'SSD',
    color: '#22c55e',
    basePos: [0.35, 0.25, -0.3],
    explodeDir: [1.6, 0.8, -0.8],
    specs: {
      'Chuẩn kết nối': 'PCIe Gen4 x4 NVMe M.2 2280',
      'Tốc độ Đọc/Ghi': '3500 MB/s / 2100 MB/s',
      'Chip Flash': '3D NAND Flash'
    },
    description: 'Ổ cứng lưu trữ hệ điều hành Windows, phần mềm và dữ liệu cá nhân với tốc độ đọc cực nhanh.',
    role: 'Khởi động Win trong 5 giây, load game cấp tốc.',
    disassemblySteps: ['Tháo ốc vặn nhỏ giữ M.2 (hoặc gạt ngàm EZ Latch)', 'Rút thanh M.2 nghiêng góc 30°']
  },
  psu: {
    id: 'psu',
    name: 'Nguồn Máy Tính (Corsair RM850x 850W Gold)',
    category: 'PSU',
    color: '#f59e0b',
    basePos: [0, -0.5, 0],
    explodeDir: [0, -1.8, -0.8],
    specs: {
      'Công suất': '850W Continuous Power',
      'Chứng nhận': '80 PLUS Gold (Hiệu suất 90%)',
      'Dạng dây': 'Full Modular (Dây rời 100%)'
    },
    description: 'Chuyển đổi dòng điện xoay chiều AC 220V thành các dòng điện một chiều DC 12V, 5V, 3.3V cấp cho linh kiện.',
    role: 'Trái tim năng lượng ổn định, bảo vệ quá áp/quá tải cho toàn hệ thống.',
    disassemblySteps: ['Tháo 4 ốc vít đằng sau vỏ case', 'Kéo cục nguồn ra khỏi khoang PSU shroud']
  },
  fans: {
    id: 'fans',
    name: 'Bộ Quạt Tản Nhiệt Case RGB (3x 120mm Fans)',
    category: 'Quạt Case',
    color: '#ec4899',
    basePos: [0.7, 0.2, 1.0],
    explodeDir: [0, 0.5, 2.0],
    specs: {
      'Kích thước': '120mm x 120mm x 25mm',
      'Tốc độ quay': '800 - 1800 RPM (PWM control)',
      'Vòng bi': 'Fluid Dynamic Bearing (FDB)'
    },
    description: 'Hệ thống quạt hút khí mát từ bên ngoài vào và thổi khí nóng ra phía sau case.',
    role: 'Tạo áp suất khí dương/âm lưu thông làm mát đều dàn linh kiện.',
    disassemblySteps: ['Tháo 4 ốc vặn giữ quạt', 'Rút chân cắm quạt 4-pin khỏi Mainboard']
  }
};

/* ================= 3D MESH MODELS ================= */

function GlassMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.glass;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const meshRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={meshRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <planeGeometry args={[2.0, 1.3]} />
        <meshPhysicalMaterial
          color={isSelected ? '#00ffff' : '#88ccff'}
          metalness={0.2}
          roughness={0.05}
          transparent
          opacity={isSelected ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rubber screw mounts at 4 corners */}
      {[[-0.95, 0.6], [0.95, 0.6], [-0.95, -0.6], [0.95, -0.6]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CaseFrameMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.case_frame;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer Chassis */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 1.4, 2.0]} />
        <meshPhysicalMaterial
          color={isSelected ? '#4a5a8c' : '#2a3a5c'}
          metalness={0.7}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>
      {/* Backplate */}
      <mesh position={[0, 0, -0.99]}>
        <planeGeometry args={[2.55, 1.35]} />
        <meshStandardMaterial color="#1a2a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* PSU Shroud Plate */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[2.55, 0.02, 1.95]} />
        <meshStandardMaterial color="#1e2d4a" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function MotherboardMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.motherboard;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* PCB Board */}
      <RoundedBox args={[1.8, 1.1, 0.04]} radius={0.01}>
        <meshPhysicalMaterial color={isSelected ? '#a78bfa' : '#1e3a29'} roughness={0.8} metalness={0.2} />
      </RoundedBox>
      {/* VRM Heatsinks */}
      <mesh position={[-0.4, 0.35, 0.04]}>
        <boxGeometry args={[0.7, 0.2, 0.06]} />
        <meshStandardMaterial color="#334455" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Socket Frame */}
      <mesh position={[0, 0.15, 0.03]}>
        <boxGeometry args={[0.45, 0.45, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* DIMM Slots */}
      {[-0.55, -0.48, -0.41, -0.34].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0.03]}>
          <boxGeometry args={[0.04, 0.65, 0.03]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#111' : '#333'} />
        </mesh>
      ))}
      {/* PCIe x16 Slot */}
      <mesh position={[0.1, -0.15, 0.03]}>
        <boxGeometry args={[1.2, 0.06, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Chipset Heatsink */}
      <mesh position={[0.5, -0.3, 0.04]}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
        <meshStandardMaterial color="#223344" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CPUMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.cpu;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Substrate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.03]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.9} />
      </mesh>
      {/* IHS Heatspreader */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.32, 0.32, 0.02]} />
        <meshPhysicalMaterial
          color={isSelected ? '#00ffcc' : '#d0d0d0'}
          metalness={0.9}
          roughness={0.2}
          emissive={isSelected ? '#00ffcc' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}

function CoolerMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.cooler;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
    if (fanRef.current) fanRef.current.rotation.z += dt * 8;
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Fin Tower */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.45, 0.45, 0.3]} />
        <meshPhysicalMaterial color={isSelected ? '#38bdf8' : '#cbd5e1'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Heatpipes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* RGB Fan */}
      <group ref={fanRef} position={[0, 0, 0.38]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          <meshPhysicalMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function RAMMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.ram;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Stick 1 */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.03, 0.6, 0.06]} />
          <meshPhysicalMaterial color={isSelected ? '#818cf8' : '#222'} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.035, 0.06, 0.065]} />
          <meshPhysicalMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* Stick 2 */}
      <group position={[0.14, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.03, 0.6, 0.06]} />
          <meshPhysicalMaterial color={isSelected ? '#818cf8' : '#222'} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.035, 0.06, 0.065]} />
          <meshPhysicalMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function GPUMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.gpu;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
    if (fanRef.current) fanRef.current.rotation.y += dt * 6;
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Main GPU Shroud */}
      <RoundedBox args={[1.3, 0.35, 0.4]} radius={0.02}>
        <meshPhysicalMaterial color={isSelected ? '#f87171' : '#1e1e2d'} metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Tri Fans */}
      <group ref={fanRef}>
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={i} position={[x, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.02, 12]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))}
      </group>

      {/* RGB Stripe */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.05]} />
        <meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>

      {/* PCIe Gold Fingers */}
      <mesh position={[0, -0.2, -0.15]}>
        <boxGeometry args={[0.9, 0.04, 0.02]} />
        <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function SSDMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.ssd;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <boxGeometry args={[0.4, 0.02, 0.12]} />
        <meshPhysicalMaterial color={isSelected ? '#4ade80' : '#111'} roughness={0.7} />
      </mesh>
      {/* Flash Chips */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.01, 0.09]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

function PSUMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.psu;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <boxGeometry args={[1.0, 0.5, 0.8]} />
        <meshPhysicalMaterial color={isSelected ? '#fbbf24' : '#1a1a1a'} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Fan Grill */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.01, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      {/* Modular Socket connectors */}
      <mesh position={[0.51, 0, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.5]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
}

function FansMesh({ explodeFactor, isSelected, onClick }: { explodeFactor: number; isSelected: boolean; onClick: () => void }) {
  const data = PC_PARTS_DATA.fans;
  const targetX = data.basePos[0] + data.explodeDir[0] * explodeFactor;
  const targetY = data.basePos[1] + data.explodeDir[1] * explodeFactor;
  const targetZ = data.basePos[2] + data.explodeDir[2] * explodeFactor;

  const groupRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
    if (fanRef.current) fanRef.current.rotation.z += dt * 5;
  });

  return (
    <group ref={groupRef} position={data.basePos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {[-0.4, 0, 0.4].map((y, i) => (
        <group key={i} position={[0, y, 0]} ref={i === 1 ? fanRef : null}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshPhysicalMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Main Canvas Scene component */
function Scene3D({
  explodeFactor,
  selectedId,
  onSelectComponent
}: {
  explodeFactor: number;
  selectedId: string | null;
  onSelectComponent: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 7]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.6} color="#93c5fd" />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#00ffcc" />

      {/* PC Component Meshes */}
      <GlassMesh explodeFactor={explodeFactor} isSelected={selectedId === 'glass'} onClick={() => onSelectComponent('glass')} />
      <CaseFrameMesh explodeFactor={explodeFactor} isSelected={selectedId === 'case_frame'} onClick={() => onSelectComponent('case_frame')} />
      <MotherboardMesh explodeFactor={explodeFactor} isSelected={selectedId === 'motherboard'} onClick={() => onSelectComponent('motherboard')} />
      <CPUMesh explodeFactor={explodeFactor} isSelected={selectedId === 'cpu'} onClick={() => onSelectComponent('cpu')} />
      <CoolerMesh explodeFactor={explodeFactor} isSelected={selectedId === 'cooler'} onClick={() => onSelectComponent('cooler')} />
      <RAMMesh explodeFactor={explodeFactor} isSelected={selectedId === 'ram'} onClick={() => onSelectComponent('ram')} />
      <GPUMesh explodeFactor={explodeFactor} isSelected={selectedId === 'gpu'} onClick={() => onSelectComponent('gpu')} />
      <SSDMesh explodeFactor={explodeFactor} isSelected={selectedId === 'ssd'} onClick={() => onSelectComponent('ssd')} />
      <PSUMesh explodeFactor={explodeFactor} isSelected={selectedId === 'psu'} onClick={() => onSelectComponent('psu')} />
      <FansMesh explodeFactor={explodeFactor} isSelected={selectedId === 'fans'} onClick={() => onSelectComponent('fans')} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={1.8}
        maxDistance={8.0}
        makeDefault
      />
    </>
  );
}

/* Single Component Inspector View (360 Isolation) */
function ComponentInspectorCanvas({ componentId }: { componentId: string }) {
  const data = PC_PARTS_DATA[componentId];
  if (!data) return null;

  return (
    <Canvas camera={{ position: [0, 0.5, 2.5], fov: 45 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.8} />
      <pointLight position={[0, 0, 0]} intensity={1} color={data.color} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {componentId === 'cpu' && <CPUMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'gpu' && <GPUMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'ram' && <RAMMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'motherboard' && <MotherboardMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'cooler' && <CoolerMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'ssd' && <SSDMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'psu' && <PSUMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'fans' && <FansMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'glass' && <GlassMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
        {componentId === 'case_frame' && <CaseFrameMesh explodeFactor={0} isSelected={true} onClick={() => {}} />}
      </Float>
      <OrbitControls autoRotate autoRotateSpeed={3} makeDefault />
    </Canvas>
  );
}

export default function PCExplodedViewer() {
  const [explodeFactor, setExplodeFactor] = useState(0.6); // default partially exploded
  const [autoPulse, setAutoPulse] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>('gpu');
  const [inspectorMode, setInspectorMode] = useState(false);

  // Handle auto pulse explosion
  useEffect(() => {
    if (!autoPulse) return;
    let forward = true;
    const interval = setInterval(() => {
      setExplodeFactor((prev) => {
        if (prev >= 0.95) forward = false;
        if (prev <= 0.05) forward = true;
        return forward ? prev + 0.02 : prev - 0.02;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [autoPulse]);

  const activePart = selectedId ? PC_PARTS_DATA[selectedId] : null;

  return (
    <div className="w-full h-full min-h-screen bg-[#090d16] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              BÓC TÁCH LINH KIỆN 3D INTERACTIVE
            </h1>
            <p className="text-xs text-slate-400">
              Kéo thả thanh trượt để tự do phân tách & khám phá chi tiết linh kiện máy tính
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPulse(!autoPulse)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              autoPulse
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {autoPulse ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoPulse ? 'Tạm Dừng Tự Động' : 'Bóc Tách Tự Động'}
          </button>

          <button
            onClick={() => { setExplodeFactor(0); setSelectedId(null); setInspectorMode(false); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Lắp Ráp Lại
          </button>
        </div>
      </header>

      {/* Main 3D Stage */}
      <div className="flex-1 w-full h-full relative">
        <Canvas camera={{ position: [3.2, 2.2, 4.2], fov: 48 }}>
          <Suspense fallback={null}>
            <Scene3D
              explodeFactor={explodeFactor}
              selectedId={selectedId}
              onSelectComponent={(id) => setSelectedId(id)}
            />
          </Suspense>
        </Canvas>

        {/* Floating Explode Slider Controller */}
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 w-80 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Mức Độ Bóc Tách 3D
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {Math.round(explodeFactor * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeFactor}
            onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
            <span>0% (Lắp ghép hoàn chỉnh)</span>
            <span>100% (Bóc tách tối đa)</span>
          </div>
        </div>

        {/* Quick Component Selector Pills */}
        <div className="absolute top-20 left-6 z-20 flex flex-wrap gap-1.5 max-w-sm">
          {Object.values(PC_PARTS_DATA).map((part) => {
            const isSel = selectedId === part.id;
            return (
              <button
                key={part.id}
                onClick={() => setSelectedId(part.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSel
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: part.color }} />
                {part.category}
              </button>
            );
          })}
        </div>

        {/* Right Info Drawer (Selected Component Specs & Disassembly Guide) */}
        <AnimatePresence>
          {activePart && (
            <motion.aside
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-20 right-6 bottom-6 w-96 z-20 bg-slate-900/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              <div className="overflow-y-auto pr-1 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {activePart.category}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1.5 leading-snug">
                      {activePart.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Description */}
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <h3 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" /> Vị Trí & Vai Trò:
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePart.description}
                  </p>
                </div>

                {/* Specs Table */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Thông Số Kỹ Thuật Chi Tiết
                  </h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(activePart.specs).map(([key, val]) => (
                      <div key={key} className="bg-slate-950/60 rounded-lg p-2 flex justify-between items-center text-xs">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-semibold text-emerald-400 font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disassembly Steps */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Quy Trình Bóc Tách Linh Kiện
                  </h3>
                  <div className="space-y-1.5">
                    {activePart.disassemblySteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs bg-slate-950/40 p-2 rounded-lg text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800 mt-2">
                <button
                  onClick={() => setInspectorMode(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <RotateCw className="w-4 h-4" /> Soi 3D Cận Cảnh 360° Linh Kiện Này
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* 360 Fullscreen Inspector Modal */}
      <AnimatePresence>
        {inspectorMode && selectedId && activePart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInspectorMode(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-white">{activePart.name}</h2>
                  <p className="text-xs text-slate-400">Chế độ xoay soi 360° linh kiện bóc tách riêng lẻ</p>
                </div>
              </div>
              <button
                onClick={() => setInspectorMode(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Quay lại sơ đồ tổng thể
              </button>
            </div>

            <div className="flex-1 w-full relative">
              <ComponentInspectorCanvas componentId={selectedId} />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 text-xs text-slate-400 font-mono flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                Nhấp & giữ chuột trái để xoay linh kiện tự do
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
