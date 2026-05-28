'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PreferencesForm } from '@/components/profile/PreferencesForm'
import { SecurityForm } from '@/components/profile/SecurityForm'
import { User, BarChart2, Settings, ShieldAlert, Trophy, Award, CheckCircle, Flame, RefreshCw, ArrowLeft } from 'lucide-react'

export default function StudentProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'preferences' | 'security'>('profile')
  const [profile, setProfile] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    completedLessons: 0,
    averageScore: 0,
    streak: 0,
    achievementsCount: 0,
    latestCert: null
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadProfileData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let { data: pref } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!pref) {
      pref = {
        email_notifications: true,
        push_notifications: true,
        weekly_digest: true,
        theme: 'dark',
        language: 'vi'
      }
    }

    const { count: compCount } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed')

    const { data: quizAtt } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('student_id', user.id)
      .eq('status', 'submitted')

    const { count: achCount } = await supabase
      .from('student_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)

    const { data: cert } = await supabase
      .from('certificates')
      .select('course_title, completion_date, certificate_number')
      .eq('student_id', user.id)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const scores = (quizAtt || []).map(q => Number(q.score) || 0)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    setProfile({ ...prof, email: user.email })
    setPreferences(pref)
    setStats({
      completedLessons: compCount || 0,
      averageScore: avg,
      streak: 3,
      achievementsCount: achCount || 0,
      latestCert: cert || null
    })
    setLoading(false)
  }

  useEffect(() => {
    loadProfileData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Đang tải hồ sơ cá nhân...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] rounded-full filter blur-[100px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] rounded-full filter blur-[100px] pointer-events-none" style={{ background: 'color-mix(in srgb, var(--accent-blue) 5%, transparent)' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)', color: 'var(--brand-primary)' }}>
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                HỒ SƠ CÁ NHÂN
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Quản lý tài khoản, xem thống kê và tùy chỉnh hệ thống</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/builder')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md group cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative p-6 rounded-3xl flex flex-col items-center text-center h-fit space-y-4 shadow-lg backdrop-blur-md group" style={{ background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', border: '1px solid var(--border-default)' }}>
            <div className="absolute top-3 left-3 w-4 h-4" style={{ borderTop: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: 0.3 }} />
            <div className="absolute top-3 right-3 w-4 h-4" style={{ borderTop: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: 0.3 }} />
            <div className="absolute bottom-3 left-3 w-4 h-4" style={{ borderBottom: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: 0.3 }} />
            <div className="absolute bottom-3 right-3 w-4 h-4" style={{ borderBottom: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: 0.3 }} />

            <AvatarUpload
              userId={profile.id}
              currentAvatarUrl={profile.avatar_url}
              onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
            />
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{profile.full_name || 'Học viên'}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1 px-2.5 py-1 rounded inline-block" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
                Học sinh · Lớp {profile.grade || 'Mới'}
              </p>
            </div>

            <div className="w-full p-3.5 rounded-2xl text-left space-y-1.5 relative" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 40%, transparent)', border: '1px solid var(--border-default)' }}>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>MÃ LIÊN KẾT PHỤ HUYNH</div>
              <div className="text-xs font-mono font-bold px-2 py-1.5 rounded flex justify-between items-center break-all select-all" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                <span>{profile.email}</span>
              </div>
              <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Đưa email này cho Phụ huynh nhập khi đăng ký để theo dõi kết quả học tập.</p>
            </div>

            <div className="w-full pt-4 space-y-1" style={{ borderTop: '1px solid var(--border-default)' }}>
              {(['profile', 'stats', 'preferences', 'security'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    background: activeTab === tab ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'transparent',
                    color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                    border: activeTab === tab ? '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)' : '1px solid transparent'
                  }}
                >
                  {tab === 'profile' && <User size={16} />}
                  {tab === 'stats' && <BarChart2 size={16} />}
                  {tab === 'preferences' && <Settings size={16} />}
                  {tab === 'security' && <ShieldAlert size={16} />}
                  {tab === 'profile' ? 'Hồ sơ cá nhân' : tab === 'stats' ? 'Thống kê học tập' : tab === 'preferences' ? 'Cấu hình cài đặt' : 'Bảo mật tài khoản'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative md:col-span-3 p-6 sm:p-8 min-h-[450px] rounded-3xl shadow-lg backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', border: '1px solid var(--border-default)' }}>
            <div className="absolute top-0 left-6 right-6 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--brand-primary) 30%, transparent), transparent)' }} />

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={20} style={{ color: 'var(--brand-primary)' }} />
                      Thông tin cá nhân
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cập nhật thông tin nhận chứng chỉ và trường học của bạn</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                </div>
                <ProfileForm profile={profile} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <BarChart2 size={20} style={{ color: 'var(--brand-primary)' }} />
                      Thống kê học tập
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tổng quan tiến độ, điểm số và thành quả của bạn</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-blue)' }} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 40%, transparent)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)', color: 'var(--brand-primary)' }}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Bài học xong</p>
                      <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{stats.completedLessons} bài</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 40%, transparent)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--accent-blue) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)', color: 'var(--accent-blue)' }}>
                      <BarChart2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Điểm TB Quiz</p>
                      <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{stats.averageScore.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 40%, transparent)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-amber) 20%, transparent)', color: 'var(--accent-amber)' }}>
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Huy hiệu</p>
                      <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{stats.achievementsCount} đạt được</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 40%, transparent)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-orange) 20%, transparent)', color: 'var(--accent-orange)' }}>
                      <Flame size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Ngày học liên tiếp</p>
                      <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{stats.streak} ngày</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Chứng chỉ gần nhất</h4>
                  {stats.latestCert ? (
                    <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 20%, transparent)', border: '1px solid var(--border-default)' }}>
                      <div className="flex items-center gap-3">
                        <Award size={20} style={{ color: 'var(--brand-primary)' }} />
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stats.latestCert.course_title}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mã: {stats.latestCert.certificate_number} · Ngày cấp: {stats.latestCert.completion_date}</p>
                        </div>
                      </div>
                      <a href="/student/certificates" className="text-[10px] font-bold hover:underline" style={{ color: 'var(--brand-primary)' }}>
                        Xem tất cả
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs p-4 rounded-xl text-center" style={{ color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--bg-elevated) 10%, transparent)', border: '1px solid var(--border-default)' }}>
                      Bạn chưa được cấp chứng chỉ nào. Hoàn thành lộ trình học để nhận!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Settings size={20} style={{ color: 'var(--brand-primary)' }} />
                      Cấu hình cài đặt
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cá nhân hóa giao diện và thông báo ứng dụng</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                </div>
                <PreferencesForm preferences={preferences} />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <ShieldAlert size={20} style={{ color: 'var(--brand-primary)' }} />
                      Bảo mật tài khoản
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Đổi mật khẩu và quản lý phiên đăng nhập hiện tại</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-orange)' }} />
                </div>
                <SecurityForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
