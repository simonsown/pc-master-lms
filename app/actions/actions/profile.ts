'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name: string, bio: string, school: string, grade: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      bio: data.bio.slice(0, 200), // Max 200 chars
      school: data.school,
      grade: data.grade,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/student/profile')
  return { success: true }
}

export async function updatePreferences(data: { email_notifications: boolean, push_notifications: boolean, weekly_digest: boolean, theme: 'dark' | 'light' | 'system', language: 'vi' | 'en' }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      email_notifications: data.email_notifications,
      push_notifications: data.push_notifications,
      weekly_digest: data.weekly_digest,
      theme: data.theme,
      language: data.language,
      updated_at: new Date().toISOString()
    })

  if (error) throw error
  revalidatePath('/student/profile')
  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) throw new Error('Unauthorized')

  // Zod validation (Rule 5)
  const passwordSchema = z.string()
    .min(8, 'Mật khẩu phải tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ cái in hoa')
    .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số')

  const parseResult = passwordSchema.safeParse(newPassword)
  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  // 1. Re-authenticate user first (Rule 5)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (authError) {
    throw new Error('Mật khẩu hiện tại không chính xác.')
  }

  // 2. Perform password update
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) throw updateError

  return { success: true }
}
