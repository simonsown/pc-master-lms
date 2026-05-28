'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Search, Filter, ArrowUp, ArrowDown, User, Star, Award, Zap, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('global')
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10)

      if (data) {
        setTopPlayers(data.slice(0, 3))
        setOtherPlayers(data.slice(3))
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
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full md:w-64 rounded-t-[32px] p-8 text-center relative h-64 flex flex-col items-center justify-end"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
             <div className="absolute -top-10 w-20 h-20 rounded-full p-1" style={{ background: 'var(--text-muted)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--bg-surface)' }}>
                  {topPlayers[1]?.full_name?.charAt(0) || '2'}
                </div>
             </div>
              <div className="mb-4">
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{topPlayers[1]?.full_name || 'Đang chờ...'}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{topPlayers[1]?.xp || 0} XP</p>
              </div>
              <div className="w-full py-4 rounded-2xl border font-black text-2xl" style={{ background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)', color: 'var(--text-muted)', borderColor: 'color-mix(in srgb, var(--text-muted) 20%, transparent)' }}>2</div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-72 rounded-t-[40px] p-8 text-center relative h-80 flex flex-col items-center justify-end shadow-[0_0_50px_rgba(0,210,160,0.1)]"
            style={{ background: 'linear-gradient(to bottom, var(--bg-surface), color-mix(in srgb, var(--brand-primary) 10%, transparent))', border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}
          >
             <div className="absolute -top-12 w-24 h-24 rounded-full p-1 animate-pulse shadow-[0_0_30px_rgba(234,179,8,0.3)]" style={{ background: 'var(--accent-amber)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: 'var(--bg-surface)' }}>
                  {topPlayers[0]?.full_name?.charAt(0) || '1'}
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500"><Trophy size={32} /></div>
             </div>
              <div className="mb-6">
                <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>{topPlayers[0]?.full_name || 'Đang chờ...'}</p>
                <p className="font-bold" style={{ color: 'var(--brand-primary)' }}>{topPlayers[0]?.xp || 0} XP</p>
              </div>
              <div className="w-full py-6 rounded-2xl font-black text-4xl shadow-xl" style={{ background: 'var(--accent-amber)', color: 'var(--bg-base)' }}>1</div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-64 rounded-t-[32px] p-8 text-center relative h-56 flex flex-col items-center justify-end"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
             <div className="absolute -top-10 w-20 h-20 rounded-full p-1" style={{ background: 'var(--accent-orange)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--bg-surface)' }}>
                  {topPlayers[2]?.full_name?.charAt(0) || '3'}
                </div>
             </div>
              <div className="mb-4">
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{topPlayers[2]?.full_name || 'Đang chờ...'}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{topPlayers[2]?.xp || 0} XP</p>
              </div>
              <div className="w-full py-4 rounded-2xl border font-black text-2xl" style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', color: 'var(--accent-orange)', borderColor: 'color-mix(in srgb, var(--accent-orange) 20%, transparent)' }}>3</div>
          </motion.div>
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
          {otherPlayers.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-6 transition-all" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-6">
                <span className="text-xl font-black w-8" style={{ color: 'var(--text-muted)' }}>{i + 4}</span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    {p.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.full_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Học viên</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{p.xp}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>XP</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', color: 'var(--brand-primary)' }}>
                  <Zap size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Rank Placeholder */}
        <div className="mt-12 p-6 rounded-3xl flex items-center justify-between" style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}>
           <div className="flex items-center gap-4">
             <span className="text-2xl font-black">#124</span>
             <div>
               <p className="font-black leading-none">Bạn (Nguyễn Văn H)</p>
               <p className="text-xs font-bold opacity-70">Còn thiếu 150 XP để vào Top 100</p>
             </div>
           </div>
            <button className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>TĂNG TỐC NGAY</button>
        </div>
      </main>
    </div>
  )
}
