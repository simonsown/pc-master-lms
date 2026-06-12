'use client';

import { useState, useMemo } from 'react';

const MAC_ORIG = [
  { platform: 'Mac', id: 'macbook-air-m1', name: 'MacBook Air M1 (2020)', cpu: 'Apple M1', ram: '8GB Unified', gpu: '7-core GPU', storage: '256GB SSD', priceRange: { min: 15, max: 20 }, suitable: ['Văn phòng', 'Học tập', 'Lướt web', 'Design nhẹ'], features: ['Fanless', 'Pin 15 tiếng', 'Retina', 'Siêu nhẹ 1.2kg'], score: { office: 9, gaming: 2, render: 3, coding: 7, edit: 6 }, color: '#555', icon: '🍎' },
  { platform: 'Mac', id: 'macbook-pro-14-m4', name: 'MacBook Pro 14" M4 Pro', cpu: 'Apple M4 Pro', ram: '24GB Unified', gpu: '20-core GPU', storage: '512GB SSD', priceRange: { min: 35, max: 50 }, suitable: ['Dựng phim', 'Lập trình iOS/macOS', 'Design', 'Nhạc'], features: ['XDR 120Hz', 'Pin 18 tiếng', 'HDMI + SD', 'Magic Keyboard'], score: { office: 10, gaming: 3, render: 8, coding: 9, edit: 10 }, color: '#555', icon: '🍎' },
  { platform: 'Mac', id: 'mac-mini-m4', name: 'Mac Mini M4 (2024)', cpu: 'Apple M4', ram: '16GB Unified', gpu: '10-core GPU', storage: '256GB SSD', priceRange: { min: 15, max: 20 }, suitable: ['Văn phòng', 'Design', 'Lập trình', 'Học tập'], features: ['Nhỏ nhất', 'Tiết kiệm điện', '3 màn 6K', 'Giá rẻ nhất Mac'], score: { office: 9, gaming: 2, render: 5, coding: 7, edit: 7 }, color: '#555', icon: '🍎' },
];

const PC_SYSTEMS = [
  { platform: 'Win', id: 'win-budget', name: 'PC Siêu Rẻ', cpu: 'Xeon E5 / Ryzen 5 3600 (second)', ram: '16GB', gpu: 'GTX 1650 / RX 580 (second)', storage: '240GB SSD + 500GB HDD', priceRange: { min: 4, max: 7 }, suitable: ['Học sinh', 'Lập trình nhẹ', 'Game cơ bản', 'Thực tập IT'], features: ['Giá rẻ nhất', 'Linh kiện second ổn', 'Dễ nâng cấp', 'eSports 60fps'], score: { office: 6, gaming: 5, render: 2, coding: 5, edit: 2 }, color: '#14b8a6', icon: '💰' },
  { platform: 'Win', id: 'win-office', name: 'PC Văn Phòng', cpu: 'i3-14100 / Ryzen 5 7600', ram: '8-16GB DDR5', gpu: 'Tích hợp (Intel UHD / Radeon)', storage: '256-512GB SSD NVMe', priceRange: { min: 8, max: 14 }, suitable: ['Văn phòng', 'Học tập', 'Lướt web', 'Xem phim'], features: ['Nhỏ gọn', 'Tiết kiệm điện', 'Đủ dùng cơ bản', 'Nâng cấp được'], score: { office: 9, gaming: 2, render: 1, coding: 5, edit: 3 }, color: '#3b82f6', icon: '💼' },
  { platform: 'Win', id: 'win-work', name: 'PC Đồ Họa Tầm Trung', cpu: 'i5-14600K / Ryzen 7 7800X3D', ram: '32GB DDR5', gpu: 'RTX 4060 Ti 8GB / RX 7700 XT', storage: '1TB SSD + 1TB HDD', priceRange: { min: 22, max: 35 }, suitable: ['Thiết kế', 'Dựng phim 1080p', 'Blender', 'Lập trình', 'Game 1440p'], features: ['CPU đa nhân', 'GPU DLSS/FSR', 'RAM 32GB', 'Cân bằng giá/hiệu năng'], score: { office: 10, gaming: 8, render: 7, coding: 9, edit: 8 }, color: '#8b5cf6', icon: '🎨' },
  { platform: 'Win', id: 'win-gaming', name: 'PC Gaming Thuần', cpu: 'Ryzen 7 7800X3D', ram: '32GB DDR5 6000MHz', gpu: 'RTX 4070 / RX 7800 XT', storage: '1TB SSD NVMe Gen4', priceRange: { min: 25, max: 40 }, suitable: ['Game competitive', 'Game AAA 1440p', 'Stream', 'Đa nhiệm'], features: ['3D V-Cache', 'GPU mạnh 1440p', 'RAM tốc độ cao', 'Case RGB'], score: { office: 8, gaming: 10, render: 5, coding: 7, edit: 5 }, color: '#22c55e', icon: '🎮' },
  { platform: 'Win', id: 'win-mini', name: 'PC Mini ITX', cpu: 'Ryzen 5 7600', ram: '16-32GB DDR5', gpu: 'RTX 4060 Low Profile', storage: '1TB SSD NVMe', priceRange: { min: 18, max: 28 }, suitable: ['Văn phòng gọn', 'LAN party', 'HTPC', 'Lập trình'], features: ['Thể tích 10L', 'Vừa balo', 'PSU SFX 750W', 'Tản thấp <70mm'], score: { office: 9, gaming: 6, render: 4, coding: 7, edit: 4 }, color: '#06b6d4', icon: '📦' },
  { platform: 'Win', id: 'win-pro', name: 'PC Workstation Pro', cpu: 'i7-14700K / Ryzen 9 7950X', ram: '64GB DDR5', gpu: 'RTX 4070 Ti Super 16GB', storage: '2TB SSD Gen4', priceRange: { min: 40, max: 60 }, suitable: ['Dựng phim 4K', 'After Effects', 'CAD/CAM', 'Stream + Game'], features: ['14-16 nhân', '16GB VRAM', 'Đa màn 4K', 'AIO 360mm'], score: { office: 10, gaming: 9, render: 9, coding: 10, edit: 10 }, color: '#ef4444', icon: '🚀' },
  { platform: 'Win', id: 'win-ultra', name: 'PC Siêu Cấp', cpu: 'i9-14900K / Ryzen 9 7950X3D', ram: '128GB DDR5', gpu: 'RTX 4090 24GB', storage: '4TB SSD Gen5 + 4TB HDD', priceRange: { min: 75, max: 120 }, suitable: ['Render 8K', 'AI/Deep Learning', 'Dựng phim pro', 'Game 4K 120fps'], features: ['24 nhân', '24GB VRAM', 'Gen5 SSD', 'Nguồn 1000W+', 'Custom Loop'], score: { office: 10, gaming: 10, render: 10, coding: 10, edit: 10 }, color: '#f59e0b', icon: '👑' },
  { platform: 'Win', id: 'win-server', name: 'PC NAS / Server', cpu: 'i3-N305 / Ryzen 3', ram: '8-16GB', gpu: 'Không cần', storage: '4x HDD 4TB RAID + 256GB SSD', priceRange: { min: 10, max: 20 }, suitable: ['Lưu trữ', 'Plex', 'Backup', 'Host web nhỏ'], features: ['<50W', 'Hot-swap 4 bay', 'TrueNAS/Unraid', '24/7'], score: { office: 3, gaming: 0, render: 0, coding: 3, edit: 0 }, color: '#6366f1', icon: '🖥️' },
  ...MAC_ORIG,
];

const ALL_WORK_TYPES = ['Văn phòng', 'Gaming', 'Render', 'Lập trình', 'Dựng phim'];

function formatPrice(tr) {
  return tr + 'tr';
}

function analyzePurpose(text) {
  const w = { office: 0, gaming: 0, render: 0, coding: 0, edit: 0 };
  const k = text.toLowerCase();
  if (k.match(/văn phòng|word|excel|email|web|học|sinh viên|họp|thuyết trình/i)) w.office = 10;
  if (k.match(/game|chơi|valorant|lol|pubg|fortnite|aaa|competitive/i)) w.gaming = 10;
  if (k.match(/render|blender|after effect|3d|maya|cad|vray|keyshot/i)) w.render = 10;
  if (k.match(/lập trình|code|dev|web|react|python|java|android|ios|docker|unity/i)) w.coding = 10;
  if (k.match(/dựng phim|edit|design|thiết kế|photoshop|illustrator|figma|4k|premiere|final cut/i)) w.edit = 10;
  if (k.match(/ai|deep learning|machine learning|train|model/i)) { w.render = 10; w.coding = 10; }
  if (Object.values(w).every(v => v === 0)) w.office = 5;
  return w;
}

export default function MacCompatibilityChecker({ lang = 'vn' }) {
  const [purpose, setPurpose] = useState('');
  const [purposeDone, setPurposeDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const analysis = useMemo(() => {
    if (!purposeDone || !purpose.trim()) return null;
    return analyzePurpose(purpose);
  }, [purpose, purposeDone]);

  const scored = useMemo(() => {
    let list = [...PC_SYSTEMS];
    if (filterPlatform !== 'all') list = list.filter(s => s.platform === filterPlatform);
    return list.map(s => {
      let totalScore = 0;
      if (analysis) {
        for (const k of Object.keys(analysis)) totalScore += (s.score[k] || 0) * (analysis[k] || 1);
      } else {
        totalScore = Object.values(s.score).reduce((a, b) => a + b, 0);
      }
      return { ...s, totalScore };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [analysis, filterPlatform]);

  const topMatch = scored[0];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💡</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Gợi Ý Máy Tính
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Chọn cấu hình phù hợp với nhu cầu & ngân sách
            </div>
          </div>
        </div>
        <button onClick={() => window.history.back()}
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid var(--border-default)',
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Purpose input */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 12, padding: '18px 22px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🎯</span> Mục đích sử dụng
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>
              Nhập công việc bạn cần làm — tôi sẽ gợi ý cấu hình phù hợp nhất
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={purpose} onChange={e => setPurpose(e.target.value)}
                placeholder="VD: Lập trình web, chơi game, dựng phim..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }}
                onKeyDown={e => e.key === 'Enter' && purpose.trim() && setPurposeDone(true)}
              />
              <button onClick={() => purpose.trim() && setPurposeDone(true)}
                style={{
                  padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: 'var(--brand-primary)', border: 'none',
                  color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                Gợi ý
              </button>
            </div>
          </div>

          {/* Top match */}
          {topMatch && analysis && (
            <div style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${topMatch.color}33`, borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'fadeIn 0.3s',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${topMatch.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{topMatch.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                  ★ Gợi ý tốt nhất cho bạn
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{topMatch.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {topMatch.cpu} · {topMatch.gpu} · {topMatch.ram}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: topMatch.color }}>
                  {formatPrice(Math.round((topMatch.priceRange.min + topMatch.priceRange.max) / 2))}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatPrice(topMatch.priceRange.min)}–{formatPrice(topMatch.priceRange.max)}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Lọc:</span>
            {['all', 'Windows', 'Mac'].map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: filterPlatform === p ? 'var(--brand-subtle)' : 'var(--bg-elevated)',
                  border: `1px solid ${filterPlatform === p ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  color: filterPlatform === p ? 'var(--brand-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{p === 'all' ? 'Tất cả' : p}</button>
            ))}
          </div>

          {/* System cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(showAll ? scored : scored.slice(0, 6)).map((sys, i) => {
              const avgPrice = Math.round((sys.priceRange.min + sys.priceRange.max) / 2);
              const isTop = topMatch?.id === sys.id;
              return (
                <div key={sys.id}
                  onClick={() => setSelected(selected?.id === sys.id ? null : sys)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${isTop ? `${sys.color}33` : 'var(--border-default)'}`,
                    borderRadius: 12, cursor: 'pointer', overflow: 'hidden',
                    animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`,
                  }}>
                  <div style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${sys.color}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>{sys.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{sys.name}</span>
                        {isTop && (
                          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: `${sys.color}20`, color: sys.color }}>★ Top</span>
                        )}
                        <span style={{
                          fontSize: 8, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                          background: sys.platform === 'Mac' ? 'rgba(85,85,85,0.15)' : 'rgba(59,130,246,0.15)',
                          color: sys.platform === 'Mac' ? '#888' : '#3b82f6',
                        }}>{sys.platform}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>
                        {sys.cpu} · {sys.gpu} · {sys.ram}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {sys.suitable.slice(0, 4).map(sw => (
                          <span key={sw} style={{ fontSize: 8, padding: '1px 6px', borderRadius: 99, background: `${sys.color}10`, color: sys.color }}>{sw}</span>
                        ))}
                      </div>
                      {/* Score bars */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {Object.entries(sys.score).map(([k, v]) => (
                          <div key={k} style={{ flex: 1 }}>
                            <div style={{ height: 3, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(v / 10) * 100}%`, background: v >= 8 ? 'var(--success)' : v >= 5 ? 'var(--brand-primary)' : 'var(--text-muted)', borderRadius: 2 }} />
                            </div>
                            <div style={{ fontSize: 7, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 1, textAlign: 'center' }}>{k.slice(0, 3)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: sys.color }}>{formatPrice(avgPrice)}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{formatPrice(sys.priceRange.min)}–{formatPrice(sys.priceRange.max)}</div>
                      {analysis && (
                        <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: sys.totalScore > 20 ? 'var(--success)' : sys.totalScore > 10 ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                          {Math.round(sys.totalScore)} điểm
                        </div>
                      )}
                    </div>
                  </div>

                  {selected?.id === sys.id && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>⚙️ Thông số</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {[{ l: 'CPU', v: sys.cpu }, { l: 'GPU', v: sys.gpu }, { l: 'RAM', v: sys.ram }, { l: 'Lưu trữ', v: sys.storage }].map(spec => (
                              <div key={spec.l} style={{ display: 'flex', gap: 6, fontSize: 10 }}>
                                <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>{spec.l}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{spec.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>💎 Tính năng</div>
                          <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {sys.features.map((f, i) => (
                              <li key={i} style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💼 Phù hợp</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {sys.suitable.map(sw => (
                            <span key={sw} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `${sys.color}10`, color: sys.color }}>{sw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!showAll && scored.length > 6 && (
            <button onClick={() => setShowAll(true)}
              style={{
                padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              Xem thêm {scored.length - 6} cấu hình...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
