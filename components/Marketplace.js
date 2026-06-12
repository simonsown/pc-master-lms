'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import componentsData from '../data/componentsData.json';
import scenariosData from '../data/build-scenarios.json';

const categories = ['CPU', 'Mainboard', 'RAM', 'GPU', 'PSU', 'Storage', 'Cooler'];
const categoryLabels = { 'CPU': 'Bộ vi xử lý', 'Mainboard': 'Bo mạch chủ', 'RAM': 'Bộ nhớ RAM', 'GPU': 'Card đồ họa', 'PSU': 'Nguồn điện', 'Storage': 'Ổ cứng', 'Cooler': 'Tản nhiệt' };
const categoryIcons = { 'CPU': '⚡', 'Mainboard': '🔌', 'RAM': '🧠', 'GPU': '🎮', 'PSU': '🔋', 'Storage': '💾', 'Cooler': '❄️' };

const DIFFICULTY_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444', expert: '#8b5cf6' };
const DIFFICULTY_LABELS = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', expert: 'Chuyên gia' };
const USE_CASE_LABELS = { office: '💼 Văn phòng', gaming: '🎮 Gaming', workstation: '🎬 Workstation', productivity: '📊 Đa năng' };

const Marketplace = ({ lang = 'en', onCheckout, onCancel }) => {
    const [phase, setPhase] = useState('select'); // select | store | done
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [cart, setCart] = useState([]);
    const [budget, setBudget] = useState(0);
    const [initialBudget, setInitialBudget] = useState(0);
    const [activeTab, setActiveTab] = useState('CPU');
    const [errorMsg, setErrorMsg] = useState('');

    const s = {
        bgBase: 'var(--bg-base)', bgSurface: 'var(--bg-surface)', bgElevated: 'var(--bg-elevated)',
        textPrimary: 'var(--text-primary)', textMuted: 'var(--text-muted)', textSecondary: 'var(--text-secondary)',
        border: 'var(--border-default)', brand: 'var(--brand-primary)', success: 'var(--success)', danger: 'var(--danger)',
    };

    const selectScenario = (scenario) => {
        setSelectedScenario(scenario);
        const b = scenario.budget_max;
        setBudget(b);
        setInitialBudget(b);
        setCart([]);
        setErrorMsg('');
        setPhase('store');
    };

    const filteredProducts = useMemo(() => componentsData.filter(item => item.type === activeTab), [activeTab]);
    const groupedProducts = useMemo(() => {
        const groups = {};
        for (const prod of filteredProducts) {
            const key = prod.socket || prod.ramType || (prod.type === 'GPU' ? (prod.power >= 200 ? 'Cao cấp' : prod.power >= 100 ? 'Tầm trung' : 'Phổ thông') : 'Mặc định');
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
        if (cart.find(item => item.type === product.type)) { setErrorMsg(`Bạn đã chọn ${product.type} rồi!`); return; }
        const compatError = validateCompat(product);
        if (compatError) { setErrorMsg(compatError); return; }
        if (budget - product.price < 0) { setErrorMsg('Không đủ ngân sách!'); return; }
        setErrorMsg('');
        setCart(prev => [...prev, product]);
        setBudget(prev => prev - product.price);
    };

    const handleRemoveFromCart = (product) => {
        setCart(prev => prev.filter(c => c.id !== product.id));
        setBudget(prev => prev + product.price);
        setErrorMsg('');
    };

    const handleCheckout = () => {
        const required = ['CPU', 'Mainboard', 'RAM', 'PSU'];
        const missing = required.filter(req => !cart.some(c => c.type === req));
        if (missing.length > 0) { setErrorMsg(`Thiếu linh kiện thiết yếu: ${missing.join(', ')}`); return; }
        if (onCheckout) onCheckout({
            purchasedItems: cart,
            remainingBudget: budget,
            scenario: selectedScenario,
            scenarioName: selectedScenario?.name_vn || 'Tự do'
        });
        setPhase('done');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1300px', margin: '0 auto', gap: '1rem', padding: '0 16px', height: 'calc(100vh - 120px)' }}>
            {phase === 'select' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏪</span>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: s.textPrimary }}>Chọn Nghề Nghiệp</h2>
                            <p className="text-sm" style={{ color: s.textMuted }}>Chọn một vai trò nghề nghiệp, nhận ngân sách và lắp PC phù hợp</p>
                        </div>
                    </div>
                    <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {scenariosData.map((sc, i) => (
                            <motion.div
                                key={sc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -4, boxShadow: '0 12px 32px var(--shadow-hover)' }}
                                onClick={() => selectScenario(sc)}
                                className="rounded-2xl p-5 cursor-pointer"
                                style={{ background: s.bgSurface, border: `1px solid ${s.border}` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{sc.icon || '💻'}</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold" style={{ color: s.textPrimary }}>{sc.name_vn}</h3>
                                        <p className="text-sm mt-1" style={{ color: s.textMuted, lineHeight: 1.4 }}>{sc.description_vn}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                                                style={{ background: `${DIFFICULTY_COLORS[sc.difficulty]}20`, color: DIFFICULTY_COLORS[sc.difficulty] }}>
                                                {DIFFICULTY_LABELS[sc.difficulty]}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,212,170,0.1)', color: s.brand }}>
                                                💰 {sc.budget_min.toLocaleString()} - {sc.budget_max.toLocaleString()} ₫
                                            </span>
                                            {sc.requirements?.use_case && (
                                                <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--bg-elevated)', color: s.textSecondary }}>
                                                    {USE_CASE_LABELS[sc.requirements.use_case]}
                                                </span>
                                            )}
                                        </div>
                                        {sc.requirements && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {sc.requirements.min_ram_gb && <ReqTag label={`≥${sc.requirements.min_ram_gb}GB RAM`} />}
                                                {sc.requirements.min_storage_gb && <ReqTag label={`≥${sc.requirements.min_storage_gb}GB ổ`} />}
                                                {sc.requirements.min_gpu_power && <ReqTag label={`GPU ≥${sc.requirements.min_gpu_power}`} />}
                                                {sc.requirements.min_cores && <ReqTag label={`≥${sc.requirements.min_cores} nhân`} />}
                                                {sc.requirements.require_igpu && <ReqTag label="Cần iGPU" />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button onClick={onCancel} className="mt-4 px-6 py-2 rounded-xl font-bold text-sm cursor-pointer"
                        style={{ background: 'transparent', color: s.textMuted, border: `1px solid ${s.border}`, fontFamily: 'inherit' }}>
                        Quay lại
                    </button>
                </motion.div>
            )}

            {phase === 'store' && selectedScenario && (
                <>
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        style={{ padding: '16px 24px', background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '16px' }}>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setPhase('select')}
                                    className="text-lg cursor-pointer" style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}>
                                    ←
                                </motion.button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{selectedScenario.icon || '💻'}</span>
                                        <span className="font-bold" style={{ color: s.textPrimary }}>{selectedScenario.name_vn}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                            style={{ background: `${DIFFICULTY_COLORS[selectedScenario.difficulty]}20`, color: DIFFICULTY_COLORS[selectedScenario.difficulty] }}>
                                            {DIFFICULTY_LABELS[selectedScenario.difficulty]}
                                        </span>
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: s.textMuted }}>{selectedScenario.description_vn}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: s.textMuted }}>Ngân sách</span>
                                <div className="text-2xl font-black" style={{ color: budget > initialBudget * 0.5 ? s.success : budget > initialBudget * 0.2 ? '#f59e0b' : s.danger }}>
                                    {budget.toLocaleString()} ₫
                                </div>
                                <div style={{ height: '4px', background: s.bgElevated, borderRadius: '2px', marginTop: '4px', width: '140px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(budget / initialBudget) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${s.success}, ${s.brand})`, borderRadius: '2px', transition: 'width 0.3s' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>{errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            style={{ padding: '10px 16px', background: `color-mix(in srgb, ${s.danger} 10%, transparent)`, borderLeft: `3px solid ${s.danger}`, borderRadius: '8px', color: s.danger, fontSize: '13px', fontWeight: 600 }}>
                            ⚠ {errorMsg}
                        </motion.div>
                    )}</AnimatePresence>

                    {/* Store */}
                    <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
                        <div style={{ flex: 1, padding: '20px', background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                                {categories.map(cat => (
                                    <motion.button key={cat} onClick={() => setActiveTab(cat)} whileTap={{ scale: 0.96 }}
                                        style={{
                                            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px',
                                            background: activeTab === cat ? s.brand : s.bgElevated,
                                            color: activeTab === cat ? '#fff' : s.textSecondary,
                                            border: `1px solid ${activeTab === cat ? s.brand : s.border}`,
                                            borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                                            whiteSpace: 'nowrap', fontFamily: 'inherit'
                                        }}>
                                        <span>{categoryIcons[cat]}</span> {categoryLabels[cat]}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Products */}
                            <div className="flex-1 overflow-y-auto">
                                {Object.entries(groupedProducts).map(([groupKey, products]) => (
                                    <div key={groupKey} className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: s.brand }}>{groupKey}</div>
                                        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                            {products.map(prod => {
                                                const inCart = cart.some(c => c.id === prod.id);
                                                return (
                                                    <motion.div key={prod.id} whileHover={{ y: -2 }} style={{
                                                        background: s.bgElevated, border: `1px solid ${inCart ? s.brand : s.border}`,
                                                        borderRadius: '12px', padding: '14px', opacity: inCart ? 0.7 : 1, position: 'relative'
                                                    }}>
                                                        {inCart && <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: s.brand }}>ĐÃ MUA</div>}
                                                        <h4 className="text-sm font-bold pr-10" style={{ color: s.textPrimary }}>{prod.name}</h4>
                                                        <div className="text-base font-black mt-1" style={{ color: s.brand }}>{prod.price.toLocaleString()} ₫</div>
                                                        <p className="text-xs mt-1" style={{ color: s.textMuted, lineHeight: 1.3 }}>{prod.desc}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {prod.socket && <Tag label={`Socket: ${prod.socket}`} />}
                                                            {prod.ramType && <Tag label={`RAM: ${prod.ramType}`} />}
                                                            {prod.power && <Tag label={`TDP: ${prod.power}W`} />}
                                                            {prod.wattage && <Tag label={`${prod.wattage}W`} />}
                                                        </div>
                                                        <motion.button whileTap={{ scale: 0.95 }} disabled={inCart} onClick={() => handleAddToCart(prod)}
                                                            style={{
                                                                width: '100%', padding: '8px', marginTop: '8px', fontWeight: 700, fontSize: '12px',
                                                                background: inCart ? s.bgElevated : s.brand, color: inCart ? s.textMuted : '#fff',
                                                                border: `1px solid ${inCart ? s.border : s.brand}`, borderRadius: '8px',
                                                                cursor: inCart ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                                                            }}>
                                                            {inCart ? 'Đã chọn' : 'Thêm vào giỏ'}
                                                        </motion.button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="w-72 shrink-0 flex flex-col gap-3 p-5 rounded-2xl overflow-y-auto"
                            style={{ background: s.bgSurface, border: `1px solid ${s.border}` }}>
                            <div className="flex justify-between items-center pb-3" style={{ borderBottom: `1px solid ${s.border}` }}>
                                <h3 className="text-sm font-bold" style={{ color: s.textPrimary }}>🛒 Giỏ hàng</h3>
                                <span className="text-xs font-bold" style={{ color: s.textMuted }}>{cart.length} linh kiện</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                <AnimatePresence>
                                    {cart.length === 0 ? (
                                        <div className="text-center py-8" style={{ color: s.textMuted, fontSize: '13px' }}>
                                            <div className="text-3xl mb-2">🛍️</div>
                                            Giỏ hàng trống
                                        </div>
                                    ) : cart.map(item => (
                                        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="flex justify-between items-center gap-2 p-3 rounded-xl" style={{ background: s.bgElevated, borderLeft: `3px solid ${s.brand}` }}>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold uppercase" style={{ color: s.textMuted }}>{item.type}</div>
                                                <div className="text-xs font-bold truncate" style={{ color: s.textPrimary }}>{item.name}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs font-bold" style={{ color: s.success }}>{item.price.toLocaleString()} ₫</span>
                                                <button onClick={() => handleRemoveFromCart(item)}
                                                    className="text-lg leading-none cursor-pointer" style={{ background: 'none', border: 'none', color: s.danger }}>×</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="pt-3 space-y-2" style={{ borderTop: `1px solid ${s.border}` }}>
                                <motion.button onClick={handleCheckout} whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, ${s.brand}, #067a4d)`, border: 'none', fontFamily: 'inherit' }}>
                                    🚀 TỚI PHÒNG LAB
                                </motion.button>
                                <button onClick={() => setPhase('select')}
                                    className="w-full py-2 rounded-xl font-bold text-xs cursor-pointer"
                                    style={{ background: 'transparent', color: s.textMuted, border: `1px solid ${s.border}`, fontFamily: 'inherit' }}>
                                    ← Đổi nghề nghiệp
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {phase === 'done' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center flex-1">
                    <div className="text-center p-8 rounded-2xl" style={{ background: s.bgSurface, border: `1px solid ${s.border}` }}>
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: s.textPrimary }}>Đã mua sắm xong!</h2>
                        <p className="mb-6" style={{ color: s.textMuted }}>Bạn đã mua {cart.length} linh kiện cho {selectedScenario?.name_vn}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

function Tag({ label }) {
    const s2 = { border: 'var(--border-default)', bg: 'var(--bg-elevated)', text: 'var(--text-muted)' };
    return <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: s2.bg, color: s2.text, border: `1px solid ${s2.border}` }}>{label}</span>;
}

function ReqTag({ label }) {
    return <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>{label}</span>;
}

export default Marketplace;
