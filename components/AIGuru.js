'use client';

import { useState, useEffect } from 'react';

const AIGuru = ({ message, trigger, lang = 'en' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const speak = (text) => {
        if (!window.speechSynthesis) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Select a voice based on language
        const voices = window.speechSynthesis.getVoices();
        let preferredVoice = null;

        if (lang === 'vn') {
            // Try to find a Vietnamese voice
            preferredVoice = voices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese'));
        } else {
            // Default to English
            preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        }

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.pitch = 1.1; // Slightly higher pitch for friendliness
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (message && trigger) {
            setIsVisible(true);
            speak(message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, trigger]);

    if (!isVisible) return null;

    return (
        <div className={`glass-panel transition-all duration-300 ${isSpeaking ? 'border-primary-neon scale-105' : 'border-glass'}`}
            style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                width: '320px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                zIndex: 9999,
                borderLeft: '4px solid var(--primary-neon)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
            <button
                onClick={() => setIsVisible(false)}
                style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                aria-label="Close"
            >✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: isSpeaking ? 'var(--primary-neon)' : '#555',
                    boxShadow: isSpeaking ? '0 0 10px var(--primary-neon)' : 'none',
                    animation: isSpeaking ? 'pulse 1s infinite' : 'none'
                }} />
                <strong className="neon-text-blue" style={{ fontSize: '1.1rem' }}>AI Guru</strong>
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                {message}
            </p>

        </div>
    );
};

export default AIGuru;
