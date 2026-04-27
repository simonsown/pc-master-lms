'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, MousePointer2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* NAV */}
            <nav style={{ 
                height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '0 40px', borderBottom: '1px solid var(--border-subtle)',
                position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(12, 15, 20, 0.8)',
                backdropFilter: 'blur(12px)', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '32px' }} />
                    <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
                        PC MASTER <span style={{ color: 'var(--brand-primary)' }}>BUILDER</span>
                    </span>
                </div>
                <Link href="/builder">
                    <button style={{ 
                        background: 'var(--brand-primary)', color: 'white', border: 'none', 
                        padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                        transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Vào Ứng Dụng <ArrowRight size={18} />
                    </button>
                </Link>
            </nav>

            {/* HERO SECTION */}
            <section className="hero-grid" style={{ 
                padding: '160px 40px 100px 40px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', textAlign: 'center', position: 'relative' 
            }}>
                <div style={{ 
                    position: 'absolute', top: '100px', width: '300px', height: '300px', 
                    background: 'var(--brand-primary)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 
                }}></div>
                
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '8px', 
                    padding: '6px 12px', borderRadius: '100px', background: 'var(--brand-subtle)',
                    border: '1px solid var(--brand-primary)', color: 'var(--brand-light)',
                    fontSize: '13px', fontWeight: 600, marginBottom: '32px'
                }}>
                    <Sparkles size={14} /> AI YOUNG GURU 2026 SUBMISSION
                </div>

                <h1 style={{ 
                    fontSize: 'clamp(40px, 8vw, 84px)', fontWeight: 800, lineHeight: 1,
                    letterSpacing: '-0.04em', maxWidth: '1000px', margin: '0 auto 24px auto'
                }}>
                    Khai Phá Sức Mạnh <br/>
                    <span style={{ color: 'var(--brand-primary)' }}>Lắp Ráp PC Với AI</span>
                </h1>

                <p style={{ 
                    fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', 
                    margin: '0 auto 48px auto', lineHeight: 1.6
                }}>
                    Trải nghiệm trình mô phỏng phần cứng máy tính thế hệ mới. 
                    Học tập, thi đấu và sáng tạo cấu hình đỉnh cao ngay trên trình duyệt.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link href="/builder">
                        <button style={{ 
                            background: 'white', color: 'black', border: 'none', 
                            padding: '16px 36px', borderRadius: '12px', fontSize: '18px', 
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(255,255,255,0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            Bắt Đầu Ngay
                        </button>
                    </Link>
                </div>
            </section>

            {/* STATS SECTION */}
            <section style={{ padding: '80px 40px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ 
                    maxWidth: '1200px', margin: '0 auto', display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="stat-number">50+</div>
                        <div className="stat-label">LINH KIỆN CHI TIẾT</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="stat-number">10+</div>
                        <div className="stat-label">NHIỆM VỤ THỬ THÁCH</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="stat-number">2D</div>
                        <div className="stat-label">GIAO DIỆN HIỆN ĐẠI</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="stat-number">99%</div>
                        <div className="stat-label">ĐỘ CHÍNH XÁC KỸ THUẬT</div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section style={{ padding: '120px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>Công Nghệ Đột Phá</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Tích hợp những công nghệ web tiên tiến nhất cho giáo dục.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        <div className="feature-card">
                            <div className="icon-wrapper" style={{ marginBottom: '24px' }}><MousePointer2 /></div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Hand Tracking</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Điều khiển linh kiện ảo bằng chính đôi tay của bạn thông qua Webcam. Cảm giác tương tác chân thực không cần chuột.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-wrapper" style={{ marginBottom: '24px' }}><Sparkles /></div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>AI Guru Assistant</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Trợ lý ảo AI thông minh luôn sẵn sàng giải đáp thắc mắc và hướng dẫn bạn trong suốt quá trình lắp ráp.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-wrapper" style={{ marginBottom: '24px' }}><ShieldCheck /></div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Kiến Thức Chuẩn</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Hệ thống bài giảng và câu hỏi kiểm tra được xây dựng dựa trên kiến thức phần cứng máy tính thực tế.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SHOWCASE SECTION */}
            <section style={{ padding: '120px 40px', background: 'var(--bg-surface)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>Mô Phỏng Trực Quan, <br/>Kết Quả Thực Tế</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>
                            Không chỉ là lắp ráp, chúng tôi giả lập các thông số kỹ thuật như TDP, kích thước, và khả năng tương thích của linh kiện.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Zap size={20} color="var(--brand-primary)" />
                                <span>Tính toán điện năng tiêu thụ (TDP) thời gian thực</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Zap size={20} color="var(--brand-primary)" />
                                <span>Kiểm tra kích thước GPU và Case</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Zap size={20} color="var(--brand-primary)" />
                                <span>Tối ưu hóa ngân sách trong Marketplace</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            position: 'absolute', inset: '-20px', background: 'var(--brand-primary)', 
                            opacity: 0.1, filter: 'blur(40px)', borderRadius: '24px' 
                        }}></div>
                        <img 
                            src="/showcase.png" 
                            alt="Showcase" 
                            style={{ 
                                width: '100%', borderRadius: '20px', border: '1px solid var(--border-default)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1
                            }} 
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '40px', marginBottom: '24px', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    © 2026 PC Master Builder - AI Young Guru Project. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
