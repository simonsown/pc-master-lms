'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GLOSSARY } from '../data/glossary';

const APPS = [
    { id: 'browser', icon: '🌐', name: 'Edge', color: '#0078d4' },
    { id: 'youtube', icon: '▶️', name: 'YouTube', color: '#ff0000' },
    { id: 'wiki', icon: '📖', name: 'Wiki PC', color: '#10b981' },
    { id: 'music', icon: '🎵', name: 'Music Player', color: '#1db954' },
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
        }} style={{ padding: '12px', background: style.bg||'#3a3a3a', color: style.color||'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', ...style }}>{v}</button>
    );
    return (
        <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '16px', width: '260px' }}>
            <div style={{ background: '#000', color: 'white', padding: '12px 16px', borderRadius: '6px', fontSize: '28px', textAlign: 'right', marginBottom: '12px', fontFamily: 'monospace' }}>{display}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                {btn('C',{bg:'#d83b3b',color:'white'})} {btn('%',{bg:'#555'})} {btn('±',{bg:'#555'})} {btn('÷',{bg:'#0078d4'})}
                {btn('7')} {btn('8')} {btn('9')} {btn('×',{bg:'#0078d4'})}
                {btn('4')} {btn('5')} {btn('6')} {btn('-',{bg:'#0078d4'})}
                {btn('1')} {btn('2')} {btn('3')} {btn('+',{bg:'#0078d4'})}
                <button onClick={() => setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0')} style={{ padding:'12px', background:'#3a3a3a', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontFamily:'inherit' }}>⌫</button>
                {btn('0')} {btn('.')} {btn('=',{bg:'#0078d4'})}
            </div>
        </div>
    );
}

function BrowserApp() {
    const [url, setUrl] = useState('https://google.com');
    const [showIframe, setShowIframe] = useState(true);
    const suggestions = [
        { label: 'Google Search', url: 'https://google.com' },
        { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Personal_computer' },
        { label: 'Tìm hiểu CPU', url: 'https://vi.wikipedia.org/wiki/B%E1%BB%99_vi_x%E1%BB%AD_l%C3%BD' },
        { label: 'PC Master LMS', url: 'https://pc-master-lms.vercel.app' },
    ];
    return (
        <div style={{ width: '650px', maxWidth: '90vw' }}>
            <div style={{ background: '#f3f3f3', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '6px 6px 0 0', flexWrap: 'wrap' }}>
                <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && setShowIframe(true)}
                    placeholder="Nhập URL hoặc tìm kiếm..."
                    style={{ flex: 1, borderRadius: '20px', padding: '6px 16px', fontSize: '13px', border: '1px solid #ddd', outline: 'none', color: '#333', minWidth: '150px' }} />
                <button onClick={() => setShowIframe(true)} style={{ background:'#0078d4', color:'white', border:'none', borderRadius:'4px', padding:'6px 16px', cursor:'pointer', fontSize:'12px', fontWeight:600, fontFamily:'inherit' }}>🔍 Go</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: '#fafafa', borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
                {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { setUrl(s.url); setShowIframe(true); }}
                        style={{ background:'#e8e8e8', border:'none', borderRadius:'12px', padding:'2px 10px', fontSize:'11px', cursor:'pointer', color:'#333', fontFamily:'inherit' }}>
                        {s.label}
                    </button>
                ))}
            </div>
            <div style={{ background: 'white', borderRadius: '0 0 6px 6px', minHeight: '420px', maxHeight: '65vh', overflow: 'hidden' }}>
                {showIframe ? (
                    <iframe key={url} src={url} style={{ width:'100%', height:'420px', border:'none' }} title="Browser" />
                ) : null}
            </div>
        </div>
    );
}

function YouTubeApp() {
    const [query, setQuery] = useState('');
    const [embedUrl, setEmbedUrl] = useState('');
    const suggestions = [
        { label: 'Lắp ráp PC cho người mới', id: 'Zvz7q1aLBHg' },
        { label: 'Cách chọn CPU 2026', id: 'y1F0pPvyFnA' },
        { label: 'Hướng dẫn build PC Gaming', id: 'P0YCHg0NOP4' },
        { label: 'Nhạc chill học tập', id: 'jfKfPfyJRdk' },
        { label: 'Hướng dẫn ép xung RAM', id: 'd_OeO7D9FD8' },
    ];
    return (
        <div style={{ width: '640px', maxWidth: '90vw' }}>
            <div style={{ background: '#202020', padding: '12px', borderRadius: '6px 6px 0 0', color:'white' }}>
                <div style={{ display:'flex', gap:'8px' }}>
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Tìm kiếm video..."
                        style={{ flex:1, padding:'8px 16px', borderRadius:'20px', border:'none', outline:'none', fontSize:'14px', color:'#333' }}
                        onKeyDown={e => { if (e.key === 'Enter') setEmbedUrl(`https://www.youtube.com/embed/${query}`); }} />
                    <button onClick={() => setEmbedUrl(`https://www.youtube.com/embed/${query}`)}
                        style={{ background:'#ff0000', color:'white', border:'none', borderRadius:'20px', padding:'8px 20px', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>Tìm</button>
                </div>
            </div>
            {embedUrl ? (
                <iframe src={embedUrl} style={{ width:'100%', height:'400px', border:'none' }} allowFullScreen title="YouTube" />
            ) : (
                <div style={{ background:'#111', padding:'16px', borderRadius:'0 0 6px 6px', minHeight:'200px' }}>
                    <p style={{ color:'#aaa', fontSize:'13px', marginBottom:'12px' }}>Video gợi ý:</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        {suggestions.map((s,i) => (
                            <button key={i} onClick={() => { setEmbedUrl(`https://www.youtube.com/embed/${s.id}?autoplay=1`); setQuery(s.label); }}
                                style={{ background:'#222', color:'#ddd', border:'1px solid #333', borderRadius:'8px', padding:'10px 16px', cursor:'pointer', textAlign:'left', fontSize:'13px', fontFamily:'inherit' }}>
                                ▶️ {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function WikiApp() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const entries = Object.entries(GLOSSARY);
    const filtered = search ? entries.filter(([k, v]) => k.toLowerCase().includes(search.toLowerCase()) || v.toLowerCase().includes(search.toLowerCase())) : entries.slice(0, 20);

    return (
        <div style={{ width: '520px', maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', background: '#1a1a2e' }}>
            <div style={{ padding: '12px', background: '#16213e', borderRadius: '6px 6px 0 0' }}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📖</span>
                    <span className="font-bold text-sm" style={{ color: '#00d4aa' }}>Wiki PC - Tra cứu linh kiện</span>
                </div>
                <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
                    placeholder="Tìm thuật ngữ (CPU, GPU, RAM...)"
                    style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '1px solid #2a2a4a', background: '#0f0f23', color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div style={{ width: '180px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '8px', background: '#16213e' }}>
                    {filtered.map(([key, val]) => (
                        <div key={key} onClick={() => setSelected(key)}
                            style={{
                                padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginBottom: '2px',
                                background: selected === key ? 'rgba(0,212,170,0.15)' : 'transparent',
                                color: selected === key ? '#00d4aa' : '#8a8aa0', fontWeight: selected === key ? 700 : 400
                            }}>
                            {key}
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', color: '#c0c0d0' }}>
                    {selected ? (
                        <div>
                            <h3 style={{ color: '#00d4aa', margin: '0 0 8px 0', fontSize: '18px' }}>{selected}</h3>
                            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#a0a0b0' }}>{GLOSSARY[selected]}</p>
                        </div>
                    ) : (
                        <div className="text-center py-8" style={{ color: '#6a6a80' }}>
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-sm">Tìm kiếm thuật ngữ phần cứng<br/>hoặc chọn từ danh sách bên trái</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MusicPlayerApp() {
    const [currentTrack, setCurrentTrack] = useState(null);
    const audioRef = useRef(null);
    const tracks = [
        { title: 'Lofi Chill 🎧', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { title: 'Nhạc nền thư giãn 🌿', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { title: 'Beats điện tử ⚡', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
        { title: 'Jazz nhẹ nhàng 🎷', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { title: 'Piano du dương 🎹', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    ];
    useEffect(() => {
        if (currentTrack && audioRef.current) audioRef.current.play().catch(() => {});
    }, [currentTrack]);
    return (
        <div style={{ width: '380px', background: '#121212', borderRadius: '8px', padding: '24px', color: 'white' }}>
            <h3 style={{ margin:'0 0 16px 0', fontSize:'18px', display:'flex', alignItems:'center', gap:'8px' }}>🎵 Music Player</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {tracks.map((t,i) => (
                    <button key={i} onClick={() => setCurrentTrack(t)}
                        style={{ background: currentTrack?.title === t.title ? '#1db954' : '#282828', color: currentTrack?.title === t.title ? '#000' : '#fff',
                            border: 'none', borderRadius: '8px', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
                        <span>{currentTrack?.title === t.title ? '🔊' : '🎵'}</span>
                        {t.title}
                    </button>
                ))}
            </div>
            {currentTrack && <audio ref={audioRef} src={currentTrack.url} controls style={{ width:'100%', marginTop:'16px', borderRadius:'8px' }} autoPlay />}
            {!currentTrack && <p style={{ color:'#666', fontSize:'12px', marginTop:'16px', textAlign:'center' }}>Chọn bài hát để phát nhạc thật 🎶</p>}
        </div>
    );
}

function ExplorerApp({ cart }) {
    const folders = ['Desktop','Downloads','Documents','Pictures','Music'];
    return (
        <div style={{ width: '480px', color: '#333' }}>
            <div style={{ background: '#f3f3f3', padding: '8px 12px', fontSize: '13px', borderBottom: '1px solid #ddd', borderRadius: '6px 6px 0 0', display: 'flex', gap: '16px' }}>
                {['File','Home','Share','View'].map(m => <span key={m} style={{ cursor: 'pointer' }}>{m}</span>)}
            </div>
            <div style={{ display: 'flex', background: 'white', borderRadius: '0 0 6px 6px', minHeight: '220px' }}>
                <div style={{ width: '130px', background: '#fafafa', padding: '8px', borderRight: '1px solid #ddd', fontSize: '12px' }}>
                    {folders.map(f => <div key={f} style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>📁 {f}</div>)}
                </div>
                <div style={{ flex: 1, padding: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0' }}>💻 This PC → Hardware</p>
                    {(cart||[]).map((c,i) => <div key={i} style={{ fontSize: '12px', padding: '4px', borderBottom: '1px solid #f0f0f0' }}>⚙️ {c.type}: {c.name}</div>)}
                    {(!cart || cart.length === 0) && <p style={{ color:'#999', fontSize:'12px' }}>Trống</p>}
                </div>
            </div>
        </div>
    );
}

function NotepadApp() {
    const [text, setText] = useState('Ghi chú của tôi...\n\nMáy tính vừa được lắp ráp xong!\nChúc mừng! Hệ thống của bạn đã hoạt động.');
    return (
        <div style={{ width: '420px' }}>
            <div style={{ background: '#f0f0f0', padding: '4px 12px', fontSize: '12px', borderRadius: '6px 6px 0 0', display: 'flex', gap: '16px', color: '#333' }}>
                {['File','Edit','Format','View','Help'].map(m => <span key={m} style={{ cursor: 'pointer' }}>{m}</span>)}
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', minHeight: '220px', fontFamily: 'Consolas,monospace', fontSize: '14px', border: 'none', outline: 'none', padding: '12px', resize: 'vertical', background: 'white', borderRadius: '0 0 6px 6px', boxSizing: 'border-box', color:'#333' }} />
        </div>
    );
}

function SpecsApp({ cart, scenarioName }) {
    return (
        <div style={{ width: '440px', background: '#1a1a2e', color: 'white', borderRadius: '8px', padding: '20px' }}>
            {scenarioName && (
                <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💼</span>
                    <span style={{ fontSize: '13px', color: '#00d4aa', fontWeight: 600 }}>{scenarioName}</span>
                </div>
            )}
            <h3 style={{ color: '#00f3ff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>💻 System Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>OS</div>
                    <div style={{ color: '#e0e6ed' }}>Windows 11 Pro (64-bit)</div>
                </div>
                <div style={{ background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Diagnostics</div>
                    <div style={{ color: '#10b981' }}>✅ Tất cả linh kiện hoạt động tốt</div>
                    <div style={{ color: '#10b981' }}>✅ Driver đã được cài đặt</div>
                    <div style={{ color: '#10b981' }}>✅ Hệ thống ổn định</div>
                </div>
                {(cart||[]).map((c,i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#4b5563', textTransform: 'uppercase', fontWeight: 700 }}>{c.type}</span>
                        <span style={{ color: '#e0e6ed', fontSize: '13px' }}>{c.name || 'Đã lắp'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WindowApp({ app, cart, scenarioName, onClose }) {
    const AppComponent = app.id === 'calculator' ? CalculatorApp
        : app.id === 'browser' ? BrowserApp
        : app.id === 'youtube' ? YouTubeApp
        : app.id === 'wiki' ? WikiApp
        : app.id === 'music' ? MusicPlayerApp
        : app.id === 'explorer' ? ExplorerApp
        : app.id === 'notepad' ? NotepadApp
        : app.id === 'specs' ? () => <SpecsApp cart={cart} scenarioName={scenarioName} />
        : null;
    return (
        <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', borderRadius: '8px',
            overflow: 'hidden', minWidth: '280px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto'
        }}>
            <div style={{ background: '#202020', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{app.icon} {app.name}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', border: 'none', cursor: 'pointer' }} />
                    <button style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', border: 'none', cursor: 'pointer' }} />
                    <button onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer' }} />
                </div>
            </div>
            <div>{AppComponent && <AppComponent cart={cart} scenarioName={scenarioName} />}</div>
        </div>
    );
}

export default function WindowsSimulator({ cart, scenarioName, onExit }) {
    const [phase, setPhase] = useState('post');
    const [progress, setProgress] = useState(0);
    const [openApp, setOpenApp] = useState(null);
    const [time, setTime] = useState('');
    const [startOpen, setStartOpen] = useState(false);
    const [bootMsgs, setBootMsgs] = useState([]);

    const counts = {};
    (cart||[]).forEach(c => { const t = c.type || c; counts[t] = (counts[t]||0)+1; });
    const hasCPU = counts['CPU'] >= 1;
    const hasRAM = counts['RAM'] >= 1;
    const hasGPU = counts['GPU'] >= 1;
    const hasSSD = counts['SSD'] >= 1 || counts['Storage'] >= 1;
    const hasPSU = counts['PSU'] >= 1;
    const allOK = hasCPU && hasRAM && hasGPU && hasSSD && hasPSU;

    useEffect(() => {
        const t = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })), 1000);
        setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        return () => clearInterval(t);
    }, []);

    // POST sequence
    useEffect(() => {
        if (phase !== 'post') return;
        const lines = [
            { msg: '🖥️ PC Master BIOS v2.04 (UEFI)', delay: 200 },
            { msg: `🧠 CPU: ${hasCPU ? 'Detected ✓' : 'NOT FOUND ✗'}`, delay: 600 },
            { msg: `💾 RAM: ${hasRAM ? 'Detected ✓' : 'NOT FOUND ✗'}`, delay: 1000 },
            { msg: `🎨 GPU: ${hasGPU ? 'Detected ✓' : 'NOT FOUND ✗'}`, delay: 1400 },
            { msg: `💽 SSD: ${hasSSD ? 'Detected ✓' : 'NOT FOUND ✗'}`, delay: 1800 },
            { msg: `🔌 PSU: ${hasPSU ? 'Detected ✓' : 'NOT FOUND ✗'}`, delay: 2200 },
        ];
        const timers = lines.map(({msg, delay}) => setTimeout(() => setBootMsgs(prev => [...prev, msg]), delay));
        const finalTimer = setTimeout(() => {
            if (allOK) {
                setBootMsgs(prev => [...prev, '', '✅ POST OK - BEEP (ngắn)', '', 'Đang nạp BIOS...']);
                setTimeout(() => setPhase('bios'), 1500);
            } else {
                setBootMsgs(prev => [...prev, '', '💥 POST FAILED - Kiểm tra linh kiện!']);
                setTimeout(() => setPhase('error'), 1000);
            }
        }, 2800);
        return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'bios') return;
        const t = setTimeout(() => setPhase('boot'), 2000);
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'boot') return;
        const t = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(t); setTimeout(() => setPhase('login'), 500); return 100; } return p + 2; }), 60);
        return () => clearInterval(t);
    }, [phase]);

    if (phase === 'post') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace' }}>
            <div style={{ textAlign:'center' }}>
                <pre style={{ color:'#00ff00', fontSize:'11px', lineHeight:1.4, marginBottom:'20px' }}>
{`
    ╔══════════════════════════════════════╗
    ║    PC Master BIOS v2.04 (UEFI)       ║
    ║    Power-On Self Test                ║
    ╚══════════════════════════════════════╝`}
                </pre>
                <div style={{ color:'#c0c0c0', fontSize:'14px', lineHeight:1.8, textAlign:'left', display:'inline-block' }}>
                    {bootMsgs.map((msg, i) => (
                        <div key={i} style={{ color: msg.startsWith('💥') ? '#ef4444' : msg.startsWith('✅') ? '#10b981' : '#c0c0c0' }}>{msg}</div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (phase === 'error') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#1a0000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', fontFamily:'monospace' }}>
            <div style={{ fontSize:'72px' }}>💥</div>
            <h2 style={{ color:'#ef4444', margin:0 }}>POST FAILED - LỖI HỆ THỐNG</h2>
            <div style={{ color:'#ff6666', lineHeight:2 }}>
                {!hasCPU && <div>✗ CPU: Không tìm thấy</div>}
                {!hasRAM && <div>✗ RAM: Không tìm thấy</div>}
                {!hasGPU && <div>✗ GPU: Không tìm thấy</div>}
                {!hasSSD && <div>✗ SSD: Không tìm thấy</div>}
                {!hasPSU && <div>✗ PSU: Không tìm thấy</div>}
            </div>
            <p style={{ color:'#ff8888', fontSize:'13px', maxWidth:'400px', textAlign:'center' }}>Hệ thống không thể boot. Kiểm tra lại các linh kiện bị thiếu.</p>
            <button onClick={onExit} style={{ padding:'10px 30px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:600, fontFamily:'inherit' }}>
                Quay lại
            </button>
        </div>
    );

    if (phase === 'bios') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
            <div style={{ fontSize:'72px' }}>🖥️</div>
            <h1 style={{ color:'#00d4aa', margin:0, fontSize:'28px' }}>PC Master Builder</h1>
            <p style={{ color:'#6b7280', margin:0 }}>BIOS Version 2.04 (UEFI)</p>
            <p style={{ color:'#4b5563', fontSize:'13px' }}>Press DEL to enter Setup</p>
        </div>
    );

    if (phase === 'boot') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'40px' }}>
            <div style={{ fontSize:'80px' }}>🪟</div>
            <div style={{ color:'white', fontSize:'32px', fontWeight:300, letterSpacing:'4px' }}>Windows 11</div>
            <div style={{ width:'200px', height:'4px', background:'#333', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'white', borderRadius:'2px', transition:'width 0.1s' }} />
            </div>
            <div style={{ color:'#666', fontSize:'13px' }}>Đang khởi động hệ thống...</div>
        </div>
    );

    if (phase === 'login') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'linear-gradient(135deg,#0078d4,#003c6b)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px' }}>
            <div style={{ fontSize:'72px' }}>👤</div>
            <div style={{ color:'white', fontSize:'22px', fontWeight:300 }}>PC Master User</div>
            {scenarioName && <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px' }}>💼 {scenarioName}</div>}
            <button onClick={() => setPhase('desktop')}
                style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.4)', padding:'10px 40px', borderRadius:'4px', cursor:'pointer', fontSize:'15px', marginTop:'12px', fontFamily:'inherit' }}>
                Đăng nhập →
            </button>
        </div>
    );

    const wallpaperColors = 'linear-gradient(135deg,#0f1b2d 0%,#0d2137 40%,#1a0533 100%)';
    return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:wallpaperColors, fontFamily:"'Segoe UI',sans-serif", userSelect:'none' }} onClick={() => setStartOpen(false)}>
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'16px', width:'80px' }}>
                {APPS.map(app => (
                    <div key={app.id} onDoubleClick={() => { setOpenApp(app); setStartOpen(false); }}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', padding:'6px', borderRadius:'6px', color:'white' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize:'28px' }}>{app.icon}</span>
                        <span style={{ fontSize:'11px', textAlign:'center', textShadow:'1px 1px 2px black' }}>{app.name}</span>
                    </div>
                ))}
            </div>

            {openApp && <WindowApp app={openApp} cart={cart} scenarioName={scenarioName} onClose={() => setOpenApp(null)} />}

            <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'48px', background:'rgba(32,32,32,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:200 }} onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <button onClick={() => setStartOpen(v => !v)} style={{ background:'transparent', border:'none', fontSize:'22px', cursor:'pointer', padding:'6px 10px', borderRadius:'6px' }}>🪟</button>
                    <button onClick={() => alert('🔍 Mở trình duyệt Edge để tìm kiếm Google hoặc Wiki PC để tra cứu!')} style={{ background:'transparent', border:'none', color:'#aaa', padding:'4px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', fontFamily:'inherit' }}>🔍 <span style={{ color:'#666' }}>Tìm kiếm</span></button>
                    {APPS.map(app => (
                        <button key={app.id} onClick={() => setOpenApp(app)} title={app.name}
                            style={{ background: openApp?.id === app.id ? 'rgba(255,255,255,0.15)' : 'transparent', border:'none', fontSize:'20px', padding:'6px 10px', borderRadius:'6px', cursor:'pointer', borderBottom: openApp?.id === app.id ? '2px solid #0078d4' : '2px solid transparent' }}>
                            {app.icon}
                        </button>
                    ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <button onClick={onExit} style={{ background:'rgba(239,68,68,0.8)', color:'white', border:'none', padding:'4px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:700, fontFamily:'inherit' }}>⏻ Tắt máy</button>
                    <div style={{ color:'white', fontSize:'12px', textAlign:'right' }}>
                        <div style={{ fontWeight:600 }}>{time}</div>
                        <div style={{ color:'#aaa', fontSize:'10px' }}>{new Date().toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
            </div>

            {startOpen && (
                <div onClick={e => e.stopPropagation()} style={{ position:'fixed', bottom:'56px', left:'50%', transform:'translateX(-50%)', width:'520px', background:'rgba(36,36,36,0.98)', backdropFilter:'blur(30px)', borderRadius:'12px', padding:'24px', border:'1px solid rgba(255,255,255,0.1)', zIndex:300 }}>
                    <div style={{ color:'white', fontWeight:600, marginBottom:'16px', fontSize:'14px' }}>Ứng dụng đã ghim</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' }}>
                        {APPS.map(app => (
                            <button key={app.id} onClick={() => { setOpenApp(app); setStartOpen(false); }} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'8px', borderRadius:'6px', color:'white', fontFamily:'inherit' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize:'28px' }}>{app.icon}</span>
                                <span style={{ fontSize:'10px' }}>{app.name}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ color:'#aaa', fontSize:'13px' }}>👤 PC Master User {scenarioName && `· ${scenarioName}`}</span>
                        <button onClick={onExit} style={{ background:'transparent', border:'none', color:'#aaa', cursor:'pointer', fontSize:'13px', fontFamily:'inherit' }}>⏻ Tắt máy</button>
                    </div>
                </div>
            )}
        </div>
    );
}
