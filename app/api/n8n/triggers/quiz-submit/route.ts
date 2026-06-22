import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const N8N_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').trim()
const N8N_WEBHOOK_URL = (process.env.N8N_WEBHOOK_URL || '').trim()

export async function POST(request: Request) {
  try {
    const { studentId, quizId, attemptId, score } = await request.json()

    if (!studentId || !quizId || !attemptId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const finalScore = Number(score) || 0

    await supabase.from('activity_logs').insert({
      user_id: studentId,
      action_type: 'submit_quiz',
      description: `Submitted quiz ${quizId} with score ${finalScore}`,
      metadata: { quizId, attemptId, score: finalScore }
    })

    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .select('score, status')
      .eq('id', attemptId)
      .single()

    if (attempt && attempt.status === 'submitted' && finalScore >= 90) {
      const { data: badges } = await supabase
        .from('student_achievements')
        .select('achievement_id')
        .eq('student_id', studentId)

      const earnedIds = (badges || []).map(b => b.achievement_id)

      if (!earnedIds.includes('quiz_ace')) {
        await supabase.from('student_achievements').insert({
          student_id: studentId,
          achievement_id: 'quiz_ace'
        })

        await supabase.from('notifications').insert({
          user_id: studentId,
          type: 'success',
          title: 'Huy hieu moi! Xuat sac!',
          message: 'Chuc mung! Ban dat diem tuyet doi trong bai kiem tra!'
        })
      }
    }

    const { data: recentAttempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('student_id', studentId)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })
      .limit(3)

    const scores = (recentAttempts || []).map(a => a.score || 0)
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    if (scores.length >= 2 && avgScore < 40) {
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'warning',
        title: 'Ban can tro giap them!',
        message: `Diem trung binh 3 bai gan day cua ban la ${Math.round(avgScore)}/100. Hay xem lai bai hoc va thu lai nhe!`,
        link: `/lessons`
      })
    }

    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(`${N8N_WEBHOOK_URL}/n8n-zalo-parent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${N8N_SECRET}`
          },
          body: JSON.stringify({
            studentId,
            quizId,
            score: finalScore,
            avgScore: Math.round(avgScore),
            type: 'quiz_submitted',
            timestamp: new Date().toISOString()
          })
        })
      } catch {
        console.warn('n8n webhook not reachable (non-critical)')
      }
    }

    return NextResponse.json({
      success: true,
      score: finalScore,
      avgScore: Math.round(avgScore),
      needsHelp: avgScore < 40
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
