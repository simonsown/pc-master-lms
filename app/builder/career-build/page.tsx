'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const CAREERS = [
  { id: 'ai-engineer', title: 'AI Engineer / Deep Learning', icon: '🤖', desc: 'Train model AI, xử lý dữ liệu lớn, cần GPU VRAM lớn và CPU đa nhân.' },
  { id: '3d-designer', title: '3D Designer / Animator', icon: '🎨', desc: 'Render 3D, dựng hình, cần GPU mạnh và RAM dung lượng cao.' },
  { id: 'video-editor', title: 'Video Editor / Filmmaker', icon: '🎬', desc: 'Dựng phim 4K/8K, chỉnh màu, cần CPU đa nhân và NVMe siêu nhanh.' },
  { id: 'streamer', title: 'Professional Streamer / Gamer', icon: '🎮', desc: 'Stream game, chơi game online, cần GPU tầm trung và RAM đủ lớn.' },
  { id: 'coder', title: 'Coder / Software Developer', icon: '💻', desc: 'Lập trình web/app, chạy container, cần RAM lớn và CPU đa nhân.' },
  { id: 'office', title: 'Office Worker / Student', icon: '📚', desc: 'Soạn thảo, học online, cấu hình cơ bản với chi phí thấp nhất.' },
  { id: 'mac', title: 'Mac / Apple Ecosystem', icon: '🍎', desc: 'Ưu tiên hệ sinh thái Apple: MacBook, Mac Studio, Mac Pro.' },
];

interface ShopLink {
  shop: string; url: string;
}

interface BuildItem {
  id: string; name: string; type: string; price: number; reason: string; image?: string; link?: string; shops?: ShopLink[];
}

interface BuildResult {
  career: string; explanation: string; build: BuildItem[]; totalPrice: number; tips: string;
  isMac?: boolean; model?: string; macBuild?: { model?: string; build: BuildItem[]; totalPrice: number; tips: string; explanation: string };
}

const TYPE_COLORS: Record<string, string> = {
  CPU: '#ef4444', GPU: '#8b5cf6', RAM: '#06b6d4', Storage: '#f59e0b',
  PSU: '#10b981', Cooler: '#3b82f6', Mainboard: '#ec4899', Case: '#64748b',
};

const TYPE_ICONS: Record<string, string> = {
  CPU: '⚡', GPU: '🎮', RAM: '💾', Storage: '💿', PSU: '🔌', Cooler: '🌬️', Mainboard: '🔧', Case: '🖥️',
};

export default function CareerBuildPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [customDream, setCustomDream] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [error, setError] = useState('');
  const [animPhase, setAnimPhase] = useState(0);
  const [showMac, setShowMac] = useState(false);
  const [substituting, setSubstituting] = useState<string | null>(null);
  const [replacedItems, setReplacedItems] = useState<BuildItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const substitutePart = (item: BuildItem) => {
    const substitutes: Record<string, BuildItem> = {
      'CPU': { id: 'alt-cpu', name: `[Thay thế] ${item.name.replace(/i5|i3|R5|Ryzen 5/, 'i7').replace(/i7|Ryzen 7/, 'i9')}`, type: item.type, price: Math.round(item.price * 1.4), reason: 'Phiên bản cao hơn, tương thích socket' },
      'GPU': { id: 'alt-gpu', name: `[Thay thế] ${item.name.replace(/RTX 3060|RTX 4060/, 'RTX 4070').replace(/RTX 4070/, 'RX 7800 XT')}`, type: item.type, price: Math.round(item.price * 1.35), reason: 'Tương đương hoặc cao hơn, cùng phân khúc' },
      'RAM': { id: 'alt-ram', name: `[Thay thế] ${item.name.replace(/16GB/, '32GB').replace(/32GB/, '64GB')}`, type: item.type, price: Math.round(item.price * 1.8), reason: 'Dung lượng cao hơn, cùng chuẩn DDR' },
      'Storage': { id: 'alt-storage', name: item.name.includes('NVMe') ? `[Thay thế] ${item.name.replace(/NVMe/, 'SATA SSD')}` : `[Thay thế] ${item.name.replace(/SATA/, 'NVMe')}`, type: item.type, price: item.price, reason: 'Tương đương, chuẩn giao tiếp khác' },
      'PSU': { id: 'alt-psu', name: `[Thay thế] ${item.name.replace(/\d+W/, (m) => String(parseInt(m) + 150) + 'W')}`, type: item.type, price: Math.round(item.price * 1.2), reason: 'Công suất cao hơn, cùng chuẩn' },
    };
    const sub = substitutes[item.type] || { ...item, id: 'alt-' + item.id, name: '[Thay thế] ' + item.name, reason: 'Linh kiện thay thế tương thích' };
    setReplacedItems(prev => [...prev, { ...item, name: item.name, price: sub.price }]);
    setSubstituting(item.id);
    setTimeout(() => setSubstituting(null), 2000);
  };

  useEffect(() => {
    if (result && animPhase > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [animPhase, result]);

  const formatPrice = (v: number) => v.toLocaleString('vi-VN') + '₫';

  const handleSuggest = async (careerId?: string) => {
    const career = careerId || selected;
    if (!career && !customDream) return;

    setLoading(true);
    setError('');
    setResult(null);
    setAnimPhase(0);
    setShowMac(false);

    try {
      const res = await fetch('/api/career-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career,
          customDream,
          customCondition: customCondition || undefined,
          preferMac: career === 'mac',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      try { localStorage.setItem('careerBuild', JSON.stringify(data)) } catch (e) {}

      setResult(data);

      // Animate phases
      setTimeout(() => setAnimPhase(1), 300);
      const totalItems = (data.build?.length || 0) + (data.macBuild?.build?.length || 0);
      setTimeout(() => setAnimPhase(2), 800);
      // Items appear one by one
      for (let i = 0; i < totalItems; i++) {
        setTimeout(() => setAnimPhase(3 + i), 1200 + i * 350);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi gợi ý cấu hình');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const pcItems = result?.build || [];
  const macItems = result?.macBuild?.build || [];
  const hasBoth = result?.macBuild && pcItems.length > 0;

  const activeItems = showMac ? macItems : pcItems;
  const replacedTotal = replacedItems.reduce((s, r) => s + r.price, 0);
  const originalTotal = showMac ? (result?.macBuild?.totalPrice || 0) : (result?.totalPrice || 0);
  const activeTotal = replacedItems.length > 0 ? replacedTotal : originalTotal;
  const activeTips = showMac ? (result?.macBuild?.tips || '') : (result?.tips || '');
  const activeModel = showMac ? (result?.macBuild?.model || '') : '';
  const activeExplanation = showMac ? (result?.macBuild?.explanation || '') : (result?.explanation || '');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/builder" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
            <span>&larr;</span> Builder
          </Link>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>🎯 Career PC Build</div>
          <div style={{ width: '60px' }} />
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Input section */}
        {!result && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>💭</div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Ước mơ nghề nghiệp của bạn là gì?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                Chọn nghề hoặc nhập ước mơ — tôi sẽ build PC hoàn hảo cho bạn!
              </p>
            </div>

            {/* Quick suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {['Kỹ sư AI', 'Lập trình viên', 'Thiết kế đồ họa 3D', 'Editor video', 'Streamer game'].map(text => (
                <button key={text} onClick={() => { setCustomDream(text); setSelected(null); }}
                  style={{
                    padding: '8px 18px', borderRadius: '20px', border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                  }}>
                  {text}
                </button>
              ))}
            </div>

            {/* Career grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {CAREERS.map((c) => (
                <div key={c.id} onClick={() => { setSelected(c.id); setCustomDream(''); }}
                  style={{
                    padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    background: selected === c.id ? 'rgba(0,212,170,0.1)' : 'var(--bg-surface)',
                    border: selected === c.id ? '2px solid #00d4aa' : '1px solid var(--border-default)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{c.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Custom input */}
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              marginBottom: '12px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Nhập ước mơ của bạn:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={customDream}
                    onChange={(e) => { setCustomDream(e.target.value); setSelected(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSuggest(); }}
                    placeholder="VD: Em muốn trở thành kỹ sư AI..."
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px',
                      fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  <button onClick={() => handleSuggest()}
                    disabled={(!customDream && !selected) || loading}
                    style={{
                      padding: '12px 28px', borderRadius: '10px', border: 'none',
                      background: (customDream || selected) && !loading ? 'linear-gradient(135deg, #00d4aa, #00a3ff)' : 'var(--bg-elevated)',
                      color: (customDream || selected) && !loading ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: '14px', cursor: (customDream || selected) && !loading ? 'pointer' : 'default',
                      fontFamily: 'inherit',
                    }}
                  >
                    {loading ? '...' : 'Build PC'}
                  </button>
                </div>
                <input
                  value={customCondition}
                  onChange={e => setCustomCondition(e.target.value)}
                  placeholder="Thêm yêu cầu đặc biệt (VD: ngân sách 20tr, cần RGB, thích AMD...)"
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '12px',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '4px solid var(--border-default)', borderTopColor: '#00d4aa',
              margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>AI đang phân tích và xây dựng cấu hình...</div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444', color: '#ef4444', marginBottom: '16px',
            fontSize: '14px', fontWeight: 600, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && animPhase > 0 && (
          <div ref={resultRef}>
            {/* Career title */}
            <div style={{
              textAlign: 'center', marginBottom: '20px',
              animation: 'fadeSlideUp 0.5s ease-out',
            }}>
              <div style={{
                display: 'inline-block', padding: '8px 24px', borderRadius: '30px',
                background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,163,255,0.15))',
                border: '1px solid rgba(0,212,170,0.3)',
                fontSize: '20px', fontWeight: 800, color: '#fff',
              }}>
                {result.career}
              </div>
            </div>

            {/* Platform toggle */}
            {hasBoth && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                <button onClick={() => setShowMac(false)}
                  style={{
                    padding: '8px 24px', borderRadius: '20px',
                    border: `2px solid ${!showMac ? '#00d4aa' : 'var(--border-default)'}`,
                    background: !showMac ? 'rgba(0,212,170,0.12)' : 'transparent',
                    color: !showMac ? '#00d4aa' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>
                  🪟 Windows PC
                </button>
                <button onClick={() => setShowMac(true)}
                  style={{
                    padding: '8px 24px', borderRadius: '20px',
                    border: `2px solid ${showMac ? '#00d4aa' : 'var(--border-default)'}`,
                    background: showMac ? 'rgba(0,212,170,0.12)' : 'transparent',
                    color: showMac ? '#00d4aa' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>
                  🍎 Mac
                </button>
              </div>
            )}

            {/* Model name (for Mac) */}
            {showMac && activeModel && (
              <div style={{
                textAlign: 'center', padding: '14px', marginBottom: '16px',
                borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-default)',
                animation: 'fadeSlideUp 0.4s ease-out',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>MÁY ĐƯỢC ĐỀ XUẤT</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{activeModel}</div>
              </div>
            )}

            {/* Explanation */}
            {animPhase >= 1 && (
              <div style={{
                padding: '14px 18px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)',
                fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)',
                animation: 'fadeSlideUp 0.4s ease-out',
              }}>
                {activeExplanation}
              </div>
            )}

            {/* Components list - 2 cột */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {activeItems.map((item, i) => {
                const replaced = replacedItems.find(r => r.id === item.id)
                return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '14px', borderRadius: '12px',
                  background: 'var(--bg-surface)', border: substituting === item.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  animation: animPhase >= 3 + i ? 'fadeSlideUp 0.35s ease-out' : 'none',
                  opacity: animPhase >= 3 + i ? 1 : 0,
                  transition: 'all 0.25s',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                    background: TYPE_COLORS[item.type] || '#64748b',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      background: `${TYPE_COLORS[item.type] || '#64748b'}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    }}>
                      {TYPE_ICONS[item.type] || '🔹'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.3' }}>
                        {replaced ? <><span style={{ color: 'var(--brand-primary)' }}>↻ </span>{item.name}</> : item.name}
                        <span style={{ fontSize: '10px', color: TYPE_COLORS[item.type] || '#64748b', fontWeight: 700, marginLeft: '6px', padding: '1px 6px', borderRadius: '3px', background: `${TYPE_COLORS[item.type] || '#64748b'}15` }}>
                          {item.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                        {item.reason}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    {item.price > 0 && (
                      <div style={{ fontSize: '15px', fontWeight: 800, color: replaced ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {replaced ? `${formatPrice(replaced.price)}` : formatPrice(item.price)}
                      </div>
                    )}
                    <button onClick={() => substitutePart(item)}
                      style={{
                        padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(0,212,170,0.3)',
                        background: 'rgba(0,212,170,0.1)', color: 'var(--brand-primary)',
                        cursor: 'pointer', fontSize: '10px', fontWeight: 700, fontFamily: 'inherit',
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.2)'; e.currentTarget.style.borderColor = 'var(--brand-primary)' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)' }}>
                      ↔ Thay thế
                    </button>
                  </div>
                </div>
              )})}
            </div>

            {/* Total + Tips + Build now */}
            {animPhase >= 3 + activeItems.length - 1 && (
              <div style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 18px', borderRadius: '12px', marginBottom: '12px',
                  background: 'linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,163,255,0.08))',
                  border: '1px solid rgba(0,212,170,0.2)',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Tổng chi phí
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#00d4aa' }}>
                    {formatPrice(activeTotal)}
                  </span>
                </div>

                {/* Tips */}
                {activeTips && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                    background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)',
                    fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6',
                  }}>
                    <strong style={{ color: '#facc15' }}>Mẹo:</strong> {activeTips}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setResult(null); setCustomDream(''); setAnimPhase(0); }}
                    style={{
                      flex: 1, padding: '12px 24px', borderRadius: '10px',
                      border: '1px solid var(--border-default)',
                      background: 'transparent', color: 'var(--text-secondary)',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    Chọn nghề khác
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
