'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMPONENTS = [
    { id: 'cpu', name: 'CPU', icon: '🧠', desc: 'Bộ xử lý trung tâm, não bộ của máy tính', clues: ['Có chân cắm LGA/AM', 'Tản nhiệt yêu cầu quạt', 'Socket tương thích mainboard'] },
    { id: 'gpu', name: 'GPU / Card Đồ Họa', icon: '🎮', desc: 'Xử lý đồ họa, game, render video', clues: ['Khe PCIe x16', 'Có quạt tản nhiệt lớn', 'Cổng HDMI/DisplayPort'] },
    { id: 'ram', name: 'RAM', icon: '💾', desc: 'Bộ nhớ tạm, lưu dữ liệu đang chạy', clues: ['Khe DIMM trên mainboard', 'Có DDR4/DDR5', 'Dung lượng GB'] },
    { id: 'ssd', name: 'SSD', icon: '💽', desc: 'Ổ cứng thể rắn, lưu trữ dữ liệu', clues: ['Không có đĩa quay', 'Giao diện SATA/M.2 NVMe', 'Tốc độ đọc/ghi cao'] },
    { id: 'psu', name: 'PSU / Nguồn', icon: '🔌', desc: 'Cung cấp điện cho toàn bộ hệ thống', clues: ['Có công suất Watt', 'Dây cáp 24-pin, 8-pin', 'Quạt làm mát bên trong'] },
    { id: 'cooler', name: 'Tản Nhiệt CPU', icon: '❄️', desc: 'Làm mát CPU, giữ nhiệt độ ổn định', clues: ['Gắn trên CPU', 'Có quạt hoặc tản nước', 'Keo tản nhiệt ở đáy'] },
    { id: 'motherboard', name: 'Mainboard', icon: '📟', desc: 'Bo mạch chủ kết nối tất cả linh kiện', clues: ['Socket CPU', 'Khe RAM DIMM', 'Các cổng I/O sau lưng'] },
    { id: 'hdd', name: 'HDD', icon: '💿', desc: 'Ổ cứng cơ, lưu trữ dung lượng lớn giá rẻ', clues: ['Có đĩa từ quay', 'Dung lượng TB', 'Chậm hơn SSD'] },
    { id: 'case', name: 'Case / Thùng Máy', icon: '🖥️', desc: 'Vỏ bảo vệ và chứa linh kiện', clues: ['Có nút nguồn', 'Kích thước ATX/Micro-ATX', 'Cổng USB mặt trước'] },
    { id: 'thermal_paste', name: 'Keo Tản Nhiệt', icon: '🧴', desc: 'Dẫn nhiệt giữa CPU và tản nhiệt', clues: ['Màu trắng/xám', 'Bôi 1 lớp mỏng', 'Cần thay định kỳ'] },
];

const QUESTIONS_PER_GAME = 8;

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function ComponentQuiz({ onClose }) {
    const [phase, setPhase] = useState('intro');
    const [questions, setQuestions] = useState([]);
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [results, setResults] = useState([]);

    const startGame = useCallback(() => {
        const comps = shuffle(COMPONENTS).slice(0, QUESTIONS_PER_GAME);
        const qs = comps.map(comp => {
            const others = shuffle(COMPONENTS.filter(c => c.id !== comp.id)).slice(0, 3);
            const options = shuffle([comp, ...others]);
            return { correct: comp, options };
        });
        setQuestions(qs);
        setQIndex(0);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setSelected(null);
        setShowResult(false);
        setResults([]);
        setPhase('playing');
    }, []);

    const handleAnswer = (answer) => {
        if (selected) return;
        setSelected(answer.id);
        const isCorrect = answer.id === questions[qIndex].correct.id;

        const newResults = [...results, {
            question: questions[qIndex].correct,
            yourAnswer: answer,
            isCorrect
        }];
        setResults(newResults);

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);
            setScore(score + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            if (qIndex + 1 < questions.length) {
                setQIndex(qIndex + 1);
                setSelected(null);
            } else {
                setPhase('done');
            }
        }, 1200);
    };

    const currentQ = questions[qIndex];

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
                className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
                {phase === 'intro' && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-6">🔍</div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Đoán Linh Kiện</h2>
                        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                            Xem gợi ý và đoán xem đó là linh kiện gì!<br />
                            {QUESTIONS_PER_GAME} câu hỏi, bạn trả lời đúng được cộng điểm.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={startGame}
                            className="px-8 py-3 rounded-xl text-lg font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                        >
                            🎮 Bắt Đầu Chơi
                        </motion.button>
                    </div>
                )}

                {phase === 'playing' && currentQ && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                                Câu {qIndex + 1}/{questions.length}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                🎯 {score}/{qIndex + (selected ? 1 : 0)} · 🔥 Streak: {streak}
                            </span>
                        </div>

                        <div className="mb-8">
                            <div className="rounded-2xl mb-2 p-6 text-center" style={{ background: 'var(--bg-elevated)' }}>
                                <div className="text-4xl mb-3">{currentQ.correct.icon}</div>
                                <div className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    {currentQ.correct.desc}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {currentQ.correct.clues.map((clue, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--brand-primary)' }}>
                                            💡 {clue}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <AnimatePresence>
                                {currentQ.options.map((opt) => {
                                    const isSelected = selected === opt.id;
                                    const isCorrectOpt = opt.id === currentQ.correct.id;
                                    let bg = 'var(--bg-elevated)';
                                    if (isSelected) {
                                        bg = isCorrectOpt ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
                                    } else if (selected && isCorrectOpt) {
                                        bg = 'rgba(16,185,129,0.2)';
                                    }

                                    return (
                                        <motion.button
                                            key={opt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={!selected ? { scale: 1.05 } : {}}
                                            whileTap={!selected ? { scale: 0.95 } : {}}
                                            onClick={() => handleAnswer(opt)}
                                            disabled={!!selected}
                                            className="p-4 rounded-xl text-center font-semibold transition-all"
                                            style={{
                                                background: bg,
                                                border: isSelected ? `2px solid ${isCorrectOpt ? 'var(--success)' : 'var(--error)'}` : '2px solid transparent',
                                                color: isSelected ? (isCorrectOpt ? 'var(--success)' : 'var(--error)') : 'var(--text-primary)'
                                            }}
                                        >
                                            <div className="text-2xl mb-1">{opt.icon}</div>
                                            <div className="text-sm">{opt.name}</div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {phase === 'done' && (
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">
                                {score === questions.length ? '🏆' : score >= questions.length * 0.75 ? '🌟' : score >= questions.length * 0.5 ? '👍' : '💪'}
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Kết Quả</h2>
                            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
                                {score}/{questions.length}
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Đúng {score} câu · 🔥 Streak cao nhất: {maxStreak}
                            </p>
                        </div>

                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {results.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl text-sm"
                                    style={{ background: r.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                                    <span>{r.isCorrect ? '✅' : '❌'}</span>
                                    <span style={{ color: 'var(--text-primary)' }} className="font-medium">{r.question.name}</span>
                                    {!r.isCorrect && (
                                        <span style={{ color: 'var(--text-muted)' }} className="ml-auto text-xs">
                                            Bạn chọn: {r.yourAnswer.name}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className="flex-1 py-3 rounded-xl font-bold"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                            >
                                🔄 Chơi Lại
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #00d4aa, #089e60)' }}
                            >
                                ✅ Xong
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
