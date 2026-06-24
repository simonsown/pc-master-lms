'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  Trophy, ChevronRight, Sparkles,
  CheckCircle, Calendar, Loader2, Star, Zap, BookOpen
} from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']
const TOPIC_ICONS: Record<string, string> = {
  'cpu-arch': '🔧', 'ram-storage': '🧠', 'gpu-graphics': '🎮',
  'motherboard': '🔌', 'psu-cooling': '❄️', 'storage-devices': '💾',
  'pc-assembly': '🛠️', 'bios-uefi': '⚙️', 'network': '🌐',
  'peripherals': '🖱️', 'os-windows': '🪟', 'troubleshooting': '🩺',
  'laptop-mobile': '💻', 'monitor-display': '🖥️', 'ai-tech': '🤖',
  'overclocking': '⚡', 'benchmark': '📊', 'pc-gaming': '🎯',
  'server-workstation': '🏢', 'cable-connectivity': '🔗',
  'virtual-reality': '🥽', 'cybersecurity': '🔒',
}

interface Topic {
  id: string
  title: string
  icon?: string
  color?: string
  description?: string
  questions: any[]
}

interface ApiResponse {
  todayIndex: number
  todayTopicId: string
  todayTopic: Topic
  topics: Topic[]
  completedTopicIds: string[]
  isTodayCompleted: boolean
}

export default function DailyQuizListPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      fetchData()
    })
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/daily-quiz')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  function getDayNumber(index: number): number {
    if (!data) return index + 1
    const diff = index - data.todayIndex
    if (diff === 0) return 0
    return diff
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--brand-primary)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Đang tải thử thách hằng ngày...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ borderRadius: '24px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '32px', maxWidth: '448px', width: '100%', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchData} style={{ padding: '12px 24px', background: 'var(--border-strong)', borderRadius: '9999px', border: 'none', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
          Thử lại
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const { topics, todayIndex, todayTopicId, completedTopicIds, isTodayCompleted } = data

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: isMobile ? '24px 12px' : '32px 16px' }} className="md:py-12 md:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <BookOpen style={{ color: 'var(--brand-primary)' }} size={28} />
            <h1 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 900 }} className="md:text-4xl">Ngân Hàng Đề Thi</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '512px', margin: '0 auto' }}>
            22 chủ đề, mỗi chủ đề 10 câu hỏi. Hoàn thành để nhận XP và nâng cao kiến thức phần cứng!
          </p>
        </motion.div>

        {/* Today's Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: '24px',
            border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)',
            background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--brand-primary) 10%, transparent), color-mix(in srgb, var(--brand-primary) 5%, transparent))',
            padding: '32px', marginBottom: '40px'
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '160px', height: '160px', background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles style={{ color: 'var(--brand-primary)' }} size={18} />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--brand-primary)' }}>
                Mở khóa hôm nay
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                {data.todayTopic.icon || TOPIC_ICONS[data.todayTopic.id] || '📚'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }} className="md:text-2xl truncate">{data.todayTopic.title}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{data.todayTopic.description}</p>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isTodayCompleted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)', borderRadius: '9999px', color: 'var(--brand-primary)', fontSize: '14px', fontWeight: 600 }}>
                    <CheckCircle size={16} />
                    Đã hoàn thành
                  </div>
                ) : (
                  <button
                    onClick={() => router.push(`/daily-quiz/${todayTopicId}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--brand-primary)', color: 'var(--bg-base)', borderRadius: '9999px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Làm bài ngay
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}
        >
          <div style={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '20px', textAlign: 'center' }}>
            <Trophy style={{ margin: '0 auto 8px', color: 'var(--accent-amber)' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{completedTopicIds.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Đã hoàn thành</div>
          </div>
          <div style={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '20px', textAlign: 'center' }}>
            <Star style={{ margin: '0 auto 8px', color: 'var(--brand-primary)' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{topics.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tổng chủ đề</div>
          </div>
          <div style={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '20px', textAlign: 'center' }}>
            <Zap style={{ margin: '0 auto 8px', color: 'var(--accent-purple)' }} size={24} />
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{Math.round((completedTopicIds.length / topics.length) * 100)}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tiến độ</div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: 'var(--text-muted)' }} />
            Danh sách chủ đề
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topics.map((topic, i) => {
              const isToday = i === todayIndex
              const isPast = i < todayIndex
              const isCompleted = completedTopicIds.includes(topic.id)
              const topicNum = i + 1

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.35 }}
                >
                  <div
                    style={{
                      position: 'relative', borderRadius: '16px',
                      padding: '1px',
                      background: isToday
                        ? 'linear-gradient(135deg, var(--brand-primary), #6366f1, #a855f7)'
                        : 'transparent',
                      boxShadow: isToday ? '0 0 24px color-mix(in srgb, var(--brand-primary) 20%, transparent)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: '15px', padding: '16px 20px',
                        background: isCompleted
                          ? 'color-mix(in srgb, #22c55e 5%, var(--bg-surface))'
                          : 'var(--bg-surface)',
                        border: '1px solid',
                        borderColor: isToday
                          ? 'transparent'
                          : isCompleted
                            ? 'color-mix(in srgb, #22c55e 25%, transparent)'
                            : 'var(--border-strong)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '44px', height: '44px', borderRadius: '14px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700,
                            flexShrink: 0,
                            background: isCompleted
                              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                              : isToday
                                ? 'linear-gradient(135deg, var(--brand-primary), #6366f1, #a855f7)'
                                : 'var(--border-strong)',
                            color: isCompleted || isToday ? 'white' : 'var(--text-muted)',
                            boxShadow: isCompleted || isToday ? '0 4px 12px color-mix(in srgb, currentColor 30%, transparent)' : 'none',
                          }}
                        >
                          {isCompleted ? <CheckCircle size={22} /> : topicNum}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {topic.title}
                            </span>
                            {isToday && (
                              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'linear-gradient(135deg, var(--brand-primary), #a855f7)', color: 'white', borderRadius: '9999px', fontWeight: 600, whiteSpace: 'nowrap', lineHeight: '18px' }}>
                                Hôm nay
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {topic.description || `Chủ đề ${topicNum} với 10 câu hỏi`}
                          </p>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          {isCompleted ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#22c55e', padding: '8px 0' }}>
                              <CheckCircle size={18} />
                              Đã làm
                            </div>
                          ) : (
                            <button
                              onClick={() => router.push(`/daily-quiz/${topic.id}`)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
                                borderRadius: '9999px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: isToday ? 'linear-gradient(135deg, var(--brand-primary), #6366f1)' : 'var(--border-strong)',
                                color: isToday ? 'white' : 'var(--text-primary)',
                                boxShadow: isToday ? '0 4px 16px color-mix(in srgb, var(--brand-primary) 30%, transparent)' : 'none',
                                transition: 'all 0.2s',
                              }}
                            >
                              {isToday ? 'Làm bài' : 'Vào học'}
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
