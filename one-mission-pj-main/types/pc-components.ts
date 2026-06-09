export type ComponentCategory =
  | 'CPU' | 'GPU' | 'MAINBOARD' | 'RAM' | 'PSU' | 'CASE' | 'COOLER' | 'SSD' | 'HDD';

export type SocketType =
  | 'LGA1700' | 'LGA1851' | 'LGA1200' | 'LGA1151'
  | 'AM5' | 'AM4' | 'sTR5' | 'sTRX4';

export type FormFactor = 'ATX' | 'mATX' | 'ITX' | 'eATX' | 'Mini-ITX' | 'XL-ATX';
export type DDRType = 'DDR4' | 'DDR5';
export type PCIeGen = '3.0' | '4.0' | '5.0';
export type PSUEfficiency =
  | '80plus_white' | '80plus_bronze' | '80plus_silver'
  | '80plus_gold' | '80plus_platinum' | '80plus_titanium';
export type PSUSubModular = 'non_modular' | 'semi_modular' | 'full_modular';
export type CoolerType = 'air' | 'aio' | 'custom_loop';
export type StorageInterface = 'm2_nvme' | 'm2_sata' | 'sata_ssd' | 'sata_hdd';
export type Severity = 'error' | 'warning' | 'info' | 'success';

interface BaseProduct {
  id: string;
  category: ComponentCategory;
  brand: string;
  model: string;
  full_name: string;
  price_vnd: number;
  image_url?: string;
  image_angles?: string[];
  video_url?: string;
  release_year?: number;
}

export interface CPUProduct extends BaseProduct {
  category: 'CPU';
  cpu_socket: SocketType;
  cpu_tdp_watts: number;
  cpu_cores: number;
  cpu_threads: number;
  cpu_base_ghz: number;
  cpu_boost_ghz: number;
  cpu_l3_cache_mb: number;
  cpu_has_igpu: boolean;
  cpu_igpu_model?: string;
  cpu_ram_type: DDRType;
  cpu_max_ram_mhz: number;
  cpu_generation: string;
  cpu_cinebench_r23_single?: number;
  cpu_cinebench_r23_multi?: number;
}

export interface GPUProduct extends BaseProduct {
  category: 'GPU';
  gpu_vram_gb: number;
  gpu_tdp_watts: number;
  gpu_pcie_gen: PCIeGen;
  gpu_length_mm: number;
  gpu_width_mm?: number;
  gpu_height_mm?: number;
  gpu_power_connectors: { type: string; qty: number }[];
  gpu_benchmark_1080p?: number;
  gpu_display_outputs: string[];
  gpu_recommended_psu: number;
}

export interface MainboardProduct extends BaseProduct {
  category: 'MAINBOARD';
  mb_socket: SocketType;
  mb_chipset: string;
  mb_form_factor: FormFactor;
  mb_ram_slots: number;
  mb_max_ram_gb: number;
  mb_ram_type: DDRType;
  mb_max_ram_mhz: number;
  mb_m2_slots: number;
  mb_m2_pcie_gens: PCIeGen[];
  mb_pcie_x16_slots: number;
  mb_pcie_x16_gens: PCIeGen[];
  mb_sata_ports: number;
  mb_has_wifi: boolean;
  mb_wifi_version?: string;
  mb_usb_ports: { type: string; qty: number }[];
  mb_front_panel_headers: { type: string; pin: number }[];
}

export interface PSUProduct extends BaseProduct {
  category: 'PSU';
  psu_wattage: number;
  psu_efficiency: PSUEfficiency;
  psu_modular: PSUSubModular;
  psu_connectors: { type: string; qty: number }[];
  psu_has_12vhpwr: boolean;
  psu_length_mm: number;
  psu_fan_size_mm?: number;
}

export interface CaseProduct extends BaseProduct {
  category: 'CASE';
  case_supported_forms: FormFactor[];
  case_max_gpu_length_mm: number;
  case_max_cooler_height_mm: number;
  case_max_psu_length_mm: number;
  case_drive_bays: { type: string; qty: number }[];
  case_fan_slots: { size: number; qty: number; type: string }[];
  case_supports_aio: number[];
  case_mesh_front: boolean;
  case_has_cable_management: boolean;
  case_side_panel: string;
  case_weight_kg?: number;
}

export interface CoolerProduct extends BaseProduct {
  category: 'COOLER';
  cooler_max_tdp_support: number;
  cooler_height_mm: number;
  cooler_supported_sockets: SocketType[];
  cooler_type: CoolerType;
  cooler_aio_size_mm?: number;
  cooler_fan_rpm_max?: number;
  cooler_fan_noise_dba?: number;
  cooler_fan_qty?: number;
  cooler_has_rgb: boolean;
}

export interface RAMProduct extends BaseProduct {
  category: 'RAM';
  ram_ddr_type: DDRType;
  ram_speed_mhz: number;
  ram_cl_latency: number;
  ram_capacity_gb: number;
  ram_kit_count: number;
  ram_has_xmp: boolean;
  ram_has_expo: boolean;
  ram_voltage_v?: number;
  ram_height_mm?: number;
}

export interface SSDProduct extends BaseProduct {
  category: 'SSD';
  ssd_interface: StorageInterface;
  ssd_pcie_gen?: PCIeGen;
  ssd_read_mbps: number;
  ssd_write_mbps: number;
  ssd_has_dram_cache: boolean;
  ssd_capacity_gb: number;
  ssd_form_factor: string;
  ssd_nand_type?: string;
  ssd_tbw?: number;
  ssd_max_seq_read?: number;
  ssd_max_seq_write?: number;
  ssd_max_rand_read?: number;
  ssd_max_rand_write?: number;
}

export type AnyProduct =
  | CPUProduct | GPUProduct | MainboardProduct | PSUProduct
  | CaseProduct | CoolerProduct | RAMProduct | SSDProduct;

export type CompatibilityIssueType =
  | 'socket_mismatch'
  | 'ram_type_mismatch'
  | 'gpu_too_long'
  | 'psu_insufficient'
  | 'cooler_insufficient'
  | 'cooler_too_tall'
  | 'cooler_socket_mismatch'
  | 'form_factor_mismatch'
  | 'no_display_output'
  | 'too_many_ram'
  | 'not_enough_m2_slots'
  | 'bottleneck'
  | 'budget_exceeded'
  | 'success';

export interface CompatibilityIssue {
  severity: Severity;
  check_type: CompatibilityIssueType;
  message: string;
  fix: string;
}

export interface Build {
  id?: string;
  name: string;
  cpu: CPUProduct | null;
  gpu: GPUProduct | null;
  mainboard: MainboardProduct | null;
  ram: RAMProduct[];
  psu: PSUProduct | null;
  case: CaseProduct | null;
  cooler: CoolerProduct | null;
  ssd: SSDProduct[];
  hdd?: SSDProduct[];
  total_price: number;
  total_tdp: number;
  compatibility_score: number;
  compatibility_issues: CompatibilityIssue[];
  created_at?: string;
}

export interface BuildScenario {
  id: string;
  name: string;
  name_vn: string;
  description: string;
  description_vn: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  budget_min: number;
  budget_max: number;
  requirements: {
    min_cores?: number;
    min_gpu_power?: number;
    min_ram_gb?: number;
    min_storage_gb?: number;
    require_igpu?: boolean;
    use_case?: string;
    min_cinebench_multi?: number;
    max_tdp?: number;
  };
  weight_components: {
    cpu: number;
    gpu: number;
    ram: number;
    storage: number;
    psu: number;
  };
}
