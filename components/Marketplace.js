'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import componentsData from '../data/componentsData.json';
import WindowsSimulator from './WindowsSimulator';

// Danh sách các nhiệm vụ ngẫu nhiên
const MISSIONS_LIST = [
    {
        title: "Home Office Setup",
        title_vn: "Máy Văn Phòng Cơ Bản",
        desc: "Build a reliable, compact, and energy-efficient PC for word processing and lightweight browsing.",
        desc_vn: "Lắp ráp một cỗ máy ổn định, nhỏ gọn, tiết kiệm điện để soạn thảo văn bản và lướt web nhẹ nhàng.",
        budget: 10000000,
        targets: { category: "Office", maxBudget: 10000000 }
    },
    {
        title: "Esports Gamer",
        title_vn: "Game Thủ Tập Sự",
        desc: "Assemble a competitive gaming rig capable of high framerates in 1080p for games like CS:GO and Valorant.",
        desc_vn: "Ráp một bộ PC chiến game Thể thao điện tử với FPS cao ở độ phân giải 1080p.",
        budget: 20000000,
        targets: { category: "1080p Gaming" }
    },
    {
        title: "Deep Learning Machine",
        title_vn: "Cỗ Máy Trí Tuệ Nhân Tạo",
        desc: "Build a stable machine for AI/Deep Learning models with maximum processing power and VRAM.",
        desc_vn: "Xây dựng một cỗ máy ổn định để đào tạo các mô hình AI/Deep Learning kết hợp xử lý dữ liệu nặng.",
        budget: 60000000,
        targets: { category: "AI", minPower: 850 }
    },
    {
        title: "4K Content Creator",
        title_vn: "Dựng Phim 4K Chuyên Nghiệp",
        desc: "Construct a powerhouse workstation for 4K video editing, heavy multitasking, and rendering.",
        desc_vn: "Lắp ráp một máy trạm hiệu năng cao để edit video 4K, đa nhiệm nặng và render đồ họa 3D.",
        budget: 50000000,
        targets: { category: "Workstation", minPower: 750 }
    },
    {
        title: "Budget Student PC",
        title_vn: "PC Sinh Viên Tiết Kiệm",
        desc: "A very tight budget build for students doing basic assignments and online classes.",
        desc_vn: "Một bộ máy với ngân sách cực kỳ eo hẹp dành cho học sinh sinh viên học tập online.",
        budget: 8000000,
        targets: { category: "Budget" }
    }
];

const Marketplace = ({ lang = 'en', onCheckout, onCancel }) => {
    // Tự động chọn ngẫu nhiên 1 nhiệm vụ khi Component được Mount (render lần đầu)
    const [mission] = useState(() => MISSIONS_LIST[Math.floor(Math.random() * MISSIONS_LIST.length)]);

    const [cart, setCart] = useState([]);
    const [budget, setBudget] = useState(mission.budget);
    const [activeTab, setActiveTab] = useState('CPU');
    const [errorMsg, setErrorMsg] = useState("");
    const [showWindows, setShowWindows] = useState(false);

    const categories = ['CPU', 'Mainboard', 'RAM', 'GPU', 'PSU', 'Storage', 'Cooler'];
    const categoryLabels = {
        'CPU': lang === 'en' ? 'CPU' : 'Bộ vi xử lý',
        'Mainboard': lang === 'en' ? 'Mainboard' : 'Bo mạch chủ',
        'RAM': lang === 'en' ? 'RAM' : 'Bộ nhớ RAM',
        'GPU': lang === 'en' ? 'GPU' : 'Card đồ họa',
        'PSU': lang === 'en' ? 'PSU' : 'Nguồn điện',
        'Storage': lang === 'en' ? 'Storage' : 'Ổ cứng',
        'Cooler': lang === 'en' ? 'Cooler' : 'Tản nhiệt'
    };

    // Lọc sản phẩm theo Tab
    const filteredProducts = useMemo(() => {
        return componentsData.filter(item => item.type === activeTab);
    }, [activeTab]);

    // Check Logic tương thích cơ bản (Mô phỏng)
    const validateCompat = (item) => {
        let err = null;
        if (item.type === 'Mainboard') {
            const cpu = cart.find(c => c.type === 'CPU');
            if (cpu && cpu.socket !== item.socket) {
                err = lang === 'en'
                    ? `Incompatible! CPU is ${cpu.socket} but Mainboard is ${item.socket}`
                    : `Không tương thích! CPU dùng Socket ${cpu.socket} nhưng Bo mạch dùng Socket ${item.socket}`;
            }
        }
        if (item.type === 'CPU') {
            const mb = cart.find(c => c.type === 'Mainboard');
            if (mb && mb.socket !== item.socket) {
                err = lang === 'en'
                    ? `Incompatible! Mainboard is ${mb.socket} but CPU is ${item.socket}`
                    : `Không tương thích! Bo mạch dùng Socket ${mb.socket} nhưng CPU dùng Socket ${item.socket}`;
            }
        }
        if (item.type === 'RAM') {
            const mb = cart.find(c => c.type === 'Mainboard');
            if (mb && mb.ramType && mb.ramType !== item.ramType) {
                err = lang === 'en'
                    ? `Mainboard requires ${mb.ramType}, but you picked ${item.ramType}`
                    : `Bo mạch yêu cầu ${mb.ramType}, nhưng bạn chọn RAM loại ${item.ramType}`;
            }
        }
        return err;
    };

    const handleAddToCart = (product) => {
        if (cart.find(item => item.type === product.type)) {
            setErrorMsg(lang === 'en' ? `You already have a ${product.type} in cart.` : `Bạn đã có ${product.type} trong giỏ!`);
            return;
        }

        const compatError = validateCompat(product);
        if (compatError) {
            setErrorMsg(lang === 'en' ? compatError : 'Lỗi tương thích: Vui lòng kiểm tra lại linh kiện.');
            return;
        }

        if (budget - product.price < 0) {
            setErrorMsg(lang === 'en' ? 'Not enough budget!' : 'Không đủ ngân sách!');
            return;
        }

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
        // Simple check if essential components are present
        const required = ['CPU', 'Mainboard', 'RAM', 'PSU'];
        const missing = required.filter(req => !cart.some(c => c.type === req));

        if (missing.length > 0) {
            setErrorMsg(lang === 'en'
                ? `Missing essential components: ${missing.join(', ')}`
                : `Thiếu linh kiện thiết yếu: ${missing.join(', ')}`);
            return;
        }

        // Chuyển sang Giai đoạn 3: Lắp ráp (Truyền giỏ hàng ra ngoài)
        if (onCheckout) {
            onCheckout({ purchasedItems: cart, remainingBudget: budget, missionId: mission.title });
        } else {
            // Show Windows simulation if no onCheckout handler
            setShowWindows(true);
        }
    };

    if (showWindows) return <WindowsSimulator cart={cart} onExit={() => setShowWindows(false)} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1300px', margin: '0 auto', gap: '1rem', padding: '0 16px', height: 'calc(100vh - 120px)' }}>
            {/* Mission Header */}
            <div className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--accent-purple)' }}>
                <div>
                    <h2 className="neon-text-purple" style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.2rem' }}>
                        {lang === 'en' ? `Quest: ${mission.title}` : `Nhiệm vụ: ${mission.title_vn}`}
                    </h2>
                    <p style={{ color: '#ccc', margin: '4px 0 0 0', fontSize: '0.9rem' }}>{lang === 'en' ? mission.desc : mission.desc_vn}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem' }}>{lang === 'en' ? 'REMAINING BUDGET' : 'NGÂN SÁCH CÒN LẠI'}</h3>
                    <div style={{
                        fontSize: '1.8rem', fontWeight: 'bold', color: budget > 5000000 ? 'var(--accent-green)' : (budget > 1000000 ? 'var(--accent-yellow)' : '#ef4444'),
                        textShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                    }}>
                        {budget.toLocaleString()} VNĐ
                    </div>
                </div>
            </div>

            {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', fontWeight: 'bold' }}>
                    ⚠ {errorMsg}
                </motion.div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden', alignItems: 'start', minHeight: 0 }}>
                {/* Product Catalog */}
                <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', minHeight: 0 }}>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveTab(cat)} style={{
                                padding: '10px 20px',
                                background: activeTab === cat ? 'var(--primary-neon)' : 'transparent',
                                color: activeTab === cat ? '#000' : '#fff',
                                border: '1px solid var(--primary-neon)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}>
                                {categoryLabels[cat]}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                        {filteredProducts.map(prod => {
                            const inCart = cart.some(c => c.id === prod.id);
                            return (
                                <div key={prod.id} style={{
                                    background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '10px', padding: '1rem',
                                    display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: inCart ? 'not-allowed' : 'pointer',
                                    opacity: inCart ? 0.5 : 1
                                }}
                                    onMouseOver={(e) => { if (!inCart) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,255,255,0.1)'; } }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <h4 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.1rem' }}>{prod.name}</h4>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-neon)' }}>{prod.price.toLocaleString()} VNĐ</div>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, flex: 1 }}>{prod.desc}</p>

                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                                        {prod.socket && <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>Socket: {prod.socket}</span>}
                                        {prod.ramType && <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>{lang === 'en' ? 'RAM:' : 'Loại RAM:'} {prod.ramType}</span>}
                                        {prod.power && <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>TDP: {prod.power}W</span>}
                                        {prod.wattage && <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>{lang === 'en' ? 'Power:' : 'Công suất:'} {prod.wattage}W</span>}
                                    </div>

                                    <button
                                        disabled={inCart}
                                        onClick={() => handleAddToCart(prod)}
                                        style={{
                                            marginTop: 'auto', width: '100%', padding: '10px', background: inCart ? '#334155' : 'var(--accent-blue)', color: 'white',
                                            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: inCart ? 'not-allowed' : 'pointer',
                                            boxShadow: inCart ? 'none' : '0 0 10px rgba(56, 189, 248, 0.5)'
                                        }}
                                    >
                                        {inCart ? (lang === 'en' ? 'PURCHASED' : 'ĐÃ CHỌN') : (lang === 'en' ? 'BUY' : 'MUA')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: CART */}
                <div className="glass-panel" style={{ width: '300px', flexShrink: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(2, 6, 23, 0.8)', overflowY: 'auto' }}>
                    <h3 className="neon-text-blue" style={{ margin: 0, borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                        {lang === 'en' ? 'INVENTORY CARD' : 'GIỎ HÀNG'} ({cart.length})
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px' }}>
                        <AnimatePresence>
                            {cart.length === 0 && (
                                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>
                                    {lang === 'en' ? 'Your cart is empty.' : 'Giỏ hàng đang trống.'}
                                </p>
                            )}
                            {cart.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: '#0f172a', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--primary-neon)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{item.type}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{item.price.toLocaleString()} VNĐ</span>
                                        <button onClick={() => handleRemoveFromCart(item)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                        <button onClick={handleCheckout} style={{
                            padding: '1rem', background: 'var(--primary-neon)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem',
                            cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)'
                        }}>
                            {lang === 'en' ? 'PROCEED TO LAB ➔' : 'TỚI PHÒNG LAB ➔'}
                        </button>
                        <button onClick={onCancel} style={{
                            padding: '1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            {lang === 'en' ? 'CHANGE MISSION' : 'ĐỔI NHIỆM VỤ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
