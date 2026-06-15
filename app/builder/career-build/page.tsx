'use client';

import { useState } from 'react';
import Link from 'next/link';

const CAREERS = [
  { id: 'ai-engineer', title: 'AI Engineer / Deep Learning', icon: '🤖', desc: 'Xử lý dữ liệu lớn, train model AI, cần CPU đa nhân và GPU VRAM lớn.' },
  { id: '3d-designer', title: '3D Designer / Animator', icon: '🎨', desc: 'Render 3D, dựng hình, cần GPU mạnh và RAM dung lượng cao.' },
  { id: 'video-editor', title: 'Video Editor / Filmmaker', icon: '🎬', desc: 'Dựng phim 4K/8K, chỉnh màu, cần CPU đa nhân và NVMe siêu nhanh.' },
  { id: 'streamer', title: 'Professional Streamer / Gamer', icon: '🎮', desc: 'Stream game, chơi game online, cần GPU tầm trung và RAM đủ lớn.' },
  { id: 'coder', title: 'Coder / Software Developer', icon: '💻', desc: 'Lập trình web/app, chạy container, cần RAM lớn và CPU đa nhân.' },
  { id: 'office', title: 'Office Worker / Student', icon: '📚', desc: 'Soạn thảo, học online, cấu hình cơ bản với chi phí thấp nhất.' },
];

interface BuildItem {
  id: string;
  name: string;
  type: string;
  price: number;
  reason: string;
  image?: string;
}

interface SuggestResult {
  career: string;
  explanation: string;
  build: BuildItem[];
  totalPrice: number;
  tips: string;
}

export default function CareerBuildPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [customDream, setCustomDream] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestResult | null>(null);
  const [error, setError] = useState('');

  const formatPrice = (v: number) => v.toLocaleString('vi-VN') + '₫';

  const handleSuggest = async (careerId?: string) => {
    const career = careerId || selected;
    if (!career && !customDream) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/career-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career, customDream }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi gợi ý cấu hình');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/builder" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px',
          marginBottom: '24px',
        }}>
          <span>&larr;</span> Quay lại Builder
        </Link>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Nghề Nghiệp &bull; Cấu Hình PC
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Chọn ước mơ nghề nghiệp của bạn, AI sẽ gợi ý cấu hình PC tối ưu và áp dụng vào Builder ảo!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {CAREERS.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelected(c.id); setCustomDream(''); }}
              style={{
                padding: '20px', borderRadius: '14px', cursor: 'pointer',
                background: selected === c.id ? 'rgba(0,212,170,0.1)' : 'var(--bg-surface)',
                border: selected === c.id ? '2px solid #00d4aa' : '1px solid var(--border-default)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {c.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '20px', borderRadius: '14px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Hoặc nhập ước mơ của bạn:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={customDream}
              onChange={(e) => { setCustomDream(e.target.value); setSelected(null); }}
              placeholder="VD: Em muốn trở thành kỹ sư AI, thiết kế game..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={() => handleSuggest()}
              disabled={!customDream || loading}
              style={{
                padding: '12px 24px', borderRadius: '10px', border: 'none',
                background: customDream ? 'linear-gradient(135deg, #00d4aa, #00a3ff)' : 'var(--bg-elevated)',
                color: customDream ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '14px', cursor: customDream ? 'pointer' : 'default',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              Gợi ý
            </button>
          </div>
        </div>

        {selected && !result && (
          <button onClick={() => handleSuggest(selected)}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
              color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', marginBottom: '24px',
            }}
          >
            {loading ? 'Đang phân tích...' : `Gợi ý cấu hình cho nghề này`}
          </button>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '4px solid var(--border-default)', borderTopColor: '#00d4aa',
              margin: '0 auto 16px', animation: 'spin 1s linear infinite',
            }} />
            <div style={{ color: 'var(--text-muted)' }}>AI đang phân tích nghề nghiệp và gợi ý cấu hình...</div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444', color: '#ef4444', marginBottom: '24px',
            fontSize: '14px', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px',
              border: '1px solid var(--border-default)', marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Cấu Hình Cho: {result.career}
              </h2>
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
                fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)',
                marginBottom: '20px',
              }}>
                {result.explanation}
              </div>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                {result.build.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'rgba(0,212,170,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 800, color: '#00d4aa',
                    }}>
                      {item.type}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.reason}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap',
                    }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px', borderRadius: '10px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Tổng chi phí ước tính
                </span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#00d4aa' }}>
                  {formatPrice(result.totalPrice)}
                </span>
              </div>

              {result.tips && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)',
                  fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6',
                }}>
                  <strong style={{ color: '#facc15' }}>Mẹo:</strong> {result.tips}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/builder"
                style={{
                  padding: '14px 32px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                  color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block',
                }}
              >
                Bắt đầu lắp ráp cấu hình này &rarr;
              </Link>
              <button onClick={() => { setResult(null); setCustomDream(''); }}
                style={{
                  padding: '14px 24px', borderRadius: '12px', border: '1px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Chọn nghề khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
