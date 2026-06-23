'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Search, Filter, ArrowUp, ArrowDown, User, Star, Award, Zap, ArrowLeft, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
function getLevelInfo(xp: number = 0) {
  const levels = [
    { level: 1, title: 'Tân Thủ', icon: '🪴', color_hex: '#6b7280', min_xp: 0, max_xp: 499, xp_required: 500 },
    { level: 2, title: 'Học Viên', icon: '📘', color_hex: '#3b82f6', min_xp: 500, max_xp: 1499, xp_required: 1000 },
    { level: 3, title: 'Kỹ Thuật Viên', icon: '🔧', color_hex: '#10b981', min_xp: 1500, max_xp: 3499, xp_required: 2000 },
  ]
  const lvl = levels[Math.min(Math.floor(xp / 500), levels.length - 1)]
  return { level: lvl, title: lvl.title, xpForNext: lvl.xp_required, currentXp: xp, progress: (xp % 500) / 5 }
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('global')
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentRank, setCurrentRank] = useState<number>(0)

  useEffect(() => {
    fetchLeaderboard()

    const channel = supabase
      .channel('leaderboard_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchLeaderboard())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50)

      if (data) {
        setTopPlayers(data.slice(0, 3))
        setOtherPlayers(data.slice(3))
        const myIndex = data.findIndex(p => p.id === user?.id)
        setCurrentRank(myIndex >= 0 ? myIndex + 1 : 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--brand-primary)' }}>
      Đang tải bảng xếp hạng...
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Quay lại
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Bảng <span style={{ color: 'var(--brand-primary)' }}>Xếp hạng</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Những học viên xuất sắc nhất trong cộng đồng PC Master Builder.</p>
        </div>

        {/* Podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-20 px-4">
          {[1, 0, 2].map((idx) => {
            const player = topPlayers[idx]
            const isFirst = idx === 0
            const levelInfo = player ? getLevelInfo(player.xp || 0) : null
            const height = isFirst ? 'h-80' : idx === 1 ? 'h-64' : 'h-56'
            const rank = idx === 0 ? 1 : idx === 1 ? 2 : 3
            const medalColors = ['var(--accent-amber)', 'var(--text-muted)', 'var(--accent-orange)']

            return (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className={`w-full md:w-64 rounded-t-[32px] p-8 text-center relative ${height} flex flex-col items-center justify-end`}
                style={{
                  background: isFirst
                    ? 'linear-gradient(to bottom, var(--bg-surface), color-mix(in srgb, var(--brand-primary) 10%, transparent))'
                    : 'var(--bg-surface)',
                  border: isFirst
                    ? '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)'
                    : '1px solid var(--border-default)',
                  boxShadow: isFirst ? '0 0 50px rgba(0,210,160,0.1)' : 'none',
                }}
              >
                <div className={`absolute -top-${isFirst ? '12' : '10'} w-${isFirst ? '24' : '20'} h-${isFirst ? '24' : '20'} rounded-full p-1 ${isFirst ? 'animate-pulse' : ''}`}
                  style={{ background: medalColors[idx] }}>
                  <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: 'var(--bg-surface)' }}>
                    {player?.full_name?.charAt(0) || rank}
                  </div>
                  {isFirst && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500"><Trophy size={32} /></div>}
                </div>
                <div className="mb-4">
                  <p className={`font-bold ${isFirst ? 'text-xl' : 'text-lg'}`} style={{ color: 'var(--text-primary)' }}>{player?.full_name || 'Đang chờ...'}</p>
                  {levelInfo && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '18px' }}>{levelInfo.level.icon}</span>
                      <span style={{ fontSize: '12px', color: levelInfo.level.color_hex, fontWeight: 700 }}>Level {levelInfo.level.level}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{player?.xp || 0} XP</span>
                    </div>
                  )}
                </div>
                <div className={`w-full py-${isFirst ? '6' : '4'} rounded-2xl border font-black text-${isFirst ? '4xl' : '2xl'} ${isFirst ? 'shadow-xl' : ''}`}
                  style={{
                    background: isFirst ? 'var(--accent-amber)' : `color-mix(in srgb, ${medalColors[idx]} 10%, transparent)`,
                    color: isFirst ? 'var(--bg-base)' : medalColors[idx],
                    borderColor: isFirst ? 'transparent' : `color-mix(in srgb, ${medalColors[idx]} 20%, transparent)`,
                  }}>
                  {rank}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('global')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'global' ? '' : ''}`}
            style={{
              background: activeTab === 'global' ? 'var(--brand-primary)' : 'var(--bg-surface)',
              color: activeTab === 'global' ? 'var(--bg-base)' : 'var(--text-muted)'
            }}>TOÀN CẦU</button>
          <button onClick={() => setActiveTab('class')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'class' ? '' : ''}`}
            style={{
              background: activeTab === 'class' ? 'var(--brand-primary)' : 'var(--bg-surface)',
              color: activeTab === 'class' ? 'var(--bg-base)' : 'var(--text-muted)'
            }}>LỚP HỌC</button>
        </div>

        {/* List */}
        <div className="rounded-[32px] overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          {otherPlayers.map((p, i) => {
            const levelInfo = getLevelInfo(p.xp || 0)
            return (
              <div key={p.id} className={`flex items-center justify-between p-6 transition-all ${p.id === currentUser?.id ? 'ring-2 ring-inset ring-[var(--brand-primary)]' : ''}`}
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  background: p.id === currentUser?.id ? 'rgba(0,212,170,0.03)' : 'transparent',
                }}>
                <div className="flex items-center gap-6">
                  <span className="text-xl font-black w-8" style={{ color: 'var(--text-muted)' }}>{i + 4}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                      {p.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.full_name}</p>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '14px' }}>{levelInfo.level.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: levelInfo.level.color_hex }}>
                          Level {levelInfo.level.level} - {levelInfo.level.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{p.xp}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>XP</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', color: 'var(--brand-primary)' }}>
                    <Shield size={18} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* My Rank */}
        {currentUser && currentRank > 0 && (
          <div className="mt-12 p-6 rounded-3xl flex items-center justify-between" style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black">#{currentRank}</span>
              <div>
                <p className="font-black leading-none">Hạng của bạn</p>
                <p className="text-xs font-bold opacity-70">
                  {currentRank <= 3 ? '🏆 Bạn đang trong Top 3!' : currentRank <= 10 ? '⭐ Bạn đang trong Top 10!' : `Bạn đang trong Top ${Math.ceil(currentRank / 10) * 10}`}
                </p>
              </div>
            </div>
            <Link href="/student/level" style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)', textDecoration: 'none' }}>
              XEM CẤP ĐỘ
            </Link>
          </div>
        )}
        {(!currentUser || currentRank === 0) && (
          <div className="mt-12 p-6 rounded-3xl flex items-center justify-between" style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#fff' }}>
            <div className="flex items-center gap-4">
              <Zap size={24} color="var(--brand-primary)" />
              <div>
                <p className="font-black leading-none">Đăng nhập để tham gia bảng xếp hạng</p>
                <p className="text-xs font-bold opacity-70">Bắt đầu học để có mặt trên leaderboard!</p>
              </div>
            </div>
            <Link href="/login" style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', background: '#fff', color: '#000', textDecoration: 'none' }}>
              ĐĂNG NHẬP
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
