import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ response: '⚠️ API Key chưa được cấu hình. Vui lòng liên hệ quản trị viên.' })
    }

    const systemPrompt = `Bạn là AI Guru của PC Master Builder LMS — trợ lý chuyên về tin học và lắp ráp PC. 
Giải thích rõ ràng, ngắn gọn bằng tiếng Việt. Tập trung vào kiến thức phần cứng máy tính.
Context hiện tại: ${context ?? 'Đang học về tin học và lắp ráp PC'}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nCâu hỏi: ${message}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    )

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error('AI Guru API Error:', geminiRes.status, errBody)
      return NextResponse.json({ response: 'Xin lỗi, AI đang gặp sự cố. Vui lòng thử lại sau.' })
    }

    const data = await geminiRes.json()
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể tạo phản hồi ngay bây giờ.'

    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    console.error('Error in AI Guru API Route:', error?.message || error)
    return NextResponse.json({ response: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.' })
  }
}
