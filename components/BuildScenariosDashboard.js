'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useBuildStore } from '@/lib/build-store'
import { estimatePerformance } from '@/lib/compatibility-engine'
import scenariosData from '@/data/build-scenarios.json'

const DIFFICULTY_META = {
  easy: { color: '#22c55e', label: { vn: 'Dễ', en: 'Easy' } },
  medium: { color: '#f97316', label: { vn: 'Trung bình', en: 'Medium' } },
  hard: { color: '#ef4444', label: { vn: 'Khó', en: 'Hard' } },
  expert: { color: '#a855f7', label: { vn: 'Chuyên gia', en: 'Expert' } },
}

const DIFFICULTY_BONUS_MAP = { easy: 0, medium: 25, hard: 50, expert: 100 }

const SCORE_STORAGE_KEY = 'pcm_scenario_saved_builds'

function formatVND(amount) {
  if (!amount && amount !== 0) return '0 ₫'
  return amount.toLocaleString('vi-VN') + ' ₫'
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function getStoredBuilds() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function storeBuild(build) {
  try {
    const list = getStoredBuilds()
    list.unshift({ ...build, savedAt: new Date().toISOString(), id: Date.now().toString() })
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(list.slice(0, 50)))
    return list[0]
  } catch {
    return build
  }
}

function deleteStoredBuild(id) {
  try {
    const list = getStoredBuilds().filter(b => b.id !== id)
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(list))
    return list
  } catch {
    return []
  }
}

function CircularProgress({ value, size, strokeWidth, color, bgColor, label }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bgColor || 'rgba(255,255,255,0.08)'} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || '#22c55e'} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{Math.round(value)}%</span>
        {label && <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)', marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  )
}

function RadarChart({ values, labels, size, maxValue, color }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38
  const levels = 5
  const angles = labels.map((_, i) => (i * 2 * Math.PI) / labels.length - Math.PI / 2)

  const gridPolygons = []
  for (let l = 1; l <= levels; l++) {
    const r = (radius * l) / levels
    const pts = angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ')
    gridPolygons.push(pts)
  }

  const dataPoints = values.map((v, i) => {
    const r = Math.min(v, maxValue) / maxValue * radius
    return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`
  }).join(' ')

  const labelPositions = angles.map(a => ({
    x: cx + (radius + 22) * Math.cos(a),
    y: cy + (radius + 22) * Math.sin(a),
    anchor: a > -Math.PI / 2 && a < Math.PI / 2 ? 'start' : a === -Math.PI / 2 || a === Math.PI / 2 ? 'middle' : 'end',
  }))

  const valuePositions = angles.map((a, i) => {
    const r = Math.min(values[i], maxValue) / maxValue * radius
    return {
      x: cx + (r + 14) * Math.cos(a),
      y: cy + (r + 14) * Math.sin(a),
      anchor: a > -Math.PI / 2 && a < Math.PI / 2 ? 'start' : a === -Math.PI / 2 || a === Math.PI / 2 ? 'middle' : 'end',
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(a)} y2={cy + radius * Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      <polygon points={dataPoints} fill={(color || '#22c55e') + '30'} stroke={color || '#22c55e'} strokeWidth={2} style={{ transition: 'all 0.6s ease' }} />
      {angles.map((a, i) => {
        const r = Math.min(values[i], maxValue) / maxValue * radius
        return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={3} fill={color || '#22c55e'} />
      })}
      {labels.map((l, i) => (
        <text key={i} x={labelPositions[i].x} y={labelPositions[i].y} textAnchor={labelPositions[i].anchor} fill="var(--text-muted)" fontSize={11} dominantBaseline="middle" fontFamily="inherit">
          {l}
        </text>
      ))}
      {values.map((v, i) => (
        <text key={i} x={valuePositions[i].x} y={valuePositions[i].y} textAnchor={valuePositions[i].anchor} fill="#fff" fontSize={10} fontWeight={600} dominantBaseline="middle" fontFamily="inherit">
          {Math.round(v)}
        </text>
      ))}
    </svg>
  )
}

export default function BuildScenariosDashboard({ lang = 'vn', onExit }) {
  const t = useMemo(() => ({
    pageTitle: lang === 'en' ? 'Build Scenarios Dashboard' : 'Bảng Điều Khiển Thử Thách',
    selectScenario: lang === 'en' ? 'Select a Build Challenge' : 'Chọn Thử Thách Lắp Máy',
    startChallenge: lang === 'en' ? 'Start Challenge' : 'Bắt Đầu',
    requirements: lang === 'en' ? 'Requirements' : 'Yêu Cầu',
    currentBuild: lang === 'en' ? 'Current Build' : 'Build Hiện Tại',
    performance: lang === 'en' ? 'Performance' : 'Hiệu Năng',
    score: lang === 'en' ? 'Score' : 'Điểm Số',
    compatibility: lang === 'en' ? 'Compatibility' : 'Tương Thích',
    saveBuild: lang === 'en' ? 'Save Build' : 'Lưu Build',
    compare: lang === 'en' ? 'Compare' : 'So Sánh',
    back: lang === 'en' ? 'Back' : 'Quay Lại',
    savedBuilds: lang === 'en' ? 'Saved Builds' : 'Build Đã Lưu',
    load: lang === 'en' ? 'Load' : 'Tải',
    delete: lang === 'en' ? 'Delete' : 'Xóa',
    noBuilds: lang === 'en' ? 'No saved builds yet' : 'Chưa có build nào được lưu',
    budgetRange: lang === 'en' ? 'Budget' : 'Ngân sách',
    budgetEfficiency: lang === 'en' ? 'Budget Efficiency' : 'Hiệu Quả Ngân Sách',
    performanceMatch: lang === 'en' ? 'Performance Match' : 'Đáp Ứng Yêu Cầu',
    difficultyBonus: lang === 'en' ? 'Difficulty Bonus' : 'Thưởng Độ Khó',
    componentName: lang === 'en' ? 'Component' : 'Linh Kiện',
    price: lang === 'en' ? 'Price' : 'Giá',
    tdpLabel: lang === 'en' ? 'TDP' : 'TDP',
    myBuild: lang === 'en' ? 'My Build' : 'Build Của Tôi',
    requirement: lang === 'en' ? 'Requirement' : 'Yêu Cầu',
    status: lang === 'en' ? 'Status' : 'Trạng Thái',
    met: lang === 'en' ? 'Met' : 'Đạt',
    notMet: lang === 'en' ? 'Not Met' : 'Chưa Đạt',
    errors: lang === 'en' ? 'Compatibility Errors' : 'Lỗi Tương Thích',
    warnings: lang === 'en' ? 'Compatibility Warnings' : 'Cảnh Báo Tương Thích',
    fixSuggestion: lang === 'en' ? 'Suggestion' : 'Gợi Ý',
    exit: lang === 'en' ? 'Exit' : 'Thoát',
    minCores: lang === 'en' ? 'Min CPU Cores' : 'Số Nhân Tối Thiểu',
    minGpuPower: lang === 'en' ? 'Min GPU Power' : 'Hiệu Năng GPU Tối Thiểu',
    minRam: lang === 'en' ? 'Min RAM' : 'RAM Tối Thiểu',
    minStorage: lang === 'en' ? 'Min Storage' : 'Ổ Cứng Tối Thiểu',
    totalPriceLabel: lang === 'en' ? 'Total Price' : 'Tổng Giá',
    gaming: lang === 'en' ? 'Gaming' : 'Chơi Game',
    productivity: lang === 'en' ? 'Productivity' : 'Văn Phòng',
    workstation: lang === 'en' ? 'Workstation' : 'Đồ Họa',
    value: lang === 'en' ? 'Value' : 'Giá Trị',
    savedAt: lang === 'en' ? 'Saved' : 'Đã lưu',
    scenarioName: lang === 'en' ? 'Scenario' : 'Thử thách',
    errorsFound: lang === 'en' ? 'errors found' : 'lỗi được tìm thấy',
    warningsFound: lang === 'en' ? 'warnings found' : 'cảnh báo',
    noIssues: lang === 'en' ? 'No compatibility issues!' : 'Không có vấn đề tương thích!',
    saveSuccess: lang === 'en' ? 'Build saved successfully!' : 'Đã lưu build thành công!',
    saveFailed: lang === 'en' ? 'Failed to save build' : 'Lưu build thất bại',
    loading: lang === 'en' ? 'Loading...' : 'Đang tải...',
  }), [lang])

  const [view, setView] = useState('list')
  const [activeScenario, setActiveScenario] = useState(null)
  const [showSavedPanel, setShowSavedPanel] = useState(false)
  const [savedBuilds, setSavedBuilds] = useState([])
  const [saveMessage, setSaveMessage] = useState('')
  const [animatedScore, setAnimatedScore] = useState(0)
  const [comparisonMode, setComparisonMode] = useState('requirements')
  const prevScoreRef = useRef(0)
  const animFrameRef = useRef(null)
  const savedBuildsLoaded = useRef(false)

  const store = useBuildStore()

  useEffect(() => {
    if (!savedBuildsLoaded.current) {
      setSavedBuilds(getStoredBuilds())
      savedBuildsLoaded.current = true
    }
  }, [])

  const scenarioMap = useMemo(() => {
    const map = {}
    scenariosData.forEach(s => { map[s.id] = s })
    return map
  }, [])

  const scenarioList = useMemo(() => scenariosData, [])

  const totalRam = useMemo(() => store.ram.reduce((sum, r) => sum + (r.ram_capacity_gb || 0), 0), [store.ram])

  const totalStorage = useMemo(() => {
    const ssdTotal = store.ssd.reduce((sum, s) => sum + (s.ssd_capacity_gb || 0), 0)
    const hddTotal = (store.hdd || []).reduce((sum, h) => sum + (h.ssd_capacity_gb || 0), 0)
    return ssdTotal + hddTotal
  }, [store.ssd, store.hdd])

  const perf = useMemo(() => store.performance, [store.performance])

  const requirementStatus = useMemo(() => {
    if (!activeScenario) return {}
    const reqs = activeScenario.requirements
    const gpuPower = store.gpu?.gpu_benchmark_1080p || 0
    const cpuCores = store.cpu?.cpu_cores || 0
    const cinebenchScore = store.cpu?.cpu_cinebench_r23_multi || 0
    const cpuTdp = store.cpu?.cpu_tdp_watts || 0
    const gpuTdp = store.gpu?.gpu_tdp_watts || 0
    const totalTdp = cpuTdp + gpuTdp
    const statuses = {}
    if (reqs.min_ram_gb != null) {
      statuses.ram = { met: totalRam >= reqs.min_ram_gb, current: totalRam, required: reqs.min_ram_gb, unit: 'GB', label: t.minRam }
    }
    if (reqs.min_gpu_power != null) {
      statuses.gpu = { met: gpuPower >= reqs.min_gpu_power, current: gpuPower, required: reqs.min_gpu_power, unit: ' pts', label: t.minGpuPower }
    }
    if (reqs.min_cores != null) {
      statuses.cores = { met: cpuCores >= reqs.min_cores, current: cpuCores, required: reqs.min_cores, unit: ' nhân', label: t.minCores }
    }
    if (reqs.min_storage_gb != null) {
      statuses.storage = { met: totalStorage >= reqs.min_storage_gb, current: totalStorage, required: reqs.min_storage_gb, unit: 'GB', label: t.minStorage }
    }
    if (reqs.require_igpu != null) {
      statuses.igpu = { met: !!store.cpu?.cpu_has_igpu, current: store.cpu?.cpu_has_igpu ? 'Có' : 'Không', required: 'Có iGPU', label: 'iGPU' }
    }
    if (reqs.min_cinebench_multi != null) {
      statuses.cinebench = { met: cinebenchScore >= reqs.min_cinebench_multi, current: cinebenchScore, required: reqs.min_cinebench_multi, unit: ' pts', label: 'Cinebench R23' }
    }
    if (reqs.max_tdp != null) {
      statuses.tdp = { met: totalTdp <= reqs.max_tdp, current: totalTdp, required: reqs.max_tdp, unit: 'W', label: 'TDP' }
    }
    statuses.budget = {
      met: store.totalPrice >= activeScenario.budget_min && store.totalPrice <= activeScenario.budget_max,
      current: store.totalPrice,
      required: `${formatVND(activeScenario.budget_min)} – ${formatVND(activeScenario.budget_max)}`,
      label: t.budgetRange,
      isBudget: true,
    }
    return statuses
  }, [activeScenario, totalRam, totalStorage, store.gpu, store.cpu, store.totalPrice, t])

  const performanceMatch = useMemo(() => {
    const statuses = Object.values(requirementStatus)
    if (statuses.length === 0) return 100
    const met = statuses.filter(s => s.met).length
    return (met / statuses.length) * 100
  }, [requirementStatus])

  const budgetEfficiency = useMemo(() => {
    if (!activeScenario) return 0
    const range = activeScenario.budget_max - activeScenario.budget_min
    if (range <= 0) return store.totalPrice <= activeScenario.budget_max ? 100 : 0
    if (store.totalPrice < activeScenario.budget_min) return 0
    const eff = ((activeScenario.budget_max - store.totalPrice) / range) * 100
    return Math.max(0, Math.min(100, eff))
  }, [activeScenario, store.totalPrice])

  const difficultyBonus = useMemo(() => {
    if (!activeScenario) return 0
    return DIFFICULTY_BONUS_MAP[activeScenario.difficulty] || 0
  }, [activeScenario])

  const finalScore = useMemo(() => {
    const compatWeight = store.score * 0.3
    const perfWeight = performanceMatch * 0.4
    const budgetWeight = budgetEfficiency * 0.2
    const diffWeight = difficultyBonus * 0.1
    return Math.round(compatWeight + perfWeight + budgetWeight + diffWeight)
  }, [store.score, performanceMatch, budgetEfficiency, difficultyBonus])

  const scoreComponents = useMemo(() => ({
    compatibility: { value: store.score, weight: 0.3, weighted: store.score * 0.3 },
    performanceMatch: { value: performanceMatch, weight: 0.4, weighted: performanceMatch * 0.4 },
    budgetEfficiency: { value: budgetEfficiency, weight: 0.2, weighted: budgetEfficiency * 0.2 },
    difficultyBonus: { value: difficultyBonus, weight: 0.1, weighted: difficultyBonus * 0.1 },
  }), [store.score, performanceMatch, budgetEfficiency, difficultyBonus])

  useEffect(() => {
    const target = finalScore
    const start = prevScoreRef.current
    const duration = 1000
    const startTime = performance.now()
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (target - start) * eased)
      setAnimatedScore(current)
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        prevScoreRef.current = target
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [finalScore])

  const handleSelectScenario = useCallback((scenario) => {
    setActiveScenario(scenario)
    store.setActiveScenario(scenario)
    store.setBudget(scenario.budget_max)
    store.clearAll()
    setView('challenge')
  }, [store])

  const handleBack = useCallback(() => {
    setView('list')
    setActiveScenario(null)
    store.setActiveScenario(null)
    setSaveMessage('')
  }, [store])

  const handleSaveBuild = useCallback(async () => {
    setSaveMessage('')
    const id = await store.saveToSupabase()
    const snapshot = {
      buildName: store.buildName,
      cpu: store.cpu,
      gpu: store.gpu,
      mainboard: store.mainboard,
      ram: store.ram,
      psu: store.psu,
      case: store.case,
      cooler: store.cooler,
      ssd: store.ssd,
      totalPrice: store.totalPrice,
      totalTdp: store.totalTdp,
      score: store.score,
      performance: store.performance,
      scenarioId: activeScenario?.id,
      scenarioName: activeScenario ? (lang === 'en' ? activeScenario.name : activeScenario.name_vn) : '',
    }
    const stored = storeBuild(snapshot)
    setSavedBuilds(getStoredBuilds())
    setSaveMessage(t.saveSuccess)
    setTimeout(() => setSaveMessage(''), 3000)
  }, [store, activeScenario, lang, t])

  const handleLoadBuild = useCallback((saved) => {
    store.loadBuild({
      cpu: saved.cpu,
      gpu: saved.gpu,
      mainboard: saved.mainboard,
      ram: saved.ram,
      psu: saved.psu,
      case: saved.case,
      cooler: saved.cooler,
      ssd: saved.ssd,
      buildName: saved.buildName || 'Build đã lưu',
    })
    if (saved.scenarioId && scenarioMap[saved.scenarioId]) {
      const sc = scenarioMap[saved.scenarioId]
      setActiveScenario(sc)
      store.setActiveScenario(sc)
      store.setBudget(sc.budget_max)
      setView('challenge')
    }
    setShowSavedPanel(false)
  }, [store, scenarioMap])

  const handleDeleteBuild = useCallback((id) => {
    const updated = deleteStoredBuild(id)
    setSavedBuilds(updated)
  }, [])

  const handleCompare = useCallback(() => {
    setView('compare')
  }, [])

  const handleBackToChallenge = useCallback(() => {
    setView('challenge')
  }, [])

  const cpuDesc = useMemo(() => {
    if (!store.cpu) return { label: '—', detail: '' }
    const cores = store.cpu.cpu_cores || 0
    const speed = store.cpu.cpu_boost_ghz || store.cpu.cpu_base_ghz || 0
    return { label: store.cpu.full_name || store.cpu.model, detail: `${cores} nhân @ ${speed}GHz` }
  }, [store.cpu])

  const gpuDesc = useMemo(() => {
    if (!store.gpu) return { label: '—', detail: '' }
    const vram = store.gpu.gpu_vram_gb || 0
    const power = store.gpu.gpu_benchmark_1080p || 0
    return { label: store.gpu.full_name || store.gpu.model, detail: `${vram}GB VRAM • ${power} pts` }
  }, [store.gpu])

  const ramDesc = useMemo(() => {
    if (!store.ram.length) return { label: '—', detail: '' }
    const total = totalRam
    const speed = store.ram[0]?.ram_speed_mhz || 0
    const count = store.ram.length
    return { label: `${total}GB`, detail: `${count} thanh @ ${speed}MHz` }
  }, [store.ram, totalRam])

  const storageDesc = useMemo(() => {
    if (!store.ssd.length && !(store.hdd || []).length) return { label: '—', detail: '' }
    const count = store.ssd.length + (store.hdd || []).length
    return { label: `${totalStorage}GB`, detail: `${count} ổ` }
  }, [store.ssd, store.hdd, totalStorage])

  const hasComponents = useMemo(() => {
    return !!(store.cpu || store.gpu || store.ram.length || store.ssd.length || store.mainboard || store.psu || store.case || store.cooler)
  }, [store.cpu, store.gpu, store.ram, store.ssd, store.mainboard, store.psu, store.case, store.cooler])

  const renderScenarioCard = (scenario) => {
    const diff = DIFFICULTY_META[scenario.difficulty] || DIFFICULTY_META.easy
    return (
      <button
        key={scenario.id}
        onClick={() => handleSelectScenario(scenario)}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: '20px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'inherit',
          color: 'var(--text-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = diff.color
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = `0 8px 32px ${diff.color}20`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{scenario.icon}</span>
          <span style={{
            background: diff.color + '20',
            color: diff.color,
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            border: `1px solid ${diff.color}40`,
          }}>
            {diff.label[lang]}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginTop: 2 }}>
          {lang === 'en' ? scenario.name : scenario.name_vn}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lang === 'en' ? scenario.description : scenario.description_vn}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto', paddingTop: 6 }}>
          <span>💰</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatVND(scenario.budget_min)} – {formatVND(scenario.budget_max)}</span>
        </div>
      </button>
    )
  }

  const renderRequirementsPanel = () => {
    if (!activeScenario) return null
    const entries = Object.entries(requirementStatus).filter(([k]) => k !== 'budget')
    const budgetEntry = requirementStatus.budget
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📋</span> {t.requirements}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(([key, req]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 10,
              background: req.met ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${req.met ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, color: req.met ? 'var(--success)' : 'var(--danger)' }}>
                  {req.met ? '✓' : '✗'}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{req.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {req.isBudget ? req.required : `${req.current}${req.unit || ''} / ${req.required}${req.unit || ''}`}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 12,
                color: req.met ? 'var(--success)' : 'var(--danger)',
                background: req.met ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              }}>
                {req.met ? t.met : t.notMet}
              </span>
            </div>
          ))}
          {budgetEntry && (
            <div key="budget" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 10,
              background: budgetEntry.met ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${budgetEntry.met ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, color: budgetEntry.met ? 'var(--success)' : 'var(--danger)' }}>
                  {budgetEntry.met ? '✓' : '✗'}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{budgetEntry.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatVND(budgetEntry.current)} / {budgetEntry.required}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 12,
                color: budgetEntry.met ? 'var(--success)' : 'var(--danger)',
                background: budgetEntry.met ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              }}>
                {budgetEntry.met ? t.met : t.notMet}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderBuildSummary = () => {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔧</span> {t.currentBuild}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>CPU</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{cpuDesc.label}</div>
              {cpuDesc.detail && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cpuDesc.detail}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GPU</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{gpuDesc.label}</div>
              {gpuDesc.detail && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{gpuDesc.detail}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>RAM</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{ramDesc.label}</div>
              {ramDesc.detail && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ramDesc.detail}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Storage</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{storageDesc.label}</div>
              {storageDesc.detail && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{storageDesc.detail}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.tdpLabel}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{store.totalTdp}W</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.totalPriceLabel}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{formatVND(store.totalPrice)}</span>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress
            value={store.score}
            size={100}
            strokeWidth={8}
            color={store.score >= 80 ? '#22c55e' : store.score >= 50 ? '#f97316' : '#ef4444'}
            label={t.compatibility}
          />
        </div>
      </div>
    )
  }

  const renderRadarChart = () => {
    const labels = [t.gaming, t.productivity, t.workstation, t.value]
    const values = [perf.gaming, perf.productivity, perf.workstation, perf.value]
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <span>📊</span> {t.performance}
        </div>
        <RadarChart values={values} labels={labels} size={240} maxValue={100} color="#6366f1" />
      </div>
    )
  }

  const renderScoringPanel = () => {
    const scoreColor = animatedScore >= 80 ? '#22c55e' : animatedScore >= 50 ? '#f97316' : '#ef4444'
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <span>🏆</span> {t.score}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress value={animatedScore} size={140} strokeWidth={10} color={scoreColor} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.compatibility}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(scoreComponents.compatibility.value)}%</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(×0.3)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.performanceMatch}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(scoreComponents.performanceMatch.value)}%</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(×0.4)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.budgetEfficiency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(scoreComponents.budgetEfficiency.value)}%</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(×0.2)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.difficultyBonus}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(scoreComponents.difficultyBonus.value)}%</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(×0.1)</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCompatibilityResults = () => {
    const errors = store.issues.filter(i => i.severity === 'error')
    const warnings = store.issues.filter(i => i.severity === 'warning')
    const infos = store.issues.filter(i => i.severity === 'info')
    if (!store.issues.length) {
      return (
        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>{t.noIssues}</span>
        </div>
      )
    }
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {errors.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔴</span> {t.errors} ({errors.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {errors.map((issue, i) => (
                <div key={i} style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 500, marginBottom: 4 }}>{issue.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--warning)' }}>💡</span> {t.fixSuggestion}: {issue.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🟡</span> {t.warnings} ({warnings.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {warnings.map((issue, i) => (
                <div key={i} style={{
                  background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 12, color: '#fdba74', fontWeight: 500, marginBottom: 4 }}>{issue.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#60a5fa' }}>💡</span> {t.fixSuggestion}: {issue.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {infos.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔵</span> Info ({infos.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {infos.map((issue, i) => (
                <div key={i} style={{
                  background: 'rgba(96,165,250,0.08)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 500 }}>{issue.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSavedBuildsPanel = () => {
    const panelStyle = {
      position: 'fixed',
      top: 0,
      right: showSavedPanel ? 0 : '-400px',
      width: 380,
      height: '100vh',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-default)',
      zIndex: 1000,
      padding: 24,
      overflowY: 'auto',
      transition: 'right 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }
    return (
      <>
        {showSavedPanel && (
          <div
            onClick={() => setShowSavedPanel(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
            }}
          />
        )}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.savedBuilds}</div>
            <button
              onClick={() => setShowSavedPanel(false)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: 20, cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit',
              }}
            >
              ✕
            </button>
          </div>
          {savedBuilds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
              {t.noBuilds}
            </div>
          ) : (
            savedBuilds.map((build) => {
              const scoreVal = build.score || 0
              const scoreColor = scoreVal >= 80 ? '#22c55e' : scoreVal >= 50 ? '#f97316' : '#ef4444'
              return (
                <div key={build.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{build.buildName || 'Build'}</div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: scoreColor,
                      background: scoreColor + '20',
                      padding: '2px 10px',
                      borderRadius: 10,
                    }}>
                      {scoreVal}%
                    </div>
                  </div>
                  {build.scenarioName && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      {t.scenarioName}: {build.scenarioName}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {t.savedAt}: {formatDate(build.savedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleLoadBuild(build)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#6366f1',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#4f46e5' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#6366f1' }}
                    >
                      {t.load}
                    </button>
                    <button
                      onClick={() => handleDeleteBuild(build.id)}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8,
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </>
    )
  }

  const renderComparisonView = () => {
    const comparisonScenario = activeScenario
    const cpuName = store.cpu?.full_name || store.cpu?.model || '—'
    const gpuName = store.gpu?.full_name || store.gpu?.model || '—'
    const ramName = store.ram.length ? `${totalRam}GB ${store.ram[0]?.ram_ddr_type || ''}` : '—'
    const storageName = store.ssd.length ? `${totalStorage}GB (${store.ssd.length} ổ)` : '—'
    const mainboardName = store.mainboard?.full_name || store.mainboard?.model || '—'
    const psuName = store.psu?.full_name || store.psu?.model || '—'
    const coolerName = store.cooler?.full_name || store.cooler?.model || '—'

    const reqCpuCores = comparisonScenario?.requirements?.min_cores
    const reqGpuPower = comparisonScenario?.requirements?.min_gpu_power
    const reqRam = comparisonScenario?.requirements?.min_ram_gb
    const reqStorage = comparisonScenario?.requirements?.min_storage_gb

    const metrics = [
      {
        label: 'CPU',
        current: cpuName,
        required: reqCpuCores ? `≥ ${reqCpuCores} nhân` : '—',
        currentScore: store.cpu ? Math.min(100, ((store.cpu.cpu_cinebench_r23_multi || 0) / 40000) * 100) : 0,
        reqScore: reqCpuCores ? Math.min(100, (reqCpuCores / 16) * 100) : 50,
      },
      {
        label: 'GPU',
        current: gpuName,
        required: reqGpuPower ? `≥ ${reqGpuPower} pts` : '—',
        currentScore: store.gpu ? Math.min(100, ((store.gpu.gpu_benchmark_1080p || 0) / 40000) * 100) : 0,
        reqScore: reqGpuPower ? Math.min(100, (reqGpuPower / 40000) * 100) : 50,
      },
      {
        label: 'RAM',
        current: ramName,
        required: reqRam ? `≥ ${reqRam}GB` : '—',
        currentScore: totalRam ? Math.min(100, (totalRam / 64) * 100) : 0,
        reqScore: reqRam ? Math.min(100, (reqRam / 64) * 100) : 50,
      },
      {
        label: 'Storage',
        current: storageName,
        required: reqStorage ? `≥ ${reqStorage}GB` : '—',
        currentScore: totalStorage ? Math.min(100, (totalStorage / 4000) * 100) : 0,
        reqScore: reqStorage ? Math.min(100, (reqStorage / 4000) * 100) : 50,
      },
      {
        label: t.tdpLabel,
        current: store.totalTdp ? `${store.totalTdp}W` : '—',
        required: comparisonScenario?.requirements?.max_tdp ? `≤ ${comparisonScenario.requirements.max_tdp}W` : '—',
        currentScore: store.totalTdp ? Math.max(0, 100 - (store.totalTdp / 600) * 100) : 0,
        reqScore: comparisonScenario?.requirements?.max_tdp ? Math.max(0, 100 - (comparisonScenario.requirements.max_tdp / 600) * 100) : 50,
      },
      {
        label: t.price,
        current: formatVND(store.totalPrice),
        required: comparisonScenario ? `${formatVND(comparisonScenario.budget_min)} – ${formatVND(comparisonScenario.budget_max)}` : '—',
        currentScore: comparisonScenario ? Math.min(100, (store.totalPrice / comparisonScenario.budget_max) * 100) : 0,
        reqScore: 70,
      },
      {
        label: t.compatibility,
        current: `${store.score}%`,
        required: '≥ 80%',
        currentScore: store.score,
        reqScore: 80,
      },
    ]

    const perfMetrics = [
      { label: t.gaming, current: perf.gaming, required: comparisonScenario?.requirements?.min_gpu_power ? Math.min(100, ((comparisonScenario.requirements.min_gpu_power || 0) / 40000) * 100) : 50 },
      { label: t.productivity, current: perf.productivity, required: 50 },
      { label: t.workstation, current: perf.workstation, required: 50 },
      { label: t.value, current: perf.value, required: 50 },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <button
          onClick={handleBackToChallenge}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
        >
          ← {t.back}
        </button>

        {comparisonScenario && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📊</span> {lang === 'en' ? 'Component Comparison' : 'So Sánh Linh Kiện'}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{t.componentName}</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: '#6366f1', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{t.myBuild}</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--warning)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{t.requirement}</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, i) => {
                    const metStatus = m.current !== '—' && m.current !== '0%' && m.required !== '—'
                    const isMet = metStatus && (
                      m.currentScore >= m.reqScore ||
                      (m.label === t.price && comparisonScenario && store.totalPrice >= comparisonScenario.budget_min && store.totalPrice <= comparisonScenario.budget_max)
                    )
                    return (
                      <tr key={i} style={{ borderBottom: i < metrics.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>{m.label}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-primary)', fontSize: 11 }}>{m.current}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>{m.required}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {m.current !== '—' && m.required !== '—' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: isMet ? 'var(--success)' : 'var(--danger)',
                              fontWeight: 700,
                              fontSize: 13,
                            }}>
                              {isMet ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📈</span> {lang === 'en' ? 'Performance Comparison' : 'So Sánh Hiệu Năng'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perfMetrics.map((m, i) => {
              const maxVal = 100
              const currentWidth = Math.min(m.current, maxVal) / maxVal * 100
              const requiredWidth = Math.min(m.required, maxVal) / maxVal * 100
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', minWidth: 100 }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{Math.round(m.current)}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / </span>
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{Math.round(m.required)}</span>
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: 18, background: 'rgba(255,255,255,0.06)', borderRadius: 9, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${currentWidth}%`,
                      background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                      borderRadius: 9,
                      transition: 'width 0.6s ease',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: 0.8,
                    }} />
                    <div style={{
                      height: '100%',
                      width: `${requiredWidth}%`,
                      background: 'transparent',
                      borderRight: '2px dashed rgba(249,115,22,0.8)',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 2,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#6366f1' }} />
              <span>{lang === 'en' ? 'My Build' : 'Build Của Tôi'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 0, borderTop: '2px dashed rgba(249,115,22,0.8)' }} />
              <span>{lang === 'en' ? 'Requirement' : 'Yêu Cầu'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderScenarioSelection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{t.pageTitle}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{t.selectScenario}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSavedPanel(true)}
            style={{
              padding: '10px 18px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
          >
            <span>💾</span> {t.savedBuilds} ({savedBuilds.length})
          </button>
          <button
            onClick={onExit}
            style={{
              padding: '10px 18px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
          >
            {t.exit}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {scenarioList.map(renderScenarioCard)}
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {lang === 'en' ? 'Difficulty Legend' : 'Chú Thích Độ Khó'}
        </div>
        {Object.entries(DIFFICULTY_META).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: val.color }} />
            <span>{val.label[lang]}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderActiveChallenge = () => {
    const scenario = activeScenario
    if (!scenario) return null
    const diffMeta = DIFFICULTY_META[scenario.difficulty] || DIFFICULTY_META.easy

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={handleBack}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
            >
              ← {t.back}
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{scenario.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                    {lang === 'en' ? scenario.name : scenario.name_vn}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatVND(scenario.budget_min)} – {formatVND(scenario.budget_max)}
                  </div>
                </div>
              </div>
            </div>
            <span style={{
              background: diffMeta.color + '20',
              color: diffMeta.color,
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: `1px solid ${diffMeta.color}40`,
            }}>
              {diffMeta.label[lang]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowSavedPanel(true)}
              style={{
                padding: '10px 18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
            >
              💾 {t.savedBuilds}
            </button>
          </div>
        </div>

        {saveMessage && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 12,
            color: 'var(--success)',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
          }}>
            {saveMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {renderRequirementsPanel()}
            {renderCompatibilityResults()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {renderBuildSummary()}
            {renderScoringPanel()}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {renderRadarChart()}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span> {lang === 'en' ? 'Actions' : 'Thao Tác'}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveBuild}
                disabled={!hasComponents}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: '12px 20px',
                  background: hasComponents ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.3)',
                  border: 'none',
                  borderRadius: 12,
                  color: hasComponents ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: hasComponents ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (hasComponents) e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                💾 {t.saveBuild}
              </button>
              <button
                onClick={handleCompare}
                disabled={!hasComponents}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: '12px 20px',
                  background: hasComponents ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${hasComponents ? 'var(--border-default)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12,
                  color: hasComponents ? 'var(--text-primary)' : 'rgba(255,255,255,0.3)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: hasComponents ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (hasComponents) {
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                📊 {t.compare}
              </button>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: '12px 20px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 12,
                  color: '#ef4444',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
              >
                ← {t.back}
              </button>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))',
          border: '1px solid var(--border-default)',
          borderRadius: 16,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'Build Name' : 'Tên Build'}:
            </span>
            <input
              value={store.buildName}
              onChange={(e) => store.setBuildName(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '8px 14px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                width: 240,
                fontFamily: 'inherit',
              }}
              placeholder={lang === 'en' ? 'Enter build name...' : 'Nhập tên build...'}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t.totalPriceLabel}: <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>{formatVND(store.totalPrice)}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case 'list':
        return renderScenarioSelection()
      case 'challenge':
        return renderActiveChallenge()
      case 'compare':
        return renderComparisonView()
      default:
        return renderScenarioSelection()
    }
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100%',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to { width: var(--bar-width); }
        }
        @keyframes scoreReveal {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        button:active { transform: scale(0.97) !important; }
      `}</style>
      <div style={{
        padding: 28,
        animation: 'fadeIn 0.3s ease',
      }}>
        {renderView()}
      </div>
      {renderSavedBuildsPanel()}
    </div>
  )
}
