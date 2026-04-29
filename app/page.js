'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap, MousePointer2, Users, School, BookOpen } from 'lucide-react';
import AuthButton from '@/components/AuthButton';

export default function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            
            {/* STICKY NAV */}
            <nav style={{ 
                height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '0 40px', borderBottom: '1px solid var(--border-subtle)',
                position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(17, 24, 39, 0.85)',
                backdropFilter: 'blur(12px)', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '32px' }} />
                        <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
                            PC MASTER <span style={{ color: 'var(--brand-primary)' }}>BUILDER</span>
                        </span>
                    </div>

                    {/* Navigation Links (UX Fix) */}
                    <div style={{ display: 'flex', gap: '24px', fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Link href="/builder" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Lớp học</Link>
                        <Link href="/builder" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Bài giảng</Link>
                        <Link href="/builder" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Kiểm tra</Link>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <AuthButton />
                </div>
            </nav>

            {/* HERO SECTION */}
            <section style={{ 
                padding: '180px 40px 100px 40px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', textAlign: 'center', position: 'relative' 
            }}>
                <div style={{ 
                    position: 'absolute', top: '100px', width: '300px', height: '300px', 
                    background: 'var(--brand-primary)', filter: 'blur(150px)', opacity: 0.1, zIndex: -1 
                }}></div>

                <h1 style={{ 
                    fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.1,
                    letterSpacing: '-0.03em', maxWidth: '1000px', margin: '0 auto 24px auto'
                }}>
                    Học Tin học qua <br/>
                    <span style={{ color: 'var(--brand-primary)' }}>mô phỏng PC thực tế</span>
                </h1>

                <p style={{ 
                    fontSize: '22px', color: 'var(--text-secondary)', maxWidth: '600px', 
                    margin: '0 auto 48px auto', lineHeight: 1.6, fontWeight: 500
                }}>
                    AI hướng dẫn chi tiết • Trải nghiệm 100% Web-based • Không cần cài đặt
                </p>

                {/* Persona-based CTAs (UX Fix) */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/builder">
                        <button style={{ 
                            background: 'var(--brand-primary)', color: '#000', border: 'none', 
                            padding: '16px 36px', borderRadius: '12px', fontSize: '16px', 
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 10px 20px rgba(0, 198, 174, 0.2)'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Tôi là Học sinh
                        </button>
                    </Link>

                    <Link href="/teacher/lessons">
                        <button style={{ 
                            background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', 
                            padding: '16px 36px', borderRadius: '12px', fontSize: '16px', 
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Tôi là Giáo viên
                        </button>
                    </Link>
                </div>
            </section>

            {/* TRUST / SOCIAL PROOF SECTION */}
            <section style={{ padding: '0 40px 80px 40px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '24px', textTransform: 'uppercase' }}>
                    Được tin dùng trong giảng dạy tại
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', opacity: 0.6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}><School size={24} /> THPT Chuyên</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}><Users size={24} /> 5,000+ Học sinh</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}><BookOpen size={24} /> Sách KNTT & Cánh Diều</div>
                </div>
            </section>

            {/* STATS SECTION (Typography fix: Sentence case) */}
            <section style={{ padding: '80px 40px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <div style={{ 
                    maxWidth: '1200px', margin: '0 auto', display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>50+</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.02em' }}>Linh kiện chi tiết</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>10+</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.02em' }}>Nhiệm vụ thử thách</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>100%</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.02em' }}>Nền tảng Web-based</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '8px' }}>99%</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.02em' }}>Độ chính xác kỹ thuật</div>
                    </div>
                </div>
            </section>

            {/* SHOWCASE SECTION */}
            <section style={{ padding: '120px 40px', background: 'var(--bg-base)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>Mô phỏng trực quan, <br/>kết quả thực tế</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>
                            Không chỉ là lắp ráp, hệ thống giả lập chi tiết các thông số kỹ thuật như điện năng tiêu thụ (TDP), kích thước vật lý, và khả năng tương thích của từng linh kiện.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Zap size={20} color="var(--brand-primary)" />
                                <span style={{ fontWeight: 500 }}>Tính toán điện năng (TDP) thời gian thực</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ShieldCheck size={20} color="var(--brand-primary)" />
                                <span style={{ fontWeight: 500 }}>Kiểm tra tương thích socket & kích thước Case</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Sparkles size={20} color="var(--brand-primary)" />
                                <span style={{ fontWeight: 500 }}>Trợ lý AI phân tích và sửa lỗi cấu hình</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            position: 'absolute', inset: '-20px', background: 'var(--brand-primary)', 
                            opacity: 0.1, filter: 'blur(40px)', borderRadius: '24px' 
                        }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <img 
                                src="/showcase.png" 
                                alt="Giao diện phần mềm mô phỏng lắp ráp PC Master Builder" 
                                style={{ width: '100%', borderRadius: '20px', border: '1px solid var(--border-default)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
                            />
                            {/* Showcase Caption / Annotation */}
                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'var(--bg-elevated)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--brand-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-light)' }}></div>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Giao diện Lab thực hành 2D</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '40px', marginBottom: '24px', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                    © 2026 PC Master Builder LMS. All rights reserved.
                </p>
                <div style={{ 
                    display: 'inline-block', padding: '4px 12px', borderRadius: '100px', background: 'var(--border-subtle)',
                    color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, marginTop: '16px'
                }}>
                    AI YOUNG GURU 2026 SUBMISSION
                </div>
            </footer>
        </div>
    );
}
