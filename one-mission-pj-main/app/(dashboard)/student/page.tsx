'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import JoinClassModal from '../../../components/JoinClassModal';
import CareerRecommendation from '../../../components/CareerRecommendation';
import { supabase } from '@/lib/supabase';

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } })

export default function StudentDashboard() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Lớp học', value: '0', icon: <Users size={20} />, color: 'var(--accent-blue)' },
    { label: 'Bài tập', value: '0', icon: <BookOpen size={20} />, color: 'var(--brand-primary)' },
    { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: '#8b5cf6' },
  ]);

  useEffect(() => { fetchData(); }, []);

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

      <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4, boxShadow: '0 12px 40px var(--shadow-hover)' }}
            className="lms-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '14px', transition: 'box-shadow 0.3s' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div {...fadeUp(0.2)}
            className="lms-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', borderRadius: '16px', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)', boxShadow: '0 8px 30px var(--shadow-color)' }}>
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

          <motion.div {...fadeUp(0.3)} className="lms-card" style={{ padding: '28px', borderRadius: '16px' }}>
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

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div {...fadeUp(0.25)}
            className="lms-card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', color: '#fff', position: 'relative', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 8px 30px rgba(8,158,96,0.3)' }}>
            <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -20, right: -20, opacity: 0.08 }}>
              <Sparkles size={120} />
            </motion.div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Bot size={36} style={{ marginBottom: '16px', opacity: 0.9 }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#fff' }}>AI Guru đang chờ</h3>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '24px', lineHeight: 1.6 }}>Gặp khó khăn khi chọn linh kiện? Chat với AI để được tư vấn ngay.</p>
              <Link href="/builder" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#fff', color: 'var(--brand-primary)', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                Bắt đầu trò chuyện
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.35)} className="lms-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Thông báo mới</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Chưa có thông báo nào từ giáo viên.
            </div>
          </motion.div>
        </aside>
      </div>

      <CareerRecommendation lang="vn" />

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />

      <Link href="/builder" style={{ 
        position: 'fixed', bottom: '32px', right: '32px', width: '60px', height: '60px', borderRadius: '50%', 
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(8,158,96,0.4)', cursor: 'pointer', zIndex: 100, textDecoration: 'none',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s'
      }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(8,158,96,0.5)'; }}
         onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(8,158,96,0.4)'; }}>
        <Bot size={28} color="#fff" />
      </Link>
    </div>
  )
}
