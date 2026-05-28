'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Legend, Cell
} from 'recharts'
import { 
  Trophy, Target, Zap, BookOpen, 
  ChevronRight, Download, Filter, 
  AlertTriangle, ArrowUpRight, Sparkles
} from 'lucide-react'
import Link from 'next/link'

const scoreHistory = [
  { date: '01/05', score: 65 },
  { date: '03/05', score: 72 },
  { date: '05/05', score: 68 },
  { date: '07/05', score: 85 },
  { date: '09/05', score: 92 },
]

const competencyData = [
  { subject: 'CPU', A: 90, fullMark: 100 },
  { subject: 'RAM', A: 45, fullMark: 100 },
  { subject: 'GPU', A: 80, fullMark: 100 },
  { subject: 'Storage', A: 70, fullMark: 100 },
  { subject: 'PSU', A: 60, fullMark: 100 },
  { subject: 'Mainboard', A: 85, fullMark: 100 },
]

const classComparison = [
  { name: 'Cá nhân', score: 92 },
  { name: 'Trung bình lớp', score: 78 },
]

export default function StudentAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">Phân tích <span style={{ color: 'var(--brand-primary)' }}>Năng lực</span></h1>
          <p className="font-medium italic" style={{ color: 'var(--text-muted)' }}>"Theo dõi sự tiến bộ và tối ưu hóa lộ trình học tập của bạn."</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          <Download size={18} /> Xuất báo cáo (PDF)
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bài thi đã làm', value: '12', icon: BookOpen, color: '#3b82f6' },
          { label: 'Điểm trung bình', value: '78.5', icon: Target, color: '#8b5cf6' },
          { label: 'Điểm cao nhất', value: '96', icon: Trophy, color: '#f59e0b' },
          { label: 'Tỷ lệ qua môn', value: '85%', icon: Zap, color: 'var(--brand-primary)' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[32px] relative overflow-hidden group"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="relative z-10">
              <div className="p-3 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform" style={{ background: 'var(--bg-base)' }}>
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div className="text-3xl font-black mb-1">{card.value}</div>
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-10" style={{ backgroundColor: card.color }}></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <ArrowUpRight style={{ color: 'var(--brand-primary)' }} /> Tiến độ học tập
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--brand-primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--brand-primary)', strokeWidth: 2, stroke: 'var(--bg-base)' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[40px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Zap style={{ color: 'var(--accent-amber)' }} /> Bản đồ Năng lực (Radar)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                <PolarGrid stroke="var(--border-default)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Cá nhân" dataKey="A" stroke="var(--accent-amber)" fill="var(--accent-amber)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[40px] overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Lịch sử bài thi</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg transition-all" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}><Filter size={18} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="uppercase font-black text-[10px] tracking-widest" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
                <tr>
                  <th className="px-4 py-4">Tên bài thi</th>
                  <th className="px-4 py-4">Ngày làm</th>
                  <th className="px-4 py-4 text-center">Điểm</th>
                  <th className="px-4 py-4 text-center">Xếp loại</th>
                  <th className="px-4 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                {[
                  { title: 'Kiến thức CPU Cơ bản', date: '09/05/2026', score: 92, grade: 'Xuất sắc' },
                  { title: 'Lắp ráp PC Lab #1', date: '07/05/2026', score: 85, grade: 'Giỏi' },
                  { title: 'Trắc nghiệm Linh kiện', date: '05/05/2026', score: 68, grade: 'Khá' },
                ].map((item, i) => (
                  <tr key={i} className="transition-all group cursor-pointer" style={{ borderColor: 'var(--border-default)' }}>
                    <td className="px-4 py-6 font-bold">{item.title}</td>
                    <td className="px-4 py-6 font-medium" style={{ color: 'var(--text-muted)' }}>{item.date}</td>
                    <td className="px-4 py-6 text-center font-black text-lg">{item.score}</td>
                    <td className="px-4 py-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider`}
                        style={{
                          background: item.grade === 'Xuất sắc' ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : item.grade === 'Giỏi' ? 'color-mix(in srgb, var(--accent-blue) 10%, transparent)' : 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                          color: item.grade === 'Xuất sắc' ? 'var(--brand-primary)' : item.grade === 'Giỏi' ? 'var(--accent-blue)' : 'var(--text-muted)'
                        }}
                      >
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-right">
                      <button className="p-2 rounded-full transition-all" style={{ color: 'var(--text-muted)' }}>
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[40px] relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid color-mix(in srgb, var(--accent-orange) 30%, transparent)' }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4" style={{ color: 'var(--accent-orange)' }}>
                <AlertTriangle size={16} /> Cảnh báo lỗ hổng kiến thức
              </div>
              <h4 className="text-xl font-bold mb-4">Chủ đề: RAM & Khả năng tương thích</h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                Bạn hay trả lời sai các câu hỏi liên quan đến **Bus RAM** và **Sự tương thích giữa Mainboard & CPU**. Điều này có thể gây lỗi khi thực hành lắp ráp máy tính thật.
              </p>
              <Link href="/lessons/ram-basics" className="w-full py-4 font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 transition-all" style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-orange) 30%, transparent)', color: 'var(--accent-orange)' }}>
                Ôn tập chủ đề này ngay <ChevronRight size={16} />
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5" style={{ background: 'var(--accent-orange)' }}></div>
          </div>

          <div className="p-8 rounded-[40px]" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Gợi ý từ AI Guru
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2 italic">
                "Hãy thử làm lại bài thi 'Lắp ráp PC Lab #1' để cải thiện kỹ năng chọn nguồn (PSU) nhé!"
              </li>
              <li className="flex items-start gap-2 italic">
                "Bạn đã tiến bộ 20% so với tuần trước. Tiếp tục phát huy!"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
