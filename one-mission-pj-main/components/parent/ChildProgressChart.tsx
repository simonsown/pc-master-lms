'use client'

import React, { useMemo } from 'react'

interface DailyProgress {
  date: string
  count: number
}

interface ChildProgressChartProps {
  data: DailyProgress[]
}

export default function ChildProgressChart({ data }: ChildProgressChartProps) {
  const chartHeight = 200
  const chartWidth = 500

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []
    // Giới hạn hiển thị 15 điểm gần nhất để biểu đồ thoáng đãng
    return data.slice(-15)
  }, [data])

  const { pointsPath, areaPath, dots } = useMemo(() => {
    if (processedData.length === 0) {
      return { pointsPath: '', areaPath: '', dots: [] }
    }

    const maxVal = Math.max(...processedData.map((d) => d.count), 1)
    const xStep = chartWidth / (processedData.length - 1 || 1)

    const coords = processedData.map((d, index) => {
      const x = index * xStep
      // SVG 0 ở trên cùng, nên lật ngược tọa độ y
      const y = chartHeight - (d.count / maxVal) * (chartHeight - 40) - 20
      return { x, y, ...d }
    })

    // Vẽ đường Line qua các điểm
    const lineParts = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    const linePath = lineParts.join(' ')

    // Vẽ vùng Area dưới đường Line
    const firstX = coords[0].x.toFixed(1)
    const lastX = coords[coords.length - 1].x.toFixed(1)
    const areaPath = `${linePath} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`

    return { pointsPath: linePath, areaPath, dots: coords }
  }, [processedData])

  if (processedData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs rounded-2xl" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        Chưa có dữ liệu học tập trong 30 ngày qua
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tiến trình học tập</div>
          <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>Số bài học hoàn thành mỗi ngày</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: 'var(--brand-primary)', background: 'rgba(0, 212, 170, 0.1)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--brand-primary)' }} />
          30 ngày gần đây
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Gradient cho đường Line */}
            <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="100%" stopColor="#00b4d8" />
            </linearGradient>
            {/* Gradient cho vùng bên dưới */}
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Đường lưới Grid ngang */}
          <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Vùng Area phía dưới */}
          <path d={areaPath} fill="url(#area-gradient)" />

          {/* Đường vẽ Line chính */}
          <path
            d={pointsPath}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Các điểm Dots trên đường Line */}
          {dots.map((dot, index) => (
            <g key={index} className="group/dot cursor-pointer">
              <circle
                cx={dot.x}
                cy={dot.y}
                r="5"
                fill="#111318"
                stroke="#00d4aa"
                strokeWidth="2"
                className="transition-all duration-150 hover:r-7"
              />
              <title>{`${dot.date}: ${dot.count} bài`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* Nhãn trục X */}
      <div className="flex justify-between mt-3 px-1 text-[10px] text-[#636678] font-bold">
        <span>{processedData[0].date}</span>
        <span>{processedData[Math.floor(processedData.length / 2)].date}</span>
        <span>{processedData[processedData.length - 1].date}</span>
      </div>
    </div>
  )
}
