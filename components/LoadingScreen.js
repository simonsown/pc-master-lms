'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [rotation, setRotation] = useState(0);

    const loadingMessages = [
        "Đang khởi động hệ thống giả lập PC Master...",
        "Đang tải cơ sở dữ liệu hơn 50+ linh kiện vật lý...",
        "Đang kết nối Trợ giảng AI Guru hỗ trợ 24/7...",
        "Hệ thống phòng thí nghiệm 3D đã sẵn sàng!"
    ];

    useEffect(() => {
        let mounted = true;
        let animFrame;

        const rotate = () => {
            if (!mounted) return;
            setRotation(prev => (prev + 0.5) % 360);
            animFrame = requestAnimationFrame(rotate);
        };
        animFrame = requestAnimationFrame(rotate);

        const runSequence = async () => {
            await new Promise(r => setTimeout(r, 600));
            if (!mounted) return;
            setStep(1);

            for (let i = 0; i <= 100; i += 4) {
                await new Promise(r => setTimeout(r, 15));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 300));
            if (!mounted) return;
            setStep(2);
            setProgress(0);

            for (let i = 0; i <= 100; i += 8) {
                await new Promise(r => setTimeout(r, 20));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 400));
            if (!mounted) return;
            setStep(3);

            await new Promise(r => setTimeout(r, 800));
            if (!mounted) return;

            setVisible(false);
            setTimeout(onComplete, 400);
        };

        runSequence();

        return () => {
            mounted = false;
            if (animFrame) cancelAnimationFrame(animFrame);
        };
    }, [onComplete]);

    if (!visible) return null;

    const ringCount = 3;
    const rings = [];
    for (let i = 0; i < ringCount; i++) {
        const baseSize = 150 + i * 35;
        const delay = i * 0.8;
        const direction = i % 2 === 0 ? 1 : -1;
        rings.push(
            <div key={i} style={{
                position: 'absolute',
                width: `${baseSize}px`,
                height: `${baseSize}px`,
                borderRadius: '50%',
                border: `1.5px solid transparent`,
                borderTopColor: i === 0 ? '#00d4aa' : i === 1 ? '#289cf9' : '#ffb900',
                borderRightColor: i === 1 ? '#289cf9' : 'transparent',
                borderLeftColor: i === 2 ? '#ffb900' : 'transparent',
                transform: `rotate(${rotation * direction + delay * 30}deg)`,
                transition: 'transform 0.05s linear',
                opacity: 0.7 - i * 0.15,
                boxShadow: i === 0 ? '0 0 15px rgba(0, 212, 170, 0.2)' : 'none'
            }} />
        );
    }

    const particles = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 360;
        const radius = 110;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        particles.push(
            <div key={`dot-${i}`} style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#00d4aa',
                transform: `translate(${x}px, ${y}px)`,
                opacity: 0.3 + Math.sin((rotation + angle * 3) * Math.PI / 180) * 0.3,
                transition: 'opacity 0.1s ease',
                boxShadow: '0 0 6px rgba(0, 212, 170, 0.5)'
            }} />
        );
    }

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
                background: 'radial-gradient(ellipse at center, #0d1117 0%, #06080c 100%)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(circle at 20% 50%, rgba(0, 212, 170, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 80% 50%, rgba(40, 156, 249, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 50% 20%, rgba(255, 185, 0, 0.02) 0%, transparent 40%)
                `,
                pointerEvents: 'none'
            }} />

            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px, 60px 60px',
                pointerEvents: 'none',
                maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 70%)'
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
                    width: '160px',
                    height: '160px',
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
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)',
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
                                filter: 'drop-shadow(0 0 25px rgba(0, 212, 170, 0.6)) brightness(1.1)',
                                animation: 'pulseLogo 2.5s infinite ease-in-out'
                            }}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        color: '#ffffff',
                        fontSize: '22px',
                        fontWeight: 900,
                        letterSpacing: '4px',
                        margin: 0,
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                    }}>
                        PC MASTER <span style={{ color: '#00d4aa', textShadow: '0 0 15px rgba(0, 212, 170, 0.4)' }}>BUILDER</span>
                    </h1>
                    <p style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginTop: '6px',
                        fontWeight: 700
                    }}>
                        Hệ Thống Đào Tạo Công Nghệ Số
                    </p>
                </div>

                <div style={{
                    marginTop: '12px',
                    padding: '12px 24px',
                    background: 'rgba(26, 28, 37, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    minWidth: '280px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{
                        color: '#00d4aa',
                        fontSize: '13px',
                        fontWeight: 600,
                        margin: 0,
                        animation: 'fadeInText 0.3s ease-out'
                    }} key={step}>
                        {loadingMessages[step]}
                    </p>
                </div>

                <div style={{
                    width: '320px',
                    height: '3px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginTop: '10px'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00d4aa, #289cf9, #ffb900)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmerBar 2s linear infinite',
                        transition: 'width 0.15s cubic-bezier(0.1, 0.8, 0.2, 1)',
                        boxShadow: '0 0 12px rgba(0, 212, 170, 0.6)'
                    }} />
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '40px',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '11px',
                letterSpacing: '1px',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
                paddingBottom: '4px',
                animation: 'pulseText 2s infinite'
            }}>
                Chạm bất kỳ đâu để bỏ qua intro
            </div>

            <style>{`
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                @keyframes pulseLogo {
                    0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 212, 170, 0.4)) brightness(1.1); }
                    50% { transform: scale(1.04); filter: drop-shadow(0 0 30px rgba(0, 212, 170, 0.7)) brightness(1.2); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 212, 170, 0.4)) brightness(1.1); }
                }
                @keyframes fadeInText {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseText {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                @keyframes shimmerBar {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
