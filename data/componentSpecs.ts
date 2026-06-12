export interface ComponentDimension {
  width_mm: number;
  height_mm: number;
  depth_mm: number;
}

export interface ComponentColor {
  pcb: string;
  heatsink?: string;
  shroud?: string;
  led?: string;
  connector: string;
  accent?: string;
}

export interface ComponentRenderSpec {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'psu' | 'case' | 'cooler' | 'ssd' | 'hdd';
  brand: string;
  model: string;
  dimensions: ComponentDimension;
  colors: ComponentColor;
  connectors: {
    id: string;
    label: string;
    type: string;
    position: { x: number; y: number };
    facing: 'top' | 'bottom' | 'left' | 'right';
    color: string;
  }[];
  imageTop?: string;
  imageSide?: string;
  techSpecs: Record<string, string | number>;
}

export const COMPONENT_SPECS: ComponentRenderSpec[] = [
  {
    id: 'intel-i5-13600k',
    name: 'Intel Core i5-13600K',
    type: 'cpu',
    brand: 'Intel',
    model: 'Core i5-13600K',
    dimensions: { width_mm: 37.5, height_mm: 37.5, depth_mm: 4.5 },
    colors: {
      pcb: '#1a472a',
      heatsink: '#c0c0c0',
      connector: '#d4af37',
      accent: '#0071c5',
    },
    connectors: [
      { id: 'lga1700', label: 'LGA1700 Socket', type: 'cpu_socket',
        position: { x: 50, y: 50 }, facing: 'bottom', color: '#d4af37' }
    ],
    techSpecs: { socket: 'LGA1700', tdp: 125, cores: 14, threads: 20 }
  },
  {
    id: 'amd-ryzen5-7600x',
    name: 'AMD Ryzen 5 7600X',
    type: 'cpu',
    brand: 'AMD',
    model: 'Ryzen 5 7600X',
    dimensions: { width_mm: 40, height_mm: 40, depth_mm: 4.7 },
    colors: {
      pcb: '#1a2744',
      heatsink: '#a8a8a8',
      connector: '#b8860b',
      accent: '#ed1c24',
    },
    connectors: [
      { id: 'am5', label: 'AM5 Socket', type: 'cpu_socket',
        position: { x: 50, y: 50 }, facing: 'bottom', color: '#b8860b' }
    ],
    techSpecs: { socket: 'AM5', tdp: 105, cores: 6, threads: 12 }
  },
  {
    id: 'rtx-4060',
    name: 'NVIDIA RTX 4060',
    type: 'gpu',
    brand: 'NVIDIA',
    model: 'RTX 4060 (ASUS DUAL)',
    dimensions: { width_mm: 200, height_mm: 120, depth_mm: 40 },
    colors: {
      pcb: '#1a1a2e',
      heatsink: '#2d2d2d',
      shroud: '#ffffff',
      connector: '#000000',
      accent: '#76b900',
      led: '#76b900',
    },
    connectors: [
      { id: 'pcie-x16', label: 'PCIe x16', type: 'pcie_x16',
        position: { x: 90, y: 85 }, facing: 'bottom', color: '#ffcc00' },
      { id: 'pwr-8pin', label: '8-pin Power', type: 'pcie_power',
        position: { x: 15, y: 5 }, facing: 'top', color: '#ff6600' },
      { id: 'dp1', label: 'DisplayPort 1', type: 'display',
        position: { x: 8, y: 75 }, facing: 'left', color: '#00aaff' },
      { id: 'dp2', label: 'DisplayPort 2', type: 'display',
        position: { x: 18, y: 75 }, facing: 'left', color: '#00aaff' },
      { id: 'hdmi', label: 'HDMI 2.1', type: 'display',
        position: { x: 28, y: 75 }, facing: 'left', color: '#00aa44' },
    ],
    techSpecs: { vram_gb: 8, tdp: 115, pcie_gen: 4, length_mm: 200 }
  },
  {
    id: 'rx-7600',
    name: 'AMD Radeon RX 7600',
    type: 'gpu',
    brand: 'AMD',
    model: 'RX 7600 (Sapphire PULSE)',
    dimensions: { width_mm: 190, height_mm: 115, depth_mm: 38 },
    colors: {
      pcb: '#0d1117',
      heatsink: '#3d3d3d',
      shroud: '#1a1a1a',
      connector: '#000000',
      accent: '#ed1c24',
      led: '#ed1c24',
    },
    connectors: [
      { id: 'pcie-x16', label: 'PCIe x16', type: 'pcie_x16',
        position: { x: 90, y: 85 }, facing: 'bottom', color: '#ffcc00' },
      { id: 'pwr-8pin', label: '8-pin Power', type: 'pcie_power',
        position: { x: 20, y: 5 }, facing: 'top', color: '#ff6600' },
    ],
    techSpecs: { vram_gb: 8, tdp: 165, pcie_gen: 4, length_mm: 190 }
  },
  {
    id: 'asus-b760m-atx',
    name: 'ASUS PRIME B760M-A',
    type: 'motherboard',
    brand: 'ASUS',
    model: 'PRIME B760M-A',
    dimensions: { width_mm: 244, height_mm: 244, depth_mm: 25 },
    colors: {
      pcb: '#1c2a1c',
      heatsink: '#c0c0c0',
      connector: '#ffcc00',
      accent: '#ffd700',
    },
    connectors: [
      { id: 'cpu-socket', label: 'LGA1700 CPU Socket', type: 'cpu_socket',
        position: { x: 35, y: 25 }, facing: 'top', color: '#d4af37' },
      { id: 'dimm-a1', label: 'DIMM A1 (DDR5)', type: 'ram_slot',
        position: { x: 65, y: 20 }, facing: 'top', color: '#4a90d9' },
      { id: 'dimm-b1', label: 'DIMM B1 (DDR5)', type: 'ram_slot',
        position: { x: 72, y: 20 }, facing: 'top', color: '#4a90d9' },
      { id: 'pcie-x16-1', label: 'PCIe x16 Slot 1', type: 'pcie_x16',
        position: { x: 40, y: 58 }, facing: 'top', color: '#ff6b00' },
      { id: 'm2-1', label: 'M.2_1 (PCIe 4.0)', type: 'm2',
        position: { x: 50, y: 45 }, facing: 'top', color: '#00cc44' },
      { id: 'atx-24pin', label: '24-pin ATX Power', type: 'atx_power',
        position: { x: 88, y: 35 }, facing: 'right', color: '#ff4400' },
      { id: 'cpu-8pin', label: '8-pin CPU EPS', type: 'cpu_power',
        position: { x: 20, y: 5 }, facing: 'top', color: '#ff8800' },
    ],
    techSpecs: { socket: 'LGA1700', chipset: 'B760', form_factor: 'mATX', ram_slots: 2, max_ram_gb: 64, ram_type: 'DDR5', m2_slots: 2 }
  },
  {
    id: 'kingston-fury-16gb-ddr5',
    name: 'Kingston FURY Beast 16GB DDR5',
    type: 'ram',
    brand: 'Kingston',
    model: 'FURY Beast DDR5-5200',
    dimensions: { width_mm: 133, height_mm: 35, depth_mm: 8 },
    colors: {
      pcb: '#1a1a1a',
      heatsink: '#2c2c2c',
      connector: '#d4af37',
      accent: '#ff6600',
    },
    connectors: [
      { id: 'dimm-edge', label: 'DIMM Edge Connector', type: 'dimm',
        position: { x: 50, y: 98 }, facing: 'bottom', color: '#d4af37' }
    ],
    techSpecs: { type: 'DDR5', speed_mhz: 5200, capacity_gb: 16, cl: 40 }
  },
  {
    id: 'corsair-rm750x',
    name: 'Corsair RM750x 750W',
    type: 'psu',
    brand: 'Corsair',
    model: 'RM750x 80+ Gold',
    dimensions: { width_mm: 150, height_mm: 86, depth_mm: 160 },
    colors: {
      pcb: '#1a1a1a',
      heatsink: '#000000',
      connector: '#ff4400',
      accent: '#ffff00',
    },
    connectors: [
      { id: 'atx-24pin-out', label: '24-pin ATX Output', type: 'atx_power',
        position: { x: 20, y: 50 }, facing: 'right', color: '#ff4400' },
      { id: 'eps-8pin-out', label: '8-pin EPS CPU Output', type: 'cpu_power',
        position: { x: 35, y: 50 }, facing: 'right', color: '#ff8800' },
      { id: 'pcie-6p2-out', label: 'PCIe 6+2 Pin', type: 'pcie_power',
        position: { x: 50, y: 50 }, facing: 'right', color: '#ff6600' },
    ],
    techSpecs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', pcie_connectors: 4, sata_connectors: 6 }
  },
  {
    id: 'samsung-980-pro-1tb',
    name: 'Samsung 980 PRO 1TB',
    type: 'ssd',
    brand: 'Samsung',
    model: '980 PRO NVMe M.2',
    dimensions: { width_mm: 80, height_mm: 22, depth_mm: 3.5 },
    colors: {
      pcb: '#1a1a2e',
      heatsink: '#c0c0c0',
      connector: '#d4af37',
      accent: '#1428a0',
    },
    connectors: [
      { id: 'm2-key-m', label: 'M.2 Key-M Connector', type: 'm2',
        position: { x: 92, y: 50 }, facing: 'right', color: '#d4af37' }
    ],
    techSpecs: { interface: 'M.2 NVMe', pcie_gen: 4, read_mbps: 7000, write_mbps: 5100, capacity_gb: 1000 }
  },
];

export const MM_TO_PX = 2.5;
export const MM_TO_3D = 0.01;
