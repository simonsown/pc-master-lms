'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Cpu, ShoppingCart, Users, BrainCircuit, Award, Globe, Sparkles, 
  Menu, Webcam, X, Sun, Moon, FileText, Bell, MessageSquare, User, Monitor,
  BarChart3, Zap, Settings, GraduationCap, BookMarked
} from 'lucide-react';
import JoinClassModal from './JoinClassModal';
import ComponentPreview from './ComponentPreview';

const BurgerMenu = ({ 
  lang, 
  toggleLang,
  onStartQuiz, 
  appMode, 
  setAppMode, 
  webcamMouseEnabled = false, 
  setWebcamMouseEnabled, 
  trackingSensitivity = 1.0, 
  setTrackingSensitivity,
  onToggleAI,
  isAIOpen,
  theme,
  setTheme
}) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [showCredits, setShowCredits] = useState(false);
    const [showJoinClass, setShowJoinClass] = useState(false);
    const [showComponents, setShowComponents] = useState(false);
    const [hasClass, setHasClass] = useState(false);
    const unreadCount = 0;
    
    // Check if user has a class
    useEffect(() => {
        const checkClass = async () => {
            try {
                const { createBrowserClient } = require('@supabase/ssr');
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('class_id, school_id')
                      .eq('id', user.id)
                      .single();
                      
                    if (profile?.class_id || profile?.school_id) {
                        setHasClass(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        checkClass();
    }, []);
    
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

                <div style={{ height: '60px', padding: '0 16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                            PC Master <span style={{ color: 'var(--brand-primary)' }}>Builder</span>
                        </span>
                    </Link>
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
                        
                        <Link
                            href="/courses"
                            style={{ ...navItemStyle('courses', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('courses')} onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <BookOpen style={iconStyle('courses', false)} />
                            {lang === 'en' ? 'Hardware Course' : 'Giáo Trình Khóa Học'}
                        </Link>

                        <Link
                            href="/video-courses"
                            style={{ ...navItemStyle('video_courses', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('video_courses')} onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <Sparkles style={iconStyle('video_courses', false)} />
                            {lang === 'en' ? 'Video Library' : 'Video Bài Giảng'}
                        </Link>
                        
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
                            onMouseEnter={() => setHoveredBtn('components')} onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => setShowComponents(true)}
                            style={navItemStyle('components', false)}
                        >
                            <Monitor style={iconStyle('components', false)} />
                            {lang === 'en' ? 'Component Library' : 'Tủ Linh Kiện'}
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

                    {/* NHÓM ĐÁNH GIÁ */}
                    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px', margin: '0 16px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', padding: '12px 0 6px 0'
                        }}>
                            {lang === 'en' ? 'Assessment' : 'Đánh giá'}
                        </div>
                        
                        <Link 
                            href="/daily-quiz" 
                            style={{ ...navItemStyle('quiz_bank', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('quiz_bank')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <BookMarked style={iconStyle('quiz_bank', false)} />
                            {lang === 'en' ? 'Question Bank' : 'Ngân Hàng Đề Thi'}
                        </Link>

                        
                        <Link 
                            href="/quiz" 
                            style={{ ...navItemStyle('mcq', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('mcq')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <BrainCircuit style={iconStyle('mcq', false)} />
                            {lang === 'en' ? 'MCQ' : 'Trắc Nghiệm'}
                        </Link>
                        
                        <Link 
                            href="/leaderboard" 
                            style={{ ...navItemStyle('leaderboard', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('leaderboard')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <BarChart3 style={iconStyle('leaderboard', false)} />
                            {lang === 'en' ? 'Leaderboard' : 'Xếp Hạng'}
                        </Link>
                    </div>

                    {typeof setWebcamMouseEnabled !== 'undefined' && typeof setTrackingSensitivity !== 'undefined' && (
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
                                onClick={() => { if (setWebcamMouseEnabled) setWebcamMouseEnabled(!webcamMouseEnabled) }}
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
                                onChange={(e) => { if (setTrackingSensitivity) setTrackingSensitivity(parseFloat(e.target.value)) }}
                                className="custom-slider"
                                style={{
                                    background: `linear-gradient(to right, var(--brand-primary) ${percent}%, var(--bg-elevated) ${percent}%)`
                                }}
                            />
                        </div>
                    </div>
                    )}

                    {/* TÍNH NĂNG KHÁC */}
                    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px', margin: '0 16px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', padding: '12px 0 6px 0'
                        }}>
                            {lang === 'en' ? 'Extras' : 'Tính năng khác'}
                        </div>

                        {!hasClass ? (
                            <button
                                onMouseEnter={() => setHoveredBtn('join_class')} onMouseLeave={() => setHoveredBtn(null)}
                                onClick={() => setShowJoinClass(true)}
                                style={navItemStyle('join_class', false)}
                            >
                                <Users style={iconStyle('join_class', false)} />
                                {lang === 'en' ? 'Join Class' : 'Tham gia lớp học'}
                            </button>
                        ) : (
                            <Link 
                                href="/student/classes" 
                                style={{ ...navItemStyle('my_class', false), textDecoration: 'none' }}
                                onMouseEnter={() => setHoveredBtn('my_class')} 
                                onMouseLeave={() => setHoveredBtn(null)}
                            >
                                <Users style={iconStyle('my_class', false)} />
                                {lang === 'en' ? 'My Class' : 'Lớp Học Của Tôi'}
                            </Link>
                        )}
                        
                        
                        <Link 
                            href="/student/discussion" 
                            style={{ ...navItemStyle('discussion', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('discussion')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <MessageSquare style={iconStyle('discussion', false)} />
                            {lang === 'en' ? 'Discussion' : 'Thảo Luận'}
                        </Link>
                        
                        <Link 
                            href="/student/level" 
                            style={{ ...navItemStyle('level', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('level')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <Zap style={iconStyle('level', false)} />
                            {lang === 'en' ? 'Level & Missions' : 'Cấp Độ & Nhiệm Vụ'}
                        </Link>
                        
                        <Link 
                            href="/profile" 
                            style={{ ...navItemStyle('profile', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('profile')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <User style={iconStyle('profile', false)} />
                            {lang === 'en' ? 'Profile' : 'Hồ Sơ'}
                        </Link>
                        
                        <Link 
                            href="/profile?tab=settings" 
                            style={{ ...navItemStyle('settings', false), textDecoration: 'none' }}
                            onMouseEnter={() => setHoveredBtn('settings')} 
                            onMouseLeave={() => setHoveredBtn(null)}
                        >
                            <Settings style={iconStyle('settings', false)} />
                            {lang === 'en' ? 'Settings' : 'Cài Đặt'}
                        </Link>
                        
                        <Link href="/about" style={{ textDecoration: 'none' }}>
                            <button
                                onMouseEnter={() => setHoveredBtn('about')} onMouseLeave={() => setHoveredBtn(null)}
                                style={navItemStyle('about', false)}
                            >
                                <Users style={iconStyle('about', false)} />
                                {lang === 'en' ? 'About Us' : 'Về chúng tôi'}
                            </button>
                        </Link>

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
                <div 
                  onClick={(e) => { if (e.target === e.currentTarget) setShowCredits(false) }}
                  style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg, #0f1729 0%, #1a2a4a 50%, #0d1f3c 100%)',
                        border: '1px solid rgba(0,212,170,0.2)', borderRadius: '20px',
                        padding: '24px 28px', maxWidth: '480px', width: '100%', color: '#fff',
                        position: 'relative', maxHeight: '85vh', overflowY: 'auto',
                        boxShadow: '0 0 60px rgba(0,212,170,0.1), 0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        <button
                            onClick={() => setShowCredits(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
                        ><X size={16} /> {lang === 'en' ? 'Close' : 'Đóng (Tắt)'}</button>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #00d4aa, #00f3ff)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏆</div>
                            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800 }}>
                                {lang === 'en' ? 'CREDITS & REPORT' : 'TÁC GIẢ & BÁO CÁO'}
                            </h2>
                            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>PC Master Builder - v1.0.0</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#00d4aa' }}>THÔNG TIN DỰ ÁN</p>
                                <p style={{ margin: '2px 0' }}><strong>{lang === 'en' ? 'Project:' : 'Dự Án:'}</strong> PC Master Builder</p>
                                <p style={{ margin: '2px 0' }}><strong>{lang === 'en' ? 'Developer:' : 'Developer:'}</strong> Nguyễn Phúc Khánh Sơn</p>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.1)' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#00d4aa' }}>GIÁO VIÊN HƯỚNG DẪN</p>
                                <p style={{ margin: '2px 0' }}>👩‍🏫 Trần Minh Phụng (GVHD Chính)</p>
                                <p style={{ margin: '2px 0' }}>👩‍🏫 Đoàn Thụy Kim Phượng (GVHD)</p>
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>THÀNH VIÊN</p>
                                <p style={{ margin: '2px 0' }}>👨‍💻 Đặng Quốc An • Nguyễn Phạm Gia Khiêm • Ngô Minh Khang</p>
                            </div>
                            <button
                                onClick={() => setShowCredits(false)}
                                style={{
                                    marginTop: '8px', width: '100%', padding: '10px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #00d4aa, #00aaff)',
                                    border: 'none', color: '#000', fontWeight: 800, fontSize: '13px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <X size={16} /> {lang === 'en' ? 'Close Window' : 'Tắt / Đóng Cửa Sổ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Component Library Modal */}
            {showComponents && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(12, 15, 20, 0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
                }}>
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '12px',
                        padding: '24px', maxWidth: '900px', width: '100%', color: 'var(--text-primary)',
                        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <button onClick={() => setShowComponents(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        ><X size={20} /></button>
                        <h2 style={{ marginTop: 0, fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                            {lang === 'en' ? 'Component Library' : 'Tủ Linh Kiện'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            {lang === 'en' ? 'Browse all components, specs, and prices.' : 'Tra cứu toàn bộ linh kiện, thông số kỹ thuật, và giá tham khảo.'}
                        </p>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'COOLER'].map(type => (
                                <div key={type} style={{ flex: '1 1 220px', minWidth: '180px', maxWidth: '280px' }}>
                                    <ComponentPreview type={type} model={null} size="large" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <JoinClassModal 
                isOpen={showJoinClass} 
                onClose={() => setShowJoinClass(false)} 
                lang={lang} 
            />
        </>
    );
};

export default BurgerMenu;
