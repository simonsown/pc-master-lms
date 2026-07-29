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
        .maybeSingle()

      // Profile chưa có → tạo mới (trường hợp email confirmation)
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

        // OAuth user chưa chọn role → về trang hoàn tất đăng ký
        const isOauth = user.app_metadata?.provider !== 'email'
        if (isOauth) {
          return NextResponse.redirect(new URL('/register?oauth=true', requestUrl.origin))
        }

        // Email user sau confirm → redirect theo role đã chọn lúc đăng ký
        const dashboardUrl = ({
          teacher: '/teacher',
          admin: '/admin',
          parent: '/parent',
          student: '/builder',
        } as Record<string, string>)[role] ?? '/builder'

        return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
      }

      // Profile đã có → redirect theo role
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
