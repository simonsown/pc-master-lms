'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

const LABEL_MAP: Record<string, string> = {
  'teacher': 'Trang chủ',
  'lessons': 'Quản lý bài giảng',
  'create': 'Tạo bài giảng',
  'classes': 'Quản lý lớp học',
  'new': 'Tạo mới',
  'learning-path': 'Quản lý Lộ trình',
  'quiz': 'Quản lý Đề thi',
  'certificates': 'Quản lý Chứng chỉ',
  'student': 'Học sinh',
  'dashboard': 'Bảng điều khiển',
  'history': 'Lịch sử học tập',
  'profile': 'Hồ sơ',
  'discussion': 'Diễn đàn',
  'achievements': 'Thành tích',
  'progress': 'Tiến độ',
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = LABEL_MAP[seg] || seg
    const isLast = i === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '13px' }}>
      <Link href="/teacher" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          {crumb.isLast ? (
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
