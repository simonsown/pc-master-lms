'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, LayoutDashboard, Cpu, History, LogOut, Users, BookOpen, Sun, Moon, Map, BarChart2, Menu, X, BookMarked } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'
import PageTransition from '@/components/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'

function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  const toggle = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }, [theme])
  return (
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [hasClass, setHasClass] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkClass = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (p) { setProfile(p); if (p.school_id || p.class_id) setHasClass(true) }
      }
    }
    checkClass()
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  const navItems = [
    { href: '/student/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    ...(hasClass ? [{ href: '/student/classes', label: 'Lớp học của tôi', icon: Users }] : []),
    { href: '/student/lessons', label: 'Bài giảng', icon: BookOpen },
    { href: '/student/learning-path', label: 'Lộ trình học tập', icon: Map },
    { href: '/student/progress', label: 'Tiến Độ Học Tập', icon: BarChart2 },
    { href: '/student/sgk', label: 'Sách giáo khoa', icon: BookMarked },
    { href: '/builder', label: 'Thực hành lắp ráp', icon: Cpu },
    { href: '/student/history', label: 'Lịch sử học tập', icon: History },
  ]

  const sidebarContent = (
    <>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>PC Master</div>
          <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, opacity: 0.9 }}>Học sinh</div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={closeMobile} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: active ? 700 : 500,
              background: active ? 'rgba(8,158,96,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s'
            }}>
              <Icon size={20} /> {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <ThemeToggle />
        <button onClick={() => { closeMobile(); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(244,67,54,0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside className="student-sidebar-desktop" style={{ width: '280px', background: 'linear-gradient(180deg, #031f3b 0%, #1a2f53 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {sidebarContent}
      </aside>

      <button className="student-hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="student-drawer-backdrop"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="student-drawer"
            >
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>PC Master</div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, opacity: 0.9 }}>Học sinh</div>
                </div>
                <button onClick={closeMobile} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </button>
              </div>
              <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href} onClick={closeMobile} style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', fontWeight: active ? 700 : 500,
                      background: active ? 'rgba(8,158,96,0.15)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s'
                    }}>
                      <Icon size={20} /> {label}
                    </Link>
                  )
                })}
              </nav>
              <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <ThemeToggle />
                <button onClick={() => { closeMobile(); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(244,67,54,0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="student-main-content" style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
