import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Book, Play, CheckCircle, Clock, Star, ArrowRight, Layers } from 'lucide-react'

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

  const getProgress = (lessonId: string) =>
    progressList?.find(p => p.lesson_id === lessonId)

  const completedCount = progressList?.filter(p => p.is_completed)?.length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bài giảng</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Học tập theo lộ trình bài giảng có sẵn</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <Layers size={20} style={{ color: 'var(--brand-primary)' }} />
          <div>
            <div className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Tiến độ</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{completedCount}/{lessons?.length || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {lessons?.map((lesson) => {
          const progress = getProgress(lesson.id)
          const isCompleted = progress?.is_completed

          return (
            <Link
              key={lesson.id}
              href={`/student/lessons/${lesson.id}`}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="aspect-video relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                {lesson.thumbnail_url ? (
                  <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                    <Book size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent" />
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle size={18} />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock size={11} style={{ color: 'var(--brand-primary)' }} />
                    {lesson.estimated_minutes || 15} phút
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base mb-2 line-clamp-2 transition-colors group-hover:text-emerald-400" style={{ color: 'var(--text-primary)' }}>
                  {lesson.title}
                </h3>
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--brand-primary)' }}>
                    {isCompleted ? 'Xem lại' : 'Bắt đầu'} <ArrowRight size={14} />
                  </span>
                  {progress && !isCompleted && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.completion_percentage || 0}%` }} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{progress.completion_percentage || 0}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {(!lessons || lessons.length === 0) && (
          <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
            <Book size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Chưa có bài giảng nào được xuất bản.</p>
          </div>
        )}
      </div>
    </div>
  )
}
