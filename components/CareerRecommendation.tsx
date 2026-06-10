'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { Compass, ExternalLink, Youtube, Sparkles, Cpu, Monitor, Server, Wrench, Gamepad2, BarChart3 } from 'lucide-react'

const CAREERS = [
  {
    id: 'software-engineer',
    title: 'Kỹ sư phần mềm',
    title_en: 'Software Engineer',
    icon: Monitor,
    color: '#6366f1',
    avgSalary: '30-80 triệu/tháng',
    description: 'Phát triển ứng dụng, website, AI và các giải pháp công nghệ thông tin.',
    relatedTopics: ['Kiến Trúc CPU & Tập Lệnh', 'AI & Công Nghệ Mới', 'Mạng Máy Tính & Kết Nối'],
    matchTopics: ['quiz-cpu-arch', 'quiz-ai-tech', 'quiz-network', 'quiz-bios', 'quiz-benchmark'],
    youtubeLinks: [
      { title: 'Cách trở thành Software Engineer', url: 'https://www.youtube.com/results?search_query=how+to+become+software+engineer+2025' },
      { title: 'Lộ trình học lập trình', url: 'https://www.youtube.com/results?search_query=lo+trinh+hoc+lap+trinh+web' },
    ]
  },
  {
    id: 'hardware-engineer',
    title: 'Kỹ sư phần cứng',
    title_en: 'Hardware Engineer',
    icon: Cpu,
    color: '#00d4aa',
    avgSalary: '25-60 triệu/tháng',
    description: 'Thiết kế, lắp ráp và tối ưu hệ thống máy tính, vi xử lý và linh kiện.',
    relatedTopics: ['Quy Trình Lắp Ráp PC', 'Ép Xung & Tuning', 'Hệ Thống Tản Nhiệt Nâng Cao', 'Xử Lý Sự Cố & Chẩn Đoán'],
    matchTopics: ['quiz-assembly', 'quiz-overclocking', 'quiz-cooling-advanced', 'quiz-troubleshoot', 'quiz-psu-cooling'],
    youtubeLinks: [
      { title: 'PC Building Guide 2025', url: 'https://www.youtube.com/results?search_query=pc+building+guide+2025' },
      { title: 'Hướng dẫn lắp ráp PC', url: 'https://www.youtube.com/results?search_query=huong+dan+lap+rap+pc+can+ban' },
    ]
  },
  {
    id: 'system-engineer',
    title: 'Kỹ sư hệ thống',
    title_en: 'System Engineer',
    icon: Server,
    color: '#289cf9',
    avgSalary: '35-70 triệu/tháng',
    description: 'Quản trị và vận hành hệ thống máy chủ, mạng và cơ sở hạ tầng CNTT.',
    relatedTopics: ['Máy Chủ & Workstation', 'BIOS & UEFI', 'Mạng Máy Tính & Kết Nối'],
    matchTopics: ['quiz-server', 'quiz-bios', 'quiz-network', 'quiz-troubleshoot'],
    youtubeLinks: [
      { title: 'Học quản trị hệ thống', url: 'https://www.youtube.com/results?search_query=he+thong+server+va+quan+tri' },
      { title: 'System Engineer Career', url: 'https://www.youtube.com/results?search_query=system+engineer+career+guide' },
    ]
  },
  {
    id: 'game-developer',
    title: 'Nhà phát triển game',
    title_en: 'Game Developer',
    icon: Gamepad2,
    color: '#ef4444',
    avgSalary: '25-70 triệu/tháng',
    description: 'Thiết kế và lập trình game, tối ưu đồ họa và hiệu năng chơi game.',
    relatedTopics: ['Card Đồ Họa & Xử Lý Đồ Họa', 'Cấu Hình PC Gaming', 'Thực Tế Ảo (VR) & AR'],
    matchTopics: ['quiz-gpu-advanced', 'quiz-pc-gaming', 'quiz-vr-ar', 'quiz-monitor', 'quiz-benchmark'],
    youtubeLinks: [
      { title: 'Học làm game từ A-Z', url: 'https://www.youtube.com/results?search_query=huong+dan+lam+game+unity' },
      { title: 'Game Developer Roadmap', url: 'https://www.youtube.com/results?search_query=game+developer+roadmap+2025' },
    ]
  },
  {
    id: 'tech-support',
    title: 'Chuyên viên kỹ thuật',
    title_en: 'Technical Support Specialist',
    icon: Wrench,
    color: '#f59e0b',
    avgSalary: '15-35 triệu/tháng',
    description: 'Hỗ trợ kỹ thuật, sửa chữa và bảo trì hệ thống máy tính cho người dùng.',
    relatedTopics: ['Xử Lý Sự Cố & Chẩn Đoán', 'Thiết Bị Ngoại Vi', 'Cáp Kết Nối & Đấu Nối', 'Laptop & Linh Kiện Di Động'],
    matchTopics: ['quiz-troubleshoot', 'quiz-peripheral', 'quiz-cable', 'quiz-laptop', 'quiz-bios'],
    youtubeLinks: [
      { title: 'Kỹ năng sửa máy tính', url: 'https://www.youtube.com/results?search_query=ky+nang+sua+chua+may+tinh' },
      { title: 'IT Support Guide', url: 'https://www.youtube.com/results?search_query=it+support+specialist+guide' },
    ]
  },
]

export default function CareerRecommendation({ lang = 'vn' }) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [realtimeKey, setRealtimeKey] = useState(0)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchScores()
  }, [realtimeKey])

  useEffect(() => {
    const channel = supabase
      .channel('career_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_attempts' }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && (payload.new as any).user_id === user.id) {
          setRealtimeKey(k => k + 1)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchScores() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, total_questions')
        .eq('user_id', user.id)

      const scoreMap: Record<string, number> = {}
      attempts?.forEach(a => {
        if (a.total_questions > 0) {
          const pct = Math.round((a.score / (a.total_questions * 10)) * 100)
          scoreMap[a.quiz_id] = Math.max(pct, scoreMap[a.quiz_id] || 0)
        } else if (a.score > 0) {
          scoreMap[a.quiz_id] = Math.min(a.score, 100)
        }
      })
      setScores(scoreMap)
    } catch (err) {
      console.error('Error fetching quiz scores:', err)
    } finally {
      setLoading(false)
    }
  }

  const rankings = useMemo(() => {
    return CAREERS.map(career => {
      const topicScores = career.matchTopics.map(topicId => scores[topicId] || 0)
      const completed = topicScores.filter(s => s > 0).length
      const avgScore = topicScores.length > 0
        ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length)
        : 0
      const matchPercent = completed > 0
        ? Math.round((completed / career.matchTopics.length) * 100)
        : 0
      return { ...career, avgScore, matchPercent, completed }
    }).sort((a, b) => b.avgScore - a.avgScore || b.matchPercent - a.matchPercent)
  }, [scores])

  const topCareer = rankings[0]

  if (loading) return null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="lms-card" style={{ padding: '28px', borderRadius: '16px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Compass size={20} color="#6366f1" />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {lang === 'vn' ? 'Định hướng nghề nghiệp' : 'Career Path'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {lang === 'vn' ? 'Dựa trên kết quả bài quiz của bạn' : 'Based on your quiz results'}
          </p>
        </div>
      </div>

      {topCareer && topCareer.avgScore > 0 ? (
        <>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            style={{ background: `linear-gradient(135deg, ${topCareer.color}15, ${topCareer.color}05)`, border: `1px solid ${topCareer.color}30`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${topCareer.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <topCareer.icon size={28} color={topCareer.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {lang === 'vn' ? topCareer.title : topCareer.title_en}
                  </h3>
                  <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '100px', background: `${topCareer.color}20`, color: topCareer.color, fontWeight: 700 }}>
                    {topCareer.avgScore}% phù hợp
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0', lineHeight: 1.5 }}>
                  {topCareer.description}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600 }}>Mức lương:</span> {topCareer.avgSalary}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {lang === 'vn' ? '📚 Kiến thức liên quan:' : '📚 Related knowledge:'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {topCareer.relatedTopics.map(topic => (
                  <span key={topic} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Youtube size={14} color="#ff0000" />
                {lang === 'vn' ? 'Video gợi ý:' : 'Suggested videos:'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topCareer.youtubeLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '12px', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = '#ff0000' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}>
                    <Youtube size={14} color="#ff0000" />
                    <span style={{ flex: 1 }}>{link.title}</span>
                    <ExternalLink size={12} style={{ opacity: 0.5 }} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              {lang === 'vn' ? 'Các nghề nghiệp khác phù hợp với bạn:' : 'Other careers that match you:'}
            </div>
            {rankings.slice(1, 4).map((career, i) => (
              <motion.div key={career.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${career.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <career.icon size={18} color={career.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lang === 'vn' ? career.title : career.title_en}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>{career.avgScore}% phù hợp</span>
                    <span>·</span>
                    <span>{career.avgSalary}</span>
                  </div>
                </div>
                <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border-subtle)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${career.avgScore}%`, height: '100%', background: career.color, borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--border-default)', borderRadius: '12px' }}>
          <BarChart3 size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            {lang === 'vn'
              ? 'Hoàn thành các bài quiz để nhận định hướng nghề nghiệp phù hợp với bạn!'
              : 'Complete quizzes to get your personalized career recommendation!'}
          </p>
        </div>
      )}
    </motion.div>
  )
}
