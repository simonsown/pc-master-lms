'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GLOSSARY } from '../data/glossary';

const APPS = [
    { id: 'browser', icon: '🌐', name: 'Edge', color: '#0078d4' },
    { id: 'youtube', icon: '▶️', name: 'YouTube', color: '#ff0000' },
    { id: 'wiki', icon: '📖', name: 'Wiki PC', color: '#10b981' },
    { id: 'music', icon: '🎵', name: 'Music', color: '#1db954' },
    { id: 'explorer', icon: '📁', name: 'Explorer', color: '#ffb900' },
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
        }} style={{ padding:'12px', background:style.bg||'#3a3a3a', color:style.color||'white', border:'none', borderRadius:'4px', fontSize:'16px', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>{v}</button>
    );
    return (
        <div style={{ background:'#1e1e1e', borderRadius:'8px', padding:'16px', width:'260px' }}>
            <div style={{ background:'#000', color:'white', padding:'12px 16px', borderRadius:'6px', fontSize:'28px', textAlign:'right', marginBottom:'12px', fontFamily:'monospace' }}>{display}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
                {btn('C',{bg:'#d83b3b',color:'white'})} {btn('%',{bg:'#555'})} {btn('±',{bg:'#555'})} {btn('÷',{bg:'#0078d4'})}
                {btn('7')} {btn('8')} {btn('9')} {btn('×',{bg:'#0078d4'})}
                {btn('4')} {btn('5')} {btn('6')} {btn('-',{bg:'#0078d4'})}
                {btn('1')} {btn('2')} {btn('3')} {btn('+',{bg:'#0078d4'})}
                <button onClick={() => setDisplay(d => d.length>1?d.slice(0,-1):'0')} style={{ padding:'12px', background:'#3a3a3a', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontFamily:'inherit' }}>⌫</button>
                {btn('0')} {btn('.')} {btn('=',{bg:'#0078d4'})}
            </div>
        </div>
    );
}

function BrowserApp() {
    const [url, setUrl] = useState('https://google.com');
    const [showIframe, setShowIframe] = useState(true);
    const [key, setKey] = useState(0);
    const suggestions = [
        { label: '🔍 Google', url: 'https://google.com' },
        { label: '📖 Wikipedia PC', url: 'https://en.wikipedia.org/wiki/Personal_computer' },
        { label: '🧠 Wiki CPU', url: 'https://vi.wikipedia.org/wiki/B%E1%BB%99_vi_x%E1%BB%AD_l%C3%BD' },
        { label: '🎮 Wiki GPU', url: 'https://en.wikipedia.org/wiki/Graphics_processing_unit' },
        { label: '💾 Wiki RAM', url: 'https://en.wikipedia.org/wiki/Random-access_memory' },
    ];
    return (
        <div style={{ width:'650px', maxWidth:'90vw', display:'flex', flexDirection:'column' }}>
            <div style={{ background:'#f3f3f3', padding:'8px 12px', display:'flex', gap:'8px', alignItems:'center', borderRadius:'6px 6px 0 0', flexWrap:'wrap' }}>
                <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){setShowIframe(true);setKey(k=>k+1);} }}
                    placeholder="Nhập URL..."
                    style={{ flex:1, borderRadius:'20px', padding:'6px 16px', fontSize:'13px', border:'1px solid #ddd', outline:'none', color:'#333', minWidth:'150px' }} />
                <button onClick={() => { setShowIframe(true); setKey(k => k+1); }} style={{ background:'#0078d4', color:'white', border:'none', borderRadius:'4px', padding:'6px 16px', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'inherit' }}>🔍 Go</button>
            </div>
            <div style={{ display:'flex', gap:'4px', padding:'4px 8px', background:'#fafafa', borderBottom:'1px solid #eee', flexWrap:'wrap' }}>
                {suggestions.map((s,i) => (
                    <button key={i} onClick={() => { setUrl(s.url); setShowIframe(true); setKey(k => k+1); }}
                        style={{ background:'#e8e8e8', border:'none', borderRadius:'12px', padding:'2px 10px', fontSize:'11px', cursor:'pointer', color:'#333', fontFamily:'inherit' }}>
                        {s.label}
                    </button>
                ))}
            </div>
            {showIframe && (
                <iframe key={key} src={url} style={{ width:'100%', height:'420px', border:'none' }} title="Browser" />
            )}
        </div>
    );
}

function YouTubeApp() {
    const [embedUrl, setEmbedUrl] = useState('');
    const videos = [
        { label: 'Hướng dẫn lắp ráp PC', id: 'Zvz7q1aLBHg' },
        { label: 'Cách chọn CPU 2026', id: 'y1F0pPvyFnA' },
        { label: 'Build PC Gaming tầm trung', id: 'P0YCHg0NOP4' },
        { label: 'Cách ép xung RAM', id: 'd_OeO7D9FD8' },
        { label: 'Tản nhiệt nước AIO', id: 'kO4Z4N4nqso' },
        { label: 'So sánh SSD NVMe vs SATA', id: 'dj0B8WuqW5w' },
        { label: 'Hướng dẫn chọn nguồn PSU', id: 'EaZxtvB6_jE' },
    ];
    return (
        <div style={{ width:'640px', maxWidth:'90vw', display:'flex', flexDirection:'column', maxHeight:'70vh' }}>
            <div style={{ background:'#202020', padding:'12px', borderRadius:'6px 6px 0 0', color:'white' }}>
                <p style={{ margin:0, fontSize:'13px' }}>▶️ Chọn video để xem hướng dẫn lắp ráp PC:</p>
            </div>
            <div style={{ background:'#111', padding:'12px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'4px' }}>
                {videos.map((v,i) => (
                    <button key={i} onClick={() => setEmbedUrl(`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`)}
                        style={{ background:embedUrl?.includes(v.id)?'#333':'#1a1a1a', color:'#ddd', border:'1px solid #333', borderRadius:'8px', padding:'10px 14px', cursor:'pointer', textAlign:'left', fontSize:'13px', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ color:'#ff0000' }}>▶️</span> {v.label}
                    </button>
                ))}
            </div>
            {embedUrl && (
                <iframe key={embedUrl} src={embedUrl} style={{ width:'100%', height:'350px', border:'none', borderRadius:'0 0 6px 6px' }} allowFullScreen title="YouTube" />
            )}
        </div>
    );
}

function WikiApp() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const entries = Object.entries(GLOSSARY).sort(([a],[b]) => a.localeCompare(b));
    const filtered = search ? entries.filter(([k,v]) => k.toLowerCase().includes(search.toLowerCase()) || v.toLowerCase().includes(search.toLowerCase())) : entries;

    return (
        <div style={{ width:'550px', maxWidth:'90vw', maxHeight:'70vh', display:'flex', flexDirection:'column', background:'#1a1a2e', borderRadius:'8px', overflow:'hidden' }}>
            <div style={{ padding:'12px', background:'#16213e' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'20px' }}>📖</span>
                    <span style={{ color:'#00d4aa', fontWeight:700, fontSize:'14px' }}>Wiki PC - Tra cứu linh kiện</span>
                </div>
                <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
                    placeholder="Tìm thuật ngữ (CPU, GPU, RAM...)"
                    style={{ width:'100%', padding:'8px 14px', borderRadius:'8px', border:'1px solid #2a2a4a', background:'#0f0f23', color:'white', outline:'none', fontSize:'13px', boxSizing:'border-box', fontFamily:'inherit' }} />
            </div>
            <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
                <div style={{ width:'180px', overflowY:'auto', borderRight:'1px solid rgba(255,255,255,0.05)', padding:'8px', background:'#16213e' }}>
                    {filtered.map(([key]) => (
                        <div key={key} onClick={() => setSelected(key)}
                            style={{ padding:'6px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', marginBottom:'2px',
                                background: selected===key ? 'rgba(0,212,170,0.15)' : 'transparent',
                                color: selected===key ? '#00d4aa' : '#8a8aa0', fontWeight: selected===key ? 700 : 400 }}>
                            {key}
                        </div>
                    ))}
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'16px', color:'#c0c0d0' }}>
                    {selected ? (
                        <div>
                            <h3 style={{ color:'#00d4aa', margin:'0 0 8px 0', fontSize:'18px' }}>{selected}</h3>
                            <p style={{ fontSize:'14px', lineHeight:1.6, color:'#a0a0b0' }}>{GLOSSARY[selected]}</p>
                        </div>
                    ) : (
                        <div style={{ textAlign:'center', padding:'40px 0', color:'#6a6a80' }}>
                            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔍</div>
                            <p style={{ fontSize:'13px' }}>Tìm kiếm thuật ngữ phần cứng</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MusicApp() {
    const audioRef = useRef(null);
    const [currentIdx, setCurrentIdx] = useState(null);
    const [playing, setPlaying] = useState(false);
    const tracks = [
        { title: 'Lofi Chill', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { title: 'Thư giãn', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { title: 'Beats điện tử', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
        { title: 'Jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { title: 'Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    ];
    useEffect(() => {
        if (audioRef.current) {
            if (playing && currentIdx !== null) { audioRef.current.play().catch(() => setPlaying(false)); }
            else { audioRef.current.pause(); }
        }
    }, [currentIdx, playing]);

    return (
        <div style={{ width:'360px', background:'#121212', borderRadius:'8px', padding:'20px', color:'white' }}>
            <h3 style={{ margin:'0 0 16px 0', fontSize:'16px', display:'flex', alignItems:'center', gap:'8px' }}>🎵 Music Player</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {tracks.map((t,i) => (
                    <button key={i} onClick={() => { setCurrentIdx(i); setPlaying(true); }}
                        style={{ background: currentIdx===i && playing ? '#1db954' : '#282828', color: currentIdx===i && playing ? '#000' : '#fff',
                            border:'none', borderRadius:'8px', padding:'10px 14px', cursor:'pointer', textAlign:'left', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px', fontFamily:'inherit' }}>
                        <span>{currentIdx===i && playing ? '🔊' : '🎵'}</span>
                        {t.title}
                    </button>
                ))}
            </div>
            {currentIdx !== null && (
                <div style={{ marginTop:'12px', display:'flex', gap:'8px', alignItems:'center' }}>
                    <button onClick={() => setPlaying(p => !p)} style={{ background:'#1db954', color:'#000', border:'none', borderRadius:'6px', padding:'6px 16px', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
                        {playing ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button onClick={() => { setCurrentIdx(null); setPlaying(false); }} style={{ background:'#333', color:'#aaa', border:'none', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', fontFamily:'inherit' }}>⏹ Stop</button>
                </div>
            )}
            <audio ref={audioRef} src={currentIdx !== null ? tracks[currentIdx].url : ''} controls style={{ width:'100%', marginTop:'12px', borderRadius:'8px', display:'none' }} />
        </div>
    );
}

function ExplorerApp({ cart }) {
    const folders = ['Desktop','Downloads','Documents','Pictures','Music'];
    return (
        <div style={{ width:'460px', color:'#333' }}>
            <div style={{ background:'#f3f3f3', padding:'6px 12px', fontSize:'12px', borderBottom:'1px solid #ddd', borderRadius:'6px 6px 0 0', display:'flex', gap:'12px' }}>
                {['File','Home','Share','View'].map(m => <span key={m} style={{ cursor:'pointer' }}>{m}</span>)}
            </div>
            <div style={{ display:'flex', background:'white', borderRadius:'0 0 6px 6px', minHeight:'200px' }}>
                <div style={{ width:'120px', background:'#fafafa', padding:'8px', borderRight:'1px solid #ddd', fontSize:'12px' }}>
                    {folders.map(f => <div key={f} style={{ padding:'4px 8px', cursor:'pointer', borderRadius:'4px' }}>📁 {f}</div>)}
                </div>
                <div style={{ flex:1, padding:'10px' }}>
                    <p style={{ fontSize:'13px', fontWeight:600, margin:'0 0 8px 0' }}>💻 My PC → Hardware</p>
                    {(cart||[]).map((c,i) => <div key={i} style={{ fontSize:'12px', padding:'4px', borderBottom:'1px solid #f0f0f0', display:'flex', gap:'6px', alignItems:'center' }}>⚙️ <span style={{ fontWeight:600 }}>{c.type}:</span> {c.name}</div>)}
                    {(!cart||cart.length===0) && <p style={{ color:'#999', fontSize:'12px' }}>Trống</p>}
                </div>
            </div>
        </div>
    );
}

function NotepadApp() {
    const [text, setText] = useState('📝 Ghi chú\n\nMáy tính đã được lắp ráp thành công!\nChúc mừng bạn đã hoàn thành.');
    return (
        <div style={{ width:'400px' }}>
            <div style={{ background:'#f0f0f0', padding:'4px 12px', fontSize:'12px', borderRadius:'6px 6px 0 0', display:'flex', gap:'12px', color:'#333' }}>
                {['File','Edit','Format','View','Help'].map(m => <span key={m} style={{ cursor:'pointer' }}>{m}</span>)}
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} style={{ width:'100%', minHeight:'200px', fontFamily:'Consolas,monospace', fontSize:'13px', border:'none', outline:'none', padding:'12px', resize:'vertical', background:'white', borderRadius:'0 0 6px 6px', boxSizing:'border-box', color:'#333' }} />
        </div>
    );
}

function SpecsApp({ cart, scenarioName }) {
    return (
        <div style={{ width:'440px', background:'#1a1a2e', color:'white', borderRadius:'8px', padding:'20px' }}>
            {scenarioName && (
                <div style={{ background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', borderRadius:'8px', padding:'10px 14px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <span>💼</span>
                    <span style={{ fontSize:'13px', color:'#00d4aa', fontWeight:600 }}>{scenarioName}</span>
                </div>
            )}
            <h3 style={{ color:'#00d4aa', margin:'0 0 16px 0', display:'flex', alignItems:'center', gap:'8px' }}>💻 System Information</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ background:'rgba(0,212,170,0.05)', border:'1px solid rgba(0,212,170,0.1)', borderRadius:'8px', padding:'12px' }}>
                    <div style={{ fontSize:'11px', color:'#6b7280', fontWeight:700, textTransform:'uppercase', marginBottom:'8px' }}>Operating System</div>
                    <div style={{ color:'#e0e6ed' }}>Windows 11 Pro (64-bit)</div>
                </div>
                <div style={{ background:'rgba(0,212,170,0.05)', border:'1px solid rgba(0,212,170,0.1)', borderRadius:'8px', padding:'12px' }}>
                    <div style={{ fontSize:'11px', color:'#6b7280', fontWeight:700, textTransform:'uppercase', marginBottom:'8px' }}>Status</div>
                    <div style={{ color:'#10b981' }}>✅ All components working</div>
                    <div style={{ color:'#10b981' }}>✅ Drivers installed</div>
                    <div style={{ color:'#10b981' }}>✅ System stable</div>
                </div>
                {(cart||[]).map((c,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'12px', color:'#6b7280', textTransform:'uppercase', fontWeight:700 }}>{c.type}</span>
                        <span style={{ color:'#e0e6ed', fontSize:'13px' }}>{c.name || 'Installed'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WindowApp({ app, cart, scenarioName, onClose }) {
    const components = {
        calculator: CalculatorApp,
        browser: BrowserApp,
        youtube: YouTubeApp,
        wiki: WikiApp,
        music: MusicApp,
        explorer: () => <ExplorerApp cart={cart} />,
        notepad: NotepadApp,
        specs: () => <SpecsApp cart={cart} scenarioName={scenarioName} />,
    };
    const AppComponent = components[app.id];
    return (
        <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:100, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', borderRadius:'8px', overflow:'hidden', minWidth:'280px', maxWidth:'95vw', maxHeight:'90vh' }}>
            <div style={{ background:'#202020', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 12px', cursor:'move' }}>
                <span style={{ color:'white', fontSize:'13px', fontWeight:600 }}>{app.icon} {app.name}</span>
                <button onClick={onClose} style={{ width:'14px', height:'14px', borderRadius:'50%', background:'#ff5f57', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontSize:'10px', lineHeight:1 }}>✕</button>
            </div>
            <div style={{ background:'#1e1e1e', overflow:'auto', maxHeight:'calc(90vh - 36px)' }}>
                {AppComponent && <AppComponent cart={cart} />}
            </div>
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
        const t = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })), 1000);
        setTime(new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }));
        return () => clearInterval(t);
    }, []);

    // POST sequence
    useEffect(() => {
        if (phase !== 'post') return;
        const lines = [
            { msg: 'PC Master BIOS v2.04 (UEFI)', delay: 100 },
            { msg: `CPU: ${hasCPU ? 'Intel/AMD Detected ✓' : 'NOT FOUND ✗'}`, delay: 600 },
            { msg: `RAM: ${hasRAM ? `${counts['RAM']||0} stick(s) detected ✓` : 'NOT FOUND ✗'}`, delay: 1100 },
            { msg: `GPU: ${hasGPU ? 'PCIe device detected ✓' : 'NOT FOUND ✗'}`, delay: 1600 },
            { msg: `Storage: ${hasSSD ? 'NVMe/SATA detected ✓' : 'NOT FOUND ✗'}`, delay: 2100 },
            { msg: `PSU: ${hasPSU ? 'Power OK ✓' : 'POWER FAILURE ✗'}`, delay: 2600 },
        ];
        const timers = lines.map(({msg, delay}) => setTimeout(() => setBootMsgs(prev => [...prev, msg]), delay));
        const final = setTimeout(() => {
            if (allOK) {
                setBootMsgs(prev => [...prev, '', 'POST OK - BEEP (1 short beep)', 'Starting boot sequence...']);
                setTimeout(() => setPhase('boot'), 1500);
            } else {
                setBootMsgs(prev => [...prev, '', 'FATAL: POST failed - check components']);
                setTimeout(() => setPhase('error'), 1000);
            }
        }, 3000);
        return () => { timers.forEach(clearTimeout); clearTimeout(final); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'boot') return;
        const t = setInterval(() => setProgress(p => { if (p>=100) { clearInterval(t); setTimeout(() => setPhase('login'), 600); return 100; } return p + 1; }), 50);
        return () => clearInterval(t);
    }, [phase]);

    if (phase === 'post') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Consolas,"Courier New",monospace' }}>
            <div style={{ width:'600px', maxWidth:'90vw', background:'#000', border:'1px solid #1a1a1a', borderRadius:'4px', padding:'24px', boxShadow:'0 0 40px rgba(0,255,0,0.05)' }}>
                <pre style={{ color:'#00ff00', fontSize:'12px', lineHeight:1.3, marginBottom:'20px' }}>
{`  PC Master BIOS v2.04 (UEFI) - 2026
  =======================================
  CPU  : Intel/AMD                    [OK]
  Memory: Testing...                      `}
                </pre>
                <div style={{ color:'#c0c0c0', fontSize:'13px', lineHeight:1.8, fontFamily:'inherit' }}>
                    {bootMsgs.map((msg, i) => (
                        <div key={i} style={{ color: msg.startsWith('FATAL')||msg.includes('FAILURE')||msg.includes('NOT FOUND') ? '#ef4444' : msg.includes('OK') ? '#10b981' : msg.startsWith('POST OK') ? '#00ff00' : '#c0c0c0' }}>{msg}</div>
                    ))}
                    {bootMsgs.length <= 8 && <span style={{ color:'#00ff00' }}>_</span>}
                </div>
            </div>
        </div>
    );

    if (phase === 'error') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#0a0000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', fontFamily:'Consolas,monospace' }}>
            <div style={{ fontSize:'64px' }}>💥</div>
            <h2 style={{ color:'#ef4444', margin:0, fontSize:'22px' }}>POST FAILED - SYSTEM HALTED</h2>
            <div style={{ color:'#ff6666', lineHeight:2, fontSize:'14px' }}>
                {!hasCPU && <div>✗ CPU: Not detected</div>}
                {!hasRAM && <div>✗ RAM: Not detected</div>}
                {!hasGPU && <div>✗ GPU: Not detected</div>}
                {!hasSSD && <div>✗ Storage: Not detected</div>}
                {!hasPSU && <div>✗ PSU: Power failure</div>}
            </div>
            <p style={{ color:'#ff8888', fontSize:'13px', maxWidth:'400px', textAlign:'center' }}>System cannot boot. Check all components and try again.</p>
            <button onClick={onExit} style={{ padding:'10px 30px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:600, fontFamily:'inherit' }}>Back to Lab</button>
        </div>
    );

    if (phase === 'boot') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'32px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'8px', background:'linear-gradient(135deg,#0078d4,#50a0e0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', color:'white', fontWeight:'bold' }}>W</div>
                <div style={{ color:'white', fontSize:'28px', fontWeight:300, letterSpacing:'2px' }}>Windows 11</div>
            </div>
            <div style={{ width:'200px', height:'4px', background:'#333', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'#0078d4', borderRadius:'2px', transition:'width 0.05s linear' }} />
            </div>
            <div style={{ color:'#666', fontSize:'13px' }}>Starting up...</div>
        </div>
    );

    if (phase === 'login') return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'linear-gradient(135deg,#0078d4,#003c6b,#002a4e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', border:'2px solid rgba(255,255,255,0.3)' }}>👤</div>
            <div style={{ color:'white', fontSize:'20px', fontWeight:300 }}>PC Master User</div>
            {scenarioName && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>💼 {scenarioName}</div>}
            <button onClick={() => setPhase('desktop')}
                style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 36px', borderRadius:'4px', cursor:'pointer', fontSize:'14px', marginTop:'8px', fontFamily:'inherit', backdropFilter:'blur(10px)' }}>
                Sign in →
            </button>
        </div>
    );

    const wallpaperColors = 'linear-gradient(135deg,#0f1b2d 0%,#0d2137 40%,#1a0533 100%)';
    return (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:wallpaperColors, fontFamily:"'Segoe UI',sans-serif", userSelect:'none' }}>
            {/* Desktop Icons */}
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'4px', width:'80px' }}>
                {APPS.map(app => (
                    <div key={app.id} onClick={() => { setOpenApp(app); setStartOpen(false); }}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', cursor:'pointer', padding:'8px 4px', borderRadius:'8px', color:'white' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize:'28px' }}>{app.icon}</span>
                        <span style={{ fontSize:'11px', textAlign:'center', textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>{app.name}</span>
                    </div>
                ))}
            </div>

            {/* Open App Window */}
            {openApp && <WindowApp app={openApp} cart={cart} scenarioName={scenarioName} onClose={() => setOpenApp(null)} />}

            {/* Taskbar */}
            <div onClick={e => e.stopPropagation()} style={{ position:'fixed', bottom:0, left:0, right:0, height:'48px', background:'rgba(32,32,32,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', zIndex:200 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
                    {/* Start Button */}
                    <button onClick={() => setStartOpen(v => !v)} style={{ background:'transparent', border:'none', fontSize:'22px', cursor:'pointer', padding:'4px 12px', borderRadius:'6px', height:'40px', display:'flex', alignItems:'center' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ width:'24px', height:'24px', borderRadius:'4px', background:'linear-gradient(135deg,#0078d4,#60b0ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'14px', fontWeight:'bold' }}>W</span>
                    </button>
                    {/* Search */}
                    <button onClick={() => alert('🔍 Mở Edge để search Google\n📖 Mở Wiki PC để tra thuật ngữ')} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:'#888', padding:'4px 16px', borderRadius:'20px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px', height:'30px', fontFamily:'inherit', margin:'0 4px' }}>
                        🔍 <span>Search</span>
                    </button>
                    {/* Taskbar Apps */}
                    {APPS.map(app => (
                        <button key={app.id} onClick={() => setOpenApp(app)} title={app.name}
                            style={{ background: openApp?.id===app.id ? 'rgba(255,255,255,0.15)' : 'transparent', border:'none', fontSize:'20px', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', height:'40px', display:'flex', alignItems:'center', borderBottom: openApp?.id===app.id ? '2px solid #0078d4' : '2px solid transparent' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseOut={e => { if (openApp?.id !== app.id) e.currentTarget.style.background = 'transparent'; }}>
                            {app.icon}
                        </button>
                    ))}
                </div>
                {/* System Tray */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <button onClick={onExit} style={{ background:'rgba(239,68,68,0.8)', color:'white', border:'none', padding:'4px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'11px', fontWeight:700, fontFamily:'inherit' }}>
                        ⏻ Shut Down
                    </button>
                    <div style={{ color:'white', fontSize:'12px', textAlign:'right', lineHeight:1.2 }}>
                        <div style={{ fontWeight:600 }}>{time}</div>
                        <div style={{ color:'#888', fontSize:'10px' }}>{new Date().toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
            </div>

            {/* Start Menu */}
            {startOpen && (
                <div onClick={e => e.stopPropagation()} style={{ position:'fixed', bottom:'56px', left:'8px', width:'480px', maxWidth:'90vw', background:'rgba(40,40,40,0.98)', backdropFilter:'blur(30px)', borderRadius:'12px', padding:'20px', border:'1px solid rgba(255,255,255,0.08)', zIndex:300 }}>
                    <div style={{ color:'white', fontWeight:600, marginBottom:'12px', fontSize:'13px' }}>Pinned Apps</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' }}>
                        {APPS.map(app => (
                            <button key={app.id} onClick={() => { setOpenApp(app); setStartOpen(false); }}
                                style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'10px 4px', borderRadius:'8px', color:'white', fontFamily:'inherit' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize:'28px' }}>{app.icon}</span>
                                <span style={{ fontSize:'10px', color:'#ccc' }}>{app.name}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ color:'#aaa', fontSize:'12px' }}>👤 PC Master User {scenarioName && `· ${scenarioName}`}</span>
                        <button onClick={onExit} style={{ background:'transparent', border:'none', color:'#888', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>⏻ Power</button>
                    </div>
                </div>
            )}
        </div>
    );
}
