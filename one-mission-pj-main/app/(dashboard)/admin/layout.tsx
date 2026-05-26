'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, Book, ShieldAlert, GraduationCap } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px',
        background: active ? 'rgba(8,158,96,0.15)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
      }}>
        <Icon size={20} /> {label}
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside style={{ width: '280px', background: 'linear-gradient(180deg, #031f3b 0%, #1a2f53 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>PC Master</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 600, opacity: 0.9 }}>Quản trị viên</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavItem href="/admin" icon={LayoutDashboard} label="Tổng quan" />
          <NavItem href="/admin/users" icon={Users} label="Quản lý người dùng" />
          <NavItem href="/admin/schools" icon={Book} label="Quản lý trường học" />
          <NavItem href="/admin/settings" icon={Settings} label="Cài đặt hệ thống" />
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(244,67,54,0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
