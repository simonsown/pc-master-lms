'use client';

import { useState, useEffect } from 'react';

const AIGuru = ({ message, trigger, lang = 'en' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        let preferredVoice = null;
        if (lang === 'vn') {
            preferredVoice = voices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese'));
        } else {
            preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        }
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.pitch = 1.1;
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
    }, [message, trigger]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed', top: '2rem', right: '2rem', width: '320px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.8rem', zIndex: 9999,
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '16px', borderLeft: '4px solid var(--brand-primary)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            transform: isSpeaking ? 'scale(1.03)' : 'scale(1)',
        }}>
            <button onClick={() => setIsVisible(false)}
                style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}>
                ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: isSpeaking ? 'var(--brand-primary)' : 'var(--text-muted)',
                    boxShadow: isSpeaking ? '0 0 10px var(--brand-primary)' : 'none',
                    animation: isSpeaking ? 'pulse 1s infinite' : 'none'
                }} />
                <strong style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }}>AI Guru</strong>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4', margin: 0 }}>
                {message}
            </p>
        </div>
    );
};

export default AIGuru;
