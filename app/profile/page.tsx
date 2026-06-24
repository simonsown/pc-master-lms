'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfile } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'
import { BookOpen, Clock, Trophy, Award, Camera, Settings, Activity, FileText, ChevronRight, Edit3, ShieldCheck, User, Loader, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { toast } from 'react-hot-toast'
import { updateProfile } from '@/app/actions/profile'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activity')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [saving, setSaving] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['activity', 'exams', 'badges', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
        if (data) {
          setFullName(data.full_name || '')
          setBio(data.bio || '')
          setSchool(data.school || '')
          setGrade(data.grade || '')
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận ảnh đại diện định dạng ảnh (JPEG/PNG/GIF).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 2MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (dbError) throw dbError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải ảnh lên.')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile({
        full_name: fullName,
        bio: bio.slice(0, 200),
        school,
        grade
      })
      setProfile({ ...profile, full_name: fullName, bio, school, grade })
      setEditMode(false)
      toast.success('Đã lưu thông tin cá nhân!')
    } catch (err: any) {
      toast.error('Lỗi khi lưu thông tin.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
        <a href="/login" style={{ padding: '12px 24px', background: 'var(--brand-primary)', color: 'var(--bg-base)', fontWeight: 700, borderRadius: '12px', textDecoration: 'none' }}>Đi tới Đăng nhập</a>
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ paddingTop: '96px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '1280px', margin: '0 auto' }} className="sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 24px var(--shadow-color)' }}>
          {/* Banner */}
          <div style={{ height: '192px', background: 'linear-gradient(to right, color-mix(in srgb, var(--brand-primary) 20%, transparent), color-mix(in srgb, var(--accent-blue) 20%, transparent), color-mix(in srgb, var(--accent-purple) 20%, transparent))', position: 'relative' }} className="md:h-64">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          {/* Profile Info Overlay */}
          <div style={{ padding: '24px 40px 32px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:flex-row md:items-end md:gap-8">
              
              {/* Avatar */}
              <div style={{ position: 'relative', alignSelf: 'flex-start', marginTop: '-64px' }} className="md:-mt-20">
                <div style={{ width: '128px', height: '128px', borderRadius: '50%', border: '4px solid var(--bg-surface)', background: 'var(--bg-base)', overflow: 'hidden', boxShadow: '0 8px 32px var(--shadow-hover)' }} className="md:w-40 md:h-40">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, var(--bg-elevated), color-mix(in srgb, var(--bg-elevated) 80%, var(--accent-blue)))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '10px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px var(--shadow-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {uploading ? <Loader size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
              </div>

              {/* Basic Info */}
              <div style={{ flex: 1, paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {profile.full_name}
                      {profile.role === 'admin' && <ShieldCheck style={{ color: 'var(--brand-primary)' }} size={24} />}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      {profile.email} 
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                      <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', padding: '2px 8px', borderRadius: '4px', border: '1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)' }}>
                        {profile.role}
                      </span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setEditMode(!editMode)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', borderRadius: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
                  >
                    <Edit3 size={18} /> {editMode ? 'Đóng' : 'Chỉnh sửa hồ sơ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: '32px' }}
            >
              <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', padding: isMobile ? '16px' : '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} style={{ color: 'var(--brand-primary)' }} />
                  Chỉnh sửa thông tin
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--text-muted)' }}>Họ và tên</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--text-muted)' }}>Lớp</label>
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="VD: 10A1"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--text-muted)' }}>Trường học</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Tên trường..."
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Tiểu sử ngắn</label>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bio.length}/200</span>
                    </div>
                    <textarea
                      rows={3}
                      value={bio}
                      maxLength={200}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Một vài dòng giới thiệu..."
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      style={{ padding: '12px 24px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.6 : 1 }}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-muted)', borderRadius: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }} className="md:grid-cols-4">
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Bài học hoàn thành</p>
              <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>12<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/24</span></p>
            </div>
          </div>
          
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-purple) 10%, transparent)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Tổng giờ học</p>
              <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>48<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>h</span></p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={24} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Điểm tích lũy</p>
              <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>2,450 <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>XP</span></p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Chứng chỉ đạt được</p>
              <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>2</p>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION & CONTENT */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', overflow: 'hidden', minHeight: '500px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-default)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="profileTabIndicator"
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--brand-primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: isMobile ? '16px' : '24px 32px' }}>
            
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Hoạt động gần đây</h3>
                  
                  <div style={{ position: 'relative', borderLeft: '1px solid var(--border-default)', marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '16px' }}>
                    <div style={{ position: 'relative', paddingLeft: '32px' }}>
                      <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'var(--brand-primary)', borderRadius: '50%', left: '-8.5px', top: '4px', border: '4px solid var(--bg-surface)', boxShadow: '0 0 10px color-mix(in srgb, var(--brand-primary) 50%, transparent)' }} />
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hôm nay, 14:30</div>
                      <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        <p style={{ fontWeight: 500 }}>Hoàn thành bài học: <span style={{ color: 'var(--text-primary)' }}>Cấu trúc cơ bản của Mainboard</span></p>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Đạt 100% điểm thực hành Lab 2D.</p>
                      </div>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '32px' }}>
                      <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'var(--accent-amber)', borderRadius: '50%', left: '-8.5px', top: '4px', border: '4px solid var(--bg-surface)' }} />
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hôm qua, 09:15</div>
                      <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        <p style={{ fontWeight: 500 }}>Mở khóa huy hiệu: <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>Thợ máy tập sự</span></p>
                      </div>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '32px' }}>
                      <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'var(--bg-elevated)', borderRadius: '50%', left: '-8.5px', top: '4px', border: '4px solid var(--bg-surface)' }} />
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>3 ngày trước</div>
                      <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Gia nhập lớp học: <span style={{ color: 'var(--text-primary)' }}>10A1 - Tin học cơ bản</span></p>
                      </div>
                    </div>
                  </div>

                  <button style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: 'var(--accent-blue)', background: 'transparent', border: 'none', cursor: 'pointer', paddingLeft: '16px' }}>
                    Xem toàn bộ lịch sử <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {activeTab === 'exams' && (
                <motion.div key="exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Lịch sử bài thi</h3>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '14px', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 500 }}>Tên bài thi</th>
                          <th style={{ padding: '12px 16px', fontWeight: 500 }}>Ngày thi</th>
                          <th style={{ padding: '12px 16px', fontWeight: 500 }}>Điểm số</th>
                          <th style={{ padding: '12px 16px', fontWeight: 500 }}>Xếp loại</th>
                          <th style={{ padding: '12px 16px', fontWeight: 500 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                          <td style={{ padding: '16px', fontWeight: 500 }}>Kiểm tra 15p: Linh kiện CPU</td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>10/05/2026</td>
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--brand-primary)' }}>9.5</td>
                          <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', background: 'color-mix(in srgb, var(--success) 10%, transparent)', color: 'var(--success)', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Giỏi</span></td>
                          <td style={{ padding: '16px', textAlign: 'right' }}><button style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-blue)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Xem chi tiết</button></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                          <td style={{ padding: '16px', fontWeight: 500 }}>Thực hành lắp ráp PC Gaming</td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>05/05/2026</td>
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-amber)' }}>8.0</td>
                          <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', color: 'var(--accent-blue)', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Khá</span></td>
                          <td style={{ padding: '16px', textAlign: 'right' }}><button style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-blue)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Xem chi tiết</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'badges' && (
                <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Huy hiệu</h3>
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>Chưa có huy hiệu nào.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div style={{ maxWidth: '448px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Cài đặt tài khoản</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Đổi mật khẩu</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Mật khẩu hiện tại</label>
                            <input type="password" placeholder="••••••••" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '10px 16px', outline: 'none', color: 'var(--text-primary)', fontSize: '14px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Mật khẩu mới</label>
                            <input type="password" placeholder="••••••••" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '10px 16px', outline: 'none', color: 'var(--text-primary)', fontSize: '14px' }} />
                          </div>
                          <button style={{ alignSelf: 'flex-start', padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)' }}>Cập nhật mật khẩu</button>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '4px', color: '#ef4444' }}>Khu vực nguy hiểm</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Hành động này không thể hoàn tác.</p>
                        <button style={{ padding: '8px 16px', background: 'color-mix(in srgb, #ef4444 10%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 20%, transparent)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#ef4444' }}>Xóa tài khoản</button>
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
