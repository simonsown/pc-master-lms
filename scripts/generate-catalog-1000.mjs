import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Deterministic PRNG (mulberry32) so builds are reproducible
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MIN_PER_TYPE = 1000;

function roundPrice(n) { return Math.max(100000, Math.round(n / 10000) * 10000); }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }

// ─── CPUs ───
function generateCPUs(rng) {
  const out = [];
  const intel = [
    { name: 'Core i3', gens: [10, 11, 12, 13, 14, 15], base: ['10100', '10105', '10300', '11100', '12100', '12100F', '13100', '13100F', '14100', '14100F', '15100'], suffix: ['', 'F', 'T', 'K', 'KF'] },
    { name: 'Core i5', gens: [10, 11, 12, 13, 14, 15], base: ['10400', '10400F', '10600K', '11400', '11400F', '11600K', '12400', '12400F', '12600K', '13400', '13400F', '13600K', '13600KF', '14400', '14400F', '14600K', '14600KF', '15400', '15600K'], suffix: ['', 'F', 'K', 'KF', 'T'] },
    { name: 'Core i7', gens: [10, 11, 12, 13, 14, 15], base: ['10700', '10700K', '11700', '11700K', '12700', '12700K', '13700', '13700K', '13700KF', '13790F', '14700', '14700K', '14700KF', '14790F', '15700', '15700K'], suffix: ['', 'K', 'KF', 'T', 'F'] },
    { name: 'Core i9', gens: [10, 11, 12, 13, 14, 15], base: ['10900K', '11900K', '12900', '12900K', '12900KS', '13900', '13900K', '13900KS', '14900', '14900K', '14900KS', '15900', '15900K'], suffix: ['', 'K', 'KF', 'KS', 'T', 'F'] },
    { name: 'Core Ultra 5', gens: [1, 2], base: ['125', '125K', '225', '235', '245K'], suffix: ['', 'K', 'F'] },
    { name: 'Core Ultra 7', gens: [1, 2], base: ['165', '165K', '265', '265K', '275K'], suffix: ['', 'K', 'F'] },
    { name: 'Core Ultra 9', gens: [1, 2], base: ['185', '185K', '285', '285K'], suffix: ['', 'K', 'F'] },
    { name: 'Pentium', gens: [7, 8, 9, 10, 11, 12, 13], base: ['7400', '7500', '8500', '8600', '9500', '9600', 'G7400', 'G7400T', 'G6900'], suffix: ['', 'T'] },
    { name: 'Celeron', gens: [6, 7, 8, 9, 10, 11, 12, 13], base: ['6900', '7300', '7305', '8300', '9300', '10300', 'G5900', 'G5905', 'G6900'], suffix: ['', 'T'] },
  ];
  let id = 1;
  for (const line of intel) {
    for (const gen of line.gens) {
      for (const base of line.base) {
        const baseStr = String(base);
        const numStr = baseStr.replace(/[^0-9]/g, '');
        const genNum = numStr.length >= 5 ? parseInt(numStr.slice(0, 2)) : parseInt(numStr.slice(0, 1));
        if (genNum !== gen) continue;
        const variants = line.name.startsWith('Core i') ? ['Tray', 'Box'] : ['Tray'];
        for (const pkg of variants) {
          for (const sfx of line.suffix) {
            const name = `Intel ${line.name}-${baseStr}${sfx}${pkg === 'Box' ? ' (Box)' : ''}`;
            const cores = pick(rng, [2, 4, 6, 8, 10, 12, 14, 16, 20, 24]);
            const tdp = pick(rng, [35, 45, 55, 65, 77, 95, 105, 125, 150, 170, 200, 250]);
            const price = roundPrice(
              line.name.includes('i9') ? randInt(rng, 7000000, 25000000) :
              line.name.includes('i7') ? randInt(rng, 4500000, 16000000) :
              line.name.includes('i5') ? randInt(rng, 2200000, 10000000) :
              line.name.includes('i3') ? randInt(rng, 1200000, 4500000) :
              randInt(rng, 400000, 2500000)
            );
            out.push({
              id: `cpu_intel_${id++}`,
              name, type: 'CPU', price: roundPrice(pkg === 'Box' ? price * 1.05 : price),
              socket: gen >= 14 ? 'LGA1851' : 'LGA1700',
              power: tdp,
              desc: `${cores} nhân / ${cores * 2} luồng, ${tdp}W TDP, Socket ${gen >= 14 ? 'LGA1851' : 'LGA1700'}, bản ${pkg}`,
            });
          }
        }
      }
    }
  }
  const amd = [
    { name: 'Ryzen 3', gens: ['5000', '7000', '8000', '9000'], models: ['5300G', '5400G', '7300X', '8300G', '9300X', '1100'] },
    { name: 'Ryzen 5', gens: ['5000', '7000', '8000', '9000'], models: ['5500', '5600', '5600X', '5600G', '5600G3', '7500F', '7600', '7600X', '8400F', '8500G', '8600G', '9600', '9600X', '1000'] },
    { name: 'Ryzen 7', gens: ['5000', '7000', '8000', '9000'], models: ['5700X', '5700X3D', '5800X', '5800X3D', '7700', '7700X', '7800X3D', '8700G', '9700X', '9800X3D', '1100X'] },
    { name: 'Ryzen 9', gens: ['5000', '7000', '9000'], models: ['5900X', '5950X', '7900', '7900X', '7950X', '7950X3D', '9900X', '9950X', '9950X3D', '1200X'] },
    { name: 'Ryzen Threadripper', gens: ['7000'], models: ['7960X', '7970X', '7980X', '7990X', '7965WX', '7975WX', '7985WX', '7995WX'] },
  ];
  for (const line of amd) {
    for (const gen of line.gens) {
      for (const model of line.models) {
        for (const pkg of ['Tray', 'Box']) {
          const name = `AMD ${line.name} ${gen}${model}${pkg === 'Box' ? ' (Box)' : ''}`;
          const cores = line.name.includes('Threadripper') ? pick(rng, [16, 24, 32, 64, 96, 128]) : pick(rng, [4, 6, 8, 12, 16]);
          const tdp = line.name.includes('Threadripper') ? pick(rng, [250, 280, 300, 350]) : pick(rng, [65, 85, 95, 105, 120, 170]);
          const isX3D = model.includes('X3D');
          const price = roundPrice(
            line.name.includes('Threadripper') ? randInt(rng, 15000000, 80000000) :
            line.name.includes('Ryzen 9') ? randInt(rng, 9000000, 30000000) :
            line.name.includes('Ryzen 7') ? randInt(rng, 5000000, 16000000) :
            line.name.includes('Ryzen 5') ? randInt(rng, 2500000, 9000000) :
            randInt(rng, 1500000, 5500000)
          );
          const socket = gen.startsWith('9') || gen.startsWith('8') || gen.startsWith('7') ? (line.name.includes('Threadripper') ? 'sTR5' : 'AM5') : gen.startsWith('5') ? 'AM4' : 'AM5';
          out.push({
            id: `cpu_amd_${id++}`,
            name, type: 'CPU',
            price: roundPrice((isX3D ? price * 1.2 : price) * (pkg === 'Box' ? 1.05 : 1)),
            socket, power: tdp,
            desc: `${cores} nhân / ${cores * 2} luồng, ${tdp}W TDP, Socket ${socket}${isX3D ? ', 3D V-Cache' : ''}, bản ${pkg}`,
          });
        }
      }
    }
  }
  return out;
}

// ─── GPUs ───
function generateGPUs(rng) {
  const out = [];
  const lines = [
    { brand: 'NVIDIA', prefix: 'GeForce RTX', models: ['3050', '3060', '3060 Ti', '3070', '3070 Ti', '3080', '3080 Ti', '3090', '4060', '4060 Ti', '4070', '4070 Ti', '4070 Ti Super', '4080', '4080 Super', '4090', '5050', '5060', '5060 Ti', '5070', '5070 Ti', '5080', '5090'], vram: [8, 12, 8, 8, 8, 10, 12, 24, 8, 8, 12, 12, 16, 16, 16, 24, 8, 8, 16, 12, 16, 16, 32] },
    { brand: 'NVIDIA', prefix: 'GeForce GTX', models: ['1630', '1650', '1650 Super', '1660', '1660 Super', '1660 Ti'], vram: [4, 4, 4, 6, 6, 6] },
    { brand: 'AMD', prefix: 'Radeon RX', models: ['6400', '6500 XT', '6600', '6600 XT', '6650 XT', '6700 XT', '6750 XT', '6800', '6800 XT', '6900 XT', '6950 XT', '7600', '7600 XT', '7700 XT', '7800 XT', '7900 GRE', '7900 XT', '7900 XTX', '9060 XT', '9070', '9070 XT', '9080', '9080 XT', '9090', '9090 XTX'], vram: [4, 4, 8, 8, 8, 12, 12, 16, 16, 16, 16, 8, 8, 12, 16, 16, 20, 24, 16, 16, 16, 20, 24, 24, 32] },
    { brand: 'Intel', prefix: 'Arc', models: ['A310', 'A380', 'A580', 'A750', 'A770', 'B580', 'B770', 'B780'], vram: [4, 6, 8, 8, 8, 12, 16, 16] },
  ];
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'Colorful', 'ZOTAC', 'PNY', 'Palit', 'Galax', 'Inno3D', 'PowerColor', 'Sapphire', 'XFX'];
  let id = 1;
  for (const line of lines) {
    for (let i = 0; i < line.models.length; i++) {
      const model = line.models[i];
      const vram = line.vram[i];
      const isHigh = model.includes('90') || model.includes('80') || model.includes('70 Ti Super') || model.includes('7900 XT') || model.includes('9080') || model.includes('9090');
      const isMid = model.includes('70') || model.includes('60 Ti') || model.includes('7800') || model.includes('7700') || model.includes('5060 Ti') || model.includes('9070');
      const subLines = line.brand === 'Intel' ? ['', 'OC'] : ['', 'OC', 'Gaming'];
      for (const brand of brands) {
        for (const sub of subLines) {
          const name = line.brand === 'NVIDIA'
            ? `${brand} ${sub} ${line.prefix} ${model} ${vram}GB`
            : line.brand === 'AMD'
              ? `${brand} ${sub} ${line.prefix} ${model} ${vram}GB`
              : `${brand} Intel Arc ${model}`;
          const price = roundPrice(
            line.brand === 'NVIDIA' ? (isHigh ? randInt(rng, 15000000, 75000000) : isMid ? randInt(rng, 7000000, 18000000) : randInt(rng, 3000000, 8500000)) :
            line.brand === 'AMD' ? (isHigh ? randInt(rng, 13000000, 65000000) : isMid ? randInt(rng, 6000000, 15000000) : randInt(rng, 2500000, 7500000)) :
            randInt(rng, 2200000, 11000000)
          );
          const tdp = isHigh ? pick(rng, [250, 300, 350, 400, 450]) : isMid ? pick(rng, [150, 180, 200, 220, 250]) : pick(rng, [75, 100, 130, 150]);
          out.push({
            id: `gpu_${id++}`,
            name, type: 'GPU', price: roundPrice(sub === 'OC' ? price * 1.05 : sub === 'Gaming' ? price * 1.03 : price), power: tdp,
            desc: `${line.prefix} ${model} ${vram}GB VRAM, ${tdp}W TDP${sub ? `, bản ${sub}` : ''}`,
          });
        }
      }
    }
  }
  return out;
}

// ─── RAM ───
function generateRAM(rng) {
  const out = [];
  const brands = ['Corsair', 'G.Skill', 'Kingston', 'Crucial', 'TeamGroup', 'ADATA', 'Patriot', 'Samsung', 'SK Hynix', 'PNY', 'GeIL', 'Silicon Power', 'Lexar', 'V-Color'];
  const ddr4 = [2133, 2400, 2666, 2933, 3000, 3200, 3333, 3400, 3466, 3600, 3733, 3800, 4000, 4133, 4266, 4400, 4600];
  const ddr5 = [4800, 5200, 5400, 5600, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 7400, 7600, 7800, 8000, 8200, 8400, 8600, 8800, 9000];
  const sizes = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
  const sticks = [1, 2, 4];
  const lines = ['Value', 'Vengeance', 'Trident Z', 'Ripjaws', 'Fury', 'Ballistix', 'T-Force', 'XPG', 'Viper', 'Spectek', 'Platinum', 'Flare X', 'Predator', 'Aegis'];
  let id = 1;
  for (const brand of brands) {
    for (const ddrType of ['DDR4', 'DDR5']) {
      const speeds = ddrType === 'DDR4' ? ddr4 : ddr5;
      for (const sizeGB of sizes) {
        for (const stick of sticks) {
          for (const hasRgb of [false, true]) {
            const totalGB = sizeGB * stick;
            const speed = pick(rng, speeds);
            const line = pick(rng, lines);
            const price = roundPrice(ddrType === 'DDR5' ? randInt(rng, totalGB * 55000, totalGB * 130000) : randInt(rng, totalGB * 32000, totalGB * 75000));
            const name = `${brand} ${line} ${totalGB}GB (${stick}x${sizeGB}GB) ${ddrType}-${speed}${hasRgb ? ' RGB' : ''}`;
            out.push({
              id: `ram_${id++}`,
              name, type: 'RAM', price: roundPrice(hasRgb ? price * 1.12 : price),
              socket: ddrType, ramType: ddrType,
              size: `${totalGB}GB (${stick}x${sizeGB}GB)`,
              desc: `${ddrType}-${speed}MHz, CAS ${pick(rng, [14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40])}, ${totalGB}GB${hasRgb ? ', LED RGB' : ''}`,
            });
          }
        }
      }
    }
  }
  return out;
}

// ─── Mainboards ───
function generateMainboards(rng) {
  const out = [];
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar', 'Maxsun', 'Colorful', 'ECS'];
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
  const formFactors = ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'];
  const series = ['Prime', 'TUF Gaming', 'ROG Strix', 'Pro', 'MAG', 'MPG', 'MEG', 'Aorus', 'Master', 'Phantom Gaming', 'Pro Series', 'Taichi', 'Steel Legend', 'Vision', 'Eclipse', 'TomaHawk', 'Gaming Plus'];
  let id = 1;
  for (const brand of brands) {
    for (const chip of chipsets) {
      for (const ddr of chip.ddr) {
        for (const ff of formFactors) {
          for (let si = 0; si < 3; si++) {
            const s = series[(brand.length + chip.name.length + si * 5) % series.length];
            const name = `${brand} ${s} ${chip.name} ${ddr} ${ff}`;
            const price = roundPrice(
              chip.name.startsWith('Z') || chip.name.startsWith('X') ? randInt(rng, 3000000, 26000000) :
              chip.name.startsWith('B') ? randInt(rng, 1500000, 9000000) :
              chip.name.startsWith('A') || chip.name.startsWith('H') ? randInt(rng, 800000, 3500000) :
              randInt(rng, 5000000, 55000000)
            );
            out.push({
              id: `mb_${id++}`,
              name, type: 'Mainboard', price,
              socket: chip.socket, ramType: ddr,
              desc: `Chipset ${chip.name}, Socket ${chip.socket}, ${ff}, Hỗ trợ ${ddr}`,
            });
          }
        }
      }
    }
  }
  return out;
}

// ─── Storage ───
function generateStorage(rng) {
  const out = [];
  const brands = ['Samsung', 'Western Digital', 'Seagate', 'Crucial', 'Kingston', 'SK Hynix', 'Solidigm', 'TeamGroup', 'ADATA', 'Corsair', 'Mushkin', 'Patriot', 'Sabrent', 'Silicon Power', 'Transcend', 'Netac', 'Lexar', 'PNY', 'Micron', 'Toshiba'];
  const nvmeLines = ['980', '990 EVO', '990 PRO', 'SN580', 'SN770', 'SN850X', 'T500', 'T700', 'KC3000', 'NV3', 'Platinum P41', 'P41 Plus', 'P44 Pro', 'Z440', 'G50', 'MP44', 'Rocket 4', 'A60', 'A440', 'XD70', 'XP6000', 'NM790', 'NM800'];
  let id = 1;
  for (const brand of brands) {
    for (const line of nvmeLines) {
      for (const capacity of [256, 512, 1024, 2048, 4096, 8192]) {
        const gen = capacity >= 2048 ? pick(rng, [4, 5]) : pick(rng, [3, 4, 5]);
        const name = `${brand} ${line} ${capacity >= 1024 ? capacity / 1024 + 'TB' : capacity + 'GB'} NVMe Gen${gen}`;
        const price = roundPrice(capacity * pick(rng, [60, 80, 100, 120, 150, 200]));
        out.push({
          id: `ssd_nvme_${id++}`,
          name, type: 'Storage', price,
          desc: `NVMe M.2 Gen${gen}, ${capacity >= 1024 ? capacity / 1024 + 'TB' : capacity + 'GB'}`,
        });
      }
    }
  }
  const sataLines = ['870 EVO', '870 QVO', 'BX500', 'MX500', 'SA400', 'A400', 'SU630', 'SU650', 'SU750', 'UV500', 'SC300', 'TC10', 'SL100'];
  for (const brand of brands.slice(0, 12)) {
    for (const line of sataLines) {
      for (const capacity of [240, 480, 960, 1920, 3840]) {
        const name = `${brand} ${line} ${capacity >= 1000 ? capacity / 1000 + 'TB' : capacity + 'GB'} SATA SSD`;
        out.push({
          id: `ssd_sata_${id++}`,
          name, type: 'Storage', price: roundPrice(capacity * 40),
          desc: `SATA III 2.5", ${capacity >= 1000 ? capacity / 1000 + 'TB' : capacity + 'GB'}`,
        });
      }
    }
  }
  const hddBrands = ['Seagate', 'Western Digital', 'Toshiba'];
  const hddLines = ['Barracuda', 'IronWolf', 'SkyHawk', 'WD Blue', 'WD Black', 'WD Red', 'WD Purple', 'Gold', 'Ultrastar', 'DT02', 'MG09', 'MG10', 'N300', 'X300'];
  const hddCapacities = [500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 24000, 30000];
  for (const brand of hddBrands) {
    for (const line of hddLines) {
      for (const cap of hddCapacities) {
        const rpm = cap >= 4000 ? pick(rng, [5400, 7200]) : 7200;
        const name = `${brand} ${line} ${cap >= 1000 ? cap / 1000 + 'TB' : cap + 'GB'} ${rpm}rpm`;
        out.push({
          id: `hdd_${id++}`,
          name, type: 'Storage', price: roundPrice(cap * pick(rng, [10, 15, 20, 25, 30, 35, 40])),
          desc: `HDD ${rpm}rpm, ${cap >= 1000 ? cap / 1000 + 'TB' : cap + 'GB'}, SATA III`,
        });
      }
    }
  }
  return out;
}

// ─── PSU ───
function generatePSUs(rng) {
  const out = [];
  const brands = ['Corsair', 'EVGA', 'Seasonic', 'Cooler Master', 'be quiet!', 'Thermaltake', 'FSP', 'SilverStone', 'NZXT', 'Antec', 'Super Flower', 'Lian Li', 'MSI', 'ASUS', 'Gigabyte', 'DeepCool', 'XPG'];
  const wattages = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 1000, 1050, 1100, 1200, 1300, 1500, 1600];
  const ratings = ['80+ White', '80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'];
  const series_map = {
    'Corsair': ['CV', 'CX', 'RM', 'RMx', 'RMx Shift', 'HX', 'AX', 'SF'],
    'EVGA': ['W1', 'GD', 'G5', 'G6', 'G7', 'P2', 'T2'],
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
          if (rating === '80+ Titanium' && watt < 600) continue;
          if (rating === '80+ Platinum' && watt < 400) continue;
          const name = `${brand} ${s} ${watt}W ${rating}`;
          const price = roundPrice(
            rating.includes('Titanium') ? watt * 500 :
            rating.includes('Platinum') ? watt * 400 :
            rating.includes('Gold') ? watt * 300 :
            rating.includes('Bronze') ? watt * 200 : watt * 120
          );
          out.push({
            id: `psu_${id++}`,
            name, type: 'PSU', price, wattage: watt,
            desc: `${watt}W ${rating}, Fully Modular`,
          });
        }
      }
    }
  }
  return out;
}

// ─── Coolers ───
function generateCoolers(rng) {
  const out = [];
  const brands = ['Noctua', 'Cooler Master', 'NZXT', 'Corsair', 'be quiet!', 'DeepCool', 'Thermalright', 'ID-Cooling', 'ARCTIC', 'Lian Li', 'SilverStone', 'MSI', 'ASUS', 'Jonsbo', 'Scythe', 'Thermaltake', 'Phanteks', 'Alphacool'];
  const airLines = ['NH-D15', 'NH-U12S', 'NH-L9i', 'Hyper 212', 'Hyper 620S', 'MA620P', 'Pure Rock 2', 'Dark Rock 4', 'Dark Rock Pro 5', 'Shadow Rock 3', 'AK400', 'AK500', 'AK620', 'Peerless Assassin', 'Phantom Spirit', 'Assassin X', 'Frostflow', 'Freezer 34', 'Freezer A35', 'Fuma 3', 'Mugen 6', 'Grand Macho', 'TRUE Spirit', 'Le Grand Macho', 'Cryorig H7', 'Scythe Mugen'];
  let id = 1;
  for (const brand of brands) {
    for (const line of airLines) {
      const price = roundPrice(randInt(rng, 150000, 2500000));
      const name = `${brand} ${line} (Air Cooler)`;
      out.push({
        id: `cooler_air_${id++}`,
        name, type: 'Cooler', price,
        desc: `Tản nhiệt khí, ${pick(rng, ['120mm', '140mm', '92mm', '80mm'])} quạt`,
      });
    }
  }
  const aioLines = ['Kraken', 'Kraken Elite', 'iCUE H100i', 'iCUE H150i', 'Liquid Freezer', 'Frost Commander', 'LT520', 'LT720', 'MasterLiquid', 'Trio', 'Pure Loop', 'Silent Loop', 'TOUGHLIQUID', 'ROG Ryujin', 'ROG Ryuo', 'Nautilus', 'Klim', 'GA II', 'Trinity', 'Omni'];
  const radiatorSizes = [120, 240, 280, 360, 420, 480];
  for (const brand of brands) {
    for (const line of aioLines) {
      for (const rad of radiatorSizes) {
        const price = roundPrice(randInt(rng, 800000, 12000000));
        const name = `${brand} ${line} ${rad}mm AIO`;
        out.push({
          id: `cooler_aio_${id++}`,
          name, type: 'Cooler', price,
          desc: `Tản nhiệt nước AIO ${rad}mm, ${pick(rng, ['RGB', 'ARGB', 'không LED'])}`,
        });
      }
    }
  }
  return out;
}

// ─── Cases ───
function generateCases(rng) {
  const out = [];
  const brands = ['Corsair', 'NZXT', 'Lian Li', 'Fractal Design', 'Cooler Master', 'Phanteks', 'be quiet!', 'Thermaltake', 'SilverStone', 'DeepCool', 'Jonsbo', 'HYTE', 'Montech', 'Antec', 'MetallicGear', 'BitFenix', 'SAMA', 'darkFlash', 'GameMax', 'Segotep', 'MUSETEX', 'Azza'];
  const formFactors = ['Mini-ITX', 'Micro-ATX', 'Mid Tower', 'Full Tower', 'Super Tower', 'Mini Tower', 'SFF'];
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
  let id = 1;
  for (const brand of brands) {
    const series = caseSeries[brand] || ['Standard', 'Pro', 'Elite', 'Gaming', 'Mesh', 'Airflow'];
    for (const s of series) {
      for (const ff of formFactors) {
        const name = `${brand} ${s} ${ff}`;
        const price = roundPrice(
          ff.includes('Full Tower') || ff.includes('Super Tower') ? randInt(rng, 2000000, 25000000) :
          ff.includes('Mid Tower') ? randInt(rng, 500000, 5500000) :
          randInt(rng, 300000, 3500000)
        );
        out.push({
          id: `case_${id++}`,
          name, type: 'Case', price,
          desc: `${ff}, ${pick(rng, ['Tempered Glass', 'Mesh', 'Solid Panel', 'Dual Chamber'])}, ${pick(rng, ['ATX', 'E-ATX', 'mATX', 'ITX'])}`,
        });
      }
    }
  }
  return out;
}

// ─── Monitors ───
function generateMonitors(rng) {
  const out = [];
  const brands = ['Dell', 'LG', 'Samsung', 'ASUS', 'AOC', 'BenQ', 'ViewSonic', 'Acer', 'MSI', 'Gigabyte', 'HP', 'Lenovo', 'Philips', 'Sony', 'VIOTEK', 'KOORUI', 'Sceptre', 'Innocn', 'Redmi', 'Xiaomi'];
  const monitorSeries = {
    'Dell': ['UltraSharp', 'P Series', 'S Series', 'Alienware', 'Gaming', 'Professional', 'Business'],
    'LG': ['UltraGear', 'UltraFine', 'UltraWide', 'Gram +view', 'MyView', 'Professional', 'Business'],
    'Samsung': ['Odyssey', 'Smart Monitor', 'ViewFinity', 'CRG9', 'G Series', 'Professional', 'Business'],
    'ASUS': ['ROG Swift', 'TUF Gaming', 'ProArt', 'Designo', 'VA', 'Professional', 'Business'],
    'AOC': ['Gaming', 'U Series', 'C Series', 'Agon', 'E Series', '24G2', '27G2', 'Professional'],
  };
  let id = 1;
  const resolutions = ['1920x1080', '2560x1080', '2560x1440', '3440x1440', '3840x1600', '3840x2160', '5120x2160', '5120x2880', '7680x4320'];
  const sizes_inch = [21.5, 23.8, 24, 24.5, 25, 27, 28, 31.5, 32, 34, 38, 40, 42, 43, 48, 49, 54, 55, 57];
  const refreshRates = [60, 75, 100, 120, 144, 165, 175, 200, 240, 360, 480, 540];
  const panelTypes = ['IPS', 'VA', 'TN', 'OLED', 'QLED', 'Mini-LED', 'PLS', 'AHVA'];
  for (const brand of brands) {
    const series = monitorSeries[brand] || ['Standard', 'Pro', 'Ultra', 'Gaming', 'Business', 'Professional'];
    for (const s of series) {
      for (let i = 0; i < 8; i++) {
        const size = pick(rng, sizes_inch);
        const res = pick(rng, resolutions);
        const hz = res.includes('2160') ? pick(rng, refreshRates.slice(0, 5)) : res.includes('1440') ? pick(rng, refreshRates.slice(2, 8)) : pick(rng, refreshRates);
        const panel = pick(rng, panelTypes);
        const name = `${brand} ${s} ${size}" ${res} ${hz}Hz ${panel}`;
        const price = roundPrice(
          res.includes('4320') ? randInt(rng, 30000000, 150000000) :
          res.includes('2160') ? randInt(rng, 6000000, 50000000) :
          res.includes('1440') ? randInt(rng, 3000000, 25000000) :
          randInt(rng, 1500000, 12000000)
        );
        out.push({
          id: `monitor_${id++}`,
          name, type: 'Monitor', price,
          desc: `${size}" ${panel}, ${res}, ${hz}Hz`,
        });
      }
    }
  }
  return out;
}

function main() {
  const rng = mulberry32(20260731);
  const generators = { CPU: generateCPUs, GPU: generateGPUs, RAM: generateRAM, Mainboard: generateMainboards, Storage: generateStorage, PSU: generatePSUs, Cooler: generateCoolers, Case: generateCases, Monitor: generateMonitors };
  const all = [];
  const counts = {};
  for (const [type, fn] of Object.entries(generators)) {
    const items = fn(rng);
    counts[type] = items.length;
    all.push(...items);
  }
  console.log('Generated counts:');
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
  console.log(`TOTAL: ${all.length}`);

  for (const [type, count] of Object.entries(counts)) {
    if (count < MIN_PER_TYPE) {
      console.error(`WARNING: ${type} only has ${count} (< ${MIN_PER_TYPE})`);
    }
  }

  const outputPath = path.join(__dirname, '..', 'data', 'componentsData.json');
  fs.writeFileSync(outputPath, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`\nWritten to: ${outputPath}`);
}

main();
