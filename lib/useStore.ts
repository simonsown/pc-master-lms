'use client';

import { create } from 'zustand';

export type ComponentType = 'cpu' | 'cooler' | 'ram' | 'gpu' | 'psu' | 'ssd' | 'motherboard';

export interface ComponentSlot {
  id: string;
  type: ComponentType;
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  dependsOn?: ComponentType[];
  locked: boolean;
}

export interface AssemblyComponent {
  id: string;
  slotId: string;
  type: ComponentType;
  name: string;
  installed: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CameraCoords {
  pitch: number;
  yaw: number;
  roll: number;
}

export type BootStatus = 'idle' | 'booting' | 'success' | 'failed';

export interface BootError {
  code: string;
  message: string;
  component: ComponentType;
}

export interface AssemblyState {
  components: AssemblyComponent[];
  slots: ComponentSlot[];
  cameraCoords: CameraCoords;
  bootStatus: BootStatus;
  bootErrors: BootError[];
  hoveredComponent: string | null;
  draggedComponent: string | null;
  rgbActive: boolean;
  fanSpeed: number;
}

interface StoreActions {
  setCameraCoords: (coords: Partial<CameraCoords>) => void;
  installComponent: (slotId: string, componentId: string) => boolean;
  removeComponent: (slotId: string) => void;
  setHoveredComponent: (id: string | null) => void;
  setDraggedComponent: (id: string | null) => void;
  triggerBootCheck: () => void;
  resetBoot: () => void;
  resetAssembly: () => void;
  setRgbActive: (active: boolean) => void;
  setFanSpeed: (speed: number) => void;
  checkDependencies: (slotId: string) => { ok: boolean; missing: ComponentType[] };
  getInstalledParts: () => AssemblyComponent[];
  isSlotAvailable: (slotId: string) => boolean;
}

const DEFAULT_SLOTS: ComponentSlot[] = [
  {
    id: 'motherboard_1',
    type: 'motherboard',
    label: 'Mainboard',
    position: [0, 0.02, 0],
    rotation: [0, 0, 0],
    size: [2.4, 0.02, 2.0],
    dependsOn: [],
    locked: false,
  },
  {
    id: 'cpu_1',
    type: 'cpu',
    label: 'CPU',
    position: [0, 0.12, 0.25],
    rotation: [0, 0, 0],
    size: [0.6, 0.06, 0.6],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'cooler_1',
    type: 'cooler',
    label: 'CPU Cooler',
    position: [0, 0.25, 0.25],
    rotation: [0, 0, 0],
    size: [0.7, 0.15, 0.7],
    dependsOn: ['cpu'],
    locked: true,
  },
  {
    id: 'ram_1',
    type: 'ram',
    label: 'RAM Slot A1',
    position: [-0.55, 0.08, 0.45],
    rotation: [0, 0, 0],
    size: [0.08, 0.4, 0.02],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'ram_2',
    type: 'ram',
    label: 'RAM Slot A2',
    position: [-0.42, 0.08, 0.45],
    rotation: [0, 0, 0],
    size: [0.08, 0.4, 0.02],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'ram_3',
    type: 'ram',
    label: 'RAM Slot B1',
    position: [0.42, 0.08, 0.45],
    rotation: [0, 0, 0],
    size: [0.08, 0.4, 0.02],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'ram_4',
    type: 'ram',
    label: 'RAM Slot B2',
    position: [0.55, 0.08, 0.45],
    rotation: [0, 0, 0],
    size: [0.08, 0.4, 0.02],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'gpu_1',
    type: 'gpu',
    label: 'GPU (PCIe x16)',
    position: [0, 0.06, -0.5],
    rotation: [0, 0, 0],
    size: [1.6, 0.15, 0.6],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'psu_1',
    type: 'psu',
    label: 'Power Supply',
    position: [0, -0.2, 1.2],
    rotation: [0, 0, 0],
    size: [1.2, 0.4, 0.7],
    dependsOn: ['motherboard'],
    locked: true,
  },
  {
    id: 'ssd_1',
    type: 'ssd',
    label: 'M.2 NVMe SSD',
    position: [0.35, 0.06, -0.15],
    rotation: [0, 0, 0],
    size: [0.8, 0.02, 0.2],
    dependsOn: ['motherboard'],
    locked: true,
  },
];

const INITIAL_COMPONENTS: AssemblyComponent[] = DEFAULT_SLOTS.map((slot) => ({
  id: `comp_${slot.id}`,
  slotId: slot.id,
  type: slot.type,
  name: slot.label,
  installed: false,
  position: [...slot.position] as [number, number, number],
  rotation: [...slot.rotation] as [number, number, number],
}));

export const useAssemblyStore = create<AssemblyState & StoreActions>((set, get) => ({
  components: INITIAL_COMPONENTS,
  slots: DEFAULT_SLOTS,
  cameraCoords: { pitch: 0, yaw: 0, roll: 0 },
  bootStatus: 'idle',
  bootErrors: [],
  hoveredComponent: null,
  draggedComponent: null,
  rgbActive: false,
  fanSpeed: 0,

  setCameraCoords: (coords) =>
    set((state) => ({
      cameraCoords: { ...state.cameraCoords, ...coords },
    })),

  checkDependencies: (slotId) => {
    const state = get();
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot || !slot.dependsOn || slot.dependsOn.length === 0) {
      return { ok: true, missing: [] };
    }
    const installed = state.components.filter((c) => c.installed);
    const missing = slot.dependsOn.filter(
      (depType) => !installed.some((c) => c.type === depType)
    );
    return { ok: missing.length === 0, missing };
  },

  installComponent: (slotId, componentId) => {
    const state = get();
    const depCheck = state.checkDependencies(slotId);
    if (!depCheck.ok) return false;

    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot || slot.locked) return false;

    const existing = state.components.find(
      (c) => c.slotId === slotId && c.installed
    );
    if (existing) return false;

    set((state) => ({
      components: state.components.map((c) =>
        c.id === componentId
          ? { ...c, installed: true, position: [...slot.position] as [number, number, number] }
          : c
      ),
    }));
    return true;
  },

  removeComponent: (slotId) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.slotId === slotId && c.installed
          ? { ...c, installed: false }
          : c
      ),
    })),

  setHoveredComponent: (id) => set({ hoveredComponent: id }),
  setDraggedComponent: (id) => set({ draggedComponent: id }),

  triggerBootCheck: () => {
    const state = get();
    const installed = state.components.filter((c) => c.installed);
    const errors: BootError[] = [];

    if (!installed.some((c) => c.type === 'cpu')) {
      errors.push({
        code: '0x01',
        message: 'CPU not detected in socket',
        component: 'cpu',
      });
    }
    if (!installed.some((c) => c.type === 'cooler')) {
      errors.push({
        code: '0x02',
        message: 'CPU Cooler missing — thermal shutdown risk',
        component: 'cooler',
      });
    }
    if (!installed.some((c) => c.type === 'ram')) {
      errors.push({
        code: '0x03',
        message: 'No RAM modules detected in any DIMM slot',
        component: 'ram',
      });
    }
    const ramCount = installed.filter((c) => c.type === 'ram').length;
    if (ramCount > 0 && ramCount < 2) {
      errors.push({
        code: '0x04',
        message: `Only ${ramCount} RAM module(s) installed — single-channel mode`,
        component: 'ram',
      });
    }
    if (!installed.some((c) => c.type === 'gpu')) {
      errors.push({
        code: '0x05',
        message: 'No GPU detected — no display output available',
        component: 'gpu',
      });
    }
    if (!installed.some((c) => c.type === 'psu')) {
      errors.push({
        code: '0x06',
        message: 'Power Supply Unit not connected',
        component: 'psu',
      });
    }
    if (!installed.some((c) => c.type === 'ssd')) {
      errors.push({
        code: '0x07',
        message: 'No boot drive detected (M.2 SSD missing)',
        component: 'ssd',
      });
    }

    if (errors.length > 0) {
      set({ bootStatus: 'booting' });
      setTimeout(() => {
        set({ bootStatus: 'failed', bootErrors: errors, rgbActive: false, fanSpeed: 0 });
      }, 1500);
    } else {
      set({ bootStatus: 'booting' });
      setTimeout(() => {
        set({
          bootStatus: 'success',
          bootErrors: [],
          rgbActive: true,
          fanSpeed: 1,
        });
      }, 2000);
    }
  },

  resetBoot: () =>
    set({
      bootStatus: 'idle',
      bootErrors: [],
      rgbActive: false,
      fanSpeed: 0,
    }),

  resetAssembly: () =>
    set({
      components: INITIAL_COMPONENTS.map((c) => ({ ...c })),
      bootStatus: 'idle',
      bootErrors: [],
      rgbActive: false,
      fanSpeed: 0,
    }),

  setRgbActive: (active) => set({ rgbActive: active }),
  setFanSpeed: (speed) => set({ fanSpeed: speed }),

  getInstalledParts: () => get().components.filter((c) => c.installed),

  isSlotAvailable: (slotId) => {
    const state = get();
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot || slot.locked) return false;
    return !state.components.some((c) => c.slotId === slotId && c.installed);
  },
}));
