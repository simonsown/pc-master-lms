import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const N8N_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').trim()
const N8N_WEBHOOK_URL = (process.env.N8N_WEBHOOK_URL || '').trim()

export async function POST(request: Request) {
  try {
    const { studentId, lessonId, className } = await request.json()

    if (!studentId || !lessonId) {
      return NextResponse.json({ error: 'Missing studentId or lessonId' }, { status: 400 })
    }

    const supabase = createServiceClient()

    await supabase.from('activity_logs').insert({
      user_id: studentId,
      action_type: 'complete_lesson',
      description: `Completed lesson ${lessonId}`,
      metadata: { lessonId, className }
    })

    const { data: badges } = await supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', studentId)

    const earnedIds = (badges || []).map(b => b.achievement_id)

    if (!earnedIds.includes('first_lesson')) {
      await supabase.from('student_achievements').insert({
        student_id: studentId,
        achievement_id: 'first_lesson'
      })

      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'success',
        title: 'Huy hieu moi! Khoi dau hanh trinh',
        message: 'Chuc mung ban da hoan thanh bai hoc dau tien!'
      })
    }

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', studentId)
      .eq('status', 'completed')

    const lessonCount = progress?.length || 0

    if (lessonCount > 0 && lessonCount % 10 === 0) {
      await supabase.from('xp_transactions').insert({
        user_id: studentId,
        amount: 50,
        reason: 'milestone_lessons',
        reference_type: 'lesson_progress',
        reference_id: lessonId
      })
    }

    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(`${N8N_WEBHOOK_URL}/n8n-lesson-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${N8N_SECRET}`
          },
          body: JSON.stringify({
            studentId,
            lessonId,
            type: 'lesson_completed',
            timestamp: new Date().toISOString()
          })
        })
      } catch {
        console.warn('n8n webhook not reachable (non-critical)')
      }
    }

    return NextResponse.json({ success: true, achievementsChecked: true, lessonCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
