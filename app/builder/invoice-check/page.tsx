'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getCategoryLinks, SHOPS } from '@/data/shopLinks';

interface ShopRef {
  shop: string; url: string; price?: number;
}

interface CompareItem {
  name: string; type: string; invoicePrice: number; marketPrice: number;
  status: 'reasonable' | 'expensive' | 'overpriced'; percentDiff: number; dbPrice: number;
  matchedName?: string; source?: string; link?: string; shops?: ShopRef[];
}

interface CompareResult {
  items: CompareItem[]; totalInvoicePrice: number; totalMarketPrice: number; verdict: string;
}

const TYPE_OPTIONS = ['CPU', 'GPU', 'RAM', 'Mainboard', 'Storage', 'PSU', 'Cooler', 'Case', 'Monitor', 'Other'];
const TYPE_ICONS: Record<string, string> = {
  CPU: '⚡', GPU: '🎮', RAM: '💾', Mainboard: '🔧', Storage: '💿', PSU: '🔌', Cooler: '🌬️', Case: '🖥️', Monitor: '🖥️', Other: '🔹'
};

export default function InvoiceComparePage() {
  const [items, setItems] = useState([{ name: '', type: 'CPU', price: 0 }]);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (v: number) => (v || 0).toLocaleString('vi-VN') + '₫';

  const statusColor = (s: string) => s === 'overpriced' ? '#ef4444' : s === 'expensive' ? '#f59e0b' : '#22c55e';
  const statusLabel = (s: string) => s === 'overpriced' ? 'Chặt chém!' : s === 'expensive' ? 'Hơi đắt' : 'Hợp lý';

  const addItem = () => setItems([...items, { name: '', type: 'CPU', price: 0 }]);
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, j) => j !== i)); };
  const updateItem = (i: number, field: string, value: any) => {
    const copy = [...items];
    (copy[i] as any)[field] = value;
    setItems(copy);
  };

  const handleCompare = async () => {
    const valid = items.filter(i => i.name.trim() && i.price > 0);
    if (valid.length === 0) { setError('Nhập ít nhất 1 linh kiện với tên và giá'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualItems: valid.map(i => ({ name: i.name, type: i.type, invoicePrice: i.price })) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.items) {
        data.items = data.items.map((item: any) => ({
          ...item,
          shops: (getCategoryLinks(item.type) || []).map(link => ({
            shop: link.shop,
            url: link.url,
          })),
        }))
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi so sánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
          <span>&larr;</span> Builder
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>So Sánh Giá Linh Kiện</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Nhập tay linh kiện + giá — đối chiếu nhiều shop trên mạng, so sánh giá thị trường chính xác
            </p>
          </div>
        </div>

        {/* Input form */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px',
          border: '1px solid var(--border-default)', marginBottom: '16px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝</span> Nhập linh kiện từ hóa đơn của bạn
          </div>

          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center',
            }}>
              <input
                placeholder="Tên linh kiện (VD: RTX 4070)"
                value={item.name}
                onChange={e => updateItem(i, 'name', e.target.value)}
                style={{
                  flex: 2, minWidth: '160px', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <select
                value={item.type}
                onChange={e => updateItem(i, 'type', e.target.value)}
                style={{
                  flex: 1, minWidth: '90px', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
              </select>
              <input
                type="number" placeholder="Giá (VNĐ)"
                value={item.price || ''}
                onChange={e => updateItem(i, 'price', parseInt(e.target.value) || 0)}
                style={{
                  flex: 1, minWidth: '120px', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button onClick={() => removeItem(i)}
                style={{
                  padding: '10px', borderRadius: '8px', border: 'none',
                  background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                }}>&times;</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={addItem}
              style={{
                padding: '10px 16px', borderRadius: '8px', border: '1px dashed var(--border-default)',
                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px',
                fontFamily: 'inherit', fontWeight: 600,
              }}>
              + Thêm linh kiện
            </button>
            <button onClick={handleCompare} disabled={loading}
              style={{
                padding: '10px 28px', borderRadius: '8px', border: 'none',
                background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                color: loading ? 'var(--text-muted)' : '#fff', fontWeight: 700, fontSize: '14px',
                cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>
              {loading ? 'Đang so sánh...' : 'So sánh giá thị trường'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', marginBottom: '16px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Tổng hóa đơn', value: formatPrice(result.totalInvoicePrice), color: '#ef4444' },
                { label: 'Giá thị trường', value: formatPrice(result.totalMarketPrice), color: '#22c55e' },
                { label: 'Chênh lệch', value: (result.totalInvoicePrice > result.totalMarketPrice ? '+' : '') + formatPrice(Math.abs(result.totalInvoicePrice - result.totalMarketPrice)), color: result.totalInvoicePrice > result.totalMarketPrice ? '#ef4444' : '#22c55e' },
                { label: '% chênh', value: result.totalMarketPrice > 0 ? (result.totalInvoicePrice > result.totalMarketPrice ? '+' : '') + Math.round(((result.totalInvoicePrice - result.totalMarketPrice) / result.totalMarketPrice) * 100) + '%' : '0%', color: result.totalInvoicePrice > result.totalMarketPrice ? '#ef4444' : '#22c55e' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Per-item comparison */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-default)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Chi tiết từng linh kiện
              </div>
              {result.items.map((item, i) => {
                const diff = (item.invoicePrice || 0) - (item.marketPrice || 0);
                const shopColor = item.source?.includes('GearVN') ? '#6366f1' : '#64748b';
                return (
                  <div key={i} style={{
                    padding: '12px', borderRadius: '10px', marginBottom: '8px',
                    background: 'var(--bg-elevated)', border: `1px solid ${statusColor(item.status)}30`,
                    animation: `fadeUp 0.3s ease-out ${i * 0.1}s both`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{item.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{TYPE_ICONS[item.type]} {item.type}</span>
                      </div>
                      <span style={{
                        padding: '2px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                        background: statusColor(item.status) + '20', color: statusColor(item.status),
                      }}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', marginBottom: '2px' }}>
                      <span>Hóa đơn: <strong style={{ color: '#ef4444' }}>{formatPrice(item.invoicePrice)}</strong></span>
                      <span>Thị trường: <strong style={{ color: '#22c55e' }}>{formatPrice(item.marketPrice)}</strong></span>
                      <span style={{ fontWeight: 700, color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                        {diff > 0 ? '+' : ''}{formatPrice(diff)} ({item.percentDiff > 0 ? '+' : ''}{item.percentDiff}%)
                      </span>
                    </div>
                    {item.matchedName && item.matchedName !== item.name && (
                      <div style={{ fontSize: '11px', color: shopColor, fontWeight: 600, marginBottom: '4px' }}>
                        🔍 Đối chiếu: {item.matchedName}
                      </div>
                    )}
                    {item.shops && item.shops.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {item.shops.map((s, si) => (
                          <a key={si} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '9px', fontWeight: 700, color: '#00d4aa', textDecoration: 'none',
                              background: 'rgba(0,212,170,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            {s.shop} ↗
                          </a>
                        ))}
                      </div>
                    ) : item.source && (
                      <div style={{ fontSize: '10px', color: shopColor, marginBottom: '2px' }}>
                        📍 {item.source}
                      </div>
                    )}
                    {item.link && !item.shops && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '10px', color: '#00d4aa', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                        🔗 Mua tại GearVN ↗
                      </a>
                    )}
                    <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-base)', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(Math.abs(item.percentDiff), 100)}%`, background: statusColor(item.status), opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verdict */}
            <div style={{
              padding: '16px', borderRadius: '12px', marginBottom: '16px',
              background: result.verdict.includes('CẢNH BÁO') ? 'rgba(239,68,68,0.08)' : result.verdict.includes('hơi cao') ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
              border: `1px solid ${result.verdict.includes('CẢNH BÁO') ? '#ef4444' : result.verdict.includes('hơi cao') ? '#f59e0b' : '#22c55e'}40`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
                  {result.verdict.includes('CẢNH BÁO') ? '🚨' : result.verdict.includes('hơi cao') ? '⚠️' : '✅'}
                </span>
                <div>
                  <strong>Đánh giá: </strong>
                  {result.verdict}
                </div>
              </div>
            </div>

            <button onClick={() => { setResult(null); }}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              So sánh hóa đơn khác
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
