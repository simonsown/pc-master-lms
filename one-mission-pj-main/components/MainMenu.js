'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Cpu, ShoppingCart, Users, ArrowRight, Info, LogIn, LogOut, User, Award, Swords, Star, Trophy, GraduationCap, Compass, Puzzle, Zap, Sparkles, Gamepad2, BarChart3, Target, ShieldCheck, Flag, Clock, Gift, Layers, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

const s = { red: '#D32F2F', navy: '#1A2F4A', teal: '#0097A7', orange: '#F5A623' }

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] } })

const MainMenu = ({ onStart, lang, onOpenLogin }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ lessons: 0, achievements: 0, xp: 0 });

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
                const [lessonsRes, achievementsRes, xpRes] = await Promise.all([
                    supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('status', 'completed'),
                    supabase.from('student_achievements').select('id', { count: 'exact', head: true }).eq('student_id', currentUser.id),
                    supabase.from('student_achievements').select('achievement_id').eq('student_id', currentUser.id)
                ]);
                const lessonCount = lessonsRes.count ?? 0;
                const achievementCount = achievementsRes.count ?? 0;
                let xpTotal = 0;
                if (xpRes.data?.length) {
                    const ids = xpRes.data.map((r) => r.achievement_id);
                    const { data: defs } = await supabase.from('achievement_definitions').select('points').in('id', ids);
                    xpTotal = (defs ?? []).reduce((sum, d) => sum + (d.points ?? 0), 0);
                }
                setStats({ lessons: lessonCount, achievements: achievementCount, xp: xpTotal });
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const sections = [
        {
            label: 'Học Tập',
            items: [
                { id: 'course', title: 'Bài Giảng', desc: 'Lý thuyết phần cứng theo chủ đề', Icon: BookOpen, color: s.red },
                { id: 'exams', title: 'Kỳ Thi', desc: 'Kiểm tra kiến thức định kỳ', Icon: ShieldCheck, color: s.teal },
            ]
        },
        {
            label: 'Thực Hành',
            items: [
                { id: 'learning', title: 'Luyện Tập', desc: 'Lắp ráp tự do theo sở thích', Icon: Cpu, color: s.teal },
                { id: 'market', title: 'Chợ Máy Tính', desc: 'Mua linh kiện, tối ưu cấu hình', Icon: ShoppingCart, color: s.orange },
            ]
        },
        {
            label: 'Thi Đấu',
            items: [
                { id: 'multiplayer', title: '2 Người Chơi', desc: 'Đối kháng — ai lắp nhanh hơn thắng', Icon: Users, color: s.red },
                { id: 'challenge', title: 'Thử Thách', desc: 'Nhiệm vụ hàng ngày, thử thách thời gian', Icon: Swords, color: s.orange },
            ]
        },
        {
            label: 'Khám Phá',
            items: [
                { id: 'components', title: 'Tủ Linh Kiện', desc: 'Tra cứu toàn bộ linh kiện & thông số', Icon: Layers, color: s.navy },
                { id: 'lab', title: 'Phòng AI Lab', desc: 'Thí nghiệm cấu hình với AI Guru', Icon: Bot, color: s.teal },
            ]
        },
    ];

    const quickStats = [
        { icon: <Zap size={16} />, label: 'Bài đã học', value: stats.lessons.toString(), color: s.teal },
        { icon: <Award size={16} />, label: 'Thành tích', value: stats.achievements.toString(), color: s.orange },
        { icon: <Star size={16} />, label: 'Điểm kinh nghiệm', value: stats.xp.toLocaleString(), color: s.red },
    ];

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px',
            margin: '0 auto', padding: '32px 48px', minHeight: '100vh'
        }}>
            {/* HEADER */}
            <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: s.navy, margin: 0, letterSpacing: '-0.03em' }}>
                            PC Master Builder
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                            Mô phỏng lắp ráp PC 2D tích hợp AI
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ width: '40px' }} />
                ) : user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Link href={profile?.role === 'teacher' ? '/teacher' : profile?.role === 'parent' ? '/parent' : '/builder'}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${s.red}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.red }}>
                                <User size={14} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: s.navy }}>{profile?.full_name || user.email?.split('@')[0]}</span>
                        </Link>
                        <button onClick={handleSignOut}
                            style={{ background: `${s.red}0d`, color: s.red, border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontFamily: 'inherit' }}>
                            <LogOut size={14} /> Thoát
                        </button>
                    </div>
                ) : (
                    <button onClick={onOpenLogin}
                        style={{ background: s.navy, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'inherit' }}>
                        <LogIn size={16} /> Đăng nhập
                    </button>
                )}
            </motion.div>

            <motion.div {...fadeUp(0.05)} style={{ borderBottom: '1px solid #E2E8F0', margin: '20px 0' }} />

            {/* QUICK STATS */}
            {user && (
                <motion.div {...fadeUp(0.1)} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                    {quickStats.map((stat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <div style={{ color: stat.color }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: s.navy, lineHeight: 1.2 }}>{stat.value}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* SECTIONS GRID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {sections.map((section, secIdx) => (
                    <motion.div key={secIdx} {...fadeUp(0.15 + secIdx * 0.08)}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                            <span style={{ display: 'inline-block', width: '3px', height: '12px', borderRadius: '2px', background: [s.red, s.teal, s.orange, s.navy][secIdx], marginRight: '8px', verticalAlign: 'middle' }} />
                            {section.label}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {section.items.map((mode) => (
                                <motion.button
                                    key={mode.id}
                                    onClick={() => onStart(mode.id)}
                                    whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                                        borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                        fontFamily: 'inherit', transition: 'border-color 0.15s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = mode.color}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        background: `${mode.color}0d`, color: mode.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <mode.Icon size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: s.navy, marginBottom: '2px' }}>{mode.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{mode.desc}</div>
                                    </div>
                                    <ArrowRight size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* TIPS BAR */}
            <motion.div {...fadeUp(0.5)} style={{ marginTop: '28px', padding: '12px 16px', borderRadius: '8px', background: `${s.orange}08`, border: `1px solid ${s.orange}20`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Info size={15} color={s.orange} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                    Bạn có thể dùng Webcam hoặc Chuột để lắp ráp. Điều chỉnh độ nhạy tracking tại menu bên trái.
                </span>
            </motion.div>
        </div>
    );
};

export default MainMenu;
