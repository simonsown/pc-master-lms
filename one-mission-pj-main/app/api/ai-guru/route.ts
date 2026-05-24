// Path: app/api/ai-guru/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication on the server
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 })
    }

    // Call the Gemini API server-side
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `Bạn là AI Guru của PC Master Builder LMS — trợ lý chuyên về tin học và lắp ráp PC. 
Giải thích rõ ràng, ngắn gọn bằng tiếng Việt. Tập trung vào kiến thức phần cứng máy tính.
Context hiện tại: ${context ?? 'Đang học về tin học và lắp ráp PC'}`

    const result = await model.generateContent(`${systemPrompt}\n\nCâu hỏi: ${message}`)
    const responseText = result.response.text()

    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    console.error('Error in AI Guru API Route:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
