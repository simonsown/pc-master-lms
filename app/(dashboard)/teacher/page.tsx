'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, FileText, BookOpen, GraduationCap, TrendingUp, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0, submissions: 0 });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: classesData, count: classesCount } = await supabase.from('classes').select('*', { count: 'exact' }).eq('teacher_id', user.id);
      setClasses(classesData || []);
      const classIds = classesData?.map(c => c.id) || [];
      const { count: studentsCount } = await supabase.from('class_members').select('*', { count: 'exact', head: true }).in('class_id', classIds);
      const { count: asgCount } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id);
      setStats({ classes: classesCount || 0, students: studentsCount || 0, assignments: asgCount || 0, submissions: 0 });
    } catch (err) { console.error('Error fetching teacher stats:', err); }
    finally { setLoading(false); }
  }

  const quickActions = [
    { title: 'Quản lý Lớp học', desc: 'Tạo mã lớp, quản lý thành viên', icon: <Users size={24} />, color: 'var(--accent-blue)', href: '/teacher/classes' },
    { title: 'Quản lý Bài giảng', desc: 'Soạn thảo nội dung học tập', icon: <FileText size={24} />, color: 'var(--brand-primary)', href: '/teacher/lessons' },
    { title: 'Sách giáo khoa', desc: 'Nội dung số theo chương trình GDPT', icon: <BookOpen size={24} />, color: '#8b5cf6', href: '/teacher/lessons' },
    { title: 'Kiến thức mở rộng', desc: 'Thư viện phần cứng và công nghệ mới', icon: <TrendingUp size={24} />, color: '#ec4899', href: '/teacher/lessons' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={40} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} /></div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Chào mừng Thầy/Cô!</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hôm nay Thầy/Cô muốn thực hiện công việc gì?</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Số lớp đang quản lý', value: stats.classes, icon: <GraduationCap size={20} />, color: 'var(--accent-blue)' },
          { label: 'Tổng số học sinh', value: stats.students, icon: <Users size={20} />, color: 'var(--brand-primary)' },
          { label: 'Nhiệm vụ đã giao', value: stats.assignments, icon: <BookOpen size={20} />, color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="lms-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="teacher-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Thao tác nhanh</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href} style={{ textDecoration: 'none' }}>
                <div className="lms-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--shadow-color)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{action.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.desc}</div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Lớp của tôi</h2>
            <Link href="/teacher/classes/new" style={{ color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>+ Tạo mới</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {classes.length > 0 ? classes.map(cls => (
              <div key={cls.id} className="lms-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{cls.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cls.subject}{cls.grade ? ` • Khối ${cls.grade}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Mã lớp</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{cls.code}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--border-default)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                Chưa có lớp học nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
