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

function analyzeCareer(careerName: string) {
  const name = careerName.toLowerCase().trim();
  for (const [key, value] of Object.entries(CAREER_BUILDS)) {
    if (name.includes(key) || key.includes(name)) return { ...value, career: careerName };
  }
  const words = name.split(/\s+/);
  for (const [key, value] of Object.entries(CAREER_BUILDS)) {
    for (const w of words) {
      if (w.length > 2 && key.includes(w)) return { ...value, career: careerName };
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

async function callGroq(careerName: string): Promise<any | null> {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) return null;
  try {
    const r = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia tư vấn cấu hình PC. Trả về JSON.' },
          { role: 'user', content: `Người dùng có ước mơ nghề nghiệp: "${careerName}". Hãy gợi ý cấu hình PC phù hợp. Trả về JSON: {"career":"...","explanation":"...","build":[{"id":"...","name":"...","type":"CPU/RAM/GPU/...","price":0,"reason":"..."}],"totalPrice":0,"tips":"..."}` }
        ],
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const { career, customDream } = await request.json();
    const careerName = career || customDream;
    if (!careerName) return NextResponse.json({ error: 'Vui lòng nhập ước mơ nghề nghiệp' }, { status: 400 });

    let result = await callGroq(careerName);
    if (!result) {
      const localResult = analyzeCareer(careerName);
      result = localResult || defaultBuild(careerName);
    }

    const enriched = result.build.map((item: BuildItem) => ({
      ...item,
      image: getComponentImage(item.type),
    }));

    return NextResponse.json({ ...result, build: enriched });
  } catch (e: any) {
    return NextResponse.json({ error: 'Không thể gợi ý cấu hình. Vui lòng thử lại.' }, { status: 500 });
  }
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
