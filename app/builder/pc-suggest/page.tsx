'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Store, ExternalLink, Sparkles, Monitor, ChevronDown, ChevronUp } from 'lucide-react';

const PREBUILT_PCS = [
  {
    id: 'rog-g14', name: 'ASUS ROG Zephyrus G14', type: 'Laptop Gaming',
    specs: 'AMD Ryzen 9 7940HS, RTX 4060 8GB, 16GB DDR5, 1TB SSD, 14" QHD 165Hz',
    price: 34990000, useCases: ['gaming', 'stream', 'coder', 'design'],
    rating: 4.8, image: 'https://pollinations.ai/p/ASUS-ROG-Zephyrus-G14-gaming-laptop',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Máy nhỏ gọn, mạnh mẽ, phù hợp gaming + lập trình. Màn 14" QHD 165Hz đẹp.',
  },
  {
    id: 'legion-pro-5', name: 'Lenovo Legion Pro 5', type: 'Laptop Gaming',
    specs: 'AMD Ryzen 7 7745HX, RTX 4070 8GB, 32GB DDR5, 1TB SSD, 16" QHD 240Hz',
    price: 39990000, useCases: ['gaming', 'stream', '3d', 'coder'],
    rating: 4.7, image: 'https://pollinations.ai/p/legion-pro-5',
    link: 'https://gearvn.com/collections/laptop-gaming',
    reason: 'Hiệu năng xuất sắc, tản nhiệt tốt, RAM 32GB phù hợp đa nhiệm và render.',
  },
  {
    id: 'macbook-pro-m4', name: 'MacBook Pro 14" M4 Pro', type: 'Laptop',
    specs: 'Apple M4 Pro (12CPU/18GPU), 24GB Unified, 512GB SSD, 14" Liquid Retina XDR',
    price: 39990000, useCases: ['coder', 'design', 'video', 'office'],
    rating: 4.9, image: 'https://pollinations.ai/p/macbook-pro-m4',
    link: 'https://gearvn.com/collections/macbook-pro',
    reason: 'Chip Apple Silicon mượt mà, pin 18h, màn hình tuyệt đẹp. Lý tưởng cho developer.',
  },
  {
    id: 'macbook-air-m4', name: 'MacBook Air 13" M4', type: 'Laptop',
    specs: 'Apple M4 (8CPU/10GPU), 16GB Unified, 256GB SSD, 13.6" Liquid Retina',
    price: 21990000, useCases: ['office', 'coder', 'student'],
    rating: 4.8, image: 'https://pollinations.ai/p/macbook-air-m4',
    link: 'https://gearvn.com/collections/macbook-air',
    reason: 'Siêu nhẹ, pin cả ngày, đủ mạnh cho văn phòng và lập trình. Giá tốt nhất cho Mac.',
  },
  {
    id: 'pc-gaming-cao-cap', name: 'PC Gaming Cao Cấp', type: 'Desktop Gaming',
    specs: 'i9-14900K, RTX 4080 16GB, 32GB DDR5, 2TB NVMe Gen4, 1000W Platinum',
    price: 55990000, useCases: ['gaming', 'stream', '3d', 'video', 'ai'],
    rating: 4.9, image: 'https://pollinations.ai/p/pc-gaming-cao-cap',
    link: 'https://gearvn.com/collections/pc-gaming',
    reason: 'Cấu hình mạnh nhất cho gaming 4K + stream + render. Nâng cấp dễ dàng.',
  },
  {
    id: 'pc-gaming-tam-trung', name: 'PC Gaming Tầm Trung', type: 'Desktop Gaming',
    specs: 'Ryzen 7 7800X3D, RTX 4070 12GB, 32GB DDR5, 1TB NVMe, 850W Gold',
    price: 28990000, useCases: ['gaming', 'stream', 'coder', 'design'],
    rating: 4.7, image: 'https://pollinations.ai/p/pc-gaming-tam-trung',
    link: 'https://gearvn.com/collections/pc-gaming',
    reason: 'Giá hợp lý, chơi 1440p mượt, cân đối hiệu năng/giá thành.',
  },
  {
    id: 'pc-van-phong', name: 'PC Văn Phòng Cao Cấp', type: 'Desktop Office',
    specs: 'i5-14600K, GTX 1650 4GB, 16GB DDR5, 500GB NVMe, 500W',
    price: 12990000, useCases: ['office', 'coder', 'student'],
    rating: 4.5, image: 'https://pollinations.ai/p/pc-van-phong',
    link: 'https://gearvn.com/collections/pc-van-phong',
    reason: 'Cấu hình ổn định, đa nhiệm tốt, tiết kiệm điện. Phù hợp văn phòng và học tập.',
  },
  {
    id: 'pc-workstation-ai', name: 'PC Workstation AI', type: 'Desktop Workstation',
    specs: 'Ryzen 9 7950X, RTX 4090 24GB, 64GB DDR5, 2TB NVMe Gen5, 1200W Titanium',
    price: 78990000, useCases: ['ai', '3d', 'video', 'coder'],
    rating: 4.9, image: 'https://pollinations.ai/p/pc-workstation-ai',
    link: 'https://gearvn.com/collections/pc-workstation',
    reason: 'Trạm làm việc AI/Deep Learning. GPU 24GB VRAM, RAM 64GB, CPU 16 nhân.',
  },
  {
    id: 'pc-streamer-pro', name: 'PC Streamer Pro', type: 'Desktop Streaming',
    specs: 'Ryzen 7 7800X3D, RTX 4070 Super 12GB, 32GB DDR5, 1TB NVMe + 2TB HDD',
    price: 31990000, useCases: ['stream', 'gaming', 'video'],
    rating: 4.6, image: 'https://pollinations.ai/p/pc-streamer-pro',
    link: 'https://gearvn.com/collections/pc-streaming',
    reason: 'Tối ưu cho stream: NVENC encoder, RAM đủ cho OBS + game, 2 ổ lưu record.',
  },
  {
    id: 'pc-sinh-vien', name: 'PC Sinh Viên Tiết Kiệm', type: 'Desktop Budget',
    specs: 'i3-14100F, GTX 1650 4GB, 16GB DDR4, 500GB NVMe, 500W',
    price: 8490000, useCases: ['office', 'student', 'coder'],
    rating: 4.4, image: 'https://pollinations.ai/p/pc-sinh-vien',
    link: 'https://gearvn.com/collections/pc-gia-re',
    reason: 'Giá rẻ nhất, đủ học tập, lập trình cơ bản và giải trí nhẹ.',
  },
  {
    id: 'mac-studio-m4max', name: 'Mac Studio M4 Max', type: 'Desktop Mac',
    specs: 'Apple M4 Max (16CPU/40GPU), 64GB Unified, 1TB SSD',
    price: 64990000, useCases: ['video', '3d', 'ai', 'coder'],
    rating: 4.9, image: 'https://pollinations.ai/p/mac-studio-m4max',
    link: 'https://gearvn.com/collections/mac-studio',
    reason: 'Trạm làm việc Mac mạnh nhất. Render 8K mượt, 64GB RAM cho dự án lớn.',
  },
  {
    id: 'pc-mini-itx', name: 'PC Mini ITX Gaming', type: 'Desktop Mini',
    specs: 'Ryzen 5 7600X, RTX 4060 8GB, 16GB DDR5, 1TB NVMe, 650W Gold SFX',
    price: 22990000, useCases: ['gaming', 'coder', 'office'],
    rating: 4.5, image: 'https://pollinations.ai/p/pc-mini-itx',
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PcSuggestPage() {
  const isMobile = useIsMobile();
  const [purpose, setPurpose] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [aiSource, setAiSource] = useState<'prebuilt' | 'ai'>('prebuilt');

  useEffect(() => {
    setAiResults(PREBUILT_PCS);
  }, []);

  const allUseCases = Object.keys(USE_CASE_LABELS);

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases(prev =>
      prev.includes(uc) ? prev.filter(u => u !== uc) : [...prev, uc]
    );
  };

  const displayedPcs = useMemo(() => {
    if (selectedUseCases.length === 0) return aiResults;
    return aiResults.filter((pc: any) =>
      selectedUseCases.some(uc => pc.useCases?.includes(uc))
    ).sort((a: any, b: any) => {
      const aScore = a.useCases?.filter((uc: string) => selectedUseCases.includes(uc)).length || 0;
      const bScore = b.useCases?.filter((uc: string) => selectedUseCases.includes(uc)).length || 0;
      return bScore - aScore || (a.price || 0) - (b.price || 0);
    });
  }, [selectedUseCases, aiResults]);

  const handleAiSuggest = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/pc-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          useCases: selectedUseCases,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi kết nối đến AI');
      if (data.suggestions && data.suggestions.length > 0) {
        setAiResults(data.suggestions);
        setAiSource('ai');
      } else {
        throw new Error('AI không trả về kết quả. Hiển thị danh sách gợi ý mặc định.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Không thể kết nối đến AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderImage = (pc: any) => {
    const src = pc.image_url || pc.image;
    const id = pc.id || 'unknown';
    if (imgErrors[id]) {
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-elevated)',
        }}>
          <Monitor size={28} color="#6366f1" />
        </div>
      );
    }
    return (
      <img src={src} alt={pc.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => handleImgError(id)}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: isMobile ? '16px' : '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Link href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
          <span>&larr;</span> Builder
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>🖥️</span>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Gợi Ý Máy Tính</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Chọn nhu cầu bên dưới hoặc nhập mô tả để AI gợi ý máy phù hợp
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px',
          border: '1px solid var(--border-default)', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {allUseCases.map(uc => (
              <motion.button
                key={uc}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleUseCase(uc)}
                style={{
                  padding: '8px 16px', borderRadius: '10px',
                  border: `1.5px solid ${selectedUseCases.includes(uc) ? '#00d4aa' : 'var(--border-default)'}`,
                  background: selectedUseCases.includes(uc) ? 'rgba(0,212,170,0.15)' : 'var(--bg-elevated)',
                  color: selectedUseCases.includes(uc) ? '#00d4aa' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}>
                {USE_CASE_LABELS[uc]}
              </motion.button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '14px' }}>
            <input
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAiSuggest(); }}
              placeholder="Hoặc nhập mô tả chi tiết (VD: Tôi cần máy chơi game 1440p)..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          <button onClick={handleAiSuggest} disabled={aiLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: aiLoading ? 'var(--border-default)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: aiLoading ? 'var(--text-muted)' : '#fff',
              fontSize: '15px', fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            {aiLoading ? <Loader2 size={18} className="spin" /> : <BrainCircuit size={18} />}
            {aiLoading ? 'AI đang phân tích...' : 'Gợi ý bằng AI 🤖'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {aiLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '12px' }}>
                <BrainCircuit size={40} color="#7c3aed" />
              </motion.div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>AI đang phân tích nhu cầu của bạn...</div>
              <div>Tìm kiếm dữ liệu thị trường và đề xuất cấu hình phù hợp</div>
            </motion.div>
          )}
        </AnimatePresence>

        {aiError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px', marginTop: '16px' }}>
            ⚠️ {aiError}
          </motion.div>
        )}

        {displayedPcs.length > 0 && (
          <motion.div
            key={aiSource}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#7c3aed" />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {aiSource === 'prebuilt' ? '🖥️ Gợi Ý Máy Tính' : '🤖 AI Đề Xuất'}
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {aiSource === 'prebuilt' ? `${displayedPcs.length} mẫu phổ biến` : '(Dữ liệu thị trường thực tế)'}
                </span>
              </div>
              {aiSource === 'ai' && (
                <button onClick={() => { setAiResults(PREBUILT_PCS); setAiSource('prebuilt'); setAiError(''); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)', color: 'var(--text-primary)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <Monitor size={14} /> Xem gợi ý mặc định
                </button>
              )}
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gap: '16px' }}
            >
              {displayedPcs.map((pc: any, i: number) => (
                <motion.div
                  key={pc.id || i}
                  variants={cardVariants}
                  whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                  style={{
                    padding: '18px', borderRadius: '14px',
                    background: 'var(--bg-surface)',
                    border: aiSource === 'ai'
                      ? '1px solid rgba(124,58,237,0.2)'
                      : '1px solid var(--border-default)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0,
                      overflow: 'hidden', background: '#1a1a2e',
                    }}>
                      {renderImage(pc)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{pc.name}</span>
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '99px',
                          background: aiSource === 'ai' ? 'rgba(124,58,237,0.12)' : 'rgba(0,212,170,0.12)',
                          color: aiSource === 'ai' ? '#7c3aed' : '#00d4aa',
                          fontWeight: 700,
                        }}>
                          {pc.type}
                        </span>
                        {pc.rating && (
                          <span style={{ fontSize: '11px', color: '#f59e0b' }}>{'★'.repeat(Math.round(pc.rating))}</span>
                        )}
                      </div>

                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: '1.5' }}>
                        {pc.specs}
                      </p>

                      {pc.specs_detail && (
                        <div style={{ marginBottom: '4px' }}>
                          <button
                            onClick={() => toggleDetails(pc.id || String(i))}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '2px 8px', borderRadius: '4px', border: 'none',
                              background: 'transparent', color: 'var(--text-muted)',
                              fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                            {showDetails[pc.id || String(i)] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {showDetails[pc.id || String(i)] ? 'Thu gọn' : 'Mở rộng'}
                          </button>

                          {showDetails[pc.id || String(i)] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{
                                marginTop: '6px', padding: '8px', borderRadius: '8px',
                                background: 'var(--bg-elevated)', fontSize: '11px',
                              }}>
                              {Object.entries(pc.specs_detail).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                                  <span style={{ color: 'var(--text-muted)', minWidth: '50px', textTransform: 'capitalize' }}>{key}:</span>
                                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{String(val)}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      <p style={{
                        fontSize: '11px',
                        color: aiSource === 'ai' ? '#7c3aed' : '#6366f1',
                        margin: '4px 0 8px', lineHeight: '1.4',
                      }}>
                        💡 {pc.reason}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: (pc.price_breakdown || pc.stores) ? '10px' : '0' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: '#00d4aa' }}>
                          {formatPrice(pc.price)}
                        </span>
                        {pc.average_price && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 10px', borderRadius: '99px' }}>
                            ⌀ Giá TB: {formatPrice(pc.average_price)}
                          </span>
                        )}
                      </div>

                      {((pc.price_breakdown || []).length > 0 ? pc.price_breakdown : (pc.stores || [])).length > 0 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            <Store size={12} /> So sánh giá:
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(pc.price_breakdown || pc.stores || []).map((store: any, si: number) => (
                              <a key={si} href={store.url} target="_blank" rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '4px 10px', borderRadius: '6px',
                                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                  color: 'var(--text-primary)', fontSize: '10px', fontWeight: 600,
                                  textDecoration: 'none',
                                }}>
                                {store.name || store.store}
                                <span style={{ color: '#00d4aa' }}>{formatPrice(store.price || 0)}</span>
                                <ExternalLink size={10} style={{ opacity: 0.5 }} />
                              </a>
                            ))}
                          </div>
                          <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                            💰 Giá tốt nhất: <span style={{ color: '#10b981', fontWeight: 700 }}>
                              {formatPrice(Math.min(...(pc.price_breakdown || pc.stores || []).map((s: any) => s.price || 0)))}
                            </span>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                        {pc.link && (
                          <a href={pc.link} target="_blank" rel="noopener noreferrer"
                            style={{
                              padding: '6px 16px', borderRadius: '8px',
                              background: 'linear-gradient(135deg, #00d4aa, #00a3ff)',
                              color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                            }}>
                            Mua ngay tại GearVN ↗
                          </a>
                        )}
                        {pc.useCases && pc.useCases.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {pc.useCases.map((uc: string) => (
                              <span key={uc} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                {USE_CASE_LABELS[uc] || uc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
