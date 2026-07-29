import { createClient } from '@/lib/supabase-ssr-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const isOauth = user.app_metadata?.provider !== 'email' || user.app_metadata?.providers?.includes('google')
      const profileCompleted = user.user_metadata?.profile_completed === true

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      // Nếu là Google OAuth và CHƯA hoàn tất điền thông tin (profile_completed !== true)
      if (isOauth && !profileCompleted) {
        if (!profile) {
          const role = user.user_metadata?.role || 'student'
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''

          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
        }

        // Chuyển hướng bắt buộc sang trang hoàn tất điền thông tin
        return NextResponse.redirect(new URL('/register?oauth=true', requestUrl.origin))
      }

      // Profile chưa có (trường hợp email confirmation)
      if (!profile) {
        const role = user.user_metadata?.role || 'student'
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: role,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

        const dashboardUrl = ({
          teacher: '/teacher',
          admin: '/admin',
          parent: '/parent',
          student: '/builder',
        } as Record<string, string>)[role] ?? '/builder'

        return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
      }

      // Profile đã có & đã hoàn tất thông tin → redirect theo role
      const dashboardUrl = ({
        teacher: '/teacher',
        admin: '/admin',
        parent: '/parent',
        student: '/builder',
      } as Record<string, string>)[profile.role] ?? '/builder'

      return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin))
}

