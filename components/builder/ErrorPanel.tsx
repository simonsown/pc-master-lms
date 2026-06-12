'use client';

import { useState } from 'react';
import { type AssemblyError, ASSEMBLY_ERRORS } from '@/data/assemblyErrors';

interface ErrorPanelProps {
  errors: AssemblyError[];
  onClose?: () => void;
}

function YouTubeClip({ videoId, startSeconds, endSeconds, title, channelName, description }: {
  videoId: string;
  startSeconds: number;
  endSeconds?: number;
  title: string;
  channelName: string;
  description: string;
}) {
  const [showPlayer, setShowPlayer] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startSeconds}${endSeconds ? `&end=${endSeconds}` : ''}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#0f0f1a' }}>
        {!showPlayer ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => setShowPlayer(true)}
              loading="lazy"
            />
            <div
              onClick={() => setShowPlayer(true)}
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(255,255,255,0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
              </div>
            </div>
          </>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            width="100%"
            height="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', position: 'absolute', inset: 0 }}
          />
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{channelName}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{description}</div>
        <div style={{ fontSize: 10, color: '#00d4aa', marginTop: 4 }}>
          Bắt đầu từ giây {startSeconds}{endSeconds ? ` — đến giây ${endSeconds}` : ''}
        </div>
      </div>
    </div>
  );
}

export default function ErrorPanel({ errors, onClose }: ErrorPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [languageTab, setLanguageTab] = useState<'all' | 'vi' | 'en'>('all');
  const [selectedError, setSelectedError] = useState<AssemblyError | null>(errors[0] || null);

  if (errors.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const severityConfig = {
    critical: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    info: { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: '#0f0f1a', borderTop: '1px solid rgba(255,255,255,0.1)',
      maxHeight: '50vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
            {errors.length} lỗi phát hiện
          </span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20,
        }}>✕</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: 320, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)',
          padding: 12,
        }}>
          {errors.map((err) => {
            const conf = severityConfig[err.severity];
            return (
              <div key={err.id} onClick={() => setSelectedError(err)}
                style={{
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: selectedError?.id === err.id ? conf.bg : 'transparent',
                  border: `1px solid ${selectedError?.id === err.id ? conf.color : 'transparent'}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{conf.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', flex: 1 }}>{err.title}</span>
                </div>
                <div style={{ fontSize: 11, color: conf.color, marginTop: 4 }}>
                  {err.code}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {selectedError && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{severityConfig[selectedError.severity].icon}</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{selectedError.title}</div>
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                {selectedError.description}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div onClick={() => toggleExpand(selectedError.id)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#00d4aa' }}>
                  <span>{expandedId === selectedError.id ? '▼' : '▶'}</span>
                  Cách sửa
                </div>
                {expandedId === selectedError.id && (
                  <div style={{ marginTop: 8, padding: 12, background: 'rgba(0,212,170,0.08)', borderRadius: 8, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedError.howToFix}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
                  Video hướng dẫn sửa lỗi
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {['all', 'vi', 'en'].map((tab) => (
                    <button key={tab} onClick={() => setLanguageTab(tab as any)}
                      style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: languageTab === tab ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.05)',
                        color: languageTab === tab ? '#00d4aa' : '#94a3b8',
                        border: `1px solid ${languageTab === tab ? '#00d4aa' : 'transparent'}`,
                      }}>
                      {tab === 'all' ? 'Tất cả' : tab === 'vi' ? 'Tiếng Việt' : 'English'}
                    </button>
                  ))}
                </div>
                {selectedError.youtubeVideo
                  .filter((v) => languageTab === 'all' || v.language === languageTab)
                  .map((video) => (
                    <YouTubeClip key={video.videoId} {...video} />
                  ))}
              </div>

              {selectedError.suggestedFix && (
                <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Gợi ý thay thế</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                    Thay {selectedError.suggestedFix.replaceComponent} bằng: {selectedError.suggestedFix.recommendation}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorAnimation({ error }: { error: AssemblyError }) {
  const style: Record<string, string | number> = {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100,
  };

  switch (error.animation.type) {
    case 'shake':
      return (
        <div style={style}>
          <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 50%{transform:translateX(8px)} 75%{transform:translateX(-8px)} }`}</style>
          {error.animation.targetComponents.map((comp) => (
            <div key={comp} data-error-component={comp}
              style={{
                animation: `shake ${error.animation.durationMs}ms ease-in-out`,
                border: '2px solid #ef4444', borderRadius: 8,
              }} />
          ))}
        </div>
      );
    case 'red-flash':
      return (
        <div style={{ ...style, background: 'rgba(239,68,68,0.2)', animation: `redFlash ${error.animation.durationMs}ms ease-in-out` }}>
          <style>{`@keyframes redFlash { 0%{opacity:0} 15%{opacity:1} 30%{opacity:0} 45%{opacity:1} 60%{opacity:0} 75%{opacity:1} 100%{opacity:0} }`}</style>
        </div>
      );
    case 'cross-mark':
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`@keyframes crossMark { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2);opacity:1} 100%{transform:scale(1);opacity:1} }`}</style>
          <span style={{ fontSize: 64, color: '#ef4444', animation: `crossMark ${error.animation.durationMs}ms ease-out` }}>✕</span>
        </div>
      );
    case 'arrow-wrong':
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="40" viewBox="0 0 120 40">
            <line x1="10" y1="20" x2="100" y2="20" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 4">
              <animate attributeName="stroke-dashoffset" from="0" to="24" dur="1s" repeatCount="2" />
            </line>
            <polygon points="100,12 115,20 100,28" fill="#ef4444" />
            <text x="55" y="12" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">Không tương thích</text>
          </svg>
        </div>
      );
    case 'highlight-both':
      return (
        <div style={style}>
          <style>{`@keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          {error.animation.targetComponents.map((comp) => (
            <div key={comp} data-error-component={comp}
              style={{
                outline: '3px solid #ef4444', outlineOffset: 2, borderRadius: 8,
                boxShadow: '0 0 20px rgba(239,68,68,0.5)',
                animation: `pulseGlow ${error.animation.durationMs}ms ease-in-out`,
              }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export { ASSEMBLY_ERRORS };
export type { AssemblyVideo } from '@/data/assemblyErrors';
