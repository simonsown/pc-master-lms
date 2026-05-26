import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, FileText, Image as ImageIcon, FileSearch, CheckCircle, Clock } from 'lucide-react'
import LessonViewer from './LessonViewer'

export default async function StudentLessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    redirect('/student/lessons')
  }

  const { data: sections } = await supabase
    .from('lesson_sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true })

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  return (
    <div>
      <Link
        href="/student/lessons"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} />
        Quay lại danh sách bài giảng
      </Link>

      <LessonViewer
        lesson={lesson}
        sections={sections || []}
        initialProgress={progress}
        userId={user.id}
      />
    </div>
  )
}
