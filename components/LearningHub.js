'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Play, FileText, Lock, ArrowLeft, Zap, Crown, X, CheckCircle, ChevronRight, Users, Building2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PCourseViewer = dynamic(() => import('./PCourseViewer'), { ssr: false });
const SlideViewer = dynamic(() => import('./SlideViewer'), { ssr: false });

const FREE_LIMITS = { course: 3, video: 2, slide: 1 };
const UNLOCK_KEY = 'pcm_unlocked_pro';

function isUnlocked() {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(UNLOCK_KEY) === 'true'; } catch { return false; }
}

/* ────────── PRICING MODAL ────────── */
function PricingModal({ onClose, onUnlock }) {
  const plans = [
    {
      id: 'personal',
      icon: '👤',
      name: 'Cá Nhân',
      price: '55.000đ',
      unit: '/ tháng',
      color: '#00d4aa',
      highlight: false,
      features: ['Toàn bộ khóa học (20 chương)', '19 Video bài giảng 3D', 'Tất cả Slide 3D', 'Không giới hạn luyện tập'],
    },
    {
      id: 'school',
      icon: '🏫',
      name: 'Trường Học / Doanh Nghiệp',
      price: '32.000đ',
      unit: '/ học sinh / tháng',
      color: '#6366f1',
      highlight: true,
      features: ['Tất cả quyền lợi Cá nhân', 'Dashboard quản lý lớp', 'Báo cáo tiến độ học sinh', 'Hỗ trợ ưu tiên 24/7'],
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '560px', width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: '8px', width: '32px', height: '32px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}><X size={16} /></button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '99px',
            background: 'rgba(255,185,0,0.1)', border: '1px solid rgba(255,185,0,0.2)',
            marginBottom: '14px',
          }}>
            <Crown size={14} style={{ color: '#ffb900' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffb900' }}>NÂNG CẤP TÀI KHOẢN</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Mở khóa toàn bộ nội dung học tập
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Chọn gói phù hợp với bạn
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              border: `1.5px solid ${plan.highlight ? plan.color : 'var(--border-default)'}`,
              borderRadius: '14px',
              padding: '20px',
              background: plan.highlight ? `${plan.color}08` : 'var(--bg-elevated)',
              position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff',
                  fontSize: '11px', fontWeight: 700, padding: '2px 12px', borderRadius: '99px',
                }}>PHỔ BIẾN NHẤT</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>{plan.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: plan.color }}>{plan.price}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{plan.unit}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Auto unlock button */}
        <button
          onClick={() => {
            try { localStorage.setItem(UNLOCK_KEY, 'true'); } catch {}
            onUnlock?.();
            onClose();
          }}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
          }}
        >
          <Zap size={16} />
          ⚡ TỰ ĐỘNG KÍCH HOẠT MIỄN PHÍ 0Đ
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', marginBottom: 0 }}>
          Demo — Bấm để mở khóa toàn bộ nội dung ngay lập tức
        </p>
      </div>
    </div>
  );
}

/* ────────── VIDEO LIST ────────── */
const VIDEOS = [
  { id: 1, title: 'Tổng quan kiến trúc máy tính', duration: '8:42', thumb: '🖥️', free: true },
  { id: 2, title: 'CPU - Bộ xử lý trung tâm', duration: '11:20', thumb: '⚙️', free: true },
  { id: 3, title: 'RAM - Bộ nhớ truy cập ngẫu nhiên', duration: '9:05', thumb: '💾', free: false },
  { id: 4, title: 'Mainboard - Bo mạch chủ', duration: '13:15', thumb: '🔌', free: false },
  { id: 5, title: 'GPU - Card đồ họa', duration: '10:48', thumb: '🎮', free: false },
  { id: 6, title: 'SSD & HDD - Lưu trữ', duration: '7:33', thumb: '💿', free: false },
  { id: 7, title: 'PSU - Nguồn máy tính', duration: '6:55', thumb: '⚡', free: false },
  { id: 8, title: 'Tản nhiệt CPU', duration: '8:10', thumb: '🌡️', free: false },
  { id: 9, title: 'Case máy tính', duration: '5:30', thumb: '📦', free: false },
  { id: 10, title: 'Kết nối & cáp nối', duration: '9:45', thumb: '🔗', free: false },
  { id: 11, title: 'BIOS & UEFI', duration: '12:00', thumb: '⌨️', free: false },
  { id: 12, title: 'Quy trình lắp ráp PC', duration: '15:20', thumb: '🔧', free: false },
  { id: 13, title: 'Tính toán TDP & PSU', duration: '8:55', thumb: '📊', free: false },
  { id: 14, title: 'Kiểm tra tương thích', duration: '7:40', thumb: '✅', free: false },
  { id: 15, title: 'Overclocking cơ bản', duration: '11:05', thumb: '🚀', free: false },
  { id: 16, title: 'Cài đặt Windows 11', duration: '14:30', thumb: '🪟', free: false },
  { id: 17, title: 'Driver & cập nhật', duration: '6:20', thumb: '📥', free: false },
  { id: 18, title: 'Bảo trì & vệ sinh PC', duration: '9:15', thumb: '🧹', free: false },
  { id: 19, title: 'Nâng cấp PC thông minh', duration: '10:50', thumb: '⬆️', free: false },
];

function VideoHub({ unlocked, onRequestUpgrade }) {
  const [playing, setPlaying] = useState(null);

  if (playing !== null) {
    const video = VIDEOS.find(v => v.id === playing);
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => setPlaying(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px', marginBottom: '20px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
            fontWeight: 500, fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: '14px',
          padding: '32px', textAlign: 'center',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{video?.thumb}</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            {video?.title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Video 3D Animation • {video?.duration}
          </p>
          <div style={{
            width: '100%', aspectRatio: '16/9', background: 'var(--bg-base)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-default)',
          }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Play size={48} style={{ color: 'var(--brand-primary)', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', margin: 0 }}>Video đang phát...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          🎬 Video Bài Giảng 3D Animation
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {unlocked ? '19 video' : `Miễn phí ${FREE_LIMITS.video} video đầu · Nâng cấp để xem tất cả`}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {VIDEOS.map((video, idx) => {
          const locked = !unlocked && idx >= FREE_LIMITS.video;
          return (
            <button
              key={video.id}
              onClick={() => {
                if (locked) { onRequestUpgrade(); return; }
                setPlaying(video.id);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '10px',
                background: locked ? 'var(--bg-base)' : 'var(--bg-elevated)',
                border: `1px solid ${locked ? 'var(--border-default)' : 'var(--border-default)'}`,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                fontFamily: 'inherit', opacity: locked ? 0.6 : 1,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseOver={e => { if (!locked) { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = locked ? 'var(--bg-base)' : 'var(--bg-elevated)'; }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: locked ? 'var(--bg-surface)' : 'rgba(0,212,170,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                {locked ? <Lock size={16} style={{ color: 'var(--text-muted)' }} /> : video.thumb}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {idx + 1}. {video.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {video.duration} • 3D Animation
                </div>
              </div>
              {locked
                ? <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                : <Play size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── MAIN LEARNING HUB ────────── */
export default function LearningHub({ lang = 'vn', onBack }) {
  const [tab, setTab] = useState('menu'); // 'menu' | 'course' | 'video' | 'slide'
  const [unlocked, setUnlocked] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => { setUnlocked(isUnlocked()); }, []);

  const tabs = [
    {
      id: 'course',
      icon: '📚',
      title: 'Khóa Học',
      desc: 'Giáo trình kỹ thuật phần cứng PC (20 chương)',
      freeText: `Miễn phí ${FREE_LIMITS.course} bài đầu`,
      color: '#f59e0b',
    },
    {
      id: 'video',
      icon: '🎬',
      title: 'Video Bài Giảng 3D',
      desc: '19 video animation linh kiện PC chi tiết',
      freeText: `Miễn phí ${FREE_LIMITS.video} video đầu`,
      color: '#00d4aa',
    },
    {
      id: 'slide',
      icon: '📑',
      title: 'Slide Bài Học 3D',
      desc: 'Slide tổng quan phần cứng & IC3 Spark',
      freeText: 'Miễn phí slide đầu tiên',
      color: '#6366f1',
    },
  ];

  /* Back from sub-view */
  if (tab === 'course') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <PCourseViewer
            isUnlocked={unlocked}
            onRequestUpgrade={() => setShowPricing(true)}
            onBack={() => setTab('menu')}
          />
        </div>
      </>
    );
  }

  if (tab === 'video') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%' }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <VideoHub unlocked={unlocked} onRequestUpgrade={() => setShowPricing(true)} />
        </div>
      </>
    );
  }

  if (tab === 'slide') {
    return (
      <>
        {showPricing && (
          <PricingModal
            onClose={() => setShowPricing(false)}
            onUnlock={() => setUnlocked(true)}
          />
        )}
        <div style={{ width: '100%' }}>
          <button
            onClick={() => setTab('menu')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <SlideViewer
            isUnlocked={unlocked}
            onRequestUpgrade={() => setShowPricing(true)}
            onBack={() => setTab('menu')}
          />
        </div>
      </>
    );
  }

  /* ── MENU ── */
  return (
    <>
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onUnlock={() => setUnlocked(true)}
        />
      )}

      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 0 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(0,212,170,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Học tập & Bài giảng
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Chọn hình thức học phù hợp với bạn
              </p>
            </div>
          </div>

          {/* Unlock status badge */}
          {unlocked ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '99px',
              background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
            }}>
              <CheckCircle size={13} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-primary)' }}>Đã mở khóa toàn bộ</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '99px',
                background: 'rgba(255,185,0,0.1)', border: '1px solid rgba(255,185,0,0.2)',
              }}>
                <Lock size={12} style={{ color: '#ffb900' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffb900' }}>Bản dùng thử</span>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '99px',
                  background: 'linear-gradient(90deg, var(--brand-primary), #6366f1)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                }}
              >
                <Crown size={12} /> Nâng cấp ngay
              </button>
            </div>
          )}
        </div>

        {/* 3 feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '20px', borderRadius: '12px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.boxShadow = `0 0 0 1px ${t.color}20`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                background: `${t.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>{t.icon}</div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t.desc}
                </div>
                {!unlocked && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: '99px',
                    background: `${t.color}12`, border: `1px solid ${t.color}30`,
                    fontSize: '11px', fontWeight: 600, color: t.color,
                  }}>
                    ✓ {t.freeText}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer upgrade CTA */}
        {!unlocked && (
          <div style={{
            marginTop: '20px', padding: '20px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(99,102,241,0.06) 100%)',
            border: '1px solid rgba(0,212,170,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                🚀 Mở khóa toàn bộ nội dung
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Từ <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>55.000đ/tháng</span> • Trường học chỉ <span style={{ fontWeight: 700, color: '#6366f1' }}>32.000đ/học sinh</span>
              </div>
            </div>
            <button
              onClick={() => setShowPricing(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <Crown size={14} /> Xem gói cước
            </button>
          </div>
        )}
      </div>
    </>
  );
}
