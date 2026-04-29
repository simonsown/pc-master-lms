'use client'

import React from 'react'
import Link from 'next/link'
import { Users, Activity, LogOut, LayoutDashboard } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS PARENT</div>
            <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>Phụ huynh</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/parent" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
          <Link href="/parent/children" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Activity size={20} /> Kết quả học tập
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
