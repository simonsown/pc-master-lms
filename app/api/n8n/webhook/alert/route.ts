import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const N8N_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').trim()

function verifyN8nRequest(request: Request): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${N8N_SECRET}`
}

export async function POST(request: Request) {
  try {
    if (!verifyN8nRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId, reason, alertType, details } = await request.json()

    if (!studentId || !reason || !alertType) {
      return NextResponse.json({ error: 'Missing required fields: studentId, reason, alertType' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, class_id, school_id')
      .eq('id', studentId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    await supabase.from('notifications').insert({
      user_id: studentId,
      type: 'warning',
      title: `Canh bao hoc tap: ${alertType}`,
      message: reason,
      link: details?.suggestedLesson ? `/lessons/${details.suggestedLesson}` : null
    })

    const { data: parentLinks } = await supabase
      .from('parent_student_links')
      .select('parent_id')
      .eq('student_id', studentId)

    if (parentLinks && parentLinks.length > 0) {
      const parentNotifs = parentLinks.map(pl => ({
        user_id: pl.parent_id,
        type: 'warning',
        title: `Canh bao: Tinh hinh hoc tap cua con ban`,
        message: `Con ban (${profile.full_name}) dang gap van de: ${reason}`,
        link: details?.suggestedLesson ? `/lessons/${details.suggestedLesson}` : `/student/${studentId}`
      }))

      await supabase.from('notifications').insert(parentNotifs)
    }

    if (profile.class_id) {
      const { data: classInfo } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', profile.class_id)
        .single()

      if (classInfo) {
        await supabase.from('notifications').insert({
          user_id: classInfo.teacher_id,
          type: 'warning',
          title: `Hoc sinh can tro giup: ${profile.full_name}`,
          message: reason,
          link: `/student/${studentId}`
        })
      }
    }

    await supabase.from('activity_logs').insert({
      user_id: studentId,
      action_type: 'academic_alert',
      description: reason,
      metadata: { alertType, details, triggeredBy: 'n8n' }
    })

    return NextResponse.json({
      success: true,
      notified: {
        student: true,
        parent: (parentLinks?.length || 0) > 0,
        teacher: true
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
