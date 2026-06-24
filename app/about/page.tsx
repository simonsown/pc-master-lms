'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, MapPin, ExternalLink, ShieldCheck, Heart, Loader2, Sparkles, BookOpen, Award, Users, Target, Quote, ChevronDown, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function CollapsibleGroup({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ marginBottom: '8px' }}>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: '10px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px',
                fontFamily: 'inherit', textTransform: 'uppercase',
            }}>
                <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
                <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <div style={{ padding: '16px 16px 8px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function AboutPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            const { data } = await supabase.from('project_team').select('*').order('order_index', { ascending: true });
            if (data && data.length > 0) {
                setTeam(data);
            } else {
                setTeam([
                    { id: '1', full_name: 'Nguyễn Phúc Khánh Sơn', image_url: '/son.png', role: 'Developer' },
                    { id: '2', full_name: 'Đặng Quốc An', image_url: '/team-an-khang.png', role: 'Thành viên' },
                    { id: '3', full_name: 'Nguyễn Phạm Gia Khiêm', image_url: '/team-hiem.png', role: 'Thành viên' },
                    { id: '4', full_name: 'Ngô Minh Khang', image_url: '/team-an-khang.png', role: 'Thành viên' },
                ]);
            }
            setLoading(false);
        }
        fetchTeam();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
            
            <header style={{ 
                height: '50vh', position: 'relative', overflow: 'hidden', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.05) 0%, rgba(5, 5, 7, 1) 70%)'
            }}>
                <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 100 }}>
                    <Link href="/" style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', textDecoration: 'none', 
                        fontWeight: 700, background: 'rgba(255,255,255,0.03)', padding: '12px 24px', 
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                    }}>
                        <ArrowLeft size={20} /> Quay lại trang chủ
                    </Link>
                </div>

                <div style={{ maxWidth: '1000px', padding: '0 24px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '100px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '24px', letterSpacing: '1px' }}>
                        <Sparkles size={14} /> PC MASTER BUILDER
                    </div>
                    <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, marginBottom: '24px', lineHeight: 1, letterSpacing: '-0.04em' }}>
                        Về Chúng Tôi
                    </h1>
                </div>
            </header>

            <section style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #050507, #0a0a0c)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
                    <div style={{ animation: 'fadeInLeft 1s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                                <BookOpen size={24} />
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Sứ Mệnh Di Sản</h2>
                        </div>
                        
                        <div style={{ fontSize: '18px', color: '#8899a6', lineHeight: 1.8, marginBottom: '32px' }}>
                            <p style={{ fontStyle: 'italic', color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
                                "PC Master Builder" là dự án giải pháp ứng dụng công nghệ và AI đang trong quá trình chạy thử nghiệm (Pilot Run).
                            </p>
                            <p>
                                Chúng tôi khao khát ứng dụng sức mạnh của Công nghệ và AI để giải quyết các thách thức trong việc học tập và thực hành lắp ráp máy tính. Hiện tại, sản phẩm đang được vận hành thử nghiệm trên các hạ tầng công nghệ hiện đại nhất để kiểm chứng tính khả thi và hiệu quả giáo dục.
                            </p>
                        </div>

                        <div style={{ 
                            padding: '24px', borderRadius: '20px', background: 'rgba(0, 243, 255, 0.03)', 
                            borderLeft: '4px solid var(--brand-primary)', color: 'var(--brand-primary)',
                            fontWeight: 700, fontSize: '16px', letterSpacing: '0.05em', lineHeight: 1.5
                        }}>
                            VỚI TINH THẦN "DÁM NGHĨ - DÁM LÀM", CHÚNG TÔI CAM KẾT MANG ĐẾN NHỮNG Ý TƯỞNG ĐỘT PHÁ VÀ NỖ LỰC HOÀN THIỆN SẢN PHẨM TỪNG NGÀY.
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ perspective: '1200px' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'relative', borderRadius: '32px', overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 243, 255, 0.25)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                aspectRatio: '16/9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'radial-gradient(circle at 30% 40%, rgba(0, 212, 170, 0.08) 0%, rgba(5, 5, 7, 1) 70%)',
                                transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                                transformStyle: 'preserve-3d',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = '0 35px 70px -12px rgba(0, 243, 255, 0.45), 0 0 0 1px rgba(0,212,170,0.3)';
                                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                                e.currentTarget.style.transform = 'rotateY(-2deg) rotateX(2deg)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 243, 255, 0.25)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
                            }}
                        >
                            <motion.img
                                src="/showcase.png"
                                alt="PC Master Builder"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                                    position: 'relative', zIndex: 0,
                                }}
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                                background: 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)',
                                animation: 'aboutShowcaseGlow 3s ease-in-out infinite',
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2,
                                padding: '8px 20px', borderRadius: '99px',
                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(0,212,170,0.2)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Cpu size={14} color="#00d4aa" />
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                                    Mô phỏng lắp ráp PC thực tế
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <section style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #0a0a0c, #050507)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'rgba(0, 243, 255, 0.08)', borderRadius: '100px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '24px', letterSpacing: '1px' }}>
                            <Award size={16} /> ĐỘI NGŨ GIÁO VIÊN
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Giáo Viên <span style={{ color: 'var(--brand-primary)', background: 'linear-gradient(135deg, #00d4aa, #00f3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hướng Dẫn</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginTop: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Những người tận tâm hướng dẫn và truyền cảm hứng cho thế hệ kỹ sư công nghệ tương lai
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '80px', marginBottom: '40px' }}>
                        {/* Giáo viên 1: Trần Minh Phụng */}
                        <div style={{ textAlign: 'center', width: '320px' }}>
                            <div style={{ 
                                position: 'relative', width: '220px', height: '220px', 
                                margin: '0 auto 32px', borderRadius: '50%', overflow: 'hidden',
                                border: '3px solid rgba(0, 212, 170, 0.3)', background: '#0a0a0c',
                                boxShadow: '0 0 40px rgba(0, 212, 170, 0.15), inset 0 0 40px rgba(0, 212, 170, 0.05)',
                                transition: 'all 0.4s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 212, 170, 0.3), inset 0 0 40px rgba(0, 212, 170, 0.08)'; e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.6)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 212, 170, 0.15), inset 0 0 40px rgba(0, 212, 170, 0.05)'; e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.3)' }}
                            >
                                <img 
                                    src="/teacher-phung.png" 
                                    alt="Trần Minh Phụng" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                                    <ShieldCheck size={18} color="#fff" />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', background: 'linear-gradient(135deg, #fff, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trần Minh Phụng</h3>
                            <p style={{ fontSize: '14px', color: 'var(--brand-primary)', margin: '0 0 8px', fontWeight: 600, letterSpacing: '1px' }}>GIÁO VIÊN HƯỚNG DẪN</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>Chuyên gia Tin học & Công nghệ thông tin</p>
                        </div>

                        {/* Giáo viên 2: Đoàn Thụy Kim Phượng */}
                        <div style={{ textAlign: 'center', width: '320px' }}>
                            <div style={{ 
                                position: 'relative', width: '220px', height: '220px', 
                                margin: '0 auto 32px', borderRadius: '50%', overflow: 'hidden',
                                border: '3px solid rgba(0, 243, 255, 0.3)', background: '#0a0a0c',
                                boxShadow: '0 0 40px rgba(0, 243, 255, 0.15), inset 0 0 40px rgba(0, 243, 255, 0.05)',
                                transition: 'all 0.4s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(0, 243, 255, 0.3), inset 0 0 40px rgba(0, 243, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.6)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 243, 255, 0.15), inset 0 0 40px rgba(0, 243, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)' }}
                            >
                                <img 
                                    src="/teacher-phuong.png" 
                                    alt="Đoàn Thụy Kim Phượng" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '36px', height: '36px', borderRadius: '50%', background: '#00f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                                    <ShieldCheck size={18} color="#000" />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', background: 'linear-gradient(135deg, #fff, #00f3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Đoàn Thụy Kim Phượng</h3>
                            <p style={{ fontSize: '14px', color: '#00f3ff', margin: '0 0 8px', fontWeight: 600, letterSpacing: '1px' }}>GIÁO VIÊN HƯỚNG DẪN</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>Chuyên gia Tin học & Công nghệ thông tin</p>
                        </div>
                    </div>

                    <section style={{ padding: '80px 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'rgba(0, 212, 170, 0.08)', borderRadius: '100px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '24px', letterSpacing: '1px' }}>
                                <Users size={16} /> ĐỘI NGŨ PHÁT TRIỂN
                            </div>
                            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                Đội Ngũ <span style={{ color: 'var(--brand-primary)', background: 'linear-gradient(135deg, #ffb900, #ff8b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Phát Triển</span>
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginTop: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                                Những con người tâm huyết tạo nên PC Master Builder - Dám nghĩ dám làm
                            </p>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--brand-primary)" /></div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '60px' }}>
                                {team.map((member, idx) => {
                                    const isKhangOrAn = member.full_name === 'Đặng Quốc An' || member.full_name === 'Ngô Minh Khang';
                                    const borderGradients = [
                                        'linear-gradient(135deg, #00d4aa, #00f3ff)',
                                        'linear-gradient(135deg, #ffb900, #ff8b00)',
                                        'linear-gradient(135deg, #a78bfa, #6366f1)',
                                        'linear-gradient(135deg, #f472b6, #ec4899)',
                                    ];
                                    return (
                                        <div key={member.id} style={{ textAlign: 'center', width: '320px' }}>
                                            <div style={{ 
                                                position: 'relative', width: '280px', height: '280px', 
                                                margin: '0 auto 28px', borderRadius: '40px', overflow: 'hidden',
                                                border: '2px solid rgba(255,255,255,0.1)', background: '#0a0a0c',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,212,170,0.2)' }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
                                            >
                                                <img src={member.image_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                <div style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                                                    padding: '24px 16px 16px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                }}>
                                                    <span style={{
                                                        padding: '4px 14px', borderRadius: '99px',
                                                        background: 'rgba(0,212,170,0.2)', color: '#00d4aa',
                                                        fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                                                    }}>
                                                        {member.role || 'Thành viên'}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>{member.full_name}</h3>
                                            <div style={{ width: '40px', height: '3px', background: borderGradients[idx % borderGradients.length], margin: '8px auto', borderRadius: '2px' }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </section>

            <section style={{ padding: '100px 24px', background: 'linear-gradient(to bottom, #050507, #0a0a0c)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'rgba(0, 243, 255, 0.08)', borderRadius: '100px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '24px', letterSpacing: '1px' }}>
                            <MapPin size={16} /> LIÊN HỆ
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
                            TRƯỜNG THPT <span style={{ color: 'var(--brand-primary)' }}>NGUYỄN CÔNG TRỨ</span>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <MapPin color="var(--brand-primary)" size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Địa chỉ</p>
                                            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#fff' }}>97 Quang Trung, Phường Thông Tây Hội, Gò Vấp, TP. HCM</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,243,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Phone color="#00f3ff" size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Điện thoại</p>
                                            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#fff' }}>(028) 3894 1546</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Mail color="#a78bfa" size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Email liên hệ</p>
                                            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#fff' }}>c3nguyencongtru.tphcm@moet.edu.vn</p>
                                        </div>
                                    </div>
                                    <a href="https://maps.app.goo.gl/CDytzt1bYAJ7zVew7" target="_blank"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--brand-primary)', color: '#000', fontWeight: 800, fontSize: '14px', textDecoration: 'none', marginTop: '8px', justifyContent: 'center' }}>
                                        <ExternalLink size={18} /> MỞ TRONG GOOGLE MAPS
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '450px', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.84715830911!2d106.6661623147491!3d10.82329389228965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e57849e531%3A0xc3b320d72c0d3b3c!2zVHLGsOG7nW5nIFRIUFQgTmd1eeG7hW4gQ8O0bmcgVHLhu6k!5e0!3m2!1svi!2s!4v1651130000000!5m2!1svi!2s" 
                                width="100%" height="100%" style={{ border: 0 }} 
                                allowFullScreen={true} loading="lazy"
                            ></iframe>
                            <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 600, color: '#fff', zIndex: 10, pointerEvents: 'none' }}>
                                🏫 THPT Nguyễn Công Trứ
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '60px 24px 60px', background: '#050507', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <CollapsibleGroup title="Tác giả & Giáo viên hướng dẫn" defaultOpen={false}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Nguyễn Phúc Khánh Sơn</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Developer & Designer</p>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Trần Minh Phụng</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>GV hướng dẫn</p>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Đoàn Thụy Kim Phượng</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>GV phụ trách</p>
                            </div>
                        </div>
                    </CollapsibleGroup>
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: 0, textAlign: 'center' }}>
                            © {new Date().getFullYear()} PC Master Builder - THPT Nguyễn Công Trứ. Tất cả quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes floatBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes floatRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulseDot {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes aboutShowcaseGlow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.9; }
                }
            `}</style>
        </div>
    );
}
