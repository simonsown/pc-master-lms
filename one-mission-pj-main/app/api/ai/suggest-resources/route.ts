import { NextResponse } from 'next/server'
import { KNOWLEDGE_BASE } from '@/data/knowledgeBase'

export async function POST(req: Request) {
  try {
    const { completedTopics, currentTopic, strengths, weaknesses } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      // Fallback: return static suggestions based on completed topics
      return NextResponse.json(generateStaticSuggestions(completedTopics || [], currentTopic))
    }

    const knowledgeContext = KNOWLEDGE_BASE.map(k => k.content).join('\n\n')

    const prompt = `Bạn là chuyên gia tư vấn lộ trình học tập PC Master Builder.

KIẾN THỨC NỀN TẢNG:
${knowledgeContext}

HỌC SINH HIỆN TẠI:
- Chủ đề đã hoàn thành: ${(completedTopics || []).join(', ') || 'Chưa có'}
- Chủ đề đang học: ${currentTopic || 'Chưa xác định'}
- Điểm mạnh: ${(strengths || []).join(', ') || 'Chưa xác định'}
- Điểm yếu: ${(weaknesses || []).join(', ') || 'Chưa xác định'}

NHIỆM VỤ: Đưa ra 4 gợi ý học tập được cá nhân hóa cho học sinh. Mỗi gợi ý gồm:
1. Chủ đề (bằng tiếng Việt)
2. Mô tả ngắn gọn (1-2 câu)
3. Lý do gợi ý (dựa trên điểm mạnh/yếu)
4. 2 từ khóa tìm kiếm YouTube bằng tiếng Việt để học thêm (ngăn cách bởi dấu phẩy)

Trả về JSON array:
[
  {
    "topic": "Tên chủ đề",
    "description": "Mô tả ngắn",
    "reason": "Lý do gợi ý",
    "youtubeKeywords": "từ khóa 1, từ khóa 2"
  }
]

CHỈ TRẢ VỀ JSON, không thêm text nào khác.`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!res.ok) {
      return NextResponse.json(generateStaticSuggestions(completedTopics || [], currentTopic))
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0])
        return NextResponse.json(suggestions)
      }
    } catch {}

    return NextResponse.json(generateStaticSuggestions(completedTopics || [], currentTopic))
  } catch (err) {
    return NextResponse.json(generateStaticSuggestions([], ''))
  }
}

function generateStaticSuggestions(completedTopics: string[], currentTopic: string) {
  const allTopics = ['CPU', 'RAM', 'GPU', 'SSD', 'PSU', 'Mainboard', 'Case', 'Tản nhiệt']
  const completed = new Set(completedTopics.map(t => t.toLowerCase()))
  if (currentTopic) completed.add(currentTopic.toLowerCase())

  const suggestions = allTopics
    .filter(t => !completed.has(t.toLowerCase()))
    .slice(0, 4)
    .map((topic, i) => ({
      topic: getTopicName(topic),
      description: getTopicDescription(topic),
      reason: i === 0 ? 'Nên học tiếp theo trong lộ trình' : 'Củng cố kiến thức nền tảng',
      youtubeKeywords: getYoutubeKeywords(topic),
    }))

  // If all topics completed, suggest review/advanced
  if (suggestions.length === 0) {
    suggestions.push({
      topic: 'Lắp ráp hoàn chỉnh một bộ PC',
      description: 'Thực hành lắp ráp toàn bộ hệ thống từ A đến Z, kiểm tra tương thích và tối ưu hiệu năng.',
      reason: 'Bạn đã hoàn thành tất cả chủ đề cơ bản! Hãy thử thách bản thân với một dàn PC thực tế.',
      youtubeKeywords: 'hướng dẫn lắp ráp PC cho người mới, build PC gaming 2025',
    })
    suggestions.push({
      topic: 'Ép xung (Overclocking) CPU & RAM',
      description: 'Tìm hiểu cách tăng hiệu năng vượt trội bằng ép xung CPU, RAM và GPU.',
      reason: 'Kiến thức nâng cao dành cho người đã vững nền tảng.',
      youtubeKeywords: 'cách ép xung CPU an toàn, hướng dẫn ép xung RAM',
    })
  }

  return suggestions
}

function getTopicName(topic: string) {
  const names: Record<string, string> = {
    CPU: 'Bộ vi xử lý (CPU)',
    RAM: 'Bộ nhớ RAM',
    GPU: 'Card đồ họa (GPU)',
    SSD: 'Ổ cứng SSD',
    PSU: 'Bộ nguồn (PSU)',
    Mainboard: 'Bo mạch chủ (Mainboard)',
    Case: 'Vỏ máy tính (Case)',
    'Tản nhiệt': 'Hệ thống tản nhiệt',
    COOLING: 'Hệ thống tản nhiệt',
  }
  return names[topic] || topic
}

function getTopicDescription(topic: string) {
  const descs: Record<string, string> = {
    CPU: 'Tìm hiểu về socket, cores, threads, xung nhịp và TDP của bộ vi xử lý.',
    RAM: 'Khám phá DDR4 vs DDR5, bus RAM, Dual Channel và dung lượng phù hợp.',
    GPU: 'Hiểu về VRAM, CUDA cores, PCIe và cách chọn card đồ họa phù hợp.',
    SSD: 'So sánh NVMe vs SATA, tốc độ đọc ghi và cách chọn ổ cứng.',
    PSU: 'Công suất, hiệu suất 80 Plus và các chuẩn modular của bộ nguồn.',
    Mainboard: 'Chipset, form factor, slot và các cổng kết nối trên bo mạch chủ.',
    Case: 'Kích thước, airflow, kính cường lực và cách chọn vỏ máy.',
    'Tản nhiệt': 'Air cooling vs AIO, quạt case và keo tản nhiệt.',
    COOLING: 'Air cooling vs AIO, quạt case và keo tản nhiệt.',
  }
  return descs[topic] || `Tìm hiểu về ${topic} trong lắp ráp PC.`
}

function getYoutubeKeywords(topic: string) {
  const keywords: Record<string, string> = {
    CPU: 'cách chọn CPU phù hợp 2025, hướng dẫn lắp CPU vào mainboard',
    RAM: 'nên mua RAM DDR4 hay DDR5, cách cắm RAM đúng kênh Dual Channel',
    GPU: 'cách chọn card đồ họa cho gaming, các loại card đồ họa phổ biến',
    SSD: 'nên mua SSD NVMe hay SATA, cách gắn SSD M.2 vào mainboard',
    PSU: 'cách chọn nguồn máy tính phù hợp, nguồn 80 Plus là gì',
    Mainboard: 'cách chọn mainboard phù hợp với CPU, các loại mainboard ATX Micro-ATX',
    Case: 'cách chọn vỏ case máy tính, hướng dẫn đi dây trong case',
    'Tản nhiệt': 'nên mua tản nhiệt khí hay tản nhiệt nước, cách bôi keo tản nhiệt CPU',
    COOLING: 'nên mua tản nhiệt khí hay tản nhiệt nước, cách bôi keo tản nhiệt CPU',
  }
  return keywords[topic] || `học về ${topic} lắp ráp PC, ${topic} máy tính là gì`
}
