import { SupabaseClient } from '@supabase/supabase-js'

export interface ProgressStats {
  completed: number
  total: number
  totalSeconds: number
  avgScore: number
  streak: number
}

export interface DailyProgress {
  date: string
  count: number
  minutes: number
}

export interface LessonProgress {
  id: string
  lesson_id: string
  lesson_title: string
  type: string
  status: string
  score: number | null
  completed_at: string | null
  completion_percentage: number
}

export interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  passing_score: number
  max_score: number
  total_questions: number
  correct_count: number
  submitted_at: string | null
  status: string
}

export interface BuilderActivity {
  date: string
  minutes: number
}

export async function getProgressStats(supabase: SupabaseClient, userId: string): Promise<ProgressStats> {
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('status, time_spent_seconds')
    .eq('student_id', userId)

  const completed = progressData?.filter(r => r.status === 'completed').length ?? 0
  const total = progressData?.length ?? 0
  const totalSeconds = progressData?.reduce((sum, r) => sum + (r.time_spent_seconds ?? 0), 0) ?? 0

  const { data: quizData } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('student_id', userId)
    .in('status', ['graded', 'passed', 'failed', 'submitted'])

  const avgScore = quizData && quizData.length > 0
    ? Math.round(quizData.reduce((s, r) => s + r.score, 0) / quizData.length)
    : 0

  const streak = await getStreak(supabase, userId)

  return { completed, total, totalSeconds, avgScore, streak }
}

export async function getStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('last_accessed')
    .eq('student_id', userId)
    .order('last_accessed', { ascending: false })

  if (!data || data.length === 0) return 0

  const uniqueDates = Array.from(new Set(data.map(d => {
      const date = d.last_accessed ? new Date(d.last_accessed) : new Date()
      return date.toISOString().split('T')[0]
  }))).sort().reverse()

  if (uniqueDates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let checkDate = new Date(today)
  
  const firstDateStr = uniqueDates[0]
  const firstDate = new Date(firstDateStr)
  firstDate.setHours(0,0,0,0)

  const diffStart = (today.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
  if (diffStart > 1) return 0 

  if (diffStart === 0 || diffStart === 1) {
    checkDate = firstDate
  }

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    
    if (d.getTime() === checkDate.getTime()) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (d.getTime() < checkDate.getTime()) {
      break
    }
  }

  return streak
}

export async function getDailyProgress(supabase: SupabaseClient, userId: string, days: number): Promise<DailyProgress[]> {
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('last_accessed, time_spent_seconds')
    .eq('student_id', userId)
    .not('last_accessed', 'is', null)

  const { data: builderData } = await supabase
    .from('builder_sessions')
    .select('started_at, ended_at')
    .eq('student_id', userId)

  const counts: Record<string, { count: number; minutes: number }> = {}
  
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`
    counts[formatted] = { count: 0, minutes: 0 }
  }

  progressData?.forEach(row => {
    if (row.last_accessed) {
      const d = new Date(row.last_accessed)
      const formatted = `${d.getDate()}/${d.getMonth() + 1}`
      if (counts[formatted]) {
        counts[formatted].count += 1
        counts[formatted].minutes += Math.round((row.time_spent_seconds ?? 0) / 60)
      }
    }
  })

  builderData?.forEach(row => {
    if (row.started_at && row.ended_at) {
      const d = new Date(row.started_at)
      const formatted = `${d.getDate()}/${d.getMonth() + 1}`
      if (counts[formatted]) {
        const minutes = Math.round((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 60000)
        counts[formatted].minutes += minutes
      }
    }
  })

  return Object.keys(counts).map(date => ({ date, count: counts[date].count, minutes: counts[date].minutes }))
}

export async function getAllLessonProgress(supabase: SupabaseClient, userId: string): Promise<LessonProgress[]> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('id, lesson_id, status, score, completed_at, completion_percentage, last_accessed, lessons(title)')
    .eq('student_id', userId)
    .order('last_accessed', { ascending: false })

  return (data || []).map(row => ({
    id: row.id,
    lesson_id: row.lesson_id,
    lesson_title: (row as any).lessons?.title || `Bài học`,
    type: (row as any).lessons?.title ? 'Lý thuyết' : 'Bài học',
    status: row.status,
    score: row.score,
    completed_at: row.completed_at,
    completion_percentage: row.completion_percentage ?? 0
  }))
}

export async function getAllQuizAttempts(supabase: SupabaseClient, userId: string): Promise<QuizAttempt[]> {
  const { data } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, score, max_score, status, submitted_at, created_at, quizzes(title, passing_score)')
    .eq('student_id', userId)
    .in('status', ['graded', 'passed', 'failed', 'submitted'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (data || []).map((row: any) => ({
    id: row.id,
    quiz_title: row.quizzes?.title || 'Bài kiểm tra',
    score: row.score,
    passing_score: row.quizzes?.passing_score || 70,
    max_score: row.max_score || 100,
    total_questions: 0,
    correct_count: 0,
    submitted_at: row.submitted_at,
    status: row.status
  }))
}

export async function getBuilderActivity(supabase: SupabaseClient, userId: string, days: number): Promise<BuilderActivity[]> {
  const { data } = await supabase
    .from('builder_sessions')
    .select('started_at, ended_at')
    .eq('student_id', userId)

  const counts: Record<string, number> = {}
  
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const formatted = d.toISOString().split('T')[0]
    counts[formatted] = 0
  }

  data?.forEach(row => {
    if (row.started_at && row.ended_at) {
      const d = new Date(row.started_at)
      const formatted = d.toISOString().split('T')[0]
      if (counts[formatted] !== undefined) {
        const start = new Date(row.started_at).getTime()
        const end = new Date(row.ended_at).getTime()
        const minutes = Math.floor((end - start) / 60000)
        counts[formatted] += minutes
      }
    }
  })

  return Object.keys(counts).map(date => ({ date, minutes: counts[date] }))
}
