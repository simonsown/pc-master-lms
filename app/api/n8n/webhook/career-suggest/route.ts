import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

async function callGroq(career: string, condition?: string): Promise<any | null> {
  const apiKey = process.env.GROQ_API_KEY || ''
  if (!apiKey) return null
  try {
    let userContent = `Người dùng có ước mơ nghề nghiệp: "${career}".\n\nHãy đề xuất cấu hình PC PHÙ HỢP NHẤT với lý do chi tiết cho từng linh kiện.`
    if (condition) userContent += `\n\nYÊU CẦU THÊM: "${condition}".`

    userContent += `\n\nTrả về JSON:\n{"career":"...","explanation":"...","build":[{"id":"...","name":"...","type":"CPU/RAM/GPU/Mainboard/Storage/PSU/Cooler","price":1234567,"reason":"..."}],"totalPrice":1234567,"tips":"..."}`

    const r = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia tư vấn cấu hình PC. LUÔN trả về JSON hợp lệ, không markdown.' },
          { role: 'user', content: userContent }
        ],
        temperature: 0.4,
        max_tokens: 4096,
      }),
    })
    if (!r.ok) return null
    const data = await r.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) return null
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch { return null }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const secret = process.env.N8N_WEBHOOK_SECRET || 'pc-master-n8n-secret-key-change-in-production'
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { career, customDream, customCondition } = await request.json()
    const careerName = career || customDream
    if (!careerName) {
      return NextResponse.json({ error: 'Missing career name' }, { status: 400 })
    }

    const result = await callGroq(careerName, customCondition)
    if (!result) {
      return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })
    }

    return NextResponse.json({ ...result, source: 'n8n' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
