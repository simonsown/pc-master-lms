'use client';

import { useState, useEffect, useRef, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div style={{ color: '#ff4466', padding: 40, fontFamily: 'monospace', fontSize: 12 }}>
        <h2>Error: {this.state.error.message}</h2>
        <pre style={{ color: '#88bbcc', marginTop: 12 }}>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const GameScene = dynamic(() => import('@/components/GameScene'), { ssr: false });

function T(lang: 'en' | 'vn', en: string, vn: string) {
  return lang === 'en' ? en : vn;
}

export default function Viewer3DPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [lang, setLang] = useState<'en' | 'vn'>('vn');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'vn') setLang(saved as 'en' | 'vn');
    } catch {}
  }, []);

  return (
    <ErrorBoundary>
      <style>{`
        .fixed.bottom-8.right-8.z-\\[1000\\],
        button:has(> .absolute.-inset-1),
        [class*="bottom-8"][class*="right-8"] {
          display: none !important;
        }
      `}</style>

      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {showInstructions && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'linear-gradient(135deg, #0a1220, #14182b)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 28, padding: 32,
            fontFamily: "'Segoe UI', sans-serif",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #00ffcc, #44aaff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 50px rgba(0,255,204,0.3)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 900, textAlign: 'center', letterSpacing: '-0.5px' }}>
              PC Master Builder <span style={{ color: '#00ffcc' }}>3D VR</span>
            </h1>
            <div style={{ maxWidth: 480, textAlign: 'center', color: '#88bbcc', fontSize: 14, lineHeight: 1.8 }}>
              {T(lang, 'Explore the IT classroom in VR. Use WASD to move and webcam to look around.',
                'Khám phá phòng tin học trong VR. Dùng WASD di chuyển, webcam nhìn xung quanh.')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
              {[
                { num: '1', text: T(lang, 'Use WASD to walk — collision enabled', 'Dùng WASD di chuyển — có va chạm'), color: '#00ffcc' },
                { num: '2', text: T(lang, 'Look around using your webcam', 'Nhìn xung quanh bằng webcam'), color: '#44aaff' },
                { num: '3', text: T(lang, 'Explore desks with PC cases and monitors', 'Khám phá bàn máy tính có thùng case'), color: '#8866ff' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${step.color}22` }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, fontWeight: 800, fontSize: 13 }}>{step.num}</span>
                  <span style={{ color: '#ddeeff', fontSize: 13 }}>{step.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                padding: '14px 40px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #00ffcc, #44aaff)',
                color: '#000', cursor: 'pointer', fontSize: 16, fontWeight: 800,
                fontFamily: 'inherit', letterSpacing: 1, boxShadow: '0 4px 30px rgba(0,255,204,0.3)',
              }}
            >
              {T(lang, 'ENTER VR CLASSROOM', 'VÀO PHÒNG HỌC')}
            </button>
          </div>
        )}

        <GameScene />
        <a href="/builder/showroom"
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 50,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(0,0,0,0.5)', color: '#8af',
            fontFamily: 'monospace', fontSize: 12, textDecoration: 'none',
            border: '1px solid rgba(100,100,255,0.2)', backdropFilter: 'blur(4px)',
          }}>
          Showroom
        </a>
      </div>
    </ErrorBoundary>
  );
}
