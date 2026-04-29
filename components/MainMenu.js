'use client';

import React, { useState } from 'react';
import { BookOpen, Cpu, ShoppingCart, Users, ArrowRight, Info } from 'lucide-react';
import AuthButton from './AuthButton';

const MainMenu = ({ onStart, lang }) => {
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
                    <AuthButton />
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
