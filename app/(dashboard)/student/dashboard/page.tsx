import { createClient } from '@/lib/supabase-ssr-server'
import { requireRole } from '@/lib/auth/rbac'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements'
import { StudentDashboardClient } from './StudentDashboardClient'

type LessonProgressRow = {
  lesson_id: string
  status: string | null
  time_spent_seconds: number | null
  completed_at: string | null
  last_accessed: string | null
  completion_percentage: number | null
  lessons?: {
    title: string | null
    thumbnail_url: string | null
  } | null
}

type QuizAttemptRow = {
  score: number | null
  submitted_at: string | null
  status: string | null
}

type StudentAchievementRow = {
  achievement_id: string
}

type ChartPoint = {
  day: string
  minutes: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'sáng'
  if (hour >= 12 && hour < 18) return 'chiều'
  return 'tối'
}

function formatDateLabel(): string {
  const now = new Date()
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric'
  }).format(now)
}

function buildChartData(progress: LessonProgressRow[]): ChartPoint[] {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(today)
    current.setDate(today.getDate() - (6 - index))
    return current.toISOString().slice(0, 10)
  })

  return days.map((day) => {
    const minutes = Math.round(
      progress
        .filter((row) => {
          if (!row.last_accessed) return false
          const accessed = new Date(row.last_accessed).toISOString().slice(0, 10)
          return accessed === day
        })
        .reduce((sum, row) => sum + (row.time_spent_seconds ?? 0), 0) / 60
    )

    return {
      day: day.slice(5).replace('-', '/'),
      minutes: Math.max(minutes, 0)
    }
  })
}

function calculateStreak(progress: LessonProgressRow[]): number {
  const uniqueDays = new Set(
    progress
      .map((row) => {
        if (!row.last_accessed) return ''
        return new Date(row.last_accessed).toISOString().slice(0, 10)
      })
      .filter(Boolean)
  )

  if (uniqueDays.size === 0) {
    return 0
  }

  let streak = 0
  const current = new Date()

  while (true) {
    const key = current.toISOString().slice(0, 10)
    if (uniqueDays.has(key)) {
      streak += 1
      current.setDate(current.getDate() - 1)
      continue
    }
    break
  }

  return streak
}

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const user = await requireRole(['student'])
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)

  const [progressRes, quizRes, inProgressRes, achievementsRes, lessonsCountRes, dailyQuizRes] = await Promise.all([
    supabase
      .from('lesson_progress')
      .select('lesson_id, status, time_spent_seconds, completed_at, last_accessed, completion_percentage, lessons(title, thumbnail_url)')
      .eq('student_id', user.id),
      supabase
        .from('quiz_attempts')
        .select('score, submitted_at, status')
        .eq('student_id', user.id)
      .in('status', ['passed', 'failed'])
      .order('submitted_at', { ascending: false })
      .limit(10),
    supabase
      .from('lesson_progress')
      .select('lesson_id, status, completion_percentage, last_accessed, lessons(title, thumbnail_url)')
      .eq('student_id', user.id)
      .is('is_completed', false)
      .order('last_accessed', { ascending: false })
      .not('is_completed', 'is', null)
      .limit(1),
    supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('quizzes')
      .select('id, title, description, time_limit_minutes')
      .eq('is_daily', true)
      .is('is_published', true)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // We'll get the daily attempt after we know the dailyQuiz id
    Promise.resolve({ data: null })
  ])

  if (progressRes.error || quizRes.error || inProgressRes.error || achievementsRes.error || lessonsCountRes.error || dailyQuizRes.error) {
    console.error('Student dashboard fetch error', {
      progressError: progressRes.error,
      quizError: quizRes.error,
      inProgressError: inProgressRes.error,
      achievementsError: achievementsRes.error,
      lessonsCountError: lessonsCountRes.error,
      dailyQuizError: dailyQuizRes.error
    })
  }

  const progress = (progressRes.data ?? []) as unknown as LessonProgressRow[]
  const quizzes = quizRes.data ?? []
  const rawInProgress = inProgressRes.data?.[0] ?? null
  const inProgressLesson = rawInProgress
    ? {
        ...rawInProgress,
        lessons: Array.isArray(rawInProgress.lessons)
          ? (rawInProgress.lessons[0] ?? null)
          : rawInProgress.lessons
      }
    : null
  const recentAchievementRows = achievementsRes.data ?? []
  const totalLessonsCount = lessonsCountRes.count ?? 0

  const completedLessons = progress.filter((item) => item.status === 'completed').length
  const startedLessons = progress.length
  const totalMinutes = Math.round(progress.reduce((sum, item) => sum + (item.time_spent_seconds ?? 0), 0) / 60)
  const averageScore = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, item) => sum + (item.score ?? 0), 0) / quizzes.length) : null
  const streakDays = calculateStreak(progress)
  const routeCompletion = totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : (startedLessons > 0 ? Math.round((completedLessons / startedLessons) * 100) : 0)
  const chartData = buildChartData(progress)

  const recentAchievements = recentAchievementRows.map((row: StudentAchievementRow) => {
    const definition = ACHIEVEMENT_DEFINITIONS.find((def) => def.id === row.achievement_id)
    return {
      id: row.achievement_id,
      title: definition?.title ?? 'Huy hiệu mới',
      icon: definition?.icon ?? '🏅',
      description: definition?.description ?? 'Đã mở khóa thành tựu mới'
    }
  })

  const dailyQuiz = dailyQuizRes.data ?? null
  // Fetch daily quiz attempt separately (depends on dailyQuiz)
  let dailyAttempt = null
  if (dailyQuiz) {
    const { data: attemptData } = await supabase
      .from('quiz_attempts')
      .select('id, score, status, submitted_at')
      .eq('quiz_id', dailyQuiz.id)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    dailyAttempt = attemptData
  }

  return (
    <StudentDashboardClient
      user={user}
      greeting={getGreeting()}
      formattedDate={formatDateLabel()}
      stats={{
        completedLessons,
        startedLessons,
        totalHours: totalMinutes / 60,
        averageScore,
        streakDays
      }}
      progressPercent={routeCompletion}
      chartData={chartData}
      inProgressLesson={inProgressLesson}
      recentAchievements={recentAchievements}
      dailyQuiz={dailyQuiz}
      dailyAttempt={dailyAttempt}
    />
  )
}
