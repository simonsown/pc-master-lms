import { createClient } from '@/lib/supabase-ssr-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // New OAuth user - redirect to register completion to select role
      if (!profile || !profile.role) {
        return NextResponse.redirect(new URL('/register?oauth=true', requestUrl.origin))
      }

      // Existing user - redirect based on role
      const dashboardUrl = {
        teacher: '/teacher',
        admin: '/admin',
        parent: '/parent',
        student: '/builder',
      }[profile.role as 'teacher' | 'admin' | 'parent' | 'student'] ?? '/builder'

      return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin))
}
