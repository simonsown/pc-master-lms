'use client';

import { useState } from 'react';
import Link from 'next/link';

const PREBUILT_PCS = [
  {
    id: 'rog-g14', name: 'ASUS ROG Zephyrus G14', type: 'Laptop Gaming',
    specs: 'AMD Ryzen 9 7940HS, RTX 4060 8GB, 16GB DDR5, 1TB SSD, 14" QHD 165Hz',
    price: 34990000, useCases: ['gaming', 'stream', 'coder', 'design'],
    rating: 4.8, image: 'https://gearvn.com/cdn/shop/products/rog-zephyrus-g14.jpg',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Máy nhỏ gọn, mạnh mẽ, phù hợp gaming + lập trình. Màn 14" QHD 165Hz đẹp.',
  },
  {
    id: 'legion-pro-5', name: 'Lenovo Legion Pro 5', type: 'Laptop Gaming',
    specs: 'AMD Ryzen 7 7745HX, RTX 4070 8GB, 32GB DDR5, 1TB SSD, 16" QHD 240Hz',
    price: 39990000, useCases: ['gaming', 'stream', '3d', 'coder'],
    rating: 4.7, image: 'https://gearvn.com/cdn/shop/products/legion-pro-5.jpg',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Hiệu năng xuất sắc, tản nhiệt tốt, RAM 32GB phù hợp đa nhiệm và render.',
  },
  {
    id: 'macbook-pro-m4', name: 'MacBook Pro 14" M4 Pro', type: 'Laptop',
    specs: 'Apple M4 Pro (12CPU/18GPU), 24GB Unified, 512GB SSD, 14" Liquid Retina XDR',
    price: 39990000, useCases: ['coder', 'design', 'video', 'office'],
    rating: 4.9, image: 'https://gearvn.com/cdn/shop/products/macbook-pro-m4.jpg',
    link: 'https://gearvn.com/collections/macbook-pro',
    reason: 'Chip Apple Silicon mượt mà, pin 18h, màn hình tuyệt đẹp. Lý tưởng cho developer.',
  },
  {
    id: 'macbook-air-m4', name: 'MacBook Air 13" M4', type: 'Laptop',
    specs: 'Apple M4 (8CPU/10GPU), 16GB Unified, 256GB SSD, 13.6" Liquid Retina',
    price: 21990000, useCases: ['office', 'coder', 'student'],
    rating: 4.8, image: 'https://gearvn.com/cdn/shop/products/macbook-air-m4.jpg',
    link: 'https://gearvn.com/collections/macbook-air',
    reason: 'Siêu nhẹ, pin cả ngày, đủ mạnh cho văn phòng và lập trình. Giá tốt nhất cho Mac.',
  },
  {
    id: 'pc-gaming-cao-cap', name: 'PC Gaming Cao Cấp', type: 'Desktop Gaming',
    specs: 'i9-14900K, RTX 4080 16GB, 32GB DDR5, 2TB NVMe Gen4, 1000W Platinum',
    price: 55990000, useCases: ['gaming', 'stream', '3d', 'video', 'ai'],
    rating: 4.9, image: 'https://gearvn.com/cdn/shop/products/pc-gaming-cao-cap.jpg',
    link: 'https://gearvn.com/collections/pc-gaming',
    reason: 'Cấu hình mạnh nhất cho gaming 4K + stream + render. Nâng cấp dễ dàng.',
  },
  {
    id: 'pc-gaming-tam-trung', name: 'PC Gaming Tầm Trung', type: 'Desktop Gaming',
    specs: 'Ryzen 7 7800X3D, RTX 4070 12GB, 32GB DDR5, 1TB NVMe, 850W Gold',
    price: 28990000, useCases: ['gaming', 'stream', 'coder', 'design'],
    rating: 4.7, image: 'https://gearvn.com/cdn/shop/products/pc-gaming-tam-trung.jpg',
    link: 'https://gearvn.com/collections/pc-gaming',
    reason: 'Giá hợp lý, chơi 1440p mượt, cân đối hiệu năng/giá thành.',
  },
  {
    id: 'pc-van-phong', name: 'PC Văn Phòng Cao Cấp', type: 'Desktop Office',
    specs: 'i5-14600K, GTX 1650 4GB, 16GB DDR5, 500GB NVMe, 500W',
    price: 12990000, useCases: ['office', 'coder', 'student'],
    rating: 4.5, image: 'https://gearvn.com/cdn/shop/products/pc-van-phong.jpg',
    link: 'https://gearvn.com/collections/pc-van-phong',
    reason: 'Cấu hình ổn định, đa nhiệm tốt, tiết kiệm điện. Phù hợp văn phòng và học tập.',
  },
  {
    id: 'pc-workstation-ai', name: 'PC Workstation AI', type: 'Desktop Workstation',
    specs: 'Ryzen 9 7950X, RTX 4090 24GB, 64GB DDR5, 2TB NVMe Gen5, 1200W Titanium',
    price: 78990000, useCases: ['ai', '3d', 'video', 'coder'],
    rating: 4.9, image: 'https://gearvn.com/cdn/shop/products/pc-workstation-ai.jpg',
    link: 'https://gearvn.com/collections/pc-workstation',
    reason: 'Trạm làm việc AI/Deep Learning. GPU 24GB VRAM, RAM 64GB, CPU 16 nhân.',
  },
  {
    id: 'pc-streamer-pro', name: 'PC Streamer Pro', type: 'Desktop Streaming',
    specs: 'Ryzen 7 7800X3D, RTX 4070 Super 12GB, 32GB DDR5, 1TB NVMe + 2TB HDD',
    price: 31990000, useCases: ['stream', 'gaming', 'video'],
    rating: 4.6, image: 'https://gearvn.com/cdn/shop/products/pc-streamer-pro.jpg',
    link: 'https://gearvn.com/collections/pc-streaming',
    reason: 'Tối ưu cho stream: NVENC encoder, RAM đủ cho OBS + game, 2 ổ lưu record.',
  },
  {
    id: 'pc-sinh-vien', name: 'PC Sinh Viên Tiết Kiệm', type: 'Desktop Budget',
    specs: 'i3-14100F, GTX 1650 4GB, 16GB DDR4, 500GB NVMe, 500W',
    price: 8490000, useCases: ['office', 'student', 'coder'],
    rating: 4.4, image: 'https://gearvn.com/cdn/shop/products/pc-sinh-vien.jpg',
    link: 'https://gearvn.com/collections/pc-gia-re',
    reason: 'Giá rẻ nhất, đủ học tập, lập trình cơ bản và giải trí nhẹ.',
  },
  {
    id: 'mac-studio-m4max', name: 'Mac Studio M4 Max', type: 'Desktop Mac',
    specs: 'Apple M4 Max (16CPU/40GPU), 64GB Unified, 1TB SSD',
    price: 64990000, useCases: ['video', '3d', 'ai', 'coder'],
    rating: 4.9, image: 'https://gearvn.com/cdn/shop/products/mac-studio-m4max.jpg',
    link: 'https://gearvn.com/collections/mac-studio',
    reason: 'Trạm làm việc Mac mạnh nhất. Render 8K mượt, 64GB RAM cho dự án lớn.',
  },
  {
    id: 'pc-mini-itx', name: 'PC Mini ITX Gaming', type: 'Desktop Mini',
    specs: 'Ryzen 5 7600X, RTX 4060 8GB, 16GB DDR5, 1TB NVMe, 650W Gold SFX',
    price: 22990000, useCases: ['gaming', 'coder', 'office'],
    rating: 4.5, image: 'https://gearvn.com/cdn/shop/products/pc-mini-itx.jpg',
    link: 'https://gearvn.com/collections/pc-mini-itx',
    reason: 'Nhỏ gọn, đẹp, tiết kiệm không gian. Vẫn đủ mạnh cho gaming 1080p.',
  },
];

const USE_CASE_LABELS: Record<string, string> = {
  gaming: '🎮 Chơi game',
  stream: '📺 Stream',
  coder: '💻 Lập trình',
  design: '🎨 Thiết kế',
  video: '🎬 Dựng phim',
  ai: '🤖 AI/ML',
  office: '📚 Văn phòng',
  student: '🎓 Học sinh',
};

const formatPrice = (v: number) => v.toLocaleString('vi-VN') + '₫';

export default function PcSuggestPage() {
  const [purpose, setPurpose] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [results, setResults] = useState<typeof PREBUILT_PCS>([]);
  const [searched, setSearched] = useState(false);
  const [budget, setBudget] = useState(0);

  const allUseCases = Object.keys(USE_CASE_LABELS);

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases(prev =>
      prev.includes(uc) ? prev.filter(u => u !== uc) : [...prev, uc]
    );
  };

  const handleSearch = () => {
    const keywords = purpose.toLowerCase();
    let matched = PREBUILT_PCS.filter(pc => {
      // Match by selected use cases
      if (selectedUseCases.length > 0) {
        const matchUseCase = selectedUseCases.some(uc => pc.useCases.includes(uc));
        if (!matchUseCase) return false;
      }
      // Match by purpose text
      if (keywords) {
        const matchText = pc.name.toLowerCase().includes(keywords) ||
          pc.specs.toLowerCase().includes(keywords) ||
          pc.type.toLowerCase().includes(keywords) ||
          pc.useCases.some(uc => keywords.includes(uc));
        if (!matchText) return false;
      }
      // Match by budget
      if (budget > 0 && pc.price > budget) return false;
      return true;
    });

    // Sort by relevance: more matching use cases = higher rank
    if (selectedUseCases.length > 0) {
      matched.sort((a, b) => {
        const aScore = a.useCases.filter(uc => selectedUseCases.includes(uc)).length;
        const bScore = b.useCases.filter(uc => selectedUseCases.includes(uc)).length;
        return bScore - aScore || a.price - b.price;
      });
    } else if (keywords) {
      matched.sort((a, b) => b.rating - a.rating);
    }

    setResults(matched.slice(0, 6));
    setSearched(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Link href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
          <span>&larr;</span> Builder
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>🖥️</span>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Gợi Ý Máy Tính</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Nhập nhu cầu — AI sẽ phân tích và đề xuất máy phù hợp nhất từ thị trường
            </p>
          </div>
        </div>

        {/* Input */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px',
          border: '1px solid var(--border-default)', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="VD: Tôi cần máy chơi game 1440p, ngân sách 30tr..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <input
              type="number" placeholder="Ngân sách tối đa (VNĐ)"
              value={budget || ''}
              onChange={e => setBudget(parseInt(e.target.value) || 0)}
              style={{
                width: '180px', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {allUseCases.map(uc => (
              <button key={uc} onClick={() => toggleUseCase(uc)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: `1px solid ${selectedUseCases.includes(uc) ? '#00d4aa' : 'var(--border-default)'}`,
                  background: selectedUseCases.includes(uc) ? 'rgba(0,212,170,0.12)' : 'var(--bg-elevated)',
                  color: selectedUseCases.includes(uc) ? '#00d4aa' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {USE_CASE_LABELS[uc]}
              </button>
            ))}
          </div>

          <button onClick={handleSearch}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
              color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            🔍 Tìm máy phù hợp
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                Không tìm thấy máy phù hợp. Thử điều chỉnh nhu cầu hoặc ngân sách.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  🎯 {results.length} máy phù hợp nhất
                </div>
                {results.map((pc, i) => (
                  <div key={pc.id} style={{
                    display: 'flex', gap: '16px', padding: '16px', borderRadius: '14px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                    animation: `fadeUp 0.3s ease-out ${i * 0.08}s both`,
                  }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
                    }}>
                      {pc.type.includes('Laptop') ? '💻' : pc.type.includes('Mac') ? '🍎' : '🖥️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{pc.name}</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(0,212,170,0.12)', color: '#00d4aa', fontWeight: 700 }}>
                          {pc.type}
                        </span>
                        <span style={{ fontSize: '11px', color: '#f59e0b' }}>{'★'.repeat(Math.round(pc.rating))}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: '1.5' }}>
                        {pc.specs}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6366f1', margin: '0 0 8px', lineHeight: '1.4' }}>
                        💡 {pc.reason}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: '#00d4aa' }}>
                          {formatPrice(pc.price)}
                        </span>
                        <a href={pc.link} target="_blank" rel="noopener noreferrer"
                          style={{
                            padding: '6px 16px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                            color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                          }}>
                          Mua ngay tại GearVN ↗
                        </a>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {pc.useCases.map(uc => (
                            <span key={uc} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                              {USE_CASE_LABELS[uc]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
