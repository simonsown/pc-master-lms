import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Book, Play, CheckCircle, Clock, Star, ArrowRight, Layers, ArrowLeft } from 'lucide-react'
import './lessons-theme.css'

export const dynamic = 'force-dynamic'

export default async function LessonsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: myClasses } = await supabase
    .from('class_members')
    .select('class_id')
    .eq('student_id', user.id)

  const classIds = (myClasses || []).map(c => c.class_id)

  let lessonsQuery = supabase.from('lessons').select('*')

  if (classIds.length > 0) {
    const { data: assignedLessonIds } = await supabase
      .from('lesson_class_assignments')
      .select('lesson_id')
      .in('class_id', classIds)

    const lessonIds = (assignedLessonIds || []).map(a => a.lesson_id)
    if (lessonIds.length > 0) {
      lessonsQuery = lessonsQuery.in('id', lessonIds)
    } else {
      lessonsQuery = lessonsQuery.eq('id', null)
    }
  } else {
    lessonsQuery = lessonsQuery.eq('id', null)
  }

  const { data: lessons } = await lessonsQuery
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  const { data: progressList } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)

  const getProgress = (lessonId: string) => {
    return progressList?.find(p => p.lesson_id === lessonId)
  }

  return (
    <div className="lessons-page">
      <div className="lessons-container">
      <header className="lessons-header">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/student" className="lessons-back-btn">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="lessons-title">
              Khám phá <span className="lessons-title-accent">Kiến thức</span>
            </h1>
          </div>
          <p className="lessons-subtitle">
            Học tập từ những chuyên gia hàng đầu về phần cứng máy tính. Hệ thống bài giảng được thiết kế trực quan, sinh động.
          </p>
        </div>
        <div className="lessons-stats-card">
          <div className="lessons-stats-icon">
             <Layers size={24} />
          </div>
          <div>
            <div className="lessons-stats-label">Tiến độ tổng quát</div>
            <div className="lessons-stats-value">{progressList?.length || 0} / {lessons?.length || 0} Bài học</div>
          </div>
        </div>
      </header>

      <div className="lessons-grid">
        {lessons?.map((lesson) => {
          const progress = getProgress(lesson.id)
          const isCompleted = progress?.is_completed

          return (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="lessons-card"
            >
              <div className="lessons-card-cover">
                <img
                  src={lesson.thumbnail_url || "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1074&auto=format&fit=crop"}
                  alt={lesson.title}
                  className="lessons-card-img"
                />
                <div className="lessons-card-gradient"></div>

                {isCompleted && (
                  <div className="lessons-completed-badge">
                    <CheckCircle size={20} />
                  </div>
                )}

                <div className="lessons-card-meta">
                   <div className="lessons-meta-chip">
                     <Clock size={12} className="lessons-meta-icon" />
                     15 phút
                   </div>
                   <div className="lessons-meta-chip">
                     <Star size={12} className="text-yellow-400" />
                     4.9
                   </div>
                </div>
              </div>

              <div className="lessons-card-body">
                <h3 className="lessons-card-title">
                  {lesson.title}
                </h3>
                <p className="lessons-card-desc">
                  {lesson.description}
                </p>

                <div className="lessons-card-footer">
                  <div className="lessons-card-action">
                    {isCompleted ? 'XEM LẠI' : 'BẮT ĐẦU HỌC'}
                    <ArrowRight size={16} />
                  </div>
                  <div className="lessons-card-count">
                    Hơn 2.4k học viên
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {(!lessons || lessons.length === 0) && (
           <div className="lessons-empty">
             <Book size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
             <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Chưa có bài học nào được đăng tải.</p>
           </div>
        )}
      </div>
      </div>
    </div>
  )
}
