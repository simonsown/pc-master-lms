'use client';

import { useEffect, useRef, useState } from 'react';

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const count = 80;
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(68, 136, 255, 0.3)';
        ctx.fill();
      });
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(68, 136, 255, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}

export default function LandingPage() {
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowQR(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1e', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <ParticleCanvas />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px',
        maxWidth: 720,
      }}>
        {/* Logo / Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, #00ffcc, #4488ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 0 80px rgba(0,255,204,0.3)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 8px',
          letterSpacing: '-1.5px', lineHeight: 1.1,
        }}>
          PC Master{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00ffcc, #4488ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            LMS
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: '#88bbcc', margin: '0 0 48px', lineHeight: 1.6,
          maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Hoc lap rap, chan doan va xay dung may tinh trong khong gian 3D VR.
          Tu phong hoc ao den showroom linh kien.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <a href="/builder/showroom"
            style={{
              padding: '14px 36px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #00ffcc, #4488ff)',
              color: '#000', fontSize: 16, fontWeight: 800, textDecoration: 'none',
              letterSpacing: 0.5, boxShadow: '0 4px 30px rgba(0,255,204,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 40px rgba(0,255,204,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,255,204,0.3)'; }}>
            Showroom 3D
          </a>
          <a href="/builder/3d-viewer"
            style={{
              padding: '14px 36px', borderRadius: 12, border: '1px solid rgba(68,136,255,0.4)',
              background: 'rgba(255,255,255,0.05)',
              color: '#8af', fontSize: 16, fontWeight: 700, textDecoration: 'none',
              letterSpacing: 0.5, transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            Phong hoc VR
          </a>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12, marginBottom: 48, textAlign: 'left',
        }}>
          {[
            { icon: '🖥️', title: '3D Components', desc: 'CPU, RAM, Cooler chi tiet' },
            { icon: '👆', title: 'Hand Tracking', desc: 'Chon bang tay thuc te' },
            { icon: '🎮', title: 'VR Classroom', desc: 'Phong hoc tuong tac' },
            { icon: '📱', title: 'QR Access', desc: 'Quet ma de vao ngay' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              transition: 'background 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ color: '#ddeeff', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{f.title}</div>
              <div style={{ color: '#6688aa', fontSize: 11 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* QR Code */}
        {showQR && (
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: 20, borderRadius: 16,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            animation: 'fadeIn 0.6s ease-out',
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: 12,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000', fontFamily: 'monospace', fontSize: 10, textAlign: 'center',
              padding: 4,
            }}>
              <div>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <rect x="0" y="0" width="120" height="120" fill="white"/>
                  {[...Array(11)].map((_, row) =>
                    [...Array(11)].map((_, col) => {
                      const isBlack = (
                        (row < 5 && col < 5 && (row === 0 || row === 4 || col === 0 || col === 4)) ||
                        (row < 5 && col > 5 && (row === 0 || row === 4 || col === 6 || col === 10)) ||
                        (row > 5 && col < 5 && (row === 6 || row === 10 || col === 0 || col === 4)) ||
                        (row === 5 || col === 5) ||
                        (row % 2 === 0 && col % 2 === 0 && row > 1 && row < 9 && col > 1 && col < 9) ||
                        (row === 7 && col === 7) || (row === 3 && col === 8) || (row === 8 && col === 3) ||
                        (row === 2 && col === 7) || (row === 7 && col === 2)
                      );
                      return <rect key={`${row}-${col}`} x={col * 11} y={row * 11} width={8} height={8} fill={isBlack ? '#000' : '#fff'}/>;
                    })
                  )}
                </svg>
              </div>
            </div>
            <div style={{ color: '#6688aa', fontSize: 11, fontFamily: 'monospace' }}>
              Quet ma QR de truy cap
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 1, marginTop: 40,
        color: '#445566', fontSize: 11, fontFamily: 'monospace',
      }}>
        PC Master LMS - Du an giao duc cong nghe
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
