import React, { Suspense } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ProgressView from '@/components/progress/ProgressView'
import { getProgressStats, getDailyProgress, getAllLessonProgress, getAllQuizAttempts, getBuilderActivity } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8" style={{ color: 'var(--text-primary)' }}>Vui lòng đăng nhập.</div>

  const [stats, dailyProgress, lessons, quizResults, builderActivity] = await Promise.all([
    getProgressStats(supabase, user.id),
    getDailyProgress(supabase, user.id, 30),
    getAllLessonProgress(supabase, user.id),
    getAllQuizAttempts(supabase, user.id),
    getBuilderActivity(supabase, user.id, 90), // 3 tháng cho heatmap
  ])

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      {/* High-tech overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[100px] pointer-events-none" style={{ background: 'var(--brand-primary)', opacity: 0.05 }} />

      <ProgressView data={{ stats, dailyProgress, lessons, quizResults, builderActivity }} />
    </div>
  )
}
