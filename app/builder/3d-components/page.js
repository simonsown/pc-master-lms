'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CATEGORIES, COLOR_THEMES } from '@/lib/sketchfab-models';
import { Box, Grid3X3, ChevronLeft, Maximize2, X, Eye, Layers, User, BookOpen, Rotate3D, BookMarked } from 'lucide-react';

function SketchfabEmbed({ modelId, title, fullscreen }) {
  return (
    <iframe
      title={title}
      style={{ width: '100%', height: '100%', border: 'none' }}
      src={`https://sketchfab.com/models/${modelId}/embed${fullscreen ? '?autostart=1' : '?autostart=0'}`}
      allow="autoplay; fullscreen"
      allowFullScreen
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

function FullscreenModal({ item, theme, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = '' };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              background: theme.gradient,
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.originalIndex !== undefined ? item.originalIndex + 1 : '3D'}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <SketchfabEmbed modelId={item.embedId} title={item.title} fullscreen />
      </div>
    </div>
  );
}

function AnnotationBadge({ analyzedBy, knowledge, theme }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          borderRadius: 6,
          background: `${theme.color}12`,
          border: `1px solid ${theme.color}20`,
          color: theme.color,
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
      >
        <BookMarked size={12} />
        Chú thích
      </button>
      {open && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
            }}
            onClick={e => { e.stopPropagation(); setOpen(false) }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 101,
              width: 320,
              padding: 16,
              borderRadius: 12,
              background: '#0f0f1a',
              border: `1px solid ${theme.color}30`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${theme.color}10`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: theme.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Phân tích bởi</div>
                <div style={{ fontSize: 10, color: theme.color }}>{analyzedBy}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <BookOpen size={14} color={theme.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{knowledge}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ModelCard({ item, theme, index, category, onView }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onView(item, theme)}
      style={{
        background: `linear-gradient(145deg, ${theme.bg}, #000)`,
        borderRadius: 16,
        border: `1px solid ${theme.color}18`,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        cursor: 'pointer',
        height: 340,
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = `${theme.color}50`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${theme.color}20`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = `${theme.color}18`;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: theme.gradient,
          opacity: 0.6,
          zIndex: 11,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            background: theme.gradient,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            width: 26,
            height: 26,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 12px ${theme.color}50`,
          }}
        >
          {index + 1}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            padding: '5px 12px',
            borderRadius: 8,
            maxWidth: 180,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {item.title}
        </span>
      </div>

      {shouldLoad ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <iframe
            title={item.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
            src={`https://sketchfab.com/models/${item.embedId}/embed?autostart=0&preload=0&ui_controls=0&ui_infos=0&ui_stop=0`}
            allow="autoplay; fullscreen"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: theme.color,
            background: `radial-gradient(ellipse at center, ${theme.color}08, transparent)`,
          }}
        >
          <div style={{ fontSize: 40, opacity: 0.2 }}>🖥️</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: theme.color, opacity: 0.8 }}>
            Nhấp để xem 3D
          </div>
        </div>
      )}

      <div
        onClick={() => onView(item, theme)}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            padding: '8px 16px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
          className="view-btn"
        >
          <Maximize2 size={14} color="#fff" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Xem toàn màn hình</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '48px 16px 14px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 40%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {item.title}
          </div>
          {item.description && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {item.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
          <Rotate3D size={12} />
          <span>3D</span>
        </div>
      </div>
    </div>
  );
}

export default function Components3DPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [visible, setVisible] = useState({});
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [fullscreenTheme, setFullscreenTheme] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll('[data-category]');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const id = section.getAttribute('data-category');
        if (rect.top < window.innerHeight - 80) {
          setVisible(prev => ({ ...prev, [id]: true }));
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleView = (item, theme) => {
    setFullscreenItem(item);
    setFullscreenTheme(theme);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        .model-card:hover .view-btn {
          opacity: 1 !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(8, 8, 18, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/builder"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
            >
              <ChevronLeft size={16} />
              Quay lại
            </Link>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 16px rgba(168,85,247,0.4)',
              }}
            >
              <Box size={17} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Kho Linh Kiện <span style={{ color: '#a855f7' }}>3D</span>
              </h1>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Khám phá linh kiện dưới góc nhìn 3 chiều
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            <Eye size={14} />
            <span>{CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0)} mô hình</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px 12px',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '5px 14px',
              borderRadius: 100,
              border: `1px solid ${!activeCategory ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
              background: !activeCategory ? 'rgba(168,85,247,0.15)' : 'transparent',
              color: !activeCategory ? '#a855f7' : 'rgba(255,255,255,0.5)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            Tất cả
          </button>
          {CATEGORIES.map(cat => {
            const theme = COLOR_THEMES[cat.id];
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 100,
                  border: `1px solid ${isActive ? theme.color : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? `${theme.color}20` : 'transparent',
                  color: isActive ? theme.color : 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {CATEGORIES.map(category => {
          if (activeCategory && activeCategory !== category.id) return null;
          const theme = COLOR_THEMES[category.id];
          return (
            <div
              key={category.id}
              data-category={category.id}
              style={{
                opacity: visible[category.id] ? 1 : 0,
                transform: visible[category.id] ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <section style={{ marginBottom: 56 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 24,
                    padding: '18px 24px',
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${theme.color}10, ${theme.color}05)`,
                    border: `1px solid ${theme.color}20`,
                    backdropFilter: 'blur(8px)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-20%',
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${theme.color}15, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: theme.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 24px ${theme.color}50`,
                      flexShrink: 0,
                    }}
                  >
                    <Layers size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#fff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {theme.label}
                      </h2>
                      <AnnotationBadge
                        analyzedBy={category.analyzedBy}
                        knowledge={category.knowledge}
                        theme={theme}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: theme.color, fontWeight: 600 }}>
                        {category.items.length} mô hình
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {category.items.map(i => i.title).join(', ').length > 80
                          ? category.items.map(i => i.title).join(', ').slice(0, 80) + '...'
                          : category.items.map(i => i.title).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${theme.color}15`,
                      border: `1px solid ${theme.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.color,
                      flexShrink: 0,
                    }}
                  >
                    <Grid3X3 size={18} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 20,
                  }}
                >
                  {category.items.map((item, idx) => (
                    <ModelCard
                      key={item.id}
                      item={{ ...item, originalIndex: idx }}
                      theme={theme}
                      index={idx}
                      category={category}
                      onView={handleView}
                    />
                  ))}
                </div>
              </section>
            </div>
          );
        })}

        <footer
          style={{
            textAlign: 'center',
            padding: '40px 0 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 500 }}>
            Tổng cộng <span style={{ color: '#a855f7' }}>{CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0)}</span> mô hình 3D từ Sketchfab
          </p>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
            PC Master Builder &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      {fullscreenItem && fullscreenTheme && (
        <FullscreenModal
          item={fullscreenItem}
          theme={fullscreenTheme}
          onClose={() => { setFullscreenItem(null); setFullscreenTheme(null) }}
        />
      )}
    </div>
  );
}