export type ComponentType = 'CPU' | 'RAM' | 'GPU' | 'PSU' | 'SSD' | 'COOLER' | 'Mainboard' | 'HDD';

export const IMAGE_MAP: Record<string, string[]> = {
  CPU: [
    '/images/components/cpu_amd_front.png',
    '/images/components/cpu_amd_iso.png',
    '/images/components/cpu_intel_front.png',
    '/images/components/cpu_intel_iso.png',
    '/images/components/cpu_ryzen5_old_front.png',
    '/images/components/cpu_xeon_old_front.png',
    '/images/components/amd_ryzen_7_9800x3d.png',
    '/images/components/amd_ryzen_9_9950x.png',
    '/images/components/intel_core_i3_12100.png',
    '/images/components/intel_core_i7_14700f.png',
    '/images/components/intel_core_ultra_9_285k.png',
    '/images/components/intel_xeon_e5_2667_v4.png',
  ],
  RAM: [
    '/images/components/cudimm_ram.png',
    '/images/components/ddr4_ecc_ram.png',
    '/images/components/ddr4_ram_front.png',
    '/images/components/ddr4_ram_non_rgb.png',
    '/images/components/ddr5_ram_front.png',
    '/images/components/ddr5_ram_rgb.png',
    '/images/components/ram_ecc_front.png',
    '/images/components/ram_rgb_front.png',
    '/images/components/ram_rgb_iso.png',
  ],
  GPU: [
    '/images/components/gpu_gtx_1650_front.png',
    '/images/components/gpu_gtx_1660_front.png',
    '/images/components/gpu_rtx_5090_front.png',
    '/images/components/gpu_rtx_5090_iso.png',
    '/images/components/gpu_rx580_front.png',
    '/images/components/gpu_rx580_iso.png',
    '/images/components/gpu_rx_7600_front.png',
    '/images/components/gpu_rx_7600_iso.png',
    '/images/components/gtx_1660_super.png',
    '/images/components/nvidia_rtx_5090_front_view.png',
    '/images/components/nvidia_rtx_5090_white_bg.png',
    '/images/components/rtx_4060_itx.png',
    '/images/components/rtx_5070_ti.png',
    '/images/components/rtx_5080_16gb.png',
    '/images/components/rtx_5090_32gb.png',
    '/images/components/rtx_5090_pure_white_bg.png',
    '/images/components/rtx_5090_rainbow_fans.png',
    '/images/components/rtx_5090_rainbow_white_bg.png',
    '/images/components/rx_7600_8gb.png',
  ],
  PSU: [
    '/images/components/corsair_rm750e_psu.png',
    '/images/components/msi_mpg_ai1600ts_psu.png',
    '/images/components/psu_400w_iso.png',
    '/images/components/psu_back_front.png',
    '/images/components/psu_front.png',
    '/images/components/psu_iso_new.png',
    '/images/components/psu_side_front.png',
    '/images/components/sfx_gold_psu.png',
  ],
  SSD: [
    '/images/components/nvme_ssd_front.png',
    '/images/components/nvme_ssd_front_new.png',
    '/images/components/nvme_ssd_iso_new.png',
    '/images/components/samsung_990_pro_ssd.png',
    '/images/components/ssd_120gb_front.png',
    '/images/components/ssd_2_5_front.png',
    '/images/components/ssd_2_5_inch.png',
  ],
  COOLER: [
    '/images/components/aio_cooler_front.png',
    '/images/components/aio_pump_front.png',
    '/images/components/air_cooler_front.png',
    '/images/components/air_cooler_front_new.png',
    '/images/components/air_cooler_iso_new.png',
    '/images/components/arctic_liquid_freezer_iii_360.png',
    '/images/components/intel_stock_cooler.png',
    '/images/components/msi_mag_coreliquid_360.png',
    '/images/components/stock_cooler_iso.png',
    '/images/components/thermalright_peerless_assassin_120.png',
  ],
  Mainboard: [
    '/images/components/high_end_mainboard.png',
    '/images/components/mainboard_a520_front.png',
    '/images/components/mainboard_a520_iso.png',
    '/images/components/mainboard_b550_front.png',
    '/images/components/mainboard_b550_iso.png',
    '/images/components/mainboard_b760_front.png',
    '/images/components/mainboard_b760_iso.png',
    '/images/components/mainboard_classic_green_front.png',
    '/images/components/mainboard_classic_green_iso.png',
    '/images/components/mainboard_front.png',
    '/images/components/mainboard_h610_front.png',
    '/images/components/mainboard_h610_iso.png',
    '/images/components/mainboard_iso.png',
    '/images/components/mainboard_military_green_front.png',
    '/images/components/mainboard_military_green_iso.png',
  ],
  HDD: [
    '/images/components/hdd_3_5_inch.png',
    '/images/components/hdd_iso.png',
    '/images/components/hdd_old_front.png',
  ],
};

export function getRandomSrc(): string {
  const all = Object.values(IMAGE_MAP).flat();
  if (all.length === 0) return '';
  return all[Math.floor(Math.random() * all.length)];
}

export function getRandomImage(type: string): string {
  const images = IMAGE_MAP[type];
  if (!images || images.length === 0) return '';
  return images[Math.floor(Math.random() * images.length)];
}

export function preloadImages(type: string): Promise<HTMLImageElement[]> {
  const urls = IMAGE_MAP[type] || [];
  return Promise.all(urls.map(src => new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  })));
}
