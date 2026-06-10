'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Zap, MonitorPlay, Wrench, Bot, HelpCircle, ChevronDown, BookOpen, Users, School, LogIn, UserPlus, GraduationCap, Menu, X, ChevronRight, BarChart3, Award, Clock, PlayCircle, FileText, MessageSquare, Bell } from 'lucide-react';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        supabase.from('profiles').select('role, full_name').eq('id', u.id).single().then(({ data: p }) => setProfile(p));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
    router.push('/');
  };

  const dashboardUrl = profile?.role === 'teacher' ? '/teacher' : profile?.role === 'admin' ? '/admin' : '/builder';

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav className="landing-nav" style={{
        height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: '1px solid var(--border-default)',
        position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--bg-surface)',
        zIndex: 10000, boxShadow: '0 1px 3px 0 var(--shadow-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <img src="/logo.png" alt="" style={{ width: '36px', height: '36px' }} />
            <span className="landing-nav-logo" style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
              PC<span style={{ color: 'var(--brand-primary)' }}> MASTER</span> BUILDER
            </span>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', gap: '8px', fontWeight: 500, fontSize: '14px', alignItems: 'center' }}>
            <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}>
              Về chúng tôi
            </Link>
            <Link href="/builder" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}>
              Thực hành
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <Link href={dashboardUrl} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-subtle)', border: '1px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                  <UserPlus size={16} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>
              <button onClick={handleLogout} className="lms-btn lms-btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="lms-btn lms-btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  <LogIn size={16} /> Đăng nhập
                </button>
              </Link>
              <Link href="/register">
                <button className="lms-btn lms-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  <UserPlus size={16} /> Đăng ký
                </button>
              </Link>
            </>
          )}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-hamburger-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '8px' }}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div style={{
        position: 'fixed', top: '72px', left: 0, right: 0, background: 'var(--bg-surface)', zIndex: 9999,
        borderBottom: '1px solid var(--border-default)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        transform: mobileMenu ? 'translateY(0)' : 'translateY(-100%)',
        opacity: mobileMenu ? 1 : 0,
        pointerEvents: mobileMenu ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease'
      }}>
        <Link href="/about" style={{ padding: '12px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }} onClick={() => setMobileMenu(false)}>Về chúng tôi</Link>
        <Link href="/builder" style={{ padding: '12px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }} onClick={() => setMobileMenu(false)}>Thực hành</Link>
      </div>

      {/* HERO */}
      <section className="hero-grid landing-hero" style={{ padding: '140px 32px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span className="lms-tag lms-tag-green"><Sparkles size={14} /> AI hướng dẫn chi tiết</span>
            <span className="lms-tag lms-tag-blue"><MonitorPlay size={14} /> 100% Web-based</span>
            <span className="lms-tag">Không cần cài đặt</span>
          </div>

          <h1 className="animate-fade-in-up animate-delay-1" style={{
            fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.03em', margin: '0 auto 20px auto', color: 'var(--text-primary)'
          }}>
            Học Tin học qua <span style={{ color: 'var(--brand-primary)' }}>mô phỏng PC thực tế</span>
          </h1>

          <p className="animate-fade-in-up animate-delay-2" style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: 1.6, fontWeight: 500 }}>
            AI hướng dẫn chi tiết • Trải nghiệm 100% Web-based • Không cần cài đặt
          </p>

          <div className="animate-fade-in-up animate-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/builder">
              <button className="lms-btn lms-btn-primary" style={{ padding: '14px 32px', fontSize: '15px', fontWeight: 700 }}>
                <GraduationCap size={20} /> Tôi là Học sinh
              </button>
            </Link>
            <Link href="/teacher/lessons">
              <button className="lms-btn lms-btn-outline" style={{ padding: '14px 32px', fontSize: '15px', fontWeight: 600 }}>
                <BookOpen size={20} /> Tôi là Giáo viên
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="animate-fade-in-up animate-delay-4" style={{ padding: '0 32px', marginTop: '-20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 32px', boxShadow: '0 1px 3px 0 var(--shadow-color)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { icon: <School size={20} style={{ color: 'var(--accent-blue)' }} />, text: 'THPT Chuyên' },
              { icon: <Users size={20} style={{ color: 'var(--brand-primary)' }} />, text: '5,000+ Học sinh' },
              { icon: <FileText size={20} style={{ color: 'var(--accent-amber)' }} />, text: 'Sách KNTT & Cánh Diều' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="animate-fade-in-up animate-delay-5 landing-section" style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div className="landing-stats-grid" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {[
            { num: '50+', label: 'Linh kiện chi tiết', color: 'var(--brand-primary)' },
            { num: '10+', label: 'Nhiệm vụ thử thách', color: 'var(--brand-primary)' },
            { num: '100%', label: 'Nền tảng Web-based', color: 'var(--accent-blue)' },
            { num: '99%', label: 'Độ chính xác kỹ thuật', color: 'var(--accent-amber)' },
          ].map((s, i) => (
            <div key={i} className="lms-card" style={{ padding: '28px 20px', animation: `fadeInUp 0.5s ease ${0.5 + i * 0.1}s both` }}>
              <div className="stat-number" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section" style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Mô phỏng trực quan, kết quả thực tế</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Không chỉ là lắp ráp, hệ thống giả lập chi tiết các thông số kỹ thuật của từng linh kiện.
            </p>
          </div>

          <div className="landing-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <Zap size={22} />, text: 'Tính toán điện năng (TDP) thời gian thực', color: 'var(--accent-amber)' },
                { icon: <ShieldCheck size={22} />, text: 'Kiểm tra tương thích socket & kích thước Case', color: 'var(--brand-primary)' },
                { icon: <Sparkles size={22} />, text: 'Trợ lý AI phân tích và sửa lỗi cấu hình', color: 'var(--accent-blue)' },
              ].map((f, i) => (
                <div key={i} className="lms-card animate-slide-left" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', animationDelay: `${0.7 + i * 0.15}s` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: i === 0 ? 'rgba(255,163,0,0.1)' : i === 1 ? 'var(--brand-subtle)' : 'rgba(40,156,249,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '15px' }}>{f.text}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chi tiết và chính xác từng thông số kỹ thuật</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="animate-slide-right" style={{ animationDelay: '1s' }}>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-default)', boxShadow: '0 4px 12px -2px var(--shadow-color)' }}>
                <img src="/showcase.png" alt="Giao diện phần mềm mô phỏng lắp ráp PC Master Builder" style={{ width: '100%', borderRadius: '8px' }} />
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span className="lms-tag lms-tag-green"><PlayCircle size={14} /> Giao diện Lab thực hành 2D</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="landing-section-wide" style={{ padding: '80px 32px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Hướng dẫn sử dụng</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Bắt đầu hành trình trở thành chuyên gia lắp ráp PC chỉ với 4 bước đơn giản.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { icon: <GraduationCap size={28} style={{ color: 'var(--brand-primary)' }} />, step: '01', title: 'Chọn Vai Trò', desc: 'Đăng nhập và chọn vai trò Học sinh hoặc Giáo viên để truy cập không gian làm việc phù hợp.' },
              { icon: <MonitorPlay size={28} style={{ color: 'var(--accent-blue)' }} />, step: '02', title: 'Tham Gia Lớp Học', desc: 'Khám phá lộ trình học tập, xem các bài giảng lý thuyết và làm quen với các linh kiện máy tính.' },
              { icon: <Wrench size={28} style={{ color: 'var(--accent-amber)' }} />, step: '03', title: 'Thực Hành Lắp Ráp', desc: 'Sử dụng PC Lab 2D để tự tay lắp ráp linh kiện, kiểm tra độ tương thích và tính toán TDP.' },
              { icon: <Bot size={28} style={{ color: 'var(--info)' }} />, step: '04', title: 'Nhận Hỗ Trợ Từ AI', desc: 'Hỏi đáp trực tiếp với AI Guru bất cứ lúc nào bạn gặp khó khăn.' },
            ].map((item, i) => (
              <div key={i} className="lms-card" style={{ textAlign: 'center', padding: '32px 24px', animation: `fadeInUp 0.5s ease ${0.1 * i}s both` }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '16px' }}>{item.step}</div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Câu hỏi thường gặp</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Giải đáp những thắc mắc phổ biến về PC Master Builder Edu.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { q: 'Tôi có cần cài đặt phần mềm nào để sử dụng không?', a: 'Không. PC Master Builder Edu là nền tảng 100% Web-based. Bạn chỉ cần một trình duyệt web hiện đại (Chrome, Edge, Safari...) và kết nối internet.' },
              { q: 'Hệ thống AI Guru có thể giúp gì cho tôi?', a: 'AI Guru hoạt động như một trợ giảng 24/7. Nó có thể giải thích chi tiết về các linh kiện, hướng dẫn bạn cách lắp ráp đúng chuẩn, và phân tích các lỗi tương thích phần cứng.' },
              { q: 'Sản phẩm có hỗ trợ thực hành trên điện thoại di động không?', a: 'Các bài giảng lý thuyết và trắc nghiệm có thể xem tốt trên điện thoại. Tuy nhiên, để có trải nghiệm tốt nhất với phòng Lab mô phỏng lắp ráp (kéo thả linh kiện), chúng tôi khuyến khích bạn sử dụng Máy tính (PC/Laptop).' },
              { q: 'Giáo viên có thể theo dõi tiến độ của học sinh không?', a: 'Có. Chúng tôi cung cấp Dashboard dành riêng cho Giáo viên, cho phép tạo lớp học, theo dõi tiến độ hoàn thành bài giảng và kết quả kiểm tra của từng học sinh.' },
              { q: 'Nội dung có bám sát sách giáo khoa không?', a: 'Có. Các bài giảng được thiết kế bám sát chương trình Tin học THPT theo sách Kết nối Tri thức và Cánh Diều của Bộ Giáo dục và Đào tạo.' },
            ].map((faq, i) => (
              <div key={i} className="lms-card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease' }} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {faq.q}
                  <ChevronDown size={20} style={{
                    color: 'var(--text-muted)',
                    transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0
                  }} />
                </div>
                <div style={{
                  overflow: 'hidden',
                  maxHeight: activeFaq === i ? '300px' : '0',
                  transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
                  opacity: activeFaq === i ? 1 : 0,
                  padding: activeFaq === i ? '0 24px 20px' : '0 24px',
                }}>
                  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-section" style={{ padding: '60px 32px 40px', textAlign: 'center', borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px', textAlign: 'left' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <img src="/logo.png" alt="" style={{ width: '32px', height: '32px' }} />
                <span style={{ fontWeight: 700, fontSize: '16px' }}>PC Master Builder</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Ứng dụng học tập tin học và lắp ráp máy tính với công nghệ AI.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px', color: 'var(--text-primary)' }}>Sản phẩm</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/builder" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thực hành</Link>
                <Link href="/about" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Về chúng tôi</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px', color: 'var(--text-primary)' }}>Hỗ trợ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Email: phuckhanhsonnguyen@gmail.com</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hotline: 0772934951</span>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 PC Master Builder. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="lms-tag" style={{ fontSize: '10px', padding: '2px 8px' }}>AI YOUNG GURU 2026</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 769px) { .desktop-nav { display: flex !important; } .mobile-hamburger-btn { display: none !important; } }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger-btn { display: flex !important; }
          .landing-nav { padding: 0 16px !important; }
          .landing-nav-logo span { font-size: 14px !important; }
          .landing-hero { padding: 120px 16px 60px !important; }
          .landing-section { padding: 40px 16px !important; }
          .landing-section-wide { padding: 40px 16px !important; }
          .landing-features-grid { grid-template-columns: 1fr !important; }
          .landing-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .landing-nav { padding: 0 12px !important; }
          .landing-hero { padding: 100px 12px 40px !important; }
          .landing-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
