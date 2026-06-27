'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import GameEngine from './GameEngine';
import LearningRoadmap from './LearningRoadmap';
import HandTracker from './HandTracker';


const HARDWARE_DATA = {
// ... existing data ...
    'CPU': {
        en: "The Central Processing Unit (CPU) is the brain of the computer. It performs basic arithmetic, logic, controlling, and input/output operations specified by instructions in the program.",
        vn: "Central Processing Unit (CPU) là bộ não của máy tính. Nó thực hiện các phép toán cơ bản, logic, điều khiển, và các hoạt động đầu vào/đầu ra được chỉ định bởi các tập lệnh trong chương trình."
    },
    'RAM': {
        en: "Random Access Memory (RAM) is a form of computer memory that can be read and changed in any order, typically used to store working data and machine code.",
        vn: "Random Access Memory (RAM) là một dạng bộ nhớ máy tính có thể đọc và ghi ngẫu nhiên, thường được sử dụng để lưu trữ dữ liệu làm việc và mã máy."
    },
    'GPU': {
        en: "A Graphics Processing Unit (GPU) is a specialized electronic circuit designed to rapidly manipulate and alter memory to accelerate the creation of images in a frame buffer intended for output to a display device.",
        vn: "Graphics Processing Unit (GPU) là một mạch điện tử chuyên dụng được thiết kế để xử lý hình ảnh nhanh chóng, xuất ra màn hình."
    },
    'Mainboard': {
        en: "The Motherboard (Mainboard) is the main printed circuit board (PCB) in general-purpose computers and other expandable systems. It holds and allows communication between many of the crucial electronic components of a system.",
        vn: "Bo mạch chủ (Mainboard) là bảng mạch in chính trong máy tính, cho phép các linh kiện điện tử giao tiếp với nhau."
    },
    'Screws': {
        en: "Screws secure the components inside the case.",
        vn: "Ốc vít giúp cố định các linh kiện bên trong vỏ case."
    },
    'PSU': {
        en: "A Power Supply Unit (PSU) converts mains AC to low-voltage regulated DC power for the internal components of a computer.",
        vn: "Nguồn máy tính (PSU) chuyển đổi điện xoay chiều AC thành điện một chiều DC điện áp thấp cho các linh kiện bên trong máy tính."
    }
};

const getTargetForLevel = (levelId) => {
    switch (levelId) {
        case 1: return 'CPU';
        case 2: return 'RAM';
        case 3: return 'GPU';
        case 4: return 'PSU';
        case 5: return 'Screws'; // Final check
        default: return 'CPU';
    }
};

const getQuizTopicForLevel = (levelId) => {
    switch (levelId) {
        case 1: return 'CPU';
        case 2: return 'RAM';
        case 3: return 'GPU';
        case 4: return 'PSU';
        case 5: return 'Computer Case';
        default: return 'CPU';
    }
};

const LearningMode = ({ 
    lang, 
    externalSelection, 
    appMode, 
    landmarks, 
    cameraEnabled, 
    onLandmarks,
    onHover, 
    onGameEvent, 
    onTakeQuiz, 
    onBackToMenu,
}) => {
    // subMode: 'select' | 'roadmap' | 'assembly' | 'free'
    const [subMode, setSubMode] = useState('select');
    // view is 'roadmap' or 'assembly' (used in roadmap/structured learning)
    const [view, setView] = useState('roadmap');
    const [currentLevelId, setCurrentLevelId] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState([1]);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [viewFull, setViewFull] = useState(false);

    const processedPlacementRef = useRef(null);

    // local block tracking
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        try {
            const savedUnlocked = localStorage.getItem('unlockedLevels');
            const savedCompleted = localStorage.getItem('completedLevels');
            if (savedUnlocked) setUnlockedLevels(JSON.parse(savedUnlocked));
            if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted));
        } catch (e) {
            console.error("Error loading progress from localStorage", e);
            // Default values already set in useState
        }
    }, []);

    const saveProgress = (newUnlocked, newCompleted) => {
        setUnlockedLevels(newUnlocked);
        setCompletedLevels(newCompleted);
        localStorage.setItem('unlockedLevels', JSON.stringify(newUnlocked));
        localStorage.setItem('completedLevels', JSON.stringify(newCompleted));
    };

    const handleNodeClick = (levelId) => {
        setCurrentLevelId(levelId);
        setView('assembly');
        setProgress([]);
    };

    function handleQuizSuccess(levelId) {
        const newCompleted = [...new Set([...completedLevels, levelId])];
        if (levelId < 5) {
            const nextLevel = levelId + 1;
            const newUnlocked = [...new Set([...unlockedLevels, levelId, nextLevel])];
            saveProgress(newUnlocked, newCompleted);
        } else {
            saveProgress(unlockedLevels, newCompleted); // level 5 complete
        }

        setView('roadmap');

        // Firework effect
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
    }

    function triggerQuizForLevel(levelId, hardwareTarget) {
        // We prompt the user with the quiz modal.
        // If they succeed (score >= 8), handleQuizSuccess runs.
        const quizTopic = getQuizTopicForLevel(levelId);
        onTakeQuiz(quizTopic, levelId, (score) => {
            if (score >= 8) {
                handleQuizSuccess(levelId);
            }
        });
    }

    useEffect(() => {
        if (!externalSelection || !externalSelection.type || view !== 'assembly' || !currentLevelId) return;

        // Prevent infinite loop by checking if we already processed this exact placement event via its ID
        if (processedPlacementRef.current === externalSelection.id) return;
        processedPlacementRef.current = externalSelection.id;

        const target = getTargetForLevel(currentLevelId);
        const type = externalSelection.type;

        if (type === target || (target === 'Screws' && type === 'Mainboard')) {
            if (target === 'RAM') {
                setProgress(prev => {
                    const newProgress = [...prev, type];
                    const ramPlaced = newProgress.filter(t => t === 'RAM').length;
                    if (ramPlaced >= 2) {
                        // Use timeout to let state settle before opening quiz modal
                        setTimeout(() => triggerQuizForLevel(currentLevelId, target), 50);
                    }
                    return newProgress;
                });
            } else {
                triggerQuizForLevel(currentLevelId, target);
            }
        }
    }, [externalSelection, view, currentLevelId]);

    // --- Sub-mode selector screen ---
    if (subMode === 'select') {
        return (
            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', paddingTop: '2rem' }}>
                <h2 className="neon-text-blue" style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Practice Mode' : 'Chế độ Luyện Tập'}
                </h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '1.1rem' }}>
                    {lang === 'en' ? 'Choose how you want to practice:' : 'Chọn phương thức luyện tập:'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%' }}>
                    {/* Roadmap */}
                    <button
                        onClick={() => setSubMode('roadmap')}
                        className="glass-panel"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '1.5rem',
                            cursor: 'pointer', border: '1px solid var(--accent-blue)', background: 'var(--bg-surface)',
                            borderRadius: '16px', transition: 'all 0.2s', color: 'var(--text-primary)'
                        }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,255,255,0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span style={{ fontSize: '3.5rem' }}>🗺️</span>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                                {lang === 'en' ? 'Learning Roadmap' : 'Lộ Trình Học Tập'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {lang === 'en' ? 'Step-by-step guided missions with quizzes.' : 'Làm thực hành từng cấp độ và trả lời bài kiểm tra.'}
                            </p>
                        </div>
                        <div style={{ height: '4px', width: '100%', background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)', borderRadius: '2px' }} />
                    </button>

                    {/* Free Practice */}
                    <button
                        onClick={() => setSubMode('free')}
                        className="glass-panel"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '1.5rem',
                            cursor: 'pointer', border: '1px solid var(--brand-primary)', background: 'var(--bg-surface)',
                            borderRadius: '16px', transition: 'all 0.2s', color: 'var(--text-primary)'
                        }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 15px 40px rgba(52,211,153,0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span style={{ fontSize: '3.5rem' }}>🛠️</span>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                                {lang === 'en' ? 'Free Practice' : 'Luyện Tập Tự Do'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {lang === 'en' ? 'Freely assemble components with no restrictions.' : 'Lắp ráp linh kiện thoải mái, không giới hạn.'}
                            </p>
                        </div>
                        <div style={{ height: '4px', width: '100%', background: 'var(--brand-primary)', boxShadow: '0 0 8px var(--brand-primary)', borderRadius: '2px' }} />
                    </button>
                </div>
            </div>
        );
    }

    // --- Free Practice sub-mode ---
    if (subMode === 'free') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="neon-text-green" style={{ margin: 0, fontSize: '18px' }}>
                        {lang === 'en' ? '🛠️ Free Practice' : '🛠️ Luyện Tập Tự Do'}
                    </h2>
                    <button onClick={() => setSubMode('select')} style={{
                        padding: '6px 14px', background: 'transparent', color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                    }}>
                        {lang === 'en' ? '← Back' : '← Quay lại'}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, maxWidth: '800px' }}>
                        <GameEngine
                            onHover={onHover}
                            onGameEvent={onGameEvent}
                            landmarks={landmarks}
                        />
                    </div>
                    <div style={{ width: '220px', flexShrink: 0 }}>
                        <div style={{
                            borderRadius: '12px', overflow: 'hidden',
                            border: '1px solid rgba(0,212,170,0.25)',
                            boxShadow: '0 0 16px rgba(0,212,170,0.15)',
                            background: '#0f172a',
                        }}>
                            <div style={{ padding: '6px 10px', background: 'rgba(0,212,170,0.08)', borderBottom: '1px solid rgba(0,212,170,0.15)', fontSize: '11px', fontWeight: 700, color: '#00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>📷 Camera</span>
                                <span style={{ fontSize: '10px', color: cameraEnabled ? '#10b981' : '#ef4444' }}>
                                    {cameraEnabled ? 'Bật' : 'Tắt'}
                                </span>
                            </div>
                            <div style={{ width: '100%', aspectRatio: '4/3', minHeight: '140px', position: 'relative' }}>
                                {cameraEnabled && <HandTracker onLandmarks={onLandmarks} numHands={1} />}
                                {!cameraEnabled && (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ef4444', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                                        Camera TẮT
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Full PC View (pre-assembled, full screen) ---
    if (viewFull) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#030712' }}>
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8 }}>
                    <button onClick={() => setViewFull(false)} style={{
                        padding: '6px 14px', background: 'rgba(255,255,255,0.08)', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, fontFamily: 'inherit', backdropFilter: 'blur(8px)',
                    }}>
                        ← {lang === 'en' ? 'Back' : 'Quay lại'}
                    </button>
                    <div style={{
                        padding: '6px 14px', background: 'rgba(0,212,170,0.1)',
                        border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8,
                        color: '#00d4aa', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                        backdropFilter: 'blur(8px)',
                    }}>
                        🖥️ {lang === 'en' ? 'Full PC View' : 'Xem Full PC'}
                    </div>
                </div>
                <div style={{ width: '100vw', height: '100vh' }}>
                    <GameEngine defaultPlaced={true} landmarks={landmarks} />
                </div>
            </div>
        );
    }

    // --- Roadmap sub-mode: show roadmap or level assembly ---
    if (subMode === 'roadmap' && view === 'roadmap') {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="neon-text-green" style={{ margin: 0 }}>
                        {lang === 'en' ? 'Interactive Learning Roadmap' : 'Lộ Trình Học Tập Tương Tác'}
                    </h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setViewFull(true)} style={{
                            padding: '8px 18px', background: 'rgba(0,212,170,0.1)', color: '#00d4aa',
                            border: '1px solid rgba(0,212,170,0.3)', borderRadius: 8, cursor: 'pointer',
                            fontWeight: 600, fontSize: 12, fontFamily: 'inherit',
                        }}>
                            🖥️ {lang === 'en' ? 'Full PC' : 'Xem Full PC'}
                        </button>
                        <button onClick={() => setSubMode('select')} style={{
                            padding: '8px 18px', background: 'transparent', color: 'var(--text-primary)',
                            border: '1px solid var(--border-default)', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            {lang === 'en' ? '← Back' : '← Quay lại'}
                        </button>
                    </div>
                </div>
                <LearningRoadmap
                    lang={lang}
                    unlockedLevels={unlockedLevels}
                    completedLevels={completedLevels}
                    onNodeClick={handleNodeClick}
                    landmarks={landmarks}
                />
            </div>
        );
    }

    // Assembly View
    const targetHardware = getTargetForLevel(currentLevelId);

    return (
        <div className="practice-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="neon-text-green" style={{ margin: 0, fontSize: '18px' }}>
                    {lang === 'en' ? `Level ${currentLevelId}: Action` : `Level ${currentLevelId}: Thực hành`}
                </h2>
                <button onClick={() => setView('roadmap')} style={{ padding: '6px 14px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--accent-blue)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    {lang === 'en' ? '⬅ Back' : '⬅ Về'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Left: Mainboard game area - compact */}
                <div style={{ flex: 1, maxWidth: '800px', position: 'relative' }}>
                    <GameEngine
                        onHover={onHover}
                        onGameEvent={onGameEvent}
                        landmarks={landmarks}
                    />
                </div>

                {/* Right: Camera on top + Info below */}
                <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Camera */}
                    <div style={{
                        borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid rgba(0,212,170,0.25)',
                        boxShadow: '0 0 16px rgba(0,212,170,0.15)',
                        background: '#0f172a',
                    }}>
                        <div style={{ padding: '6px 10px', background: 'rgba(0,212,170,0.08)', borderBottom: '1px solid rgba(0,212,170,0.15)', fontSize: '11px', fontWeight: 700, color: '#00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>📷 Camera</span>
                            <span style={{ fontSize: '10px', color: cameraEnabled ? '#10b981' : '#ef4444' }}>
                                {cameraEnabled ? 'Bật' : 'Tắt'}
                            </span>
                        </div>
                        <div style={{ width: '100%', aspectRatio: '4/3', minHeight: '140px', position: 'relative' }}>
                            {cameraEnabled && (
                                <HandTracker onLandmarks={onLandmarks} numHands={1} />
                            )}
                            {!cameraEnabled && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ef4444', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                                    Camera TẮT
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hardware Info Panel */}
                    <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={{ color: '#60a5fa', margin: 0, fontSize: '14px', fontWeight: 800 }}>{targetHardware}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '13px', margin: 0 }}>
                            {HARDWARE_DATA[targetHardware === 'Screws' ? 'Screws' : targetHardware]?.[lang]}
                        </p>
                        <p style={{ color: '#00d4aa', fontWeight: 700, fontSize: '12px', margin: 0 }}>
                            {lang === 'en'
                                ? (targetHardware === 'Screws' ? "Assemble to trigger the quiz!" : `Place the ${targetHardware}.`)
                                : (targetHardware === 'Screws' ? "Lắp đúng linh kiện để mở bài kiểm tra!" : `Lắp ${targetHardware} vào vị trí.`)}
                        </p>
                        <button onClick={() => triggerQuizForLevel(currentLevelId, targetHardware)}
                            style={{ padding: '10px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                            {lang === 'en' ? 'Start Quiz ➜' : 'Làm Bài Kiểm Tra ➜'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningMode;
