import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-ssr-server'
import { FULL_QUIZ_BANK } from '@/data/quiz-bank-full'
import { shuffleArray } from '@/lib/quiz-engine'

const TOPICS = Object.values(FULL_QUIZ_BANK)
const START_DATE = new Date('2026-06-01')

function getTodayTopicIndex(): number {
  const now = new Date()
  const diffMs = now.getTime() - START_DATE.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return ((diffDays % TOPICS.length) + TOPICS.length) % TOPICS.length
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  const todayIndex = getTodayTopicIndex()
  const todayTopic = TOPICS[todayIndex]

  if (!topicId) {
    let completedTopicIds: string[] = []
    if (user) {
      const { data: txs } = await supabase
        .from('xp_transactions')
        .select('reference_id')
        .eq('user_id', user.id)
        .eq('reference_type', 'daily_quiz')
      completedTopicIds = txs?.map(t => t.reference_id).filter(Boolean) || []
    }

    return NextResponse.json({
      todayIndex,
      todayTopicId: todayTopic.id,
      todayTopic,
      topics: TOPICS,
      completedTopicIds,
      isTodayCompleted: completedTopicIds.includes(todayTopic.id),
    })
  }

  const topic = TOPICS.find(t => t.id === topicId)
  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  let completed = false
  if (user) {
    const { data: existing } = await supabase
      .from('xp_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('reference_type', 'daily_quiz')
      .eq('reference_id', topicId)
      .maybeSingle()
    completed = !!existing
  }

  const questions = shuffleArray(topic.questions).slice(0, 10).map(q => ({
    id: q.id,
    text: q.text,
    question: q.text,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }))

  return NextResponse.json({
    topic,
    questions,
    completed,
    isToday: topicId === todayTopic.id,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topicId, score, total, xpEarned } = await request.json()

  if (!topicId || xpEarned === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cappedXp = Math.min(xpEarned, 50)

  const { error: txErr } = await supabase
    .from('xp_transactions')
    .insert({
      user_id: user.id,
      amount: cappedXp,
      reason: `Quiz hàng ngày: ${topicId} - ${score}/${total}`,
      reference_type: 'daily_quiz',
      reference_id: topicId,
    })
    .select('id')
    .single()

  if (txErr) {
    return NextResponse.json({ error: txErr.message }, { status: 500 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single()

  const newXp = (profile?.xp || 0) + cappedXp
  const now = new Date().toISOString()

  let newLevel = 1
  const levels = [0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000, 8000, 10000, 13000, 17000, 22000, 28000, 35000, 43000, 52000, 65000]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (newXp >= levels[i]) { newLevel = i + 1; break }
  }

  await supabase.from('profiles').update({ xp: newXp, level: newLevel, updated_at: now }).eq('id', user.id)

  await supabase.from('leaderboard_cache').upsert({
    user_id: user.id, total_xp: newXp, level: newLevel, updated_at: now,
  }, { onConflict: 'user_id' })

  await supabase.from('learning_stats').upsert({
    user_id: user.id, total_xp: newXp, updated_at: now,
  }, { onConflict: 'user_id' })

  if (newLevel > (profile?.level || 1)) {
    await supabase.from('notifications').insert({
      user_id: user.id, type: 'success', title: 'Lên Cấp!',
      body: `Chúc mừng! Bạn đã đạt cấp ${newLevel}!`,
      data: { level: newLevel },
    })
  }

  return NextResponse.json({
    success: true,
    xpAwarded: cappedXp,
    newTotalXp: newXp,
    newLevel,
  })
}
