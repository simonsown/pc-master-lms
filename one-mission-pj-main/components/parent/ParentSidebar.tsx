'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Link2, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react'
import { logout } from '@/lib/auth-actions'

const parentNavItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/parent/dashboard' },
  { icon: Users, label: 'Con của tôi', href: '/parent/children' },
  { icon: Link2, label: 'Liên kết con', href: '/parent/link-child' },
  { icon: Bell, label: 'Thông báo', href: '/parent/notifications' },
  { icon: User, label: 'Hồ sơ', href: '/parent/profile' },
]

export default function ParentSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Nút Hamburger trên Mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      >
        <Menu size={20} />
      </button>

      {/* Backdrop cho Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
              PC Master <span style={{ color: 'var(--brand-primary)' }}>Parent</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden" style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Menu Phụ Huynh
          </div>
          {parentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'border-[#00d4aa]'
                    : 'border-transparent'
                }`}
                style={{
                  background: isActive ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Sidebar với Nút Log Out */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--bg-base)', color: 'var(--brand-primary)' }}>
              P
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>Phụ huynh</div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>Tài khoản liên kết</div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm('Bạn muốn đăng xuất khỏi hệ thống?')) {
                await logout()
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold transition-all duration-150 rounded-lg"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  )
}
