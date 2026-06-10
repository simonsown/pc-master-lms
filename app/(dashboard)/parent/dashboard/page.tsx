// Path: app/(dashboard)/parent/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ParentDashboardClient } from './ParentDashboardClient'

export const dynamic = 'force-dynamic'

export default async function ParentDashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (!user || authErr) {
    redirect('/login')
  }

  // Fetch parent profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') {
    // If not a parent, redirect back to home/dashboard
    redirect('/student')
  }

  // Query confirmed linked children
  const { data: links, error: linksErr } = await supabase
    .from('parent_student_links')
    .select(`
      id,
      relationship,
      linked_at,
      student:profiles!student_id (
        id,
        full_name,
        avatar_url,
        student_code,
        school_name,
        xp,
        level,
        is_online,
        last_seen_at
      )
    `)
    .eq('parent_id', user.id)
    .eq('status', 'active')
    .order('linked_at', { ascending: false })

  if (linksErr) {
    console.error('Error fetching linked children:', linksErr)
  }

  // Format array to bypass any potential typing issues
  const linkedChildren = (links ?? []).map((link: any) => ({
    id: link.id,
    relationship: link.relationship,
    student: link.student
  }))

  return (
    <ParentDashboardClient
      parentName={profile?.full_name ?? 'Phụ huynh'}
      linkedChildren={linkedChildren}
    />
  )
}
