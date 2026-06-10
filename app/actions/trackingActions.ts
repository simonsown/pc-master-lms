'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'

export async function completeLessonAction(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('lesson_progress')
    .upsert({
      student_id: user.id,
      lesson_id: lessonId,
      status: 'completed',
      completed_at: new Date().toISOString()
    }, { onConflict: 'student_id,lesson_id' })

  // Trigger notification "Đã mở khóa bài mới" can be handled here

  // For simplicity, redirecting to dashboard. In a real scenario, this could redirect to next lesson or quiz
  redirect('/student')
}

export async function startBuilderSession(lessonId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('builder_sessions')
    .insert({
      student_id: user.id,
      lesson_id: lessonId || null,
      started_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function endBuilderSession(sessionId: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('builder_sessions')
    .update({
      ended_at: new Date().toISOString(),
      ...payload
    })
    .eq('id', sessionId)
    .eq('student_id', user.id)
}
