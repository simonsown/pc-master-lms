'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/builder') // Middleware sẽ tự động xử lý redirect đúng role
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string || 'student'
  const schoolCode = formData.get('school_code') as string

  if (!email || !password || !fullName) {
    return { error: 'Vui lòng điền đủ thông tin bắt buộc' }
  }

  let schoolId = null;

  // Nếu có school_code, kiểm tra xem trường có tồn tại không
  if (schoolCode) {
    const { data: school, error: schoolErr } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .single()
      
    if (schoolErr || !school) {
      return { error: 'Mã trường không hợp lệ' }
    }
    schoolId = school.id;
  }

  // Đăng ký auth (Trigger SQL sẽ tự động chèn vào bảng profiles)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        school_id: schoolId
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Cập nhật lại thông tin profile để chắc chắn trường school_id được lưu
  if (data.user && schoolId) {
    await supabase.from('profiles').update({ school_id: schoolId }).eq('id', data.user.id);
  }

  revalidatePath('/', 'layout')
  redirect('/login?registered=true')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, schools(*)')
    .eq('id', user.id)
    .single()

  return profile;
}
