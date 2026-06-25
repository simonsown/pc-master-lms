'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Cpu, ShoppingCart, Users, BrainCircuit, Award, Globe, Sparkles, Menu, Webcam, X, Sun, Moon, FileText, MessageSquare, User, ArrowRight, History, Trophy, CheckCircle2, Flame, Zap } from 'lucide-react';
import JoinClassModal from './JoinClassModal';
import { useRealtime } from '@/lib/realtime-provider';

interface NavItem {
  id: string; labelEn: string; labelVn: string; icon: React.ElementType;
  href?: string; mode?: string; onClick?: () => void; badge?: number;
}

interface BurgerMenuProps {
  lang: 'en' | 'vn'; toggleLang: () => void; onStartQuiz: () => void;
  appMode: string; setAppMode: (mode: string) => void;
  webcamMouseEnabled?: boolean; setWebcamMouseEnabled?: (enabled: boolean) => void;
  trackingSensitivity?: number; setTrackingSensitivity?: (s: number) => void;
  onToggleAI: () => void; isAIOpen: boolean; theme: string; setTheme: (t: string) => void;
  userName?: string; onShowDashboard?: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ lang, toggleLang, onStartQuiz, appMode, setAppMode, webcamMouseEnabled = false, setWebcamMouseEnabled, trackingSensitivity = 1.0, setTrackingSensitivity, onToggleAI, isAIOpen, theme, setTheme, userName, onShowDashboard }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [hasClass, setHasClass] = useState(false);
  const unreadCount = 0;

  useEffect(() => {
    const checkClass = async () => {
      try {
        const { createBrowserClient } = require('@supabase/ssr');
        const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('class_id, school_id').eq('id', user.id).single();
          if (profile?.class_id || profile?.school_id) setHasClass(true);
        }
      } catch (e) { console.error(e); }
    };
    checkClass();
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [appMode]);

  const navItemStyle = (id: string, isActive: boolean): React.CSSProperties => ({
    padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer',
    background: isActive ? 'rgba(8,158,96,0.15)' : hoveredBtn === id ? 'rgba(255,255,255,0.06)' : 'transparent',
    border: 'none', borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
    transition: 'all 150ms ease', width: '100%',
    color: isActive ? '#fff' : hoveredBtn === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
    fontWeight: isActive ? 700 : 500, fontSize: '13px', textAlign: 'left', fontFamily: 'inherit'
  });

  const iconStyle = (id: string, isActive: boolean): React.CSSProperties => ({
    color: isActive ? 'var(--brand-primary)' : hoveredBtn === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
    width: '18px', height: '18px', transition: 'all 150ms ease', flexShrink: 0
  });

  const percent = ((trackingSensitivity - 0.5) / 2.5) * 100;

  return (
    <>
      <button className="mobile-hamburger" onClick={() => setIsMobileOpen(true)}
        style={{ position: 'fixed', top: '16px', left: '16px', width: '40px', height: '40px',
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer' }}>
        <Menu size={20} />
      </button>

      <div className="mobile-backdrop"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 180, opacity: isMobileOpen ? 1 : 0,
          pointerEvents: isMobileOpen ? 'auto' : 'none', transition: 'opacity 250ms ease-out' }}
        onClick={() => setIsMobileOpen(false)} />

      <div className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}>
        <div style={{ height: '60px', padding: '0 16px', display: 'flex', alignItems: 'center', flexShrink: 0, justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
              PC Master <span style={{ color: 'var(--brand-primary)' }}>Builder</span>
            </span>
          </Link>
          <div style={{ fontSize: '10px', background: 'rgba(8,158,96,0.15)', color: 'var(--brand-primary)', borderRadius: '4px', padding: '2px 8px', fontWeight: 600 }}>V1.0</div>
        </div>

        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); if (onShowDashboard) onShowDashboard(); }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), #289cf9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={14} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || (lang === 'en' ? 'Guest' : 'Khách')}</div>
            <div style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 500 }}>{lang === 'en' ? 'View Dashboard' : 'Xem bảng điều khiển'}</div>
          </div>
          <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 16px', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
          <div style={{ padding: '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '12px 0 6px 0' }}>
              {lang === 'en' ? 'Explore' : 'Khám phá'}
            </div>
            {[
              { id: 'course', icon: BookOpen, label: lang === 'en' ? 'Lecture Course' : 'Bài Giảng', onClick: () => setAppMode('course') },

              { id: 'history', icon: History, label: lang === 'en' ? 'Learning History' : 'Lịch Sử Học Tập', href: '/student/history' },
              { id: 'learning', icon: Cpu, label: lang === 'en' ? 'Practice Mode' : 'Luyện Tập', onClick: () => setAppMode('learning') },
              { id: 'market', icon: ShoppingCart, label: lang === 'en' ? 'Marketplace' : 'Chợ Máy Tính', onClick: () => setAppMode('market') },
              { id: 'exams', icon: Award, label: lang === 'en' ? 'Exams' : 'Kỳ Thi', onClick: () => setAppMode('exams') },
              { id: 'multiplayer', icon: Users, label: lang === 'en' ? '2-Player Versus' : '2 Người Chơi', onClick: () => setAppMode('multiplayer') },
            ].map(item => {
              const active = item.onClick ? appMode === item.id : false;
              const content = (
                <button onMouseEnter={() => setHoveredBtn(item.id)} onMouseLeave={() => setHoveredBtn(null)}
                  onClick={item.onClick} style={navItemStyle(item.id, active)}>
                  <item.icon style={iconStyle(item.id, active)} />
                  {item.label}
                </button>
              );
              return item.href ? <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
            })}

            {/* Quest Widget */}
            <QuestWidgetSection lang={lang} />
          </div>

          <div style={{ padding: '8px 16px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '12px 0 6px 0' }}>
              {lang === 'en' ? 'Assessment' : 'Đánh giá'}
            </div>
            {[
              { id: 'quiz_bank', icon: FileText, label: lang === 'en' ? 'Quiz Bank' : 'Ngân Hàng Đề Thi', href: '/student/quiz' },

              { id: 'certificates', icon: Award, label: lang === 'en' ? 'Certificates' : 'Chứng Chỉ', href: '/student/certificates' },
            ].map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}
                onMouseEnter={() => setHoveredBtn(item.id)} onMouseLeave={() => setHoveredBtn(null)}>
                <div style={navItemStyle(item.id, false)}>
                  <item.icon style={iconStyle(item.id, false)} />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          {typeof setWebcamMouseEnabled !== 'undefined' && typeof setTrackingSensitivity !== 'undefined' && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '12px 0 6px 0' }}>
              {lang === 'en' ? 'Controls' : 'Điều khiển'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Webcam size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  {lang === 'en' ? 'Hand Tracking' : 'Theo dõi tay'}
                </span>
              </div>
              <div className={`toggle-switch ${webcamMouseEnabled ? 'on' : 'off'}`}
                onClick={() => setWebcamMouseEnabled?.(!webcamMouseEnabled)}>
                <div className="toggle-thumb"></div>
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  {lang === 'en' ? 'Sensitivity' : 'Độ nhạy'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>{trackingSensitivity.toFixed(1)}x</span>
              </div>
              <input type="range" min="0.5" max="3" step="0.1" value={trackingSensitivity}
                onChange={e => setTrackingSensitivity?.(parseFloat(e.target.value))}
                className="custom-slider"
                style={{ background: `linear-gradient(to right, var(--brand-primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%)` }} />
            </div>
          </div>
          )}

          <div style={{ padding: '8px 16px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '12px 0 6px 0' }}>
              {lang === 'en' ? 'Extras' : 'Tính năng khác'}
            </div>
            {!hasClass ? (
              <button onMouseEnter={() => setHoveredBtn('join_class')} onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => setShowJoinClass(true)} style={navItemStyle('join_class', false)}>
                <Users style={iconStyle('join_class', false)} />
                {lang === 'en' ? 'Join Class' : 'Tham gia lớp học'}
              </button>
            ) : (
              <Link href="/student/classes" style={{ textDecoration: 'none' }}
                onMouseEnter={() => setHoveredBtn('my_class')} onMouseLeave={() => setHoveredBtn(null)}>
                <div style={navItemStyle('my_class', false)}>
                  <Users style={iconStyle('my_class', false)} />
                  {lang === 'en' ? 'My Class' : 'Lớp Học Của Tôi'}
                </div>
              </Link>
            )}
            {[
              { id: 'discussion', icon: MessageSquare, label: lang === 'en' ? 'Discussion' : 'Thảo Luận', href: '/student/discussion' },
              { id: 'profile', icon: User, label: lang === 'en' ? 'Profile' : 'Hồ Sơ Cá Nhân', href: '/student/profile' },
              { id: 'about', icon: Users, label: lang === 'en' ? 'About Us' : 'Về chúng tôi', href: '/about' },
            ].map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}
                onMouseEnter={() => setHoveredBtn(item.id)} onMouseLeave={() => setHoveredBtn(null)}>
                <div style={navItemStyle(item.id, false)}>
                  <item.icon style={iconStyle(item.id, false)} />
                  {item.label}
                </div>
              </Link>
            ))}
            <button onMouseEnter={() => setHoveredBtn('quiz')} onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => onStartQuiz()} style={navItemStyle('quiz', false)}>
              <BrainCircuit style={iconStyle('quiz', false)} />
              {lang === 'en' ? 'AI Quiz' : 'AI Trắc Nghiệm'}
            </button>
            <button onMouseEnter={() => setHoveredBtn('credits')} onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => setShowCredits(true)} style={navItemStyle('credits', false)}>
              <Award style={iconStyle('credits', false)} />
              {lang === 'en' ? 'Credits' : 'Tác Giả & Báo Cáo'}
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div onClick={toggleLang} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '14px', cursor: 'pointer', height: '28px' }}>
            <Globe size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: '11px', fontWeight: lang === 'vn' ? 700 : 400, color: lang === 'vn' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.4)' }}>VN</span>
            <div style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: '11px', fontWeight: lang === 'en' ? 700 : 400, color: lang === 'en' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.4)' }}>EN</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); try { localStorage.setItem('theme', next); document.documentElement.setAttribute('data-theme', next) } catch(e) {} }}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={lang === 'en' ? 'Toggle Theme' : 'Đổi giao diện'}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={lang === 'en' ? 'Toggle Effects' : 'Bật/Tắt hiệu ứng'}>
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </div>

      {showCredits && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
          animation: 'creditsFadeIn 0.3s ease' }}>
          <div style={{
            background: 'linear-gradient(145deg, #0f1729 0%, #1a2a4a 50%, #0d1f3c 100%)',
            borderRadius: '24px', padding: '36px', maxWidth: '520px', width: '100%',
            color: '#fff', position: 'relative',
            border: '1px solid rgba(0,212,170,0.15)',
            boxShadow: '0 0 60px rgba(0,212,170,0.08), 0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px',
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
              pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '140px', height: '140px',
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,243,255,0.04) 0%, transparent 70%)',
              pointerEvents: 'none' }} />

            <button onClick={() => setShowCredits(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s', zIndex: 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #00d4aa, #00f3ff)',
                margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', boxShadow: '0 0 30px rgba(0,212,170,0.2)' }}>
                🏆
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' }}>
                {lang === 'en' ? 'CREDITS' : 'TÁC GIẢ & BÁO CÁO'}
              </h2>
              <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, #00d4aa, #00f3ff)', margin: '8px auto', borderRadius: '2px' }} />
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>
                PC Master Builder - v1.0.0
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                  color: 'var(--brand-primary)', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Project Info' : 'Thông tin dự án'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  {[
                    { icon: '📦', label: lang === 'en' ? 'Project' : 'Dự Án', value: 'PC Master Builder' },
                    { icon: '👨‍💻', label: lang === 'en' ? 'Developer' : 'Developer', value: 'Nguyễn Phúc Khánh Sơn' },
                    { icon: '🛠️', label: lang === 'en' ? 'Version' : 'Phiên bản', value: 'V1.0.0' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{item.icon}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', minWidth: '80px', fontSize: '11px' }}>{item.label}</span>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.1)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                  color: '#00d4aa', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Supervisors' : 'Giáo viên hướng dẫn'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { name: 'Trần Minh Phụng', role: lang === 'en' ? 'Lead Supervisor' : 'GVHD Chính', color: '#00d4aa' },
                    { name: 'Đoàn Thụy Kim Phượng', role: lang === 'en' ? 'Co-Supervisor' : 'GVHD', color: '#00f3ff' },
                  ].map((gv, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px',
                      borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px',
                        background: `linear-gradient(135deg, ${gv.color}22, ${gv.color}11)`,
                        border: `1px solid ${gv.color}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                        👩‍🏫
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{gv.name}</div>
                        <div style={{ fontSize: '10px', color: gv.color, fontWeight: 600, letterSpacing: '0.5px' }}>{gv.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                  color: '#818cf8', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Team Members' : 'Thành viên'}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Đặng Quốc An', role: 'Frontend', color: '#818cf8' },
                    { name: 'Nguyễn Phạm Gia Khiêm', role: 'Backend', color: '#f59e0b' },
                    { name: 'Ngô Minh Khang', role: 'UI/UX', color: '#10b981' },
                  ].map((m, i) => (
                    <div key={i} style={{ flex: '1 1 auto', minWidth: '120px', padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{m.name}</div>
                      <div style={{ fontSize: '9px', color: m.color, fontWeight: 600, letterSpacing: '0.5px' }}>{m.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                  color: '#10b981', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Features' : 'Tính năng'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                  {[
                    '🎮 Lắp ráp PC 2D', '🤖 AI Hướng dẫn', '📚 Bài giảng', '🖥️ Mô phỏng Windows',
                    '✋ Theo dõi tay', '🏪 Chợ linh kiện', '👥 2 Người chơi', '📝 Kỳ thi & Quiz',
                    '🏆 Hệ thống XP', '📊 Bảng xếp hạng', '📜 Chứng chỉ', '💬 Diễn đàn',
                    '📱 Responsive', '🌐 Đa ngôn ngữ',
                  ].map((feat, i) => (
                    <div key={i} style={{ padding: '4px 6px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', lineHeight: '1' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '14px',
                background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                  color: '#f59e0b', marginBottom: '8px' }}>
                  Tech Stack
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'MediaPipe', 'Zustand', 'Recharts', 'Lucide'].map((tech, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 600,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.6)' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '12px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(0,243,255,0.06))',
                border: '1px solid rgba(0,212,170,0.12)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  © {new Date().getFullYear()} - THPT Nguyễn Công Trứ
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                  {lang === 'en' ? '"Dare to Think, Dare to Do"' : '"Dám nghĩ, Dám làm"'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <JoinClassModal isOpen={showJoinClass} onClose={() => setShowJoinClass(false)} lang={lang} />
    </>
  );
};

function QuestWidgetSection({ lang }: { lang: 'en' | 'vn' }) {
  const { state: realtimeState } = useRealtime()
  const quests = realtimeState.allQuests.slice(0, 3)
  const userQuests = realtimeState.quests

  return (
    <div style={{ padding: '4px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', marginTop: '4px' }}>
        <Trophy size={12} style={{ color: '#f59e0b' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          {lang === 'en' ? 'Daily Quests' : 'Nhiệm Vụ Hôm Nay'}
        </span>
        <div style={{ marginLeft: 'auto', fontSize: '9px', color: 'var(--brand-primary)', fontWeight: 600 }}>
          Lv.{realtimeState.level}
        </div>
      </div>
      {quests.map((quest, i) => {
        const userQuest = userQuests.find(q => q.quest_id === quest.id)
        const isCompleted = userQuest?.is_completed
        const progress = userQuest?.progress || 0
        return (
          <div key={quest.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 8px', borderRadius: '8px',
            background: isCompleted ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
            marginBottom: '4px', opacity: isCompleted ? 0.6 : 1
          }}>
            <span style={{ fontSize: '14px' }}>{quest.icon || '📌'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: isCompleted ? '#10b981' : 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {quest.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--brand-primary)', fontWeight: 600 }}>+{quest.xp_reward}XP</span>
                {!isCompleted && quest.requirement_value > 0 && (
                  <div style={{ flex: 1, height: '2px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: 'var(--brand-primary)', width: `${Math.min(100, (progress / quest.requirement_value) * 100)}%` }} />
                  </div>
                )}
                {isCompleted && <CheckCircle2 size={10} style={{ color: '#10b981' }} />}
              </div>
            </div>
          </div>
        )
      })}
      <Link href="/student/dashboard" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        padding: '6px', borderRadius: '6px', fontSize: '9px', fontWeight: 600,
        color: 'var(--brand-primary)', textDecoration: 'none', marginTop: '4px',
        background: 'rgba(8,158,96,0.08)'
      }}>
        <Zap size={10} /> {lang === 'en' ? 'View All Tasks' : 'Xem tất cả'} →
      </Link>
    </div>
  )
}

export default BurgerMenu;
