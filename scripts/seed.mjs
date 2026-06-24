import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ojjmdhrvivwvfgomonzd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qam1kaHJ2aXZ3dmZnb21vbnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAwNDgwNiwiZXhwOjIwOTQ1ODA4MDZ9._gVE_aKsscYbIoD-UQrpB1gTciS7i7F6D6bOC6fZRI4'

const supabase = createClient(supabaseUrl, supabaseKey)

const QUESTS = [
  { title: 'Hoan thanh 1 bai hoc', description: 'Xem het 1 bai giang bat ky', xp_reward: 50, type: 'daily', difficulty: 'easy', icon: '📚', requirement_type: 'complete_lesson', requirement_value: 1, is_active: true },
  { title: 'Lam bai trac nghiem', description: 'Hoan thanh 1 bai quiz bat ky', xp_reward: 30, type: 'daily', difficulty: 'easy', icon: '🧠', requirement_type: 'complete_quiz', requirement_value: 1, is_active: true },
  { title: 'Tham gia thao luan', description: 'Dat cau hoi hoac tra loi trong dien dan', xp_reward: 20, type: 'daily', difficulty: 'easy', icon: '💬', requirement_type: 'discuss', requirement_value: 1, is_active: true },
  { title: 'Dat streak 3 ngay', description: 'Hoc lien tiep 3 ngay khong bo lo', xp_reward: 150, type: 'daily', difficulty: 'hard', icon: '🔥', requirement_type: 'streak', requirement_value: 3, is_active: true },
  { title: 'Kiem tra tuong thich', description: 'Chay kiem tra tuong thich cho 1 cau hinh PC', xp_reward: 40, type: 'daily', difficulty: 'medium', icon: '✅', requirement_type: 'compatibility_check', requirement_value: 1, is_active: true },
  { title: 'Luyen tap 15 phut', description: 'Danh 15 phut trong PC Builder', xp_reward: 60, type: 'daily', difficulty: 'medium', icon: '⏱️', requirement_type: 'study_time', requirement_value: 15, is_active: true },
  { title: 'Hoan thanh 3 bai hoc', description: 'Hoc lien tuc 3 bai giang trong ngay', xp_reward: 120, type: 'daily', difficulty: 'hard', icon: '📚', requirement_type: 'complete_lesson', requirement_value: 3, is_active: true },
]

async function seed() {
  console.log('🔄 Bat dau seed du lieu...')

  const { data: existing } = await supabase.from('daily_quests').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('✅ daily_quests da co du lieu, bo qua')
    return
  }

  const { error } = await supabase.from('daily_quests').insert(QUESTS)
  if (error) {
    console.log('❌ Loi:', error.message)
  } else {
    console.log('✅ Da them ' + QUESTS.length + ' nhiem vu hang ngay')
  }
}

seed().catch(console.error)
