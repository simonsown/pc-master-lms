'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Bot } from 'lucide-react';
import JoinClassModal from '../../../components/JoinClassModal';
import { supabase } from '@/lib/supabase';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Xin chào!</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Chào mừng bạn quay trở lại với không gian học tập PC Master.</p>
        </div>
        <button onClick={() => setShowJoinModal(true)} className="lms-btn lms-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Plus size={18} /> Tham gia lớp học
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="lms-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="lms-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Phòng thực hành PC Builder</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '380px', fontSize: '14px', lineHeight: 1.5 }}>
                Tự tay lắp ráp cấu hình máy tính, kiểm tra sự tương thích và hiệu năng của linh kiện ngay lập tức.
              </p>
              <Link href="/builder" className="lms-btn lms-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                Bắt đầu thực hành <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06 }}>
              <Cpu size={180} color="var(--brand-primary)" />
            </div>
          </div>

          <div className="lms-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Lớp học của tôi</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{classes.length} lớp</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 size={32} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} /></div>
            ) : classes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {classes.map((cls) => (
                  <Link key={cls.id} href={`/student/classes/${cls.id}`} style={{ textDecoration: 'none' }}>
                    <div className="lms-card" style={{ padding: '20px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(40,156,249,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap size={18} color="var(--accent-blue)" />
                        </div>
                        <span className="lms-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>{cls.code}</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{cls.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>GV: {cls.profiles?.full_name || 'Đang cập nhật'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--border-default)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '14px' }}>Bạn chưa tham gia lớp học nào.</p>
                <button onClick={() => setShowJoinModal(true)} style={{ background: 'transparent', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Nhập mã lớp để tham gia
                </button>
              </div>
            )}
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="lms-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Bot size={32} style={{ marginBottom: '12px', opacity: 0.9 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>AI Guru đang chờ</h3>
              <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '20px', lineHeight: 1.5 }}>Gặp khó khăn khi chọn linh kiện? Chat với AI để được tư vấn ngay.</p>
              <Link href="/builder" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#fff', color: 'var(--brand-primary)', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
                Bắt đầu trò chuyện
              </Link>
            </div>
          </div>

          <div className="lms-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Thông báo mới</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              Chưa có thông báo nào từ giáo viên.
            </div>
          </div>
        </aside>
      </div>

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />

      <Link href="/builder" style={{ 
        position: 'fixed', bottom: '30px', right: '30px', width: '56px', height: '56px', borderRadius: '50%', 
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(8,158,96,0.35)', cursor: 'pointer', zIndex: 100, textDecoration: 'none',
        transition: 'transform 0.3s'
      }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
        <Bot size={24} color="#fff" />
      </Link>
    </div>
  )
}
