import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-ssr-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: 'student',
          updated_at: new Date().toISOString(),
        })
        return NextResponse.redirect(`${origin}/builder`)
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
