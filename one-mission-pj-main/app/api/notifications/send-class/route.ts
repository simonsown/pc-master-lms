import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { class_id, title, message, type = 'info', link = '' } = await request.json()
    if (!class_id || !title || !message) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { data: teacherClass } = await supabase
      .from('classes')
      .select('teacher_id')
      .eq('id', class_id)
      .single()

    if (!teacherClass || teacherClass.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Không có quyền gửi thông báo cho lớp này' }, { status: 403 })
    }

    const { data: members } = await supabase
      .from('class_members')
      .select('student_id')
      .eq('class_id', class_id)
      .eq('status', 'active')

    if (!members || members.length === 0) {
      return NextResponse.json({ error: 'Lớp chưa có học sinh nào' }, { status: 400 })
    }

    const notifications = members.map(m => ({
      user_id: m.student_id,
      title,
      message,
      type,
      link: link || null,
      is_read: false,
    }))

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (insertError) throw insertError

    return NextResponse.json({ success: true, count: notifications.length })
  } catch (err: any) {
    console.error('Send notification error:', err)
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 })
  }
}
