import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_ROUTES: Record<string, string[]> = {
  admin:   ['/admin'],
  teacher: ['/teacher'],
  student: ['/student', '/builder'],
  parent:  ['/parent'],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("CRITICAL: Missing Supabase environment variables in Middleware!")
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Kiểm tra user session
  const { data: { user } } = await supabase.auth.getUser()
  const currentPath = request.nextUrl.pathname

  // Bỏ qua các route public
  if (currentPath.startsWith('/_next') || currentPath.startsWith('/api') || currentPath === '/' || currentPath.startsWith('/login') || currentPath.startsWith('/register') || currentPath.startsWith('/about')) {
    return supabaseResponse;
  }

  // Nếu chưa đăng nhập mà vào route cần auth => Redirect login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Lấy role từ bảng profiles hoặc metadata của user
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Ưu tiên role từ profile, dự phòng role từ user_metadata
  const userRole = profile?.role || user.user_metadata?.role || 'student';

  let isAllowed = false;
  // Common routes allowed for ALL authenticated users
  const commonRoutes = ['/profile', '/lessons']
  
  if (commonRoutes.some(route => currentPath.startsWith(route))) {
    isAllowed = true;
  } else if (ROLE_ROUTES[userRole]) {
      for (const route of ROLE_ROUTES[userRole]) {
          if (currentPath.startsWith(route)) {
              isAllowed = true;
              break;
          }
      }
  }

  // Nếu không được phép, redirect về dashboard tương ứng
  if (!isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = `/${userRole}`
      // Student có route đặc biệt là /builder hoặc /student
      if (userRole === 'student') url.pathname = '/builder';
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}
