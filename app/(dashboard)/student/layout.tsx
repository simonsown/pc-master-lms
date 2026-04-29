'use client'

import React from 'react'
import Link from 'next/link'
import { GraduationCap, LayoutDashboard, Cpu, History, LogOut } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS STUDENT</div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Học sinh</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/student" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
          <Link href="/builder" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Cpu size={20} /> Thực hành lắp ráp
          </Link>
          <Link href="/student/history" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <History size={20} /> Lịch sử học tập
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
