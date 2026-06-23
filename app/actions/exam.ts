'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'

async function getAuthUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function getTeacherExams() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const { data: exams } = await supabase
    .from('quizzes')
    .select(`
      *,
      classes!left (name, code),
      lessons!left (title),
      quiz_attempts!left (id, score, student_id, status)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (!exams) return []

  return exams.map((e: any) => {
    const total = e.quiz_attempts?.length || 0
    const done = e.quiz_attempts?.filter((a: any) => a.status !== 'in_progress')?.length || 0
    const avgScore = done > 0
      ? Math.round(e.quiz_attempts.filter((a: any) => a.status !== 'in_progress').reduce((s: number, a: any) => s + (a.score || 0), 0) / done * 100) / 100
      : 0
    return { ...e, _stats: { total, done, avgScore } }
  })
}

export async function getTeacherExam(examId: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const { data: exam } = await supabase
    .from('quizzes')
    .select(`
      *,
      classes!left (name, code),
      lessons!left (title)
    `)
    .eq('id', examId)
    .eq('teacher_id', user.id)
    .single()

  if (!exam) throw new Error('Không tìm thấy đề thi')

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select(`
      order,
      questions!inner (
        id, content, type, points, difficulty, explanation,
        question_options (id, content, is_correct, "order")
      )
    `)
    .eq('quiz_id', examId)
    .order('order')

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      profiles!inner (id, full_name, email),
      quiz_answers (id, question_id, selected_option_ids, is_correct, points_earned)
    `)
    .eq('quiz_id', examId)
    .order('started_at', { ascending: false })

  return { ...exam, questions: questions?.map((q: any) => q.questions) || [], attempts: attempts || [] }
}

export async function createExam(data: {
  title: string
  description: string
  classId: string
  lessonId?: string
  timeLimitMinutes: number
  passingScore: number
  maxAttempts: number
  availableFrom?: string
  availableUntil?: string
  requireCamera?: boolean
}) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const { data: exam, error } = await supabase
    .from('quizzes')
    .insert({
      teacher_id: user.id,
      title: data.title,
      description: data.description,
      class_id: data.classId,
      lesson_id: data.lessonId || null,
      time_limit_minutes: data.timeLimitMinutes,
      passing_score: data.passingScore,
      max_attempts: data.maxAttempts,
      available_from: data.availableFrom || null,
      available_until: data.availableUntil || null,
      is_published: false
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/teacher/exams')
  return exam
}

export async function updateExam(examId: string, data: {
  title?: string
  description?: string
  timeLimitMinutes?: number
  passingScore?: number
  maxAttempts?: number
  availableFrom?: string
  availableUntil?: string
}) {
  const supabase = await createClient()
  await getAuthUser(supabase)

  const { error } = await supabase
    .from('quizzes')
    .update(data)
    .eq('id', examId)

  if (error) throw error
  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function deleteExam(examId: string) {
  const supabase = await createClient()
  await getAuthUser(supabase)

  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', examId)

  if (error) throw error
  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function publishExam(examId: string, publish: boolean) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const { data: exam } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', examId)
    .single()

  if (!exam) throw new Error('Không tìm thấy đề thi')

  const { error } = await supabase
    .from('quizzes')
    .update({ is_published: publish })
    .eq('id', examId)

  if (error) throw error

  if (publish && exam.class_id) {
    const { data: members } = await supabase
      .from('class_members')
      .select('student_id')
      .eq('class_id', exam.class_id)

    if (members && members.length > 0) {
      const notifications = members.map((m: any) => ({
        user_id: m.student_id,
        type: 'exam_published',
        title: `Đề thi mới: ${exam.title}`,
        body: `${exam.description || 'Một đề thi mới đã được mở.'} · ${exam.time_limit_minutes || 45} phút · Mở đến ${exam.available_until ? new Date(exam.available_until).toLocaleDateString('vi-VN') : 'không giới hạn'}`,
        action_url: `/student/quiz/${exam.id}`,
        data: { quizId: exam.id }
      }))
      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function addQuestionToExam(data: {
  examId: string
  content: string
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank'
  points: number
  difficulty?: string
  explanation?: string
  options: { content: string; isCorrect: boolean }[]
}) {
  const supabase = await createClient()
  await getAuthUser(supabase)

  const { data: question, error: qErr } = await supabase
    .from('questions')
    .insert({
      content: data.content,
      type: data.type,
      points: data.points,
      difficulty: data.difficulty || 'medium',
      explanation: data.explanation || null
    })
    .select()
    .single()

  if (qErr || !question) throw qErr

  if (data.options && data.options.length > 0) {
    const optionRows = data.options.map((opt: any, i: number) => ({
      question_id: question.id,
      content: opt.content,
      is_correct: opt.isCorrect,
      order: i
    }))
    const { error: optErr } = await supabase.from('question_options').insert(optionRows)
    if (optErr) throw optErr
  }

  const { error: linkErr } = await supabase
    .from('quiz_questions')
    .insert({ quiz_id: data.examId, question_id: question.id, order: 0 })

  if (linkErr) throw linkErr
  revalidatePath('/teacher/exams')
  return question
}

export async function removeQuestionFromExam(questionId: string) {
  const supabase = await createClient()
  await getAuthUser(supabase)
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw error
  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function getExamRealtimeStats(examId: string) {
  const supabase = await createClient()
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select(`
      id, student_id, score, max_score, status, started_at, submitted_at,
      profiles!inner (full_name, email),
      quiz_answers (question_id, is_correct, points_earned)
    `)
    .eq('quiz_id', examId)
    .order('started_at', { ascending: false })

  return attempts || []
}
