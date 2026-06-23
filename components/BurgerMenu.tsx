'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Cpu, ShoppingCart, Users, BrainCircuit, Award, Globe, Sparkles, Menu, Webcam, X, Sun, Moon, FileText, Bell, MessageSquare, User, ArrowRight, History } from 'lucide-react';
import JoinClassModal from './JoinClassModal';

interface NavItem {
  id: string; labelEn: string; labelVn: string; icon: React.ElementType;
  href?: string; mode?: string; onClick?: () => void; badge?: number;
}

interface BurgerMenuProps {
  lang: 'en' | 'vn'; toggleLang: () => void; onStartQuiz: () => void;
  appMode: string; setAppMode: (mode: string) => void;
  webcamMouseEnabled: boolean; setWebcamMouseEnabled: (enabled: boolean) => void;
  trackingSensitivity: number; setTrackingSensitivity: (s: number) => void;
  onToggleAI: () => void; isAIOpen: boolean; theme: string; setTheme: (t: string) => void;
  userName?: string; onShowDashboard?: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ lang, toggleLang, onStartQuiz, appMode, setAppMode, webcamMouseEnabled, setWebcamMouseEnabled, trackingSensitivity, setTrackingSensitivity, onToggleAI, isAIOpen, theme, setTheme, userName, onShowDashboard }) => {
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
                onClick={() => setWebcamMouseEnabled(!webcamMouseEnabled)}>
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
                onChange={e => setTrackingSensitivity(parseFloat(e.target.value))}
                className="custom-slider"
                style={{ background: `linear-gradient(to right, var(--brand-primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%)` }} />
            </div>
          </div>

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
              { id: 'notifications', icon: Bell, label: lang === 'en' ? 'Notifications' : 'Thông Báo', href: '/notifications' },
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
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{ background: '#1a2f53', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', color: '#fff', position: 'relative' }}>
            <button onClick={() => setShowCredits(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: '0 0 24px', fontSize: '22px', textAlign: 'center', fontWeight: 700 }}>
              {lang === 'en' ? 'CREDITS' : 'TÁC GIẢ'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Dự Án:</strong> PC Master Builder</p>
              <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Developer:</strong> Nguyễn Phúc Khánh Sơn</p>
              <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Thành viên:</strong></p>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Đặng Quốc An</li>
                <li>Nguyễn Phạm Gia Khiêm</li>
                <li>Ngô Minh Khang</li>
              </ul>
              <p style={{ margin: 0 }}><strong style={{ color: '#fff' }}>Giáo viên HD:</strong> Trần Minh Phụng</p>
              <p style={{ margin: '8px 0 0', fontStyle: 'italic', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                Cảm ơn bạn đã trải nghiệm PC Master Builder!
              </p>
            </div>
          </div>
        </div>
      )}
      <JoinClassModal isOpen={showJoinClass} onClose={() => setShowJoinClass(false)} lang={lang} />
    </>
  );
};

export default BurgerMenu;
