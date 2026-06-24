'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookOpen, Clock, Trophy, Award, Activity, ShieldCheck, ArrowLeft } from 'lucide-react'
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
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', padding: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Không tìm thấy người dùng</h2>
        <Link href="/" style={{ padding: '12px 24px', background: 'var(--brand-primary)', color: 'var(--bg-base)', fontWeight: 700, borderRadius: '12px', textDecoration: 'none' }}>Quay lại trang chủ</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ paddingTop: '96px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '1280px', margin: '0 auto' }} className="sm:px-6 lg:px-8">
        <Link href="/student/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px' }}>
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </Link>

        {/* HEADER SECTION */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 24px var(--shadow-color)' }}>
          <div style={{ height: '192px', background: 'linear-gradient(to right, color-mix(in srgb, var(--brand-primary) 20%, transparent), color-mix(in srgb, var(--accent-blue) 20%, transparent), color-mix(in srgb, var(--accent-purple) 20%, transparent))', position: 'relative' }} className="md:h-64">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          <div style={{ padding: '24px 40px 32px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:flex-row md:items-end md:gap-8">
              <div style={{ width: '128px', height: '128px', borderRadius: '50%', border: '4px solid var(--bg-surface)', background: 'var(--bg-base)', overflow: 'hidden', boxShadow: '0 8px 32px var(--shadow-hover)', marginTop: '-64px' }} className="md:w-40 md:h-40 md:-mt-20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, var(--bg-elevated), color-mix(in srgb, var(--bg-elevated) 80%, var(--accent-blue)))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, paddingBottom: '8px' }}>
                <h1 style={{ fontSize: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {profile.full_name}
                  {profile.role === 'admin' && <ShieldCheck style={{ color: 'var(--brand-primary)' }} size={24} />}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  {profile.role.toUpperCase()} 
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                  <span>Tham gia từ: {new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }} className="md:grid-cols-4">
          <StatCard label="Bài học" value="12" icon={<BookOpen size={24} />} color="var(--brand-primary)" />
          <StatCard label="Giờ học" value="48h" icon={<Clock size={24} />} color="var(--accent-purple)" />
          <StatCard label="Điểm XP" value="2,450" icon={<Trophy size={24} />} color="var(--accent-amber)" />
          <StatCard label="Huy hiệu" value="8" icon={<Award size={24} />} color="var(--accent-blue)" />
        </div>

        {/* RECENT ACTIVITY */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: '24px 32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--brand-primary)' }} /> Hoạt động gần đây
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
    <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `color-mix(in srgb, ${color} 10%, transparent)`, color }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}

function ActivityItem({ title, date }: any) {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)', marginTop: '8px', flexShrink: 0 }} />
      <div>
        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{date}</p>
      </div>
    </div>
  )
}
