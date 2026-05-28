import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import ParentNotificationsView from '@/components/parent/ParentNotificationsView'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function ParentNotificationsPage() {
  // 1. Xác thực role
  const user = await requireRole(['parent', 'admin'])
  const supabase = await createClient()

  // 2. Fetch danh sách thông báo
  const { data: dbNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const notifications = dbNotifications || []

  // 3. Fetch danh sách con liên kết để map thông tin (Avatar + Tên)
  const { data: links } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', user.id)
    .eq('status', 'active')

  const studentIds = (links || []).map((l) => l.student_id)
  let students: any[] = []

  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', studentIds)
    students = profiles || []
  }

  // 4. Server Actions phục vụ các thao tác của phụ huynh
  async function markAllAsReadAction() {
    'use server'
    const parent = await requireRole(['parent', 'admin'])
    const client = await createClient()
    await client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', parent.id)
    revalidatePath('/parent/notifications')
  }

  async function deleteAllAction() {
    'use server'
    const parent = await requireRole(['parent', 'admin'])
    const client = await createClient()
    await client
      .from('notifications')
      .delete()
      .eq('user_id', parent.id)
    revalidatePath('/parent/notifications')
  }

  async function markAsReadAction(id: string) {
    'use server'
    const parent = await requireRole(['parent', 'admin'])
    const client = await createClient()
    await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', parent.id)
    revalidatePath('/parent/notifications')
  }

  async function deleteSingleAction(id: string) {
    'use server'
    const parent = await requireRole(['parent', 'admin'])
    const client = await createClient()
    await client
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', parent.id)
    revalidatePath('/parent/notifications')
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <ParentNotificationsView
        initialNotifications={notifications}
        students={students}
        markAllAsRead={markAllAsReadAction}
        deleteAll={deleteAllAction}
        markAsRead={markAsReadAction}
        deleteSingle={deleteSingleAction}
      />
    </div>
  )
}
