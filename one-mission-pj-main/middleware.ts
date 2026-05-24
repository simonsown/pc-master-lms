// Path: middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Role-based access control permissions map
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin':       ['admin'],
  '/teacher':     ['teacher', 'admin'],
  '/student':     ['student', 'teacher', 'admin'],
  '/parent':      ['parent', 'admin'],
  '/builder':     ['student', 'teacher', 'admin'],
  '/profile':     ['student', 'teacher', 'admin', 'parent'],
  '/notifications':['student', 'teacher', 'admin', 'parent'],
  '/leaderboard': ['student', 'teacher', 'admin', 'parent'],
}

// Public routes that don't require user authentication
const PUBLIC_ROUTES = [
  '/', '/login', '/register', '/about', '/builder',
  '/forgot-password', '/reset-password', '/verify-email',
  '/verify',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Use getUser() instead of getSession() to securely verify JWT on the server
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  )

  // Map roles to their respective active dashboard routes
  const dashMap: Record<string, string> = {
    admin: '/admin',
    teacher: '/teacher',
    parent: '/parent/dashboard',
    student: '/student',
  }

  if (isPublicRoute) {
    if (user && (pathname === '/login' || pathname === '/register')) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role ?? 'student'
      return NextResponse.redirect(
        new URL(dashMap[role] ?? '/student', request.url)
      )
    }
    return response
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role ?? 'student'

  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .find(r => pathname.startsWith(r))

  if (matchedRoute && !ROUTE_PERMISSIONS[matchedRoute].includes(role)) {
    return NextResponse.redirect(new URL(dashMap[role] ?? '/student', request.url))
  }

  response.headers.set('x-user-role', role)
  response.headers.set('x-user-id', user.id)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
