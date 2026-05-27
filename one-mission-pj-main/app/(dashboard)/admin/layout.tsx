'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, Book, ShieldAlert, GraduationCap, Sun, Moon, BarChart3, Activity, Bell, FileText, Radio, Database, Wifi } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
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
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontWeight: 500, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [connected, setConnected] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth !== 'true') { router.push('/login') }

    const timeInt = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)

    const onlineInt = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 12 + 3))
    }, 5000)

    const connInt = setInterval(() => {
      setConnected(navigator.onLine)
    }, 3000)

    return () => { clearInterval(timeInt); clearInterval(onlineInt); clearInterval(connInt) }
  }, [])

  function handleLogout() {
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_login_time')
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px',
        background: active ? 'rgba(8,158,96,0.15)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
      }}>
        <Icon size={18} /> {label}
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside style={{ width: '260px', background: 'linear-gradient(180deg, #031f3b 0%, #1a2f53 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', letterSpacing: '-0.3px' }}>PC Master</div>
            <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 600, opacity: 0.9 }}>Quản trị viên</div>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: connected ? '#30c080' : '#f03060', boxShadow: connected ? '0 0 6px rgba(48,192,128,0.5)' : 'none' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Realtime</span>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
            <Wifi size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            {onlineCount} online
          </div>
        </div>

        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          <NavItem href="/admin" icon={LayoutDashboard} label="Tổng quan" />
          <NavItem href="/admin/users" icon={Users} label="Quản lý người dùng" />
          <NavItem href="/admin/schools" icon={Book} label="Quản lý trường học" />
          <NavItem href="/admin/settings" icon={Settings} label="Cài đặt hệ thống" />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
          <NavItem href="/admin/analytics" icon={BarChart3} label="Phân tích dữ liệu" />
          <NavItem href="/admin/activity" icon={Activity} label="Nhật ký hoạt động" />
          <NavItem href="/admin/notifications-admin" icon={Bell} label="Thông báo" />
          <NavItem href="/admin/content" icon={FileText} label="Quản lý nội dung" />
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '6px' }}>{currentTime}</div>
          <ThemeToggle />
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', width: '100%', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(244,67,54,0.6)', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
