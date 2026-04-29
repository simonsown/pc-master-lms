'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, Users, FileText, LogOut, LayoutDashboard } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS TEACHER</div>
            <div style={{ fontSize: '12px', color: '#06B6D4', fontWeight: 600 }}>Giáo viên</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/teacher" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', fontWeight: 600 }}>
            <LayoutDashboard size={20} /> Bảng điều khiển
          </Link>
          <Link href="/teacher/lessons" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <FileText size={20} /> Quản lý bài giảng
          </Link>
          <Link href="/teacher/students" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Users size={20} /> Lớp học của tôi
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
