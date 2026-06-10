// Path: app/(dashboard)/student/profile/privacy/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/rbac'
import PrivacySettingsClient from './PrivacySettingsClient'

export const dynamic = 'force-dynamic'

export default async function StudentPrivacyPage() {
  const user = await requireRole(['student'])
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // Fetch student profile details to guarantee we have the student_code
  const { data: profile } = await supabase
    .from('profiles')
    .select('student_code, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Fetch initial parent links (both active and pending ones)
  const { data: links } = await supabase
    .from('parent_student_links')
    .select(`
      id,
      relationship,
      status,
      linked_at,
      confirmed_at,
      parent:profiles!parent_id (
        id,
        full_name,
        avatar_url,
        phone
      )
    `)
    .eq('student_id', user.id)
    .order('linked_at', { ascending: false })

  const initialLinks = (links ?? []).map((link: any) => ({
    id: link.id,
    relationship: link.relationship,
    status: link.status,
    linked_at: link.linked_at,
    confirmed_at: link.confirmed_at,
    parent: link.parent
  }))

  return (
    <PrivacySettingsClient
      studentId={user.id}
      studentName={profile.full_name}
      studentCode={profile.student_code ?? ''}
      initialLinks={initialLinks}
    />
  )
}
