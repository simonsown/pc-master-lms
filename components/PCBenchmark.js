'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FPS_TYPES = {
    office: { label: 'Văn phòng', fps: 120, icon: '💼', color: '#10b981' },
    gaming: { label: 'Gaming 1080p', fps: 85, icon: '🎮', color: '#f59e0b' },
    gaming1440p: { label: 'Gaming 1440p', fps: 60, icon: '🎯', color: '#f97316' },
    rendering: { label: 'Render 4K', fps: 35, icon: '🎬', color: '#ef4444' },
    streaming: { label: 'Stream + Game', fps: 55, icon: '📡', color: '#8b5cf6' },
};

const RATINGS = [
    { min: 0, label: 'PC Văn Phòng', icon: '💻', color: '#6b7280', desc: 'Duyệt web, học tập, xem phim' },
    { min: 5000, label: 'PC Cơ Bản', icon: '🖥️', color: '#10b981', desc: 'Làm việc văn phòng, giải trí nhẹ' },
    { min: 10000, label: 'PC Tầm Trung', icon: '🎮', color: '#f59e0b', desc: 'Chơi game 1080p mượt mà' },
    { min: 15000, label: 'PC Gaming Cao Cấp', icon: '🔥', color: '#f97316', desc: 'Chơi game 1440p+ 60FPS' },
    { min: 22000, label: 'PC Workstation', icon: '⚡', color: '#ef4444', desc: 'Render, dựng phim, lập trình' },
    { min: 30000, label: 'PC Siêu Cấp', icon: '👑', color: '#8b5cf6', desc: 'Mọi tác vụ, max setting 4K' },
];

function calcScore(placedItemsList) {
    const counts = {};
    placedItemsList.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

    const cpu = (counts['CPU'] || 0) * 8500;
    const gpu = (counts['GPU'] || 0) * 10000;
    const ram = (counts['RAM'] || 0) * 2500;
    const ssd = (counts['SSD'] || 0) * 1800;
    const cooler = (counts['COOLER'] || 0) * 1200;
    const psu = (counts['PSU'] || 0) * 800;

    return {
        cpu, gpu, ram, ssd, cooler, psu,
        total: cpu + gpu + ram + ssd + cooler + psu
    };
}

function getFps(scores) {
    const baseMultiplier = scores.total / 20000;
    return {
        office: Math.round(Math.min(FPS_TYPES.office.fps * baseMultiplier, 200)),
        gaming: Math.round(Math.min(FPS_TYPES.gaming.fps * baseMultiplier, 300)),
        gaming1440p: Math.round(Math.min(FPS_TYPES.gaming1440p.fps * baseMultiplier, 200)),
        rendering: Math.round(Math.min(FPS_TYPES.rendering.fps * baseMultiplier, 120)),
        streaming: Math.round(Math.min(FPS_TYPES.streaming.fps * baseMultiplier, 180)),
    };
}

export default function PCBenchmark({ placedItemsList, onClose }) {
    const [phase, setPhase] = useState('intro');
    const [scores, setScores] = useState(null);
    const animRef = useRef({});
    const [animValues, setAnimValues] = useState({ cpu: 0, gpu: 0, ram: 0, ssd: 0, cooler: 0, psu: 0, total: 0 });
    const [showFps, setShowFps] = useState(false);
    const startTime = useRef(null);

    useEffect(() => {
        if (phase !== 'benchmarking') return;
        startTime.current = Date.now();
        const result = calcScore(placedItemsList || []);
        setScores(result);

        const duration = 2000;
        const targets = { ...result };
        const startVals = { cpu: 0, gpu: 0, ram: 0, ssd: 0, cooler: 0, psu: 0, total: 0 };
        const startAnim = performance.now();

        function animate(now) {
            const elapsed = now - startAnim;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 2);

            const next = {};
            for (const key of Object.keys(targets)) {
                next[key] = Math.round(startVals[key] + (targets[key] - startVals[key]) * ease);
            }
            setAnimValues(next);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => setShowFps(true), 500);
            }
        }
        requestAnimationFrame(animate);
    }, [phase]);

    const rating = scores ? RATINGS.findLast(r => scores.total >= r.min) : RATINGS[0];
    const fps = scores ? getFps(scores) : {};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
                <div className="p-8">
                    {phase === 'intro' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                            <div className="text-6xl mb-6">🏁</div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>PC Benchmark Test</h2>
                            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                                Đo hiệu năng hệ thống của bạn qua CPU, GPU, RAM, ổ cứng và nguồn.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setPhase('benchmarking')}
                                className="px-8 py-3 rounded-xl text-lg font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #00d4aa, #089e60)' }}
                            >
                                🚀 Bắt Đầu Benchmark
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === 'benchmarking' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                                🔬 Đang chạy Benchmark...
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { key: 'cpu', label: 'CPU', icon: '🧠', max: scores?.cpu || 1, color: '#00d4aa' },
                                    { key: 'gpu', label: 'GPU', icon: '🎨', max: scores?.gpu || 1, color: '#f59e0b' },
                                    { key: 'ram', label: 'RAM', icon: '💾', max: scores?.ram || 1, color: '#8b5cf6' },
                                    { key: 'ssd', label: 'SSD', icon: '💽', max: scores?.ssd || 1, color: '#3b82f6' },
                                    { key: 'cooler', label: 'Tản Nhiệt', icon: '❄️', max: scores?.cooler || 1, color: '#06b6d4' },
                                    { key: 'psu', label: 'Nguồn', icon: '🔌', max: scores?.psu || 1, color: '#ef4444' },
                                ].map(item => (
                                    <div key={item.key}>
                                        <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            <span>{item.icon} {item.label}</span>
                                            <span>{animValues[item.key]?.toLocaleString()} điểm</span>
                                        </div>
                                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ width: `${Math.min((animValues[item.key] / item.max) * 100, 100)}%`, background: item.color }}
                                                initial={{ width: 0 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence>
                                {animValues.total > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border-default)' }}
                                    >
                                        <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Tổng điểm</div>
                                        <div className="text-4xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
                                            {animValues.total?.toLocaleString()}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <span className="text-2xl">{rating?.icon}</span>
                                            <span className="text-xl font-bold" style={{ color: rating?.color }}>{rating?.label}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{rating?.desc}</p>

                                        {showFps && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-6"
                                            >
                                                <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Hiệu năng dự kiến</div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {Object.entries(fps).map(([key, val]) => (
                                                        <div key={key} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)' }}>
                                                            <div className="text-lg mb-1">{FPS_TYPES[key]?.icon}</div>
                                                            <div className="text-lg font-bold" style={{ color: FPS_TYPES[key]?.color }}>
                                                                {val} <span className="text-xs">FPS</span>
                                                            </div>
                                                            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{FPS_TYPES[key]?.label}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 flex gap-4 justify-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        onClick={() => { setPhase('intro'); setShowFps(false); setAnimValues({ cpu: 0, gpu: 0, ram: 0, ssd: 0, cooler: 0, psu: 0, total: 0 }); }}
                                                        className="px-6 py-2.5 rounded-xl font-bold"
                                                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                                                    >
                                                        🔄 Chạy Lại
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        onClick={onClose}
                                                        className="px-6 py-2.5 rounded-xl font-bold text-white"
                                                        style={{ background: 'linear-gradient(135deg, #00d4aa, #089e60)' }}
                                                    >
                                                        ✅ Hoàn Tất
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
