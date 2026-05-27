'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import componentsData from '../data/componentsData.json';
import WindowsSimulator from './WindowsSimulator';

const MISSIONS_LIST = [
  { title: "Home Office Setup", title_vn: "Máy Văn Phòng Cơ Bản",
    desc: "Build a reliable, compact, and energy-efficient PC for word processing and lightweight browsing.",
    desc_vn: "Lắp ráp một cỗ máy ổn định, nhỏ gọn, tiết kiệm điện để soạn thảo văn bản và lướt web nhẹ nhàng.",
    budget: 10000000, targets: { category: "Office", maxBudget: 10000000 } },
  { title: "Esports Gamer", title_vn: "Game Thủ Tập Sự",
    desc: "Assemble a competitive gaming rig capable of high framerates in 1080p for games like CS:GO and Valorant.",
    desc_vn: "Ráp một bộ PC chiến game Thể thao điện tử với FPS cao ở độ phân giải 1080p.",
    budget: 20000000, targets: { category: "1080p Gaming" } },
  { title: "Deep Learning Machine", title_vn: "Cỗ Máy Trí Tuệ Nhân Tạo",
    desc: "Build a stable machine for AI/Deep Learning models with maximum processing power and VRAM.",
    desc_vn: "Xây dựng một cỗ máy ổn định để đào tạo các mô hình AI/Deep Learning kết hợp xử lý dữ liệu nặng.",
    budget: 60000000, targets: { category: "AI", minPower: 850 } },
  { title: "4K Content Creator", title_vn: "Dựng Phim 4K Chuyên Nghiệp",
    desc: "Construct a powerhouse workstation for 4K video editing, heavy multitasking, and rendering.",
    desc_vn: "Lắp ráp một máy trạm hiệu năng cao để edit video 4K, đa nhiệm nặng và render đồ họa 3D.",
    budget: 50000000, targets: { category: "Workstation", minPower: 750 } },
  { title: "Budget Student PC", title_vn: "PC Sinh Viên Tiết Kiệm",
    desc: "A very tight budget build for students doing basic assignments and online classes.",
    desc_vn: "Một bộ máy với ngân sách cực kỳ eo hẹp dành cho học sinh sinh viên học tập online.",
    budget: 8000000, targets: { category: "Budget" } }
];

const categories = ['CPU', 'Mainboard', 'RAM', 'GPU', 'PSU', 'Storage', 'Cooler'];

const categoryLabels = {
  'CPU': 'Bộ vi xử lý', 'Mainboard': 'Bo mạch chủ', 'RAM': 'Bộ nhớ RAM',
  'GPU': 'Card đồ họa', 'PSU': 'Nguồn điện', 'Storage': 'Ổ cứng', 'Cooler': 'Tản nhiệt'
};

const categoryIcons = { 'CPU': '⚡', 'Mainboard': '🔌', 'RAM': '🧠', 'GPU': '🎮', 'PSU': '🔋', 'Storage': '💾', 'Cooler': '❄️' };

const Marketplace = ({ lang = 'en', onCheckout, onCancel }) => {
  const [mission] = useState(() => MISSIONS_LIST[Math.floor(Math.random() * MISSIONS_LIST.length)]);
  const [cart, setCart] = useState([]);
  const [budget, setBudget] = useState(mission.budget);
  const [activeTab, setActiveTab] = useState('CPU');
  const [errorMsg, setErrorMsg] = useState("");
  const [showWindows, setShowWindows] = useState(false);

  const s = {
    bgBase: 'var(--bg-base)', bgSurface: 'var(--bg-surface)',
    bgElevated: 'var(--bg-elevated)', textPrimary: 'var(--text-primary)',
    textMuted: 'var(--text-muted)', textSecondary: 'var(--text-secondary)',
    border: 'var(--border-default)', brand: 'var(--brand-primary)',
    success: 'var(--success)', danger: 'var(--danger)',
  };

  const filteredProducts = useMemo(() => componentsData.filter(item => item.type === activeTab), [activeTab]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    for (const prod of filteredProducts) {
      const key = prod.socket || prod.ramType || (prod.type === 'GPU' ?
        (prod.power >= 200 ? 'Cao cấp' : prod.power >= 100 ? 'Tầm trung' : 'Phổ thông') : 'Mặc định');
      if (!groups[key]) groups[key] = [];
      groups[key].push(prod);
    }
    return groups;
  }, [filteredProducts]);

  const validateCompat = (item) => {
    if (item.type === 'Mainboard') {
      const cpu = cart.find(c => c.type === 'CPU');
      if (cpu && cpu.socket !== item.socket) return `Không tương thích! CPU (${cpu.socket}) khác socket với Mainboard (${item.socket})`;
    }
    if (item.type === 'CPU') {
      const mb = cart.find(c => c.type === 'Mainboard');
      if (mb && mb.socket !== item.socket) return `Không tương thích! Mainboard (${mb.socket}) khác socket với CPU (${item.socket})`;
    }
    if (item.type === 'RAM') {
      const mb = cart.find(c => c.type === 'Mainboard');
      if (mb && mb.ramType && mb.ramType !== item.ramType) return `Bo mạch yêu cầu RAM ${mb.ramType}, nhưng bạn chọn ${item.ramType}`;
    }
    return null;
  };

  const handleAddToCart = (product) => {
    if (cart.find(item => item.type === product.type)) {
      setErrorMsg(`Bạn đã chọn ${product.type} rồi!`); return;
    }
    const compatError = validateCompat(product);
    if (compatError) { setErrorMsg(compatError); return; }
    if (budget - product.price < 0) { setErrorMsg('Không đủ ngân sách!'); return; }
    setErrorMsg("");
    setCart(prev => [...prev, product]);
    setBudget(prev => prev - product.price);
  };

  const handleRemoveFromCart = (product) => {
    setCart(prev => prev.filter(c => c.id !== product.id));
    setBudget(prev => prev + product.price);
    setErrorMsg("");
  };

  const handleCheckout = () => {
    const required = ['CPU', 'Mainboard', 'RAM', 'PSU'];
    const missing = required.filter(req => !cart.some(c => c.type === req));
    if (missing.length > 0) {
      setErrorMsg(`Thiếu linh kiện thiết yếu: ${missing.join(', ')}`); return;
    }
    if (onCheckout) onCheckout({ purchasedItems: cart, remainingBudget: budget, missionId: mission.title });
    else setShowWindows(true);
  };

  if (showWindows) return <WindowsSimulator cart={cart} onExit={() => setShowWindows(false)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1300px', margin: '0 auto', gap: '1rem', padding: '0 16px', height: 'calc(100vh - 120px)' }}>
      {/* Mission Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{
        padding: '20px 28px', background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
        boxShadow: '0 2px 12px var(--shadow-color)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.textMuted }}>Nhiệm vụ</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: s.textPrimary }}>{mission.title_vn}</h2>
          <p style={{ color: s.textMuted, margin: '4px 0 0 0', fontSize: '13px', lineHeight: 1.4 }}>{mission.desc_vn}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: s.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngân sách còn</span>
          <div style={{
            fontSize: '24px', fontWeight: 900,
            color: budget > mission.budget * 0.5 ? s.success : (budget > mission.budget * 0.2 ? s.warning || '#f59e0b' : s.danger),
            textShadow: 'none'
          }}>{budget.toLocaleString()} ₫</div>
          <div style={{ height: '4px', background: s.bgElevated, borderRadius: '2px', marginTop: '4px', width: '160px', overflow: 'hidden' }}>
            <div style={{ width: `${(budget / mission.budget) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${s.success}, ${s.brand})`, borderRadius: '2px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ padding: '12px 16px', background: `color-mix(in srgb, ${s.danger} 10%, transparent)`, borderLeft: `3px solid ${s.danger}`, borderRadius: '8px', color: s.danger, fontSize: '13px', fontWeight: 600 }}>
            ⚠ {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Product Catalog */}
        <div style={{
          flex: 1, padding: '24px', background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '16px',
          display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', minHeight: 0
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', flexShrink: 0 }}>
            {categories.map(cat => (
              <motion.button key={cat} onClick={() => setActiveTab(cat)} whileTap={{ scale: 0.96 }} style={{
                padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px',
                background: activeTab === cat ? s.brand : s.bgElevated,
                color: activeTab === cat ? '#fff' : s.textSecondary,
                border: `1px solid ${activeTab === cat ? s.brand : s.border}`,
                borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'inherit'
              }}>
                <span>{categoryIcons[cat]}</span> {categoryLabels[cat]}
              </motion.button>
            ))}
          </div>

          {/* Products */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groupedProducts).map(([groupKey, products]) => (
              <motion.div key={groupKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.brand, marginBottom: '8px' }}>
                  {groupKey}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {products.map(prod => {
                    const inCart = cart.some(c => c.id === prod.id);
                    return (
                      <motion.div key={prod.id} layout whileHover={{ y: -3, boxShadow: `0 8px 24px var(--shadow-hover)` }} style={{
                        background: s.bgElevated, border: `1px solid ${inCart ? s.brand : s.border}`,
                        borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
                        opacity: inCart ? 0.7 : 1, transition: 'border-color 0.2s', position: 'relative'
                      }}>
                        {inCart && <div style={{ position: 'absolute', top: '8px', right: '8px', background: s.brand, color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>ĐÃ MUA</div>}
                        <h4 style={{ margin: 0, color: s.textPrimary, fontSize: '14px', fontWeight: 700, paddingRight: inCart ? '50px' : 0 }}>{prod.name}</h4>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: s.brand }}>{prod.price.toLocaleString()} ₫</div>
                        <p style={{ fontSize: '12px', color: s.textMuted, margin: 0, lineHeight: 1.4, flex: 1 }}>{prod.desc}</p>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {prod.socket && <Tag label={`Socket: ${prod.socket}`} />}
                          {prod.ramType && <Tag label={`RAM: ${prod.ramType}`} />}
                          {prod.power && <Tag label={`TDP: ${prod.power}W`} />}
                          {prod.wattage && <Tag label={`C.suất: ${prod.wattage}W`} />}
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} disabled={inCart} onClick={() => handleAddToCart(prod)} style={{
                          width: '100%', padding: '10px', marginTop: '4px', fontWeight: 700, fontSize: '13px',
                          background: inCart ? s.bgElevated : s.brand, color: inCart ? s.textMuted : '#fff',
                          border: `1px solid ${inCart ? s.border : s.brand}`,
                          borderRadius: '8px', cursor: inCart ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                        }}>
                          {inCart ? 'Đã chọn' : 'Thêm vào giỏ'}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div style={{
          width: '300px', flexShrink: 0, padding: '20px', background: s.bgSurface, border: `1px solid ${s.border}`,
          borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${s.border}`, paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: s.textPrimary }}>🛒 Giỏ hàng</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: s.textMuted }}>{cart.length} linh kiện</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
            <AnimatePresence>
              {cart.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: s.textMuted, fontSize: '13px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛍️</div>
                  Giỏ hàng trống
                </div>
              ) : cart.map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
                    background: s.bgElevated, padding: '10px 12px', borderRadius: '10px', borderLeft: `3px solid ${s.brand}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: s.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{item.type}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: s.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: s.success, fontWeight: 700, fontSize: '12px' }}>{item.price.toLocaleString()} ₫</span>
                    <button onClick={() => handleRemoveFromCart(item)}
                      style={{ background: 'none', border: 'none', color: s.danger, cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: 1 }}>×</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: `1px solid ${s.border}` }}>
            <motion.button onClick={handleCheckout} whileTap={{ scale: 0.97 }} style={{
              padding: '14px', background: `linear-gradient(135deg, ${s.brand}, var(--brand-dark, #067a4d))`, color: '#fff',
              border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              boxShadow: `0 4px 16px color-mix(in srgb, ${s.brand} 40%, transparent)`, fontFamily: 'inherit'
            }}>
              🚀 TỚI PHÒNG LAB
            </motion.button>
            <button onClick={onCancel} style={{
              padding: '10px', background: 'transparent', color: s.textMuted, border: `1px solid ${s.border}`,
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit'
            }}>
              Đổi nhiệm vụ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Tag({ label }) {
  const s = { border: 'var(--border-default)', bg: 'var(--bg-elevated)', text: 'var(--text-muted)' };
  return <span style={{ background: s.bg, padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, color: s.text, border: `1px solid ${s.border}` }}>{label}</span>;
}

export default Marketplace;
