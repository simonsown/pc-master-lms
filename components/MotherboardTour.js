'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZONES = [
    {
        id: 'cpu_socket',
        label: 'Socket CPU',
        icon: '🧠',
        x: '38%', y: '25%', w: '24%', h: '18%',
        color: '#00d4aa',
        info: {
            title: 'Socket CPU',
            desc: 'Nơi gắn bộ vi xử lý (CPU). Các loại socket phổ biến: LGA1700 (Intel thế hệ 12-14), AM5 (AMD Ryzen 7000+), LGA1200 (Intel thế hệ 10-11).',
            specs: ['Chân cắm: LGA (Land Grid Array) hoặc PGA', 'Hỗ trợ chipset tương thích', 'Cần keo tản nhiệt khi lắp', 'TDP hỗ trợ tùy theo mainboard'],
            tip: 'Chọn CPU và mainboard cùng socket — ví dụ Intel LGA1700 chỉ dùng mainboard chipset 600/700 series.'
        }
    },
    {
        id: 'ram_slots',
        label: 'Khe RAM (DIMM)',
        icon: '💾',
        x: '38%', y: '46%', w: '24%', h: '12%',
        color: '#f59e0b',
        info: {
            title: 'Khe RAM (DIMM Slots)',
            desc: 'Khe cắm bộ nhớ RAM. Thường có 2-4 khe, hỗ trợ DDR4 hoặc DDR5 tùy chipset. Nên cắm theo cặp để chạy Dual Channel.',
            specs: ['DDR4: 2400-4400MHz, 1.2V', 'DDR5: 4800-8400MHz, 1.1V', 'Dual Channel: cắm khe A2+B2 trước', 'Dung lượng tối đa: 64-256GB'],
            tip: 'Khi chỉ có 2 thanh RAM, cắm vào khe màu cùng nhau (thường là slot 2 và 4) để kích hoạt Dual Channel.'
        }
    },
    {
        id: 'pcie_slots',
        label: 'Khe PCIe',
        icon: '🎮',
        x: '66%', y: '30%', w: '8%', h: '30%',
        color: '#8b5cf6',
        info: {
            title: 'Khe PCIe (PCI Express)',
            desc: 'Khe mở rộng tốc độ cao cho GPU, SSD NVMe, card capture, Wi-Fi card. PCIe x16 dành cho VGA, PCIe x4/x1 cho các thiết bị khác.',
            specs: ['PCIe 5.0: 32 GT/s (64 GB/s x16)', 'PCIe 4.0: 16 GT/s (32 GB/s x16)', 'PCIe 3.0: 8 GT/s (16 GB/s x16)', 'Tương thích ngược giữa các thế hệ'],
            tip: 'Luôn cắm GPU vào khe PCIe x16 trên cùng (gần CPU nhất) để có băng thông tối đa.'
        }
    },
    {
        id: 'chipset',
        label: 'Chipset',
        icon: '🔌',
        x: '6%', y: '46%', w: '16%', h: '12%',
        color: '#ef4444',
        info: {
            title: 'Chipset',
            desc: 'Con chip điều khiển giao tiếp giữa CPU, RAM, PCIe, USB, SATA. Chipset quyết định tính năng mainboard: số cổng USB, PCIe lanes, ép xung.',
            specs: ['Intel Z790: ép xung CPU+RAM', 'Intel B760: ép xung RAM, tiết kiệm', 'AMD X670E: PCIe 5.0 đầy đủ', 'AMD B650: PCIe 5.0 GPU + NVMe'],
            tip: 'Chipset Z series (Intel) hoặc X series (AMD) cho phép ép xung. B series phù hợp cho đa số người dùng.'
        }
    },
    {
        id: 'sata',
        label: 'Cổng SATA',
        icon: '💽',
        x: '6%', y: '62%', w: '16%', h: '8%',
        color: '#3b82f6',
        info: {
            title: 'Cổng SATA',
            desc: 'Kết nối ổ cứng HDD, SSD SATA, ổ quang. SATA III tốc độ 6 Gb/s. Thường có 4-6 cổng trên mainboard.',
            specs: ['SATA III: 6 Gb/s (~550 MB/s thực tế)', 'SATA II: 3 Gb/s', 'Hot-swap hỗ trợ', 'Cáp dữ liệu + cáp nguồn'],
            tip: 'Nếu có cả HDD và SSD, cài Windows lên SSD và dùng HDD làm ổ lưu trữ dữ liệu.'
        }
    },
    {
        id: 'io_panel',
        label: 'Cổng I/O',
        icon: '🔗',
        x: '84%', y: '62%', w: '14%', h: '22%',
        color: '#06b6d4',
        info: {
            title: 'Cổng I/O (Input/Output)',
            desc: 'Các cổng kết nối phía sau mainboard: USB, HDMI, DisplayPort, LAN, audio, Wi-Fi antennas.',
            specs: ['USB 3.2 Gen2: 10 Gb/s (màu xanh/xanh dương)', 'USB-C: 20-40 Gb/s (Thunderbolt)', 'HDMI 2.1: 48 Gb/s (4K@120Hz)', 'LAN 2.5GbE: 2.5 Gb/s'],
            tip: 'Dùng cổng USB sau mainboard thay vì mặt trước case để có tốc độ và độ ổn định cao hơn cho các thiết bị quan trọng.'
        }
    },
    {
        id: 'power_connectors',
        label: 'Cấp Nguồn',
        icon: '🔌',
        x: '10%', y: '20%', w: '20%', h: '8%',
        color: '#f97316',
        info: {
            title: 'Cấp Nguồn Mainboard',
            desc: 'Hai đầu nguồn chính: 24-pin ATX cấp nguồn chính và 8-pin EPS/ATX12V cấp riêng cho CPU. Thiếu một trong hai sẽ không boot được.',
            specs: ['24-pin ATX: nguồn chính (cũ là 20-pin)', '8-pin EPS: nguồn CPU (có thể 4+4 pin)', 'Đầu nguồn PCIe: 6+2 pin cho GPU', 'Đầu nguồn SATA: cho SSD/HDD'],
            tip: 'Luôn cắm đủ cả 2 đầu nguồn chính (24-pin + 8-pin CPU). Nếu PSU có 2 đầu 8-pin CPU thì cắm cả hai cho mainboard cao cấp.'
        }
    },
    {
        id: 'm2_slot',
        label: 'Khe M.2 NVMe',
        icon: '⚡',
        x: '38%', y: '15%', w: '24%', h: '8%',
        color: '#10b981',
        info: {
            title: 'Khe M.2 NVMe',
            desc: 'Khe cắm SSD M.2 tốc độ cao, kết nối trực tiếp với CPU qua PCIe. Hỗ trợ PCIe 4.0/5.0 với tốc độ đọc lên đến 14000 MB/s.',
            specs: ['M.2 NVMe PCIe 5.0: 14,000 MB/s đọc', 'M.2 NVMe PCIe 4.0: 7,000 MB/s đọc', 'M.2 SATA: 550 MB/s (hiếm gặp)', 'Kích thước: 2280 (22x80mm) phổ biến'],
            tip: 'Dùng khe M.2 gần CPU nhất (thường là M.2_1) vì kết nối trực tiếp với CPU cho tốc độ cao nhất.'
        }
    },
    {
        id: 'cmos_battery',
        label: 'Pin CMOS',
        icon: '🔋',
        x: '10%', y: '76%', w: '8%', h: '8%',
        color: '#ec4899',
        info: {
            title: 'Pin CMOS (CR2032)',
            desc: 'Pin đồng hồ nhỏ lưu cài đặt BIOS/UEFI khi tắt nguồn. Hết pin sẽ mất cài đặt và thời gian hệ thống. Tuổi thọ 3-10 năm.',
            specs: ['Loại: CR2032 (Lithium 3V)', 'Tuổi thọ: 3-10 năm', 'Thay khi: lỗi thời gian BIOS, mất cài đặt', 'Giá: ~10,000-20,000 VND'],
            tip: 'Nếu máy báo lỗi thời gian mỗi lần khởi động hoặc mất cài đặt BIOS, hãy thay pin CMOS — rẻ và dễ làm.'
        }
    },
];

export default function MotherboardTour({ onClose }) {
    const [activeZone, setActiveZone] = useState(null);
    const [hoveredZone, setHoveredZone] = useState(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: 'var(--bg-base)' }}
        >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📟 Khám Phá Mainboard</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click vào từng khu vực để tìm hiểu</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #00d4aa, #089e60)' }}
                >
                    ✕ Đóng
                </motion.button>
            </div>

            <div className="flex-1 flex p-6 gap-6 overflow-auto">
                {/* Motherboard SVG */}
                <div className="relative flex-1 min-h-[500px] max-w-[700px] rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                    {/* Motherboard 2D render */}
                    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: '#1a3a2a' }}>
                        {/* PCB board */}
                        <rect x="2" y="2" width="96" height="96" rx="2" fill="#1a4a2a" stroke="#2a5a3a" strokeWidth="0.5" />
                        {/* Circuit traces */}
                        {[[10,20,40,20],[10,50,40,50],[45,45,45,60],[65,20,65,60],[50,60,80,60]].map(([x1,y1,x2,y2], i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a6a3a" strokeWidth="0.3" opacity="0.6" />
                        ))}
                        <line x1="10" y1="25" x2="10" y2="80" stroke="#2a6a3a" strokeWidth="0.3" opacity="0.4" />
                        <line x1="90" y1="25" x2="90" y2="80" stroke="#2a6a3a" strokeWidth="0.3" opacity="0.4" />

                        {/* Zone highlight boxes */}
                        {ZONES.map((zone) => (
                            <g key={zone.id}>
                                <rect
                                    x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="4"
                                    fill={activeZone === zone.id ? `${zone.color}40` : hoveredZone === zone.id ? `${zone.color}25` : 'transparent'}
                                    stroke={activeZone === zone.id ? zone.color : hoveredZone === zone.id ? `${zone.color}80` : `${zone.color}30`}
                                    strokeWidth={activeZone === zone.id ? 2 : 1}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => setActiveZone(zone.id === activeZone ? null : zone.id)}
                                    onMouseEnter={() => setHoveredZone(zone.id)}
                                    onMouseLeave={() => setHoveredZone(null)}
                                />
                                <text
                                    x={parseFloat(zone.x) + parseFloat(zone.w) / 2}
                                    y={parseFloat(zone.y) + parseFloat(zone.h) / 2 + 1}
                                    textAnchor="middle" dominantBaseline="middle"
                                    fill={activeZone === zone.id ? zone.color : '#ffffff80'}
                                    fontSize="5" fontWeight="700" pointerEvents="none"
                                    style={{ fontFamily: 'inherit' }}
                                >
                                    {zone.icon} {zone.label}
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                        {ZONES.map(zone => (
                            <button
                                key={zone.id}
                                onClick={() => setActiveZone(zone.id === activeZone ? null : zone.id)}
                                className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: activeZone === zone.id ? `${zone.color}30` : 'var(--bg-elevated)',
                                    border: `1px solid ${activeZone === zone.id ? zone.color : 'transparent'}`,
                                    color: activeZone === zone.id ? zone.color : 'var(--text-muted)'
                                }}
                            >
                                {zone.icon} {zone.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="w-80 shrink-0">
                    <AnimatePresence mode="wait">
                        {activeZone ? (
                            <motion.div
                                key={activeZone}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                            >
                                {(() => {
                                    const z = ZONES.find(zone => zone.id === activeZone);
                                    if (!z) return null;
                                    return (
                                        <div>
                                            <div className="p-5" style={{ background: `${z.color}15` }}>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className="text-3xl">{z.icon}</div>
                                                    <div>
                                                        <div className="text-lg font-bold" style={{ color: z.color }}>{z.info.title}</div>
                                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Click để đóng</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                    {z.info.desc}
                                                </p>
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                                        Thông số kỹ thuật
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {z.info.specs.map((s, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                                <span style={{ color: z.color }}>•</span>
                                                                <span>{s}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-xl text-xs" style={{ background: `${z.color}10`, border: `1px solid ${z.color}30` }}>
                                                    <div className="font-bold mb-1" style={{ color: z.color }}>💡 Mẹo</div>
                                                    <p style={{ color: 'var(--text-secondary)' }}>{z.info.tip}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl p-8 text-center"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                            >
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Click vào mainboard</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Chọn một khu vực trên mainboard để xem thông tin chi tiết về linh kiện đó.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
