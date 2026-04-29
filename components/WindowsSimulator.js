'use client';
import React, { useState, useEffect } from 'react';

const APPS = [
    { id: 'browser', icon: '🌐', name: 'Edge', color: '#0078d4' },
    { id: 'explorer', icon: '📁', name: 'File Explorer', color: '#ffb900' },
    { id: 'calculator', icon: '🔢', name: 'Calculator', color: '#0078d4' },
    { id: 'notepad', icon: '📝', name: 'Notepad', color: '#333' },
    { id: 'specs', icon: '💻', name: 'PC Specs', color: '#10b981' },
];

function CalculatorApp() {
    const [display, setDisplay] = useState('0');
    const [prev, setPrev] = useState(null);
    const [op, setOp] = useState(null);
    const btn = (v, style = {}) => (
        <button onClick={() => {
            if (v === 'C') { setDisplay('0'); setPrev(null); setOp(null); return; }
            if (['+','-','×','÷'].includes(v)) { setPrev(parseFloat(display)); setOp(v); setDisplay('0'); return; }
            if (v === '=') {
                if (prev === null || !op) return;
                const a = prev, b = parseFloat(display);
                const r = op==='+' ? a+b : op==='-' ? a-b : op==='×' ? a*b : b!==0 ? a/b : 'Err';
                setDisplay(String(r)); setPrev(null); setOp(null); return;
            }
            setDisplay(prev => prev === '0' ? v : prev + v);
        }} style={{ padding: '12px', background: style.bg||'#3a3a3a', color: style.color||'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 600, ...style }}>{v}</button>
    );
    return (
        <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', width: '240px' }}>
            <div style={{ background: '#000', color: 'white', padding: '12px 16px', borderRadius: '6px', fontSize: '28px', textAlign: 'right', marginBottom: '12px', fontFamily: 'monospace' }}>{display}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                {btn('C',{bg:'#d83b3b',color:'white'})} {btn('%',{bg:'#555'})} {btn('±',{bg:'#555'})} {btn('÷',{bg:'#0078d4'})}
                {btn('7')} {btn('8')} {btn('9')} {btn('×',{bg:'#0078d4'})}
                {btn('4')} {btn('5')} {btn('6')} {btn('-',{bg:'#0078d4'})}
                {btn('1')} {btn('2')} {btn('3')} {btn('+',{bg:'#0078d4'})}
                <button onClick={() => setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0')} style={{ padding:'12px', background:'#3a3a3a', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>⌫</button>
                {btn('0')} {btn('.')} {btn('=',{bg:'#0078d4'})}
            </div>
        </div>
    );
}

function BrowserApp() {
    return (
        <div style={{ width: '500px' }}>
            <div style={{ background: '#f3f3f3', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '6px 6px 0 0' }}>
                <span>←</span><span>→</span><span>↻</span>
                <div style={{ flex: 1, background: 'white', borderRadius: '20px', padding: '4px 16px', fontSize: '13px', color: '#555' }}>https://pc-master-lms.vercel.app</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '0 0 6px 6px', color: '#333', minHeight: '200px' }}>
                <h3 style={{ color: '#0078d4' }}>🖥️ PC Master Builder LMS</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>Chào mừng! Máy tính của bạn đã được lắp ráp thành công và đang chạy Windows 11.</p>
                <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '13px' }}>
                    ✅ Hệ thống khởi động thành công<br/>✅ Tất cả linh kiện được nhận diện<br/>✅ Driver đã cài đặt
                </div>
            </div>
        </div>
    );
}

function ExplorerApp({ cart }) {
    const folders = ['Desktop','Downloads','Documents','Pictures','Music'];
    return (
        <div style={{ width: '460px', color: '#333' }}>
            <div style={{ background: '#f3f3f3', padding: '8px 12px', fontSize: '13px', borderBottom: '1px solid #ddd', borderRadius: '6px 6px 0 0', display: 'flex', gap: '16px' }}>
                {['File','Home','Share','View'].map(m => <span key={m} style={{ cursor: 'pointer' }}>{m}</span>)}
            </div>
            <div style={{ display: 'flex', background: 'white', borderRadius: '0 0 6px 6px', minHeight: '200px' }}>
                <div style={{ width: '120px', background: '#fafafa', padding: '8px', borderRight: '1px solid #ddd', fontSize: '12px' }}>
                    {folders.map(f => <div key={f} style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>📁 {f}</div>)}
                </div>
                <div style={{ flex: 1, padding: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0' }}>💻 This PC → Hardware</p>
                    {(cart||[]).map((c,i) => <div key={i} style={{ fontSize: '12px', padding: '4px', borderBottom: '1px solid #f0f0f0' }}>⚙️ {c.type}: {c.name}</div>)}
                </div>
            </div>
        </div>
    );
}

function NotepadApp() {
    const [text, setText] = useState('Ghi chú của tôi...\n\nMáy tính vừa được lắp ráp xong!');
    return (
        <div style={{ width: '400px' }}>
            <div style={{ background: '#f0f0f0', padding: '4px 12px', fontSize: '12px', borderRadius: '6px 6px 0 0', display: 'flex', gap: '16px', color: '#333' }}>
                {['File','Edit','Format','View','Help'].map(m => <span key={m} style={{ cursor: 'pointer' }}>{m}</span>)}
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', minHeight: '200px', fontFamily: 'Consolas,monospace', fontSize: '14px', border: 'none', outline: 'none', padding: '12px', resize: 'vertical', background: 'white', borderRadius: '0 0 6px 6px', boxSizing: 'border-box' }} />
        </div>
    );
}

function SpecsApp({ cart }) {
    return (
        <div style={{ width: '420px', background: '#1a1a2e', color: 'white', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ color: '#00f3ff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>💻 System Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>OS</div>
                    <div style={{ color: '#e0e6ed' }}>Windows 11 Pro (64-bit)</div>
                </div>
                {(cart||[]).map((c,i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#4b5563', textTransform: 'uppercase', fontWeight: 700 }}>{c.type}</span>
                        <span style={{ color: '#e0e6ed', fontSize: '13px' }}>{c.name}</span>
                    </div>
                ))}
                {(!cart || cart.length === 0) && <p style={{ color: '#4b5563', textAlign: 'center' }}>Không có thông tin phần cứng</p>}
            </div>
        </div>
    );
}

function WindowApp({ app, cart, onClose }) {
    return (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', borderRadius: '8px', overflow: 'hidden', minWidth: '280px' }}>
            <div style={{ background: '#202020', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{app.icon} {app.name}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', border: 'none', cursor: 'pointer' }} />
                    <button style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', border: 'none', cursor: 'pointer' }} />
                    <button onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer' }} />
                </div>
            </div>
            <div>
                {app.id === 'calculator' && <CalculatorApp />}
                {app.id === 'browser' && <BrowserApp />}
                {app.id === 'explorer' && <ExplorerApp cart={cart} />}
                {app.id === 'notepad' && <NotepadApp />}
                {app.id === 'specs' && <SpecsApp cart={cart} />}
            </div>
        </div>
    );
}

export default function WindowsSimulator({ cart, onExit }) {
    const [phase, setPhase] = useState('boot'); // boot → login → desktop
    const [progress, setProgress] = useState(0);
    const [openApp, setOpenApp] = useState(null);
    const [time, setTime] = useState('');
    const [startOpen, setStartOpen] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })), 1000);
        setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (phase === 'boot') {
            const t = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) { clearInterval(t); setTimeout(() => setPhase('login'), 500); return 100; }
                    return p + 2;
                });
            }, 60);
            return () => clearInterval(t);
        }
    }, [phase]);

    if (phase === 'boot') return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            <div style={{ fontSize: '80px' }}>🪟</div>
            <div style={{ color: 'white', fontSize: '32px', fontWeight: 300, letterSpacing: '4px' }}>Windows 11</div>
            <div style={{ width: '200px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'white', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ color: '#666', fontSize: '13px' }}>Đang khởi động hệ thống...</div>
        </div>
    );

    if (phase === 'login') return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg,#0078d4,#003c6b)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div style={{ fontSize: '72px' }}>👤</div>
            <div style={{ color: 'white', fontSize: '22px', fontWeight: 300 }}>PC Master User</div>
            <button onClick={() => setPhase('desktop')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '10px 40px', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', marginTop: '12px' }}>
                Đăng nhập →
            </button>
        </div>
    );

    // Desktop
    const wallpaperColors = 'linear-gradient(135deg,#0f1b2d 0%,#0d2137 40%,#1a0533 100%)';
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: wallpaperColors, fontFamily: "'Segoe UI',sans-serif", userSelect: 'none' }} onClick={() => setStartOpen(false)}>
            {/* Desktop icons */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', width: '80px' }}>
                {APPS.map(app => (
                    <div key={app.id} onDoubleClick={() => { setOpenApp(app); setStartOpen(false); }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'white' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: '28px' }}>{app.icon}</span>
                        <span style={{ fontSize: '11px', textAlign: 'center', textShadow: '1px 1px 2px black' }}>{app.name}</span>
                    </div>
                ))}
            </div>

            {/* Open App Window */}
            {openApp && <WindowApp app={openApp} cart={cart} onClose={() => setOpenApp(null)} />}

            {/* Taskbar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '48px', background: 'rgba(32,32,32,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 }} onClick={e => e.stopPropagation()}>
                {/* Start + pinned apps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setStartOpen(v => !v)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' }}>🪟</button>
                    <button onClick={() => alert('Tính năng tìm kiếm')} style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>🔍 <span style={{ color: '#666' }}>Tìm kiếm</span></button>
                    {APPS.map(app => (
                        <button key={app.id} onClick={() => setOpenApp(app)} title={app.name}
                            style={{ background: openApp?.id === app.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', fontSize: '20px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', borderBottom: openApp?.id === app.id ? '2px solid #0078d4' : '2px solid transparent' }}>
                            {app.icon}
                        </button>
                    ))}
                </div>

                {/* System tray */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onExit} style={{ background: 'rgba(239,68,68,0.8)', color: 'white', border: 'none', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>⏻ Tắt máy</button>
                    <div style={{ color: 'white', fontSize: '12px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{time}</div>
                        <div style={{ color: '#aaa', fontSize: '10px' }}>{new Date().toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
            </div>

            {/* Start Menu */}
            {startOpen && (
                <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', bottom: '56px', left: '50%', transform: 'translateX(-50%)', width: '520px', background: 'rgba(36,36,36,0.98)', backdropFilter: 'blur(30px)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 300 }}>
                    <div style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>Ứng dụng đã ghim</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px', marginBottom: '16px' }}>
                        {APPS.map(app => (
                            <button key={app.id} onClick={() => { setOpenApp(app); setStartOpen(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px', borderRadius: '6px', color: 'white' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize: '28px' }}>{app.icon}</span>
                                <span style={{ fontSize: '10px' }}>{app.name}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#aaa', fontSize: '13px' }}>👤 PC Master User</span>
                        <button onClick={onExit} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px' }}>⏻ Tắt máy</button>
                    </div>
                </div>
            )}
        </div>
    );
}
