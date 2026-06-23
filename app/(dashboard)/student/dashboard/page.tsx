import { createClient } from '@/lib/supabase-ssr-server'
import { requireRole } from '@/lib/auth/rbac'

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

  const [progressRes, quizRes, lessonsCountRes] = await Promise.all([
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
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
  ])

  if (progressRes.error || quizRes.error || lessonsCountRes.error) {
    console.error('Student dashboard fetch error', {
      progressError: progressRes.error,
      quizError: quizRes.error,
      lessonsCountError: lessonsCountRes.error,
    })
  }

  const progress = (progressRes.data ?? []) as unknown as LessonProgressRow[]
  const quizzes = quizRes.data ?? []
  const totalLessonsCount = lessonsCountRes.count ?? 0

  const completedLessons = progress.filter((item) => item.status === 'completed').length
  const startedLessons = progress.length
  const totalMinutes = Math.round(progress.reduce((sum, item) => sum + (item.time_spent_seconds ?? 0), 0) / 60)
  const averageScore = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, item) => sum + (item.score ?? 0), 0) / quizzes.length) : null
  const streakDays = calculateStreak(progress)
  const chartData = buildChartData(progress)

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
      chartData={chartData}
    />
  )
}
