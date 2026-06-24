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

  // Admin login via Supabase Auth
  if (email === 'admin') {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pcmaster.com'
    const { error: adminError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    })
    if (adminError) {
      return { error: 'Thông tin đăng nhập không chính xác' }
    }
    return { success: true, redirectUrl: '/admin' }
  }

  // 1. Thực hiện đăng nhập thẳng bằng Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    const errMsg = error.message.toLowerCase()
    
    if (errMsg.includes('confirm') || errMsg.includes('email_not_confirmed')) {
      friendlyError = 'Tài khoản của bạn chưa được xác nhận qua Email. Vui lòng kiểm tra hộp thư đến (Inbox/Spam) để nhấp vào liên kết kích hoạt trước khi đăng nhập!'
    } else if (errMsg.includes('invalid') || errMsg.includes('credentials')) {
      friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    } else {
      friendlyError = error.message
    }
    return { error: friendlyError }
  }

  const user = data.user

  // 2. Tự động cứu hộ Profile nếu bị thiếu (ví dụ: do RLS hoặc Trigger lúc đăng ký)
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const role = user.user_metadata?.role || 'student'
      const fullName = user.user_metadata?.full_name || email.split('@')[0]
      
      const { error: rescueError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
      })
      
      if (rescueError) {
        console.error('Profile Rescue Failed:', rescueError)
      }
    }
  }

  // Lấy role cuối cùng
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const userRole = finalProfile?.role || user!.user_metadata?.role || 'student'
  
  if (userRole === 'student') {
    return { success: true, redirectUrl: '/builder' }
  } else if (userRole === 'parent') {
    return { success: true, redirectUrl: '/parent' }
  } else {
    return { success: true, redirectUrl: `/${userRole}` }
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string || 'student'
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  const classCode = formData.get('class_code') as string

  if (!email || !password || !fullName) {
    return { error: 'Vui lòng điền đủ thông tin bắt buộc' }
  }

  let schoolId = null;
  let classIdToJoin = null;

  // 1. Kiểm tra mã trường (nếu có)
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .single()
      
    if (school) schoolId = school.id;
  }

  // 3. Đăng ký tài khoản Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      }
    }
  })

  if (error) return { error: error.message }

  if (data.user) {
    let profileError = null;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        role: role,
        school_id: schoolId,
        school_name: schoolName,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id);

    if (updateError) {
      console.warn('Profile UPDATE failed, falling back to UPSERT:', updateError.message);
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        school_id: schoolId,
        school_name: schoolName,
        updated_at: new Date().toISOString()
      });
      profileError = upsertError;
    }

    if (profileError) {
      console.error('Profile Creation/Update Error:', profileError);
    }

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

    // Auto sign-in after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('Auto sign-in after registration failed:', signInError);
    }
  }

  const userRole = role || 'student'
  if (userRole === 'student') {
    return { success: true, redirectUrl: '/builder' }
  } else if (userRole === 'parent') {
    return { success: true, redirectUrl: '/parent' }
  } else {
    return { success: true, redirectUrl: `/${userRole}` }
  }
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
    return { error: 'Không tìm thấy phiên đăng nhập' }
  }

  const role = formData.get('role') as string || 'student'
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  
  let schoolId = null;
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .single()
      
    if (school) schoolId = school.id;
  }

  // Cập nhật profile cho tài khoản Google đã tạo
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    role: role,
    school_id: schoolId,
    school_name: schoolName,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    return { error: 'Lỗi khi cập nhật hồ sơ: ' + profileError.message }
  }

  revalidatePath('/', 'layout')
  
  if (role === 'student') {
    redirect('/builder')
  } else {
    redirect(`/${role}`)
  }
}
