import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface BuildItem {
  id: string; name: string; type: string; price: number; reason: string;
}

const CAREER_BUILDS: Record<string, { explanation: string; build: BuildItem[]; totalPrice: number; tips: string }> = {
  'ai engineer': {
    explanation: 'AI Engineer cần cấu hình mạnh về GPU để train model AI/deep learning. RAM lớn để xử lý dataset. CPU nhiều nhân cho data preprocessing.',
    build: [
      { id: 'cpu_r9_7950x', name: 'AMD Ryzen 9 7950X', type: 'CPU', price: 14975000, reason: '16 nhân cho training AI' },
      { id: 'gpu_rtx_4090', name: 'NVIDIA RTX 4090 24GB', type: 'GPU', price: 40000000, reason: 'GPU mạnh nhất cho deep learning' },
      { id: 'ram_d5_64G', name: '64GB (2x32GB) DDR5-6400', type: 'RAM', price: 5500000, reason: 'RAM lớn cho dataset' },
      { id: 'storage_2tb_ssd', name: '2TB NVMe Gen4', type: 'Storage', price: 3250000, reason: 'Ổ cứng nhanh cho dữ liệu' },
      { id: 'psu_1000w', name: '1000W 80+ Platinum', type: 'PSU', price: 4500000, reason: 'Nguồn khỏe cho GPU' },
      { id: 'mb_b650_amd', name: 'B650 Tomahawk WiFi (AM5)', type: 'Mainboard', price: 5000000, reason: 'Bo mạch hỗ trợ PCIe 5.0' },
      { id: 'cooler_aio', name: 'Tản Nhiệt Nước AIO 360mm', type: 'Cooler', price: 3500000, reason: 'Tản nhiệt cho CPU mạnh' },
    ],
    totalPrice: 76275000,
    tips: 'Dùng thêm RAM 64GB+ nếu làm việc với dataset lớn. Cân nhắc thêm SSD riêng cho OS và data.',
  },
  'it engineer': {
    explanation: 'Kỹ sư IT cần cấu hình mạnh để xử lý công việc lập trình, quản trị hệ thống, ảo hóa và chạy nhiều máy ảo. CPU đa nhân, RAM lớn là ưu tiên hàng đầu.',
    build: [
      { id: 'cpu_i7_13700k', name: 'Intel Core i7-13700K', type: 'CPU', price: 9500000, reason: '16 nhân cho ảo hóa và compile' },
      { id: 'ram_d5_64G', name: '64GB (2x32GB) DDR5-6400', type: 'RAM', price: 5500000, reason: 'RAM 64GB cho nhiều máy ảo + container' },
      { id: 'gpu_rtx_4060', name: 'NVIDIA RTX 4060 8GB', type: 'GPU', price: 8500000, reason: 'Đủ cho đa màn hình + đồ họa cơ bản' },
      { id: 'storage_2tb_ssd', name: '2TB NVMe Gen4', type: 'Storage', price: 3250000, reason: 'SSD dung lượng lớn cho nhiều OS' },
      { id: 'psu_750w', name: '750W 80+ Gold Fully Modular', type: 'PSU', price: 2500000, reason: 'Nguồn ổn định 24/7' },
      { id: 'mb_z790', name: 'Z790 Aorus Master (LGA1700)', type: 'Mainboard', price: 9500000, reason: 'Bo mạch cao cấp hỗ trợ đầy đủ' },
      { id: 'cooler_aio', name: 'Tản Nhiệt Nước AIO 360mm', type: 'Cooler', price: 3500000, reason: 'Tản nhiệt cho CPU chạy liên tục' },
    ],
    totalPrice: 42250000,
    tips: 'Đầu tư 2-3 màn hình để tăng năng suất. Nên có UPS để bảo vệ thiết bị. SSD riêng cho từng hệ điều hành nếu chạy đa OS.',
  },
  '3d designer': {
    explanation: '3D Designer cần GPU mạnh để render đồ họa, CPU đa nhân, RAM dung lượng lớn.',
    build: [
      { id: 'cpu_i9_14900k', name: 'Intel Core i9-14900K', type: 'CPU', price: 13750000, reason: '24 nhân cho render nhanh' },
      { id: 'gpu_rtx_4080', name: 'NVIDIA RTX 4080 16GB', type: 'GPU', price: 28000000, reason: 'GPU cao cấp cho 3D rendering' },
      { id: 'ram_d5_32G', name: '32GB (2x16GB) DDR5-6000', type: 'RAM', price: 2750000, reason: 'RAM 32GB đủ cho đa số dự án' },
      { id: 'storage_1tb_nvme_gen4', name: '1TB NVMe Gen4', type: 'Storage', price: 1800000, reason: 'Load project nhanh' },
      { id: 'storage_4tb_hdd', name: '4TB HDD 7200rpm', type: 'Storage', price: 1500000, reason: 'Lưu trữ project lớn' },
      { id: 'psu_850w', name: '850W 80+ Gold Fully Modular', type: 'PSU', price: 3000000, reason: 'Nguồn ổn định' },
      { id: 'mb_z790', name: 'Z790 Aorus Master (LGA1700)', type: 'Mainboard', price: 9500000, reason: 'Hỗ trợ ép xung' },
      { id: 'cooler_aio', name: 'Tản Nhiệt Nước AIO 360mm', type: 'Cooler', price: 3500000, reason: 'Giữ CPU mát khi render' },
    ],
    totalPrice: 63800000,
    tips: 'Màn hình nên chọn loại 27" 2K+ có độ phủ màu cao (AdobeRGB >90%). Thêm RAM nếu render phức tạp.',
  },
  'video editor': {
    explanation: 'Video Editor cần CPU mạnh để render, GPU hỗ trợ codec, RAM dung lượng lớn.',
    build: [
      { id: 'cpu_i7_13700k', name: 'Intel Core i7-13700K', type: 'CPU', price: 9500000, reason: '16 nhân cho render mượt' },
      { id: 'gpu_rtx_4070', name: 'NVIDIA RTX 4070 12GB', type: 'GPU', price: 14000000, reason: 'Hỗ trợ NVENC codec' },
      { id: 'ram_d5_32G', name: '32GB (2x16GB) DDR5-6000', type: 'RAM', price: 2750000, reason: 'RAM 32GB đủ cho timeline 4K' },
      { id: 'storage_2tb_ssd', name: '2TB NVMe Gen4', type: 'Storage', price: 3250000, reason: 'Load video nhanh' },
      { id: 'storage_4tb_hdd', name: '4TB HDD 7200rpm', type: 'Storage', price: 1500000, reason: 'Lưu footage' },
      { id: 'psu_750w', name: '750W 80+ Gold Fully Modular', type: 'PSU', price: 2500000, reason: 'Nguồn ổn định' },
      { id: 'mb_b660m', name: 'B660M Pro (Intel LGA1700)', type: 'Mainboard', price: 3000000, reason: 'Bo mạch ổn định' },
    ],
    totalPrice: 36500000,
    tips: 'Ưu tiên màn hình 4K với độ phủ màu cao. Thêm RAM nếu edit video 8K hoặc After Effects.',
  },
  'streamer': {
    explanation: 'Streamer/Gamer cần GPU mạnh cho game, CPU đủ nhân cho stream + game cùng lúc.',
    build: [
      { id: 'cpu_r7_7800x3d', name: 'AMD Ryzen 7 7800X3D', type: 'CPU', price: 10500000, reason: 'CPU gaming tốt nhất' },
      { id: 'gpu_rtx_4070', name: 'NVIDIA RTX 4070 12GB', type: 'GPU', price: 14000000, reason: 'Chơi game + stream mượt' },
      { id: 'ram_d5_32G', name: '32GB (2x16GB) DDR5-6000', type: 'RAM', price: 2750000, reason: 'Đủ cho game + stream' },
      { id: 'storage_1tb_nvme_gen4', name: '1TB NVMe Gen4', type: 'Storage', price: 1800000, reason: 'Nạp game nhanh' },
      { id: 'psu_750w', name: '750W 80+ Gold Fully Modular', type: 'PSU', price: 2500000, reason: 'Nguồn ổn định' },
      { id: 'mb_b650_amd', name: 'B650 Tomahawk WiFi (AM5)', type: 'Mainboard', price: 5000000, reason: 'Nền tảng AM5' },
      { id: 'cooler_air', name: 'Tản Nhiệt Khí Tiêu Chuẩn', type: 'Cooler', price: 350000, reason: 'Tản nhiệt cơ bản' },
    ],
    totalPrice: 36900000,
    tips: 'Đầu tư webcam + microphone chất lượng. Màn hình 27" 1440p 165Hz+. Thêm capture card nếu stream console.',
  },
  'coder': {
    explanation: 'Lập trình viên cần CPU mạnh để compile, RAM lớn cho IDE + container, SSD nhanh.',
    build: [
      { id: 'cpu_i5_13600k', name: 'Intel Core i5-13600K', type: 'CPU', price: 7000000, reason: '14 nhân cho compile nhanh' },
      { id: 'gpu_gtx_1650', name: 'NVIDIA GTX 1650 4GB', type: 'GPU', price: 2800000, reason: 'Đủ cho đa màn hình' },
      { id: 'ram_d5_32G', name: '32GB (2x16GB) DDR5-6000', type: 'RAM', price: 2750000, reason: 'RAM lớn cho IDE + Docker' },
      { id: 'storage_1tb_nvme_gen4', name: '1TB NVMe Gen4', type: 'Storage', price: 1800000, reason: 'SSD siêu nhanh' },
      { id: 'psu_500w', name: '500W 80+ Bronze', type: 'PSU', price: 900000, reason: 'Nguồn tiết kiệm' },
      { id: 'mb_b660m', name: 'B660M Pro (Intel LGA1700)', type: 'Mainboard', price: 3000000, reason: 'Bo mạch ổn định' },
    ],
    totalPrice: 18250000,
    tips: 'Đầu tư 2 màn hình để tăng năng suất. Bàn phím cơ + chuột ergonomic. RAM 32GB+ nếu dùng nhiều container.',
  },
  'office worker': {
    explanation: 'Dân văn phòng cần máy ổn định, tiết kiệm điện, đủ dùng cho Office + duyệt web.',
    build: [
      { id: 'cpu_i3_12100', name: 'Intel Core i3-12100F', type: 'CPU', price: 2250000, reason: 'CPU tiết kiệm, đủ mạnh' },
      { id: 'ram_d4_16G', name: '16GB (2x8GB) DDR4-3200', type: 'RAM', price: 1000000, reason: 'RAM 16GB đủ văn phòng' },
      { id: 'storage_500_ssd', name: '500GB NVMe Gen3', type: 'Storage', price: 700000, reason: 'SSD nhanh, khởi động mượt' },
      { id: 'psu_350w', name: '350W Power Supply', type: 'PSU', price: 350000, reason: 'Nguồn tiết kiệm' },
      { id: 'mb_h510m_intel1200', name: 'H510M K (Intel LGA1200)', type: 'Mainboard', price: 1200000, reason: 'Bo mạch giá rẻ' },
    ],
    totalPrice: 5500000,
    tips: 'Thêm màn hình 24" IPS để bảo vệ mắt. Cân nhắc thêm SSD 500GB nếu lưu nhiều tài liệu.',
  },
};

const MAC_BUILDS: Record<string, { explanation: string; model: string; build: BuildItem[]; totalPrice: number; tips: string }> = {
  'coder': {
    explanation: 'MacBook Pro với chip Apple Silicon là lựa chọn tuyệt vời cho lập trình viên nhờ hiệu năng vượt trội, pin lâu và hệ sinh thái UNIX.',
    model: 'MacBook Pro 14" M4 Pro',
    build: [
      { id: 'mac_m4pro_cpu', name: 'Apple M4 Pro (12 CPU, 18 GPU)', type: 'CPU', price: 0, reason: 'Chip Apple Silicon mạnh nhất cho compile và đa nhiệm' },
      { id: 'mac_m4pro_ram', name: '24GB Unified Memory', type: 'RAM', price: 0, reason: 'Bộ nhớ thống nhất đủ cho IDE, Docker, container' },
      { id: 'mac_m4pro_ssd', name: '512GB SSD', type: 'Storage', price: 0, reason: 'SSD siêu nhanh tích hợp' },
    ],
    totalPrice: 39990000,
    tips: 'Nếu cần nhiều RAM hơn, nâng lên 36GB hoặc 48GB. Màn hình 14" Liquid Retina XDR tuyệt đẹp cho coding.',
  },
  'video editor': {
    explanation: 'Mac Studio với M4 Max hoặc MacBook Pro Pro là lựa chọn hàng đầu cho video editor nhờ tối ưu hóa phần mềm Final Cut Pro.',
    model: 'Mac Studio M4 Max',
    build: [
      { id: 'mac_m4max_cpu', name: 'Apple M4 Max (16 CPU, 40 GPU)', type: 'CPU', price: 0, reason: 'Chip mạnh nhất cho render video 8K' },
      { id: 'mac_m4max_ram', name: '64GB Unified Memory', type: 'RAM', price: 0, reason: 'RAM lớn cho timeline phức tạp và After Effects' },
      { id: 'mac_m4max_ssd', name: '1TB SSD', type: 'Storage', price: 0, reason: 'SSD nhanh cho dự án video' },
    ],
    totalPrice: 64990000,
    tips: 'Kết hợp với màn hình Pro Display XDR hoặc Studio Display. Nâng SSD lên 2TB nếu làm việc với nhiều dự án 4K/8K.',
  },
  'office worker': {
    explanation: 'MacBook Air M4 là lựa chọn hoàn hảo cho dân văn phòng và học sinh: siêu nhẹ, pin cả ngày, đủ mạnh cho mọi tác vụ.',
    model: 'MacBook Air 13" M4',
    build: [
      { id: 'mac_m4_cpu', name: 'Apple M4 (8 CPU, 10 GPU)', type: 'CPU', price: 0, reason: 'Chip tiết kiệm điện, đủ mạnh cho Office và web' },
      { id: 'mac_m4_ram', name: '16GB Unified Memory', type: 'RAM', price: 0, reason: 'RAM 16GB đủ đa nhiệm văn phòng' },
      { id: 'mac_m4_ssd', name: '256GB SSD', type: 'Storage', price: 0, reason: 'SSD nhanh, tiết kiệm điện' },
    ],
    totalPrice: 21990000,
    tips: 'MacBook Air cực kỳ phù hợp cho sinh viên nhờ pin 18 tiếng. Nâng lên 512GB nếu lưu nhiều tài liệu.',
  },
};

const SPELL_CORRECTIONS: Record<string, string> = {
  'ky thuat vien': 'kỹ thuật viên', 'ky su': 'kỹ sư', 'lap trinh': 'lập trình',
  'thiet ke': 'thiết kế', 'do hoa': 'đồ họa', 'lam phim': 'làm phim',
  'hoc sinh': 'học sinh', 'sinh vien': 'sinh viên', 'van phong': 'văn phòng',
  'nhan vien': 'nhân viên', 'quan tri': 'quản trị', 'he thong': 'hệ thống',
  'may tinh': 'máy tính', 'game thu': 'game thủ', 'ai eng': 'ai engineer',
  'machine learning': 'machine learning', 'deep learning': 'deep learning',
  'data scientist': 'data scientist', 'web dev': 'web developer',
};

function spellCheck(text: string): string {
  const lower = text.toLowerCase().trim();
  // Exact match
  if (SPELL_CORRECTIONS[lower]) return SPELL_CORRECTIONS[lower];
  // Word-by-word replacement
  const words = lower.split(/\s+/);
  const corrected = words.map(w => {
    // Check exact word
    if (SPELL_CORRECTIONS[w]) return SPELL_CORRECTIONS[w];
    // Check with simple edit distance
    for (const [key, val] of Object.entries(SPELL_CORRECTIONS)) {
      if (key.includes(w) || w.includes(key)) return val;
      const dist = levenshtein(w, key);
      if (dist <= 2) return val;
    }
    return w;
  });
  return corrected.join(' ');
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const KEYWORD_MAP: Record<string, string> = {
  'it engineer': 'it engineer', 'it': 'it engineer', 'ky su it': 'it engineer', 'kỹ sư it': 'it engineer',
  'it support': 'it engineer', 'system admin': 'it engineer', 'quan tri he thong': 'it engineer',
  'quản trị hệ thống': 'it engineer', 'network engineer': 'it engineer', 'ky thuat vien may tinh': 'it engineer',
  'kỹ thuật viên máy tính': 'it engineer', 'ky su cong nghe thong tin': 'it engineer',
  'kỹ sư công nghệ thông tin': 'it engineer', 'software engineer': 'coder', 'ky su phan mem': 'coder', 'kỹ sư phần mềm': 'coder',
  'developer': 'coder', 'lap trinh vien': 'coder', 'lập trình viên': 'coder',
  'web developer': 'coder', 'programmer': 'coder', 'data scientist': 'ai engineer',
  'machine learning': 'ai engineer', 'deep learning': 'ai engineer', 'ai': 'ai engineer',
  'graphic designer': '3d designer', 'thiet ke do hoa': '3d designer', 'thiết kế đồ họa': '3d designer',
  'game developer': '3d designer', 'game designer': '3d designer', 'lam phim': 'video editor',
  'làm phim': 'video editor', 'content creator': 'video editor', 'youtuber': 'streamer',
  'gamer': 'streamer', 'game thủ': 'streamer', 'game thu': 'streamer',
  'hoc sinh': 'office worker', 'học sinh': 'office worker', 'sinh vien': 'office worker',
  'sinh viên': 'office worker', 'van phong': 'office worker', 'văn phòng': 'office worker',
  'nhan vien': 'office worker', 'nhân viên': 'office worker',
  'mac': '', 'macbook': '', 'apple': '', // Mac prefix → empty for separate handling
}

function analyzeCareer(careerName: string) {
  const name = careerName.toLowerCase().trim();

  // Exact match first
  for (const [key, value] of Object.entries(CAREER_BUILDS)) {
    if (name === key || name.includes(key) || key.includes(name)) return { ...value, career: careerName };
  }

  // Keyword map
  for (const [kw, mapped] of Object.entries(KEYWORD_MAP)) {
    if (name.includes(kw) && mapped) {
      const build = CAREER_BUILDS[mapped];
      if (build) return { ...build, career: careerName };
    }
  }

  // Word-by-word matching
  const words = name.split(/\s+/);
  for (const [key, value] of Object.entries(CAREER_BUILDS)) {
    let matchedWords = 0;
    for (const w of words) {
      if (w.length > 2 && (key.includes(w) || w.includes(key))) matchedWords++;
    }
    if (matchedWords >= 1) return { ...value, career: careerName };
  }

  return null;
}

function analyzeMac(careerName: string) {
  const name = careerName.toLowerCase().trim();
  // Check if user explicitly wants Mac
  const wantsMac = name.includes('mac') || name.includes('apple');
  const mapped = wantsMac ? KEYWORD_MAP[name.split(/\s+/).find((w: string) => !['mac', 'apple', 'macbook'].includes(w)) || ''] || '' : '';

  for (const [key, value] of Object.entries(MAC_BUILDS)) {
    if (name.includes(key) || key.includes(name) || (mapped && key === mapped)) {
      return { ...value, career: careerName, isMac: true };
    }
  }
  return null;
}

function defaultBuild(careerName: string) {
  return {
    career: careerName,
    explanation: `Cấu hình PC đa năng phù hợp với "${careerName}". Đây là cấu hình cân bằng giữa hiệu năng và giá cả, phù hợp cho đa số nhu cầu.`,
    build: [
      { id: 'cpu_r5_5600', name: 'AMD Ryzen 5 5600', type: 'CPU', price: 1800000, reason: 'CPU 6 nhân đa năng' },
      { id: 'gpu_gtx_1650', name: 'NVIDIA GTX 1650 4GB', type: 'GPU', price: 2800000, reason: 'Card đồ họa cơ bản' },
      { id: 'ram_d4_16G', name: '16GB (2x8GB) DDR4-3200', type: 'RAM', price: 1000000, reason: 'RAM 16GB tiêu chuẩn' },
      { id: 'storage_500_ssd', name: '500GB NVMe Gen3', type: 'Storage', price: 700000, reason: 'SSD khởi động nhanh' },
      { id: 'psu_500w', name: '500W 80+ Bronze', type: 'PSU', price: 900000, reason: 'Nguồn ổn định' },
      { id: 'mb_b450_amd', name: 'B450M DS3H (AMD AM4)', type: 'Mainboard', price: 1000000, reason: 'Bo mạch AM4 giá tốt' },
    ],
    totalPrice: 8200000,
    tips: 'Bạn có thể nâng cấp RAM lên 32GB và thêm SSD dung lượng lớn nếu cần. Card đồ họa có thể nâng cấp sau.',
  };
}

function defaultMacBuild(careerName: string) {
  return {
    career: careerName,
    model: 'MacBook Air M4',
    isMac: true,
    explanation: `MacBook Air M4 là lựa chọn tuyệt vời cho "${careerName}" với hiệu năng vượt trội, pin lâu và độ bền cao.`,
    build: [
      { id: 'mac_m4_base', name: 'Apple M4 (8 CPU, 10 GPU)', type: 'CPU', price: 0, reason: 'Chip Apple Silicon mạnh mẽ, tiết kiệm điện' },
      { id: 'mac_m4_ram', name: '16GB Unified Memory', type: 'RAM', price: 0, reason: 'Bộ nhớ thống nhất đủ đa nhiệm' },
      { id: 'mac_m4_ssd', name: '256GB SSD', type: 'Storage', price: 0, reason: 'SSD nhanh tích hợp' },
    ],
    totalPrice: 21990000,
    tips: 'MacBook Air cực kỳ phù hợp cho công việc văn phòng và học tập. Pin lên đến 18 tiếng.',
  };
}

async function callGroq(careerName: string, customCondition?: string): Promise<any | null> {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) return null;
  try {
    let userContent = `Người dùng có ước mơ nghề nghiệp: "${careerName}".\n\nHãy nghiên cứu và phân tích:\n1. Ngành nghề này cần những kỹ năng gì?\n2. Phần mềm/tool cụ thể nào sẽ được dùng?\n3. Cấu hình tối thiểu và khuyến nghị cho từng phần mềm đó.\n4. Linh kiện nào quan trọng nhất cho công việc này?\n\nSau đó đề xuất cấu hình PC PHÙ HỢP NHẤT với lý do chi tiết cho từng linh kiện.`;

    if (customCondition) {
      userContent += `\n\nNGƯỜI DÙNG CÓ YÊU CẦU THÊM: "${customCondition}".\nHãy điều chỉnh cấu hình dựa trên yêu cầu này. Nếu yêu cầu thêm ngân sách thì chọn linh kiện phù hợp. Nếu yêu cầu mục đích cụ thể thì ưu tiên linh kiện cho mục đích đó.`;
    }

    userContent += `\n\nTrả về JSON CHÍNH XÁC:\n{"career":"Tên nghề nghiệp","explanation":"Phân tích chi tiết về yêu cầu ngành nghề, phần mềm sử dụng, và lý do tổng quan cho cấu hình này","build":[{"id":"unique_id","name":"Tên linh kiện đầy đủ","type":"CPU/RAM/GPU/Mainboard/Storage/PSU/Cooler","price":1234567,"reason":"Lý do CHI TIẾT vì sao chọn linh kiện này cho ngành nghề cụ thể này"}],"totalPrice":1234567,"tips":"Lời khuyên bổ sung về nâng cấp, màn hình, phụ kiện..."}`;

    const r = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia tư vấn cấu hình PC với kiến thức sâu rộng về phần cứng. Nghiên cứu kỹ yêu cầu của từng ngành nghề, sau đó đề xuất cấu hình PC chi tiết. LUÔN trả về JSON hợp lệ, không markdown.' },
          { role: 'user', content: userContent }
        ],
        temperature: 0.4,
        max_tokens: 4096,
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const { career, customDream, customCondition, preferMac } = await request.json();
    let careerName = career || customDream;
    if (!careerName) return NextResponse.json({ error: 'Vui lòng nhập ước mơ nghề nghiệp' }, { status: 400 });

    // Spell check
    const corrected = spellCheck(careerName);
    if (corrected !== careerName.toLowerCase().trim()) careerName = corrected;

    const wantsMac = preferMac || careerName.toLowerCase().includes('mac') || careerName.toLowerCase().includes('apple');

    let result = null;
    let macResult = null;

    // If user wants Mac, try Mac analysis first
    if (wantsMac) {
      macResult = analyzeMac(careerName);
      if (!macResult) {
        const groqResult = await callGroq(careerName + ' (Mac/Apple)', customCondition);
        if (groqResult) macResult = { ...groqResult, isMac: true };
      }
      if (!macResult) macResult = defaultMacBuild(careerName);
    }

    // Get Windows PC build
    result = await callGroq(careerName, customCondition);
    if (!result) {
      result = analyzeCareer(careerName) || defaultBuild(careerName);
    }

    const enrich = (items: BuildItem[]) => items.map((item: BuildItem) => ({
      ...item, image: getComponentImage(item.type),
    }));

    const response: any = { ...result, build: enrich(result.build) };

    if (macResult) {
      response.macBuild = macResult.isMac ? {
        ...macResult,
        build: enrich(macResult.build || []),
      } : null;
    }

    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json({ error: 'Không thể gợi ý cấu hình. Vui lòng thử lại.' }, { status: 500 });
  }
}

const GEARVN_LINKS: Record<string, string> = {
  CPU: 'https://gearvn.com/collections/cpu-bo-vi-xu-ly',
  GPU: 'https://gearvn.com/collections/vga-card-man-hinh',
  RAM: 'https://gearvn.com/collections/ram-desktop',
  Mainboard: 'https://gearvn.com/collections/mainboard-bo-mach-chu',
  Storage: 'https://gearvn.com/collections/ssd-o-cung-ran',
  PSU: 'https://gearvn.com/collections/psu-nguon-may-tinh',
  Cooler: 'https://gearvn.com/collections/tan-nhiet',
  Case: 'https://gearvn.com/collections/case-vo-may-tinh',
  Monitor: 'https://gearvn.com/collections/man-hinh',
};

function getGearVnLink(item: BuildItem): string {
  const name = (item.name || '').toLowerCase();
  // Try to find specific product link via search
  if (name.includes('rtx 5090')) return 'https://gearvn.com/products/nvidia-geforce-rtx-5090';
  if (name.includes('rtx 5080')) return 'https://gearvn.com/products/nvidia-geforce-rtx-5080';
  if (name.includes('rtx 4090')) return 'https://gearvn.com/products/nvidia-geforce-rtx-4090';
  if (name.includes('rtx 4080')) return 'https://gearvn.com/products/nvidia-geforce-rtx-4080';
  if (name.includes('rtx 4070')) return 'https://gearvn.com/products/nvidia-geforce-rtx-4070';
  if (name.includes('rtx 4060')) return 'https://gearvn.com/products/nvidia-geforce-rtx-4060';
  if (name.includes('rtx 3060')) return 'https://gearvn.com/products/nvidia-geforce-rtx-3060';
  if (name.includes('rx 7900')) return 'https://gearvn.com/products/amd-radeon-rx-7900xtx';
  if (name.includes('rx 7800')) return 'https://gearvn.com/products/amd-radeon-rx-7800xt';
  if (name.includes('rx 7700')) return 'https://gearvn.com/products/amd-radeon-rx-7700xt';
  if (name.includes('gtx 1650') || name.includes('gtx1650')) return 'https://gearvn.com/products/nvidia-geforce-gtx-1650';
  if (name.includes('core i9') || name.includes('i9-')) return 'https://gearvn.com/products/intel-core-i9-14900k';
  if (name.includes('core i7') || name.includes('i7-')) return 'https://gearvn.com/products/intel-core-i7-14700k';
  if (name.includes('core i5') || name.includes('i5-')) return 'https://gearvn.com/products/intel-core-i5-14600k';
  if (name.includes('core i3') || name.includes('i3-')) return 'https://gearvn.com/products/intel-core-i3-14100f';
  if (name.includes('ryzen 9') || name.includes('r9 ')) return 'https://gearvn.com/products/amd-ryzen-9-7950x';
  if (name.includes('ryzen 7') || name.includes('r7 ')) return 'https://gearvn.com/products/amd-ryzen-7-7800x3d';
  if (name.includes('ryzen 5') || name.includes('r5 ')) return 'https://gearvn.com/products/amd-ryzen-5-7600x';
  if (name.includes('ddr5') || name.includes('ddr5')) return 'https://gearvn.com/collections/ram-desktop-ddr5';
  if (name.includes('ddr4') || name.includes('ddr4')) return 'https://gearvn.com/collections/ram-desktop-ddr4';
  if (name.includes('nvme') || name.includes('ssd')) return 'https://gearvn.com/collections/ssd-nvme';
  if (name.includes('macbook') || name.includes('mac book')) return 'https://gearvn.com/collections/macbook';
  if (name.includes('mac studio')) return 'https://gearvn.com/collections/mac-studio';
  if (name.includes('macbook air')) return 'https://gearvn.com/collections/macbook-air';
  if (name.includes('macbook pro')) return 'https://gearvn.com/collections/macbook-pro';
  // Fallback by type
  return GEARVN_LINKS[item.type] || 'https://gearvn.com';
}

function getComponentImage(type: string): string {
  const map: Record<string, string> = {
    CPU: '/images/cpu_amd_front.png', GPU: '/images/gpu_rtx_5090_front.png',
    RAM: '/images/ddr5_ram_front.png', Storage: '/images/nvme_ssd_front.png',
    PSU: '/images/psu_front.png', Cooler: '/images/air_cooler_front.png',
    Mainboard: '/images/mainboard_front.png',
  };
  return map[type] || '/images/mainboard_front.png';
}
