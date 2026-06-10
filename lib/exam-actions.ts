'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function startExamAttempt(examId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('exam_attempts')
    .insert({
      user_id: user.id,
      exam_id: examId,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { attemptId: data.id }
}

export async function submitExamAttempt(attemptId: string, answers: any, score: number, timeSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Save answers and calculate final score
  const { error } = await supabase
    .from('exam_attempts')
    .update({
      score: score,
      status: score >= 50 ? 'passed' : 'failed',
      completed_at: new Date().toISOString(),
      time_spent: timeSpent,
      // answers: answers // Assuming there's a JSON column for this
    })
    .eq('id', attemptId)

  if (error) return { error: error.message }

  // 2. Add XP to profile
  const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
  const newXp = (profile?.xp || 0) + score
  await supabase.from('profiles').update({ xp: newXp }).eq('id', user.id)

  revalidatePath('/student')
  return { success: true }
}
