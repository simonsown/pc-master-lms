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
  const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', user.id).single()
  const currentXp = (profile?.xp || 0) + score
  const now = new Date().toISOString()

  const { data: levelDefs } = await supabase
    .from('level_definitions')
    .select('level')
    .lte('xp_required', currentXp)
    .order('xp_required', { ascending: false })
    .limit(1)
  const newLevel = (levelDefs?.[0] as any)?.level || 1

  await supabase.from('profiles').update({ xp: currentXp, level: newLevel, updated_at: now }).eq('id', user.id)

  await supabase.from('leaderboard_cache').upsert({
    user_id: user.id, total_xp: currentXp, level: newLevel, updated_at: now,
  }, { onConflict: 'user_id' })

  await supabase.from('learning_stats').update({ total_xp: currentXp, updated_at: now }).eq('user_id', user.id)

  await supabase.from('xp_transactions').insert({
    user_id: user.id, amount: score, reason: 'Hoàn thành bài thi', reference_type: 'exam_completed', reference_id: attemptId,
  })

  if (newLevel > (profile?.level || 1)) {
    const { data: levelDef } = await supabase.from('level_definitions').select('title, icon').eq('level', newLevel).single()
    if (levelDef) {
      await supabase.from('notifications').insert({
        user_id: user.id, type: 'success', title: 'Lên Cấp!',
        body: `Chúc mừng! Bạn đã đạt cấp ${newLevel}: ${(levelDef as any).title}`,
        data: { level: newLevel, icon: (levelDef as any).icon },
      })
    }
  }

  revalidatePath('/student')
  return { success: true }
}
