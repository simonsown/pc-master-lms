'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

interface InvoiceItem {
  name: string;
  type: string;
  invoicePrice: number;
  marketPrice: number;
  dbPrice?: number;
  status: 'reasonable' | 'expensive' | 'overpriced';
  percentDiff: number;
}

interface InvoiceResult {
  items: InvoiceItem[];
  totalInvoicePrice: number;
  totalMarketPrice: number;
  verdict: string;
}

export default function InvoiceCheckPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualItems, setManualItems] = useState([{ name: '', type: 'CPU', invoicePrice: 0 }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatPrice = (v: number) => (v || 0).toLocaleString('vi-VN') + '₫';

  const handleImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }
    setError('');
    setResult(null);
    setShowCamera(false);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImage(file);
  }, [handleImage]);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('Không thể mở camera. Vui lòng chọn ảnh từ thư viện.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    setError('');
    try {
      const res = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image }),
      });
      const data = await res.json();
      if (data.suggestManual) {
        // Server AI failed → run OCR locally with Tesseract.js
        try {
          const Tesseract = (await import('tesseract.js')).default;
          const imageData = image.split(',')[1] || image;
          const byteChars = atob(imageData);
          const byteNums = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
          const buffer = new Uint8Array(byteNums);
          const blob = new Blob([buffer], { type: 'image/jpeg' });
          const worker = await Tesseract.createWorker('vie+eng');
          const { data: ocr } = await worker.recognize(blob);
          await worker.terminate();
          const lines = ocr.text.split('\n').map((l: string) => l.trim()).filter(Boolean);
          const parsed: { name: string; type: string; invoicePrice: number }[] = [];
          const priceRx = /(\d[\d,.]*)\s*(?:đ|₫|vnd|vnđ|nghìn|triệu|tr)/gi;
          for (const line of lines) {
            if (line.length < 3) continue;
            if (/^(tổng|cộng|vat|thuế|số|ngày|địa|tel|total|sub)/i.test(line)) continue;
            const priceMatch = line.match(/(\d[\d,.]*)\s*(?:tr|triệu)/i);
            let price = 0;
            if (priceMatch) price = parseInt(priceMatch[1].replace(/[.,]/g, '')) * 1000000;
            else {
              const m = line.match(/(\d[\d,.]*)\s*(?:đ|₫|vnd)/i);
              if (m) price = parseInt(m[1].replace(/[.,]/g, ''));
            }
            const clean = line.replace(priceRx, '').replace(/\s{2,}/g, '').trim();
            if (clean && clean.length > 1) {
              parsed.push({ name: clean, type: 'Other', invoicePrice: price });
            }
          }
          if (parsed.length > 0) {
            const res2 = await fetch('/api/ai/scan-invoice', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ manualItems: parsed }),
            });
            const data2 = await res2.json();
            if (data2.error) throw new Error(data2.error);
            setResult(data2);
            setScanning(false);
            return;
          }
        } catch (ocrErr: any) {
          console.warn('Local OCR failed:', ocrErr.message);
        }
        setError('AI không nhận diện được ảnh. Bạn có thể nhập tay bên dưới.');
        setShowManualForm(true);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi quét hóa đơn');
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = async () => {
    const valid = manualItems.filter(i => i.name.trim() && i.invoicePrice > 0);
    if (valid.length === 0) { setError('Nhập ít nhất 1 linh kiện'); return; }
    setScanning(true);
    setError('');
    try {
      const res = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualItems: valid }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setShowManualForm(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi');
    } finally {
      setScanning(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'overpriced') return '#ef4444';
    if (s === 'expensive') return '#f59e0b';
    return '#22c55e';
  };

  const statusLabel = (s: string) => {
    if (s === 'overpriced') return 'Chặt chém!';
    if (s === 'expensive') return 'Hơi đắt';
    return 'Hợp lý';
  };

  const resetAll = () => {
    stopCamera();
    setImage(null);
    setResult(null);
    setError('');
    setShowManualForm(false);
    setManualItems([{ name: '', type: 'CPU', invoicePrice: 0 }]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Link href="/builder" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px',
          marginBottom: '24px',
        }}>
          <span>&larr;</span> Quay lại Builder
        </Link>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Quét Hóa Đơn &bull; Chống Chặt Chém
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Tải lên ảnh hóa đơn linh kiện máy tính, AI sẽ nhận diện và so sánh giá để cảnh báo nếu bạn bị mua đắt!
        </p>

        {!image && !showCamera && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: dragOver ? 'rgba(0,212,170,0.05)' : 'var(--bg-surface)',
                marginBottom: '16px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
              />
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                Kéo thả ảnh hóa đơn vào đây
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
                hoặc nhấp để chọn file ảnh
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>&mdash; hoặc &mdash;</span>
            </div>

            <button onClick={startCamera}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-default)',
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>📸</span> Chụp Ảnh Hóa Đơn Bằng Camera
            </button>
          </div>
        )}

        {showCamera && (
          <div style={{
            background: '#000', borderRadius: '16px', overflow: 'hidden',
            marginBottom: '16px', position: 'relative',
          }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '12px', padding: '16px', justifyContent: 'center' }}>
              <button onClick={capturePhoto}
                style={{
                  padding: '12px 32px', borderRadius: '10px', border: 'none',
                  background: '#00d4aa', color: '#000', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Chụp
              </button>
              <button onClick={stopCamera}
                style={{
                  padding: '12px 32px', borderRadius: '10px', border: '1px solid #ffffff44',
                  background: 'transparent', color: '#fff', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {image && !result && (
          <div>
            <img src={image} alt="Invoice preview" style={{
              width: '100%', maxHeight: '400px', objectFit: 'contain',
              borderRadius: '16px', marginBottom: '16px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              {!scanning && (
                <button onClick={handleScan}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                    color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Quét Hóa Đơn Bằng AI
                </button>
              )}
              <button onClick={resetAll}
                style={{
                  padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Chọn ảnh khác
              </button>
            </div>
          </div>
        )}

        {scanning && (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: 'var(--bg-surface)', borderRadius: '16px',
            border: '1px solid var(--border-default)', marginBottom: '24px',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '4px solid var(--border-default)',
              borderTopColor: '#00d4aa', margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }} />
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
              Đang quét hóa đơn...
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              AI đang nhận diện linh kiện và so sánh giá thị trường
            </div>
            <div style={{
              height: '4px', width: '100%', maxWidth: '320px', margin: '0 auto',
              background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '60%', background: 'linear-gradient(90deg, #00d4aa, #00a3ff)',
                borderRadius: '2px', animation: 'scanProgress 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {error && !showManualForm && (
          <div style={{
            padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444', color: '#ef4444', marginBottom: '24px',
            fontSize: '14px', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {showManualForm && (
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px',
            border: '1px solid var(--border-default)', marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Nhập Tay Linh Kiện
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              AI không nhận diện được ảnh. Hãy nhập tay từng linh kiện để so sánh giá.
            </p>
            {manualItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', marginBottom: '10px',
                alignItems: 'center', flexWrap: 'wrap',
              }}>
                <input placeholder="Tên linh kiện" value={item.name}
                  onChange={e => { const m = [...manualItems]; m[i].name = e.target.value; setManualItems(m); }}
                  style={{ flex: '2', minWidth: '150px', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                  }} />
                <select value={item.type}
                  onChange={e => { const m = [...manualItems]; m[i].type = e.target.value; setManualItems(m); }}
                  style={{ flex: '1', minWidth: '90px', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                  }}>
                  {['CPU','GPU','RAM','Mainboard','PSU','Storage','Cooler','Case','Monitor','Other'].map(t =>
                    <option key={t} value={t}>{t}</option>
                  )}
                </select>
                <input type="number" placeholder="Giá (VNĐ)" value={item.invoicePrice || ''}
                  onChange={e => { const m = [...manualItems]; m[i].invoicePrice = parseInt(e.target.value) || 0; setManualItems(m); }}
                  style={{ flex: '1', minWidth: '120px', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                  }} />
                {manualItems.length > 1 && (
                  <button onClick={() => setManualItems(manualItems.filter((_, j) => j !== i))}
                    style={{ padding: '10px', borderRadius: '8px', border: 'none',
                      background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer',
                      fontSize: '16px', lineHeight: 1,
                    }}>&times;</button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => setManualItems([...manualItems, { name: '', type: 'CPU', invoicePrice: 0 }])}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px dashed var(--border-default)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '13px', fontFamily: 'inherit', fontWeight: 600,
                }}>
                + Thêm linh kiện
              </button>
              <button onClick={handleManualSubmit}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                  color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                  fontFamily: 'inherit',
                }}>
                So sánh giá
              </button>
              <button onClick={() => { setShowManualForm(false); setManualItems([{ name: '', type: 'CPU', invoicePrice: 0 }]); }}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '13px', fontFamily: 'inherit', fontWeight: 600,
                }}>
                Hủy
              </button>
            </div>
          </div>
        )}

        {result && (
          <div>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px',
              border: '1px solid var(--border-default)', marginBottom: '24px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Kết Quả So Sánh Giá
                </h2>
                <span style={{
                  fontSize: '12px', color: 'var(--text-muted)',
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'var(--bg-elevated)',
                }}>
                  {result.items.length} linh kiện
                </span>
              </div>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                {result.items.map((item, i) => {
                  const diff = item.invoicePrice - item.marketPrice;
                  const barPercent = Math.min(Math.abs(item.percentDiff), 100);
                  const barColor = item.status === 'overpriced' ? '#ef4444' : item.status === 'expensive' ? '#f59e0b' : '#22c55e';

                  return (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: '12px',
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${statusColor(item.status)}30`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: statusColor(item.status) + '20',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', color: statusColor(item.status),
                          fontWeight: 800, flexShrink: 0,
                        }}>
                          {item.status === 'overpriced' ? '!' : item.status === 'expensive' ? '~' : '✓'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '2px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {item.type}
                          </div>
                        </div>
                        <div style={{
                          padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                          background: statusColor(item.status) + '20',
                          color: statusColor(item.status),
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {statusLabel(item.status)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Hóa đơn: <strong style={{ color: '#ef4444' }}>{formatPrice(item.invoicePrice)}</strong>
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Thị trường: <strong style={{ color: '#22c55e' }}>{formatPrice(item.marketPrice)}</strong>
                        </span>
                        {item.dbPrice && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Kho DB: <strong>{formatPrice(item.dbPrice)}</strong>
                          </span>
                        )}
                        <span style={{
                          fontSize: '12px', fontWeight: 700,
                          color: diff > 0 ? '#ef4444' : '#22c55e',
                        }}>
                          {diff > 0 ? '+' : ''}{formatPrice(diff)} ({item.percentDiff > 0 ? '+' : ''}{item.percentDiff}%)
                        </span>
                      </div>

                      <div style={{
                        height: '6px', borderRadius: '3px',
                        background: 'var(--bg-base)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${Math.min(Math.abs(item.percentDiff), 100)}%`,
                          background: barColor,
                          opacity: 0.7,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                display: 'flex', gap: '16px', flexWrap: 'wrap',
                padding: '20px', borderRadius: '12px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                marginBottom: '16px',
              }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Tổng hóa đơn
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>
                    {formatPrice(result.totalInvoicePrice)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Giá thị trường
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>
                    {formatPrice(result.totalMarketPrice)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Chênh lệch
                  </div>
                  <div style={{
                    fontSize: '24px', fontWeight: 800,
                    color: result.totalInvoicePrice > result.totalMarketPrice ? '#ef4444' : '#22c55e',
                  }}>
                    {result.totalInvoicePrice > result.totalMarketPrice ? '+' : '-'}
                    {formatPrice(Math.abs(result.totalInvoicePrice - result.totalMarketPrice))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    % chênh
                  </div>
                  <div style={{
                    fontSize: '24px', fontWeight: 800,
                    color: result.totalInvoicePrice > result.totalMarketPrice ? '#ef4444' : '#22c55e',
                  }}>
                    {result.totalMarketPrice > 0
                      ? (result.totalInvoicePrice > result.totalMarketPrice ? '+' : '')
                        + Math.round(((result.totalInvoicePrice - result.totalMarketPrice) / result.totalMarketPrice) * 100)
                        + '%'
                      : '0%'}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '18px', borderRadius: '12px',
                background: result.verdict.includes('CẢNH BÁO') ? 'rgba(239,68,68,0.08)' :
                  result.verdict.includes('hơi cao') ? 'rgba(245,158,11,0.08)' :
                  'rgba(34,197,94,0.08)',
                border: `1px solid ${
                  result.verdict.includes('CẢNH BÁO') ? '#ef4444' :
                  result.verdict.includes('hơi cao') ? '#f59e0b' :
                  '#22c55e'
                }40`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6',
                }}>
                  <span style={{
                    fontSize: '18px', flexShrink: 0, marginTop: '2px',
                  }}>
                    {result.verdict.includes('CẢNH BÁO') ? '🚨' :
                     result.verdict.includes('hơi cao') ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <strong>Đánh giá AI: </strong>
                    {result.verdict}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setResult(null); setImage(null); }}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Quét hóa đơn khác
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  padding: '14px 24px', borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Lên đầu trang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
