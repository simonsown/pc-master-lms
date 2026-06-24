import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const QUESTS = [
  { title: 'Hoàn thành 1 bài học', description: 'Xem hết 1 bài giảng bất kỳ', xp_reward: 50, type: 'daily', difficulty: 'easy', icon: '📚', requirement_type: 'complete_lesson', requirement_value: 1, is_active: true },
  { title: 'Lắp ráp PC hoàn chỉnh', description: 'Lắp đầy đủ linh kiện trong PC Builder', xp_reward: 80, type: 'daily', difficulty: 'medium', icon: '🔧', requirement_type: 'build_pc', requirement_value: 1, is_active: true },
  { title: 'Làm bài trắc nghiệm', description: 'Hoàn thành 1 bài quiz bất kỳ', xp_reward: 30, type: 'daily', difficulty: 'easy', icon: '🧠', requirement_type: 'complete_quiz', requirement_value: 1, is_active: true },
  { title: 'Tham gia thảo luận', description: 'Đặt câu hỏi hoặc trả lời trong diễn đàn', xp_reward: 20, type: 'daily', difficulty: 'easy', icon: '💬', requirement_type: 'discuss', requirement_value: 1, is_active: true },
  { title: 'Đạt streak 3 ngày', description: 'Học liên tiếp 3 ngày không bỏ lỡ', xp_reward: 150, type: 'daily', difficulty: 'hard', icon: '🔥', requirement_type: 'streak', requirement_value: 3, is_active: true },
  { title: 'Kiểm tra tương thích', description: 'Chạy kiểm tra tương thích cho 1 cấu hình PC', xp_reward: 40, type: 'daily', difficulty: 'medium', icon: '✅', requirement_type: 'compatibility_check', requirement_value: 1, is_active: true },
  { title: 'Hoàn thành 3 bài học', description: 'Học liên tục 3 bài giảng trong ngày', xp_reward: 120, type: 'daily', difficulty: 'hard', icon: '📚', requirement_type: 'complete_lesson', requirement_value: 3, is_active: true },
  { title: 'Luyện tập 15 phút', description: 'Dành 15 phút trong PC Builder', xp_reward: 60, type: 'daily', difficulty: 'medium', icon: '⏱️', requirement_type: 'study_time', requirement_value: 15, is_active: true },
]

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { data: existing } = await supabase.from('daily_quests').select('id').limit(1)
    if (existing && existing.length > 0) {
      return Response.json({ message: '✅ daily_quests already has data, skipping' })
    }

    const { error } = await supabase.from('daily_quests').insert(QUESTS)
    if (error) throw error

    return Response.json({ message: `✅ Seeded ${QUESTS.length} daily quests` })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
