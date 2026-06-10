'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookOpen, Clock, Trophy, Award, Activity, FileText, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function UserProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (userId) fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2a0]"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy người dùng</h2>
        <Link href="/" className="px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl">Quay lại trang chủ</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/student/classes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </Link>

        {/* HEADER SECTION */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden mb-8 shadow-xl">
          <div className="h-48 md:h-64 bg-gradient-to-r from-[#00d2a0]/20 via-[#00b4d8]/20 to-purple-500/20 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20 relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#16213e] bg-[#0f0f1a] overflow-hidden shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#2a3655] flex items-center justify-center text-4xl font-bold text-slate-500">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {profile.full_name}
                  {profile.role === 'admin' && <ShieldCheck className="text-[#00d2a0]" size={24} />}
                </h1>
                <p className="text-slate-400 mt-1 flex items-center gap-2">
                  {profile.role.toUpperCase()} 
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span>Tham gia từ: {new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Bài học" value="12" icon={<BookOpen size={24} />} color="#00d2a0" />
          <StatCard label="Giờ học" value="48h" icon={<Clock size={24} />} color="#a855f7" />
          <StatCard label="Điểm XP" value="2,450" icon={<Trophy size={24} />} color="#eab308" />
          <StatCard label="Huy hiệu" value="8" icon={<Award size={24} />} color="#00b4d8" />
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] p-6 md:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[#00d2a0]" /> Hoạt động gần đây
          </h3>
          
          <div className="space-y-6">
            <ActivityItem title="Hoàn thành bài giảng: CPU Socket Types" date="Hôm nay" />
            <ActivityItem title="Đạt điểm 10 trong bài thi giữa kỳ" date="Hôm qua" />
            <ActivityItem title="Mở khóa huy hiệu: Fast Learner" date="3 ngày trước" />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-[#16213e] p-5 rounded-2xl border border-[#1e293b] flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}10`, color: color }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function ActivityItem({ title, date }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-[#0f0f1a] border border-[#1e293b]">
      <div className="w-2 h-2 rounded-full bg-[#00d2a0] mt-2"></div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{date}</p>
      </div>
    </div>
  )
}
