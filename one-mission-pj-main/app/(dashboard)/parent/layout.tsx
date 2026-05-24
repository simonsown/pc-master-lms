// Path: app/(dashboard)/parent/layout.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, LayoutDashboard, UserPlus, Bell, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'
import { useParentNotifications } from '@/hooks/useParentNotifications'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [parentId, setParentId] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setParentId(user.id)
      }
    }
    fetchUser()
  }, [])

  const { unreadCount } = useParentNotifications(parentId)

  const isLinkActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Parent Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border-subtle)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Header Logo */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'var(--brand-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <GraduationCap size={20} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS PARENT</div>
            <div style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: 600 }}>Phụ huynh</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          
          <Link 
            href="/parent/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '10px', 
              background: isLinkActive('/parent/dashboard') ? 'rgba(0, 212, 170, 0.1)' : 'transparent', 
              color: isLinkActive('/parent/dashboard') ? 'var(--brand-primary)' : 'var(--text-secondary)', 
              fontWeight: isLinkActive('/parent/dashboard') ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={20} /> Tổng quan học tập
          </Link>

          <Link 
            href="/parent/link-child" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '10px', 
              background: isLinkActive('/parent/link-child') ? 'rgba(0, 212, 170, 0.1)' : 'transparent', 
              color: isLinkActive('/parent/link-child') ? 'var(--brand-primary)' : 'var(--text-secondary)', 
              fontWeight: isLinkActive('/parent/link-child') ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={20} /> Liên kết tài khoản con
          </Link>

          <Link 
            href="/parent/notifications" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px', 
              borderRadius: '10px', 
              background: isLinkActive('/parent/notifications') ? 'rgba(0, 212, 170, 0.1)' : 'transparent', 
              color: isLinkActive('/parent/notifications') ? 'var(--brand-primary)' : 'var(--text-secondary)', 
              fontWeight: isLinkActive('/parent/notifications') ? 600 : 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={20} /> Trung tâm thông báo
            </div>
            {unreadCount > 0 && (
              <span style={{ 
                background: '#ef4444', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '50px', 
                lineHeight: 1.2 
              }}>
                {unreadCount}
              </span>
            )}
          </Link>

        </nav>

        {/* Footer Logout */}
        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => logout()} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              width: '100%', 
              borderRadius: '10px', 
              background: 'transparent', 
              border: 'none', 
              color: '#ef4444', 
              fontWeight: 600, 
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
