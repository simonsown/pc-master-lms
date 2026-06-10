import {
  type AnyProduct,
  type CPUProduct,
  type GPUProduct,
  type MainboardProduct,
  type PSUProduct,
  type CaseProduct,
  type CoolerProduct,
  type RAMProduct,
  type SSDProduct,
  type Build,
  type CompatibilityIssue,
  type CompatibilityIssueType,
  type Severity,
} from '@/types/pc-components';

function issue(
  severity: Severity,
  check_type: CompatibilityIssueType,
  message: string,
  fix: string
): CompatibilityIssue {
  return { severity, check_type, message, fix };
}

export function checkCompatibility(build: {
  cpu: CPUProduct | null;
  gpu: GPUProduct | null;
  mainboard: MainboardProduct | null;
  ram: RAMProduct[];
  psu: PSUProduct | null;
  case: CaseProduct | null;
  cooler: CoolerProduct | null;
  ssd: SSDProduct[];
}): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const { cpu, gpu, mainboard, ram, psu, case: case_, cooler, ssd } = build;

  if (!cpu) return issues;
  if (!mainboard) return issues;

  // 1. Socket check
  if (cpu.cpu_socket !== mainboard.mb_socket) {
    issues.push(issue(
      'error', 'socket_mismatch',
      `CPU socket ${cpu.cpu_socket} không tương thích với Mainboard socket ${mainboard.mb_socket}`,
      `Chọn Mainboard ${cpu.cpu_socket} hoặc CPU ${mainboard.mb_socket}`
    ));
  }

  // 2. RAM type CPU vs Mainboard
  if (cpu.cpu_ram_type !== mainboard.mb_ram_type) {
    issues.push(issue(
      'error', 'ram_type_mismatch',
      `CPU hỗ trợ ${cpu.cpu_ram_type} nhưng Mainboard hỗ trợ ${mainboard.mb_ram_type}`,
      `Chọn CPU ${mainboard.mb_ram_type} hoặc Mainboard ${cpu.cpu_ram_type}`
    ));
  }

  // 3. RAM quantity vs slots
  if (ram.length > mainboard.mb_ram_slots) {
    issues.push(issue(
      'error', 'too_many_ram',
      `Có ${ram.length} thanh RAM nhưng Mainboard chỉ có ${mainboard.mb_ram_slots} slot`,
      `Giảm xuống ${mainboard.mb_ram_slots} thanh hoặc nâng cấp Mainboard`
    ));
  }

  // 4. RAM type match
  if (ram.length > 0 && mainboard) {
    const mismatchedRam = ram.some(r => r.ram_ddr_type !== mainboard.mb_ram_type);
    if (mismatchedRam) {
      issues.push(issue(
        'error', 'ram_type_mismatch',
        `Loại RAM không khớp với Mainboard (yêu cầu ${mainboard.mb_ram_type})`,
        `Chọn RAM ${mainboard.mb_ram_type}`
      ));
    }
  }

  // 5. GPU checks
  if (gpu) {
    let totalTdp = (cpu.cpu_tdp_watts || 0) + (gpu.gpu_tdp_watts || 0);

    // GPU length vs case
    if (case_ && gpu.gpu_length_mm > case_.case_max_gpu_length_mm) {
      issues.push(issue(
        'error', 'gpu_too_long',
        `GPU ${gpu.full_name} (dài ${gpu.gpu_length_mm}mm) quá dài cho Case (hỗ trợ tối đa ${case_.case_max_gpu_length_mm}mm)`,
        `Chọn GPU ngắn hơn ${case_.case_max_gpu_length_mm}mm hoặc Case lớn hơn`
      ));
    }

    // PSU check
    if (psu) {
      const safeWattage = psu.psu_wattage * 0.8;
      if (totalTdp > safeWattage) {
        issues.push(issue(
          'error', 'psu_insufficient',
          `Tổng TDP ${totalTdp}W vượt quá 80% công suất PSU (${safeWattage}W)`,
          `Nâng PSU lên ít nhất ${Math.ceil(totalTdp * 1.25)}W`
        ));
      }

      if (gpu.gpu_recommended_psu > psu.psu_wattage) {
        issues.push(issue(
          'warning', 'psu_insufficient',
          `GPU ${gpu.full_name} khuyến nghị PSU tối thiểu ${gpu.gpu_recommended_psu}W (hiện tại ${psu.psu_wattage}W)`,
          `Nâng PSU lên ${gpu.gpu_recommended_psu}W`
        ));
      }

      // GPU power connectors vs PSU
      for (const conn of gpu.gpu_power_connectors) {
        const psuMatch = psu.psu_connectors.find(
          c => c.type.toLowerCase().includes(conn.type.toLowerCase().replace('pin', '').trim())
        );
        if (!psuMatch || psuMatch.qty < conn.qty) {
          issues.push(issue(
            'warning', 'psu_insufficient',
            `GPU cần ${conn.qty}x ${conn.type} nhưng PSU không đủ`,
            `Chọn PSU có đủ đầu cấp nguồn cho GPU`
          ));
        }
      }
    }

    // No iGPU + No display
    if (!cpu.cpu_has_igpu && !gpu) {
      issues.push(issue(
        'warning', 'no_display_output',
        `CPU ${cpu.full_name} không có iGPU và chưa chọn GPU rời — sẽ không có hình ảnh`,
        'Thêm GPU rời hoặc chọn CPU có iGPU (non-F)'
      ));
    }

    // Bottleneck estimation
    if (gpu.gpu_benchmark_1080p && cpu.cpu_cinebench_r23_multi) {
      const gpuPower = gpu.gpu_benchmark_1080p;
      const cpuPower = cpu.cpu_cinebench_r23_multi;
      if (cpuPower > 0 && gpuPower > 0) {
        const ratio = gpuPower / cpuPower;
        if (ratio > 2.5) {
          issues.push(issue(
            'warning', 'bottleneck',
            `GPU mạnh hơn CPU đáng kể (tỷ lệ ${ratio.toFixed(1)}x) — CPU có thể gây nghẽn cổ chai`,
            'Cân nhắc CPU mạnh hơn hoặc GPU thấp hơn'
          ));
        } else if (ratio < 0.4) {
          issues.push(issue(
            'warning', 'bottleneck',
            `CPU quá mạnh so với GPU (tỷ lệ ${ratio.toFixed(1)}x) — GPU yếu kéo hiệu năng gaming xuống`,
            'Cân nhắc GPU mạnh hơn hoặc CPU thấp hơn'
          ));
        }
      }
    }
  } else if (!cpu.cpu_has_igpu) {
    issues.push(issue(
      'warning', 'no_display_output',
      `CPU ${cpu.full_name} không có iGPU và chưa chọn GPU rời`,
      'Thêm GPU rời hoặc chọn CPU có iGPU (non-F)'
    ));
  }

  // 6. Cooler checks
  if (cooler) {
    if (cooler.cooler_max_tdp_support < (cpu.cpu_tdp_watts || 0) * 0.9) {
      issues.push(issue(
        'warning', 'cooler_insufficient',
        `CPU TDP ${cpu.cpu_tdp_watts}W gần chạm giới hạn tản nhiệt của Cooler (${cooler.cooler_max_tdp_support}W)`,
        'Cân nhắc nâng cấp cooler (AIO hoặc khí hiệu năng cao)'
      ));
    }

    if (case_ && cooler.cooler_height_mm > case_.case_max_cooler_height_mm) {
      issues.push(issue(
        'error', 'cooler_too_tall',
        `Cooler cao ${cooler.cooler_height_mm}mm quá cao cho Case (chỉ hỗ trợ ${case_.case_max_cooler_height_mm}mm)`,
        `Chọn cooler thấp hơn ${case_.case_max_cooler_height_mm}mm hoặc Case rộng hơn`
      ));
    }

    if (!cooler.cooler_supported_sockets.includes(cpu.cpu_socket)) {
      issues.push(issue(
        'error', 'cooler_socket_mismatch',
        `Cooler không hỗ trợ socket ${cpu.cpu_socket}`,
        `Chọn cooler hỗ trợ socket ${cpu.cpu_socket}`
      ));
    }
  }

  // 7. Form factor check
  if (case_ && mainboard) {
    if (!case_.case_supported_forms.includes(mainboard.mb_form_factor)) {
      issues.push(issue(
        'error', 'form_factor_mismatch',
        `Mainboard ${mainboard.mb_form_factor} không vừa Case (hỗ trợ: ${case_.case_supported_forms.join(', ')})`,
        `Chọn Mainboard ${case_.case_supported_forms[0] || 'ATX'} hoặc Case phù hợp`
      ));
    }
  }

  // 8. SSD M.2 slot count
  const m2Ssds = ssd.filter(s => s.ssd_interface === 'm2_nvme' || s.ssd_interface === 'm2_sata');
  if (m2Ssds.length > (mainboard.mb_m2_slots || 0)) {
    issues.push(issue(
      'warning', 'not_enough_m2_slots',
      `Có ${m2Ssds.length} SSD M.2 nhưng Mainboard chỉ có ${mainboard.mb_m2_slots} slot M.2`,
      `Dùng SSD SATA cho các ổ còn lại hoặc nâng cấp Mainboard`
    ));
  }

  // 9. PSU length vs case
  if (psu && case_ && psu.psu_length_mm > case_.case_max_psu_length_mm) {
    issues.push(issue(
      'error', 'psu_insufficient',
      `PSU dài ${psu.psu_length_mm}mm quá dài cho Case (hỗ trợ tối đa ${case_.case_max_psu_length_mm}mm)`,
      `Chọn PSU ngắn hơn ${case_.case_max_psu_length_mm}mm`
    ));
  }

  return issues;
}

export function calculateCompatibilityScore(issues: CompatibilityIssue[]): number {
  if (issues.length === 0) return 100;

  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 25;
    else if (issue.severity === 'warning') score -= 10;
    else score -= 5;
  }
  return Math.max(0, score);
}

export function calculateTotalTdp(build: {
  cpu: CPUProduct | null;
  gpu: GPUProduct | null;
}): number {
  let tdp = 0;
  if (build.cpu) tdp += build.cpu.cpu_tdp_watts;
  if (build.gpu) tdp += build.gpu.gpu_tdp_watts;
  return tdp;
}

export function calculateTotalPrice(components: AnyProduct[]): number {
  return components.reduce((sum, c) => sum + (c.price_vnd || 0), 0);
}

export function getPriorityIssues(issues: CompatibilityIssue[]): {
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  info: CompatibilityIssue[];
} {
  return {
    errors: issues.filter(i => i.severity === 'error'),
    warnings: issues.filter(i => i.severity === 'warning'),
    info: issues.filter(i => i.severity === 'info'),
  };
}

export function estimatePerformance(build: {
  cpu: CPUProduct | null;
  gpu: GPUProduct | null;
  ram: RAMProduct[];
}): {
  gaming: number;
  productivity: number;
  workstation: number;
  value: number;
} {
  const cpuPower = build.cpu?.cpu_cinebench_r23_multi || 0;
  const gpuPower = build.gpu?.gpu_benchmark_1080p || 0;
  const ramSpeed = build.ram.reduce((s, r) => s + (r.ram_speed_mhz || 0), 0) / Math.max(build.ram.length, 1);
  const hasGpu = !!build.gpu;
  const totalPrice = calculateTotalPrice([
    build.cpu, build.gpu, ...build.ram
  ].filter(Boolean) as AnyProduct[]);

  const gaming = hasGpu
    ? Math.round((gpuPower * 0.7 + cpuPower * 0.3) / 100)
    : Math.round((cpuPower * 0.3) / 100);

  const productivity = Math.round((cpuPower * 0.6 + ramSpeed * 0.4) / 100);
  const workstation = Math.round((cpuPower * 0.5 + gpuPower * 0.3 + ramSpeed * 0.2) / 100);
  const value = totalPrice > 0
    ? Math.round(((gaming + productivity + workstation) / 3) * 10000000 / totalPrice * 100)
    : 0;

  return {
    gaming: Math.min(100, Math.max(0, gaming)),
    productivity: Math.min(100, Math.max(0, productivity)),
    workstation: Math.min(100, Math.max(0, workstation)),
    value: Math.min(100, Math.max(0, value)),
  };
}

export function getComponentRecommendations(
  budget: number,
  useCase: 'gaming' | 'productivity' | 'workstation' | 'budget'
): Partial<Build> {
  const recommendations: Record<string, Partial<Build>> = {
    budget: {
      cpu: { full_name: 'Intel Core i3-12100F', cpu_socket: 'LGA1700', cpu_cores: 4, cpu_threads: 8, cpu_base_ghz: 3.3, cpu_boost_ghz: 4.3, cpu_tdp_watts: 58, cpu_has_igpu: false, cpu_ram_type: 'DDR4', cpu_max_ram_mhz: 3200, cpu_generation: 'Alder Lake', cpu_cinebench_r23_multi: 8200 } as CPUProduct,
      gpu: { full_name: 'NVIDIA GTX 1650', gpu_vram_gb: 4, gpu_tdp_watts: 75, gpu_length_mm: 170, gpu_benchmark_1080p: 6000, gpu_recommended_psu: 300, gpu_pcie_gen: '3.0', gpu_display_outputs: ['HDMI', 'DP'], gpu_power_connectors: [] } as GPUProduct,
    },
    gaming: {
      cpu: { full_name: 'AMD Ryzen 5 7600', cpu_socket: 'AM5', cpu_cores: 6, cpu_threads: 12, cpu_base_ghz: 3.8, cpu_boost_ghz: 5.1, cpu_tdp_watts: 65, cpu_has_igpu: true, cpu_ram_type: 'DDR5', cpu_max_ram_mhz: 5200, cpu_generation: 'Zen 4', cpu_cinebench_r23_multi: 14500 } as CPUProduct,
      gpu: { full_name: 'NVIDIA RTX 4060', gpu_vram_gb: 8, gpu_tdp_watts: 115, gpu_length_mm: 240, gpu_benchmark_1080p: 18000, gpu_recommended_psu: 550, gpu_pcie_gen: '4.0', gpu_display_outputs: ['HDMI 2.1', 'DP 1.4a'], gpu_power_connectors: [{ type: '8-pin', qty: 1 }] } as GPUProduct,
    },
    productivity: {
      cpu: { full_name: 'Intel Core i7-13700K', cpu_socket: 'LGA1700', cpu_cores: 16, cpu_threads: 24, cpu_base_ghz: 3.4, cpu_boost_ghz: 5.4, cpu_tdp_watts: 125, cpu_has_igpu: true, cpu_ram_type: 'DDR5', cpu_max_ram_mhz: 5600, cpu_generation: 'Raptor Lake', cpu_cinebench_r23_multi: 29000 } as CPUProduct,
      gpu: { full_name: 'NVIDIA RTX 4060 Ti', gpu_vram_gb: 16, gpu_tdp_watts: 160, gpu_length_mm: 268, gpu_benchmark_1080p: 21000, gpu_recommended_psu: 600, gpu_pcie_gen: '4.0', gpu_display_outputs: ['HDMI 2.1', 'DP 1.4a'], gpu_power_connectors: [{ type: '8-pin', qty: 1 }] } as GPUProduct,
    },
    workstation: {
      cpu: { full_name: 'AMD Ryzen 9 7950X', cpu_socket: 'AM5', cpu_cores: 16, cpu_threads: 32, cpu_base_ghz: 4.5, cpu_boost_ghz: 5.7, cpu_tdp_watts: 170, cpu_has_igpu: true, cpu_ram_type: 'DDR5', cpu_max_ram_mhz: 5200, cpu_generation: 'Zen 4', cpu_cinebench_r23_multi: 38000 } as CPUProduct,
      gpu: { full_name: 'NVIDIA RTX 4080 Super', gpu_vram_gb: 16, gpu_tdp_watts: 320, gpu_length_mm: 310, gpu_benchmark_1080p: 35000, gpu_recommended_psu: 750, gpu_pcie_gen: '4.0', gpu_display_outputs: ['HDMI 2.1', 'DP 1.4a'], gpu_power_connectors: [{ type: '12VHPWR', qty: 1 }] } as GPUProduct,
    },
  };

  return recommendations[useCase] || recommendations.budget;
}
