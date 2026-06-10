'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfile } from '@/lib/auth-actions'
import { BookOpen, Clock, Trophy, Award, Camera, Settings, Activity, FileText, ChevronRight, Edit3, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activity')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2a0]"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <a href="/login" className="px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl">Đi tới Đăng nhập</a>
      </div>
    )
  }

  const tabs = [
    { id: 'activity', label: 'Hoạt động', icon: <Activity size={18} /> },
    { id: 'exams', label: 'Kết quả thi', icon: <FileText size={18} /> },
    { id: 'badges', label: 'Huy hiệu', icon: <Award size={18} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden mb-8 shadow-xl">
          {/* Banner */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-[#00d2a0]/20 via-[#00b4d8]/20 to-purple-500/20 relative group">
            {/* Banner Cover Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <button className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 border border-white/10 flex items-center gap-2 text-sm font-medium z-10">
              <Camera size={16} /> <span className="hidden sm:inline">Đổi ảnh bìa</span>
            </button>
          </div>

          {/* Profile Info Overlay */}
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20 relative z-10">
              
              {/* Avatar */}
              <div className="relative group self-start">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#16213e] bg-[#0f0f1a] overflow-hidden shadow-2xl">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#2a3655] flex items-center justify-center text-4xl font-bold text-slate-500">
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2.5 bg-[#00d2a0] text-black rounded-full hover:bg-[#00e6af] shadow-lg transition-transform hover:scale-110">
                  <Camera size={18} />
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                      {profile.full_name}
                      {profile.role === 'admin' && <ShieldCheck className="text-[#00d2a0]" size={24} />}
                    </h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                      {profile.email} 
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span className="uppercase text-xs font-bold text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded border border-[#00b4d8]/20">
                        {profile.role}
                      </span>
                    </p>
                  </div>
                  
                  <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e293b] hover:bg-[#2a3655] border border-[#2a3655] text-white rounded-xl font-medium transition-colors">
                    <Edit3 size={18} /> Chỉnh sửa hồ sơ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16213e] p-5 rounded-2xl border border-[#1e293b] flex items-center gap-4 hover:border-[#2a3655] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00d2a0]/10 text-[#00d2a0] flex items-center justify-center shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Bài học hoàn thành</p>
              <p className="text-2xl font-bold mt-0.5">12<span className="text-sm text-slate-500 font-normal">/24</span></p>
            </div>
          </div>
          
          <div className="bg-[#16213e] p-5 rounded-2xl border border-[#1e293b] flex items-center gap-4 hover:border-[#2a3655] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Tổng giờ học</p>
              <p className="text-2xl font-bold mt-0.5">48<span className="text-sm text-slate-500 font-normal">h</span></p>
            </div>
          </div>

          <div className="bg-[#16213e] p-5 rounded-2xl border border-[#1e293b] flex items-center gap-4 hover:border-[#2a3655] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Điểm tích lũy</p>
              <p className="text-2xl font-bold mt-0.5">2,450 <span className="text-sm text-slate-500 font-normal">XP</span></p>
            </div>
          </div>

          <div className="bg-[#16213e] p-5 rounded-2xl border border-[#1e293b] flex items-center gap-4 hover:border-[#2a3655] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/10 text-[#00b4d8] flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Chứng chỉ đạt được</p>
              <p className="text-2xl font-bold mt-0.5">2</p>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION & CONTENT */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden min-h-[500px]">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-[#1e293b] scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/50'
                }`}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="profileTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d2a0]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h3 className="text-lg font-bold mb-6">Hoạt động gần đây</h3>
                  
                  <div className="relative border-l border-[#2a3655] ml-4 space-y-8 pb-4">
                    {/* Activity Item */}
                    <div className="relative pl-8">
                      <div className="absolute w-4 h-4 bg-[#00d2a0] rounded-full left-[-8.5px] top-1 border-4 border-[#16213e] shadow-[0_0_10px_rgba(0,210,160,0.5)]"></div>
                      <div className="text-sm text-slate-400 mb-1">Hôm nay, 14:30</div>
                      <div className="bg-[#0f0f1a] p-4 rounded-xl border border-[#1e293b]">
                        <p className="font-medium">Hoàn thành bài học: <span className="text-white">Cấu trúc cơ bản của Mainboard</span></p>
                        <p className="text-sm text-slate-400 mt-1">Đạt 100% điểm thực hành Lab 2D.</p>
                      </div>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute w-4 h-4 bg-yellow-500 rounded-full left-[-8.5px] top-1 border-4 border-[#16213e]"></div>
                      <div className="text-sm text-slate-400 mb-1">Hôm qua, 09:15</div>
                      <div className="bg-[#0f0f1a] p-4 rounded-xl border border-[#1e293b]">
                        <p className="font-medium">Mở khóa huy hiệu: <span className="text-yellow-400 font-bold">Thợ máy tập sự</span></p>
                      </div>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute w-4 h-4 bg-[#1e293b] rounded-full left-[-8.5px] top-1 border-4 border-[#16213e]"></div>
                      <div className="text-sm text-slate-400 mb-1">3 ngày trước</div>
                      <div className="bg-[#0f0f1a] p-4 rounded-xl border border-[#1e293b]">
                        <p className="font-medium text-slate-300">Gia nhập lớp học: <span className="text-white">10A1 - Tin học cơ bản</span></p>
                      </div>
                    </div>
                  </div>

                  <button className="mt-4 flex items-center gap-1 text-sm font-medium text-[#00b4d8] hover:text-[#00d2a0] transition-colors pl-4">
                    Xem toàn bộ lịch sử <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {activeTab === 'exams' && (
                <motion.div key="exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Lịch sử bài thi</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#2a3655] text-sm text-slate-400">
                          <th className="py-3 px-4 font-medium">Tên bài thi</th>
                          <th className="py-3 px-4 font-medium">Ngày thi</th>
                          <th className="py-3 px-4 font-medium">Điểm số</th>
                          <th className="py-3 px-4 font-medium">Xếp loại</th>
                          <th className="py-3 px-4 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#1e293b] hover:bg-[#1e293b]/30 transition-colors">
                          <td className="py-4 px-4 font-medium">Kiểm tra 15p: Linh kiện CPU</td>
                          <td className="py-4 px-4 text-slate-400 text-sm">10/05/2026</td>
                          <td className="py-4 px-4 font-bold text-[#00d2a0]">9.5</td>
                          <td className="py-4 px-4"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold uppercase">Giỏi</span></td>
                          <td className="py-4 px-4 text-right"><button className="text-sm font-medium text-[#00b4d8] hover:underline">Xem chi tiết</button></td>
                        </tr>
                        <tr className="border-b border-[#1e293b] hover:bg-[#1e293b]/30 transition-colors">
                          <td className="py-4 px-4 font-medium">Thực hành lắp ráp PC Gaming</td>
                          <td className="py-4 px-4 text-slate-400 text-sm">05/05/2026</td>
                          <td className="py-4 px-4 font-bold text-yellow-400">8.0</td>
                          <td className="py-4 px-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-bold uppercase">Khá</span></td>
                          <td className="py-4 px-4 text-right"><button className="text-sm font-medium text-[#00b4d8] hover:underline">Xem chi tiết</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-bold mb-6">Cài đặt tài khoản</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-5">
                        <h4 className="font-semibold mb-4 text-white">Đổi mật khẩu</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Mật khẩu hiện tại</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-[#16213e] border border-[#2a3655] rounded-lg px-4 py-2.5 outline-none focus:border-[#00d2a0] text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Mật khẩu mới</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-[#16213e] border border-[#2a3655] rounded-lg px-4 py-2.5 outline-none focus:border-[#00d2a0] text-white" />
                          </div>
                          <button className="px-4 py-2 bg-[#1e293b] hover:bg-[#2a3655] border border-[#2a3655] rounded-lg text-sm font-medium transition-colors">Cập nhật mật khẩu</button>
                        </div>
                      </div>

                      <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-5">
                        <h4 className="font-semibold mb-1 text-red-400">Khu vực nguy hiểm</h4>
                        <p className="text-sm text-slate-400 mb-4">Hành động này không thể hoàn tác.</p>
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Xóa tài khoản</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </main>
    </div>
  )
}
