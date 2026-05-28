'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, FileText, LogOut, LayoutDashboard, Compass, HelpCircle, Award, Laptop, MessageSquare, TrendingUp, ChevronDown, User, Shield, GraduationCap, Sun, Moon } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { supabase } from '@/lib/supabase'
import PageTransition from '@/components/PageTransition'

function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark')
  React.useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  const toggle = React.useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }, [theme])
  return (
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => { if (data) setProfile(data) })
    })
  }, [])

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  const NavGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      {children}
    </div>
  )

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px',
        background: active ? 'rgba(8,158,96,0.15)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
      }}>
        <Icon size={18} /> {label}
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside style={{ width: '280px', background: 'linear-gradient(180deg, #031f3b 0%, #1a2f53 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '10px', fontFamily: 'inherit' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Giáo viên'}</div>
              <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, opacity: 0.9 }}>Giáo viên</div>
            </div>
            <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowDropdown(false)} />
              <div style={{ position: 'absolute', top: '100%', left: '12px', right: '12px', background: '#fff', border: '1px solid var(--border-default)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100, padding: '8px' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.full_name || 'Người dùng'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile?.email || ''}</div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '4px' }}>Vai trò: Giáo viên</div>
                </div>
                <Link href="/teacher" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>
                  <LayoutDashboard size={16} /> Bảng điều khiển
                </Link>
                <button onClick={async () => { setShowDropdown(false); await logout() }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', width: '100%', borderRadius: '8px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px', textAlign: 'left', fontFamily: 'inherit' }}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          <NavGroup label="Tổng quan">
            <NavItem href="/teacher" icon={LayoutDashboard} label="Bảng điều khiển" />
          </NavGroup>
          <NavGroup label="Quản lý">
            <NavItem href="/teacher/classes" icon={Users} label="Lớp học" />
            <NavItem href="/teacher/lessons" icon={FileText} label="Bài giảng" />
            <NavItem href="/teacher/learning-path" icon={Compass} label="Lộ trình" />
            <NavItem href="/teacher/quiz" icon={HelpCircle} label="Đề thi" />
            <NavItem href="/teacher/certificates" icon={Award} label="Chứng chỉ" />
          </NavGroup>
          <NavGroup label="Tiện ích">
            <NavItem href="/teacher/certificates" icon={Award} label="Chứng chỉ" />
            <NavItem href="/student/discussion" icon={MessageSquare} label="Diễn đàn" />
          </NavGroup>
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <ThemeToggle />
          <button onClick={async () => { await logout() }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(244,67,54,0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/teacher" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Bảng điều khiển</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pathname === '/teacher' ? 'Tổng quan' : pathname.split('/').pop()}</span>
        </div>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
