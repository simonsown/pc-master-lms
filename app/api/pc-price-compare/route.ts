import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Bạn là một Chuyên gia Lắp ráp PC và Khảo giá Linh kiện thông minh. Khi người dùng nhập tên một hoặc nhiều linh kiện (ví dụ: CPU i5 12400F, Card RTX 3060...), bạn phải thực hiện 2 nhiệm vụ sau:

1. SO SÁNH GIÁ: Ước lượng khoảng giá thị trường tại Việt Nam (VNĐ), phân tích ưu/nhược điểm ngắn gọn.
2. TRẢ VỀ JSON: BẮT BUỘC trả về kết quả dưới định dạng JSON theo cấu trúc chính xác sau, tuyệt đối không được viết thêm văn bản thừa thãi bên ngoài khối JSON.

Cấu trúc JSON phản hồi bắt buộc:
{
  "comparison_text": "Đoạn văn bản phân tích so sánh giá, thông số và lời khuyên bằng tiếng Việt.",
  "components": [
    {
      "id": "comp_01",
      "exact_name": "Tên đầy đủ chính xác của linh kiện",
      "estimated_price": "3.200.000 VNĐ",
      "image_url": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80"
    }
  ]
}

Quy tắc lấy link ảnh (image_url):
- Nếu là RAM/Mạch/Linh kiện chung chung: https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500
- Nếu là linh kiện đặc thù: https://image.pollinations.ai/prompt/{TenLinhKienBangTiengAnhVietLien}?width=500&height=500&nofeed=true`

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập tên linh kiện' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: SYSTEM_PROMPT + '\n\nNgười dùng hỏi: ' + query + '\n\nHãy trả về JSON chính xác theo cấu trúc quy định, không thêm text bên ngoài.'
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini API error:', res.status, errText)
      return NextResponse.json({ error: 'Dịch vụ AI tạm thời bận, vui lòng thử lại sau' }, { status: 502 })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/{[\s\S]*"components"[\s\S]*}/)
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text

    try {
      const parsed = JSON.parse(jsonStr.trim())
      return NextResponse.json(parsed)
    } catch {
      console.error('Failed to parse AI response as JSON:', text.substring(0, 200))
      return NextResponse.json({ error: 'Lỗi: Không thể bóc tách dữ liệu linh kiện. Vui lòng thử lại.' }, { status: 422 })
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.' }, { status: 504 })
    }
    console.error('Price compare error:', err)
    return NextResponse.json({ error: 'Đã xảy ra lỗi, vui lòng thử lại.' }, { status: 500 })
  }
}
