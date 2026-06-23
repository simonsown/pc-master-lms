import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { symptoms, answers } = await request.json()

    const hasHistory = answers && answers.length > 0
    const context = hasHistory
      ? `Lịch sử: ${answers.map((a: any) => `Q: ${a.q} → A: ${a.a}`).join('\n')}`
      : ''

    const prompt = `Bạn là chuyên gia chẩn đoán PC. Người dùng mô tả: "${symptoms}"

${context}

Hãy chẩn đoán tương tác:
1. Nếu đã có đủ triệu chứng để chẩn đoán → đưa ra kết luận + hướng dẫn sửa + gợi ý nơi sửa/mua linh kiện
2. Nếu chưa đủ → đưa ra 3-4 câu hỏi gợi ý (dạng options, người dùng chọn)

Trả về JSON:
{
  "type": "question" | "diagnosis",
  "message": "Lời nhắn cho người dùng",
  "options": ["Tùy chọn 1", "Tùy chọn 2", ...],
  "diagnosis": { (chỉ khi type=diagnosis)
    "problem": "Tên lỗi",
    "cause": "Nguyên nhân chính",
    "fixSteps": ["Bước 1...", "Bước 2...", ...],
    "partsNeeded": ["Linh kiện cần thay (nếu có)"],
    "repairShop": "Gợi ý ra tiệm sửa hoặc tự làm"
  }
}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      return NextResponse.json({ error: 'Lỗi AI' }, { status: 502 })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/{[\s\S]*"type"[\s\S]*"message"[\s\S]*}/)
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text

    try {
      return NextResponse.json(JSON.parse(jsonStr.trim()))
    } catch {
      return NextResponse.json({
        type: 'diagnosis',
        message: text.substring(0, 500),
        options: [],
        diagnosis: {
          problem: 'Không thể phân tích',
          cause: 'Vui lòng thử lại với mô tả chi tiết hơn',
          fixSteps: [],
          partsNeeded: [],
          repairShop: 'Mang máy ra tiệm sửa chữa uy tín gần bạn'
        }
      })
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Hết thời gian chờ' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
