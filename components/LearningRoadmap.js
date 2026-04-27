import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LEVELS = [
    { id: 1, titleEn: 'Level 1: The Heart', titleVn: 'Level 1: Trái tim', target: 'CPU', descEn: 'Install the CPU (Socket & Thermal Paste)', descVn: 'Lắp đặt CPU (Socket & Keo tản nhiệt)' },
    { id: 2, titleEn: 'Level 2: The Memory', titleVn: 'Level 2: Bộ nhớ', target: 'RAM', descEn: 'Install RAM (Dual Channel - Slots 2 & 4)', descVn: 'Lắp đặt RAM (Kênh đôi - Khe 2 & 4)' },
    { id: 3, titleEn: 'Level 3: The Graphics', titleVn: 'Level 3: Đồ họa', target: 'GPU', descEn: 'Install GPU (PCIe Slot)', descVn: 'Lắp đặt GPU (Khe PCIe)' },
    { id: 4, titleEn: 'Level 4: The Power', titleVn: 'Level 4: Nguồn', target: 'PSU', descEn: 'Install PSU and basic wiring', descVn: 'Lắp đặt Nguồn và đi dây cơ bản' },
    { id: 5, titleEn: 'Level 5: Final Check', titleVn: 'Level 5: Hoàn thiện', target: 'Screws', descEn: 'Check screws and finish case', descVn: 'Kiểm tra ốc vít và hoàn thiện vỏ case' },
];

// Simple 1D exponential moving average as a basic low-pass filter (simplified One Euro)
class LowPassFilter {
    constructor(alpha = 0.5) {
        this.alpha = alpha;
        this.lastVal = null;
    }
    filter(val) {
        if (this.lastVal === null) {
            this.lastVal = val;
            return val;
        }
        this.lastVal = this.alpha * val + (1 - this.alpha) * this.lastVal;
        return this.lastVal;
    }
}

const LearningRoadmap = ({ lang, unlockedLevels = [1], completedLevels = [], onNodeClick, landmarks, trackingSensitivity = 1.0 }) => {
    const containerRef = useRef(null);
    const filterX = useRef(new LowPassFilter(0.15));
    const filterY = useRef(new LowPassFilter(0.15));

    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, isPinching: false });
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        if (!containerRef.current || !landmarks || landmarks.length === 0) return;

        const hand = landmarks[0];
        const indexTip = hand[8];
        const thumbTip = hand[4];

        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = (indexTip.x - 0.5) * trackingSensitivity + 0.5;
        const scaleY = (indexTip.y - 0.5) * trackingSensitivity + 0.5;
        const rawX = scaleX * rect.width;
        const rawY = scaleY * rect.height;

        const smoothX = filterX.current.filter(rawX);
        const smoothY = filterY.current.filter(rawY);

        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const isPinching = distance < 0.05;

        setCursorPos({ x: smoothX, y: smoothY, isPinching });

        // Node hit detection with padding
        const PADDING = 30; // Vùng đệm cho phép chọn dễ hơn
        let found = null;

        // Nodes positions map based on index for simplicity structure below
        const nodeCoords = [
            { id: 1, x: 100, y: 100 },
            { id: 2, x: 300, y: 100 },
            { id: 3, x: 300, y: 350 },
            { id: 4, x: 500, y: 350 },
            { id: 5, x: 500, y: 600 },
        ];

        for (let node of nodeCoords) {
            // approximate bounding box based on UI layout
            const dx = Math.abs(smoothX - node.x - 50); // node center X offset
            const dy = Math.abs(smoothY - node.y - 50); // node center Y offset
            if (dx < 50 + PADDING && dy < 50 + PADDING) {
                found = node.id;
                break;
            }
        }

        setHoveredNode(found);

        if (isPinching && found && unlockedLevels.includes(found)) {
            onNodeClick(found);
        }
    }, [landmarks, unlockedLevels, onNodeClick, trackingSensitivity]);

    const getNodeState = (levelId) => {
        if (completedLevels.includes(levelId)) return 'completed';
        if (unlockedLevels.includes(levelId)) return 'active';
        return 'locked';
    };

    const getNodeStyle = (state) => {
        if (state === 'locked') return { bg: '#444', border: '#666', icon: '🔒', glow: 'none' };
        if (state === 'active') return { bg: 'rgba(0, 123, 255, 0.2)', border: '#00ccff', icon: '🔥', glow: '0 0 20px #00ccff' };
        if (state === 'completed') return { bg: 'rgba(0, 255, 100, 0.2)', border: '#00ff66', icon: '✅', glow: '0 0 10px #00ff66' };
    };

    const [layoutScale, setLayoutScale] = useState(1);
    useEffect(() => {
        const updateScale = () => {
            const hScale = window.innerWidth < 800 ? Math.min(1, window.innerWidth / 800) : 1;
            setLayoutScale(hScale);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
        <div ref={containerRef} style={{
            width: '100%',
            height: '100%', // Take full height available
            maxHeight: '80vh', // Prevent overpowering the screen
            background: '#0f172a',
            backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            position: 'relative',
            borderRadius: '16px',
            border: '2px solid #334155',
            overflowY: 'auto', // Allow scrolling down the roadmap
            overflowX: 'hidden',
            display: 'block', // Changed from flex strictly centering
            paddingTop: '20px'
        }}>
            {/* Extended height map */}
            <div style={{ width: '800px', height: '800px', position: 'relative', transform: `scale(${layoutScale})`, transformOrigin: 'top center', margin: '0 auto' }}>
                {/* SVGs for Circuit Lines (Elongated for scroll) */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <path d="M 150 150 L 350 150" stroke={unlockedLevels.includes(2) ? '#00ccff' : '#444'} strokeWidth="4" fill="none"
                        style={{ filter: unlockedLevels.includes(2) ? 'drop-shadow(0 0 5px #00ccff)' : 'none', transition: 'stroke 0.5s' }} />
                    <path d="M 350 150 L 350 400" stroke={unlockedLevels.includes(3) ? '#00ccff' : '#444'} strokeWidth="4" fill="none"
                        style={{ filter: unlockedLevels.includes(3) ? 'drop-shadow(0 0 5px #00ccff)' : 'none', transition: 'stroke 0.5s' }} />
                    <path d="M 350 400 L 550 400" stroke={unlockedLevels.includes(4) ? '#00ccff' : '#444'} strokeWidth="4" fill="none"
                        style={{ filter: unlockedLevels.includes(4) ? 'drop-shadow(0 0 5px #00ccff)' : 'none', transition: 'stroke 0.5s' }} />
                    <path d="M 550 400 L 550 650" stroke={unlockedLevels.includes(5) ? '#00ccff' : '#444'} strokeWidth="4" fill="none"
                        style={{ filter: unlockedLevels.includes(5) ? 'drop-shadow(0 0 5px #00ccff)' : 'none', transition: 'stroke 0.5s' }} />
                </svg>

                {/* Nodes */}
                {LEVELS.map((lvl, index) => {
                    const state = getNodeState(lvl.id);
                    const style = getNodeStyle(state);
                    const coords = [
                        { top: '100px', left: '100px' },
                        { top: '100px', left: '300px' },
                        { top: '350px', left: '300px' }, // Down
                        { top: '350px', left: '500px' },
                        { top: '600px', left: '500px' }, // Down further
                    ][index];

                    const isHovered = hoveredNode === lvl.id;

                    return (
                        <div key={lvl.id} style={{ position: 'absolute', ...coords }}>
                            <motion.div
                                onClick={() => { if (state !== 'locked') onNodeClick(lvl.id); }}
                                animate={state === 'active' ? { scale: [1, 1.1, 1], boxShadow: [style.glow, '0 0 30px #00ccff', style.glow] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    width: '100px', height: '100px',
                                    borderRadius: '50%',
                                    background: style.bg,
                                    border: `4px solid ${style.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column',
                                    cursor: state === 'locked' ? 'not-allowed' : 'pointer',
                                    boxShadow: style.glow,
                                    position: 'relative',
                                    zIndex: 10
                                }}
                                whileHover={{ scale: state !== 'locked' ? 1.1 : 1 }}
                            >
                                <span style={{ fontSize: '2rem' }}>{style.icon}</span>
                                {state === 'completed' && (
                                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.8rem' }}>⭐</span>
                                        <span style={{ fontSize: '0.8rem' }}>⭐</span>
                                        <span style={{ fontSize: '0.8rem' }}>⭐</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Title Under Node */}
                            <div style={{
                                position: 'absolute', top: '105px', left: '50%', transform: 'translateX(-50%)',
                                whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold',
                                color: state === 'locked' ? '#64748b' : '#38bdf8',
                                textShadow: state === 'locked' ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
                                pointerEvents: 'none'
                            }}>
                                {lang === 'en' ? lvl.titleEn : lvl.titleVn}
                            </div>

                            {/* Tooltip on hover */}
                            {(isHovered || true) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-90px', left: '50%', transform: 'translateX(-50%)',
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid #334155',
                                        padding: '10px', borderRadius: '8px',
                                        width: '200px', pointerEvents: 'none',
                                        color: 'white', zIndex: 20,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', color: '#00ccff', marginBottom: '4px' }}>
                                        {lang === 'en' ? lvl.titleEn : lvl.titleVn}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                        {lang === 'en' ? lvl.descEn : lvl.descVn}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}

                {/* Webcam Cursor overlay */}
                {landmarks && landmarks.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        left: cursorPos.x - 10,
                        top: cursorPos.y - 10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: cursorPos.isPinching ? 'yellow' : 'cyan',
                        border: '2px solid black',
                        pointerEvents: 'none',
                        zIndex: 200,
                        boxShadow: cursorPos.isPinching ? '0 0 15px yellow' : '0 0 10px cyan',
                        transition: 'background 0.2s'
                    }} />
                )}
            </div>
        </div>
    );
};

export default LearningRoadmap;
