'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Cpu, ShoppingCart, Users, ArrowRight, Info, LogIn, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const MainMenu = ({ onStart, lang, onOpenLogin }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', currentUser.id)
                    .single();
                setProfile(userProfile);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };
    const modes = [
        {
            id: 'course',
            title: lang === 'en' ? 'Lecture Course' : 'Bài Giảng',
            desc: lang === 'en' ? 'Learn theory and concepts of computer hardware by topic' : 'Học lý thuyết và khái niệm về phần cứng máy tính theo từng chủ đề',
            Icon: BookOpen
        },
        {
            id: 'learning',
            title: lang === 'en' ? 'Practice Mode' : 'Luyện Tập',
            desc: lang === 'en' ? 'Explore the learning path and freely assemble as you like' : 'Khám phá lộ trình học tập và lắp ráp tự do theo sở thích',
            Icon: Cpu
        },
        {
            id: 'market',
            title: lang === 'en' ? 'Marketplace' : 'Chợ Máy Tính',
            desc: lang === 'en' ? 'Buy components for missions, budget and optimize builds' : 'Mua sắm linh kiện theo nhiệm vụ, lập ngân sách và tối ưu cấu hình',
            Icon: ShoppingCart
        },
        {
            id: 'multiplayer',
            title: lang === 'en' ? '2-Player Versus' : '2 Người Chơi',
            desc: lang === 'en' ? 'Time-based competitive battle — who builds faster wins' : 'Thi đấu đối kháng tính thời gian — ai lắp ráp nhanh hơn sẽ thắng',
            Icon: Users
        }
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '48px 64px'
        }}>
            {/* HERO SECTION */}
            {/* HERO SECTION */}
            <div style={{ marginBottom: '56px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                        width: '72px',
                        marginBottom: '24px',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{
                            fontSize: '52px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            margin: 0
                        }}>
                            PC Master Builder
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: 'var(--text-secondary)',
                            fontWeight: 400,
                            marginTop: '12px',
                            marginBottom: 0
                        }}>
                            {lang === 'en' ? 'Advanced 2D PC Assembly Simulator with AI' : 'Mô phỏng lắp ráp PC 2D tích hợp trí tuệ nhân tạo'}
                        </p>
                    </div>
                    {loading ? (
                        <div style={{ width: '40px' }} />
                    ) : user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link href={profile?.role === 'teacher' ? '/teacher' : profile?.role === 'parent' ? '/parent' : '/builder'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(0, 243, 255, 0.1)', border: '1px solid #00f3ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff'
                                }}>
                                    <User size={18} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e0e6ed' }}>
                                    {profile?.full_name || user.email?.split('@')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none',
                                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                                }}
                            >
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            style={{
                                background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: '1px solid #00f3ff',
                                padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
                            }}
                        >
                            <LogIn size={18} /> Đăng nhập
                        </button>
                    )}
                </div>

                <div style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    margin: '32px 0'
                }}></div>
            </div>

            {/* CARDS GRID */}
            <div className="cards-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
            }}>
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onStart(mode.id)}
                        className="mode-card"
                    >
                        <div className="icon-wrapper">
                            <mode.Icon size={20} />
                        </div>
                        <h2 className="title">
                            {mode.title}
                        </h2>
                        <p className="desc">
                            {mode.desc}
                        </p>
                        <div className="cta-btn" style={{
                            marginTop: '20px', display: 'inline-flex', alignItems: 'center',
                            fontSize: '13px', fontWeight: 500, color: 'var(--brand-light)'
                        }}>
                            {lang === 'en' ? 'Start now' : 'Vào ngay'} <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </div>
                    </button>
                ))}
            </div>

            {/* TIPS BAR */}
            <div style={{
                marginTop: '16px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}>
                <Info size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {lang === 'en'
                        ? 'You can use Webcam or Mouse to assemble. Adjust tracking sensitivity in the left menu.'
                        : 'Bạn có thể dùng Webcam hoặc Chuột để tiến hành lắp ráp. Điều chỉnh độ nhạy tracking tại menu bên trái.'}
                </span>
            </div>
        </div>
    );
};

export default MainMenu;
