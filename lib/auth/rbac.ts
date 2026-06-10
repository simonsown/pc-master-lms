import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import React from 'react'

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent' | 'guest'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  student_code?: string
}

// Dùng trong Server Components để lấy user hiện tại
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, student_code')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    student_code: profile.student_code ?? undefined,
  }
}

// Guard cho Server Components — redirect nếu không đúng role
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!allowedRoles.includes(user.role)) {
    redirect(getDashboardByRole(user.role))
  }
  return user
}

// Dùng trong Server Action — throw error thay vì redirect
export async function verifyRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED: Not authenticated')
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Role ${user.role} cannot perform this action`)
  }
  return user
}

export function getDashboardByRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    parent: '/parent/dashboard',
    student: '/student/dashboard',
    guest: '/login',
  }
  return map[role] ?? '/login'
}

// Component bảo vệ — dùng trong JSX Server Components
export async function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user || !allowedRoles.includes(user.role)) return fallback
  return children
}
