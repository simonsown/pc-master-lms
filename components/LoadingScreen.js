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
                backgroundColor: '#000',
                color: '#10b981', // Emerald green for terminal look
                fontFamily: 'var(--font-mono)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px',
                fontSize: '16px',
                lineHeight: '1.8',
                cursor: 'pointer',
                animation: 'fadeOut 0.3s ease-out forwards',
                animationPlayState: visible ? 'paused' : 'running'
            }}
        >

            
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                    {step >= 0 && <div>{'>'} Initializing PC Master Builder...</div>}
                    {step >= 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{'>'} Loading hardware database...</span>
                            <span>[{getBar(step === 1 ? progress : 100)}] {step === 1 ? progress : 100}%</span>
                        </div>
                    )}
                    {step >= 2 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{'>'} Connecting AI engine...</span>
                            <span>[{getBar(step === 2 ? progress : 100)}] {step === 2 ? progress : 100}%</span>
                        </div>
                    )}
                    {step >= 3 && <div>{'>'} Ready.</div>}
                    <div className="blinking-cursor" style={{ marginTop: '10px' }}>{'>'} </div>
                </div>
                <div style={{ position: 'absolute', bottom: '40px', left: '0', width: '100%', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                    Click anywhere to skip
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
