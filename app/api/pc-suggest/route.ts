import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn mua máy tính tại Việt Nam. Dựa trên nhu cầu người dùng (mục đích, trường hợp sử dụng, ngân sách), hãy đề xuất các mẫu máy tính thực tế đang có trên thị trường Việt Nam.

Yêu cầu:
- Đề xuất 3-5 máy tính phù hợp nhất (cả laptop và desktop)
- Mỗi máy phải có tên cụ thể, thông số chi tiết (CPU, RAM, GPU, ổ cứng), giá tham khảo
- Thêm ảnh sản phẩm (dùng unsplash hoặc pollinations.ai)
- Phân tích lý do phù hợp
- Tra cứu giá trên 5 trang: GearVN, Phong Vũ, An Phát, Hoàng Hà, FPT Shop
- Tính giá trung bình từ các cửa hàng

Trả về JSON tuyệt đối, không thêm text ngoài:
{
  "suggestions": [
    {
      "id": "s1",
      "name": "Tên máy",
      "type": "Laptop Gaming | Desktop Gaming | Laptop | Desktop Office | ...",
      "specs": "Thông số chi tiết",
      "specs_detail": {
        "cpu": "Intel Core i7-13700H",
        "ram": "16GB DDR5",
        "gpu": "RTX 4060 8GB",
        "storage": "1TB SSD NVMe"
      },
      "price": 34990000,
      "average_price": 35200000,
      "price_breakdown": [
        { "store": "GearVN", "price": 34990000, "url": "https://gearvn.com/" },
        { "store": "Phong Vũ", "price": 35900000, "url": "https://phongvu.vn/" },
        { "store": "An Phát", "price": 34500000, "url": "https://anphatpc.com.vn/" },
        { "store": "Hoàng Hà", "price": 35500000, "url": "https://hoanghapc.vn/" },
        { "store": "FPT Shop", "price": 35200000, "url": "https://fptshop.com.vn/" }
      ],
      "reason": "Lý do phù hợp",
      "useCases": ["gaming", "coder"],
      "rating": 4.7,
      "image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80"
    }
  ]
}`

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000

function getCacheKey(purpose: string, useCases: string[], budget: number): string {
  return JSON.stringify({ purpose, useCases: [...useCases].sort(), budget })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { purpose, useCases = [], budget = 0 } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'AI chưa được cấu hình (thiếu API key). Vui lòng liên hệ admin để thiết lập.',
        code: 'MISSING_API_KEY',
      }, { status: 503 })
    }

    if (!purpose && useCases.length === 0) {
      return NextResponse.json({ error: 'Vui lòng nhập nhu cầu hoặc chọn mục đích sử dụng' }, { status: 400 })
    }

    const cacheKey = getCacheKey(purpose, useCases, budget)
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const userRequest = `Mục đích: ${purpose || 'Không có'}\nCác nhu cầu: ${useCases.length > 0 ? useCases.join(', ') : 'Không có'}\nNgân sách: ${budget > 0 ? budget.toLocaleString('vi-VN') + '₫' : 'Không giới hạn'}\n\nHãy đề xuất máy tính phù hợp nhất. Trả về JSON chính xác theo cấu trúc quy định.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: SYSTEM_PROMPT + '\n\n' + userRequest
          }]
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
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

    if (!text.trim()) {
      return NextResponse.json({ error: 'AI không trả về kết quả. Vui lòng thử lại.' }, { status: 422 })
    }

    let jsonStr = text.trim()
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim()
    } else {
      const objectMatch = text.match(/{[\s\S]*"suggestions"[\s\S]*}/)
      if (objectMatch) {
        jsonStr = objectMatch[0]
      }
    }

    try {
      const parsed = JSON.parse(jsonStr)
      cache.set(cacheKey, { data: parsed, timestamp: Date.now() })
      return NextResponse.json(parsed)
    } catch {
      console.error('Failed to parse AI response as JSON:', text.substring(0, 500))
      return NextResponse.json({ error: 'Không thể phân tích dữ liệu từ AI. Vui lòng thử lại.' }, { status: 422 })
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.' }, { status: 504 })
    }
    console.error('PC suggest error:', err)
    return NextResponse.json({ error: 'Đã xảy ra lỗi, vui lòng thử lại.' }, { status: 500 })
  }
}
