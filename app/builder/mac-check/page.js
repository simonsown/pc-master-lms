'use client';

import { useState } from 'react';
import Link from 'next/link';

const ALL_COMPUTERS = [
  // ===== WINDOWS GAMING =====
  { id: 'pc-gaming-cao-cap', name: 'PC Gaming Cao Cấp', brand: 'Windows', type: 'Gaming', specs: 'i9-14900K, RTX 4080 16GB, 32GB DDR5, 2TB NVMe, 1000W', price: 55990000, desc: 'Chơi 4K max setting, stream + render mượt', useCases: ['Gaming', 'Stream', 'Render'], link: 'https://gearvn.com/collections/pc-gaming', rating: 4.9 },
  { id: 'pc-gaming-tam-trung', name: 'PC Gaming Tầm Trung', brand: 'Windows', type: 'Gaming', specs: 'Ryzen 7 7800X3D, RTX 4070 12GB, 32GB DDR5, 1TB NVMe', price: 28990000, desc: 'Chơi 1440p mượt, cân bằng hiệu năng/giá', useCases: ['Gaming', 'Stream'], link: 'https://gearvn.com/collections/pc-gaming', rating: 4.7 },
  { id: 'pc-streamer', name: 'PC Streamer Pro', brand: 'Windows', type: 'Gaming', specs: 'Ryzen 7 7800X3D, RTX 4070S 12GB, 32GB DDR5, 1TB+2TB', price: 31990000, desc: 'Tối ưu stream + game cùng lúc', useCases: ['Gaming', 'Stream', 'Edit'], link: 'https://gearvn.com/collections/pc-streaming', rating: 4.6 },
  { id: 'pc-mini-itx', name: 'PC Mini ITX Gaming', brand: 'Windows', type: 'Gaming', specs: 'Ryzen 5 7600X, RTX 4060 8GB, 16GB DDR5, 1TB NVMe', price: 22990000, desc: 'Nhỏ gọn, đẹp, tiết kiệm không gian', useCases: ['Gaming', 'Văn phòng'], link: 'https://gearvn.com/collections/pc-mini-itx', rating: 4.5 },

  // ===== WINDOWS OFFICE / WORKSTATION =====
  { id: 'pc-van-phong', name: 'PC Văn Phòng Cao Cấp', brand: 'Windows', type: 'Văn phòng', specs: 'i5-14600K, GTX 1650 4GB, 16GB DDR5, 500GB NVMe', price: 12990000, desc: 'Ổn định, đa nhiệm tốt, tiết kiệm điện', useCases: ['Văn phòng', 'Học tập'], link: 'https://gearvn.com/collections/pc-van-phong', rating: 4.5 },
  { id: 'pc-sinh-vien', name: 'PC Sinh Viên Tiết Kiệm', brand: 'Windows', type: 'Văn phòng', specs: 'i3-14100F, GTX 1650 4GB, 16GB DDR4, 500GB NVMe', price: 8490000, desc: 'Giá rẻ nhất, đủ học và giải trí nhẹ', useCases: ['Học tập', 'Văn phòng'], link: 'https://gearvn.com/collections/pc-gia-re', rating: 4.4 },
  { id: 'pc-workstation-ai', name: 'PC Workstation AI', brand: 'Windows', type: 'Workstation', specs: 'Ryzen 9 7950X, RTX 4090 24GB, 64GB DDR5, 2TB Gen5', price: 78990000, desc: 'Trạm AI/Deep Learning mạnh nhất', useCases: ['AI', 'Render', 'Lập trình'], link: 'https://gearvn.com/collections/pc-workstation', rating: 4.9 },
  { id: 'pc-lap-trinh', name: 'PC Lập Trình Viên', brand: 'Windows', type: 'Workstation', specs: 'i7-13700K, RTX 4060 8GB, 32GB DDR5, 1TB NVMe', price: 19990000, desc: 'Compile nhanh, chạy container mượt', useCases: ['Lập trình', 'Văn phòng'], link: 'https://gearvn.com/collections/pc-van-phong', rating: 4.6 },

  // ===== LAPTOP WINDOWS =====
  { id: 'rog-zephyrus', name: 'ASUS ROG Zephyrus G14', brand: 'Laptop Windows', type: 'Gaming', specs: 'Ryzen 9 7940HS, RTX 4060, 16GB, 1TB, 14" QHD 165Hz', price: 34990000, desc: 'Laptop gaming nhỏ gọn, mạnh mẽ', useCases: ['Gaming', 'Lập trình'], link: 'https://gearvn.com/collections/laptop-gaming', rating: 4.8 },
  { id: 'legion-pro', name: 'Lenovo Legion Pro 5', brand: 'Laptop Windows', type: 'Gaming', specs: 'Ryzen 7 7745HX, RTX 4070, 32GB, 1TB, 16" QHD 240Hz', price: 39990000, desc: 'Hiệu năng cao, tản nhiệt tốt', useCases: ['Gaming', 'Render', 'Lập trình'], link: 'https://gearvn.com/collections/laptop-gaming', rating: 4.7 },

  // ===== MAC =====
  { id: 'macbook-pro-m4', name: 'MacBook Pro 14" M4 Pro', brand: 'Mac', type: 'Laptop', specs: 'M4 Pro (12/18), 24GB, 512GB, 14" XDR', price: 39990000, desc: 'Developer + designer: pin 18h, màn đẹp', useCases: ['Lập trình', 'Design', 'Văn phòng'], link: 'https://gearvn.com/collections/macbook-pro', rating: 4.9 },
  { id: 'macbook-air-m4', name: 'MacBook Air 13" M4', brand: 'Mac', type: 'Laptop', specs: 'M4 (8/10), 16GB, 256GB, 13.6"', price: 21990000, desc: 'Siêu nhẹ 1.2kg, pin 18h, cho sinh viên & văn phòng', useCases: ['Văn phòng', 'Học tập', 'Lập trình'], link: 'https://gearvn.com/collections/macbook-air', rating: 4.8 },
  { id: 'mac-studio', name: 'Mac Studio M4 Max', brand: 'Mac', type: 'Desktop', specs: 'M4 Max (16/40), 64GB, 1TB', price: 64990000, desc: 'Trạm làm việc Mac mạnh nhất: render 8K mượt', useCases: ['Render', 'Edit', 'AI'], link: 'https://gearvn.com/collections/mac-studio', rating: 4.9 },
  { id: 'imac-m4', name: 'iMac 24" M4', brand: 'Mac', type: 'Desktop', specs: 'M4 (8/10), 16GB, 256GB, 24" 4.5K', price: 29990000, desc: 'All-in-one đẹp, màn hình 4.5K tuyệt đẹp', useCases: ['Văn phòng', 'Design', 'Gia đình'], link: 'https://gearvn.com/collections/imac', rating: 4.7 },
];

const formatPrice = (v) => v.toLocaleString('vi-VN') + '₫';

export default function MacCheckPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const brands = ['all', ...new Set(ALL_COMPUTERS.map(c => c.brand))];
  const filtered = ALL_COMPUTERS.filter(c =>
    (filter === 'all' || c.brand === filter) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.specs.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
          <span>&larr;</span> Builder
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '32px' }}>🖥️</span>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tất Cả Máy Tính</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{ALL_COMPUTERS.length} máy — Windows + Mac — chọn theo nhu cầu</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm máy..." style={{
            flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '10px',
            border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
            color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }} />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {brands.map(b => (
              <button key={b} onClick={() => setFilter(b)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: `1px solid ${filter === b ? '#00d4aa' : 'var(--border-default)'}`,
                  background: filter === b ? 'rgba(0,212,170,0.12)' : 'var(--bg-surface)',
                  color: filter === b ? '#00d4aa' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {b === 'all' ? 'Tất cả' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gap: '10px' }}>
          {filtered.map((pc, i) => (
            <div key={pc.id} style={{
              display: 'flex', gap: '14px', padding: '14px 18px', borderRadius: '12px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              animation: `fadeUp 0.25s ease-out ${i * 0.04}s both`,
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
                background: pc.brand === 'Mac' ? 'linear-gradient(135deg, #333, #555)' : 'linear-gradient(135deg, #00a3ff, #00d4aa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>
                {pc.brand === 'Mac' ? '🍎' : '🖥️'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{pc.name}</span>
                  <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '99px', background: '#00d4aa15', color: '#00d4aa', fontWeight: 700 }}>{pc.brand}</span>
                  <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '99px', background: '#6366f115', color: '#6366f1', fontWeight: 700 }}>{pc.type}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', lineHeight: 1.4 }}>{pc.specs}</p>
                <p style={{ fontSize: '11px', color: 'var(--brand-primary)', margin: '0 0 6px' }}>💡 {pc.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: '#00d4aa' }}>{formatPrice(pc.price)}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {pc.useCases.map(u => <span key={u} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>#{u}</span>)}
                  </div>
                  <a href={pc.link} target="_blank" rel="noopener noreferrer" style={{
                    marginLeft: 'auto', padding: '6px 16px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00d4aa, #00a3ff)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                  }}>Mua tại GearVN ↗</a>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Không tìm thấy máy phù hợp
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
