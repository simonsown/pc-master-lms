'use client'

import React from 'react'
import { ShieldAlert, BookOpen, GraduationCap, Users } from 'lucide-react'

export type RoleType = 'admin' | 'teacher' | 'student' | 'parent'

interface RoleSelectorProps {
  selectedRole: RoleType | null
  onSelect: (role: RoleType) => void
}

const ROLES = [
  {
    id: 'student' as RoleType,
    title: 'Học sinh',
    description: 'Thực hành lắp ráp PC và làm bài kiểm tra.',
    icon: GraduationCap,
    color: '#10B981', // Emerald
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    id: 'teacher' as RoleType,
    title: 'Giáo viên',
    description: 'Tạo bài giảng và theo dõi tiến độ học sinh.',
    icon: BookOpen,
    color: '#06B6D4', // Cyan
    bg: 'rgba(6, 182, 212, 0.1)',
  },
  {
    id: 'parent' as RoleType,
    title: 'Phụ huynh',
    description: 'Xem kết quả học tập của con em.',
    icon: Users,
    color: '#F59E0B', // Amber
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    id: 'admin' as RoleType,
    title: 'Quản trị viên',
    description: 'Quản lý toàn bộ hệ thống trường học.',
    icon: ShieldAlert,
    color: '#8B5CF6', // Violet
    bg: 'rgba(139, 92, 246, 0.1)',
  },
]

export default function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
      {ROLES.map((role) => {
        const isSelected = selectedRole === role.id;
        const Icon = role.icon;
        
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px',
              borderRadius: '16px',
              border: `2px solid ${isSelected ? role.color : 'rgba(255,255,255,0.1)'}`,
              background: isSelected ? role.bg : 'var(--bg-elevated)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isSelected ? `0 10px 20px ${role.bg}` : 'none'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: isSelected ? role.color : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}>
              <Icon size={28} color={isSelected ? '#fff' : role.color} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {role.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {role.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
