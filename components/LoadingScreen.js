'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [glowPulse, setGlowPulse] = useState(0);

    const loadingMessages = [
        "Đang khởi động hệ thống giả lập PC Master...",
        "Đang tải cơ sở dữ liệu hơn 50+ linh kiện vật lý...",
        "Đang kết nối Trợ giảng AI Guru hỗ trợ 24/7...",
        "Hệ thống phòng thí nghiệm 3D đã sẵn sàng!"
    ];

    useEffect(() => {
        let mounted = true;
        let animFrame;
        let glowFrame;

        const rotate = () => {
            if (!mounted) return;
            setRotation(prev => (prev + 2) % 360);
            animFrame = requestAnimationFrame(rotate);
        };
        animFrame = requestAnimationFrame(rotate);

        const pulseGlow = () => {
            if (!mounted) return;
            setGlowPulse(prev => (prev + 0.02) % 1);
            glowFrame = requestAnimationFrame(pulseGlow);
        };
        glowFrame = requestAnimationFrame(pulseGlow);

        const runSequence = async () => {
            await new Promise(r => setTimeout(r, 400));
            if (!mounted) return;
            setStep(1);

            for (let i = 0; i <= 100; i += 5) {
                await new Promise(r => setTimeout(r, 12));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 200));
            if (!mounted) return;
            setStep(2);
            setProgress(0);

            for (let i = 0; i <= 100; i += 10) {
                await new Promise(r => setTimeout(r, 15));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 300));
            if (!mounted) return;
            setStep(3);

            await new Promise(r => setTimeout(r, 600));
            if (!mounted) return;

            setVisible(false);
            setTimeout(onComplete, 300);
        };

        runSequence();

        return () => {
            mounted = false;
            if (animFrame) cancelAnimationFrame(animFrame);
            if (glowFrame) cancelAnimationFrame(glowFrame);
        };
    }, [onComplete]);

    if (!visible) return null;

    const ringCount = 4;
    const rings = [];
    const ringColors = ['#00d4aa', '#6366f1', '#a855f7', '#ffb900'];
    for (let i = 0; i < ringCount; i++) {
        const baseSize = 110 + i * 40;
        const delay = i * 0.6;
        const direction = i % 2 === 0 ? 1 : -1;
        const opacity = 0.6 - i * 0.1;
        rings.push(
            <div key={i} style={{
                position: 'absolute',
                width: `${baseSize}px`,
                height: `${baseSize}px`,
                borderRadius: '50%',
                border: `2px solid transparent`,
                borderTopColor: ringColors[i],
                borderRightColor: i % 2 === 1 ? ringColors[i] : 'transparent',
                borderBottomColor: i % 3 === 0 ? ringColors[i] : 'transparent',
                transform: `rotate(${rotation * direction + delay * 30}deg)`,
                transition: 'transform 0.05s linear',
                opacity: opacity,
                boxShadow: `0 0 ${15 + glowPulse * 20}px ${ringColors[i]}40, inset 0 0 ${10 + glowPulse * 15}px ${ringColors[i]}20`,
                filter: `brightness(${1 + glowPulse * 0.3})`,
            }} />
        );
    }

    const particles = [];
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 360;
        const radius = 100 + glowPulse * 20;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const colors = ['#00d4aa', '#6366f1', '#a855f7', '#ffb900'];
        particles.push(
            <div key={`dot-${i}`} style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: colors[i % 4],
                transform: `translate(${x}px, ${y}px)`,
                opacity: 0.2 + Math.sin((rotation * 2 + angle * 3) * Math.PI / 180) * 0.4,
                boxShadow: `0 0 8px ${colors[i % 4]}`,
                transition: 'opacity 0.1s ease',
            }} />
        );
    }

    const glowIntensity = 0.5 + glowPulse * 0.5;

    return (
        <div
            onClick={() => {
                setVisible(false);
                onComplete();
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'var(--bg-base)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(circle at 30% 40%, rgba(0,212,170,${0.03 * glowIntensity}) 0%, transparent 60%),
                    radial-gradient(circle at 70% 60%, rgba(99,102,241,${0.03 * glowIntensity}) 0%, transparent 60%),
                    radial-gradient(circle at 50% 80%, rgba(168,85,247,${0.03 * glowIntensity}) 0%, transparent 50%),
                    radial-gradient(circle at 20% 70%, rgba(255,185,0,${0.02 * glowIntensity}) 0%, transparent 50%)
                `,
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '28px',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    position: 'relative',
                    width: '180px',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {rings}
                    <div style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {particles}
                    </div>
                    <div style={{
                        position: 'absolute',
                        width: '130px',
                        height: '130px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(0,212,170,${0.12 + glowPulse * 0.08}) 0%, transparent 70%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                width: '72px',
                                height: '72px',
                                objectFit: 'contain',
                                filter: `drop-shadow(0 0 ${20 + glowPulse * 30}px rgba(0, 212, 170, ${0.4 + glowPulse * 0.4})) brightness(${1.05 + glowPulse * 0.15})`,
                                transform: `scale(${1 + glowPulse * 0.03})`,
                                transition: 'all 0.1s ease',
                            }}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 900,
                        letterSpacing: '3px',
                        margin: 0,
                        textShadow: `0 0 ${10 + glowPulse * 20}px rgba(0, 212, 170, ${0.2 + glowPulse * 0.3})`,
                    }}>
                        PC MASTER{' '}
                        <span style={{
                            background: 'linear-gradient(90deg, #00d4aa, #6366f1, #a855f7, #ffb900, #00d4aa)',
                            backgroundSize: '300% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'loadingGradient 2s linear infinite',
                        }}>
                            BUILDER
                        </span>
                    </h1>
                    <p style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        marginTop: '8px',
                        fontWeight: 700,
                        textShadow: `0 0 10px rgba(0,212,170,0.2)`,
                    }}>
                        Hệ Thống Đào Tạo Công Nghệ Số
                    </p>
                </div>

                <div style={{
                    padding: '10px 24px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    minWidth: '280px',
                    textAlign: 'center',
                    backdropFilter: 'blur(4px)',
                }}>
                    <p style={{
                        background: 'linear-gradient(90deg, #00d4aa, #6366f1, #a855f7)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'loadingGradient 2s linear infinite',
                        fontSize: '13px',
                        fontWeight: 700,
                        margin: 0,
                    }} key={step}>
                        {loadingMessages[step]}
                    </p>
                </div>

                <div style={{
                    width: '300px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.3)',
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00d4aa, #6366f1, #a855f7, #ffb900)',
                        backgroundSize: '300% auto',
                        animation: 'loadingGradient 1.5s linear infinite',
                        transition: 'width 0.15s ease',
                        boxShadow: '0 0 16px rgba(0, 212, 170, 0.6), 0 0 30px rgba(99, 102, 241, 0.3)',
                    }} />
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '40px',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '11px',
                letterSpacing: '2px',
                fontWeight: 600,
                textTransform: 'uppercase',
                animation: 'loadingPulse 2s ease-in-out infinite',
            }}>
                Chạm để bỏ qua
            </div>

            <style>{`
                @keyframes loadingGradient {
                    0% { background-position: 0% center; }
                    100% { background-position: 300% center; }
                }
                @keyframes loadingPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
