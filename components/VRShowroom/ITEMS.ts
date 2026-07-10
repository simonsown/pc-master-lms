import type { Group } from 'three';

export interface ShowroomItem {
  id: string;
  file: string;
  name: string;
  desc: string;
  color: string;
  pos: [number, number, number];
  category: string;
}

export const ITEMS: ShowroomItem[] = [
  { id: 'ryzen', file: '/models/amd_ryzen_7_5700x3d.glb', name: 'AMD Ryzen 7 5700X3D', desc: 'CPU 8 nhân/16 luồng | 3.0GHz | 100MB Cache', color: '#ff4444', pos: [-6, 0, -5], category: 'CPU' },
  { id: 'gpu', file: '/models/asus_rog_geforce_rtx_4090_v2.0.glb', name: 'ASUS ROG RTX 4090', desc: 'VGA 24GB GDDR6X | 2520 MHz | RGB', color: '#ff8800', pos: [6, 0, -5], category: 'GPU' },
  { id: 'ram', file: '/models/corsair_dominator_rgb_ram.glb', name: 'Corsair Dominator RGB', desc: 'RAM 2x16GB DDR5 | 6000MHz | RGB', color: '#818cf8', pos: [-6, 0, 0], category: 'RAM' },
  { id: 'mb', file: '/models/msi_b550_gaming_plus.glb', name: 'MSI B550 Gaming Plus', desc: 'Mainboard AM4 | DDR4 | PCIe 4.0 | Wi-Fi', color: '#22c55e', pos: [6, 0, 0], category: 'MAINBOARD' },
  { id: 'xpg', file: '/models/xpg_d41_dual_kit_ram.glb', name: 'XPG D41 Dual Kit', desc: 'RAM 2x8GB DDR4 | 3200MHz | Heatsink đỏ', color: '#6366f1', pos: [-6, 0, 5], category: 'RAM' },
  { id: 'mb2', file: '/models/motherboards.glb', name: 'Motherboard (Kit)', desc: 'PCB đa lớp | VRM 12 pha', color: '#16a34a', pos: [6, 0, 5], category: 'MAINBOARD' },
  { id: 'pc', file: '/models/gaming_desktop_pc_blend_file.glb', name: 'Gaming Desktop PC', desc: 'Case ATX | Side panel kính | LED RGB', color: '#a855f7', pos: [-3, 0, -9], category: 'CASE' },
  { id: 'retro', file: '/models/retrofuturistic_computer.glb', name: 'Retro Futuristic PC', desc: 'Phong cách Retro | CRT + LED Neon', color: '#f59e0b', pos: [3, 0, -9], category: 'CASE' },
  { id: 'kit', file: '/models/computer_components.glb', name: 'PC Components Kit', desc: 'Bộ linh kiện máy tính đầy đủ', color: '#06b6d4', pos: [0, 0, 8], category: 'KIT' },
];

export const ITEMS_BY_ID = new Map(ITEMS.map(i => [i.id, i]));
