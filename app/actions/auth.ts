'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'

interface RegisterInput {
  role: 'student' | 'teacher' | 'parent'
  full_name: string
  email: string
  password: string
  school_name?: string
  student_code?: string
}

export async function registerAction(formData: RegisterInput) {
  const { role, full_name, email, password, school_name, student_code } = formData

  if (!email || !password || !full_name || !role) {
    return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
  }

  if (password.length < 8) {
    return { error: 'Mật khẩu phải có ít nhất 8 ký tự' }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: 'Mật khẩu phải chứa ít nhất 1 chữ hoa' }
  }
  if (!/[0-9]/.test(password)) {
    return { error: 'Mật khẩu phải chứa ít nhất 1 số' }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  if (authError) {
    let msg = authError.message
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      msg = 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.'
    }
    return { error: msg }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      email,
      full_name,
      role,
      school_name: school_name ?? null,
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    if (role === 'parent' && student_code) {
      const { data: student } = await supabase
        .rpc('find_student_by_code', { input_code: student_code })

      if (student && student.length > 0) {
        await supabase.from('parent_student_links').insert({
          parent_id: authData.user.id,
          student_id: student[0].student_id,
          status: 'pending'
        })
      }
    }
  }

  revalidatePath('/', 'layout')

  return { success: true, requireEmailConfirm: true }
}
