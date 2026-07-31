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

  // Admin login — mật khẩu admin là 123 (đổi qua ADMIN_PASSWORD env nếu cần)
  if (email === 'admin') {
    const adminPassword = process.env.ADMIN_PASSWORD || '123'
    if (password !== adminPassword) {
      return { error: 'Mật khẩu Admin không chính xác. Vui lòng thử lại!' }
    }
    return { success: true, redirectUrl: '/admin', isAdmin: true }
  }

  // 1. Đăng nhập bằng Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    const errMsg = error.message.toLowerCase()
    
    if (errMsg.includes('confirm') || errMsg.includes('email_not_confirmed')) {
      friendlyError = 'Tài khoản chưa được xác nhận qua Email. Vui lòng kiểm tra hộp thư để kích hoạt!'
    } else if (errMsg.includes('invalid') || errMsg.includes('credentials')) {
      friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    } else {
      friendlyError = error.message
    }
    return { error: friendlyError }
  }

  const user = data.user

  // 2. Tự động đảm bảo Profile luôn tồn tại
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const role = user.user_metadata?.role || 'student'
      const fullName = user.user_metadata?.full_name || email.split('@')[0]
      
      await supabase.from('profiles').upsert({
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    }
  }

  // Lấy role chính xác
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .maybeSingle()

  const userRole = finalProfile?.role || user!.user_metadata?.role || 'student'
  
  if (userRole === 'student') {
    return { success: true, redirectUrl: '/builder' }
  } else if (userRole === 'teacher') {
    return { success: true, redirectUrl: '/teacher' }
  } else if (userRole === 'parent') {
    return { success: true, redirectUrl: '/parent' }
  } else if (userRole === 'admin') {
    return { success: true, redirectUrl: '/admin' }
  } else {
    return { success: true, redirectUrl: `/${userRole}` }
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = (formData.get('role') as string) || 'student'
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  const classCode = formData.get('class_code') as string

  if (!email || !password || !fullName) {
    return { error: 'Vui lòng điền đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu)' }
  }

  let schoolId = null;

  // 1. Kiểm tra mã trường (nếu có)
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .maybeSingle()
      
    if (school) schoolId = school.id;
  }

  // 2. Đăng ký tài khoản Auth
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Lần 1: Thử signUp kèm metadata
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        profile_completed: true,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    }
  })

  // FALLBACK CHỐNG LỖI "Database error saving new user":
  // Nếu Supabase DB Trigger (on_auth_user_created) bị lỗi khi đọc metadata hoặc RLS,
  // thử lại với minimal options để tạo auth.users trước, rồi tự upsert profile bằng server action bên dưới.
  if (error && (
    error.message.toLowerCase().includes('database error') ||
    error.message.toLowerCase().includes('saving new user') ||
    error.message.toLowerCase().includes('unexpected failure')
  )) {
    console.warn('signUp with metadata failed due to DB trigger, retrying with minimal options:', error.message)
    const retryResult = await supabase.auth.signUp({
      email,
      password,
    })
    data = retryResult.data
    error = retryResult.error
  }

  if (error) {
    let msg = error.message
    const lowerMsg = msg.toLowerCase()
    if (
      lowerMsg.includes('already registered') ||
      lowerMsg.includes('already exists') ||
      lowerMsg.includes('user_already_exists')
    ) {
      msg = 'Email này đã được đăng ký tài khoản. Vui lòng dùng email khác hoặc đăng nhập!'
    } else if (lowerMsg.includes('database error') || lowerMsg.includes('saving new user')) {
      msg = 'Lỗi Cơ sở dữ liệu Supabase (Database Trigger). Vui lòng chạy lại file migration SQL hoặc tắt email confirmation!'
    }
    return { error: msg }
  }

  // Trường hợp email cần xác nhận → user tồn tại nhưng chưa active
  if (data.user && !data.session) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

    return {
      error: '📧 Vui lòng kiểm tra Email để xác nhận tài khoản! (Kiểm tra cả thư mục Spam)'
    }
  }

  if (data.user) {
    // Đánh dấu profile_completed trong auth metadata
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        role: role,
        profile_completed: true
      }
    }).catch(() => {})

    // Tạo profile trong bảng public.profiles
    const profileData: Record<string, unknown> = {
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      updated_at: new Date().toISOString()
    }
    if (schoolId) profileData.school_id = schoolId
    if (schoolName) profileData.school_name = schoolName

    const { error: upsertError } = await supabase.from('profiles').upsert(
      profileData,
      { onConflict: 'id' }
    )

    if (upsertError) {
      console.error('Profile Upsert Error during registration:', upsertError)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    }

    // Liên kết phụ huynh - học sinh
    if (role === 'parent' && classCode) {
      const { data: student } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student')
        .or(`email.eq.${classCode},id.eq.${classCode}`)
        .maybeSingle();
      
      if (student) {
        await supabase.from('parent_student_links').insert({
          parent_id: data.user.id,
          student_id: student.id,
          relationship: 'parent'
        });
      }
    }
  }

  const userRole = role || 'student'
  const redirectUrl = userRole === 'student' ? '/builder' : `/${userRole}`
  return { success: true, redirectUrl }
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

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    || process.env.VERCEL_URL 
    || 'http://localhost:3000'
  const redirectUrl = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })
  
  if (error) {
    console.error('Google OAuth error:', error)
    return { error: error.message }
  }
  
  if (data.url) {
    redirect(data.url)
  }
}

export async function completeOAuthRegistration(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Không tìm thấy phiên đăng nhập Google. Vui lòng thử lại!' }
  }

  const role = (formData.get('role') as string) || 'student'
  const fullName = (formData.get('full_name') as string) || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  const classCode = formData.get('class_code') as string
  
  let schoolId = null;
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .maybeSingle()
      
    if (school) schoolId = school.id;
  }

  // 1. Cập nhật profile trong bảng public.profiles
  const profileData: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    full_name: fullName,
    role: role,
    updated_at: new Date().toISOString()
  }
  if (schoolId) profileData.school_id = schoolId
  if (schoolName) profileData.school_name = schoolName

  const { error: profileError } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });

  if (profileError) {
    console.error('Profile Upsert Error in completeOAuthRegistration:', profileError)
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
  }

  // 2. Cập nhật metadata profile_completed: true
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      role: role,
      profile_completed: true
    }
  }).catch(() => {})

  // 3. Liên kết phụ huynh nếu có
  if (role === 'parent' && classCode) {
    const { data: student } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .or(`email.eq.${classCode},id.eq.${classCode}`)
      .maybeSingle();
    
    if (student) {
      await supabase.from('parent_student_links').insert({
        parent_id: user.id,
        student_id: student.id,
        relationship: 'parent'
      });
    }
  }

  revalidatePath('/', 'layout')
  
  const redirectUrl = role === 'student' ? '/builder' : `/${role}`
  return { success: true, redirectUrl }
}
