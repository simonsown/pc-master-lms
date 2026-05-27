'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    const loadingMessages = [
        "Đang khởi động hệ thống giả lập PC Master...",
        "Đang tải cơ sở dữ liệu hơn 50+ linh kiện vật lý...",
        "Đang kết nối Trợ giảng AI Guru hỗ trợ 24/7...",
        "Hệ thống phòng thí nghiệm 3D đã sẵn sàng!"
    ];

    useEffect(() => {
        let mounted = true;

        const runSequence = async () => {
            // Step 0: Initializing
            await new Promise(r => setTimeout(r, 600));
            if (!mounted) return;
            setStep(1);

            // Step 1: Loading hardware database (animate progress)
            for (let i = 0; i <= 100; i += 4) {
                await new Promise(r => setTimeout(r, 15));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 300));
            if (!mounted) return;
            setStep(2);
            setProgress(0);

            // Step 2: Connecting AI engine
            for (let i = 0; i <= 100; i += 8) {
                await new Promise(r => setTimeout(r, 20));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 400));
            if (!mounted) return;
            setStep(3);

            // Step 3: Ready
            await new Promise(r => setTimeout(r, 800));
            if (!mounted) return;

            setVisible(false);
            setTimeout(onComplete, 400); // Wait for fade out
        };

        runSequence();

        return () => { mounted = false; };
    }, [onComplete]);

    if (!visible) return null;

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
                backgroundColor: '#0a0a14',
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
            {/* Elegant Tech Grid Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 170, 0.05) 0%, transparent 80%), linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 20px 20px, 20px 20px',
                pointerEvents: 'none'
            }} />

            {/* Glowing tech circles */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(0, 212, 170, 0.03) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Glowing Logo Container */}
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 60%)',
                    borderRadius: '50%'
                }}>
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        style={{ 
                            width: '80px', 
                            filter: 'drop-shadow(0 0 20px rgba(0, 212, 170, 0.5))',
                            animation: 'pulseLogo 2.5s infinite ease-in-out'
                        }} 
                    />
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

                {/* Educational Loading Message Card */}
                <div style={{
                    marginTop: '20px',
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

                {/* Smooth High-End Progress Bar */}
                <div style={{ 
                    width: '320px', 
                    height: '3px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginTop: '15px'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00d4aa, #00b4d8)',
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

            <style jsx>{`
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                @keyframes pulseLogo {
                    0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 212, 170, 0.4)); }
                    50% { transform: scale(1.04); filter: drop-shadow(0 0 25px rgba(0, 212, 170, 0.7)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 212, 170, 0.4)); }
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
            `}</style>
        </div>
    );
};

export default LoadingScreen;
