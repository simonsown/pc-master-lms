'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkAndAwardAchievements } from '@/lib/achievements'

export async function completeLessonAction(lessonId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('lesson_progress')
    .upsert({ 
      student_id: user.id,
      lesson_id: lessonId,
      status: 'completed',
      completion_percentage: 100,
      completed_at: new Date().toISOString()
    }, { onConflict: 'student_id,lesson_id' })

  // Trigger achievement evaluation
  await checkAndAwardAchievements(supabase, user.id, 'lesson_completed')

  // Redirect to dashboard or next lesson
  redirect('/student')
}

export async function startBuilderSession(lessonId?: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('builder_sessions')
    .insert({
      student_id: user.id,
      lesson_id: lessonId || null,
      started_at: new Date().toISOString()
    })
    .select('id')
    .single()

  return data?.id
}

export async function endBuilderSession(sessionId: string, data: { components_used: any, tdp_calculated: number, compatibility_score: number }) {
  if (!sessionId) return
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase
    .from('builder_sessions')
    .update({
      ended_at: new Date().toISOString(),
      components_used: data.components_used,
      tdp_calculated: data.tdp_calculated,
      compatibility_score: data.compatibility_score
    })
    .eq('id', sessionId)

  // Trigger achievement evaluation
  if (user) {
    await checkAndAwardAchievements(supabase, user.id, 'builder_session_ended')
  }
}
