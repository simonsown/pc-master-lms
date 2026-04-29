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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  if (currentPath.startsWith('/_next') || currentPath.startsWith('/api') || currentPath === '/' || currentPath.startsWith('/login') || currentPath.startsWith('/register')) {
    return supabaseResponse;
  }

  // Nếu chưa đăng nhập mà vào route cần auth => Redirect login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Lấy role từ bảng profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'student'; // Mặc định là student

  // Kiểm tra quyền truy cập route dựa trên role
  let isAllowed = false;
  
  if (ROLE_ROUTES[userRole]) {
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
