import { createServiceClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  try {
    // Vercel Cron sends CRON_SECRET as Authorization: Bearer <secret>
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = createServiceClient()
    const today = new Date().toISOString().slice(0, 10)

    // Check if today's daily quiz already exists
    const { data: existing } = await supabase
      .from('quizzes')
      .select('id')
      .eq('is_daily', true)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .limit(1)

    if (existing && existing.length > 0) {
      return Response.json({ message: 'Daily quiz already exists for today', quizId: existing[0].id })
    }

    // Pick 5 random questions
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('id, type, difficulty')
      .order('created_at', { ascending: false })
      .limit(50)

    if (qErr || !questions || questions.length < 5) {
      // Not enough questions in DB — create AI-generated questions
      return Response.json({ error: 'Not enough questions in database. Please add questions first.' }, { status: 400 })
    }

    // Shuffle and pick 5
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 5)

    // Pick a teacher for teacher_id (first teacher found)
    const { data: teacher } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher')
      .limit(1)
      .single()

    const teacherId = teacher?.id || '00000000-0000-0000-0000-000000000000'

    // Create the quiz
    const { data: quiz, error: quizErr } = await supabase
      .from('quizzes')
      .insert({
        teacher_id: teacherId,
        title: `Thử thách hằng ngày - ${today}`,
        description: '5 câu hỏi trắc nghiệm nhanh mỗi ngày để ôn tập kiến thức lắp ráp PC.',
        time_limit_minutes: 10,
        passing_score: 60,
        max_attempts: 1,
        randomize_questions: true,
        randomize_options: true,
        is_published: true,
        is_daily: true,
        available_from: `${today}T00:00:00Z`,
        available_until: `${today}T23:59:59Z`,
      })
      .select('id')
      .single()

    if (quizErr || !quiz) {
      return Response.json({ error: 'Failed to create daily quiz', details: quizErr }, { status: 500 })
    }

    // Link questions
    const quizQuestions = shuffled.map((q, i) => ({
      quiz_id: quiz.id,
      question_id: q.id,
      order: i + 1,
    }))

    const { error: linkErr } = await supabase
      .from('quiz_questions')
      .insert(quizQuestions)

    if (linkErr) {
      return Response.json({ error: 'Failed to link questions', details: linkErr }, { status: 500 })
    }

    // Notify all students
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')

    if (students && students.length > 0) {
      const notifications = students.map(s => ({
        user_id: s.id,
        type: 'quiz',
        title: '📝 Thử thách hằng ngày đã sẵn sàng!',
        body: '5 câu hỏi trắc nghiệm mới đang chờ bạn. Hoàn thành hôm nay để giữ streak!',
        action_url: `/daily-quiz/${quiz.id}`,
        data: { dailyQuizId: quiz.id, date: today },
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return Response.json({
      success: true,
      quizId: quiz.id,
      questionsCount: shuffled.length,
      notifiedStudents: students?.length || 0,
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
