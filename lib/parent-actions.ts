// Path: lib/parent-actions.ts
'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const cookieStore = await cookies()
  return createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        }
      }
    }
  )
}

// Find student by code
export async function findStudentByCode(code: string) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (!user || authErr) return { error: 'Chưa đăng nhập' }

    // UPPERCASE and trim whitespace
    const cleanCode = code.toUpperCase().trim()

    const { data, error } = await supabase
      .rpc('find_student_by_code', { input_code: cleanCode })

    if (error) {
      console.error('Error finding student:', error)
      return { error: 'Lỗi hệ thống khi tìm kiếm' }
    }

    if (!data || data.length === 0) {
      return { error: 'Không tìm thấy học sinh với mã này' }
    }

    return { student: data[0] }
  } catch (err: any) {
    return { error: err.message || 'Lỗi không xác định' }
  }
}

// Request linking to student
export async function requestLinkToStudent(
  studentId: string,
  relationship: string = 'parent'
) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (!user || authErr) return { error: 'Chưa đăng nhập' }

    // Verify role is parent
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profErr || profile?.role !== 'parent') {
      return { error: 'Bạn không phải tài khoản phụ huynh' }
    }

    // Verify student exists and is student
    const { data: student, error: studErr } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', studentId)
      .single()

    if (studErr || !student || student.role !== 'student') {
      return { error: 'Học sinh không tồn tại hoặc không hợp lệ' }
    }

    // Create link request (status = pending)
    const { error: linkErr } = await supabase
      .from('parent_student_links')
      .upsert({
        parent_id: user.id,
        student_id: studentId,
        relationship,
        status: 'pending',
        linked_at: new Date().toISOString()
      }, { onConflict: 'parent_id,student_id' })

    if (linkErr) {
      console.error('Link creation error:', linkErr)
      return { error: 'Không thể gửi yêu cầu liên kết' }
    }

    // Create notification for student
    const { error: notifErr } = await supabase
      .from('notifications')
      .insert({
        user_id: studentId,
        type: 'parent_link_request',
        title: '👨👩👧 Phụ huynh muốn theo dõi bạn',
        body: `${profile.full_name} muốn liên kết tài khoản để theo dõi tiến trình học tập của bạn.`,
        data: { parent_id: user.id, relationship },
        action_url: '/student/profile/privacy'
      })

    if (notifErr) {
      console.error('Notification error:', notifErr)
    }

    revalidatePath('/parent/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Lỗi không xác định' }
  }
}

// Student confirms parent link
export async function confirmParentLink(parentId: string) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (!user || authErr) return { error: 'Chưa đăng nhập' }

    // Update link status to active
    const { error: linkErr } = await supabase
      .from('parent_student_links')
      .update({
        status: 'active',
        confirmed_at: new Date().toISOString()
      })
      .eq('parent_id', parentId)
      .eq('student_id', user.id)
      .eq('status', 'pending')

    if (linkErr) {
      console.error('Confirm link error:', linkErr)
      return { error: 'Không thể xác nhận liên kết' }
    }

    // Fetch student's name for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Send confirmation notification to parent
    await supabase.from('notifications').insert({
      user_id: parentId,
      type: 'parent_link_confirmed',
      title: '✅ Học sinh đã xác nhận liên kết',
      body: `${profile?.full_name || 'Học sinh'} đã đồng ý yêu cầu liên kết. Bây giờ bạn có thể xem tiến độ realtime.`,
      action_url: '/parent/dashboard'
    })

    revalidatePath('/student/profile/privacy')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Lỗi không xác định' }
  }
}

// Student or Parent revokes link
export async function revokeParentLink(parentId: string) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (!user || authErr) return { error: 'Chưa đăng nhập' }

    // Perform revoke on the record where student_id is current user (or parent_id is current user)
    const { error: linkErr } = await supabase
      .from('parent_student_links')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: user.id
      })
      .eq('parent_id', parentId)
      .eq('student_id', user.id)

    if (linkErr) {
      console.error('Revoke link error:', linkErr)
      return { error: 'Không thể thu hồi quyền' }
    }

    revalidatePath('/student/profile/privacy')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Lỗi không xác định' }
  }
}
