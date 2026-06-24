import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-ssr-server'

const CHALLENGES_SYSTEM_PROMPT = `Bạn là AI tạo nhiệm vụ (Quest Generator) cho nền tảng học PC Master Builder.
Nhiệm vụ của bạn là tạo RA 10 NHIỆM VỤ (CHALLENGES) mỗi ngày dựa trên tất cả tính năng của web.
Mỗi nhiệm vụ phải thực tế, có thể thực hiện được trên web, và tăng XP.

Các tính năng của web:
1. Lắp ráp PC (PC Builder) - Kéo thả linh kiện, kiểm tra tương thích
2. Chẩn đoán PC (Diagnosis) - Mô tả lỗi, AI chẩn đoán
3. Cài đặt Windows 11 - Mô phỏng cài Win11
4. Tra giá linh kiện - So sánh giá linh kiện PC
5. Quiz kiến thức - Bài trắc nghiệm tin học
6. Thi thử (Exam) - Thi có giám sát
7. Gợi ý máy tính (PC Suggest) - Đề xuất cấu hình
8. Xem bài giảng (Lessons) - Học lý thuyết
9. Thảo luận (Discussion) - Hỏi đáp trên diễn đàn
10. Định hướng nghề nghiệp (Career) - Quiz nghề nghiệp

Luật:
- 10 nhiệm vụ/ngày, đa dạng các tính năng
- Mỗi nhiệm vụ có: title, description, type, difficulty (easy/medium/hard), xp_reward (5-50), icon, requirement_type, requirement_value
- Dạng JSON array thuần túy, không markdown`

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: todayQuests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('is_active', true)
      .gte('created_at', new Date().toISOString().slice(0, 10))
      .limit(10)

    if (todayQuests && todayQuests.length >= 10) {
      return NextResponse.json({ quests: todayQuests, cached: true })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      const { data: fallbackQuests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('is_active', true)
        .limit(10)
      return NextResponse.json({ quests: fallbackQuests || [], cached: true, fallback: true })
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${CHALLENGES_SYSTEM_PROMPT}\n\nHôm nay là ${new Date().toLocaleDateString('vi-VN')}. Hãy tạo 10 nhiệm vụ ngẫu nhiên dạng JSON array.`
          }]
        }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
      })
    })

    if (!res.ok) {
      const { data: fallbackQuests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('is_active', true)
        .limit(10)
      return NextResponse.json({ quests: fallbackQuests || [], cached: true, fallback: true })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const jsonStr = jsonMatch ? jsonMatch[0] : '[]'

    let quests: any[]
    try {
      quests = JSON.parse(jsonStr)

      for (const q of quests) {
        const { data: existing } = await supabase
          .from('daily_quests')
          .select('id')
          .eq('title', q.title)
          .gte('created_at', new Date().toISOString().slice(0, 10))
          .single()

        if (!existing) {
          await supabase.from('daily_quests').insert({
            title: q.title,
            description: q.description,
            xp_reward: q.xp_reward || 10,
            type: q.type || 'daily',
            difficulty: q.difficulty || 'easy',
            icon: q.icon || '📋',
            requirement_type: q.requirement_type || 'lesson',
            requirement_value: q.requirement_value || 1,
            is_active: true,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          })
        }
      }
    } catch {
      quests = []
    }

    const { data: savedQuests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('is_active', true)
      .limit(10)

    return NextResponse.json({ quests: savedQuests || quests || [], cached: false })
  } catch (error: any) {
    console.error('Error generating challenges:', error)
    return NextResponse.json({ error: 'Failed to generate challenges' }, { status: 500 })
  }
}
