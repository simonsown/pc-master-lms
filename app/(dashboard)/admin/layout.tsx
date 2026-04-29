'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, LogOut, Book, ShieldAlert } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS ADMIN</div>
            <div style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 600 }}>Quản trị viên</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
          <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Users size={20} /> Quản lý người dùng
          </Link>
          <Link href="/admin/schools" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Book size={20} /> Quản lý trường học
          </Link>
          <Link href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Settings size={20} /> Cài đặt hệ thống
          </Link>
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
