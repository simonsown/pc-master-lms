'use client'

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts'
import { ProgressStats, DailyProgress, LessonProgress, QuizAttempt, BuilderActivity } from '@/lib/progress'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart2 } from 'lucide-react'

interface ProgressViewProps {
  data: {
    stats: ProgressStats
    dailyProgress: DailyProgress[]
    lessons: LessonProgress[]
    quizResults: QuizAttempt[]
    builderActivity: BuilderActivity[]
  }
}

const MOTIVATIONAL_QUOTES = [
  "Kiến thức là sức mạnh. Mỗi bài học bạn hoàn thành là một bước tiến! 💪",
  "Lắp ráp PC cũng như xây dựng tương lai - từng linh kiện đều quan trọng! 🖥️",
  "Sai lầm là một phần của học tập. Hãy thử lại và bạn sẽ làm được! 🔧",
  "Hôm nay bạn học được điều gì mới? Mỗi ngày một chút, một năm là cả kho báu! 📚",
  "CPU là não bộ, RAM là trí nhớ - bạn đang rèn luyện cả hai! 🧠",
  "Đam mê công nghệ là ngọn lửa không bao giờ tắt. Hãy giữ lửa nhé! 🔥",
  "Mỗi dòng code, mỗi con chip đều kể một câu chuyện. Hãy khám phá! 💻",
  "Kiên trì là chìa khóa. Ngày hôm nay mệt mỏi, ngày mai sẽ tiến bộ! ⚡",
  "Tương lai thuộc về những ai học hỏi không ngừng. Bạn đang đi đúng hướng! 🚀",
  "PC Master không chỉ là lắp ráp, mà là sáng tạo và đam mê! ⭐",
  "Học qua thực hành là cách tốt nhất. Builder Lab đang chờ bạn! 🎮",
  "Thử thách bản thân mỗi ngày. Học một linh kiện mới, hiểu thêm về công nghệ! 📈",
  "Công nghệ thay đổi từng ngày, và bạn đang bắt kịp! 🌟",
  "Mỗi bài quiz hoàn thành là một chiến thắng nhỏ. Tiếp tục nhé! 🏆",
  "PC là công cụ mạnh nhất - bạn đang học cách làm chủ nó! 💡",
]

function getDailyQuote(): string {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
}

export default function ProgressView({ data }: ProgressViewProps) {
  const router = useRouter()
  const { stats, dailyProgress, lessons, quizResults, builderActivity } = data
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all')

  const filteredLessons = lessons.filter(l => {
    if (filter === 'all') return true
    return l.status === filter
  })

  // Heatmap rows & cols logic (simplified for Github contribution graph style)
  const heatmapCols = 13 // approx 3 months of weeks
  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return '#1a1c25'
    if (minutes < 15) return 'rgba(0, 212, 170, 0.4)'
    if (minutes < 30) return 'rgba(0, 212, 170, 0.6)'
    if (minutes < 60) return 'rgba(0, 212, 170, 0.8)'
    return '#00d4aa'
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      
      {/* Workspace Title & Exit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
            <BarChart2 size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Tiến Độ Học Tập Của Bạn</h1>
            <p className="text-xs text-gray-400 mt-0.5">Tổng quan kết quả, hoạt động phòng Lab và tiến độ hoàn thành khóa học</p>
          </div>
        </div>

        {/* EXIT BUTTON */}
        <button 
          onClick={() => router.push('/student')}
          className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại Dashboard
        </button>
      </div>

      {/* Daily Motivation */}
      <div className="bg-gradient-to-r from-[#00d4aa15] to-[#06b6d415] border border-[#00d4aa]/20 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-2xl">💡</span>
        <p className="text-sm text-[#dde0ed] leading-relaxed">{getDailyQuote()}</p>
      </div>

      {/* Section 1 - Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#11121d]/90 border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[#6b6e80] text-sm mb-1">Hoàn thành</p>
            <h2 className="text-3xl font-bold text-[#dde0ed]">{stats.completed} <span className="text-[#6b6e80] text-lg">/ {stats.total}</span></h2>
          </div>
          <div className="w-12 h-12 bg-[#00d4aa]/10 rounded-full flex items-center justify-center text-[#00d4aa] text-xl">✅</div>
        </div>

        <div className="bg-[#11121d]/90 border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[#6b6e80] text-sm mb-1">Điểm TB Quiz</p>
            <h2 className={`text-3xl font-bold ${stats.avgScore >= 70 ? 'text-[#00d4aa]' : 'text-red-500'}`}>{stats.avgScore}</h2>
          </div>
          <div className="w-12 h-12 bg-[#00d4aa]/10 rounded-full flex items-center justify-center text-[#00d4aa] text-xl">🎯</div>
        </div>

        <div className="bg-[#11121d]/90 border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[#6b6e80] text-sm mb-1">Thời gian học</p>
            <h2 className="text-3xl font-bold text-[#dde0ed]">{(stats.totalSeconds / 3600).toFixed(1)}h</h2>
          </div>
          <div className="w-12 h-12 bg-[#00d4aa]/10 rounded-full flex items-center justify-center text-[#00d4aa] text-xl">⏱️</div>
        </div>

        <div className="bg-[#11121d]/90 border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[#6b6e80] text-sm mb-1">Streak</p>
            <h2 className="text-3xl font-bold text-[#dde0ed]">{stats.streak} ngày</h2>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 text-xl">🔥</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 2 - Biểu đồ tiến độ */}
        <div className="bg-[#11121d]/90 border border-gray-800 rounded-[28px] p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#dde0ed] mb-6">Tiến độ 30 ngày</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(0,212,170,0.2)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgba(0,212,170,0)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b6e80" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b6e80" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1c25', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}
                  itemStyle={{ color: '#00d4aa' }}
                  formatter={(value: number) => [`${value} bài hoàn thành`, '']}
                  labelStyle={{ color: '#dde0ed', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#00d4aa" strokeWidth={3} dot={{ fill: '#00d4aa', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4 - Phân tích Quiz */}
        <div className="bg-[#11121d]/90 border border-gray-800 rounded-[28px] p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#dde0ed] mb-6">Phân tích Quiz</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizResults} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="quiz_title" stroke="#6b6e80" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                <YAxis stroke="#6b6e80" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11121d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <ReferenceLine y={70} stroke="#6b6e80" strokeDasharray="3 3" label={{ position: 'top', value: 'Ngưỡng đạt', fill: '#6b6e80', fontSize: 10 }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {
                    quizResults.map((entry, index) => {
                      const color = entry.score >= 90 ? '#00d4aa' : entry.score >= 70 ? '#4a90e2' : '#e84855'
                      return <Cell key={`cell-${index}`} fill={color} />
                    })
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 5 - Builder Lab Activity */}
      <div className="bg-[#11121d]/90 border border-gray-800 rounded-[28px] p-6 shadow-lg">
        <h3 className="text-lg font-bold text-[#dde0ed] mb-4">Builder Lab Activity (90 ngày)</h3>
        <div className="flex gap-2 overflow-x-auto pb-4">
          <div className="flex flex-col flex-wrap h-32 gap-1 content-start">
            {builderActivity.map((day, i) => (
              <div 
                key={i} 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: getIntensityColor(day.minutes) }}
                title={`${day.date}: ${day.minutes} phút`}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-[#6b6e80] justify-end">
          <span>Ít</span>
          <div className="w-3 h-3 rounded-sm bg-[#11121d] border border-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-[#00d4aa] opacity-40"></div>
          <div className="w-3 h-3 rounded-sm bg-[#00d4aa] opacity-60"></div>
          <div className="w-3 h-3 rounded-sm bg-[#00d4aa] opacity-80"></div>
          <div className="w-3 h-3 rounded-sm bg-[#00d4aa]"></div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Section 3 - Danh sách bài học */}
      <div className="bg-[#11121d]/90 border border-gray-800 rounded-[28px] p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-[#dde0ed]">Lịch sử học tập</h3>
          <div className="flex gap-2 bg-[#0d0e13] p-1 rounded-lg border border-[rgba(255,255,255,0.07)] overflow-x-auto w-full md:w-auto">
            {['all', 'completed', 'in_progress', 'not_started'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filter === f ? 'bg-[#1a1c25] text-[#00d4aa] shadow' : 'text-[#6b6e80] hover:text-[#dde0ed]'}`}
              >
                {f === 'all' ? 'Tất cả' : f === 'completed' ? 'Đã xong' : f === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="py-3 px-4 text-xs font-semibold text-[#6b6e80] uppercase tracking-wider">Tên bài</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6b6e80] uppercase tracking-wider">Loại</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6b6e80] uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6b6e80] uppercase tracking-wider">Điểm</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6b6e80] uppercase tracking-wider">Hoàn thành lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
              {filteredLessons.map((l) => (
                <tr key={l.id} className="hover:bg-[#0d0e13]/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-[#dde0ed]">{l.lesson_title}</td>
                  <td className="py-4 px-4 text-sm text-[#6b6e80]">{l.type}</td>
                  <td className="py-4 px-4">
                    {l.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00d4aa]/10 text-[#00d4aa]">Hoàn thành</span>
                    ) : l.status === 'in_progress' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">Đang học ({l.completion_percentage}%)</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Chưa bắt đầu</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#dde0ed]">{l.score !== null ? l.score : '-'}</td>
                  <td className="py-4 px-4 text-sm text-[#6b6e80]">
                    {l.completed_at ? new Date(l.completed_at).toLocaleString('vi-VN') : '-'}
                  </td>
                </tr>
              ))}
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6b6e80] text-sm">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
