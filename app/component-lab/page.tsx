'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Zap, Cpu, Monitor, HardDrive, CircuitBoard,
  Fan, Wifi, Battery, Speaker, Shield, Radio, Smartphone,
  MousePointer2, Keyboard, Headphones, Webcam, Eye,
  Crosshair, Swords, Diamond, Heart, Star, Trophy,
  ChevronRight, ChevronLeft, Layers, CheckCircle, XCircle,
  BookOpen, Beaker, FlaskConical, GraduationCap,
} from 'lucide-react'

interface Spec {
  label: string
  value: string
}

interface Component {
  id: string
  name: string
  icon: string
  desc: string
  role: string
  specs: Spec[]
  brands: string[]
  tips: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  items: Component[]
}

const COMPONENT_DATA: Category[] = [
  {
    id: 'cpu', name: 'CPU', color: '#3b82f6',
    icon: <Cpu size={20} />,
    items: [
      { id: 'cpu-intel', name: 'Intel Core i9-14900K', icon: '⚡', desc: 'CPU cao cấp nhất của Intel thế hệ 14', role: 'Bộ xử lý trung tâm - "Bộ não" của máy tính, xử lý mọi tác vụ tính toán và điều khiển',
        specs: [
          { label: 'Số nhân / Luồng', value: '24 nhân (8P+16E) / 32 luồng' },
          { label: 'Xung nhịp cơ bản', value: '3.2 GHz (P-core) / 2.4 GHz (E-core)' },
          { label: 'Xung nhịp Boost', value: 'Lên đến 6.0 GHz' },
          { label: 'Cache L3', value: '36 MB Intel Smart Cache' },
          { label: 'TDP', value: '125W (cơ bản) / 253W (tối đa)' },
          { label: 'Socket', value: 'LGA 1700' },
          { label: 'Hỗ trợ RAM', value: 'DDR5-5600 / DDR4-3200' },
          { label: 'PCIe', value: 'PCIe 5.0 (16 lane)' },
          { label: 'Kiến trúc', value: 'Raptor Lake Refresh' },
          { label: 'Tích hợp GPU', value: 'Intel UHD Graphics 770' },
        ],
        brands: ['Intel', 'AMD'],
        tips: 'Chọn CPU dựa trên nhu cầu: Intel mạnh gaming đơn luồng, AMD mạnh đa nhiệm và tiết kiệm điện.' },
      { id: 'cpu-amd', name: 'AMD Ryzen 7 7800X3D', icon: '🔥', desc: 'CPU gaming tốt nhất hiện nay với công nghệ 3D V-Cache', role: 'Bộ xử lý trung tâm tối ưu cho gaming với bộ nhớ đệm 3D độc quyền',
        specs: [
          { label: 'Số nhân / Luồng', value: '8 nhân / 16 luồng' },
          { label: 'Xung nhịp cơ bản', value: '4.2 GHz' },
          { label: 'Xung nhịp Boost', value: 'Lên đến 5.0 GHz' },
          { label: 'Cache L3', value: '96 MB (3D V-Cache)' },
          { label: 'TDP', value: '120W' },
          { label: 'Socket', value: 'AM5' },
          { label: 'Hỗ trợ RAM', value: 'DDR5-5200' },
          { label: 'PCIe', value: 'PCIe 5.0 (24 lane)' },
          { label: 'Kiến trúc', value: 'Zen 4' },
          { label: 'Tích hợp GPU', value: 'AMD Radeon Graphics (2 nhân)' },
        ],
        brands: ['AMD', 'Intel'],
        tips: 'CPU AMD AM5 hỗ trợ lâu dài - có thể nâng cấp lên Zen 6+ trong tương lai mà không cần thay mainboard.' },
      { id: 'cpu-budget', name: 'Intel Core i5-14600K', icon: '💪', desc: 'CPU tầm trung mạnh mẽ, giá hợp lý cho gaming', role: 'Bộ xử lý tầm trung, lựa chọn tốt nhất cho PC gaming tầm trung',
        specs: [
          { label: 'Số nhân / Luồng', value: '14 nhân (6P+8E) / 20 luồng' },
          { label: 'Xung nhịp Boost', value: 'Lên đến 5.3 GHz' },
          { label: 'Cache L3', value: '24 MB' },
          { label: 'TDP', value: '125W / 181W tối đa' },
          { label: 'Socket', value: 'LGA 1700' },
          { label: 'Hỗ trợ RAM', value: 'DDR5 / DDR4' },
        ],
        brands: ['Intel'],
        tips: 'i5-14600K là "ngọt ngào nhất" cho gaming - hiệu năng gần bằng i9 nhưng giá chỉ bằng một nửa.' },
    ]
  },
  {
    id: 'gpu', name: 'GPU', color: '#22c55e',
    icon: <Monitor size={20} />,
    items: [
      { id: 'gpu-nvidia', name: 'NVIDIA RTX 4090', icon: '🟢', desc: 'Card đồ họa mạnh nhất thế giới dành cho gaming và AI', role: 'Bộ xử lý đồ họa - Xử lý hình ảnh, game, render, và AI',
        specs: [
          { label: 'Nhân CUDA', value: '16.384 CUDA Cores' },
          { label: 'VRAM', value: '24 GB GDDR6X' },
          { label: 'Xung nhịp Boost', value: '2.52 GHz' },
          { label: 'Băng thông', value: '1.008 GB/s' },
          { label: 'TDP', value: '450W' },
          { label: 'Ray Tracing', value: 'Thế hệ 3 (RT Cores)' },
          { label: 'DLSS', value: '3.5 (Frame Generation)' },
          { label: 'Kết nối', value: 'PCIe 4.0 x16' },
          { label: 'HDMI/DP', value: 'HDMI 2.1 + 3x DP 1.4a' },
          { label: 'Kích thước', value: '3.5 slot, 304mm' },
        ],
        brands: ['NVIDIA', 'ASUS', 'MSI', 'Gigabyte'],
        tips: 'RTX 4090 là card mạnh nhất nhưng cần nguồn 850W+ và case lớn. Phù hợp cho 4K gaming và AI/ML.' },
      { id: 'gpu-amd', name: 'AMD Radeon RX 7900 XTX', icon: '🔴', desc: 'Card đồ họa flagship của AMD, cạnh tranh với RTX 4080', role: 'Card đồ họa cao cấp, tối ưu cho gaming 4K và creative workflow',
        specs: [
          { label: 'Nhân Stream', value: '6.144 Stream Processors' },
          { label: 'VRAM', value: '24 GB GDDR6' },
          { label: 'Xung nhịp', value: 'Lên đến 2.5 GHz' },
          { label: 'Băng thông', value: '960 GB/s' },
          { label: 'TDP', value: '355W' },
          { label: 'Ray Tracing', value: 'Thế hệ 2' },
          { label: 'FSR', value: '3.0' },
          { label: 'Kết nối', value: 'PCIe 4.0 x16' },
        ],
        brands: ['AMD', 'ASUS', 'Sapphire'],
        tips: 'AMD RX 7900 XTX có VRAM 24GB giá rẻ hơn NVIDIA. Phù hợp cho 4K gaming và làm đồ họa.' },
      { id: 'gpu-mid', name: 'NVIDIA RTX 4070 Super', icon: '💚', desc: 'Card đồ họa tầm trung lý tưởng cho gaming 1440P', role: 'Card đồ họa tầm trung, cân bằng giữa hiệu năng và giá thành',
        specs: [
          { label: 'Nhân CUDA', value: '7.168 CUDA Cores' },
          { label: 'VRAM', value: '12 GB GDDR6X' },
          { label: 'TDP', value: '220W' },
          { label: 'Ray Tracing', value: 'Thế hệ 3' },
          { label: 'DLSS', value: '3.5' },
          { label: 'Giá tham khảo', value: '~600 USD' },
        ],
        brands: ['NVIDIA', 'ASUS', 'MSI'],
        tips: 'RTX 4070 Super là lựa chọn tốt nhất cho gaming 1440P với ray tracing. Tiết kiệm điện hơn nhiều so với 4070 Ti.' },
    ]
  },
  {
    id: 'ram', name: 'RAM', color: '#f59e0b',
    icon: <Zap size={20} />,
    items: [
      { id: 'ram-ddr5', name: 'DDR5-6000 32GB (2x16GB)', icon: '🧠', desc: 'RAM thế hệ mới nhất với tốc độ cao và dung lượng lớn', role: 'Bộ nhớ tạm thời - Lưu dữ liệu đang xử lý, càng nhiều RAM càng mượt',
        specs: [
          { label: 'Dung lượng', value: '32 GB (2 x 16 GB)' },
          { label: 'Loại RAM', value: 'DDR5' },
          { label: 'Tốc độ', value: '6000 MT/s' },
          { label: 'CAS Latency', value: 'CL30-36-36-76' },
          { label: 'Điện áp', value: '1.35V' },
          { label: 'Heat Spreader', value: 'Nhôm tản nhiệt cao cấp' },
          { label: 'RGB', value: 'Hỗ trợ (tùy phiên bản)' },
          { label: 'XMP / EXPO', value: 'Intel XMP 3.0 / AMD EXPO' },
          { label: 'Băng thông', value: '48 GB/s' },
          { label: 'Kênh', value: 'Dual Channel (kênh đôi)' },
        ],
        brands: ['G.Skill', 'Corsair', 'Kingston', 'TeamGroup'],
        tips: 'Chọn RAM có CL càng thấp càng tốt. DDR5-6000 CL30 là "sweet spot" cho gaming. Luôn gắn 2 thanh để chạy Dual Channel.' },
      { id: 'ram-ddr4', name: 'DDR4-3600 16GB (2x8GB)', icon: '💾', desc: 'RAM thế hệ trước nhưng vẫn rất phổ biến và giá rẻ', role: 'Bộ nhớ tạm thời cho PC tầm trung và ngân sách thấp',
        specs: [
          { label: 'Dung lượng', value: '16 GB (2 x 8 GB)' },
          { label: 'Loại RAM', value: 'DDR4' },
          { label: 'Tốc độ', value: '3600 MT/s' },
          { label: 'CAS Latency', value: 'CL16' },
          { label: 'Điện áp', value: '1.35V' },
          { label: 'Kênh', value: 'Dual Channel' },
        ],
        brands: ['Corsair', 'G.Skill', 'Kingston'],
        tips: 'DDR4 vẫn rất tốt cho gaming. 16GB là đủ cho hầu hết game, 32GB nếu bạn làm đồ họa hay stream.' },
    ]
  },
  {
    id: 'motherboard', name: 'Mainboard', color: '#8b5cf6',
    icon: <CircuitBoard size={20} />,
    items: [
      { id: 'mb-atx', name: 'ASUS ROG Z790-E Gaming', icon: '🛡️', desc: 'Mainboard ATX cao cấp cho Intel thế hệ 13/14', role: 'Bo mạch chủ - Kết nối tất cả linh kiện lại với nhau',
        specs: [
          { label: 'Form Factor', value: 'ATX' },
          { label: 'Chipset', value: 'Intel Z790' },
          { label: 'Socket', value: 'LGA 1700' },
          { label: 'Khe RAM', value: '4x DDR5 (tối đa 192GB)' },
          { label: 'Khe PCIe', value: '2x PCIe 5.0 x16, 1x PCIe 4.0 x16' },
          { label: 'Khe M.2', value: '5x M.2 NVMe' },
          { label: 'Cổng SATA', value: '6x SATA III' },
          { label: 'USB', value: 'USB 3.2 Gen 2x2 Type-C' },
          { label: 'WiFi', value: 'WiFi 6E + Bluetooth 5.3' },
          { label: 'Âm thanh', value: 'Realtek ALC4080 7.1' },
        ],
        brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
        tips: 'Chọn mainboard dựa trên CPU: Z790 cho Intel, B650/X670 cho AMD. Chipset Z cho phép ép xung.' },
      { id: 'mb-matx', name: 'MSI MAG B650M Mortar', icon: '🔧', desc: 'Mainboard Micro-ATX cho AMD Ryzen 7000', role: 'Bo mạch chủ tầm trung cho AMD, cân bằng tính năng và giá cả',
        specs: [
          { label: 'Form Factor', value: 'Micro-ATX' },
          { label: 'Chipset', value: 'AMD B650' },
          { label: 'Socket', value: 'AM5' },
          { label: 'Khe RAM', value: '4x DDR5' },
          { label: 'Khe PCIe', value: '1x PCIe 4.0 x16' },
          { label: 'Khe M.2', value: '2x M.2' },
          { label: 'WiFi', value: 'WiFi 6E' },
        ],
        brands: ['MSI', 'ASUS', 'Gigabyte'],
        tips: 'Mainboard B650 là lựa chọn tốt nhất cho AMD tầm trung, có đầy đủ tính năng cần thiết với giá hợp lý.' },
    ]
  },
  {
    id: 'storage', name: 'Lưu trữ', color: '#06b6d4',
    icon: <HardDrive size={20} />,
    items: [
      { id: 'ssd-nvme', name: 'Samsung 990 Pro 2TB', icon: '🚀', desc: 'SSD NVMe PCIe 4.0 nhanh nhất cho PC', role: 'Ổ cứng thể rắn - Lưu trữ hệ điều hành, game và ứng dụng với tốc độ cực nhanh',
        specs: [
          { label: 'Dung lượng', value: '2 TB' },
          { label: 'Loại', value: 'NVMe M.2 PCIe 4.0' },
          { label: 'Tốc độ Đọc', value: '7.450 MB/s' },
          { label: 'Tốc độ Ghi', value: '6.900 MB/s' },
          { label: 'TBW', value: '1.200 TB' },
          { label: 'NAND', value: 'Samsung V-NAND 3-bit MLC' },
          { label: 'DRAM Cache', value: '2 GB LPDDR4' },
          { label: 'Bảo hành', value: '5 năm' },
          { label: 'Kích thước', value: 'M.2 2280' },
          { label: 'Controller', value: 'Samsung Pascal' },
        ],
        brands: ['Samsung', 'Western Digital', 'SK Hynix', 'Crucial'],
        tips: 'Luôn cài Windows và game trên SSD NVMe. Dung lượng 1TB là tối thiểu cho gaming, 2TB là lý tưởng.' },
      { id: 'ssd-sata', name: 'Crucial MX500 1TB', icon: '💿', desc: 'SSD SATA giá rẻ cho lưu trữ phụ', role: 'Ổ cứng thể rắn chuẩn SATA - Lưu trữ dữ liệu với giá rẻ hơn NVMe',
        specs: [
          { label: 'Dung lượng', value: '1 TB' },
          { label: 'Loại', value: 'SATA III 2.5 inch' },
          { label: 'Tốc độ Đọc', value: '560 MB/s' },
          { label: 'Tốc độ Ghi', value: '510 MB/s' },
          { label: 'TBW', value: '360 TB' },
          { label: 'Bảo hành', value: '5 năm' },
        ],
        brands: ['Crucial', 'Samsung', 'WD'],
        tips: 'Dùng SSD SATA cho lưu trữ dữ liệu, game cũ. NVMe cho game mới và hệ điều hành.' },
      { id: 'hdd', name: 'Seagate Barracuda 4TB', icon: '📀', desc: 'HDD dung lượng lớn giá rẻ cho lưu trữ', role: 'Ổ cứng cơ - Lưu trữ dung lượng lớn với chi phí thấp nhất',
        specs: [
          { label: 'Dung lượng', value: '4 TB' },
          { label: 'Loại', value: 'HDD 3.5 inch' },
          { label: 'Tốc độ quay', value: '5.400 RPM' },
          { label: 'Tốc độ Đọc', value: '~190 MB/s' },
          { label: 'Cache', value: '256 MB' },
          { label: 'Bảo hành', value: '2 năm' },
        ],
        brands: ['Seagate', 'Western Digital', 'Toshiba'],
        tips: 'HDD chỉ nên dùng cho backup dữ liệu, nhạc, phim. Không cài game hay Windows trên HDD.' },
    ]
  },
  {
    id: 'psu', name: 'Nguồn', color: '#ef4444',
    icon: <Battery size={20} />,
    items: [
      { id: 'psu-gold', name: 'Corsair RM850x', icon: '⚡', desc: 'Nguồn 850W 80+ Gold hàng đầu cho PC gaming', role: 'Bộ nguồn - Cung cấp điện năng ổn định cho toàn bộ hệ thống',
        specs: [
          { label: 'Công suất', value: '850W' },
          { label: 'Chuẩn hiệu suất', value: '80+ Gold (87-90%)' },
          { label: 'Loại', value: 'Fully Modular' },
          { label: 'Chuẩn ATX', value: 'ATX 3.0 / PCIe 5.0' },
          { label: 'Đầu cắm 12VHPWR', value: 'Có' },
          { label: 'Quạt', value: '135mm PWM' },
          { label: 'Fanless Mode', value: 'Zero RPM (tải thấp)' },
          { label: 'Bảo hành', value: '10 năm' },
          { label: 'Bảo vệ', value: 'OVP, UVP, SCP, OTP, OPP' },
          { label: 'Kích thước', value: '150 x 160 x 86mm' },
        ],
        brands: ['Corsair', 'Seasonic', 'EVGA', 'Cooler Master'],
        tips: 'Chọn nguồn dư công suất 20-30% so với nhu cầu. 850W cho hầu hết cấu hình gaming, 1000W+ cho RTX 4090.' },
      { id: 'psu-platinum', name: 'Seasonic PRIME TX-1000', icon: '💎', desc: 'Nguồn 1000W 80+ Titanium cao cấp nhất', role: 'Bộ nguồn cao cấp cho workstation và PC mạnh nhất',
        specs: [
          { label: 'Công suất', value: '1000W' },
          { label: 'Chuẩn hiệu suất', value: '80+ Titanium (94-96%)' },
          { label: 'Loại', value: 'Fully Modular' },
          { label: 'Bảo hành', value: '12 năm' },
          { label: 'Chuẩn ATX', value: 'ATX 3.0' },
        ],
        brands: ['Seasonic', 'Corsair'],
        tips: 'Nguồn Titanium đắt hơn nhưng tiết kiệm điện và bền hơn. Đầu tư vào nguồn tốt là đầu tư cho toàn bộ PC.' },
    ]
  },
  {
    id: 'cooling', name: 'Tản nhiệt', color: '#06b6d4',
    icon: <Fan size={20} />,
    items: [
      { id: 'aio-360', name: 'AIO 360mm - NZXT Kraken X73', icon: '❄️', desc: 'Tản nhiệt nước AIO 360mm hiệu năng cao', role: 'Tản nhiệt chất lỏng - Giữ CPU mát mẻ để đạt hiệu năng tối đa',
        specs: [
          { label: 'Loại', value: 'All-In-One Liquid Cooler' },
          { label: 'Kích thước Radiator', value: '360mm x 120mm x 30mm' },
          { label: 'Quạt', value: '3x 120mm PWM' },
          { label: 'Tốc độ quạt', value: '500 - 2000 RPM' },
          { label: 'Luồng khí', value: '~78 CFM' },
          { label: 'Độ ồn', value: '21 - 36 dBA' },
          { label: 'Pump', value: 'Asetek 7th gen' },
          { label: 'Tương thích', value: 'Intel LGA 1700/1200, AMD AM5/AM4' },
          { label: 'RGB', value: 'RGB trên pump mirror' },
          { label: 'Bảo hành', value: '6 năm' },
        ],
        brands: ['NZXT', 'Corsair', 'Cooler Master', 'Lian Li'],
        tips: 'AIO 360mm cho CPU Intel i7/i9 hoặc AMD Ryzen 7/9. 240mm/280mm đủ cho i5/Ryzen 5.' },
      { id: 'air-cooler', name: 'Noctua NH-D15', icon: '🌀', desc: 'Tản nhiệt khí cao cấp nhất, ngang ngửa AIO 240mm', role: 'Tản nhiệt không khí - Tản nhiệt bằng quạt và lá nhôm, bền bỉ và yên tĩnh',
        specs: [
          { label: 'Loại', value: 'Dual Tower Air Cooler' },
          { label: 'Kích thước', value: '150 x 165 x 135mm' },
          { label: 'Quạt', value: '2x NF-A15 140mm PWM' },
          { label: 'Tốc độ quạt', value: '300 - 1500 RPM' },
          { label: 'Luồng khí', value: '~140 CFM' },
          { label: 'Độ ồn', value: '~24 dBA' },
          { label: 'Số heatpipe', value: '6 ống đồng Ø6mm' },
          { label: 'TDP hỗ trợ', value: '~250W' },
          { label: 'Bảo hành', value: '6 năm' },
        ],
        brands: ['Noctua', 'be quiet!', 'DeepCool', 'Thermalright'],
        tips: 'Tản khí cao cấp như NH-D15 an toàn hơn AIO, không lo rò rỉ. Phù hợp cho người muốn độ tin cậy cao nhất.' },
    ]
  },
  {
    id: 'case', name: 'Case', color: '#a78bfa',
    icon: <Monitor size={20} />,
    items: [
      { id: 'case-mid', name: 'Lian Li O11 Dynamic EVO', icon: '🏗️', desc: 'Case mid-tower đẹp nhất cho custom loop và trưng bày', role: 'Vỏ máy tính - Bảo vệ và tổ chức linh kiện bên trong, tối ưu luồng khí',
        specs: [
          { label: 'Kích thước', value: 'Mid-Tower' },
          { label: 'Hỗ trợ Mainboard', value: 'ATX, M-ATX, ITX' },
          { label: 'Hỗ trợ GPU', value: 'Tối đa 420mm' },
          { label: 'Hỗ trợ CPU Cooler', value: 'Tối đa 155mm' },
          { label: 'Hỗ trợ Radiator', value: '360mm top/side/bottom' },
          { label: 'Khe mở rộng', value: '7 khe' },
          { label: 'Ổ cứng', value: '2x 3.5" + 4x 2.5"' },
          { label: 'Chất liệu', value: 'Kính cường lực + Thép + Nhôm' },
          { label: 'Luồng khí', value: 'Bottom intake, top/side exhaust' },
          { label: 'Kích thước', value: '445 x 272 x 446 mm' },
        ],
        brands: ['Lian Li', 'Corsair', 'Fractal Design', 'NZXT'],
        tips: 'Chọn case có luồng khí tốt, đủ chỗ cho GPU dài. Mesh front panel cho airflow tối ưu hơn kính.' },
      { id: 'case-mini', name: 'Fractal Design North', icon: '🪵', desc: 'Case ATX phong cách Bắc Âu sang trọng', role: 'Case ATX thiết kế đẹp, kết hợp gỗ và kim loại',
        specs: [
          { label: 'Kích thước', value: 'Mid-Tower ATX' },
          { label: 'Chất liệu', value: 'Thép + Gỗ óc chó + Kính/ Mesh' },
          { label: 'Hỗ trợ GPU', value: 'Tối đa 355mm' },
          { label: 'Hỗ trợ Radiator', value: '240/280mm front' },
          { label: 'Quạt đi kèm', value: '2x 140mm Aspect' },
        ],
        brands: ['Fractal Design', 'Corsair', 'be quiet!'],
        tips: 'Case đẹp giúp không gian làm việc sang trọng hơn. Đừng quên cable management để luồng khí tốt.' },
    ]
  },
  {
    id: 'peripheral', name: 'Ngoại vi', color: '#f97316',
    icon: <MousePointer2 size={20} />,
    items: [
      { id: 'monitor', name: 'LG 27GP950-B 4K 160Hz', icon: '🖥️', desc: 'Màn hình gaming 27" 4K tần số quét cao', role: 'Màn hình - Hiển thị hình ảnh từ GPU, quyết định trải nghiệm thị giác',
        specs: [
          { label: 'Kích thước', value: '27 inch' },
          { label: 'Độ phân giải', value: '3840 x 2160 (4K UHD)' },
          { label: 'Tần số quét', value: '160Hz' },
          { label: 'Panel', value: 'Nano IPS' },
          { label: 'Thời gian phản hồi', value: '1ms GTG' },
          { label: 'HDR', value: 'DisplayHDR 600' },
          { label: 'Độ phủ màu', value: 'DCI-P3 98%' },
          { label: 'Kết nối', value: 'HDMI 2.1 + DP 1.4 + USB-C' },
          { label: 'G-Sync / FreeSync', value: 'G-Sync Compatible + FreeSync' },
          { label: 'Điều chỉnh', value: 'Cao, xoay, nghiêng' },
        ],
        brands: ['LG', 'ASUS', 'Samsung', 'Dell'],
        tips: '27" 1440P là "sweet spot" cho gaming. 4K cho đồ họa và game AAA. IPS cho màu đẹp, TN/VA cho phản hồi nhanh.' },
      { id: 'keyboard', name: 'Logitech G Pro X', icon: '⌨️', desc: 'Bàn phím cơ 60% chuyên nghiệp cho game thủ', role: 'Bàn phím - Thiết bị nhập liệu chính, switch ảnh hưởng trải nghiệm gõ',
        specs: [
          { label: 'Kích thước', value: '60% (không numpad)' },
          { label: 'Switch', value: 'GX Blue/Clicky hoặc GX Red/Linear' },
          { label: 'Kết nối', value: 'USB-C có dây' },
          { label: 'Keycap', value: 'PBT Doubleshot' },
          { label: 'RGB', value: 'Per-key RGB' },
          { label: 'Software', value: 'G Hub' },
          { label: 'Polling Rate', value: '1000Hz' },
        ],
        brands: ['Logitech', 'Razer', 'Corsair', 'Ducky'],
        tips: 'Switch Linear (Red) cho gaming, Clicky (Blue) cho gõ văn bản. 60% tiết kiệm không gian, TKL là cân bằng.' },
      { id: 'mouse', name: 'Razer DeathAdder V3 Pro', icon: '🖱️', desc: 'Chuột gaming không dây siêu nhẹ hàng đầu', role: 'Chuột - Thiết bị điều khiển chính xác, quan trọng cho gaming FPS',
        specs: [
          { label: 'Cảm biến', value: 'Focus Pro 30K' },
          { label: 'DPI', value: '30.000 DPI' },
          { label: 'Kết nối', value: 'Razer HyperSpeed Wireless' },
          { label: 'Trọng lượng', value: '63g' },
          { label: 'Pin', value: '~90 giờ' },
          { label: 'Nút bấm', value: '6 nút lập trình' },
          { label: 'Switch', value: 'Razer Optical Gen-3' },
          { label: 'Polling Rate', value: '1000Hz (có thể lên 4000Hz)' },
        ],
        brands: ['Razer', 'Logitech', 'SteelSeries', 'Zowie'],
        tips: 'Chuột dưới 80g là lý tưởng cho FPS. DPI cao không = tốt hơn. Hầu hết game thủ chuyên nghiệp dùng 400-1600 DPI.' },
      { id: 'headset', name: 'SteelSeries Arctis Nova Pro', icon: '🎧', desc: 'Tai nghe gaming cao cấp nhất với âm thanh vòm', role: 'Tai nghe - Âm thanh định vị trong game và giao tiếp với đồng đội',
        specs: [
          { label: 'Loại', value: 'Over-ear, Closed-back' },
          { label: 'Driver', value: '40mm Neodymium' },
          { label: 'Âm thanh', value: 'Sonar Audio + 360° Spatial Audio' },
          { label: 'Microphone', value: 'ClearCast gen 2 (khuếch đại AI)' },
          { label: 'Kết nối', value: 'USB-C + 3.5mm' },
          { label: 'ANC', value: 'Active Noise Cancellation' },
          { label: 'Pin', value: '~22 giờ' },
          { label: 'Trọng lượng', value: '298g' },
        ],
        brands: ['SteelSeries', 'HyperX', 'Logitech', 'Razer'],
        tips: 'Tai nghe có mic rời và ANC giúp tập trung hơn trong game. Open-back cho âm trường rộng hơn nhưng lọt âm.' },
    ]
  },
  {
    id: 'network', name: 'Mạng', color: '#3b82f6',
    icon: <Wifi size={20} />,
    items: [
      { id: 'router', name: 'TP-Link Deco XE75 (WiFi 6E)', icon: '📡', desc: 'Hệ thống mesh WiFi 6E 3 băng tần', role: 'Router - Phân phối Internet không dây đến các thiết bị trong nhà',
        specs: [
          { label: 'Chuẩn WiFi', value: 'WiFi 6E (802.11ax)' },
          { label: 'Băng tần', value: 'Tri-band (6GHz + 5GHz + 2.4GHz)' },
          { label: 'Tốc độ tối đa', value: 'Lên đến 5.400 Mbps' },
          { label: 'Bảo mật', value: 'WPA3' },
          { label: 'Số thiết bị', value: 'Hỗ trợ ~150 thiết bị' },
          { label: 'Kết nối', value: '1x WAN 2.5G + 2x LAN Gigabit' },
          { label: 'Mesh', value: 'Có (tự động chuyển mạng)' },
        ],
        brands: ['TP-Link', 'ASUS', 'Netgear', 'Ubiquiti'],
        tips: 'WiFi 6E cho tốc độ cao và ít nhiễu. Mesh cho nhà nhiều tầng. Luôn dùng cáp Ethernet cho PC gaming.' },
      { id: 'switch', name: 'Netgear GS308 8-Port', icon: '🔀', desc: 'Switch mạng Gigabit 8 cổng giá rẻ', role: 'Switch - Mở rộng số cổng mạng có dây trong nhà',
        specs: [
          { label: 'Số cổng', value: '8x Gigabit Ethernet' },
          { label: 'Chuẩn', value: 'IEEE 802.3ab' },
          { label: 'Băng thông', value: '16 Gbps (chuyển mạch)' },
          { label: 'Jumbo Frame', value: 'Hỗ trợ' },
          { label: 'Không quạt', value: 'Fanless (yên tĩnh)' },
          { label: 'Kim loại', value: 'Vỏ kim loại chắc chắn' },
        ],
        brands: ['Netgear', 'TP-Link', 'Cisco', 'D-Link'],
        tips: 'Switch không quạt cho văn phòng yên tĩnh. Cáp CAT6 cho tốc độ 10Gbps trong tương lai.' },
    ]
  },
  {
    id: 'display', name: 'Hiển thị', color: '#10b981',
    icon: <Eye size={20} />,
    items: [
      { id: 'projector', name: 'BenQ TH671ST', icon: '📽️', desc: 'Máy chiếu gaming Full HD tầm ngắn', role: 'Máy chiếu - Hiển thị hình ảnh cực lớn cho gaming và giải trí',
        specs: [
          { label: 'Độ phân giải', value: '1920 x 1080 (Full HD)' },
          { label: 'Độ sáng', value: '3.000 ANSI Lumens' },
          { label: 'Tỉ lệ tương phản', value: '10.000:1' },
          { label: 'Khoảng cách chiếu', value: '1.5-3m cho 100"' },
          { label: 'Tần số quét', value: '120Hz' },
          { label: 'Input Lag', value: '16.7ms (gaming mode)' },
          { label: 'Cổng', value: 'HDMI 1.4 + VGA' },
          { label: 'Tuổi thọ bóng', value: '15.000 giờ (SmartEco)' },
        ],
        brands: ['BenQ', 'Epson', 'Optoma', 'LG'],
        tips: 'Máy chiếu gaming cần input lag thấp. TH671ST có khoảng cách chiếu ngắn, phù hợp phòng nhỏ.' },
      { id: 'oled', name: 'LG OLED42C3 42"', icon: '✨', desc: 'Màn hình OLED 42" dùng làm monitor gaming', role: 'Màn hình OLED - Công nghệ hiển thị cao cấp nhất với màu đen sâu và màu sắc rực rỡ',
        specs: [
          { label: 'Kích thước', value: '42 inch' },
          { label: 'Công nghệ', value: 'OLED (tự phát sáng)' },
          { label: 'Độ phân giải', value: '3840 x 2160 (4K)' },
          { label: 'Tần số quét', value: '120Hz' },
          { label: 'HDR', value: 'Dolby Vision + HDR10' },
          { label: 'Input Lag', value: '< 5ms' },
          { label: 'Kết nối', value: '4x HDMI 2.1' },
          { label: 'G-Sync', value: 'G-Sync Compatible' },
        ],
        brands: ['LG', 'Samsung', 'Sony'],
        tips: 'OLED cho chất lượng hình ảnh tốt nhất nhưng có nguy cơ burn-in. Phù hợp cho gaming và xem phim hơn là làm việc văn phòng.' },
    ]
  },
]

const QUIZ_QUESTIONS = [
  { q: 'Thành phần nào được ví là "bộ não" của máy tính?', opts: ['CPU', 'GPU', 'RAM', 'SSD'], ans: 0 },
  { q: 'Chuẩn kết nối SSD NVMe nhanh nhất hiện nay?', opts: ['PCIe 5.0', 'PCIe 4.0', 'SATA III', 'M.2 SATA'], ans: 0 },
  { q: 'Dung lượng RAM tối thiểu cho gaming hiện nay?', opts: ['16GB', '8GB', '32GB', '4GB'], ans: 0 },
  { q: 'Nguồn 80+ Gold có hiệu suất bao nhiêu?', opts: ['87-90%', '80-85%', '92-95%', '75-80%'], ans: 0 },
  { q: 'Socket LGA 1700 dùng cho CPU nào?', opts: ['Intel 12/13/14', 'AMD Ryzen 7000', 'Intel 10/11', 'AMD Ryzen 5000'], ans: 0 },
  { q: 'DLSS là công nghệ của hãng nào?', opts: ['NVIDIA', 'AMD', 'Intel', 'Apple'], ans: 0 },
  { q: 'RAM DDR5 có tốc độ bus bao nhiêu?', opts: ['4800-8400 MT/s', '2400-3200 MT/s', '1600-2133 MT/s', '800-1066 MT/s'], ans: 0 },
  { q: 'Tản nhiệt nào hiệu quả nhất cho CPU?', opts: ['Custom Loop WC', 'AIO 360mm', 'Tản khí cao cấp', 'Quạt stock'], ans: 0 },
  { q: 'Chipset nào cho phép ép xung CPU Intel?', opts: ['Z790', 'B760', 'H610', 'Q670'], ans: 0 },
  { q: 'Chuẩn WiFi nào mới nhất?', opts: ['WiFi 7', 'WiFi 6E', 'WiFi 6', 'WiFi 5'], ans: 0 },
]

export default function ComponentLabPage() {
  const [activeCategory, setActiveCategory] = useState(COMPONENT_DATA[0].id)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [gameMode, setGameMode] = useState<'browse' | 'quiz'>('browse')
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [quizDone, setQuizDone] = useState(false)
  const [showSpecs, setShowSpecs] = useState<string | null>(null)

  const activeItems = useMemo(() => {
    const cat = COMPONENT_DATA.find(c => c.id === activeCategory)
    if (!cat) return []
    if (!searchTerm) return cat.items
    return cat.items.filter(i =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeCategory, searchTerm])

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return COMPONENT_DATA
    return COMPONENT_DATA.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm])

  function handleAnswer(idx: number) {
    if (quizFeedback) return
    const correct = idx === QUIZ_QUESTIONS[quizIdx].ans
    if (correct) { setQuizFeedback('correct'); setQuizScore(prev => prev + 1) }
    else setQuizFeedback('wrong')
    setTimeout(() => {
      if (quizIdx < QUIZ_QUESTIONS.length - 1) {
        setQuizIdx(prev => prev + 1); setQuizFeedback(null)
      } else { setQuizDone(true) }
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '4px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FlaskConical size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                PC COMPONENT LAB
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Phòng thí nghiệm linh kiện - Khám phá, học tập, thực hành
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { setGameMode('browse'); setQuizDone(false); setQuizIdx(0); setQuizScore(0); setQuizFeedback(null) }}
              style={{
                padding: '6px 14px', border: `1px solid ${gameMode === 'browse' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                background: gameMode === 'browse' ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
                color: gameMode === 'browse' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer',
              }}>
              <BookOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              TRA CỨU
            </button>
            <button onClick={() => setGameMode('quiz')}
              style={{
                padding: '6px 14px', border: `1px solid ${gameMode === 'quiz' ? 'var(--accent-amber)' : 'var(--border-default)'}`,
                background: gameMode === 'quiz' ? 'color-mix(in srgb, var(--accent-amber) 12%, transparent)' : 'transparent',
                color: gameMode === 'quiz' ? 'var(--accent-amber)' : 'var(--text-muted)',
                fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer',
              }}>
              <Beaker size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              THỬ THÁCH
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm linh kiện (CPU, GPU, RAM...)"
            style={{
              width: '100%', padding: '8px 12px 8px 36px',
              border: '1px solid var(--border-default)', background: 'var(--bg-surface)',
              color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
              fontFamily: 'inherit',
            }} />
        </div>

        {gameMode === 'quiz' ? (
          <div>
            {quizDone ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
              }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Trophy size={64} style={{ color: 'var(--accent-amber)', margin: '0 auto 16px' }} />
                </motion.div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>HOÀN THÀNH!</h2>
                <div style={{
                  display: 'inline-block', padding: '12px 24px',
                  border: '1px solid var(--brand-primary)', marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>KẾT QUẢ</div>
                  <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                    {quizScore}/{QUIZ_QUESTIONS.length}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {quizScore >= 8 ? 'Xuất sắc! Bạn là chuyên gia linh kiện!' :
                   quizScore >= 6 ? 'Khá tốt! Còn vài thứ cần học thêm.' :
                   'Cần học thêm về linh kiện. Hãy tra cứu ở tab trên!'}
                </div>
                <button onClick={() => { setQuizDone(false); setQuizIdx(0); setQuizScore(0); setQuizFeedback(null) }}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--brand-primary)', color: 'var(--bg-base)',
                    border: 'none', fontWeight: 700, fontFamily: 'var(--font-mono)',
                    cursor: 'pointer', fontSize: '12px',
                  }}>
                  CHƠI LẠI
                </button>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                padding: '24px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderTop: '2px solid var(--accent-amber)', borderLeft: '2px solid var(--accent-amber)' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', borderTop: '2px solid var(--accent-amber)', borderRight: '2px solid var(--accent-amber)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--accent-amber)', borderLeft: '2px solid var(--accent-amber)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--accent-amber)', borderRight: '2px solid var(--accent-amber)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Beaker size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      THỬ THÁCH KIẾN THỨC LINH KIỆN
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {quizIdx + 1}/{QUIZ_QUESTIONS.length}
                  </span>
                </div>

                {/* Progress */}
                <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', marginBottom: '24px', border: '1px solid var(--border-default)' }}>
                  <div style={{ width: `${((quizIdx + 1) / QUIZ_QUESTIONS.length) * 100}%`, height: '100%', background: 'var(--accent-amber)', transition: 'width 0.3s' }} />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={quizIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', lineHeight: 1.4 }}>
                      {QUIZ_QUESTIONS[quizIdx].q}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {QUIZ_QUESTIONS[quizIdx].opts.map((opt, i) => {
                        const isCorrect = i === QUIZ_QUESTIONS[quizIdx].ans
                        const isSelected = quizFeedback && (quizFeedback === 'correct' ? isCorrect : i === (quizFeedback === 'wrong' ? (() => { for (let j = 0; j < QUIZ_QUESTIONS[quizIdx].opts.length; j++) { if (j === QUIZ_QUESTIONS[quizIdx].ans) return j } return -1 })() : -1))
                        const showCorrect = quizFeedback && isCorrect
                        const showWrong = quizFeedback === 'wrong' && i !== QUIZ_QUESTIONS[quizIdx].ans && (() => {
                          for (let j = 0; j < QUIZ_QUESTIONS[quizIdx].opts.length; j++) {
                            if (j === quizIdx) return false
                          }
                          return false
                        })()
                        
                        let bg = 'var(--bg-base)'
                        let border = 'var(--border-default)'
                        let textColor = 'var(--text-primary)'
                        let icon = ['A', 'B', 'C', 'D'][i]
                        
                        if (quizFeedback) {
                          if (isCorrect) { bg = 'color-mix(in srgb, var(--brand-primary) 15%, transparent)'; border = 'var(--brand-primary)'; textColor = 'var(--brand-primary)' }
                          else if (i === QUIZ_QUESTIONS[quizIdx].ans) { bg = 'color-mix(in srgb, var(--brand-primary) 15%, transparent)'; border = 'var(--brand-primary)'; textColor = 'var(--brand-primary)' }
                           else { bg = 'var(--bg-base)'; border = 'var(--border-default)'; textColor = 'var(--text-muted)' }
                        }

                        return (
                          <button key={i} onClick={() => handleAnswer(i)} disabled={!!quizFeedback}
                            style={{
                              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                              background: quizFeedback ? (i === QUIZ_QUESTIONS[quizIdx].ans ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' : 'color-mix(in srgb, var(--text-muted) 5%, transparent)') : 'var(--bg-base)',
                              border: `1px solid ${quizFeedback ? (i === QUIZ_QUESTIONS[quizIdx].ans ? 'var(--brand-primary)' : 'var(--border-default)') : 'var(--border-default)'}`,
                              color: quizFeedback ? (i === QUIZ_QUESTIONS[quizIdx].ans ? 'var(--brand-primary)' : 'var(--text-muted)') : 'var(--text-primary)',
                              cursor: quizFeedback ? 'default' : 'pointer',
                              textAlign: 'left', fontSize: '13px', fontWeight: 600,
                              opacity: quizFeedback && i !== QUIZ_QUESTIONS[quizIdx].ans ? 0.5 : 1,
                              transition: 'all 0.2s',
                              fontFamily: 'inherit',
                            }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '2px',
                              background: quizFeedback ? (i === QUIZ_QUESTIONS[quizIdx].ans ? 'var(--brand-primary)' : 'var(--border-subtle)') : 'var(--border-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: 700,
                              color: quizFeedback ? (i === QUIZ_QUESTIONS[quizIdx].ans ? '#fff' : 'var(--text-muted)') : 'var(--text-muted)',
                              flexShrink: 0,
                            }}>
                              {quizFeedback && i === QUIZ_QUESTIONS[quizIdx].ans ? <CheckCircle size={14} /> : quizFeedback ? <XCircle size={14} style={{ opacity: 0 }} /> : icon}
                            </div>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {quizFeedback && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', background: quizFeedback === 'correct' ? 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' : 'color-mix(in srgb, var(--danger) 8%, transparent)', border: `1px solid ${quizFeedback === 'correct' ? 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' : 'color-mix(in srgb, var(--danger) 20%, transparent)'}`, fontSize: '11px', color: quizFeedback === 'correct' ? 'var(--brand-primary)' : 'var(--danger)' }}>
                    {quizFeedback === 'correct' ? '✓ Chính xác!' : `✗ Sai! Đáp án đúng: ${QUIZ_QUESTIONS[quizIdx].opts[QUIZ_QUESTIONS[quizIdx].ans]}`}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {filteredCategories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px',
                    border: `1px solid ${activeCategory === cat.id ? cat.color : 'var(--border-default)'}`,
                    background: activeCategory === cat.id ? `color-mix(in srgb, ${cat.color} 12%, transparent)` : 'transparent',
                    color: activeCategory === cat.id ? cat.color : 'var(--text-muted)',
                    fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Component Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              <AnimatePresence mode="popLayout">
                {activeItems.map(comp => (
                  <motion.div key={comp.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      border: `1px solid ${showSpecs === comp.id ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                      background: showSpecs === comp.id ? 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' : 'var(--bg-surface)',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onClick={() => setShowSpecs(showSpecs === comp.id ? null : comp.id)}>
                    {/* Corner */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '4px', borderTop: '1px solid var(--brand-primary)', borderLeft: '1px solid var(--brand-primary)', opacity: 0.3 }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: showSpecs === comp.id ? '10px' : 0 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '2px',
                        background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0,
                      }}>
                        {comp.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{comp.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{comp.desc}</div>
                      </div>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: showSpecs === comp.id ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
                    </div>

                    <AnimatePresence>
                      {showSpecs === comp.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          style={{ borderTop: '1px solid var(--border-default)', paddingTop: '10px' }}>
                          
                          {/* Role */}
                          <div style={{
                            marginBottom: '10px', padding: '6px 8px',
                            background: 'color-mix(in srgb, var(--accent-blue) 8%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--accent-blue) 15%, transparent)',
                            fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4,
                          }}>
                            <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>VAI TRÒ:</span> {comp.role}
                          </div>

                          {/* Specs Table */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                              THÔNG SỐ KỸ THUẬT
                            </div>
                            {comp.specs.map((s, i) => (
                              <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '3px 6px',
                                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                fontSize: '10px',
                              }}>
                                <span style={{ color: 'var(--text-muted)', flex: '0 0 120px', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>{s.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* Brands */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                              THƯƠNG HIỆU
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {comp.brands.map(b => (
                                <span key={b} style={{
                                  padding: '2px 6px',
                                  border: '1px solid var(--border-default)',
                                  fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)',
                                  fontFamily: 'var(--font-mono)',
                                }}>{b}</span>
                              ))}
                            </div>
                          </div>

                          {/* Tips */}
                          <div style={{
                            padding: '6px 8px',
                            background: 'color-mix(in srgb, var(--accent-amber) 6%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--accent-amber) 12%, transparent)',
                            fontSize: '10px', color: 'var(--text-muted)',
                          }}>
                            <span style={{ color: 'var(--accent-amber)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>MẸO:</span> {comp.tips}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {activeItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div style={{ fontSize: '13px' }}>Không tìm thấy linh kiện "{searchTerm}"</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
