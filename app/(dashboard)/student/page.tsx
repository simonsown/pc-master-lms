'use client';

import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Bot, Sparkles, Bell, Megaphone, ExternalLink, Trophy, Zap, Target, Clock, CheckCircle2, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JoinClassModal from '../../../components/JoinClassModal';
import CareerRecommendation from '../../../components/CareerRecommendation';
import { supabase } from '@/lib/supabase';
import { useGuru } from '@/lib/guru-state';
import { useRealtime } from '@/lib/realtime-provider';
import { createBrowserClient } from '@supabase/ssr'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } })

export default function StudentDashboard() {
  const { openChat } = useGuru()
  const { state: realtimeState } = useRealtime()
  const isMobile = useIsMobile()
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Lớp học', value: '0', icon: <Users size={20} />, color: 'var(--accent-blue)' },
    { label: 'Bài tập', value: '0', icon: <BookOpen size={20} />, color: 'var(--brand-primary)' },
    { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: '#8b5cf6' },
  ]);
  const supabaseNotif = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let currentUserId: string | null = null

    const init = async () => {
      const { data: { user } } = await supabaseNotif.auth.getUser()
      if (!user) { setNotifLoading(false); return }
      currentUserId = user.id

      const { data } = await supabaseNotif
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setNotifications(data)
      setNotifLoading(false)
    }
    init()

    const channel = supabaseNotif
      .channel('notifications_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
        const notif = payload.new as any
        if (notif.user_id === currentUserId) {
          setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev
            return [notif, ...prev].slice(0, 5)
          })
        }
      })
      .subscribe()

    return () => { supabaseNotif.removeChannel(channel) }
  }, [])

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: memberships, error: memErr } = await supabase
        .from('class_members').select(`class_id, classes:class_id (id, name, code, subject, teacher_id, profiles:teacher_id (full_name))`).eq('student_id', user.id);
      if (memErr) throw memErr;
      const joinedClasses = memberships?.map((m: any) => { const cls = m.classes; if (cls && Array.isArray(cls.profiles)) cls.profiles = cls.profiles[0]; return cls; }) || [];
      setClasses(joinedClasses);
      const classIds = joinedClasses.map((c: any) => c.id);
      let assignmentCount = 0;
      if (classIds.length > 0) { const { count } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).in('class_id', classIds).eq('is_published', true); assignmentCount = count || 0; }
      setStats([
        { label: 'Lớp học', value: joinedClasses.length.toString(), icon: <Users size={20} />, color: 'var(--accent-blue)' },
        { label: 'Bài tập', value: assignmentCount.toString(), icon: <BookOpen size={20} />, color: 'var(--brand-primary)' },
        { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: '#8b5cf6' },
      ]);
    } catch (err) { console.error('Error fetching student data:', err); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 4px' }}>
      <motion.header {...fadeUp(0)} style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.3px' }}>Xin chào! 👋</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Chào mừng bạn quay trở lại với không gian học tập PC Master.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowJoinModal(true)}
          className="lms-btn lms-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(8,158,96,0.25)' }}>
          <Plus size={18} /> Tham gia lớp học
        </motion.button>
      </motion.header>

      <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '12px' : '20px', marginBottom: isMobile ? '24px' : '36px' }}>
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4, boxShadow: '0 12px 40px var(--shadow-hover)' }}
            className="lms-card" style={{ padding: isMobile ? '16px' : '24px', display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', borderRadius: '14px', transition: 'box-shadow 0.3s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="student-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: isMobile ? '16px' : '28px' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
          <motion.div {...fadeUp(0.2)}
            className="lms-card" style={{ padding: isMobile ? '20px' : '32px', position: 'relative', overflow: 'hidden', borderRadius: '16px', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)', boxShadow: '0 8px 30px var(--shadow-color)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Phòng thực hành PC Builder</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '380px', fontSize: '14px', lineHeight: 1.6 }}>
                Tự tay lắp ráp cấu hình máy tính, kiểm tra sự tương thích và hiệu năng của linh kiện ngay lập tức.
              </p>
              <Link href="/builder" className="lms-btn lms-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 4px 16px rgba(8,158,96,0.3)' }}>
                Bắt đầu thực hành <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.06 }}>
              <Cpu size={200} color="var(--brand-primary)" />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="lms-card" style={{ padding: isMobile ? '18px' : '28px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Lớp học của tôi</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{classes.length} lớp</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Loader2 size={32} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} /></div>
            ) : classes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {classes.map((cls, idx) => (
                  <motion.div key={cls.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + idx * 0.05 }}>
                    <Link href={`/student/classes/${cls.id}`} style={{ textDecoration: 'none' }}>
                      <motion.div whileHover={{ y: -3, boxShadow: '0 12px 30px var(--shadow-hover)' }}
                        className="lms-card" style={{ padding: '20px', cursor: 'pointer', borderRadius: '12px', transition: 'box-shadow 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(40,156,249,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={18} color="var(--accent-blue)" />
                          </div>
                          <span className="lms-badge" style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px' }}>{cls.code}</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{cls.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>GV: {cls.profiles?.full_name || 'Đang cập nhật'}</p>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0', border: '2px dashed var(--border-default)', borderRadius: '14px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Bạn chưa tham gia lớp học nào.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJoinModal(true)}
                  style={{ background: 'transparent', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '10px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', transition: 'all 0.2s' }}>
                  Nhập mã lớp để tham gia
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
          <motion.div {...fadeUp(0.25)}
            className="lms-card" style={{ padding: isMobile ? '16px' : '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,212,170,0.06), transparent)', border: '1px solid rgba(0,212,170,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', lineHeight: 1 }}>{realtimeState.levelIcon}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Cấp Độ Của Bạn</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {realtimeState.levelTitle}
                  </div>
                </div>
              </div>
              <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--brand-primary), #00f3ff)', width: `${realtimeState.levelProgress}%`, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span>{realtimeState.xpInLevel} / {realtimeState.xpToNext} XP</span>
                <span style={{ color: 'var(--brand-primary)' }}>Level {realtimeState.level}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-elevated)', textAlign: 'center' }}>
                  <Flame size={18} style={{ color: '#f59e0b', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{realtimeState.streak}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Streak</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-elevated)', textAlign: 'center' }}>
                  <Zap size={18} style={{ color: 'var(--brand-primary)', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{realtimeState.xp}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tổng XP</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/student/dashboard" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'var(--brand-primary)', color: '#000', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                  📊 Chi tiết
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="lms-card" style={{ padding: isMobile ? '16px' : '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} style={{ color: '#f59e0b' }} /> Nhiệm vụ hôm nay
              </h3>
              <Link href="/student/dashboard" style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Xem tất cả →
              </Link>
            </div>
            {realtimeState.allQuests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {realtimeState.allQuests.slice(0, 4).map((quest, i) => {
                  const userQuest = realtimeState.quests.find(q => q.quest_id === quest.id)
                  const isCompleted = userQuest?.is_completed
                  const progress = userQuest?.progress || 0
                  return (
                    <motion.div key={quest.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ padding: '12px', borderRadius: '10px', background: isCompleted ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)', border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}`, opacity: isCompleted ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{quest.icon || '📌'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {quest.title}
                            {isCompleted && <CheckCircle2 size={12} style={{ color: '#10b981' }} />}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>+{quest.xp_reward} XP</div>
                          {!isCompleted && quest.requirement_value > 0 && (
                            <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', marginTop: '6px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '99px', background: 'var(--brand-primary)', width: `${Math.min(100, (progress / quest.requirement_value) * 100)}%`, transition: 'width 0.3s' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: isCompleted ? '#10b981' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {isCompleted ? 'Hoan thanh' : `+${quest.xp_reward}XP`}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'fb-1', title: 'Hoàn thành 1 bài học', xp_reward: 50, icon: '📚' },
                  { id: 'fb-2', title: 'Lắp ráp PC', xp_reward: 30, icon: '🔧' },
                  { id: 'fb-3', title: 'Làm quiz', xp_reward: 20, icon: '🧠' },
                  { id: 'fb-4', title: 'Đạt streak 3 ngày', xp_reward: 100, icon: '🔥' },
                  { id: 'fb-5', title: 'Tham gia thảo luận', xp_reward: 15, icon: '💬' },
                ].map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{q.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{q.title}</div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>+{q.xp_reward}XP</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div {...fadeUp(0.35)} className="lms-card" style={{ padding: isMobile ? '14px' : '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} style={{ color: 'var(--accent-amber)' }} /> Thông báo
              </h3>
              {notifications.some(n => !n.is_read) && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              )}
            </div>
            {notifLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} /></div>
            ) : notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifications.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: '10px 12px', borderRadius: '8px', background: n.is_read ? 'transparent' : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', border: `1px solid ${n.is_read ? 'var(--border-subtle)' : 'color-mix(in srgb, var(--brand-primary) 15%, transparent)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>{n.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</div>
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(n.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Chưa có thông báo nào.
              </div>
            )}
          </motion.div>
        </aside>
      </div>

      <CareerRecommendation lang="vn" />

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />


    </div>
  )
}
