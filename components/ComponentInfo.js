'use client';

import { COMPONENT_DATA } from '../utils/i18nData';

const ComponentInfo = ({ type, lang = 'en', onOpenLesson }) => {
    if (!type || !COMPONENT_DATA[lang][type]) return null;

    const info = COMPONENT_DATA[lang][type];

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            width: '300px',
            padding: '1.5rem',
            borderLeft: '4px solid var(--primary-neon)',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <h3 className="neon-text-blue" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{info.title}</h3>
            <p style={{ color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.5', fontSize: '0.95rem' }}>{info.desc}</p>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--secondary-neon)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Did you know?</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.25rem' }}>{info.funFact}</p>
            </div>

            <button
                onClick={() => onOpenLesson && onOpenLesson(type)}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--primary-neon)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-neon)'; }}
            >
                <span>📘</span>
                {lang === 'en' ? 'Deep Dive Lesson' : 'Xem Chi Tiết Bài Giảng'}
            </button>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ComponentInfo;