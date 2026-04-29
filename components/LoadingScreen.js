'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let mounted = true;

        const runSequence = async () => {
            // Step 1: Initializing
            await new Promise(r => setTimeout(r, 500));
            if (!mounted) return;
            setStep(1);

            // Step 2: Loading hardware database (animate progress)
            for (let i = 0; i <= 100; i += 5) {
                await new Promise(r => setTimeout(r, 20));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 200));
            if (!mounted) return;
            setStep(2);
            setProgress(0);

            // Step 3: Connecting AI engine
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(r => setTimeout(r, 30));
                if (!mounted) return;
                setProgress(i);
            }
            await new Promise(r => setTimeout(r, 300));
            if (!mounted) return;
            setStep(3);

            // Step 4: Ready
            await new Promise(r => setTimeout(r, 500));
            if (!mounted) return;

            setVisible(false);
            setTimeout(onComplete, 300); // Wait for fade out
        };

        runSequence();

        return () => { mounted = false; };
    }, [onComplete]);

    const getBar = (pct) => {
        const totalBlocks = 12;
        const filledBlocks = Math.floor((pct / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    };

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
                backgroundColor: 'var(--bg-base)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                animation: 'fadeOut 0.4s ease-out forwards',
                animationPlayState: visible ? 'paused' : 'running'
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px'
            }}>
                <img 
                    src="/logo.png" 
                    alt="Logo" 
                    style={{ 
                        width: '100px', 
                        filter: 'drop-shadow(0 0 15px rgba(0, 243, 255, 0.4))',
                        animation: 'pulseLogo 2s infinite ease-in-out'
                    }} 
                />
                
                <h1 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '24px', 
                    fontWeight: 800,
                    letterSpacing: '2px',
                    margin: 0
                }}>
                    PC MASTER <span style={{ color: 'var(--brand-primary)' }}>BUILDER</span>
                </h1>

                {/* Smooth Progress Bar */}
                <div style={{ 
                    width: '240px', 
                    height: '4px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--brand-primary)',
                        transition: 'width 0.1s linear',
                        boxShadow: '0 0 10px var(--brand-primary)'
                    }} />
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Click anywhere to skip
            </div>

            <style jsx>{`
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                @keyframes pulseLogo {
                    0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 243, 255, 0.4)); }
                    50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(0, 243, 255, 0.7)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 243, 255, 0.4)); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
