'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Monitor, HardDrive, Wifi, User, Shield, CheckCircle2, Loader2, Zap, Cpu, MemoryStick, Smartphone, Gamepad2, Tv, Download, Music, Globe, Star, AlertTriangle, Clock, RefreshCw } from 'lucide-react'

const STEPS = [
  { id: 'check', label: 'Kiểm tra PC', icon: <Monitor size={16} />, color: '#6366f1' },
  { id: 'boot', label: 'Boot USB', icon: <HardDrive size={16} />, color: '#f59e0b' },
  { id: 'install', label: 'Cài đặt', icon: <Cpu size={16} />, color: '#10b981' },
  { id: 'account', label: 'Tài khoản', icon: <User size={16} />, color: '#3b82f6' },
  { id: 'finish', label: 'Hoàn tất', icon: <Star size={16} />, color: '#ec4899' },
]

const BIOS_KEYS = ['F2', 'DEL', 'F12', 'ESC', 'F10', 'F1']

export default function CaiDatWin11Page() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showGame, setShowGame] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [biosKey, setBiosKey] = useState('')
  const [installChoice, setInstallChoice] = useState<'upgrade' | 'custom' | null>(null)
  const [userName, setUserName] = useState('')
  const [pcName, setPcName] = useState('')
  const [showBiosQuiz, setShowBiosQuiz] = useState(false)
  const [biosQuizDone, setBiosQuizDone] = useState(false)
  const [wifiSelected, setWifiSelected] = useState(false)
  const [done, setDone] = useState(false)
  const [dotCount, setDotCount] = useState(0)
  const gameRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef(0)
  const gameLoopRef = useRef<any>(null)
  const [showingBlueScreen, setShowingBlueScreen] = useState(false)

  // Dots animation
  useEffect(() => { if (step === 2 || showingBlueScreen) { const i = setInterval(() => setDotCount(d => (d + 1) % 4), 500); return () => clearInterval(i) } }, [step, showingBlueScreen])

  // Blue screen surprise
  const triggerBlueScreen = useCallback(() => {
    setShowingBlueScreen(true)
    setTimeout(() => { setShowingBlueScreen(false); setStep(3) }, 3000)
  }, [])

  function advanceToBoot() {
    if (step === 0) {
      setStep(1)
      setTimeout(() => {
        setShowBiosQuiz(true)
      }, 500)
    }
  }

  function handleBiosAnswer(key: string) {
    setBiosKey(key)
    setBiosQuizDone(true)
    setShowBiosQuiz(false)
    setTimeout(() => {
      setStep(2)
      startInstallProgress()
    }, 800)
  }

  function startInstallProgress() {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + Math.random() * 3 + 0.5
      })
    }, 200)
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      // Surprise: mini-game during install
      setTimeout(() => {
        setShowGame(true)
      }, 500)
    }, 6000)
  }

  function startMiniGame() {
    setGameActive(true)
    scoreRef.current = 0
    let pos = { x: 50, y: 50 }
    let target = { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
    let frame = 0

    const gameLoop = () => {
      frame++
      if (frame % 30 === 0) {
        target = { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
      }
      if (gameRef.current) {
        gameRef.current.innerHTML = `<div style="position:absolute;left:${target.x}%;top:${target.y}%;width:24px;height:24px;background:#00d4aa;border-radius:50%;box-shadow:0 0 20px rgba(0,212,170,0.6);animation:pulse 0.5s infinite;cursor:pointer" onclick="window.clickTarget(${target.x},${target.y})"></div>`
      }
      gameLoopRef.current = setTimeout(gameLoop, 100)
    }

    // Global click handler
    ;(window as any).clickTarget = (x: number, y: number) => {
      scoreRef.current++
      setGameScore(scoreRef.current)
      target = { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
    }
    gameLoop()
  }

  function endMiniGame() {
    clearTimeout(gameLoopRef.current)
    setGameActive(false)
    setShowGame(false)
    triggerBlueScreen()
  }

  function finishInstall() {
    setStep(4)
    setDone(true)
  }

  const formatTime = () => {
    const m = Math.floor(progress / 10)
    const s = Math.floor((progress * 3) % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <header className="border-b p-3 px-4 flex items-center gap-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold cursor-pointer"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Thoát
        </button>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0078d4, #00a8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
          ⊞
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Cài đặt Windows 11 Pro</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hướng dẫn thực tế từ boot USB đến hoàn tất</p>
        </div>
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              width: '28px', height: '4px', borderRadius: '2px',
              background: i <= step ? s.color : 'var(--border-default)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {/* STEP 0: PC Check */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🖥️</div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Kiểm tra tương thích Windows 11</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Trước khi cài, hãy đảm bảo PC của bạn đáp ứng yêu cầu</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {[
                { icon: <Cpu size={18} />, label: 'CPU 64-bit 1GHz+', ok: true, detail: 'Intel Core i5 / AMD Ryzen 5 trở lên' },
                { icon: <MemoryStick size={18} />, label: 'RAM tối thiểu 8GB', ok: true, detail: 'Khuyến nghị 16GB cho hiệu năng tốt nhất' },
                { icon: <HardDrive size={18} />, label: 'Ổ cứng 64GB+', ok: true, detail: 'SSD khuyến nghị để khởi động nhanh' },
                { icon: <Shield size={18} />, label: 'TPM 2.0', ok: true, detail: 'Hầu hết PC từ 2018 trở lên đều có' },
                { icon: <Monitor size={18} />, label: 'Secure Boot', ok: true, detail: 'Bật trong BIOS/UEFI' },
                { icon: <Smartphone size={18} />, label: 'Màn hình 720p+', ok: true, detail: 'Màn hình 9 inch trở lên' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.detail}</div>
                  </div>
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                </motion.div>
              ))}
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px', fontSize: '13px', lineHeight: '1.6' }}>
              <strong style={{ color: '#818cf8' }}>Mẹo thực tế:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Nếu PC chưa bật TPM 2.0, vào BIOS (nhấn {BIOS_KEYS[Math.floor(Math.random() * BIOS_KEYS.length)]} khi khởi động) → Security → TPM → Enable. Nếu không có TPM, bạn có thể cài Win11 bằng cách chỉnh Registry (có hướng dẫn trong bước sau).</span>
            </div>

            <button onClick={advanceToBoot}
              className="w-full py-3 font-bold rounded-xl text-sm cursor-pointer"
              style={{ background: '#0078d4', border: 'none', color: '#fff', fontFamily: 'inherit' }}>
              PC đạt yêu cầu! Tiếp tục →
            </button>
          </motion.div>
        )}

        {/* STEP 1: Boot USB */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💿</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Boot từ USB cài đặt</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cắm USB boot → khởi động lại → nhấn phím để vào Boot Menu</p>
            </div>

            <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} style={{ color: '#f59e0b' }} /> BIOS Quiz
              </h3>
              {!showBiosQuiz && !biosQuizDone && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Đang khởi động lại vào BIOS...</p>
                </div>
              )}
              {showBiosQuiz && (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px' }}>Khi máy tính khởi động lại, bạn thấy màn hình đen hiện logo hãng. Bạn cần nhấn phím nào để vào Boot Menu?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {BIOS_KEYS.map(key => (
                      <button key={key} onClick={() => handleBiosAnswer(key)}
                        style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '18px', fontWeight: 800, fontFamily: 'monospace' }}>
                        {key}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                    Mẹo: Thường là F2 (Dell/Lenovo), DEL (ASUS/Gigabyte/MSI), F12 (HP)
                  </p>
                </div>
              )}
              {biosQuizDone && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>Chọn USB trong Boot Menu → Enter</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Nhấn {biosKey} → chọn USB → Windows 11 bắt đầu tải file cài đặt</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Installing with progress */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!showGame ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px', display: 'inline-block', filter: 'drop-shadow(0 0 30px rgba(0,120,212,0.4))' }}>⊞</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', color: '#0078d4' }}>Đang cài đặt Windows 11...</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Vui lòng không tắt máy trong quá trình cài đặt</p>

                <div style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{Math.min(100, Math.round(progress))}%</span>
                    <span>{formatTime()}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #0078d4, #00a8ff)', transition: 'width 0.2s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {['Đang sao chép tập tin cài đặt', 'Đang cài đặt tính năng', 'Đang áp dụng cài đặt', 'Đang chuẩn bị thiết bị'][Math.floor(progress / 25)]}
                    {'•'.repeat(dotCount)}
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', maxWidth: '400px', margin: '0 auto', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>📌 Thực tế:</span>{' '}
                  Trong lúc chờ, nếu cài Win11 trên ổ SSD NVMe thì chỉ mất 5-10 phút. HDD có thể lâu hơn (20-30 phút).{' '}
                  {progress > 50 && <><br />⚡ <strong>Bí kíp:</strong> Cài Win 11 trên ổ SSD rời (external) cũng được!</>}
                </div>

                {progress >= 100 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '8px' }}>
                      🎮 Bất ngờ! Trong lúc chờ, bạn muốn chơi game không?
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={startMiniGame}
                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--brand-primary)', background: 'rgba(0,212,170,0.1)', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                        🎯 Chơi game (click target)
                      </button>
                      <button onClick={endMiniGame}
                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                        Bỏ qua → Bước tiếp
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>🎯 Click Target Game</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Click vào các chấm xanh xuất hiện! Điểm: <strong style={{ color: 'var(--brand-primary)' }}>{gameScore}</strong>
                </p>
                <div ref={gameRef}
                  style={{ width: '100%', height: '300px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
                  {gameActive && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Đợi mục tiêu xuất hiện...</div>}
                </div>
                <button onClick={endMiniGame}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0078d4', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                  {gameScore > 5 ? `🏆 ${gameScore} điểm! Tiếp tục` : 'Kết thúc → Bước tiếp'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Surprise: Blue Screen */}
        {showingBlueScreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#0a4b8c', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Segoe UI", system-ui, sans-serif',
              padding: '40px',
            }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.8 }}>:(</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
              PC của bạn đã gặp sự cố và cần khởi động lại
            </h2>
            <div style={{ fontSize: '13px', opacity: 0.7, textAlign: 'center', lineHeight: '1.8', maxWidth: '500px' }}>
              <p>Lỗi: CRITICAL_PROCESS_DIED</p>
              <p style={{ marginTop: '8px' }}>💡 Đùa thôi! Đây là cảnh báo thực tế: màn hình xanh (BSOD) là lỗi thường gặp khi cài Win11 nếu driver không tương thích.</p>
              <p style={{ marginTop: '8px' }}>Trong thực tế, nhấn <strong>Enter</strong> để khởi động lại máy. Nếu lỗi tái diễn, hãy kiểm tra RAM và ổ cứng!</p>
              <div style={{ marginTop: '40px', fontSize: '12px', opacity: 0.5 }}>Tiến độ: 100% · Đang khởi động lại...</div>
              <div style={{ marginTop: '8px' }}>{'•'.repeat(dotCount)}</div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Account Setup */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Thiết lập tài khoản</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Bước cuối trước khi vào desktop</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Tên người dùng</label>
                <input value={userName} onChange={e => setUserName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>Tên PC</label>
                <input value={pcName} onChange={e => setPcName(e.target.value)}
                  placeholder="VD: PCMASTER-PC"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '13px', lineHeight: '1.6' }}>
                <strong style={{ color: '#818cf8' }}>🔧 Mẹo thực tế:</strong>{' '}
                {userName ? (
                  <span style={{ color: 'var(--text-primary)' }}>Bạn có thể dùng tên thật hoặc nickname. Tên PC nên đặt dễ nhớ (VD: PC-GAMING, WORK-LAPTOP) để dễ nhận diện trên mạng.</span>
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>Sau này bạn có thể thay đổi tên trong Settings → System → About → Rename this PC.</span>
                )}
              </div>
            </div>

            <button onClick={finishInstall} disabled={!userName.trim() || !pcName.trim()}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: !userName.trim() || !pcName.trim() ? 'var(--text-muted)' : '#0078d4', color: '#fff', fontWeight: 700, cursor: !userName.trim() || !pcName.trim() ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
              Hoàn tất cài đặt →
            </button>
          </motion.div>
        )}

        {/* STEP 4: Done */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px', filter: 'drop-shadow(0 0 30px rgba(0,212,170,0.3))' }}>🎉</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Windows 11 đã sẵn sàng!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Xin chào {userName}! Desktop đang được chuẩn bị...</p>

              <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: '0 auto 24px' }}>
                {[
                  { icon: <Globe size={16} />, text: 'Cài trình duyệt', desc: 'Chrome / Edge / Cốc Cốc' },
                  { icon: <Download size={16} />, text: 'Cập nhật driver', desc: 'NVIDIA / AMD / Intel' },
                  { icon: <Music size={16} />, text: 'Cài Office/WPS', desc: 'Word, Excel, PowerPoint' },
                  { icon: <Shield size={16} />, text: 'Bật bảo vệ', desc: 'Windows Defender + Firewall' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--brand-primary)', marginBottom: '4px' }}>{item.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.text}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6', textAlign: 'left' }}>
                <strong style={{ color: '#10b981' }}>✅ Checklist sau cài đặt:</strong>
                <div style={{ color: 'var(--text-primary)', marginTop: '6px' }}>
                  1. Cắm mạng → Windows Update ngay (quan trọng nhất!)<br />
                  2. Cài driver chipset + VGA từ trang chủ<br />
                  3. Cập nhật Windows đến bản mới nhất<br />
                  4. Cài phần mềm cần thiết: trình duyệt, Office, WinRAR...<br />
                  5. Tạo điểm khôi phục (Restore Point) — phòng khi cần rollback
                </div>
              </div>

              <button onClick={() => router.push('/builder')}
                style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'var(--brand-primary)', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                🚀 Vào Builder để lắp PC thật!
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  )
}
