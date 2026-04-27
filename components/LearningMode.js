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
    onHover, 
    onGameEvent, 
    onTakeQuiz, 
    trackingSensitivity, 
    onBackToMenu,
    isCameraActive,
    setIsCameraActive,
    onSetLandmarks
}) => {
    // subMode: 'select' | 'roadmap' | 'assembly' | 'free'
    const [subMode, setSubMode] = useState('select');
    // view is 'roadmap' or 'assembly' (used in roadmap/structured learning)
    const [view, setView] = useState('roadmap');
    const [currentLevelId, setCurrentLevelId] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState([1]);
    const [completedLevels, setCompletedLevels] = useState([]);

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
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '1.1rem' }}>
                    {lang === 'en' ? 'Choose how you want to practice:' : 'Chọn phương thức luyện tập:'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%' }}>
                    {/* Roadmap */}
                    <button
                        onClick={() => setSubMode('roadmap')}
                        className="glass-panel"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '1.5rem',
                            cursor: 'pointer', border: '1px solid var(--primary-neon)', background: 'rgba(10,20,40,0.4)',
                            borderRadius: '16px', transition: 'all 0.2s', color: 'white'
                        }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,255,255,0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span style={{ fontSize: '3.5rem' }}>🗺️</span>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--primary-neon)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                                {lang === 'en' ? 'Learning Roadmap' : 'Lộ Trình Học Tập'}
                            </h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                                {lang === 'en' ? 'Step-by-step guided missions with quizzes.' : 'Làm thực hành từng cấp độ và trả lời bài kiểm tra.'}
                            </p>
                        </div>
                        <div style={{ height: '4px', width: '100%', background: 'var(--primary-neon)', boxShadow: '0 0 8px var(--primary-neon)', borderRadius: '2px' }} />
                    </button>

                    {/* Free Practice */}
                    <button
                        onClick={() => setSubMode('free')}
                        className="glass-panel"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '1.5rem',
                            cursor: 'pointer', border: '1px solid var(--accent-green)', background: 'rgba(10,20,40,0.4)',
                            borderRadius: '16px', transition: 'all 0.2s', color: 'white'
                        }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 15px 40px rgba(52,211,153,0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span style={{ fontSize: '3.5rem' }}>🛠️</span>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                                {lang === 'en' ? 'Free Practice' : 'Luyện Tập Tự Do'}
                            </h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                                {lang === 'en' ? 'Freely assemble components with no restrictions.' : 'Lắp ráp linh kiện thoải mái, không giới hạn.'}
                            </p>
                        </div>
                        <div style={{ height: '4px', width: '100%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)', borderRadius: '2px' }} />
                    </button>
                </div>
            </div>
        );
    }

    // --- Free Practice sub-mode ---
    if (subMode === 'free') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="neon-text-green" style={{ margin: 0 }}>
                        {lang === 'en' ? '🛠️ Free Practice' : '🛠️ Luyện Tập Tự Do'}
                    </h2>
                    <button onClick={() => setSubMode('select')} style={{
                        padding: '8px 18px', background: 'transparent', color: 'white',
                        border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        {lang === 'en' ? '← Back' : '← Quay lại'}
                    </button>
                </div>
                <GameEngine
                    landmarks={landmarks}
                    onHover={onHover}
                    onGameEvent={onGameEvent}
                    trackingSensitivity={trackingSensitivity}
                />
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
                    <button onClick={() => setSubMode('select')} style={{
                        padding: '8px 18px', background: 'transparent', color: 'white',
                        border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        {lang === 'en' ? '← Back' : '← Quay lại'}
                    </button>
                </div>
                <LearningRoadmap
                    lang={lang}
                    unlockedLevels={unlockedLevels}
                    completedLevels={completedLevels}
                    onNodeClick={handleNodeClick}
                    landmarks={landmarks}
                    trackingSensitivity={trackingSensitivity}
                />
            </div>
        );
    }

    // Assembly View
    const targetHardware = getTargetForLevel(currentLevelId);

    return (
        <div className="practice-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="neon-text-green" style={{ margin: 0 }}>
                        {lang === 'en' ? `Level ${currentLevelId}: Action` : `Level ${currentLevelId}: Thực hành`}
                    </h2>
                    <button onClick={() => setView('roadmap')} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid var(--accent-purple)', borderRadius: '8px', cursor: 'pointer' }}>
                        {lang === 'en' ? '⬅ Back to Roadmap' : '⬅ Về Lộ Trình'}
                    </button>
                </div>

                <div style={{ width: '100%', position: 'relative' }}>
                    <GameEngine
                        landmarks={landmarks}
                        onHover={onHover}
                        onGameEvent={onGameEvent}
                        trackingSensitivity={trackingSensitivity}
                    />
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10, 20, 40, 0.6)' }}>
                    <h3 className="neon-text-blue">{targetHardware}</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem' }}>
                        {HARDWARE_DATA[targetHardware === 'Screws' ? 'Screws' : targetHardware]?.[lang]}
                    </p>

                    <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>
                        {lang === 'en'
                            ? (targetHardware === 'Screws' ? "Click below or assemble components to trigger the quiz!" : `Please assemble the ${targetHardware} to the proper location.`)
                            : (targetHardware === 'Screws' ? "Click nút dưới hoặc lắp đúng linh kiện để mở bài kiểm tra!" : `Vui lòng lắp đặt ${targetHardware} vào vị trí chính xác.`)}
                    </p>

                    <button
                        onClick={() => triggerQuizForLevel(currentLevelId, targetHardware)}
                        style={{
                            padding: '1rem', background: 'var(--primary-neon)', color: 'black',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 0 15px var(--primary-neon)'
                        }}
                    >
                        {lang === 'en' ? 'Manually Trigger Quiz ➜' : 'Chạy Bài Kiểm Tra ➜'}
                    </button>
                </div>
            </div>

            {/* Sidebar Camera Panel */}
            <div className="camera-panel">
                <div className="camera-panel-header">
                    <span>{lang === 'en' ? 'Camera Tracking' : 'Nhận diện tay'}</span>
                    <button
                        className="camera-toggle-btn"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                    >
                        {isCameraActive ? (lang === 'en' ? 'OFF' : 'TẮT') : (lang === 'en' ? 'ON' : 'BẬT')}
                    </button>
                </div>
                <div className="camera-feed">
                    {isCameraActive ? (
                        <HandTracker onLandmarks={onSetLandmarks} />
                    ) : (
                        <span>{lang === 'en' ? 'Camera is OFF' : 'Camera đang tắt'}</span>
                    )}
                </div>
                <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {lang === 'en' 
                        ? 'Tip: Raise your hand to move the cursor. Pinch thumb and index to click.'
                        : 'Mẹo: Giơ tay để di chuyển. Chạm ngón trỏ và cái để bấm.'}
                </div>
            </div>
        </div>
    );
};

export default LearningMode;
