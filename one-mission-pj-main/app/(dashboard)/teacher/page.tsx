'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, FileText, BookOpen, GraduationCap, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    submissions: 0
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch classes count and list
      const { data: classesData, count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact' })
        .eq('teacher_id', user.id);
      
      setClasses(classesData || []);

      // Fetch total students (members of all teacher's classes)
      const classIds = classesData?.map(c => c.id) || [];
      
      const { count: studentsCount } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds);

      // Fetch assignments count
      const { count: asgCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      setStats({
        classes: classesCount || 0,
        students: studentsCount || 0,
        assignments: asgCount || 0,
        submissions: 0 // Mocking for now
      });
    } catch (err) {
      console.error('Error fetching teacher stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { title: 'Quản lý Lớp học', desc: 'Tạo mã lớp, quản lý thành viên', icon: <Users size={24} />, color: '#00f3ff', href: '/teacher/classes' },
    { title: 'Quản lý Bài giảng', desc: 'Soạn thảo nội dung học tập, bài giảng lý thuyết', icon: <FileText size={24} />, color: '#10b981', href: '/teacher/lessons' },
    { title: 'Sách giáo khoa', desc: 'Nội dung số theo chương trình GDPT', icon: <BookOpen size={24} />, color: '#8b5cf6', href: '/teacher/lessons' },
    { title: 'Kiến thức mở rộng', desc: 'Thư viện phần cứng và công nghệ mới', icon: <TrendingUp size={24} />, color: '#ec4899', href: '/teacher/lessons' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Chào mừng Thầy/Cô quay trở lại!</h1>
        <p style={{ color: '#8899a6', margin: 0 }}>Hôm nay Thầy/Cô muốn thực hiện công việc gì?</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff' }}><GraduationCap size={20} /></div>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '13px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>Số lớp đang quản lý</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{stats.classes}</div>
        </div>

        <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Users size={20} /></div>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '13px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>Tổng số học sinh</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{stats.students}</div>
        </div>

        <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><BookOpen size={20} /></div>
          </div>
          <div style={{ fontSize: '13px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>Nhiệm vụ đã giao</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{stats.assignments}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', marginTop: '48px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>Thao tác nhanh cho Giáo viên</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '20px', 
                  border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', 
                  gap: '16px', transition: 'all 0.2s', cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = action.color}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: `${action.color}10`, color: action.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0' }}>{action.title}</h3>
                    <p style={{ color: '#8899a6', fontSize: '13px', margin: 0 }}>{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>


        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Lớp của tôi</h2>
            <Link href="/teacher/classes/new" style={{ color: '#00f3ff', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>+ Tạo mới</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {classes.length > 0 ? classes.map(cls => (
              <div key={cls.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{cls.name}</div>
                  <div style={{ fontSize: '12px', color: '#8899a6' }}>{cls.subject} • Khối {cls.grade}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#00f3ff', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Mã lớp</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{cls.code}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px', color: '#8899a6' }}>
                Chưa có lớp học nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
