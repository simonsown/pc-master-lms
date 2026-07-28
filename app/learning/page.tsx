'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, Play, ArrowLeft, CheckCircle2, Lock, ShieldCheck, Zap, X, Crown, Building, UserCheck } from 'lucide-react';
import PCourseViewer from '@/components/PCourseViewer';
import SlideViewer from '@/components/SlideViewer';

// Import video lessons list
const VIDEO_LESSONS = [
  {
    id: 'mb-3d-1',
    youtubeId: 'XkoM-rkX1uE',
    title: 'Mô phỏng 3D Cấu tạo & Chức năng Bo Mạch Chủ (Mainboard) - Tập 1',
    category: 'Bo Mạch Chủ',
    duration: '14:25',
    level: 'Cơ bản',
  },
  {
    id: 'mb-3d-2',
    youtubeId: 'lwaQ8D8hwTY',
    title: 'Nguyên lý hoạt động Bus & Chipset trên Bo Mạch Chủ PC 3D',
    category: 'Bo Mạch Chủ',
    duration: '11:40',
    level: 'Trung cấp',
  },
  {
    id: 'mb-3d-3',
    youtubeId: 'TsB2H1QPrCI',
    title: 'Sơ đồ đường mạch & Mạch điện VRM trên Bo Mạch Chủ Máy Tính',
    category: 'Bo Mạch Chủ',
    duration: '09:50',
    level: 'Nâng cao',
  },
  {
    id: 'cpu-3d-1',
    youtubeId: '_Pqfjer8-O4',
    title: 'Mô phỏng 3D Cấu trúc Bên trong Chip CPU Vi Xử Lý',
    category: 'Vi Xử Lý CPU',
    duration: '15:10',
    level: 'Cơ bản',
  },
  {
    id: 'gpu-3d-1',
    youtubeId: 'h9Z4oGN89MU',
    title: 'Mô phỏng 3D Cấu tạo Card Đồ Họa rời (VGA / GPU)',
    category: 'Card Đồ Họa GPU',
    duration: '13:45',
    level: 'Cơ bản',
  },
];

export default function LearningHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'course' | 'video' | 'slide'>('course');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check VIP status on mount
  useEffect(() => {
    try {
      const unlocked = localStorage.getItem('pcm_unlocked_pro') === 'true';
      setIsUnlocked(unlocked);
    } catch {
      setIsUnlocked(false);
    }
  }, []);

  const handleAutoPay = () => {
    try {
      localStorage.setItem('pcm_unlocked_pro', 'true');
      setIsUnlocked(true);
      setShowPricingModal(false);
      setToastMessage('🎉 Thanh toán tự động 0đ thành công! Đã kích hoạt gói Premium Miễn phí.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const currentVideo = VIDEO_LESSONS[activeVideoIndex];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base, #080910)', color: 'var(--text-primary, #dde0ed)', fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', padding: '14px 20px', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
          fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage}
        </div>
      )}

      {/* Top Header Navigation */}
      <header style={{
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'var(--bg-surface, #0f1018)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary, #fff)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ArrowLeft size={16} /> Quay lại Trang Chủ
          </button>

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            📚 THƯ VIỆN HỌC TẬP <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }}>PRO</span>
          </span>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'course', label: 'Khóa học', icon: <BookOpen size={16} />, badge: 'Free 3 bài' },
            { id: 'video', label: 'Video Bài Giảng', icon: <Sparkles size={16} />, badge: 'Free 2 vid' },
            { id: 'slide', label: 'Slide Bài Học 3D', icon: <Play size={16} />, badge: 'Free 1 slide' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #00d4aa, #00aaff)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--text-muted, #94a3b8)',
                transition: 'all 0.2s', fontFamily: 'inherit'
              }}
            >
              {tab.icon} {tab.label}
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 99,
                background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.6)'
              }}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Unlock Status / Upgrade button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isUnlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 12, fontWeight: 700 }}>
              <Crown size={14} /> Gói Premium Đã Kích Hoạt
            </div>
          ) : (
            <button
              onClick={() => setShowPricingModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 800,
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)', transition: 'all 0.2s'
              }}
            >
              <Zap size={16} /> Nâng cấp Gói Doanh Nghiệp / Cá Nhân
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: activeTab === 'slide' ? 0 : '24px' }}>
        {/* TAB 1: KHÓA HỌC */}
        {activeTab === 'course' && (
          <div>
            <div style={{ maxWidth: 1000, margin: '0 auto 20px', padding: '16px 20px', borderRadius: 12, background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen style={{ color: '#00d4aa' }} size={20} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Giáo trình Kỹ thuật Phần cứng PC (20 Chương)</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)', marginLeft: 10 }}>Chế độ xem thử: 3 bài học đầu miễn phí.</span>
                </div>
              </div>
              {!isUnlocked && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#00d4aa', color: '#000', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}
                >
                  Xem Bảng Giá
                </button>
              )}
            </div>
            <PCourseViewer onBack={() => router.push('/')} isUnlocked={isUnlocked} onRequestUpgrade={() => setShowPricingModal(true)} />
          </div>
        )}

        {/* TAB 2: VIDEO BÀI GIẢNG 3D */}
        {activeTab === 'video' && (
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles style={{ color: '#3b82f6' }} size={20} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Thư viện 19 Video 3D Animation Linh Kiện PC</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)', marginLeft: 10 }}>Miễn phí 2 video đầu tiên. Từ video thứ 3 cần gói cước.</span>
                </div>
              </div>
              {!isUnlocked && (
                <button onClick={() => setShowPricingModal(true)} style={{ padding: '6px 12px', borderRadius: 6, background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  Nâng cấp Gói
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
              {/* Video Player */}
              <div>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                  {activeVideoIndex >= 2 && !isUnlocked ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: 'linear-gradient(145deg, #0f172a, #1e1b4b)' }}>
                      <Lock size={48} style={{ color: '#f59e0b', marginBottom: 16 }} />
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Video Bài Giảng Đã Bị Khóa</h3>
                      <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 420, margin: '0 0 20px', lineHeight: 1.6 }}>
                        Bạn đã xem hết 2 video miễn phí. Vui lòng nâng cấp Gói Cá Nhân (55k/tháng) hoặc Gói Trường Học (32k/học sinh) để xem tiếp.
                      </p>
                      <button
                        onClick={() => setShowPricingModal(true)}
                        style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
                      >
                        ⚡ Mở Khóa Ngay (Tự Động 0đ)
                      </button>
                    </div>
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                      title={currentVideo.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>

                <div style={{ marginTop: 16, padding: 20, borderRadius: 14, background: 'var(--bg-surface, #0f1018)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', marginBottom: 8, display: 'inline-block' }}>
                    {currentVideo.category} • {currentVideo.duration}
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 8px' }}>{currentVideo.title}</h2>
                  <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    Mô phỏng đồ họa 3D chuẩn xác về cấu tạo phần cứng, hỗ trợ học tập trực quan sinh động.
                  </p>
                </div>
              </div>

              {/* Video List Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Danh sách Video 3D ({VIDEO_LESSONS.length})
                </h4>
                {VIDEO_LESSONS.map((vid, idx) => {
                  const isLockedVideo = idx >= 2 && !isUnlocked;
                  const isActiveVid = idx === activeVideoIndex;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideoIndex(idx)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isActiveVid ? 'rgba(0,212,170,0.12)' : 'var(--bg-surface, #0f1018)',
                        border: `1px solid ${isActiveVid ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                        opacity: isLockedVideo ? 0.7 : 1
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isLockedVideo ? 'rgba(245,158,11,0.15)' : isActiveVid ? '#00d4aa' : 'rgba(255,255,255,0.06)',
                        color: isLockedVideo ? '#f59e0b' : isActiveVid ? '#000' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12
                      }}>
                        {isLockedVideo ? <Lock size={14} /> : idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isActiveVid ? '#00d4aa' : '#fff' }}>
                          {vid.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>
                          {vid.duration} {idx < 2 ? '• Free' : '• Pro'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SLIDE BÀI HỌC 3D */}
        {activeTab === 'slide' && (
          <div>
            <SlideViewer onBack={() => router.push('/')} isUnlocked={isUnlocked} onRequestUpgrade={() => setShowPricingModal(true)} />
          </div>
        )}
      </main>

      {/* PRICING & ENTERPRISE UPGRADE MODAL */}
      {showPricingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 99999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f1018 100%)',
            borderRadius: 24, padding: 32, maxWidth: 840, width: '100%', color: '#fff',
            position: 'relative', border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 80px rgba(245,158,11,0.15)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setShowPricingModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: 99, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                ⚡ NÂNG CẤP GÓI CƯỚC CÁ NHÂN & TRƯỜNG HỌC
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Mở Khóa Toàn Bộ Bài Học & Video 3D</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                Học không giới hạn 20 chương khóa học, 19 video 3D và slide tương tác.
              </p>
            </div>

            {/* Pricing cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 28 }}>
              {/* Free Plan */}
              <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#94a3b8' }}>Gói Dùng Thử</h4>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                  0đ <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>/ miễn phí</span>
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Mở 3 bài đầu Khóa học</li>
                  <li>Mở 2 Video bài giảng 3D</li>
                  <li>Mở 1 Slide bài học 3D</li>
                </ul>
              </div>

              {/* Personal Plan */}
              <div style={{ padding: 24, borderRadius: 16, background: 'rgba(0,212,170,0.06)', border: '2px solid #00d4aa', position: 'relative', transform: 'scale(1.02)' }}>
                <div style={{ position: 'absolute', top: -12, right: 16, padding: '2px 10px', borderRadius: 99, background: '#00d4aa', color: '#000', fontSize: 10, fontWeight: 800 }}>
                  KHUYÊN DÙNG
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#00d4aa' }}>Gói Cá Nhân Pro</h4>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                  55.000đ <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>/ tháng</span>
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li><strong>Mở khóa 100%</strong> khóa học 20 chương</li>
                  <li><strong>Xem full 19 video 3D</strong> animation</li>
                  <li><strong>Toàn bộ Slide 3D</strong> tương tác</li>
                  <li>Lưu tiến trình học cá nhân</li>
                </ul>
              </div>

              {/* Enterprise / School Plan */}
              <div style={{ padding: 24, borderRadius: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#818cf8' }}>Gói Trường Học & Doanh Nghiệp</h4>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  32.000đ
                </div>
                <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 16 }}>
                  bình quân / học sinh / tháng
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Tài khoản Quản lý cho Giáo viên</li>
                  <li>Tất cả quyền lợi Gói Cá Nhân Pro</li>
                  <li>Xuất báo cáo tiến độ học sinh</li>
                  <li>Hỗ trợ kỹ thuật 24/7</li>
                </ul>
              </div>
            </div>

            {/* Instant Auto-Payment 0đ Button */}
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: 20, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                🎁 Dành cho Giám khảo & Người thử nghiệm
              </div>
              <button
                onClick={handleAutoPay}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', color: '#fff', fontWeight: 800, fontSize: 16,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 6px 24px rgba(16,185,129,0.4)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Zap size={20} /> ⚡ TỰ ĐỘNG KÍCH HOẠT MIỄN PHÍ 0Đ (AUTO PAYMENT)
              </button>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                Tự động nhận tiền & nâng cấp tài khoản thành công ngay lập tức không tốn phí.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
