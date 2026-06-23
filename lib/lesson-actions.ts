'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'
async function addXpAndLevel(userId: string, xp: number, type?: string, refId?: string, desc?: string) { return { success: true } }

export async function saveLessonProgress(lessonId: string, score: number, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      student_id: user.id,
      lesson_id: lessonId,
      score: score,
      is_completed: isCompleted,
      status: isCompleted ? 'completed' : 'in_progress',
      completion_percentage: isCompleted ? 100 : 0,
      last_accessed: new Date().toISOString()
    }, {
      onConflict: 'student_id,lesson_id'
    })

  if (error) {
    console.error('Error saving progress:', error)
    return { error: error.message }
  }

  if (isCompleted) {
    await addXpAndLevel(user.id, score || 50, 'lesson_completed', lessonId, 'Hoàn thành bài học')

    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const { data: stats } = await supabase.from('learning_stats').select('*').eq('user_id', user.id).single()
    if (stats) {
      const dayOfWeek = now.getDay()
      const activity = stats.weekly_activity || [0, 0, 0, 0, 0, 0, 0]
      activity[dayOfWeek === 0 ? 6 : dayOfWeek - 1] = (activity[dayOfWeek === 0 ? 6 : dayOfWeek - 1] || 0) + 15
      await supabase.from('learning_stats').update({
        current_streak: stats.last_active_date === today ? stats.current_streak : (stats.last_active_date === getYesterday() ? (stats.current_streak || 0) + 1 : 1),
        last_active_date: today,
        total_study_minutes: (stats.total_study_minutes || 0) + 15,
        weekly_activity: activity,
        updated_at: now.toISOString(),
      }).eq('user_id', user.id)
    } else {
      const dayOfWeek = now.getDay()
      const activity = [0, 0, 0, 0, 0, 0, 0]
      activity[dayOfWeek === 0 ? 6 : dayOfWeek - 1] = 15
      await supabase.from('learning_stats').insert({
        user_id: user.id,
        current_streak: 1,
        last_active_date: today,
        total_study_minutes: 15,
        weekly_activity: activity,
        total_xp: score || 50,
      })
    }
  }

  revalidatePath(`/lessons/${lessonId}`)
  revalidatePath('/builder')
  
  return { success: true }
}

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
