import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-ssr-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/builder'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !profile.role) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      const userRole = profile.role
      let redirectPath = '/builder'
      if (userRole === 'teacher') redirectPath = '/teacher'
      else if (userRole === 'parent') redirectPath = '/parent'

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=could_not_authenticate`)
}
