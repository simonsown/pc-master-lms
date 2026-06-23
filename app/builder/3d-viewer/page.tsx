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
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [lang, setLang] = useState<'en' | 'vn'>('vn');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'vn') setLang(saved as 'en' | 'vn');
    } catch {}
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: [] }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'bot', content: data.reply || 'Xin lỗi, tôi chưa thể trả lời.' }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', content: 'Xin lỗi, tôi gặp sự cố kết nối.' }]);
    }
  };

  return (
    <ErrorBoundary>
      {/* Hide global AI Guru on this page */}
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
              {T(lang, 'Build your PC in a VR workshop. Use WASD to move, webcam to look around, drag parts into the PC case.',
                'Lắp ráp PC trong phòng thí nghiệm VR. Dùng WASD di chuyển, webcam nhìn xung quanh, kéo thả linh kiện vào thùng máy.')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
              {[
                { num: '1', text: T(lang, 'Toggle Explore to walk around the room (WASD + head tracking)', 'Bật Khám phá để đi lại trong phòng (WASD + theo dõi đầu)'), color: '#00ffcc' },
                { num: '2', text: T(lang, 'Click Start Assembly to build your PC', 'Nhấn Bắt đầu lắp ráp để ráp PC'), color: '#44aaff' },
                { num: '3', text: T(lang, 'Drag parts into the case — press POWER!', 'Kéo linh kiện vào thùng máy — nhấn KHỞI ĐỘNG!'), color: '#8866ff' },
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
              {T(lang, 'ENTER VR WORKSHOP', 'VÀO PHÒNG VR')}
            </button>
          </div>
        )}

        <GameScene />

        {/* Small chatbot button - bottom right corner */}
        {!showInstructions && (
          <>
            {!showChat && (
              <button
                onClick={() => setShowChat(true)}
                style={{
                  position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #00ffcc, #44aaff)',
                  color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,255,204,0.4)',
                  fontSize: '18px',
                }}
                title="AI Guru"
              >
                💬
              </button>
            )}

            {/* Chat panel */}
            {showChat && (
              <div style={{
                position: 'fixed', bottom: '70px', right: '20px', zIndex: 9999,
                width: '300px', height: '380px', borderRadius: '16px',
                background: '#1a1a2e', border: '1px solid rgba(0,255,204,0.2)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                <div style={{
                  padding: '10px 14px', background: '#16213e',
                  borderBottom: '1px solid rgba(0,255,204,0.15)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#00ffcc', fontSize: '12px', fontWeight: 700 }}>AI Guru</span>
                  <button onClick={() => setShowChat(false)}
                    style={{ background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', fontSize: '16px', padding: '2px' }}>
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chatMessages.length === 0 && (
                    <div style={{ color: '#667788', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
                      Hỏi AI Guru về PC...
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%', padding: '8px 12px', borderRadius: '12px',
                      fontSize: '12px', lineHeight: 1.5,
                      background: m.role === 'user' ? '#00d4aa' : '#0f3460',
                      color: m.role === 'user' ? '#000' : '#ddeeff',
                    }}>
                      {m.content}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ padding: '8px', borderTop: '1px solid rgba(0,255,204,0.1)', display: 'flex', gap: '6px' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
                    placeholder="Nhập tin nhắn..."
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(0,255,204,0.2)',
                      background: '#0d1b2a', color: '#fff', fontSize: '12px', fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  <button onClick={handleChatSend}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none',
                      background: '#00ffcc', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                    }}>
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
