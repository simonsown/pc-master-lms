import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CPU_CORES = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 64];
const CPU_THREADS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 128];
const BASE_TDP = [35, 45, 55, 60, 65, 75, 85, 95, 105, 120, 125, 140, 150, 170, 200, 230, 250, 280, 350];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function roundPrice(n) { return Math.round(n / 10000) * 10000; }

// ─── CPUs ───
const CPU_BRANDS = ['Intel', 'AMD'];
const INTEL_LINES = [
  { name: 'Core i3', genStart: 12, genEnd: 15, suffix: ['F', 'T', ''], base: [12100, 13100, 14100, 15100] },
  { name: 'Core i5', genStart: 12, genEnd: 15, suffix: ['K', 'KF', 'T', 'F', ''], base: [12400, 12600, 13400, 13600, 14400, 14600, 15400, 15600] },
  { name: 'Core i7', genStart: 12, genEnd: 15, suffix: ['K', 'KF', 'T', 'F', ''], base: [12700, 13700, 14700, 15700] },
  { name: 'Core i9', genStart: 12, genEnd: 15, suffix: ['K', 'KF', 'KS', 'T', 'F', ''], base: [12900, 13900, 14900, 15900] },
  { name: 'Core Ultra 5', genStart: 1, genEnd: 2, suffix: ['K', 'F', ''], base: [125, 225, 235] },
  { name: 'Core Ultra 7', genStart: 1, genEnd: 2, suffix: ['K', 'F', ''], base: [165, 265, 275] },
  { name: 'Core Ultra 9', genStart: 1, genEnd: 2, suffix: ['K', 'F', ''], base: [185, 285] },
  { name: 'Pentium Gold', genStart: 7, genEnd: 9, suffix: ['', 'T'], base: [7400, 7500, 8500] },
  { name: 'Celeron', genStart: 6, genEnd: 9, suffix: ['', 'T'], base: [6900, 7300, 7305] },
];

const AMD_LINES = [
  { name: 'Ryzen 3', gen: ['5000', '7000', '8000', '9000'], models: ['5300G', '5400G', '7300X', '8300G', '9300X'] },
  { name: 'Ryzen 5', gen: ['5000', '7000', '8000', '9000'], models: ['5500', '5600', '5600X', '7500F', '7600', '7600X', '8400F', '8500G', '8600G', '9600', '9600X'] },
  { name: 'Ryzen 7', gen: ['5000', '7000', '8000', '9000'], models: ['5700X', '5700X3D', '5800X', '5800X3D', '7700', '7700X', '7800X3D', '8700G', '9700X', '9800X3D'] },
  { name: 'Ryzen 9', gen: ['5000', '7000', '9000'], models: ['5900X', '5950X', '7900', '7900X', '7950X', '7950X3D', '9900X', '9950X'] },
  { name: 'Ryzen Threadripper', gen: ['7000'], models: ['7960X', '7970X', '7980X', '7990X', '7965WX', '7975WX', '7985WX', '7995WX'] },
  { name: 'EPYC', gen: ['4004', '8004', '9004'], models: ['4124P', '4344P', '4484PX', '9124', '9254', '9374F', '9554', '9654', '9684X'] },
];

function generateCPUs() {
  const cpus = [];
  let id = 1;

  // Intel
  for (const line of INTEL_LINES) {
    for (const gen of [12, 13, 14, 15]) {
      if (gen < line.genStart || gen > line.genEnd) continue;
      for (const base of line.base) {
        const genPrefix = String(gen) + String(base).slice(-3);
        for (const sfx of line.suffix) {
          const name = `${line.name}-${genPrefix}${sfx}`;
          const cores = pick(CPU_CORES.slice(0, 9));
          const threads = cores * 2;
          const tdp = pick(BASE_TDP.slice(2, 11));
          const price = roundPrice(rand(800000, line.name.includes('i9') ? 25000000 : line.name.includes('i7') ? 15000000 : line.name.includes('i5') ? 10000000 : 5000000));
          const socket = gen >= 14 ? 'LGA1851' : 'LGA1700';
          cpus.push({
            id: `cpu_intel_${genPrefix}${sfx || 'std'}_${id++}`,
            name: `Intel ${name}`,
            type: 'CPU',
            price,
            socket,
            power: tdp,
            desc: `${cores} nhân / ${threads} luồng, ${tdp}W TDP, Socket ${socket}`,
          });
        }
      }
    }
  }

  // AMD
  for (const line of AMD_LINES) {
    for (const gen of line.gen) {
      for (const model of line.models) {
        const name = `AMD ${line.name} ${gen}${model}`;
        const cores = line.name.includes('Threadripper') || line.name.includes('EPYC') ? pick([16, 24, 32, 64, 96, 128]) : pick([4, 6, 8, 12, 16]);
        const threads = line.name.includes('Threadripper') || line.name.includes('EPYC') ? cores * 2 : cores * 2;
        const tdp = line.name.includes('Threadripper') ? pick([250, 280, 300, 350]) : line.name.includes('EPYC') ? pick([200, 225, 240, 280, 300, 360]) : pick([65, 85, 95, 105, 120, 170]);
        const isX3D = model.includes('X3D');
        const price = roundPrice(
          line.name.includes('Threadripper') ? rand(10000000, 80000000) :
          line.name.includes('EPYC') ? rand(15000000, 120000000) :
          line.name.includes('Ryzen 9') ? rand(8000000, 25000000) :
          line.name.includes('Ryzen 7') ? rand(5000000, 15000000) :
          line.name.includes('Ryzen 5') ? rand(2500000, 8000000) :
          rand(1500000, 5000000)
        );
        const socket = gen.startsWith('9') ? 'AM5' : gen.startsWith('8') ? 'AM5' : gen.startsWith('7') ? (line.name.includes('Threadripper') ? 'sTR5' : 'AM5') : gen.startsWith('5') ? 'AM4' : 'SP5';
        cpus.push({
          id: `cpu_amd_${line.name.toLowerCase().replace(/\s+/g, '_')}_${gen}_${model.toLowerCase()}_${id++}`,
          name,
          type: 'CPU',
          price: isX3D ? price * 1.2 : price,
          socket,
          power: tdp,
          desc: `${cores} nhân / ${threads} luồng, ${tdp}W TDP, Socket ${socket}${isX3D ? ', 3D V-Cache' : ''}`,
        });
      }
    }
  }

  return cpus;
}

// ─── GPUs ───
function generateGPUs() {
  const gpus = [];
  const lines = [
    { brand: 'NVIDIA', prefix: 'RTX', models: ['3050', '3060', '3060 Ti', '3070', '3070 Ti', '3080', '3080 Ti', '3090', '3090 Ti', '4060', '4060 Ti', '4070', '4070 Ti', '4070 Ti Super', '4080', '4080 Super', '4090', '4090 D', '4090 Ti', '5050', '5060', '5060 Ti', '5070', '5070 Ti', '5080', '5090'], vram: [8, 8, 8, 8, 8, 10, 12, 24, 24, 8, 8, 12, 12, 16, 16, 16, 24, 24, 24, 24, 8, 8, 12, 12, 16, 16, 32] },
    { brand: 'NVIDIA', prefix: 'GTX', models: ['1630', '1650', '1650 Super', '1660', '1660 Super', '1660 Ti'], vram: [4, 4, 4, 6, 6, 6] },
    { brand: 'AMD', prefix: 'RX', models: ['6400', '6500 XT', '6600', '6600 XT', '6650 XT', '6700 XT', '6750 XT', '6800', '6800 XT', '6900 XT', '6950 XT', '7600', '7600 XT', '7700 XT', '7800 XT', '7900 GRE', '7900 XT', '7900 XTX', '7900 XTX', '9060 XT', '9070', '9070 XT', '9080', '9080 XT', '9090', '9090 XTX'], vram: [4, 4, 8, 8, 8, 12, 12, 16, 16, 16, 16, 8, 8, 12, 16, 16, 20, 24, 24, 24, 16, 16, 20, 24, 24, 32] },
    { brand: 'Intel', prefix: 'Arc', models: ['A310', 'A380', 'A580', 'A750', 'A770', 'B580', 'B770', 'B780'], vram: [4, 6, 8, 8, 8, 12, 16, 16] },
  ];

  const brands = ['ASUS', 'MSI', 'Gigabyte', 'Colorful', 'ZOTAC', 'PNY', 'Palit', 'Galax', 'Inno3D', 'PowerColor', 'Sapphire', 'XFX'];
  let id = 1;

  for (const line of lines) {
    for (let i = 0; i < line.models.length; i++) {
      const model = line.models[i];
      const vram = line.vram[i];
      for (const brand of brands) {
        const name = `${brand} NVIDIA ${line.prefix} ${model} ${vram}GB`; // default, will fix for AMD/Intel
        const isHighEnd = model.includes('90') || model.includes('80') || model.includes('70 Ti Super') || model.includes('7900 XT');
        const isMid = model.includes('70') || model.includes('60 Ti') || model.includes('7800') || model.includes('7700');
        const price = roundPrice(
          line.brand === 'NVIDIA' ?
            (isHighEnd ? rand(15000000, 75000000) : isMid ? rand(7000000, 16000000) : rand(3000000, 8000000)) :
          line.brand === 'AMD' ?
            (isHighEnd ? rand(12000000, 60000000) : isMid ? rand(6000000, 14000000) : rand(2500000, 7000000)) :
            rand(2000000, 10000000)
        );
        const tdp = isHighEnd ? pick([250, 300, 350, 400, 450]) : isMid ? pick([150, 180, 200, 220, 250]) : pick([75, 100, 130, 150]);

        let fullName;
        if (line.brand === 'Intel') {
          fullName = `${brand} Intel Arc ${model}`;
        } else {
          fullName = `${brand} ${line.brand === 'NVIDIA' ? `GeForce ${line.prefix}` : `Radeon ${line.prefix}`} ${model} ${vram}GB`;
        }

        gpus.push({
          id: `gpu_${line.brand.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '_')}_${brand.toLowerCase()}_${id++}`,
          name: fullName,
          type: 'GPU',
          price,
          power: tdp,
          desc: `${
            line.brand === 'NVIDIA' ? `${line.prefix} ${model}` :
            line.brand === 'AMD' ? `Radeon ${line.prefix} ${model}` :
            `Intel Arc ${model}`
          } ${vram}GB VRAM, ${tdp}W TDP`,
        });
      }
    }
  }
  return gpus;
}

// ─── RAM ───
function generateRAM() {
  const rams = [];
  const brands = ['Corsair', 'G.Skill', 'Kingston', 'Crucial', 'TeamGroup', 'ADATA', 'Patriot', 'Samsung', 'SK Hynix', 'PNY', 'GeIL', 'Silicon Power'];
  const ddr4Speeds = [2133, 2400, 2666, 2933, 3000, 3200, 3333, 3400, 3466, 3600, 3733, 3800, 4000, 4133, 4266, 4400, 4600];
  const ddr5Speeds = [4800, 5200, 5400, 5600, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 7400, 7600, 7800, 8000, 8200, 8400, 8600, 8800, 9000];
  const sizes = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
  const sticks = [1, 2, 4, 8];
  const lines = ['Value', 'Vengeance', 'Trident Z', 'Ripjaws', 'Fury', 'Ballistix', 'T-Force', 'XPG', 'Viper', 'Spectek', 'DDR5'];
  let id = 1;

  for (const brand of brands) {
    for (const ddrType of ['DDR4', 'DDR5']) {
      const speeds = ddrType === 'DDR4' ? ddr4Speeds : ddr5Speeds;
      for (let si = 0; si < Math.min(sizes.length, 8); si++) {
        const sizeGB = sizes[si];
        for (const stick of [1, 2]) {
          const totalGB = sizeGB * stick;
          const speed = pick(speeds);
          const line = pick(lines);
          const price = roundPrice(ddrType === 'DDR5' ? rand(totalGB * 50000, totalGB * 120000) : rand(totalGB * 30000, totalGB * 70000));
          const name = `${brand} ${line} ${totalGB}GB (${stick}x${sizeGB}GB) ${ddrType}-${speed}`;
          rams.push({
            id: `ram_${ddrType.toLowerCase()}_${brand.toLowerCase()}_${totalGB}gb_${id++}`,
            name,
            type: 'RAM',
            price,
            socket: ddrType === 'DDR4' ? 'DDR4' : 'DDR5',
            ramType: ddrType,
            size: `${totalGB}GB (${stick}x${sizeGB}GB)`,
            desc: `${ddrType}-${speed}MHz, CAS ${pick([14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40])}, ${totalGB}GB`,
          });
        }
      }
    }
  }
  return rams;
}

// ─── Mainboards ───
function generateMainboards() {
  const boards = [];
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar', 'Maxsun', 'Colorful'];
  const chipsets = [
    { name: 'H610', socket: 'LGA1700', ddr: ['DDR4', 'DDR5'] },
    { name: 'B660', socket: 'LGA1700', ddr: ['DDR4', 'DDR5'] },
    { name: 'B760', socket: 'LGA1700', ddr: ['DDR4', 'DDR5'] },
    { name: 'Z690', socket: 'LGA1700', ddr: ['DDR4', 'DDR5'] },
    { name: 'Z790', socket: 'LGA1700', ddr: ['DDR4', 'DDR5'] },
    { name: 'W680', socket: 'LGA1700', ddr: ['DDR5'] },
    { name: 'B860', socket: 'LGA1851', ddr: ['DDR5'] },
    { name: 'Z890', socket: 'LGA1851', ddr: ['DDR5'] },
    { name: 'A520', socket: 'AM4', ddr: ['DDR4'] },
    { name: 'B550', socket: 'AM4', ddr: ['DDR4'] },
    { name: 'X570', socket: 'AM4', ddr: ['DDR4'] },
    { name: 'A620', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'B650', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'B650E', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'X670', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'X670E', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'X870', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'X870E', socket: 'AM5', ddr: ['DDR5'] },
    { name: 'TRX50', socket: 'sTR5', ddr: ['DDR5'] },
    { name: 'WRX90', socket: 'sTR5', ddr: ['DDR5'] },
  ];
  const formFactors = ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX', 'Mini-DTX'];
  let id = 1;

  for (const brand of brands) {
    for (const chip of chipsets) {
      for (const ddr of chip.ddr) {
        const ff = pick(formFactors);
        const series = pick(['Prime', 'TUF Gaming', 'ROG Strix', 'Pro', 'MAG', 'MPG', 'MEG', 'Aorus', 'Master', 'Phantom Gaming', 'Pro Series', 'Taichi', 'Steel Legend', 'Vision']);
        const name = `${brand} ${series} ${chip.name} ${ddr} ${ff}`;
        const price = roundPrice(
          chip.name.startsWith('Z') || chip.name.startsWith('X') ? rand(3000000, 25000000) :
          chip.name.startsWith('B') ? rand(1500000, 8000000) :
          chip.name.startsWith('A') || chip.name.startsWith('H') ? rand(800000, 3500000) :
          rand(5000000, 50000000)
        );
        boards.push({
          id: `mb_${brand.toLowerCase()}_${chip.name.toLowerCase()}_${ddr.toLowerCase()}_${id++}`,
          name,
          type: 'Mainboard',
          price,
          socket: chip.socket,
          ramType: ddr,
          desc: `Chipset ${chip.name}, Socket ${chip.socket}, ${ff}, Hỗ trợ ${ddr}`,
        });
      }
    }
  }
  return boards;
}

// ─── Storage ───
function generateStorage() {
  const storage = [];
  const brands = ['Samsung', 'Western Digital', 'Seagate', 'Crucial', 'Kingston', 'SK Hynix', 'Solidigm', 'TeamGroup', 'ADATA', 'Corsair', 'Mushkin', 'Patriot', 'Sabrent', 'Silicon Power', 'Transcend', 'Netac', 'Lexar', 'PNY', 'Micron', 'Toshiba'];
  let id = 1;

  // NVMe SSDs
  const nvmeLines = ['980', '990 EVO', '990 PRO', 'SN580', 'SN770', 'SN850X', 'T500', 'T700', 'KC3000', 'NV3', 'Platinum P41', 'P41 Plus', 'P44 Pro', 'Z440', 'G50', 'MP44', 'Rocket 4', 'A60', 'A440', 'XD70', 'XP6000', 'NM790', 'NM800'];
  for (const brand of brands) {
    for (const line of nvmeLines) {
      for (const capacity of [256, 512, 1024, 2048, 4096, 8192]) {
        if (Math.random() > 0.3) continue; // thin out
        const gen = capacity >= 2048 ? pick([4, 5]) : pick([3, 4, 5]);
        const name = `${brand} ${line} ${capacity >= 1024 ? capacity / 1024 + 'TB' : capacity + 'GB'} NVMe Gen${gen}`;
        const price = roundPrice(capacity * [60, 80, 100, 120, 150, 200][Math.min(gen, 5)]);
        storage.push({
          id: `ssd_nvme_${brand.toLowerCase()}_${line.toLowerCase()}_${capacity}gb_${id++}`,
          name,
          type: 'Storage',
          price,
          desc: `NVMe M.2 Gen${gen}, ${capacity >= 1024 ? capacity / 1024 + 'TB' : capacity + 'GB'}`,
        });
      }
    }
  }

  // SATA SSDs
  const sataLines = ['870 EVO', '870 QVO', 'BX500', 'MX500', 'SA400', 'A400', 'SU630', 'SU650', 'SU750', 'UV500', 'SC300', 'TC10', 'SL100'];
  for (const brand of brands.slice(0, 10)) {
    for (const line of sataLines) {
      for (const capacity of [240, 480, 960, 1920, 3840]) {
        if (Math.random() > 0.3) continue;
        const name = `${brand} ${line} ${capacity >= 1000 ? capacity / 1000 + 'TB' : capacity + 'GB'} SATA SSD`;
        storage.push({
          id: `ssd_sata_${brand.toLowerCase()}_${line.toLowerCase()}_${capacity}gb_${id++}`,
          name,
          type: 'Storage',
          price: roundPrice(capacity * 40),
          desc: `SATA III 2.5", ${capacity >= 1000 ? capacity / 1000 + 'TB' : capacity + 'GB'}`,
        });
      }
    }
  }

  // HDDs
  const hddBrands = ['Seagate', 'Western Digital', 'Toshiba'];
  const hddLines = ['Barracuda', 'IronWolf', 'SkyHawk', 'WD Blue', 'WD Black', 'WD Red', 'WD Purple', 'Gold', 'Ultrastar', 'DT02', 'MG09', 'MG10', 'N300', 'X300'];
  const hddCapacities = [500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000];
  for (const brand of hddBrands) {
    for (const line of hddLines) {
      for (const cap of hddCapacities) {
        if (Math.random() > 0.25) continue;
        const rpm = cap >= 4000 ? pick([5400, 7200]) : 7200;
        const name = `${brand} ${line} ${cap >= 1000 ? cap / 1000 + 'TB' : cap + 'GB'} ${rpm}rpm`;
        storage.push({
          id: `hdd_${brand.toLowerCase()}_${line.toLowerCase()}_${cap}gb_${id++}`,
          name,
          type: 'Storage',
          price: roundPrice(cap * [10, 15, 20, 25, 30, 35, 40][Math.min(Math.floor(cap / 2000), 6)]),
          desc: `HDD ${rpm}rpm, ${cap >= 1000 ? cap / 1000 + 'TB' : cap + 'GB'}, SATA III`,
        });
      }
    }
  }

  return storage;
}

// ─── PSU ───
function generatePSUs() {
  const psus = [];
  const brands = ['Corsair', 'EVGA', 'Seasonic', 'Cooler Master', 'be quiet!', 'Thermaltake', 'FSP', 'SilverStone', 'NZXT', 'Antec', 'Super Flower', 'Lian Li', 'MSI', 'ASUS', 'Gigabyte', 'DeepCool', 'XPG'];
  const wattages = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 1000, 1050, 1100, 1200, 1300, 1500, 1600, 1800, 2000];
  const ratings = ['80+ White', '80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'];
  const series_map = {
    'Corsair': ['CV', 'CX', 'RM', 'RMx', 'RMx Shift', 'HX', 'AX', 'SF'],
    'EVGA': ['W1', 'GD', 'G5', 'G6', 'G7', 'P2', 'T2', 'SuperNOVA'],
    'Seasonic': ['S12', 'Focus', 'Core', 'Prime', 'Vertex', 'Prime TX'],
    'Cooler Master': ['Elite', 'MWE', 'V', 'XG'],
    'be quiet!': ['System Power', 'Pure Power', 'Straight Power', 'Dark Power'],
    'Thermaltake': ['Smart', 'Toughpower', 'Toughpower GF', 'Toughpower iRGB'],
    'FSP': ['Hydro', 'Hydro G', 'Hydro PTM'],
    'SilverStone': ['Strider', 'Strider Gold', 'Nightjar', 'SX'],
    'NZXT': ['C', 'E'],
    'Antec': ['Earthwatts', 'NeoECO', 'High Current', 'Signature'],
    'Super Flower': ['Leadex', 'Leadex Platinum', 'Leadex Titanium'],
    'Lian Li': ['SP'],
    'MSI': ['MAG', 'MPG', 'A-G'],
    'ASUS': ['TUF', 'ROG', 'ROG Thor'],
    'Gigabyte': ['GP', 'UD', 'Aorus'],
    'DeepCool': ['PF', 'DQ', 'PQ'],
    'XPG': ['Core Reactor', 'CyberCore', 'Fusion'],
  };
  let id = 1;

  for (const brand of brands) {
    const series = series_map[brand] || ['Standard'];
    for (const s of series) {
      for (const rating of ratings.slice(0, brand.includes('Corsair') || brand.includes('Seasonic') || brand.includes('EVGA') ? 5 : brand.includes('be quiet') || brand.includes('ASUS') ? 4 : 3)) {
        for (const watt of wattages) {
          if (Math.random() > 0.2) continue;
          if (rating === '80+ Titanium' && watt < 600) continue;
          if (rating === '80+ Platinum' && watt < 400) continue;
          const name = `${brand} ${s} ${watt}W ${rating}`;
          const price = roundPrice(
            rating.includes('Titanium') ? watt * 500 :
            rating.includes('Platinum') ? watt * 400 :
            rating.includes('Gold') ? watt * 300 :
            rating.includes('Bronze') ? watt * 200 :
            watt * 120
          );
          psus.push({
            id: `psu_${brand.toLowerCase()}_${s.toLowerCase().replace(/\s+/g, '_')}_${watt}w_${id++}`,
            name,
            type: 'PSU',
            price,
            wattage: watt,
            desc: `${watt}W ${rating}, Fully Modular`,
          });
        }
      }
    }
  }
  return psus;
}

// ─── Coolers ───
function generateCoolers() {
  const coolers = [];
  const brands = ['Noctua', 'Cooler Master', 'NZXT', 'Corsair', 'be quiet!', 'DeepCool', 'Thermalright', 'ID-Cooling', 'ARCTIC', 'Lian Li', 'SilverStone', 'MSI', 'ASUS', 'Jonsbo', 'Scythe', 'Thermaltake', 'Phanteks', 'Alphacool'];
  let id = 1;

  // Air coolers
  const airLines = ['NH-D15', 'NH-U12S', 'NH-L9i', 'Hyper 212', 'Hyper 620S', 'MA620P', 'Pure Rock 2', 'Dark Rock 4', 'Dark Rock Pro 5', 'Shadow Rock 3', 'AK400', 'AK500', 'AK620', 'Peerless Assassin', 'Phantom Spirit', 'Assassin X', 'Frostflow', 'Freezer 34', 'Freezer A35', 'Fuma 3', 'Mugen 6', 'Grand Macho', 'TRUE Spirit', 'Le Grand Macho'];
  for (const brand of brands.slice(0, 10)) {
    for (const line of airLines) {
      if (Math.random() > 0.5) continue;
      const price = roundPrice(rand(150000, 2500000));
      const name = `${brand} ${line} (Air Cooler)`;
      coolers.push({
        id: `cooler_air_${brand.toLowerCase()}_${line.toLowerCase().replace(/\s+/g, '_')}_${id++}`,
        name,
        type: 'Cooler',
        price,
        desc: `Tản nhiệt khí, ${pick(['120mm', '140mm', '92mm', '80mm'])} quạt`,
      });
    }
  }

  // AIO liquid coolers
  const aioLines = ['Kraken', 'Kraken Elite', 'Kraken X', 'iCUE H100i', 'iCUE H150i', 'iCUE H170i', 'Liquid Freezer', 'Liquid Freezer III', 'Frost Commander', 'Castle', 'LT520', 'LT720', 'MasterLiquid', 'MasterLiquid ML', 'Trio', 'Pure Loop', 'Silent Loop', 'TOUGHLIQUID', 'ROG Ryujin', 'ROG Ryuo', 'Nautilus', 'Klim', 'GA II', 'Trinity', 'Omni'];
  const radiatorSizes = [120, 240, 280, 360, 420, 480];
  for (const brand of brands) {
    for (const line of aioLines) {
      if (Math.random() > 0.4) continue;
      for (const rad of radiatorSizes) {
        if (Math.random() > 0.5) continue;
        const price = roundPrice(rand(800000, 12000000));
        const name = `${brand} ${line} ${rad}mm AIO`;
        coolers.push({
          id: `cooler_aio_${brand.toLowerCase()}_${line.toLowerCase().replace(/\s+/g, '_')}_${rad}mm_${id++}`,
          name,
          type: 'Cooler',
          price,
          desc: `Tản nhiệt nước AIO ${rad}mm, ${pick(['RGB', 'ARGB', 'không LED'])}`,
        });
      }
    }
  }
  return coolers;
}

// ─── Cases ───
function generateCases() {
  const cases = [];
  const brands = ['Corsair', 'NZXT', 'Lian Li', 'Fractal Design', 'Cooler Master', 'Phanteks', 'be quiet!', 'Thermaltake', 'SilverStone', 'DeepCool', 'Jonsbo', 'HYTE', 'Montech', 'Antec', 'MetallicGear', 'BitFenix', 'SAMA', 'darkFlash', 'GameMax', 'Segotep', 'MUSETEX', 'Azza'];
  const formFactors = ['Mini-ITX', 'Micro-ATX', 'Mid Tower', 'Full Tower', 'Super Tower', 'Mini Tower', 'SFF', 'Wall-mount'];
  let id = 1;

  const caseSeries = {
    'Corsair': ['4000D', '5000D', '7000D', 'iCUE 220T', 'iCUE 465X', 'Crystal 280X', 'Crystal 570X', 'Obsidian', 'Carbide', 'Airflow', 'Frame 4000D'],
    'NZXT': ['H5 Flow', 'H7 Flow', 'H9 Flow', 'H9 Elite', 'H510', 'H710', 'H700i', 'H1'],
    'Lian Li': ['O11 Dynamic', 'O11 Dynamic EVO', 'O11 Dynamic XL', 'Lancool 205', 'Lancool 216', 'Lancool III', 'A3-mATX', 'Q58', 'TU150'],
    'Fractal Design': ['Meshify 2', 'Define 7', 'North', 'Pop Air', 'Focus 2', 'Torrent', 'Era ITX', 'Terra'],
    'Cooler Master': ['MasterBox Q300L', 'MasterBox MB520', 'MasterCase H500', 'COSMOS C700M', 'HAF 700', 'NR200', 'NR200P'],
    'Phanteks': ['Eclipse G360A', 'Eclipse P400A', 'Eclipse P500A', 'Enthoo Pro 2', 'Evolv X', 'NV5', 'NV7', 'Shift XT'],
    'be quiet!': ['Pure Base 500', 'Pure Base 500DX', 'Shadow Base 800', 'Dark Base 701', 'Dark Base Pro 901'],
    'Thermaltake': ['Core P3', 'Core P8', 'Level 20', 'Tower 100', 'Tower 200', 'Tower 300', 'Tower 500', 'Tower 900', 'S100', 'V250'],
    'SilverStone': ['Seta A1', 'Seta Q1', 'Seta H1', 'ALTA G1M', 'ALTA F2', 'Sugo 16', 'GD11', 'RM42'],
    'DeepCool': ['CH370', 'CH510', 'CH560', 'CH780', 'MATREXX 40', 'MATREXX 50', 'MATREXX 70', 'LS520'],
    'Jonsbo': ['D31', 'D41', 'D300', 'TK-1', 'TK-2', 'UMX6', 'VR4', 'N2', 'N3', 'N5'],
  };

  for (const brand of brands) {
    const series = caseSeries[brand] || ['Standard', 'Pro', 'Elite'];
    for (const s of series) {
      const ff = pick(formFactors);
      const name = `${brand} ${s} ${ff}`;
      const price = roundPrice(
        ff.includes('Full Tower') || ff.includes('Super Tower') ? rand(2000000, 25000000) :
        ff.includes('Mid Tower') ? rand(500000, 5000000) :
        rand(300000, 3000000)
      );
      cases.push({
        id: `case_${brand.toLowerCase()}_${s.toLowerCase().replace(/[\s+]/g, '_')}_${id++}`,
        name,
        type: 'Case',
        price,
        desc: `${ff}, ${pick(['Tempered Glass', 'Mesh', 'Solid Panel', 'Dual Chamber'])}, ${pick(['ATX', 'E-ATX', 'mATX', 'ITX'])}`,
      });
    }
  }
  return cases;
}

// ─── Monitors ───
function generateMonitors() {
  const monitors = [];
  const brands = ['Dell', 'LG', 'Samsung', 'ASUS', 'AOC', 'BenQ', 'ViewSonic', 'Acer', 'MSI', 'Gigabyte', 'HP', 'Lenovo', 'Philips', 'Sony', 'Philips', 'VIOTEK', 'KOORUI', 'Sceptre', 'Innocn', 'Redmi', 'Xiaomi'];
  let id = 1;

  const monitorSeries = {
    'Dell': ['UltraSharp', 'P Series', 'S Series', 'Alienware', 'Gaming'],
    'LG': ['UltraGear', 'UltraFine', 'UltraWide', 'Gram +view', 'MyView'],
    'Samsung': ['Odyssey', 'Smart Monitor', 'ViewFinity', 'CRG9', 'G Series'],
    'ASUS': ['ROG Swift', 'TUF Gaming', 'ProArt', 'Designo', 'VA'],
    'AOC': ['Gaming', 'U Series', 'C Series', 'Agon', 'E Series', '24G2', '27G2'],
  };

  const resolutions = ['1920x1080', '2560x1080', '2560x1440', '3440x1440', '3840x1600', '3840x2160', '5120x2160', '5120x2880', '7680x4320'];
  const sizes_inch = [21.5, 23.8, 24, 24.5, 25, 27, 28, 31.5, 32, 34, 38, 40, 42, 43, 48, 49, 54, 55, 57];
  const refreshRates = [60, 75, 100, 120, 144, 165, 175, 200, 240, 360, 480, 540];
  const panelTypes = ['IPS', 'VA', 'TN', 'OLED', 'QLED', 'Mini-LED', 'PLS', 'AHVA'];

  for (const brand of brands) {
    const series = monitorSeries[brand] || ['Standard', 'Pro', 'Ultra'];
    for (const s of series) {
      for (let i = 0; i < 3; i++) {
        const size = pick(sizes_inch);
        const res = pick(resolutions);
        const hz = res.includes('2160') ? pick(refreshRates.slice(0, 5)) : res.includes('1440') ? pick(refreshRates.slice(2, 8)) : pick(refreshRates);
        const panel = pick(panelTypes);
        const isUltrawide = res.includes('3440') || res.includes('3840x1600') || res.includes('5120');
        const name = `${brand} ${s} ${size}" ${res} ${hz}Hz ${panel}`;
        const price = roundPrice(
          res.includes('4320') ? rand(30000000, 150000000) :
          res.includes('2160') ? rand(6000000, 50000000) :
          res.includes('1440') ? rand(3000000, 25000000) :
          rand(1500000, 12000000)
        );
        monitors.push({
          id: `monitor_${brand.toLowerCase()}_${s.toLowerCase().replace(/\s+/g, '_')}_${size}_${id++}`,
          name,
          type: 'Monitor',
          price,
          desc: `${size}" ${panel}, ${res}, ${hz}Hz`,
        });
      }
    }
  }
  return monitors;
}

// ─── Main ───
function main() {
  const cpus = generateCPUs();
  const gpus = generateGPUs();
  const rams = generateRAM();
  const boards = generateMainboards();
  const storage = generateStorage();
  const psus = generatePSUs();
  const coolers = generateCoolers();
  const cases = generateCases();
  const monitors = generateMonitors();

  const all = [...cpus, ...gpus, ...rams, ...boards, ...storage, ...psus, ...coolers, ...cases, ...monitors];

  console.log(`Generated ${all.length} components:`);
  console.log(`  CPUs: ${cpus.length}`);
  console.log(`  GPUs: ${gpus.length}`);
  console.log(`  RAM: ${rams.length}`);
  console.log(`  Mainboards: ${boards.length}`);
  console.log(`  Storage: ${storage.length}`);
  console.log(`  PSUs: ${psus.length}`);
  console.log(`  Coolers: ${coolers.length}`);
  console.log(`  Cases: ${cases.length}`);
  console.log(`  Monitors: ${monitors.length}`);

  const outputPath = path.join(__dirname, '..', 'data', 'componentsData.json');
  fs.writeFileSync(outputPath, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`\nWritten to: ${outputPath}`);
}

main();
