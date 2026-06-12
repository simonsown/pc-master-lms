'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BEEP_CODES = {
    missing_cpu: { pattern: 'BEEP BEEP BEEP', label: 'CPU lỗi hoặc không gắn', color: '#ef4444' },
    missing_ram: { pattern: 'BEEP... BEEP... BEEP...', label: 'RAM không được phát hiện', color: '#f59e0b' },
    missing_gpu: { pattern: 'BEEP BEEP - ngắn - BEEP', label: 'Không tìm thấy GPU', color: '#f97316' },
    ok: { pattern: 'BEEP (ngắn)', label: 'POST OK', color: '#10b981' },
};

export default function PCBootSimulator({ placedItemsList, onClose }) {
    const [bootPhase, setBootPhase] = useState('post');
    const [bootMessages, setBootMessages] = useState([]);
    const [showError, setShowError] = useState(false);
    const dotsRef = useRef(0);
    const [dots, setDots] = useState('');
    const [showDesktop, setShowDesktop] = useState(false);

    const counts = {};
    (placedItemsList || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const hasCPU = (counts['CPU'] || 0) >= 1;
    const hasRAM = (counts['RAM'] || 0) >= 1;
    const hasGPU = (counts['GPU'] || 0) >= 1;
    const hasSSD = (counts['SSD'] || 0) >= 1;
    const hasPSU = (counts['PSU'] || 0) >= 1;
    const allOK = hasCPU && hasRAM && hasGPU && hasSSD && hasPSU;

    const missing = [];
    if (!hasCPU) missing.push('CPU');
    if (!hasRAM) missing.push('RAM');
    if (!hasGPU) missing.push('GPU');
    if (!hasSSD) missing.push('SSD');
    if (!hasPSU) missing.push('PSU');

    // Loading dots animation
    useEffect(() => {
        if (bootPhase !== 'loading' && bootPhase !== 'post') return;
        const interval = setInterval(() => {
            dotsRef.current = (dotsRef.current + 1) % 4;
            setDots('.'.repeat(dotsRef.current));
        }, 400);
        return () => clearInterval(interval);
    }, [bootPhase]);

    // Boot sequence
    useEffect(() => {
        let timer;

        // Phase 1: POST screen
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, '🖥️ PC Master BIOS v2.04 (UEFI)']);
        }, 300);
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, `🧠 CPU: ${hasCPU ? 'Detected ✓' : 'NOT FOUND ✗'}`]);
        }, 700);
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, `💾 RAM: ${hasRAM ? 'Detected ✓' : 'NOT FOUND ✗'}`]);
        }, 1100);
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, `🎨 GPU: ${hasGPU ? 'Detected ✓' : 'NOT FOUND ✗'}`]);
        }, 1500);
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, `💽 SSD: ${hasSSD ? 'Detected ✓' : 'NOT FOUND ✗'}`]);
        }, 1900);
        timer = setTimeout(() => {
            setBootMessages(prev => [...prev, `🔌 PSU: ${hasPSU ? 'Detected ✓' : 'NOT FOUND ✗'}`]);
        }, 2300);

        // Phase 2: Beep / Error check
        timer = setTimeout(() => {
            if (!allOK) {
                setShowError(true);
                setBootPhase('error');
            } else {
                setBootMessages(prev => [...prev, '', '✅ POST OK - BEEP (ngắn)']);
                setBootPhase('bios');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // BIOS splash
    useEffect(() => {
        if (bootPhase !== 'bios') return;
        const timer = setTimeout(() => {
            setBootPhase('loading');
        }, 2000);
        return () => clearTimeout(timer);
    }, [bootPhase]);

    // Windows loading
    useEffect(() => {
        if (bootPhase !== 'loading') return;
        const timer = setTimeout(() => {
            setShowDesktop(true);
            setBootPhase('desktop');
        }, 3000);
        return () => clearTimeout(timer);
    }, [bootPhase]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: '#000' }}
        >
            {bootPhase === 'post' && (
                <div className="text-center p-8 font-mono">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                        <pre style={{ color: '#00ff00', fontSize: '11px', lineHeight: 1.4 }}>
                            {`
    ╔══════════════════════════════════════╗
    ║    PC Master BIOS v2.04 (UEFI)       ║
    ║    Power-On Self Test                ║
    ╚══════════════════════════════════════╝`}
                        </pre>
                    </motion.div>
                    <div className="inline-block text-left" style={{ color: '#c0c0c0', fontSize: '14px', lineHeight: 1.8 }}>
                        {bootMessages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {msg}
                            </motion.div>
                        ))}
                        {bootMessages.length < 8 && (
                            <span style={{ color: '#00ff00' }}>_{dots}</span>
                        )}
                    </div>
                </div>
            )}

            {bootPhase === 'error' && showError && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 font-mono"
                >
                    <div className="text-6xl mb-6">💥</div>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#ef4444' }}>
                        POST FAILED - LỖI HỆ THỐNG
                    </h2>
                    <div className="inline-block text-left mb-8" style={{ color: '#ff4444', fontSize: '16px', lineHeight: 2 }}>
                        {missing.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span>✗</span>
                                <span>{m}: Không tìm thấy</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl mb-8" style={{ background: '#1a0000', border: '1px solid #ef4444' }}>
                        <div className="text-lg font-bold mb-2" style={{ color: '#f59e0b' }}>
                            🔊 Mã Beep: {missing.length > 1 ? 'Nhiều lỗi' : missing[0] === 'CPU' ? BEEP_CODES.missing_cpu.pattern : missing[0] === 'RAM' ? BEEP_CODES.missing_ram.pattern : BEEP_CODES.missing_gpu.pattern}
                        </div>
                        <p style={{ color: '#ff8888', fontSize: '13px' }}>
                            Hệ thống không thể boot. Kiểm tra lại các linh kiện bị thiếu.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                        🔄 Quay Lại
                    </motion.button>
                </motion.div>
            )}

            {bootPhase === 'bios' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8"
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                    >
                        🖥️
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#00d4aa' }}>
                        PC Master Builder
                    </h1>
                    <p className="text-lg mb-4" style={{ color: '#6b7280' }}>
                        BIOS Version 2.04 (UEFI)
                    </p>
                    <div className="text-sm" style={{ color: '#4b5563' }}>
                        Press DEL to enter Setup
                    </div>
                    <div className="mt-4 text-xs" style={{ color: '#374151' }}>
                        Detecting drives{dots}
                    </div>
                </motion.div>
            )}

            {bootPhase === 'loading' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8"
                >
                    <div className="mb-12">
                        <div className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,170,0.3))' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="inline-block"
                            >
                                ⏳
                            </motion.div>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#00d4aa' }}>
                        Đang khởi động Windows{dots}
                    </h2>
                    <div className="flex gap-2 justify-center">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 rounded-full"
                                style={{ background: '#00d4aa' }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {bootPhase === 'desktop' && showDesktop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                    <div className="p-6" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0d2137)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="text-white font-semibold">PC Master OS</span>
                        </div>
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🖥️</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Boot Successful!</h2>
                            <p className="text-sm" style={{ color: '#94a3b8' }}>Hệ thống đã khởi động thành công</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>📋 Thông số hệ thống</div>
                            <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <div>• CPU: {hasCPU ? 'Đã phát hiện' : '✗'}</div>
                                <div>• RAM: {hasRAM ? `${counts['RAM'] || 0} thanh` : '✗'}</div>
                                <div>• GPU: {hasGPU ? 'Đã phát hiện' : '✗'}</div>
                                <div>• Ổ cứng: {hasSSD ? 'SSD đã sẵn sàng' : '✗'}</div>
                                <div>• Nguồn: {hasPSU ? 'Đã cấp điện' : '✗'}</div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #00d4aa, #089e60)' }}
                        >
                            ✅ Hoàn Tất
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
