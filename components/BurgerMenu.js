'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Cpu, ShoppingCart, Users, BrainCircuit, Award, Globe, Sparkles, Menu, Webcam, X, Sun, Moon } from 'lucide-react';

const BurgerMenu = ({ 
  lang, 
  toggleLang,
  onStartQuiz, 
  appMode, 
  setAppMode, 
  webcamMouseEnabled, 
  setWebcamMouseEnabled, 
  trackingSensitivity, 
  setTrackingSensitivity,
  onToggleAI,
  isAIOpen,
  theme,
  setTheme
}) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [showCredits, setShowCredits] = useState(false);
    
    // Close mobile menu when mode changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [appMode]);

    const navItemStyle = (id, isActive) => ({
        padding: '8px 12px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        background: isActive ? 'var(--brand-subtle)' : hoveredBtn === id ? 'var(--bg-hover)' : 'transparent',
        border: 'none',
        borderLeft: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
        marginLeft: isActive ? '-2px' : '0',
        transition: 'all 150ms ease',
        width: '100%',
        color: isActive ? 'var(--brand-light)' : hoveredBtn === id ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 500,
        fontSize: 'var(--text-sm)',
        textAlign: 'left'
    });

    const iconStyle = (id, isActive) => ({
        color: isActive ? 'var(--brand-light)' : hoveredBtn === id ? 'var(--text-primary)' : 'var(--text-muted)',
        width: '16px',
        height: '16px',
        transition: 'all 150ms ease'
    });

    const percent = ((trackingSensitivity - 0.5) / 2.5) * 100;

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="mobile-hamburger"
                onClick={() => setIsMobileOpen(true)}
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    width: '40px',
                    height: '40px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                }}
            >
                <Menu size={20} />
            </button>

            {/* Mobile Backdrop */}
            <div
                className="mobile-backdrop"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 180, opacity: isMobileOpen ? 1 : 0, pointerEvents: isMobileOpen ? 'auto' : 'none',
                    transition: 'opacity 250ms ease-out'
                }}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <div className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}>

                {/* [1] HEADER */}
                <div style={{ height: '56px', padding: '0 16px', display: 'flex', alignItems: 'center', flexShrink: 0, justifyContent: 'space-between' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} title={lang === 'en' ? 'Home' : 'Trang chủ'}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                            <span className="desktop-only">PC Master </span><span style={{ color: 'var(--brand-light)' }}>Builder</span>
                        </span>
                    </Link>
                    <div style={{
                        fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--brand-subtle)',
                        color: 'var(--brand-light)', borderRadius: '4px', padding: '2px 6px', fontWeight: 500
                    }}>
                        V1.0
                    </div>
                </div>

                {/* [2] DIVIDER */}
                <div style={{ borderBottom: '1px solid var(--border-subtle)', margin: '0 16px', flexShrink: 0 }}></div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* [3] NAV GROUPS - KHÁM PHÁ */}
                    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px', margin: '0 16px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', padding: '12px 0 6px 0'
                        }}>
                            {lang === 'en' ? 'Explore' : 'Khám phá'}
                        </div>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('course')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setAppMode('course')}
                            style={navItemStyle('course', appMode === 'course')}
                        >
                            <BookOpen style={iconStyle('course', appMode === 'course')} />
                            {lang === 'en' ? 'Lecture Course' : 'Bài Giảng'}
                        </button>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('learning')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setAppMode('learning')}
                            style={navItemStyle('learning', appMode === 'learning')}
                        >
                            <Cpu style={iconStyle('learning', appMode === 'learning')} />
                            {lang === 'en' ? 'Practice Mode' : 'Luyện Tập'}
                        </button>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('market')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setAppMode('market')}
                            style={navItemStyle('market', appMode === 'market')}
                        >
                            <ShoppingCart style={iconStyle('market', appMode === 'market')} />
                            {lang === 'en' ? 'Marketplace' : 'Chợ Máy Tính'}
                        </button>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('multiplayer')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setAppMode('multiplayer')}
                            style={navItemStyle('multiplayer', appMode === 'multiplayer')}
                        >
                            <Users style={iconStyle('multiplayer', appMode === 'multiplayer')} />
                            {lang === 'en' ? '2-Player Versus' : '2 Người Chơi'}
                        </button>
                    </div>

                    {/* [4] WEBCAM SECTION */}
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', padding: '12px 0 6px 0'
                        }}>
                            {lang === 'en' ? 'Controls' : 'Điều khiển'}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Webcam size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {lang === 'en' ? 'Hand Tracking' : 'Theo dõi tay'}
                                </span>
                            </div>
                            <div 
                                className={`toggle-switch ${webcamMouseEnabled ? 'on' : 'off'}`}
                                onClick={() => setWebcamMouseEnabled(!webcamMouseEnabled)}
                            >
                                <div className="toggle-thumb"></div>
                            </div>
                        </div>

                        <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {lang === 'en' ? 'Sensitivity' : 'Độ nhạy'}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--brand-light)' }}>
                                    {trackingSensitivity.toFixed(1)}x
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5" max="3" step="0.1"
                                value={trackingSensitivity}
                                onChange={(e) => setTrackingSensitivity(parseFloat(e.target.value))}
                                className="custom-slider"
                                style={{
                                    background: `linear-gradient(to right, var(--brand-primary) ${percent}%, var(--bg-elevated) ${percent}%)`
                                }}
                            />
                        </div>
                    </div>

                    {/* TÍNH NĂNG KHÁC */}
                    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px', margin: '0 16px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', padding: '12px 0 6px 0'
                        }}>
                            {lang === 'en' ? 'Extras' : 'Tính năng khác'}
                        </div>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('quiz')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => onStartQuiz()}
                            style={navItemStyle('quiz', false)}
                        >
                            <BrainCircuit style={iconStyle('quiz', false)} />
                            {lang === 'en' ? 'AI Quiz' : 'AI Trắc Nghiệm'}
                        </button>
                        
                        <button
                            onMouseEnter={() => setHoveredBtn('credits')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setShowCredits(true)}
                            style={navItemStyle('credits', false)}
                        >
                            <Award style={iconStyle('credits', false)} />
                            {lang === 'en' ? 'Credits' : 'Tác Giả & Báo Cáo'}
                        </button>
                    </div>
                </div>

                {/* [5] FOOTER SIDEBAR */}
                <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                        onClick={toggleLang}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', 
                            padding: '4px 8px', borderRadius: '14px', cursor: 'pointer', height: '28px'
                        }}
                    >
                        <Globe size={14} color="var(--text-muted)" />
                        <span style={{ 
                            fontSize: '11px', 
                            fontWeight: lang === 'vn' ? 600 : 400, 
                            color: lang === 'vn' ? 'var(--brand-primary)' : 'var(--text-secondary)'
                        }}>VN</span>
                        <div style={{ width: '1px', height: '10px', background: 'var(--border-strong)' }}></div>
                        <span style={{ 
                            fontSize: '11px', 
                            fontWeight: lang === 'en' ? 600 : 400, 
                            color: lang === 'en' ? 'var(--brand-primary)' : 'var(--text-secondary)'
                        }}>EN</span>
                    </div>
                    
                    <button 
                        onClick={() => setTheme(theme === 'dark' ? 'editorial-light' : 'dark')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        title={lang === 'en' ? 'Toggle Theme' : 'Đổi giao diện'}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    
                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={lang === 'en' ? 'Toggle Effects' : 'Bật/Tắt hiệu ứng'}
                    >
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>

            {/* Credits Modal (same mostly, updated colors) */}
            {showCredits && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(12, 15, 20, 0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
                }}>
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '12px',
                        padding: '24px', maxWidth: '500px', width: '100%', color: 'var(--text-primary)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowCredits(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        ><X size={20} /></button>

                        <h2 style={{ marginTop: 0, fontSize: '24px', textAlign: 'center', marginBottom: '24px', fontWeight: 700 }}>
                            {lang === 'en' ? 'CREDITS' : 'TÁC GIẢ'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: 0 }}><strong>{lang === 'en' ? 'Project:' : 'Dự Án:'}</strong> PC Master Builder</p>
                            <p style={{ margin: 0 }}><strong>{lang === 'en' ? 'Developer:' : 'Nhà Phát Triển:'}</strong> One Mission - THPT Nguyễn Công Trứ</p>
                            <p style={{ margin: 0 }}><strong>{lang === 'en' ? 'Members:' : 'Thành viên:'}</strong></p>
                            <ul style={{ margin: 0, paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li>Dương Vũ Minh Đức</li>
                                <li>Nguyễn Phúc Khánh Sơn</li>
                            </ul>
                            <p style={{ margin: 0 }}><strong>{lang === 'en' ? 'Advisor:' : 'Giáo viên HD:'}</strong> Đoàn Thụy Kim Phượng</p>
                            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }}></div>
                            <p style={{ margin: 0, fontStyle: 'italic', textAlign: 'center', fontSize: '13px' }}>
                                {lang === 'en'
                                    ? "Thank you for using PC Master Builder! We hope this app makes PC building fun and interactive."
                                    : "Cảm ơn bạn đã trải nghiệm PC Master Builder! Hy vọng dự án này giúp việc lắp ráp máy tính trở nên thú vị."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BurgerMenu;
