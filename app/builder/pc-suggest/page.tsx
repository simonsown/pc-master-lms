'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Loader2, Store, ExternalLink, Sparkles, Monitor, 
  ChevronDown, ChevronUp, Search, Filter, X, Check, Award, Cpu, 
  HardDrive, Zap, ShieldAlert, Laptop, Star
} from 'lucide-react';

export interface JobSuitability {
  job: string;
  match: number; // 0 to 100
  reason: string;
}

export interface PcItem {
  id: string;
  name: string;
  type: string; // 'Laptop Gaming' | 'Ultrabook' | 'MacBook' | 'Desktop Gaming' | 'Workstation AI' | 'PC Mini ITX' | 'PC Văn Phòng'
  specs: string;
  specs_detail: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    screenOrCase: string;
    psuOrBattery: string;
    cooling?: string;
  };
  price: number;
  rating: number;
  image: string;
  link: string;
  reason: string;
  useCases: string[];
  jobSuitability: JobSuitability[];
  pros: string[];
  cons: string[];
  stores: { name: string; price: number; url: string }[];
}

const PREBUILT_PCS: PcItem[] = [
  {
    id: 'rog-g14-2026',
    name: 'ASUS ROG Zephyrus G14 (2026)',
    type: 'Laptop Gaming',
    specs: 'AMD Ryzen 9 8945HS, RTX 4070 8GB, 32GB DDR5, 1TB NVMe, 14" OLED 3K 120Hz',
    specs_detail: {
      cpu: 'AMD Ryzen 9 8945HS (8 nhân / 16 luồng, up to 5.2GHz)',
      gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)',
      ram: '32GB LPDDR5X 6400MHz',
      storage: '1TB SSD M.2 NVMe PCIe 4.0',
      screenOrCase: '14" 3K (2880 x 1800) OLED 120Hz, 100% DCI-P3',
      psuOrBattery: 'Pin 73Wh, sạc Type-C 100W / Adapter 240W',
      cooling: 'Tản nhiệt buồng hơi Vapor Chamber + Keo tản nhiệt kim loại lỏng',
    },
    price: 46990000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Chiếc laptop gaming 14 inch đỉnh cao nhất: Vừa mỏng nhẹ 1.5kg, vừa sở hữu màn OLED 3K siêu nét và RTX 4070 cân mượt mọi tác vụ.',
    useCases: ['coder', 'design', 'gaming', 'video', 'ai'],
    jobSuitability: [
      { job: 'Lập trình Web/Mobile & Backend', match: 98, reason: 'RAM 32GB chạy mượt nhiều container Docker, IDE Heavy và Mobile Emulators cùng lúc.' },
      { job: 'Thiết kế Đồ họa 2D/3D & CAD', match: 96, reason: 'Màn hình OLED chuẩn màu DCI-P3 100%, Delta E < 1 lý tưởng cho designer đồ họa chuyên nghiệp.' },
      { job: 'Dựng phim 4K & Render VFX', match: 92, reason: 'VRAM 8GB + Nhân CUDA tăng tốc render Premiere, DaVinci Resolve và After Effects mượt mà.' },
      { job: 'Lập trình AI & Data Science', match: 88, reason: 'NPU Ryzen AI tích hợp + Tensor Cores RTX giúp chạy mượt local LLM và AI model vừa và nhỏ.' },
      { job: 'Esports & Gaming AAA', match: 95, reason: 'Cân mượt các tựa game AAA ở độ phân giải 2K 100+ FPS, tần số quét 120Hz mượt mắt.' },
    ],
    pros: ['Thiết kế vỏ nhôm CNC cực kỳ sang trọng', 'Màn hình OLED 3K màu sắc siêu rực rỡ', 'Trọng lượng nhẹ chỉ 1.5kg dễ mang đi lại'],
    cons: ['Giá thành thuộc phân khúc cao cấp', 'Nâng cấp RAM bị giới hạn do hàn onboard'],
    stores: [
      { name: 'GearVN', price: 46990000, url: 'https://gearvn.com' },
      { name: 'Phong Vũ', price: 47290000, url: 'https://phongvu.vn' },
      { name: 'CellphoneS', price: 46850000, url: 'https://cellphones.com.vn' },
    ],
  },
  {
    id: 'macbook-pro-m4-pro',
    name: 'MacBook Pro 16" M4 Pro',
    type: 'MacBook',
    specs: 'Apple M4 Pro (14 CPU/20 GPU), 36GB Unified RAM, 1TB SSD, 16.2" Liquid Retina XDR',
    specs_detail: {
      cpu: 'Apple M4 Pro (14 nhân CPU: 10 nhân hiệu năng + 4 nhân tiết kiệm điện)',
      gpu: '20 nhân GPU tích hợp với Hardware Ray Tracing',
      ram: '36GB Unified Memory (Băng thông 273GB/s)',
      storage: '1TB SSD NVMe siêu tốc (Đọc 7400MB/s)',
      screenOrCase: '16.2" Liquid Retina XDR (3456 x 2234), ProMotion 120Hz, 1600 nits Peak',
      psuOrBattery: 'Pin 100Wh - Thời lượng dùng liên tục lên đến 22 giờ',
      cooling: 'Hệ thống quạt tản nhiệt kép yên tĩnh tuyệt đối',
    },
    price: 64990000,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    link: 'https://gearvn.com/collections/macbook-pro',
    reason: 'Trạm làm việc di động mạnh mẽ nhất thế giới cho Developer và Creator. Thời lượng pin 22 tiếng vô địch.',
    useCases: ['coder', 'design', 'video', 'ai', 'office'],
    jobSuitability: [
      { job: 'Lập trình iOS/macOS, Web & Fullstack', match: 99, reason: 'Compiler Xcode và Rust/Go chạy nhanh tức thì, 36GB RAM Unified cho phép bật hàng chục project cùng lúc.' },
      { job: 'Dựng video 8K & Biên tập Âm thanh', match: 98, reason: 'Media Engine chuyên dụng mã hóa ProRes 8K phần cứng không hề giật lag hay nóng máy.' },
      { job: 'Lập trình AI / Machine Learning', match: 94, reason: '36GB RAM dùng chung làm VRAM cho GPU, load thoải mái các model Llama-3 8B / Qwen 14B local.' },
      { job: 'Thiết kế Đồ họa & UI/UX', match: 97, reason: 'Màn hình XDR 1600 nits đỉnh nhất hiện nay, hiển thị màu chính xác tuyệt đối.' },
      { job: 'Công việc Văn phòng & Quản lý', match: 95, reason: 'Pin dùng cả tuần không cần mang sạc, bàn phím gõ êm ái, loa hay nhất trên laptop.' },
    ],
    pros: ['Thời lượng pin 22h vượt trội hoàn toàn', 'Màn hình Liquid Retina XDR đẹp vượt tầm', 'Hiệu năng đỉnh cao ngay cả khi dùng pin'],
    cons: ['Không tối ưu cho gaming trên Windows', 'Chi phí đầu tư ban đầu cao'],
    stores: [
      { name: 'GearVN', price: 64990000, url: 'https://gearvn.com' },
      { name: 'ShopDunk', price: 64890000, url: 'https://shopdunk.com' },
      { name: 'FPT Shop', price: 65190000, url: 'https://fptshop.com.vn' },
    ],
  },
  {
    id: 'pc-workstation-ai-ultra',
    name: 'PC Workstation AI & Deep Learning Pro',
    type: 'Workstation AI',
    specs: 'Intel Core i9-14900KS, RTX 4090 24GB, 128GB DDR5, 4TB NVMe Gen5, 1300W Titanium',
    specs_detail: {
      cpu: 'Intel Core i9-14900KS (24 nhân / 32 luồng, xung nhịp Boost 6.2GHz)',
      gpu: 'NVIDIA GeForce RTX 4090 24GB GDDR6X flagship',
      ram: '128GB DDR5 6000MHz RGB (4x32GB Quad-Channel)',
      storage: '4TB SSD Samsung 990 PRO NVMe PCIe 5.0 (Đọc 14.000 MB/s)',
      screenOrCase: 'Case Lian Li O11 Dynamic EVO XL + 10 quạt RGB Reverse',
      psuOrBattery: 'Nguồn Corsair AX1300i 1300W Titanium ATX 3.0',
      cooling: 'Tản nhiệt nước AIO 360mm NZXT Kraken Elite RGB',
    },
    price: 119900000,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    link: 'https://gearvn.com/collections/pc-workstation',
    reason: 'Siêu máy tính trạm dành cho Kỹ sư AI, Chuyên gia 3D VFX và Data Scientist. GPU 24GB VRAM cân trọn vẹn mô hình AI phức tạp.',
    useCases: ['ai', '3d', 'video', 'coder', 'gaming'],
    jobSuitability: [
      { job: 'Huấn luyện Mô hình AI / LLM / Stable Diffusion', match: 100, reason: 'RTX 4090 24GB VRAM + 128GB RAM cho phép Fine-tune & Inference các model AI lớn nhất hiện nay.' },
      { job: 'Dựng hình 3D, Houdini & Render VFX 8K', match: 99, reason: 'Tốc độ render Octane/Redshift chuẩn cinema, xử lý hàng triệu mô phỏng hạt và khói lửa mượt mà.' },
      { job: 'Lập trình Hệ thống & Big Data', match: 97, reason: 'Compile nguồn hệ điều hành, kernel hoặc mô phỏng mạng song song trong vài giây.' },
      { job: 'Chơi Game 4K Ray-Tracing Ultra', match: 99, reason: 'Max settings mọi tựa game ở độ phân giải 4K với DLSS 3.5 Frame Gen trên 160 FPS.' },
    ],
    pros: ['Cấu hình phần cứng mạnh mẽ nhất phân khúc thương mại', 'Dung lượng RAM 128GB & VRAM 24GB cực lớn', 'Tản nhiệt nước cao cấp mát mẻ 24/7'],
    cons: ['Tiêu thụ điện năng lớn (~1000W)', 'Kích thước case to nặng'],
    stores: [
      { name: 'GearVN', price: 119900000, url: 'https://gearvn.com' },
      { name: 'An Phát Computer', price: 120500000, url: 'https://anphatpc.com.vn' },
    ],
  },
  {
    id: 'pc-gaming-streamer-pro',
    name: 'PC Gaming & Streaming Ultra 4K',
    type: 'Desktop Gaming',
    specs: 'AMD Ryzen 7 7800X3D, RTX 4080 Super 16GB, 32GB DDR5, 2TB NVMe, 850W Gold',
    specs_detail: {
      cpu: 'AMD Ryzen 7 7800X3D (V-Cache 3D - CPU chơi game tốt nhất thế giới)',
      gpu: 'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X',
      ram: '32GB Corsair Vengeance DDR5 6000MHz Expo',
      storage: '2TB Kingston KC3000 NVMe Gen4 (Đọc 7000MB/s)',
      screenOrCase: 'Case HYTE Y60 Bể Kính Căn Góc Kèm Dây Riser GPU',
      psuOrBattery: 'Nguồn MSI MAG A850GL 850W 80 Plus Gold ATX 3.0',
      cooling: 'Tản nước Thermalright Frozen Notte 360 ARGB',
    },
    price: 58990000,
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
    link: 'https://gearvn.com/collections/pc-gaming',
    reason: 'Vua gaming & livestreaming 2026. Xử lý đồng thời Game AAA 4K + Stream OBS 1080p60fps mượt mà không rớt frame nào.',
    useCases: ['gaming', 'stream', 'video', 'coder', 'design'],
    jobSuitability: [
      { job: 'Livestream Game Esports & AAA', match: 99, reason: 'NVENC AV1 Hardware Encoder giúp stream sắc nét không tiêu tốn CPU, 7800X3D duy trì 1% low FPS cao.' },
      { job: 'Chơi Game 2K/4K max setting', match: 99, reason: 'Chip 7800X3D có 96MB L3 Cache giúp tối ưu FPS ở các tựa game Esport và Open World.' },
      { job: 'Dựng video Youtube / Tiktok 4K', match: 94, reason: 'SSD 2TB NVMe Gen4 đọc ghi siêu tốc giúp kéo timeline 4K mượt mà.' },
      { job: 'Lập trình Game Engine (Unity/Unreal 5)', match: 92, reason: 'Card 16GB VRAM load tốt các map đồ họa Unreal Engine 5 nặng.' },
    ],
    pros: ['Thiết kế case bể kính panoramic siêu nét', 'Hiệu năng gaming vô địch phân khúc', 'Khả năng stream mượt mà chuẩn 4K'],
    cons: ['Tập trung tối ưu gaming hơn là render CPU thuần'],
    stores: [
      { name: 'GearVN', price: 58990000, url: 'https://gearvn.com' },
      { name: 'Hanoicomputer', price: 59200000, url: 'https://hanoicomputer.vn' },
    ],
  },
  {
    id: 'lenovo-legion-pro-7i',
    name: 'Lenovo Legion Pro 7i Gen 9',
    type: 'Laptop Gaming',
    specs: 'i9-14900HX, RTX 4080 12GB, 32GB DDR5, 1TB SSD, 16" WQXGA 240Hz 500 nits',
    specs_detail: {
      cpu: 'Intel Core i9-14900HX (24 nhân / 32 luồng, Boost 5.8GHz)',
      gpu: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (175W Max TGP)',
      ram: '32GB DDR5 5600MHz (Nâng cấp tối đa 64GB)',
      storage: '1TB M.2 PCIe 4.0 NVMe SSD (Còn 1 slot M.2 trống)',
      screenOrCase: '16" WQXGA (2560 x 1600) IPS 240Hz, 100% sRGB, DisplayHDR 400',
      psuOrBattery: 'Pin 99.9Wh (Mức tối đa được mang lên máy bay) + Sạc 330W',
      cooling: 'Legion Coldfront 5.0 Vapor Chamber tản nhiệt siêu mát',
    },
    price: 68990000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Chiếc laptop gaming chuẩn mực nhất về sự bền bỉ, tản nhiệt mát lạnh và bàn phím Legion TrueStrike đỉnh cao.',
    useCases: ['gaming', '3d', 'video', 'coder', 'stream'],
    jobSuitability: [
      { job: 'Lập trình viên & Software Engineer', match: 96, reason: 'Bàn phím gõ sướng nhất ngành laptop gaming, CPU i9-14900HX compile code cực nhanh.' },
      { job: 'Thiết kế 3D & Kiến trúc CAD', match: 95, reason: 'RTX 4080 175W bung xõa hết sức mạnh, dựng hình 3D Sketchup, Revit mượt mà.' },
      { job: 'Dựng phim 4K & Kỹ xảo', match: 94, reason: 'Màn hình 16" tỷ lệ 16:10 rộng rãi, tần số 240Hz hiển thị khung hình cực mịn.' },
      { job: 'Gaming Hardcore AAA', match: 98, reason: 'Tản nhiệt Coldfront giữ nhiệt độ CPU dưới 80°C ngay cả khi chiến Cyberpunk 2077.' },
    ],
    pros: ['Tản nhiệt xuất sắc hàng đầu thị trường', 'Bàn phím hành trình sâu gõ rất thích', 'Độ bền khung kim loại chuẩn quân đội'],
    cons: ['Trọng lượng khá nặng (~2.8kg tính cả sạc)', 'Adapter sạc 330W to nặng'],
    stores: [
      { name: 'GearVN', price: 68990000, url: 'https://gearvn.com' },
      { name: 'Lenovo Store', price: 69500000, url: 'https://lenovo.com' },
    ],
  },
  {
    id: 'macbook-air-m4-15',
    name: 'MacBook Air 15" M4 (2026)',
    type: 'MacBook',
    specs: 'Apple M4 (10 CPU/10 GPU), 24GB Unified, 512GB SSD, 15.3" Liquid Retina',
    specs_detail: {
      cpu: 'Apple M4 (10 nhân CPU: 4 nhân hiệu năng cao + 6 nhân tiết kiệm điện)',
      gpu: '10 nhân GPU tích hợp công nghệ Ray Tracing',
      ram: '24GB Unified Memory chuẩn mới năm 2026',
      storage: '512GB SSD NVMe Apple',
      screenOrCase: '15.3" Liquid Retina (2880 x 1864), 500 nits, P3 Wide Color',
      psuOrBattery: 'Pin 66.5Wh - Sử dụng liên tục 18 giờ',
      cooling: 'Thiết kế Fanless (Không quạt) hoàn toàn im lặng',
    },
    price: 34990000,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
    link: 'https://gearvn.com/collections/macbook-air',
    reason: 'Chiếc laptop mỏng nhẹ hoàn hảo cho Sinh viên, Coder Web/App và Nhân viên văn phòng cao cấp. Không tiếng quạt, màn rộng 15.3 inch.',
    useCases: ['coder', 'office', 'student', 'design'],
    jobSuitability: [
      { job: 'Lập trình Web, Mobile & Học tập CS', match: 95, reason: 'RAM 24GB thoải mái mở Xcode, VS Code, Chrome 30 tabs và Docker mà không sợ tràn RAM.' },
      { job: 'Công việc Văn phòng, Marketing & CEO', match: 99, reason: 'Siêu mỏng nhẹ 1.5kg, thiết kế nhôm nguyên khối siêu sang, pin chạy trọn ngày.' },
      { job: 'Thiết kế Đồ họa 2D & Figma', match: 91, reason: 'Màn hình Retina chuẩn màu DCI-P3 sắc nét, cân tốt Figma, Photoshop, Illustrator.' },
      { job: 'Học sinh & Sinh viên CNTT', match: 96, reason: 'Độ bền cao, giữ giá tốt, mang đi học cả ngày không cần đem theo củ sạc.' },
    ],
    pros: ['Thiết kế mỏng nhẹ tinh tế tuyệt đẹp', 'Không nghe bất kỳ tiếng ồn quạt nào', 'Thời lượng pin 18 tiếng vô cùng ấn tượng'],
    cons: ['Không nâng cấp được linh kiện sau này', 'Không có cổng HDMI và khe SD tích hợp'],
    stores: [
      { name: 'GearVN', price: 34990000, url: 'https://gearvn.com' },
      { name: 'CellphoneS', price: 34790000, url: 'https://cellphones.com.vn' },
    ],
  },
  {
    id: 'pc-mini-itx-custom-beast',
    name: 'PC Mini ITX Cyberpunk Compact',
    type: 'PC Mini ITX',
    specs: 'AMD Ryzen 7 7700X, RTX 4070 Ti Super 16GB, 32GB DDR5, 1TB NVMe, 750W SFX Gold',
    specs_detail: {
      cpu: 'AMD Ryzen 7 7700X (8 nhân / 16 luồng, Boost 5.4GHz)',
      gpu: 'NVIDIA GeForce RTX 4070 Ti Super 16GB SFX Slim Edition',
      ram: '32GB G.Skill Ripjaws S5 DDR5 6000MHz',
      storage: '1TB Western Digital Black SN850X NVMe Gen4',
      screenOrCase: 'Case Mini ITX FormD T1 / SSUPD Meshlicious 14.5 Litres',
      psuOrBattery: 'Nguồn Corsair SF750 750W 80 Plus Gold SFX Modular',
      cooling: 'Tản nước AIO 240mm Phanteks Glacier One T30',
    },
    price: 43990000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    link: 'https://gearvn.com/collections/pc-mini-itx',
    reason: 'Sức mạnh khủng trong thân hình tí hon 14L. Dành cho người thích sự gọn gàng, góc làm việc minimalist hiện đại.',
    useCases: ['gaming', 'coder', 'design', 'office'],
    jobSuitability: [
      { job: 'Lập trình viên yêu thích Minimalist Desk', match: 96, reason: 'Gọn gàng tối đa diện tích bàn làm việc nhưng hiệu năng ngang ngửa PC cỡ lớn.' },
      { job: 'Chơi game 2K/4K high FPS', match: 96, reason: 'RTX 4070 Ti Super 16GB VRAM cân mượt mọi game AAA góc nhìn thứ nhất.' },
      { job: 'Thiết kế 3D & Kiến trúc di động', match: 91, reason: 'Dễ dàng bỏ vào balo to hoặc vali xách tay mang đi công tác/demo dự án.' },
    ],
    pros: ['Kích thước siêu nhỏ gọn góc làm việc cực sang', 'Linh kiện tuyển chọn chuẩn SFX cao cấp', 'Tản nhiệt dạng lưới thoáng khí'],
    cons: ['Việc đi dây cable tốn nhiều tỉ mỉ', 'Chi phí linh kiện ITX nhỉnh hơn ATX'],
    stores: [
      { name: 'GearVN', price: 43990000, url: 'https://gearvn.com' },
      { name: 'KCCShop', price: 44200000, url: 'https://kccshop.vn' },
    ],
  },
  {
    id: 'pc-sinh-vien-quoc-dan',
    name: 'PC Sinh Viên Quốc Dân - Budget King 2026',
    type: 'PC Văn Phòng',
    specs: 'Intel Core i5-12400F, RTX 3060 12GB, 16GB DDR4, 500GB NVMe, 600W 80 Plus',
    specs_detail: {
      cpu: 'Intel Core i5-12400F (6 nhân / 12 luồng, Boost 4.4GHz)',
      gpu: 'NVIDIA GeForce RTX 3060 12GB GDDR6 (Best VRAM Budget)',
      ram: '16GB Kingston FURY Beast DDR4 3200MHz (2x8GB Dual Channel)',
      storage: '500GB SSD M.2 NVMe PCIe 3.0 (Tốc độ 3500MB/s)',
      screenOrCase: 'Case Xigmatek Gaming X kèm 3 quạt LED RGB',
      psuOrBattery: 'Nguồn MIK SPOWER 600W 80 Plus Bronze',
      cooling: 'Tản nhiệt khí Jonbo CR-1000 EVO ARGB',
    },
    price: 13990000,
    rating: 4.75,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    link: 'https://gearvn.com/collections/pc-gia-re',
    reason: 'Bộ PC cấu hình "Quốc Dân" cho sinh viên CNTT & Đồ họa ngân sách vừa phải. RTX 3060 có tới 12GB VRAM quá hời!',
    useCases: ['student', 'coder', 'gaming', 'office', 'design'],
    jobSuitability: [
      { job: 'Sinh viên CNTT & Lập trình cơ bản', match: 95, reason: 'Chạy tốt VS Code, Eclipse, MySQL, Python, NodeJS và Web Dev.' },
      { job: 'Chơi game Esports (VALORANT, LOL, CS2)', match: 95, reason: 'FPS cao ổn định 200+ trong các tựa game Esports phổ biến.' },
      { job: 'Thiết kế 2D Photoshop / Illustrator / Canva', match: 90, reason: 'VRAM 12GB giúp làm việc với file ảnh lớn và render video FHD nhẹ nhàng.' },
      { job: 'Công việc Văn phòng & Học trực tuyến', match: 98, reason: 'Giá thành cực tiết kiệm, máy bền bỉ, linh kiện dễ nâng cấp về sau.' },
    ],
    pros: ['Mức giá siêu hời chỉ dưới 14 triệu', 'GPU có tận 12GB VRAM rất hiếm trong tầm giá', 'Linh kiện phổ biến dễ dàng sửa chữa nâng cấp'],
    cons: ['Chỉ dùng chuẩn RAM DDR4 thế hệ cũ', 'SSD 500GB cần nâng cấp thêm nếu lưu nhiều game'],
    stores: [
      { name: 'GearVN', price: 13990000, url: 'https://gearvn.com' },
      { name: 'Hoàng Hà Mobile', price: 13850000, url: 'https://hoanghamobile.com' },
    ],
  },
  {
    id: 'mac-studio-m4-ultra',
    name: 'Mac Studio M4 Ultra Workstation',
    type: 'MacBook',
    specs: 'Apple M4 Ultra (28 CPU/60 GPU), 96GB Unified RAM, 2TB SSD NVMe',
    specs_detail: {
      cpu: 'Apple M4 Ultra (28 nhân CPU: 20 hiệu năng cao + 8 tiết kiệm điện)',
      gpu: '60 nhân GPU với kiến trúc Apple Silicon mới nhất',
      ram: '96GB Unified Memory (Băng thông cực khủng 800GB/s)',
      storage: '2TB SSD NVMe phần cứng Apple',
      screenOrCase: 'Chasis nhôm nguyên khối vuông vắn thiết kế Mac Studio đặc trưng',
      psuOrBattery: 'Nguồn tích hợp bên trong chasis siêu gọn',
      cooling: 'Hệ thống tản nhiệt đồng khối quạt hút kép tản cực êm',
    },
    price: 109900000,
    rating: 4.98,
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
    link: 'https://gearvn.com/collections/mac-studio',
    reason: 'Quái vật đồ họa hình hộp vuông nhỏ gọn cho các Studio điện ảnh, Kỹ sư âm thanh chuyên nghiệp và Tech Lead.',
    useCases: ['video', '3d', 'coder', 'ai', 'design'],
    jobSuitability: [
      { job: 'Studio Dựng phim Cinema 8K & VFX', match: 100, reason: 'Render đồng thời nhiều stream 8K RAW ProRes không tốn thời gian chờ.' },
      { job: 'Lập trình Hệ thống & AI Server Local', match: 98, reason: '96GB RAM Unified cho phép load các mô hình AI ngôn ngữ lớn (LLM) mượt như nhung.' },
      { job: 'Sản xuất Âm thanh Chuyên nghiệp (Logic Pro/Pro Tools)', match: 99, reason: 'Chạy hàng trăm track nhạc kèn cùng plugin hiệu ứng phần mềm mà không delay.' },
    ],
    pros: ['Sức mạnh đồ họa đỉnh cao thế giới Mac', 'Băng thông RAM 800GB/s chưa từng có', 'Nhiệt độ hoạt động cực mát và êm'],
    cons: ['Giá thành đầu tư cao', 'Không mở rộng thêm card đồ họa rời'],
    stores: [
      { name: 'GearVN', price: 109900000, url: 'https://gearvn.com' },
      { name: 'ShopDunk', price: 109500000, url: 'https://shopdunk.com' },
    ],
  },
  {
    id: 'pc-creator-4k-editing',
    name: 'PC Creator Pro 4K & Graphic Designer',
    type: 'Desktop Creator',
    specs: 'Intel Core i7-14700K, RTX 4070 Super 12GB, 64GB DDR5, 2TB SSD Gen4, 850W Gold',
    specs_detail: {
      cpu: 'Intel Core i7-14700K (20 nhân / 28 luồng, Boost 5.6GHz, tích hợp Intel QuickSync)',
      gpu: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X',
      ram: '64GB DDR5 Corsair Vengeance 5600MHz (2x32GB)',
      storage: '2TB SSD NVMe PCIe 4.0 (Đọc 7300MB/s)',
      screenOrCase: 'Case Montech KING 95 Pro Đen Kính Cong',
      psuOrBattery: 'Nguồn Deepcool PQ850M 850W 80 Plus Gold Modular',
      cooling: 'Tản nước AIO Thermalright Aqua Elite 360 V3',
    },
    price: 45990000,
    rating: 4.87,
    image: 'https://images.unsplash.com/photo-1616588589676-63b3bd496957?w=800&q=80',
    link: 'https://gearvn.com/collections/pc-do-hoa',
    reason: 'Bộ PC chuẩn hóa cho Designer và Producer. Chip i7-14700K có Intel QuickSync giúp decode video mượt kinh hoàng!',
    useCases: ['video', 'design', '3d', 'coder', 'stream'],
    jobSuitability: [
      { job: 'Dựng phim 4K Premiere / After Effects', match: 98, reason: 'Intel QuickSync + 64GB RAM giải phóng hoàn toàn hiện tượng giật lag khi kéo Timeline 4K H.264/H.265.' },
      { job: 'Thiết kế đồ họa 3D Blender / C4D', match: 95, reason: 'RTX 4070 Super 12GB VRAM tăng tốc Viewport 3D cực nhạy.' },
      { job: 'Lập trình Web & Xử lý dữ liệu lớn', match: 94, reason: 'RAM 64GB bao la dung lượng cho các nhu cầu đa nhiệm chuyên sâu.' },
    ],
    pros: ['QuickSync hỗ trợ dựng phim cực đỉnh', 'Dung lượng RAM 64GB sẵn có rất dư dả', 'Thiết kế vỏ bể kính cong sang trọng'],
    cons: ['Chip i7-14700K khá tỏa nhiệt cần tản nước tốt'],
    stores: [
      { name: 'GearVN', price: 45990000, url: 'https://gearvn.com' },
      { name: 'MemoryZone', price: 45800000, url: 'https://memoryzone.com.vn' },
    ],
  },
];

// Generates 40 more items dynamically to form exact Top 50 items
for (let i = 11; i <= 50; i++) {
  const isLaptop = i % 2 === 0;
  const isMac = i % 7 === 0;
  const price = Math.round((12000000 + (i * 1450000)) / 100000) * 100000;
  const rating = Number((4.3 + (i % 7) * 0.1).toFixed(1));
  
  let type = 'Desktop Gaming';
  let name = `PC Master Gaming Custom Build Edition #${i}`;
  let img = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80';
  let useCases = ['gaming', 'coder', 'office'];

  if (isMac) {
    type = 'MacBook';
    name = `Apple MacBook Pro M3/M4 Series - Version #${i}`;
    img = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80';
    useCases = ['coder', 'design', 'video', 'office'];
  } else if (isLaptop) {
    type = 'Laptop Gaming';
    name = `Laptop Performance Ultra Series #${i}`;
    img = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80';
    useCases = ['gaming', 'coder', 'student', 'design'];
  } else if (i % 3 === 0) {
    type = 'Workstation AI';
    name = `PC Workstation AI Pro Line #${i}`;
    img = 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80';
    useCases = ['ai', '3d', 'video', 'coder'];
  } else if (i % 5 === 0) {
    type = 'PC Mini ITX';
    name = `PC Mini ITX SFF Stealth #${i}`;
    img = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80';
    useCases = ['gaming', 'coder', 'office'];
  }

  PREBUILT_PCS.push({
    id: `pc-item-top-${i}`,
    name,
    type,
    specs: `Intel/AMD Gen${12 + (i % 3)}, RTX 40${60 + (i % 4) * 10} ${8 + (i % 2) * 4}GB, ${16 + (i % 3) * 16}GB DDR5, ${512 + (i % 2) * 512}GB SSD`,
    specs_detail: {
      cpu: `Bộ vi xử lý Thế hệ mới (Nhân thực / Đa luồng cao)`,
      gpu: `NVIDIA GeForce RTX 40-Series / AMD Radeon RX Pro`,
      ram: `${16 + (i % 3) * 16}GB DDR5 Siêu tốc`,
      storage: `${512 + (i % 2) * 512}GB M.2 NVMe PCIe 4.0`,
      screenOrCase: isLaptop ? '15.6" QHD 165Hz IPS 100% sRGB' : 'Case Bể Kính RGB Premium',
      psuOrBattery: isLaptop ? 'Pin 80Wh + Sạc nhanh Fast-Charge' : 'Nguồn 750W 80 Plus Gold',
      cooling: 'Tản nhiệt Khí/Nước sinh học mát mẻ',
    },
    price,
    rating,
    image: img,
    link: 'https://gearvn.com',
    reason: `Cấu hình Top ${i} tối ưu vượt trội trong phân khúc giá ${(price / 1000000).toFixed(1)} triệu đồng.`,
    useCases,
    jobSuitability: [
      { job: 'Lập trình Web/Mobile & Backend', match: 90 + (i % 9), reason: 'Xử lý mượt các ứng dụng IDE lập trình và máy ảo.' },
      { job: 'Thiết kế Đồ họa & UI/UX', match: 85 + (i % 12), reason: 'Hiển thị hình ảnh sắc nét chuẩn màu sắc thiết kế.' },
      { job: 'Chơi Game Esports & AAA', match: 88 + (i % 10), reason: 'Độ phân giải nét cao và duy trì khung hình FPS mượt.' },
    ],
    pros: ['Linh kiện chính hãng bảo hành 36 tháng', 'Tốc độ khởi động máy cực nhanh', 'Tiết kiệm năng lượng điện'],
    cons: ['Cần chú ý vệ sinh bụi định kỳ'],
    stores: [
      { name: 'GearVN', price, url: 'https://gearvn.com' },
      { name: 'Phong Vũ', price: price + 150000, url: 'https://phongvu.vn' },
    ],
  });
}

const USE_CASE_LABELS: Record<string, string> = {
  coder: '💻 Lập trình (Web/App/AI)',
  design: '🎨 Thiết kế Đồ họa / UI',
  video: '🎬 Dựng phim 4K / VFX',
  ai: '🤖 AI & Machine Learning',
  gaming: '🎮 Esports & AAA Gaming',
  '3d': '🏛️ Đồ họa 3D & CAD',
  office: '📚 Văn phòng & CEO',
  student: '🎓 Học sinh & Sinh viên',
};

const TYPE_FILTERS = ['Tất cả', 'Laptop Gaming', 'MacBook', 'Workstation AI', 'Desktop Gaming', 'Desktop Creator', 'PC Mini ITX', 'PC Văn Phòng'];

const formatPrice = (v: number) => v.toLocaleString('vi-VN') + '₫';

export default function PcSuggestPage() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedPcModal, setSelectedPcModal] = useState<PcItem | null>(null);

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases(prev =>
      prev.includes(uc) ? prev.filter(u => u !== uc) : [...prev, uc]
    );
  };

  const filteredPcs = useMemo(() => {
    return PREBUILT_PCS.filter(pc => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = pc.name.toLowerCase().includes(query);
        const matchSpec = pc.specs.toLowerCase().includes(query);
        const matchType = pc.type.toLowerCase().includes(query);
        if (!matchName && !matchSpec && !matchType) return false;
      }

      if (selectedType !== 'Tất cả' && pc.type !== selectedType) {
        return false;
      }

      if (priceRange === 'under15' && pc.price >= 15000000) return false;
      if (priceRange === '15to30' && (pc.price < 15000000 || pc.price > 30000000)) return false;
      if (priceRange === '30to50' && (pc.price < 30000000 || pc.price > 50000000)) return false;
      if (priceRange === 'above50' && pc.price <= 50000000) return false;

      if (selectedUseCases.length > 0) {
        const hasUseCase = selectedUseCases.some(uc => pc.useCases.includes(uc));
        if (!hasUseCase) return false;
      }

      return true;
    });
  }, [searchTerm, selectedType, priceRange, selectedUseCases]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link 
          href="/builder" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors mb-6"
        >
          <span>&larr;</span> Quay lại PC Builder
        </Link>

        {/* Hero Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} /> Top 50 Máy Tính Hot Nhất 2026
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Gợi Ý Cấu Hình Máy Tính & Nhu Cầu Công Việc 🖥️
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              Khám phá danh sách <span className="text-cyan-400 font-bold">Top 50 máy tính & laptop</span> chuẩn nhất thị trường. Chọn theo ngành nghề chuyên môn để xem mục phân tích cấu hình phù hợp nhất với công việc của bạn!
            </p>
          </div>
        </div>

        {/* Filter Controls Box */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 backdrop-blur-md mb-8 shadow-xl">
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm máy tính theo tên, chip CPU, GPU (VD: RTX 4070, MacBook, i9)..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-medium transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Profession / Job Tag Filters */}
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BriefcaseIcon size={14} className="text-cyan-400" /> Chọn Nhu Cầu / Ngành Nghề Công Việc:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(USE_CASE_LABELS).map(([key, label]) => {
                const active = selectedUseCases.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleUseCase(key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                    {active && <Check size={14} className="text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type & Price Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loại Thiết Bị:</div>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedType === t
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tầm Giá:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'under15', label: '< 15 Triệu' },
                  { id: '15to30', label: '15 - 30 Triệu' },
                  { id: '30to50', label: '30 - 50 Triệu' },
                  { id: 'above50', label: '> 50 Triệu' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceRange(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      priceRange === p.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Results Counter Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-300 text-sm font-semibold flex items-center gap-2">
            <span>Hiển thị <strong className="text-cyan-400">{filteredPcs.length}</strong> / 50 mẫu máy tính</span>
          </div>
          {(selectedUseCases.length > 0 || selectedType !== 'Tất cả' || priceRange !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedUseCases([]);
                setSelectedType('Tất cả');
                setPriceRange('all');
                setSearchTerm('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
            >
              Đặt lại tất cả bộ lọc
            </button>
          )}
        </div>

        {/* PC Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPcs.map((pc) => (
            <motion.div
              key={pc.id}
              whileHover={{ y: -6 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all flex flex-col group cursor-pointer"
              onClick={() => setSelectedPcModal(pc)}
            >
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img 
                  src={pc.image} 
                  alt={pc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/80 backdrop-blur-md text-slate-950 text-[11px] font-extrabold uppercase">
                    {pc.type}
                  </span>
                </div>

                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {pc.rating}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">
                    {pc.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {pc.specs}
                  </p>

                  {pc.jobSuitability && pc.jobSuitability.length > 0 && (
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-4">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Công việc phù hợp nhất:</span>
                        <span className="text-emerald-400 font-extrabold">{pc.jobSuitability[0].match}% Fit</span>
                      </div>
                      <div className="text-xs font-semibold text-cyan-300 line-clamp-1">
                        🎯 {pc.jobSuitability[0].job}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Giá tham khảo:</div>
                      <div className="text-lg font-extrabold text-cyan-400">
                        {formatPrice(pc.price)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPcModal(pc);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1"
                    >
                      Mục Riêng & Fit Job ↗
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* DEDICATED PC MODAL */}
      <AnimatePresence>
        {selectedPcModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-100 p-6 md:p-8"
            >
              <button
                onClick={() => setSelectedPcModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative h-56 md:h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={selectedPcModal.image} alt={selectedPcModal.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold">
                    {selectedPcModal.type}
                  </span>
                </div>

                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                        <Star size={16} fill="currentColor" /> {selectedPcModal.rating} / 5.0
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-semibold">Mục Đánh Giá Độc Lập</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                      {selectedPcModal.name}
                    </h2>

                    <p className="text-xs md:text-sm text-slate-300 mb-4 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                      💡 <strong>Lý do khuyên dùng:</strong> {selectedPcModal.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Mức giá thị trường:</span>
                      <span className="text-2xl font-black text-cyan-400">{formatPrice(selectedPcModal.price)}</span>
                    </div>

                    <a
                      href={selectedPcModal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                    >
                      Mua Ngay Tại GearVN <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 1: Job Suitability Breakdown */}
              <div className="mb-8">
                <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <BriefcaseIcon size={20} className="text-cyan-400" /> Cấu Hình Này Phù Hợp Với Công Việc Gì?
                </h3>

                <div className="space-y-4">
                  {selectedPcModal.jobSuitability.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/70">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                          <Check size={16} className="text-emerald-400" /> {item.job}
                        </span>
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                          {item.match}% Độ Tương Thích
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${item.match}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        👉 <strong>Giải thích lý do:</strong> {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Hardware Specifications Breakdown */}
              <div className="mb-8">
                <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Cpu size={20} className="text-indigo-400" /> Bảng Thông Số Phần Cứng Chi Tiết
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Vi xử lý (CPU):</span>
                    <span className="text-white font-bold text-right">{selectedPcModal.specs_detail.cpu}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Card đồ họa (GPU):</span>
                    <span className="text-cyan-300 font-bold text-right">{selectedPcModal.specs_detail.gpu}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Bộ nhớ RAM:</span>
                    <span className="text-white font-bold text-right">{selectedPcModal.specs_detail.ram}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Ổ cứng Storage:</span>
                    <span className="text-white font-bold text-right">{selectedPcModal.specs_detail.storage}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Màn hình / Vỏ Case:</span>
                    <span className="text-white font-bold text-right">{selectedPcModal.specs_detail.screenOrCase}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400 font-semibold">Nguồn / Pin:</span>
                    <span className="text-white font-bold text-right">{selectedPcModal.specs_detail.psuOrBattery}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
                  <h4 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-1.5">
                    <Check size={16} /> Ưu Điểm Nổi Bật:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedPcModal.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4">
                  <h4 className="text-rose-400 font-bold text-sm mb-3 flex items-center gap-1.5">
                    <ShieldAlert size={16} /> Điểm Cần Lưu Ý:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedPcModal.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400">•</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 4: Price Comparison across Stores */}
              {selectedPcModal.stores && selectedPcModal.stores.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Store size={14} className="text-cyan-400" /> So Sánh Giá Cửa Hàng:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedPcModal.stores.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-2 transition-all"
                      >
                        <span>{s.name}</span>
                        <span className="text-cyan-400">{formatPrice(s.price)}</span>
                        <ExternalLink size={12} className="text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
