'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Monitor, HardDrive, User, Shield, CheckCircle2,
  Cpu, MemoryStick, Smartphone, Globe,
  ExternalLink, ChevronRight, AlertTriangle, Clock,
  Disc, FileText, RefreshCw, Power, ChevronLeft,
} from 'lucide-react'

const WindowsSimulator = dynamic(() => import('@/components/WindowsSimulator'), { ssr: false })

const REAL_STEPS = [
  { id: 'check', label: 'Kiểm tra PC', icon: <Monitor size={14} />, color: '#6366f1' },
  { id: 'bios', label: 'Boot USB', icon: <HardDrive size={14} />, color: '#f59e0b' },
  { id: 'logo', label: 'Khởi động', icon: <Power size={14} />, color: '#0078d4' },
  { id: 'setup', label: 'Ngôn ngữ', icon: <Globe size={14} />, color: '#3b82f6' },
  { id: 'license', label: 'License', icon: <FileText size={14} />, color: '#8b5cf6' },
  { id: 'drive', label: 'Ổ đĩa', icon: <Disc size={14} />, color: '#10b981' },
  { id: 'install', label: 'Cài đặt', icon: <Cpu size={14} />, color: '#0078d4' },
  { id: 'restart', label: 'Restart', icon: <RefreshCw size={14} />, color: '#f59e0b' },
  { id: 'oobe', label: 'OOBE', icon: <User size={14} />, color: '#6366f1' },
  { id: 'desktop', label: 'Desktop', icon: <Monitor size={14} />, color: '#10b981' },
]

const BIOS_KEYS = ['F2', 'DEL', 'F12', 'ESC', 'F10', 'F1']

const BIOS_MENU_ITEMS = [
  { label: 'Main', description: 'System information, Date, Time' },
  { label: 'Advanced', description: 'CPU Configuration, SATA Settings' },
  { label: 'Boot', description: 'Boot priority, Fast Boot' },
  { label: 'Security', description: 'Password, TPM, Secure Boot' },
  { label: 'Save & Exit', description: 'Save changes and reset' },
]

const BOOT_DEVICES = [
  { label: 'UEFI: USB Drive (SanDisk 3.2Gen1)', type: 'usb' as const },
  { label: 'Windows Boot Manager', type: 'windows' as const },
  { label: 'SATA: ST1000DM003-1CH162', type: 'hdd' as const },
  { label: 'CD/DVD: HL-DT-ST DVDRAM', type: 'dvd' as const },
]

const SAVE_OPTIONS = ['Yes, Save & Exit', 'No, Discard Changes', 'Return to BIOS']

const LANGUAGES = [
  { code: 'vi-VN', label: 'Tiếng Việt', native: 'Tiếng Việt' },
  { code: 'en-US', label: 'English (United States)', native: 'English' },
  { code: 'ja-JP', label: 'Japanese', native: '日本語' },
  { code: 'ko-KR', label: 'Korean', native: '한국어' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', native: '中文(简体)' },
]

const KEYBOARD_LAYOUTS = [
  { code: 'US', label: 'US' },
  { code: 'VN', label: 'Vietnamese' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'JP', label: 'Japanese' },
]

const DRIVES = [
  { id: 'drive0', label: 'Drive 0 Unallocated Space', size: '238.5 GB', type: 'SSD', icon: '💾' },
  { id: 'drive1', label: 'Drive 1 Unallocated Space', size: '931.5 GB', type: 'HDD', icon: '💿' },
]

const INSTALL_PHASES = [
  { label: 'Copying Windows files', min: 0, max: 15, icon: '📋', color: '#0078d4' },
  { label: 'Installing features', min: 15, max: 40, icon: '⚙️', color: '#3b82f6' },
  { label: 'Installing updates', min: 40, max: 60, icon: '🔄', color: '#8b5cf6' },
  { label: 'Finalizing installation', min: 60, max: 85, icon: '✅', color: '#10b981' },
  { label: 'Getting devices ready', min: 85, max: 100, icon: '🔧', color: '#f59e0b' },
]

type BiosSubStep = 'boot_screen' | 'main_menu' | 'boot_menu' | 'save_exit'

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'square'
    gain.gain.value = 0.08
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch { }
}

function BiosScreen({ children, title }: { children: React.ReactNode; title: string }) {
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: '#000080', color: '#c0c0c0', fontFamily: '"Courier New", Consolas, monospace',
      borderRadius: '12px', border: '2px solid #4040a0', overflow: isMobile ? 'auto' : 'hidden',
      boxShadow: '0 0 40px rgba(0,0,128,0.3)',
    }}>
      <div style={{ background: '#000060', padding: '8px 16px', borderBottom: '1px solid #4040a0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>PhoenixBIOS 4.0 Release 6.0</span>
          <span style={{ color: '#a0a0ff', fontSize: '11px' }}>Copyright 1985-2023 Phoenix Technologies Ltd.</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px', fontSize: '13px', lineHeight: '1.6' }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>{title}</div>
        {children}
      </div>
      <div style={{ background: '#000060', padding: '6px 16px', borderTop: '1px solid #4040a0', display: 'flex', gap: '16px', fontSize: '11px', color: '#8080d0' }}>
        <span>F1 Help</span>
        <span>↑↓ Select</span>
        <span>Enter Execute</span>
        <span>ESC Exit</span>
      </div>
    </div>
  )
}

export default function CaiDatWin11Page() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [userName, setUserName] = useState('')
  const [pcName, setPcName] = useState('')
  const [dotCount, setDotCount] = useState(0)
  const [selectedLang, setSelectedLang] = useState(0)
  const [selectedKeyboard, setSelectedKeyboard] = useState(0)
  const [selectedDrive, setSelectedDrive] = useState(0)
  const [licenseAccepted, setLicenseAccepted] = useState(false)
  const [restartCountdown, setRestartCountdown] = useState(10)
  const [privacySettings, setPrivacySettings] = useState({
    location: true, diagnostics: true, ads: false, tailored: true,
  })

  const [biosSubStep, setBiosSubStep] = useState<BiosSubStep>('boot_screen')
  const [biosMenuIndex, setBiosMenuIndex] = useState(0)
  const [biosBootIndex, setBiosBootIndex] = useState(0)
  const [biosSaveIndex, setBiosSaveIndex] = useState(0)
  const [biosRequiredKey] = useState('DEL')
  const [biosLoading, setBiosLoading] = useState(true)
  const [biosErrorMessage, setBiosErrorMessage] = useState('')
  const [biosTransition, setBiosTransition] = useState(false)
  const [biosDone, setBiosDone] = useState(false)
  const biosMountedRef = useRef(true)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const currentPhase = INSTALL_PHASES.find(p => progress >= p.min && progress < p.max) || INSTALL_PHASES[INSTALL_PHASES.length - 1]

  useEffect(() => {
    biosMountedRef.current = true
    return () => { biosMountedRef.current = false }
  }, [])

  useEffect(() => {
    if (step === 6 || step === 8) {
      const i = setInterval(() => setDotCount(d => (d + 1) % 4), 500)
      return () => clearInterval(i)
    }
  }, [step])

  useEffect(() => {
    if (step === 7 && restartCountdown > 0) {
      const t = setTimeout(() => setRestartCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (step === 7 && restartCountdown === 0) {
      const t = setTimeout(() => { setStep(8); setRestartCountdown(10) }, 500)
      return () => clearTimeout(t)
    }
  }, [step, restartCountdown])

  const enterBios = useCallback(() => {
    playBeep()
    setBiosErrorMessage('')
    setBiosLoading(true)
    setTimeout(() => {
      if (biosMountedRef.current) {
        setBiosLoading(false)
        setBiosSubStep('main_menu')
      }
    }, 600)
  }, [])

  useEffect(() => {
    if (step !== 1 || biosTransition || biosDone) return
    const handler = (e: KeyboardEvent) => {
      if (biosSubStep === 'boot_screen') {
        const key = e.key.toUpperCase()
        if (key === 'DELETE' || key === 'F2') {
          e.preventDefault()
          enterBios()
          return
        }
        if (key !== 'SHIFT' && key !== 'CONTROL' && key !== 'ALT') {
          setBiosErrorMessage(`Phím "${e.key}" không hợp lệ! Cần nhấn DEL hoặc F2 để vào BIOS.`)
          setTimeout(() => setBiosErrorMessage(''), 2000)
        }
      }
      if (biosSubStep === 'main_menu') {
        if (e.key === 'ArrowUp') { e.preventDefault(); setBiosMenuIndex(i => Math.max(0, i - 1)) }
        if (e.key === 'ArrowDown') { e.preventDefault(); setBiosMenuIndex(i => Math.min(BIOS_MENU_ITEMS.length - 1, i + 1)) }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (BIOS_MENU_ITEMS[biosMenuIndex].label === 'Boot') {
            playBeep()
            setBiosSubStep('boot_menu')
            setBiosErrorMessage('')
          } else {
            setBiosErrorMessage(`Chọn "Boot" để tiếp tục! (Đang chọn: ${BIOS_MENU_ITEMS[biosMenuIndex].label})`)
            setTimeout(() => setBiosErrorMessage(''), 2000)
          }
        }
      }
      if (biosSubStep === 'boot_menu') {
        if (e.key === 'ArrowUp') { e.preventDefault(); setBiosBootIndex(i => Math.max(0, i - 1)) }
        if (e.key === 'ArrowDown') { e.preventDefault(); setBiosBootIndex(i => Math.min(BOOT_DEVICES.length - 1, i + 1)) }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (BOOT_DEVICES[biosBootIndex].type === 'usb') {
            playBeep()
            setBiosSubStep('save_exit')
            setBiosErrorMessage('')
          } else {
            setBiosErrorMessage(`Không thể boot từ "${BOOT_DEVICES[biosBootIndex].label}". Chọn USB!`)
            setTimeout(() => setBiosErrorMessage(''), 2500)
          }
        }
      }
      if (biosSubStep === 'save_exit') {
        if (e.key === 'ArrowUp') { e.preventDefault(); setBiosSaveIndex(i => Math.max(0, i - 1)) }
        if (e.key === 'ArrowDown') { e.preventDefault(); setBiosSaveIndex(i => Math.min(SAVE_OPTIONS.length - 1, i + 1)) }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (SAVE_OPTIONS[biosSaveIndex] === 'Yes, Save & Exit') {
            playBeep()
            setBiosTransition(true)
            setBiosDone(true)
            setTimeout(() => {
              setStep(2)
            }, 2000)
          } else if (SAVE_OPTIONS[biosSaveIndex] === 'No, Discard Changes') {
            setBiosSubStep('main_menu')
            setBiosMenuIndex(0)
            setBiosErrorMessage('')
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, biosSubStep, biosMenuIndex, biosBootIndex, biosSaveIndex, biosTransition, biosDone, enterBios])

  useEffect(() => {
    if (step === 1 && biosSubStep === 'boot_screen') {
      const t = setTimeout(() => setBiosLoading(false), 1200)
      return () => clearTimeout(t)
    }
  }, [step, biosSubStep])

  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 4000)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    if (isInstalling) {
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressRef.current) clearInterval(progressRef.current)
            return 100
          }
          return prev + Math.random() * 1.8 + 0.3
        })
      }, 250)
      return () => { if (progressRef.current) clearInterval(progressRef.current) }
    }
  }, [isInstalling])

  function advanceToBoot() {
    setStep(1)
    setBiosSubStep('boot_screen')
    setBiosMenuIndex(0)
    setBiosBootIndex(0)
    setBiosSaveIndex(0)
    setBiosLoading(true)
    setBiosErrorMessage('')
    setBiosTransition(false)
    setBiosDone(false)
  }

  const formatTime = () => {
    const m = Math.floor(progress / 12)
    const s = Math.floor((progress * 2.5) % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const renderStepIndicator = () => (
    <div className="flex gap-1">
      {REAL_STEPS.slice(0, 6).map((s, i) => (
        <div key={s.id} style={{
          width: '24px', height: '4px', borderRadius: '2px',
          background: i <= step ? s.color : 'var(--border-default)',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  )

  if (biosTransition && step === 1) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#000', color: '#fff' }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(0,120,212,0.5))' }}>⊞</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0078d4', marginBottom: '8px' }}>Đã lưu thay đổi BIOS</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Đang khởi động lại và boot từ USB...</p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0078d4' }} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
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
        {renderStepIndicator()}
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {/* STEP 0: PC Check */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🖥️</div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Kiểm tra tương thích Windows 11</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Trước khi cài, hãy đảm bảo PC đáp ứng yêu cầu hệ thống</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { icon: <Cpu size={16} />, label: 'CPU 64-bit 1GHz+ (Intel Core i5 / AMD Ryzen 5)', ok: true },
                { icon: <MemoryStick size={16} />, label: 'RAM tối thiểu 8GB (khuyến nghị 16GB)', ok: true },
                { icon: <HardDrive size={16} />, label: 'Ổ cứng 64GB+ (SSD khuyến nghị)', ok: true },
                { icon: <Shield size={16} />, label: 'TPM 2.0 (Hầu hết PC từ 2018 trở lên đều có)', ok: true },
                { icon: <Monitor size={16} />, label: 'Secure Boot (Bật trong BIOS/UEFI)', ok: true },
                { icon: <Smartphone size={16} />, label: 'Màn hình 720p+, 9 inch trở lên', ok: true },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                </motion.div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '12px', lineHeight: '1.6', marginBottom: '16px' }}>
              <strong style={{ color: '#10b981' }}>Thực tế:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Nếu PC chưa bật TPM 2.0, vào BIOS (nhấn F2/DEL khi khởi động) → Security → TPM → Enable. Nếu không có TPM, bạn có thể cài Win11 bằng cách chỉnh Registry.</span>
            </div>

            <button onClick={advanceToBoot}
              className="w-full py-3 font-bold rounded-xl text-sm cursor-pointer"
              style={{ background: '#0078d4', border: 'none', color: '#fff', fontFamily: 'inherit' }}>
              PC đạt yêu cầu! Boot từ USB →
            </button>
          </motion.div>
        )}

        {/* STEP 1: BIOS Simulator */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💿</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Mô phỏng BIOS / Boot USB</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Trải nghiệm thực tế cách vào BIOS và chọn boot từ USB</p>
            </div>

            {biosSubStep === 'boot_screen' && (
              <motion.div key="bs_boot_screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BiosScreen title="PhoenixBIOS Setup Utility">
                  {biosLoading ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ color: '#ffff00', fontSize: '12px', marginBottom: '12px' }}>BIOS Loading...</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {[0, 1, 2, 3].map(i => (
                          <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            style={{ width: '8px', height: '8px', background: '#ffff00', borderRadius: '50%' }} />
                        ))}
                      </div>
                      <div style={{ color: '#8080d0', fontSize: '10px', marginTop: '12px' }}>Initializing controllers... Checking memory...</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: '11px', color: '#8080d0', marginBottom: '10px' }}>PhoenixBIOS 4.0 Release 6.0 - System Boot</div>
                      <div style={{ fontSize: '11px', color: '#c0c0c0', marginBottom: '16px' }}>
                        CPU: Intel Core i7-14700K @ 3.40 GHz<br />
                        Memory: 32768MB (32GB DDR5)<br />
                        System: Windows 11 Pro (64-bit)
                      </div>
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ display: 'inline-block', padding: '10px 20px', border: '2px solid #ffff00', borderRadius: '8px', marginBottom: '12px', background: 'rgba(255,255,0,0.05)' }}>
                        <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: '13px', fontFamily: 'monospace' }}>
                          Press <span style={{ fontSize: '16px', border: '1px solid #ffff00', padding: '2px 6px', borderRadius: '4px', margin: '0 4px' }}>DEL</span> to enter BIOS setup
                        </div>
                      </motion.div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {BIOS_KEYS.map(key => (
                          <kbd key={key} onClick={() => { if (key === 'DEL' || key === 'F2') enterBios() }}
                            style={{
                              padding: '6px 12px', borderRadius: '6px', border: '1px solid #4040a0',
                              background: key === 'DEL' ? 'rgba(255,255,0,0.15)' : 'rgba(64,64,160,0.3)',
                              color: key === 'DEL' ? '#ffff00' : '#8080d0',
                              cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
                            }}>
                            {key}
                          </kbd>
                        ))}
                      </div>
                      {biosErrorMessage && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(255,0,0,0.15)', border: '1px solid #ff4444', borderRadius: '4px', color: '#ff6666', fontSize: '11px' }}>
                          <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          {biosErrorMessage}
                        </motion.div>
                      )}
                    </div>
                  )}
                </BiosScreen>

                <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '11px', lineHeight: '1.5' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>Mẹo:</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>Nhấn <strong>DEL</strong> hoặc <strong>F2</strong> để vào BIOS. Trên máy thật, nhấn liên tục phím khi thấy logo hãng.</span>
                </div>
              </motion.div>
            )}

            {biosSubStep === 'main_menu' && (
              <motion.div key="bs_main_menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BiosScreen title="Main Menu - Select Boot">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                    {BIOS_MENU_ITEMS.map((item, i) => (
                      <motion.div key={i} whileHover={{ x: 2 }}
                        onClick={() => {
                          if (item.label === 'Boot') { playBeep(); setBiosSubStep('boot_menu') }
                          else { setBiosErrorMessage(`Chọn "Boot" để tiếp tục!`); setTimeout(() => setBiosErrorMessage(''), 2000) }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer',
                          background: biosMenuIndex === i ? 'rgba(255,255,0,0.12)' : 'transparent',
                          border: biosMenuIndex === i ? '1px solid #ffff00' : '1px solid transparent',
                          borderRadius: '4px', transition: 'all 0.15s', fontSize: '12px',
                        }}>
                        <span style={{ color: biosMenuIndex === i ? '#ffff00' : '#c0c0c0' }}>{item.label}</span>
                        <span style={{ fontSize: '10px', color: '#8080d0', marginLeft: '8px' }}>{item.description}</span>
                        {biosMenuIndex === i && <ChevronRight size={12} style={{ color: '#ffff00', marginLeft: 'auto' }} />}
                      </motion.div>
                    ))}
                  </div>
                  {biosErrorMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '6px 10px', background: 'rgba(255,0,0,0.12)', border: '1px solid #ff4444', borderRadius: '4px', color: '#ff6666', fontSize: '10px' }}>
                      {biosErrorMessage}
                    </motion.div>
                  )}
                </BiosScreen>
              </motion.div>
            )}

            {biosSubStep === 'boot_menu' && (
              <motion.div key="bs_boot_menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BiosScreen title="Boot Menu - Select USB Drive">
                  <div style={{ fontSize: '11px', color: '#a0a0ff', marginBottom: '8px' }}>Select boot device:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {BOOT_DEVICES.map((device, i) => (
                      <motion.div key={i} whileHover={{ x: 2 }}
                        onClick={() => {
                          if (device.type === 'usb') { playBeep(); setBiosSubStep('save_exit') }
                          else { setBiosErrorMessage(`Không thể boot từ "${device.label}". Chọn USB!`); setTimeout(() => setBiosErrorMessage(''), 2500) }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer',
                          background: biosBootIndex === i ? 'rgba(255,255,0,0.12)' : 'transparent',
                          border: biosBootIndex === i ? '1px solid #ffff00' : '1px solid transparent',
                          borderRadius: '4px', fontSize: '12px',
                        }}>
                        <span>{device.type === 'usb' ? '💾' : device.type === 'windows' ? '⊞' : device.type === 'hdd' ? '💿' : '📀'}</span>
                        <span style={{ color: biosBootIndex === i ? '#ffff00' : '#c0c0c0' }}>{device.label}</span>
                        {device.type === 'usb' ? (
                          <span style={{ marginLeft: 'auto', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>Nên chọn</span>
                        ) : (
                          <span style={{ marginLeft: 'auto', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,0,0,0.1)', color: '#ff6666' }}>Sai</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  {biosErrorMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(255,0,0,0.12)', border: '1px solid #ff4444', borderRadius: '4px', color: '#ff6666', fontSize: '10px' }}>
                      {biosErrorMessage}
                    </motion.div>
                  )}
                </BiosScreen>
              </motion.div>
            )}

            {biosSubStep === 'save_exit' && (
              <motion.div key="bs_save_exit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BiosScreen title="Save & Exit - Confirm Changes">
                  <div style={{ fontSize: '11px', color: '#a0a0ff', marginBottom: '10px' }}>
                    Boot device selected: <span style={{ color: '#10b981', fontWeight: 'bold' }}>UEFI: USB Drive (SanDisk 3.2Gen1)</span>
                  </div>
                  <div style={{ marginBottom: '10px', padding: '6px 10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', fontSize: '10px', color: '#c0c0c0' }}>
                    <CheckCircle2 size={12} style={{ color: '#10b981', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Changes have been made to your BIOS configuration.<br />
                    &nbsp;&nbsp;• Boot priority: USB Drive moved to #1<br />
                    &nbsp;&nbsp;• Boot mode: UEFI (CSM disabled)<br />
                    <span style={{ color: '#ffff00' }}>Do you want to save these changes and exit?</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {SAVE_OPTIONS.map((opt, i) => (
                      <motion.div key={i} whileHover={{ x: 2 }}
                        onClick={() => {
                          if (opt === 'Yes, Save & Exit') {
                            playBeep()
                            setBiosTransition(true)
                            setBiosDone(true)
                            setTimeout(() => { setStep(2) }, 2000)
                          } else if (opt === 'No, Discard Changes') {
                            setBiosSubStep('main_menu'); setBiosMenuIndex(0); setBiosErrorMessage('')
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer',
                          background: biosSaveIndex === i ? 'rgba(255,255,0,0.12)' : 'transparent',
                          border: biosSaveIndex === i ? '1px solid #ffff00' : '1px solid transparent',
                          borderRadius: '4px', fontSize: '11px',
                        }}>
                        <span style={{ color: biosSaveIndex === i ? '#ffff00' : '#c0c0c0' }}>{opt}</span>
                        {biosSaveIndex === i && <ChevronRight size={12} style={{ color: '#ffff00', marginLeft: 'auto' }} />}
                      </motion.div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', padding: '6px 10px', background: 'rgba(255,255,0,0.06)', border: '1px dashed #4040a0', borderRadius: '4px', fontSize: '9px', color: '#8080d0' }}>
                    Cảnh báo: Nếu không cắm USB boot, máy sẽ báo lỗi "No bootable device"!
                  </div>
                </BiosScreen>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 2: Windows Logo Boot */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
            style={{ background: '#000', minHeight: '400px', borderRadius: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ width: '80px', height: '80px', margin: '0 auto 24px', position: 'relative' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  border: '4px solid rgba(0,120,212,0.15)',
                  borderTopColor: '#0078d4',
                  position: 'absolute', inset: 0,
                }} />
              </motion.div>
              <div style={{ fontSize: '32px', fontWeight: 300, color: '#0078d4', marginBottom: '8px', letterSpacing: '2px' }}>Windows 11</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0078d4' }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '20px' }}>
                Đang khởi động từ USB...
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Language / Region / Keyboard */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌐</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Chọn ngôn ngữ & khu vực</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đây là bước đầu tiên khi boot từ USB cài Windows</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Ngôn ngữ cài đặt</label>
                <select value={selectedLang} onChange={e => setSelectedLang(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  {LANGUAGES.map((l, i) => (
                    <option key={l.code} value={i}>{l.native} ({l.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Định dạng thời gian & tiền tệ</label>
                <select value={selectedLang} onChange={e => setSelectedLang(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  {LANGUAGES.map((l, i) => (
                    <option key={l.code} value={i}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Bàn phím</label>
                <select value={selectedKeyboard} onChange={e => setSelectedKeyboard(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  {KEYBOARD_LAYOUTS.map((k, i) => (
                    <option key={k.code} value={i}>{k.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: '12px', lineHeight: '1.5', marginBottom: '16px' }}>
              <strong style={{ color: '#3b82f6' }}>Thực tế:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Trên Win11 24H2, bạn có thể thay đổi ngôn ngữ sau cài đặt trong Settings → Time & Language.</span>
            </div>

            <button onClick={() => setStep(4)}
              className="w-full py-3 font-bold rounded-xl text-sm cursor-pointer"
              style={{ background: '#0078d4', border: 'none', color: '#fff', fontFamily: 'inherit' }}>
              Tiếp tục →
            </button>
          </motion.div>
        )}

        {/* STEP 4: Install Now + License */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⊞</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Bắt đầu cài đặt Windows 11</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nhấn "Install now" để bắt đầu quá trình cài đặt</p>
            </div>

            <div style={{
              padding: '32px', borderRadius: '16px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(0,120,212,0.05), rgba(0,168,255,0.05))',
              border: '1px solid rgba(0,120,212,0.15)', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 30px rgba(0,120,212,0.3))' }}>⊞</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: '#0078d4' }}>Windows 11 Pro</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Phiên bản 24H2 - Build 26100.1150</p>

              <button onClick={() => setStep(5)}
                className="px-8 py-3 font-bold rounded-xl text-sm cursor-pointer"
                style={{ background: '#0078d4', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '15px' }}>
                Install now
              </button>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '11px', lineHeight: '1.5' }}>
              <strong style={{ color: '#f59e0b' }}>Lưu ý:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Trên máy thật, bạn sẽ thấy màn hình "Windows Setup" với logo Windows và nút Install now. Nếu PC đã có Windows cũ, bạn cũng có tùy chọn "Repair your computer".</span>
            </div>
          </motion.div>
        )}

        {/* STEP 5: License Agreement */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📄</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Thỏa thuận cấp phép</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Microsoft Software License Terms</p>
            </div>

            <div style={{
              padding: '16px', borderRadius: '12px', maxHeight: '280px', overflowY: 'auto',
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              fontSize: '11px', lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '12px',
            }}>
              <p><strong>MICROSOFT SOFTWARE LICENSE TERMS</strong></p>
              <p><strong>WINDOWS 11 PROFESSIONAL</strong></p>
              <p>These license terms are an agreement between you and Microsoft Corporation (or one of its affiliates). They apply to the software named above, which includes the media on which you received it, if any.</p>
              <p><strong>1. Scope of license.</strong> The software is licensed, not sold. This agreement only gives you some rights to use the software. Microsoft reserves all other rights.</p>
              <p><strong>2. Installation and use.</strong> You may install and use one copy of the software on one device. You may use the software on a network only if you have a valid license for each device.</p>
              <p><strong>3. Updates.</strong> The software may periodically check for updates and download and install them for you. You may obtain updates only from Microsoft or authorized sources.</p>
              <p><strong>4. Data collection.</strong> The software may collect information about you and your use of the software and send that to Microsoft. Microsoft may use this information to improve products and services.</p>
              <p><strong>5. Limitation of liability.</strong> Microsoft is not liable for any damages arising from your use of the software.</p>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>... (tiếp tục) ...</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', marginBottom: '16px' }}>
              <input type="checkbox" id="license" checked={licenseAccepted} onChange={e => setLicenseAccepted(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }} />
              <label htmlFor="license" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Tôi đồng ý với các điều khoản cấp phép của Microsoft
              </label>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '11px', lineHeight: '1.5', marginBottom: '16px' }}>
              <strong style={{ color: '#10b981' }}>Thực tế:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Bạn PHẢI tích vào ô "I accept the license terms" để nút Next sáng lên. Microsoft rất nghiêm túc về bước này!</span>
            </div>

            <button onClick={() => setStep(6)} disabled={!licenseAccepted}
              className="w-full py-3 font-bold rounded-xl text-sm cursor-pointer"
              style={{
                background: licenseAccepted ? '#0078d4' : 'var(--text-muted)',
                border: 'none', color: '#fff', fontFamily: 'inherit',
                cursor: licenseAccepted ? 'pointer' : 'not-allowed',
                opacity: licenseAccepted ? 1 : 0.5,
              }}>
              {licenseAccepted ? 'Tiếp tục →' : 'Chấp nhận điều khoản để tiếp tục'}
            </button>
          </motion.div>
        )}

        {/* STEP 6: Custom Installation - Select Drive */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>💾</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Chọn ổ đĩa cài đặt</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Chọn "Custom: Install Windows only (advanced)"</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '12px', fontWeight: 600, color: '#818cf8' }}>
                <strong>Loại cài đặt:</strong> Custom: Install Windows only (advanced)
              </div>

              {DRIVES.map((drive, i) => (
                <motion.div key={drive.id} whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedDrive(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                    background: selectedDrive === i ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)',
                    border: selectedDrive === i ? '2px solid #10b981' : '1px solid var(--border-default)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: '24px' }}>{drive.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{drive.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {drive.size} · {drive.type} · Total space: {drive.size}
                      {selectedDrive === i && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Đã chọn</span>}
                    </div>
                  </div>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
                    borderColor: selectedDrive === i ? '#10b981' : 'var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selectedDrive === i && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(5)}
                className="flex items-center gap-1.5 px-4 py-2.5 font-bold rounded-xl text-xs cursor-pointer"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                <ChevronLeft size={14} /> Quay lại
              </button>
              <button onClick={() => { setProgress(0); setIsInstalling(true) }}
                className="flex-1 py-2.5 font-bold rounded-xl text-sm cursor-pointer"
                style={{ background: '#0078d4', border: 'none', color: '#fff', fontFamily: 'inherit' }}>
                Bắt đầu cài đặt →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6b: Installation Progress (shown after clicking "Bắt đầu cài đặt") */}
        {step === 6 && isInstalling && (
          <motion.div key="step6b" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50,
              background: 'linear-gradient(135deg, #001830, #002040)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <div style={{ fontSize: '72px', marginBottom: '24px', filter: 'drop-shadow(0 0 40px rgba(0,120,212,0.4))' }}>⊞</div>
            </motion.div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0078d4', marginBottom: '4px' }}>Đang cài đặt Windows 11</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>Vui lòng không tắt máy tính</p>

            <div style={{ maxWidth: '480px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                <span><span style={{ color: currentPhase.color || '#0078d4' }}>{currentPhase.icon}</span> {currentPhase.label}</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: '8px' }}>
                <motion.div style={{
                  width: `${Math.min(100, progress)}%`, height: '100%',
                  background: 'linear-gradient(90deg, #0078d4, #00a8ff, #0078d4)',
                  backgroundSize: '200% 100%',
                  borderRadius: '4px',
                }} animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 3, repeat: Infinity }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                Đang sao chép tập tin cài đặt{'.'.repeat(dotCount || 1)}
              </p>
            </div>

            {progress >= 100 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
                <button onClick={() => setStep(7)}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#0078d4', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                  Cài đặt xong! Khởi động lại →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 7: Restart */}
        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
            style={{ background: '#000', minHeight: '400px', borderRadius: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ width: '60px', height: '60px', margin: '0 auto 24px' }}>
                <RefreshCw size={60} style={{ color: '#0078d4' }} />
              </motion.div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0078d4', marginBottom: '8px' }}>Đang khởi động lại</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '16px' }}>
                Máy tính sẽ khởi động lại trong {restartCountdown} giây
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                {[0, 1, 2, 3].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0078d4' }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '20px' }}>
                Trên máy thật, bạn sẽ thấy logo hãng (Dell/HP/Lenovo) xuất hiện lại
              </p>

              <button onClick={() => { setStep(8); setRestartCountdown(10) }}
                style={{ marginTop: '20px', padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(0,120,212,0.3)', background: 'transparent', color: '#0078d4', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Bỏ qua (tiếp tục) →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 8: OOBE - Account Setup */}
        {step === 8 && (
          <motion.div key="step8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>👤</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Thiết lập cá nhân hóa</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>OOBE - Out of Box Experience</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Tên người dùng</label>
                <input value={userName} onChange={e => setUserName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Tên PC</label>
                <input value={pcName} onChange={e => setPcName(e.target.value)}
                  placeholder="VD: DESKTOP-PCMASTER"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px', color: '#3b82f6' }}>
                  <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Cài đặt quyền riêng tư
                </h4>
                {[
                  { key: 'location', label: 'Vị trí', desc: 'Cho phép Windows truy cập vị trí của bạn', checked: privacySettings.location },
                  { key: 'diagnostics', label: 'Chẩn đoán', desc: 'Gửi dữ liệu chẩn đoán cho Microsoft', checked: privacySettings.diagnostics },
                  { key: 'ads', label: 'Quảng cáo', desc: 'Cho phép quảng cáo được cá nhân hóa', checked: privacySettings.ads },
                  { key: 'tailored', label: 'Trải nghiệm', desc: 'Nhận đề xuất được cá nhân hóa', checked: privacySettings.tailored },
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <label style={{ position: 'relative', width: '40px', height: '22px', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}>
                      <input type="checkbox" checked={privacySettings[item.key as keyof typeof privacySettings]}
                        onChange={e => setPrivacySettings({ ...privacySettings, [item.key]: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute', inset: 0, borderRadius: '11px', transition: '0.3s',
                        background: privacySettings[item.key as keyof typeof privacySettings] ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                      }}>
                        <span style={{
                          position: 'absolute', top: '2px', width: '18px', height: '18px', borderRadius: '50%',
                          background: '#fff', transition: '0.3s',
                          left: privacySettings[item.key as keyof typeof privacySettings] ? '20px' : '2px',
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '11px', lineHeight: '1.5', marginBottom: '16px' }}>
              <strong style={{ color: '#10b981' }}>Thực tế:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Trên Win11 24H2, OOBE yêu cầu đăng nhập tài khoản Microsoft để hoàn tất. Bạn có thể chọn "Domain join instead" hoặc "Offline account" nếu muốn tạo tài khoản local.</span>
            </div>

            <button onClick={() => setStep(9)} disabled={!userName.trim() || !pcName.trim()}
              className="w-full py-3 font-bold rounded-xl text-sm"
              style={{
                background: !userName.trim() || !pcName.trim() ? 'var(--text-muted)' : '#0078d4',
                border: 'none', color: '#fff', fontFamily: 'inherit',
                cursor: !userName.trim() || !pcName.trim() ? 'not-allowed' : 'pointer',
                opacity: !userName.trim() || !pcName.trim() ? 0.5 : 1,
              }}>
              Hoàn tất thiết lập →
            </button>
          </motion.div>
        )}

        {/* STEP 9: Windows Simulator Desktop */}
        {step === 9 && (
          <WindowsSimulator
            cart={[
              { type: 'CPU', name: 'Intel Core i7-14700K' },
              { type: 'RAM', name: '32GB (2x16GB) DDR5-5600' },
              { type: 'GPU', name: 'NVIDIA RTX 4070 Ti' },
              { type: 'SSD', name: '1TB NVMe SSD' },
              { type: 'PSU', name: '850W 80+ Gold' },
            ]}
            scenarioName={`Windows 11 Pro - ${userName || 'PC Master'}`}
            onExit={() => {
              setStep(0)
              setProgress(0)
              setIsInstalling(false)
              setBiosDone(false)
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes creditsFadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  )
}
