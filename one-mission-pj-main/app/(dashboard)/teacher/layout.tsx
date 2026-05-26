'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, FileText, LogOut, LayoutDashboard, Compass, HelpCircle, Award, Laptop, MessageSquare, TrendingUp, ChevronDown, User, Shield } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { supabase } from '@/lib/supabase'
import Breadcrumb from '@/components/Breadcrumb'

function NavItem({ href, icon: Icon, label, pathname }: { href: string; icon: any; label: string; pathname: string }) {
  const isActive = pathname === href || pathname?.startsWith(href + '/')
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
      borderRadius: '10px',
      background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
      color: isActive ? '#06B6D4' : 'var(--text-secondary)',
      fontWeight: isActive ? 600 : 500,
      textDecoration: 'none', transition: 'all 0.2s', fontSize: '14px',
    }}>
      <Icon size={18} /> {label}
    </Link>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      {children}
    </div>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          if (data) setProfile(data)
        })
      }
    })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Giáo viên'}</div>
              <div style={{ fontSize: '11px', color: '#06B6D4', fontWeight: 600 }}>Giáo viên <Shield size={10} style={{ display: 'inline', marginLeft: '2px' }} /></div>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowDropdown(false)} />
              <div style={{ position: 'absolute', top: '100%', left: '12px', right: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', zIndex: 100, padding: '8px' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.full_name || 'Người dùng'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile?.email || ''}</div>
                  <div style={{ fontSize: '11px', color: '#06B6D4', fontWeight: 600, marginTop: '4px' }}>Vai trò: Giáo viên</div>
                </div>
                <Link href="/teacher" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>
                  <LayoutDashboard size={16} /> Bảng điều khiển
                </Link>
                <button onClick={async () => { setShowDropdown(false); if (confirm('Bạn muốn đăng xuất?')) await logout() }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', width: '100%', borderRadius: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          <NavGroup label="Tổng quan">
            <NavItem href="/teacher" icon={LayoutDashboard} label="Bảng điều khiển" pathname={pathname} />
          </NavGroup>

          <NavGroup label="Quản lý">
            <NavItem href="/teacher/classes" icon={Users} label="Lớp học" pathname={pathname} />
            <NavItem href="/teacher/lessons" icon={FileText} label="Bài giảng" pathname={pathname} />
            <NavItem href="/teacher/learning-path" icon={Compass} label="Lộ trình" pathname={pathname} />
            <NavItem href="/teacher/quiz" icon={HelpCircle} label="Đề thi" pathname={pathname} />
            <NavItem href="/teacher/certificates" icon={Award} label="Chứng chỉ" pathname={pathname} />
          </NavGroup>

          <NavGroup label="Góc nhìn học sinh">
            <NavItem href="/builder" icon={Laptop} label="Thực hành PC 3D" pathname={pathname} />
            <NavItem href="/student/quiz" icon={HelpCircle} label="Ngân hàng đề thi" pathname={pathname} />
            <NavItem href="/student/learning-path" icon={TrendingUp} label="Lộ trình học tập" pathname={pathname} />
            <NavItem href="/student/certificates" icon={Award} label="Chứng chỉ học viên" pathname={pathname} />
            <NavItem href="/student/discussion" icon={MessageSquare} label="Diễn đàn học tập" pathname={pathname} />
          </NavGroup>
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={async () => { if (confirm('Bạn muốn đăng xuất khỏi hệ thống?')) { await logout() } }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Breadcrumb />
        {children}
      </main>
    </div>
  )
}
