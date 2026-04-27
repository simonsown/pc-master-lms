'use client';

import { useEffect, useState } from 'react';

const steps = [
    { text: "BIOS CHECK...", delay: 1000 },
    { text: "CPU FOUND: OK", delay: 800 },
    { text: "RAM DETECTED: 32GB OK", delay: 800 },
    { text: "GPU INITIALIZED: RTX 4090", delay: 1000 },
    { text: "LOADING OS...", delay: 2000 },
    { text: "SYSTEM READY", delay: 1000 }
];

const BootSequence = ({ onComplete, lang = 'en' }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step < steps.length) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, steps[step].delay);
            return () => clearTimeout(timer);
        } else {
            if (onComplete) onComplete();
        }
    }, [step, onComplete]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'black',
            color: '#00ff00',
            fontFamily: 'Courier New, Courier, monospace',
            padding: '2rem',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            {steps.slice(0, step + 1).map((s, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                    {`> ${s.text}`}
                </div>
            ))}
            <div className="cursor-blink">_</div>
            <style jsx>{`
                .cursor-blink {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default BootSequence;
