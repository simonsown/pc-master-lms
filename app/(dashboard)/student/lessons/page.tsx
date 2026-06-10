import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import LessonsList from './LessonsList'

export const dynamic = 'force-dynamic'

export default async function StudentLessonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { data: progressList } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)

  return (
    <LessonsList
      initialLessons={lessons || []}
      initialProgress={progressList || []}
      userId={user.id}
    />
  )
}
