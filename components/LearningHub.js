'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Play, FileText, Lock, ArrowLeft, Zap, Crown, X, CheckCircle, ChevronRight, Search, Clock, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

const PCourseViewer = dynamic(() => import('./PCourseViewer'), { ssr: false });
const SlideViewer = dynamic(() => import('./SlideViewer'), { ssr: false });

const FREE_LIMITS = { course: 3, video: 2, slide: 1 };
const UNLOCK_KEY = 'pcm_unlocked_pro';

function isUnlocked() {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(UNLOCK_KEY) === 'true'; } catch { return false; }
}

const VIDEO_LESSONS = [
  // 1. Bo Mạch Chủ
  {
    id: 'mb-3d-1',
    youtubeId: 'XkoM-rkX1uE',
    title: 'Mô phỏng 3D Cấu tạo & Chức năng Bo Mạch Chủ (Mainboard) - Tập 1',
    category: 'Bo Mạch Chủ',
    description: 'Video 3D mô phỏng chi tiết các linh kiện tích hợp trên Mainboard bao gồm Socket CPU, VRM cấp nguồn, Chipset Nam/Bắc, Khe RAM DDR, PCIe và cổng kết nối I/O.',
    duration: '14:25',
    level: 'Cơ bản',
    author: '3D Animation Hardware',
    topics: ['Mainboard', 'Socket CPU', 'VRM', 'Chipset']
  },
  {
    id: 'mb-3d-2',
    youtubeId: 'lwaQ8D8hwTY',
    title: 'Nguyên lý hoạt động Bus & Chipset trên Bo Mạch Chủ PC 3D',
    category: 'Bo Mạch Chủ',
    description: 'Phân tích trực quan 3D quy trình truyền dữ liệu giữa CPU, RAM và GPU thông qua hệ thống Bus dữ liệu (Data Bus) và Chipset điều khiển.',
    duration: '11:40',
    level: 'Trung cấp',
    author: '3D Technology Visuals',
    topics: ['System Bus', 'Data Bus', 'Chipset', 'PCIe']
  },
  {
    id: 'mb-3d-3',
    youtubeId: 'TsB2H1QPrCI',
    title: 'Sơ đồ đường mạch & Mạch điện VRM trên Bo Mạch Chủ Máy Tính',
    category: 'Bo Mạch Chủ',
    description: 'Hình ảnh 3D mô phỏng các pha nguồn VRM, Mosfet, Choke và Tụ điện cung cấp dòng điện 12V ổn định cho Vi xử lý CPU.',
    duration: '09:50',
    level: 'Nâng cao',
    author: '3D Engineering Labs',
    topics: ['VRM', 'Phase Power', 'Mosfet', 'Power Delivery']
  },

  // 2. Vi Xử Lý (CPU)
  {
    id: 'cpu-3d-1',
    youtubeId: '_Pqfjer8-O4',
    title: 'Mô phỏng 3D Cấu trúc Bên trong Chip CPU Vi Xử Lý',
    category: 'Vi Xử Lý CPU',
    description: 'Bên trong nhân CPU: Hàng tỷ bóng bán dẫn Transistor nanomet, ALU (Khối đại số logic), Control Unit và các tầng bộ nhớ đệm L1/L2/L3 Cache.',
    duration: '15:10',
    level: 'Cơ bản',
    author: '3D Animation Hardware',
    topics: ['Transistor', 'ALU', 'Cache L3', 'Architecture']
  },
  {
    id: 'cpu-3d-2',
    youtubeId: 'dX9CGRZwD-w',
    title: 'Quy trình Xử lý Lệnh & Xung Nhịp Clock Speed của CPU 3D',
    category: 'Vi Xử Lý CPU',
    description: 'Giải thích đồ họa 3D chu kỳ nạp lệnh (Fetch), giải mã (Decode) và thực thi (Execute) của vi xử lý theo từng xung nhịp đồng hồ GHz.',
    duration: '12:15',
    level: 'Trung cấp',
    author: '3D Technology Visuals',
    topics: ['Fetch Decode Execute', 'Clock Speed', 'GHz', 'Pipeline']
  },
  {
    id: 'cpu-3d-3',
    youtubeId: '16zrEPOsIcI',
    title: 'Kiến trúc Đa Nhân (Multi-Core) & Siêu Luồng (Hyper-Threading)',
    category: 'Vi Xử Lý CPU',
    description: 'Mô phỏng cách CPU phân chia công việc cho nhân P-Core (Hiệu năng) và E-Core (Tiết kiệm điện) cùng công nghệ siêu luồng phân luồng dữ liệu.',
    duration: '10:30',
    level: 'Nâng cao',
    author: '3D Microelectronics',
    topics: ['Multi-Core', 'Hyper-Threading', 'P-Core', 'E-Core']
  },
  {
    id: 'cpu-3d-4',
    youtubeId: 'NKfW8ijmRQ4',
    title: 'Quá trình Sản xuất Vi Chip CPU từ Cát Thạch Anh (Silicon Wafer)',
    category: 'Vi Xử Lý CPU',
    description: 'Hành trình 3D từ cát thạch anh tinh khiết đến đĩa Wafer silicon và công nghệ quang khắc cực tím EUV khắc bóng bán dẫn 3nm.',
    duration: '18:00',
    level: 'Cơ bản',
    author: '3D Fabrication Academy',
    topics: ['Silicon Wafer', 'EUV Lithography', '3nm Process', 'Semiconductor']
  },

  // 3. Card Đồ Họa (GPU)
  {
    id: 'gpu-3d-1',
    youtubeId: 'h9Z4oGN89MU',
    title: 'Mô phỏng 3D Cấu tạo Card Đồ Họa rời (VGA / GPU)',
    category: 'Card Đồ Họa GPU',
    description: 'Chi tiết nhân GPU đồ họa, chip nhớ VRAM GDDR6X, hệ thống quạt tản nhiệt khí Heatpipe và cổng xuất hình HDMI / DisplayPort.',
    duration: '13:45',
    level: 'Cơ bản',
    author: '3D Animation Hardware',
    topics: ['GPU Core', 'VRAM', 'GDDR6X', 'Heatpipe']
  },
  {
    id: 'gpu-3d-2',
    youtubeId: 'C8YtdC8mxTU',
    title: 'Nguyên lý Dựng Hình 3D & Công nghệ Ray Tracing trong GPU',
    category: 'Card Đồ Họa GPU',
    description: 'Cách nhân Tensor Cores và RT Cores xử lý tia sáng thực tế (Ray Tracing) và tái tạo điểm ảnh đồ họa 4K với AI DLSS.',
    duration: '16:20',
    level: 'Nâng cao',
    author: '3D Graphics Tech',
    topics: ['Ray Tracing', 'RT Cores', 'Tensor Cores', 'DLSS']
  },

  // 4. Ổ Cứng SSD
  {
    id: 'ssd-3d-1',
    youtubeId: 'r-SivgEpA1Q',
    title: 'Mô phỏng 3D Cấu tạo & Nguyên lý lưu trữ Ổ Cứng SSD NVMe M.2',
    category: 'Ổ Cứng SSD',
    description: 'Cấu tạo bên trong chip nhớ NAND Flash 3D, Controller điều khiển và giao thức NVMe PCIe Gen 4/Gen 5 tốc độ 7000MB/s.',
    duration: '11:05',
    level: 'Cơ bản',
    author: '3D Storage World',
    topics: ['SSD M.2', 'NVMe', 'NAND Flash', 'Controller']
  },
  {
    id: 'ssd-3d-2',
    youtubeId: '5Mh3o886qpg',
    title: 'So sánh Nguyên lý Hoạt động SSD Thể Rắn vs HDD Đĩa Quay 3D',
    category: 'Ổ Cứng SSD',
    description: 'Trực quan 3D sự khác biệt giữa kim đọc ghi trên phiến đĩa từ HDD và các tế bào nhớ điện tử Floating Gate Transistor của SSD.',
    duration: '09:40',
    level: 'Cơ bản',
    author: '3D Technology Visuals',
    topics: ['SSD vs HDD', 'Platter', 'NAND Flash', 'Read Write Speed']
  },
  {
    id: 'ssd-3d-3',
    youtubeId: 'E7Up7VuFd8A',
    title: 'Cấu trúc Chip nhớ 3D NAND Flash TLC / QLC trong SSD',
    category: 'Ổ Cứng SSD',
    description: 'Mô phỏng các lớp tế bào nhớ nạp điện tích theo mô hình chồng tầng 3D V-NAND tăng mật độ dung lượng lưu trữ.',
    duration: '12:50',
    level: 'Trung cấp',
    author: '3D Memory Academy',
    topics: ['3D NAND', 'TLC', 'QLC', 'V-NAND']
  },
  {
    id: 'ssd-3d-4',
    youtubeId: 'Cw6cJNtpqAU',
    title: 'Bộ nhớ Đệm DRAM Cache & Thuật toán SLC Caching trên SSD',
    category: 'Ổ Cứng SSD',
    description: 'Giải thích vai trò của chip DRAM Cache giúp lưu bản đồ ánh xạ địa chỉ ô nhớ và duy trì tốc độ đọc ghi ổn định.',
    duration: '08:30',
    level: 'Nâng cao',
    author: '3D Tech Review',
    topics: ['DRAM Cache', 'SLC Caching', 'Wear Leveling', 'Trim']
  },

  // 5. Bộ Nhớ RAM
  {
    id: 'ram-3d-1',
    youtubeId: '7J7X7aZvMXQ',
    title: 'Mô phỏng 3D Cấu tạo & Cơ chế Lưu Trữ Tạm Thời của RAM DDR4 / DDR5',
    category: 'Bộ Nhớ RAM',
    description: 'Hình ảnh 3D mô phỏng các ô nhớ Tụ Điện & Transistor (1T1C) nạp xả điện tích liên tục để lưu trữ dữ liệu tạm thời cho CPU.',
    duration: '10:55',
    level: 'Cơ bản',
    author: '3D Animation Hardware',
    topics: ['RAM DDR5', 'Capacitor', 'Cell Array', 'DRAM']
  },
  {
    id: 'ram-3d-2',
    youtubeId: 'TfhL5kBiQVI',
    title: 'Nguyên lý Băng Thông Dual-Channel & Độ Trễ Timing CAS Latency',
    category: 'Bộ Nhớ RAM',
    description: 'Đồ họa 3D đường truyền bus RAM 64-bit nhân đôi thành 128-bit Dual Channel và độ trễ phản hồi dữ liệu CL (CAS Latency).',
    duration: '13:10',
    level: 'Trung cấp',
    author: '3D Performance Hardware',
    topics: ['Dual Channel', 'Bus Speed', 'CAS Latency', 'Timing']
  },

  // 6. Tản Nhiệt CPU
  {
    id: 'cooler-3d-1',
    youtubeId: 'FcvAC07T6ms',
    title: 'Mô phỏng 3D Nguyên lý Dẫn Nhiệt Ống Đồng Heatpipe Tản Nhiệt Khí',
    category: 'Tản Nhiệt CPU',
    description: 'Quy trình tuần hoàn chất lỏng bốc hơi và ngưng tụ bên trong ống đồng Heatpipe giúp giải nhiệt cực nhanh cho bề mặt CPU IHS.',
    duration: '09:15',
    level: 'Cơ bản',
    author: '3D Thermal Systems',
    topics: ['Air Cooling', 'Heatpipe', 'Vaporization', 'IHS']
  },
  {
    id: 'cooler-3d-2',
    youtubeId: 'ieMvtUpFENM',
    title: 'Nguyên lý Hoạt động Tản Nhiệt Nước AIO (Liquid Cooling) 3D',
    category: 'Tản Nhiệt CPU',
    description: 'Đồ họa 3D mô phỏng bơm nước Pump, lá đồng Micro-fin, ống dẫn dung dịch coolant và Két nước Radiator giải nhiệt bằng quạt.',
    duration: '11:50',
    level: 'Trung cấp',
    author: '3D Fluid Dynamics',
    topics: ['AIO Liquid Cooler', 'Pump', 'Radiator', 'Micro-fin']
  },

  // 7. Quạt Case
  {
    id: 'fan-3d-1',
    youtubeId: 'YNcd-IGMj2c',
    title: 'Mô phỏng 3D Luồng Khí Airflow & Nguyên lý Động Cơ Quạt Case PC',
    category: 'Quạt Case',
    description: 'Thiết kế 3D áp suất không khí Static Pressure, luồng khí Intake/Exhaust và động cơ đệm từ Hydraulic / Fluid Dynamic Bearing.',
    duration: '08:45',
    level: 'Cơ bản',
    author: '3D Aerodynamics',
    topics: ['Airflow', 'Static Pressure', 'Intake Exhaust', 'FDB Bearing']
  },
  {
    id: 'fan-3d-2',
    youtubeId: 'mMAUZ09rCUc',
    title: 'Điều Tốc Quạt PWM 4-Pin & Đèn LED RGB Addressable 3D',
    category: 'Quạt Case',
    description: 'Giải thích xung điều tốc PWM 4-pin điều chỉnh tốc độ RPM tự động và các bóng LED ARGB 5V lập trình hiệu ứng ánh sáng.',
    duration: '07:30',
    level: 'Trung cấp',
    author: '3D Hardware Tech',
    topics: ['PWM Control', 'RPM', 'ARGB 5V', 'Fan Motor']
  }
];

const CATEGORIES = [
  'Tất cả',
  'Bo Mạch Chủ',
  'Vi Xử Lý CPU',
  'Card Đồ Họa GPU',
  'Ổ Cứng SSD',
  'Bộ Nhớ RAM',
  'Tản Nhiệt CPU',
  'Quạt Case'
];

/* ────────── PRICING MODAL ────────── */
function PricingModal({ onClose, onUnlock }) {
  const plans = [
    {
      id: 'personal',
      icon: '👤',
      name: 'Cá Nhân',
      price: '55.000đ',
      unit: '/ tháng',
      color: '#00d4aa',
      highlight: false,
      features: ['Toàn bộ khóa học (20 chương)', '19 Video bài giảng 3D', 'Tất cả Slide 3D', 'Không giới hạn luyện tập'],
    },
    {
      id: 'school',
      icon: '🏫',
      name: 'Trường Học / Doanh Nghiệp',
      price: '32.000đ',
      unit: '/ học sinh / tháng',
      color: '#6366f1',
      highlight: true,
      features: ['Tất cả quyền lợi Cá nhân', 'Dashboard quản lý lớp', 'Báo cáo tiến độ học sinh', 'Hỗ trợ ưu tiên 24/7'],
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '560px', width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: '8px', width: '32px', height: '32px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}><X size={16} /></button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '99px',
            background: 'rgba(255,185,0,0.1)', border: '1px solid rgba(255,185,0,0.2)',
            marginBottom: '14px',
          }}>
            <Crown size={14} style={{ color: '#ffb900' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffb900' }}>NÂNG CẤP TÀI KHOẢN</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Mở khóa toàn bộ nội dung học tập
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Chọn gói phù hợp với bạn
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              border: `1.5px solid ${plan.highlight ? plan.color : 'var(--border-default)'}`,
              borderRadius: '14px',
              padding: '20px',
              background: plan.highlight ? `${plan.color}08` : 'var(--bg-elevated)',
              position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff',
                  fontSize: '11px', fontWeight: 700, padding: '2px 12px', borderRadius: '99px',
                }}>PHỔ BIẾN NHẤT</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>{plan.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: plan.color }}>{plan.price}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{plan.unit}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            try { localStorage.setItem(UNLOCK_KEY, 'true'); } catch {}
            onUnlock?.();
            onClose();
          }}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
          }}
        >
          <Zap size={16} />
          ⚡ TỰ ĐỘNG KÍCH HOẠT MIỄN PHÍ 0Đ
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', marginBottom: 0 }}>
          Demo — Bấm để mở khóa toàn bộ nội dung ngay lập tức
        </p>
      </div>
    </div>
  );
}

/* ────────── VIDEO HUB COMPONENT WITH YOUTUBE PLAYER ────────── */
function VideoHub({ unlocked, onRequestUpgrade }) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredVideos = useMemo(() => {
    return VIDEO_LESSONS.filter(video => {
      const matchCat = selectedCategory === 'Tất cả' || video.category === selectedCategory;
      const matchSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ width: '100%' }}>
      {/* Search & Category Filter Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: 'var(--brand-primary)' }} />
              Video Bài Giảng 3D Animation
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {unlocked ? `${VIDEO_LESSONS.length} video 3D mô phỏng trực quan` : `Miễn phí ${FREE_LIMITS.video} video đầu tiên · Nâng cấp để mở toàn bộ`}
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm video, linh kiện..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                borderRadius: '8px', border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: '99px',
                  background: active ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredVideos.map((video, idx) => {
          const originalIndex = VIDEO_LESSONS.findIndex(v => v.id === video.id);
          const locked = !unlocked && originalIndex >= FREE_LIMITS.video;

          return (
            <div
              key={video.id}
              onClick={() => {
                if (locked) { onRequestUpgrade(); return; }
                setActiveVideo(video);
              }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px', overflow: 'hidden',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s', opacity: locked ? 0.7 : 1,
                position: 'relative',
              }}
              onMouseOver={e => {
                if (!locked) {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: locked ? 0.4 : 0.85 }}
                />
                
                {/* Duration Badge */}
                <div style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.75)', color: '#fff',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Clock size={10} /> {video.duration}
                </div>

                {/* Level Tag */}
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: video.level === 'Cơ bản' ? 'rgba(0,212,170,0.9)' : video.level === 'Trung cấp' ? 'rgba(40,156,249,0.9)' : 'rgba(255,185,0,0.9)',
                  color: '#fff', padding: '2px 8px', borderRadius: '4px',
                  fontSize: '10px', fontWeight: 700,
                }}>
                  {video.level}
                </div>

                {/* Play or Lock Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: locked ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
                }}>
                  {locked ? (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.7)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#ffb900',
                      border: '1px solid rgba(255,185,0,0.4)',
                    }}>
                      <Lock size={20} />
                    </div>
                  ) : (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'var(--brand-primary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#fff',
                      boxShadow: '0 4px 14px rgba(0,212,170,0.4)',
                    }}>
                      <Play size={20} style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info section */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {video.title}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                  {video.description}
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {video.topics.slice(0, 3).map(t => (
                    <span key={t} style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                      background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                      border: '1px solid var(--border-default)',
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* YOUTUBE PLAYER MODAL */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '900px',
              background: 'var(--bg-surface)', borderRadius: '16px',
              overflow: 'hidden', border: '1px solid var(--border-default)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center',
              justify: 'space-between', borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                  {activeVideo.title}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {activeVideo.category} • {activeVideo.author}
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                  borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* YouTube Iframe Container */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Description Footer */}
            <div style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {activeVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────── MAIN LEARNING HUB ────────── */
export default function LearningHub({ lang = 'vn', onBack }) {
  const [tab, setTab] = useState('menu'); // 'menu' | 'course' | 'video' | 'slide'
  const [unlocked, setUnlocked] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => { setUnlocked(isUnlocked()); }, []);

  const tabs = [
    {
      id: 'course',
      icon: '📚',
      title: 'Khóa Học',
      desc: 'Giáo trình kỹ thuật phần cứng PC (20 chương)',
      freeText: `Miễn phí ${FREE_LIMITS.course} bài đầu`,
      color: '#f59e0b',
    },
    {
      id: 'video',
      icon: '🎬',
      title: 'Video Bài Giảng 3D',
      desc: '19 video animation linh kiện PC chi tiết',
      freeText: `Miễn phí ${FREE_LIMITS.video} video đầu`,
      color: '#00d4aa',
    },
    {
      id: 'slide',
      icon: '📑',
      title: 'Slide Bài Học 3D',
      desc: 'Slide tổng quan phần cứng & IC3 Spark',
      freeText: 'Miễn phí slide đầu tiên',
      color: '#6366f1',
    },
  ];

  /* Sub-view: Course */
  if (tab === 'course') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <PCourseViewer
            isUnlocked={unlocked}
            onRequestUpgrade={() => setShowPricing(true)}
            onBack={() => setTab('menu')}
          />
        </div>
      </>
    );
  }

  /* Sub-view: Video */
  if (tab === 'video') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%' }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <VideoHub unlocked={unlocked} onRequestUpgrade={() => setShowPricing(true)} />
        </div>
      </>
    );
  }

  /* Sub-view: Slide */
  if (tab === 'slide') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%' }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <SlideViewer
            isUnlocked={unlocked}
            onRequestUpgrade={() => setShowPricing(true)}
            onBack={() => setTab('menu')}
          />
        </div>
      </>
    );
  }

  /* ── MENU ── */
  return (
    <>
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onUnlock={() => setUnlocked(true)}
        />
      )}

      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 0 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(0,212,170,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Học tập & Bài giảng
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Chọn hình thức học phù hợp với bạn
              </p>
            </div>
          </div>

          {/* Unlock status badge */}
          {unlocked ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '99px',
              background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
            }}>
              <CheckCircle size={13} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-primary)' }}>Đã mở khóa toàn bộ</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '99px',
                background: 'rgba(255,185,0,0.1)', border: '1px solid rgba(255,185,0,0.2)',
              }}>
                <Lock size={12} style={{ color: '#ffb900' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffb900' }}>Bản dùng thử</span>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '99px',
                  background: 'linear-gradient(90deg, var(--brand-primary), #6366f1)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                }}
              >
                <Crown size={12} /> Nâng cấp ngay
              </button>
            </div>
          )}
        </div>

        {/* 3 feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '20px', borderRadius: '12px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.boxShadow = `0 0 0 1px ${t.color}20`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                background: `${t.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>{t.icon}</div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t.desc}
                </div>
                {!unlocked && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: '99px',
                    background: `${t.color}12`, border: `1px solid ${t.color}30`,
                    fontSize: '11px', fontWeight: 600, color: t.color,
                  }}>
                    ✓ {t.freeText}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer upgrade CTA */}
        {!unlocked && (
          <div style={{
            marginTop: '20px', padding: '20px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(99,102,241,0.06) 100%)',
            border: '1px solid rgba(0,212,170,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                🚀 Mở khóa toàn bộ nội dung
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Từ <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>55.000đ/tháng</span> • Trường học chỉ <span style={{ fontWeight: 700, color: '#6366f1' }}>32.000đ/học sinh</span>
              </div>
            </div>
            <button
              onClick={() => setShowPricing(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <Crown size={14} /> Xem gói cước
            </button>
          </div>
        )}
      </div>
    </>
  );
}
