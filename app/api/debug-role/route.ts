import { createClient } from '@/lib/supabase-ssr-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const role = requestUrl.searchParams.get('role')

  if (!role || !['student', 'teacher', 'parent', 'admin'].includes(role)) {
    return NextResponse.json({ 
      error: 'Vui lòng cung cấp role hợp lệ: student, teacher, parent, hoặc admin. Ví dụ: /api/debug-role?role=teacher' 
    }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Bạn chưa đăng nhập!' }, { status: 401 })
  }

  // 1. Kiểm tra xem profile đã tồn tại chưa
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .maybeSingle()

  let dbError = null

  if (existingProfile) {
    // Nếu đã có profile, chỉ UPDATE trường role (không chạm vào full_name hay các cột khác)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    dbError = error
  } else {
    // Nếu chưa có profile, tạo mới hoàn chỉnh và lấy full_name từ metadata
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
      })
    dbError = error
  }

  if (dbError) {
    return NextResponse.json({ 
      error: 'Cập nhật database thất bại!', 
      details: dbError.message,
      tip: 'Hãy chắc chắn rằng bạn đã chạy các câu lệnh SQL phân quyền RLS trong Supabase SQL Editor!'
    }, { status: 500 })
  }

  // Đồng thời cập nhật cả metadata của User Auth để đồng bộ hoàn toàn
  await supabase.auth.updateUser({
    data: { role: role }
  })

  // Trả về kết quả thành công và chuyển hướng về dashboard tương ứng
  const redirectUrl = role === 'student' ? '/builder' : `/${role}`
  
  // Trả về HTML tự động chuyển hướng cực kỳ mượt mà
  return new NextResponse(
    `<html>
      <head>
        <title>Đang chuyển hướng...</title>
        <meta http-equiv="refresh" content="2;url=${redirectUrl}" />
        <style>
          body {
            background-color: #0f0f1a;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: rgba(22, 33, 62, 0.5);
            border: 1px solid rgba(0, 210, 160, 0.2);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-width: 400px;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #00d2a0;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { color: #00d2a0; margin-top: 0; }
          p { color: #a0aec0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Kích hoạt vai trò thành công! 🎉</h2>
          <p>Tài khoản của bạn <strong>${user.email}</strong> đã được chuyển sang vai trò: <strong>${role.toUpperCase()}</strong>.</p>
          <div class="spinner"></div>
          <p>Đang tự động đưa bạn về trang Dashboard của bạn...</p>
        </div>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  )
}
