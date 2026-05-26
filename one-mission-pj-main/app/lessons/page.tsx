import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Book, Play, CheckCircle, Clock, Star, ArrowRight, Layers, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default async function LessonsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: true })

  // Fetch progress for current user
  const { data: progressList } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)

  const getProgress = (lessonId: string) => {
    return progressList?.find(p => p.lesson_id === lessonId)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6 md:p-12 lg:p-20">
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/student" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Khám phá <span className="text-[#00d2a0]">Kiến thức</span>
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Học tập từ những chuyên gia hàng đầu về phần cứng máy tính. Hệ thống bài giảng được thiết kế trực quan, sinh động.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#16213e] p-4 rounded-2xl border border-[#1e293b]">
          <div className="w-12 h-12 rounded-xl bg-[#00d2a0]/20 text-[#00d2a0] flex items-center justify-center">
             <Layers size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Tiến độ tổng quát</div>
            <div className="text-xl font-bold">{progressList?.length || 0} / {lessons?.length || 0} Bài học</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons?.map((lesson) => {
          const progress = getProgress(lesson.id)
          const isCompleted = progress?.is_completed

          return (
            <Link 
              key={lesson.id} 
              href={`/lessons/${lesson.id}`}
              className="group relative bg-[#16213e] rounded-3xl border border-[#1e293b] overflow-hidden hover:border-[#00d2a0] transition-all hover:shadow-[0_0_30px_rgba(0,210,160,0.1)] flex flex-col h-full"
            >
              {/* Cover Image Placeholder or Real Image */}
              <div className="aspect-video w-full bg-[#0f0f1a] relative overflow-hidden">
                <img 
                  src={lesson.thumbnail_url || "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1074&auto=format&fit=crop"} 
                  alt={lesson.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] to-transparent"></div>
                
                {isCompleted && (
                  <div className="absolute top-4 right-4 bg-[#00d2a0] text-black p-2 rounded-full shadow-lg">
                    <CheckCircle size={20} />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                   <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                     <Clock size={12} className="text-[#00b4d8]" />
                     15 phút
                   </div>
                   <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                     <Star size={12} className="text-yellow-400" />
                     4.9
                   </div>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#00d2a0] transition-colors leading-tight">
                  {lesson.title}
                </h3>
                <p className="text-slate-400 text-sm mb-8 line-clamp-2 flex-1">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-[#1e293b]">
                  <div className="flex items-center gap-2 text-[#00d2a0] font-bold text-sm">
                    {isCompleted ? 'XEM LẠI' : 'BẮT ĐẦU HỌC'}
                    <ArrowRight size={16} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Hơn 2.4k học viên
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {/* Empty state or Add more (if teacher) */}
        {(!lessons || lessons.length === 0) && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-[#1e293b] rounded-3xl">
             <Book size={48} className="mx-auto text-slate-700 mb-4" />
             <p className="text-slate-500 font-medium">Chưa có bài học nào được đăng tải.</p>
           </div>
        )}
      </div>
    </div>
  )
}
