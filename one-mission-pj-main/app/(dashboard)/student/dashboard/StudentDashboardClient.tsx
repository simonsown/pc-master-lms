'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

type UserProps = {
  id: string
  email: string
  role: string
  full_name: string
  student_code?: string
}

type ProgressStats = {
  completedLessons: number
  startedLessons: number
  totalHours: number
  averageScore: number | null
  streakDays: number
}

type ChartPoint = {
  day: string
  minutes: number
}

type InProgressLesson = {
  lesson_id: string
  status: string | null
  completion_percentage: number | null
  last_accessed: string | null
  lessons?: {
    title: string | null
    thumbnail_url: string | null
  } | null
}

type Achievement = {
  id: string
  title: string
  icon: string
  description: string
}

type DailyQuiz = {
  id: string
  title: string
  description: string | null
  time_limit_minutes: number | null
}

type DailyAttempt = {
  id: string
  score: number | null
  status: string | null
  submitted_at: string | null
}

type Props = {
  user: UserProps
  greeting: string
  formattedDate: string
  stats: ProgressStats
  progressPercent: number
  chartData: ChartPoint[]
  inProgressLesson: InProgressLesson | null
  recentAchievements: Achievement[]
  dailyQuiz: DailyQuiz | null
  dailyAttempt: DailyAttempt | null
}

const BAR_FILL = '#00d4aa'

function formatMinutes(value: number) {
  return `${value} phút`
}

export function StudentDashboardClient({
  user,
  greeting,
  formattedDate,
  stats,
  progressPercent,
  chartData,
  inProgressLesson,
  recentAchievements,
  dailyQuiz,
  dailyAttempt
}: Props) {
  const thumbnailUrl = inProgressLesson?.lessons?.thumbnail_url ?? '/lesson-summary.png'
  const lessonTitle = inProgressLesson?.lessons?.title ?? 'Chưa có bài học dở'
  const progressValue = Math.max(0, Math.min(progressPercent, 100))
  const percentageLabel = `${progressValue}%`

  const dailyQuizCompleted = dailyAttempt?.status === 'submitted'

  return (
    <div className="min-h-screen bg-[#080910] text-[#d8dbe8] p-6 md:p-8 lg:p-10">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <section className="grid gap-4 md:grid-cols-[1.6fr_1fr] items-end">
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-8">
            <p className="text-sm uppercase tracking-[0.18em] text-[#00d4aa] font-semibold">Bảng điều khiển học sinh</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">Chào buổi {greeting}, {user.full_name.split(' ').at(-1)}</h1>
            <p className="mt-2 text-sm text-[#5a5d72]">Hôm nay là {formattedDate} · Streak: {stats.streakDays} ngày 🔥</p>
          </div>
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-8">
            <div className="text-sm text-[#5a5d72] uppercase tracking-[0.18em] mb-2">Tổng tiến trình</div>
            <div className="flex items-end gap-4">
              <div className="text-5xl font-bold text-[#00d4aa]">{percentageLabel}</div>
              <div className="text-sm text-[#d8dbe8]">Hoàn thành lộ trình</div>
            </div>
            <p className="mt-4 text-sm text-[#5a5d72]">Dựa trên bài học đã hoàn thành trong toàn bộ lộ trình.</p>
          </div>
        </section>

        {/* Daily Quiz Card */}
        {dailyQuiz && (
          <section>
            <div className="rounded-3xl border border-[#1d1f2a] bg-gradient-to-br from-[#0f1018] to-[#11141d] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 text-2xl shrink-0">
                    {dailyQuizCompleted ? '✅' : '📝'}
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[#f59e0b] font-semibold">
                      {dailyQuizCompleted ? 'Đã hoàn thành' : 'Thử thách hằng ngày'}
                    </div>
                    <div className="mt-1 text-xl font-bold text-[#d8dbe8]">{dailyQuiz.title}</div>
                    <p className="mt-1 text-sm text-[#5a5d72]">
                      {dailyQuizCompleted
                        ? `Bạn đạt ${dailyAttempt?.score?.toFixed(1) ?? 0}% · Hoàn thành lúc ${dailyAttempt?.submitted_at ? new Date(dailyAttempt.submitted_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}`
                        : `${dailyQuiz.description ?? '5 câu hỏi nhanh để ôn tập kiến thức.'} · ⏱ ${dailyQuiz.time_limit_minutes ?? 10} phút`}
                    </p>
                  </div>
                </div>
                {dailyQuizCompleted ? (
                  <div className="text-sm text-[#5a5d72] flex items-center gap-2 shrink-0">
                    <span>Điểm: {dailyAttempt?.score?.toFixed(0) ?? 0}%</span>
                  </div>
                ) : (
                  <Link
                    href={`/daily-quiz/${dailyQuiz.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#080910] transition hover:bg-[#d48a0a] shrink-0"
                  >
                    Làm ngay →
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a5d72]">Bài đã hoàn thành</div>
            <div className="mt-4 text-3xl font-bold text-[#d8dbe8]">{stats.completedLessons} / {stats.startedLessons}</div>
            <div className="mt-3 text-sm text-[#5a5d72]">Tổng số bài đã bắt đầu</div>
          </div>
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a5d72]">Tổng giờ học</div>
            <div className="mt-4 text-3xl font-bold text-[#d8dbe8]">{stats.totalHours.toFixed(1)}</div>
            <div className="mt-3 text-sm text-[#5a5d72]">Giờ học tích lũy</div>
          </div>
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a5d72]">Điểm TB quiz</div>
            <div className="mt-4 text-3xl font-bold text-[#d8dbe8]">{stats.averageScore !== null ? `${stats.averageScore}` : '—'}</div>
            <div className="mt-3 text-sm text-[#5a5d72]">Chỉ hiển thị khi có điểm</div>
          </div>
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5a5d72]">Streak</div>
            <div className="mt-4 text-3xl font-bold text-[#d8dbe8]">{stats.streakDays}</div>
            <div className="mt-3 text-sm text-[#5a5d72]">Ngày liên tiếp có hoạt động</div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr_1.2fr]">
          <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-[#5a5d72]">Tiến độ lộ trình</div>
                <div className="mt-2 text-xl font-semibold text-[#d8dbe8]">Theo dõi mức độ hoàn thành tổng quát</div>
              </div>
              <div className="rounded-full border border-[#00d4aa]/20 px-3 py-1 text-sm text-[#00d4aa]">{percentageLabel}</div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={18}
                  data={[{ name: 'Hoàn thành', value: progressValue, fill: BAR_FILL }]}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={999} background />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="recharts-text recharts-label text-lg font-semibold" fill="#d8dbe8">
                    {percentageLabel}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] overflow-hidden">
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-[#5a5d72]">Tiếp tục học</div>
                  <div className="mt-2 text-xl font-semibold text-[#d8dbe8]">{lessonTitle}</div>
                </div>
                <Link href={inProgressLesson ? `/lessons/${inProgressLesson.lesson_id}` : '/lessons'} className="inline-flex items-center justify-center rounded-full bg-[#00d4aa] px-5 py-3 text-sm font-semibold text-[#080910] transition hover:bg-[#00b89c]">
                  Tiếp tục →
                </Link>
              </div>
              <div className="border-t border-[#1d1f2a] p-6 space-y-4">
                <div className="relative h-48 overflow-hidden rounded-3xl bg-[#11141d]">
                  <Image
                    src={thumbnailUrl}
                    alt={lessonTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#11141d]">
                    <div className="h-full rounded-full bg-[#00d4aa]" style={{ width: `${inProgressLesson?.completion_percentage ?? 0}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#5a5d72]">
                    <span>{inProgressLesson ? `${Math.round(inProgressLesson.completion_percentage ?? 0)}% hoàn thành` : 'Chưa có bài học dở'}</span>
                    <span>{inProgressLesson ? 'Đang tiếp tục' : 'Bắt đầu hành trình'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-[#5a5d72] mb-4">Thành tích gần nhất</div>
              {recentAchievements.length > 0 ? (
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 rounded-3xl border border-[#1d1f2a] bg-[#11151f] p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00d4aa]/10 text-2xl">
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-[#d8dbe8]">{achievement.title}</div>
                        <p className="text-sm text-[#5a5d72]">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#1d1f2a] bg-[#11151f] p-6 text-center text-sm text-[#5a5d72]">
                  Hoàn thành bài học để nhận huy hiệu đầu tiên.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-[#5a5d72]">Hoạt động 7 ngày</div>
              <div className="mt-2 text-xl font-semibold text-[#d8dbe8]">Thời gian học mỗi ngày</div>
            </div>
            <div className="text-sm text-[#5a5d72]">Dữ liệu dựa trên lần truy cập mới nhất.</div>
          </div>
          <div className="mt-6 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1d1f2a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#5a5d72', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a5d72', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={formatMinutes} cursor={{ fill: 'rgba(0, 212, 170, 0.08)' }} contentStyle={{ background: '#0b0d12', borderColor: '#1d1f2a', color: '#d8dbe8' }} />
                <Bar dataKey="minutes" radius={[12, 12, 0, 0]} fill={BAR_FILL}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_FILL} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}
