'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClassCard from '@/components/classes/ClassCard';
import JoinClassModal from '@/components/classes/JoinClassModal';
import { Plus, Loader2, BookOpen } from 'lucide-react';

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    fetchJoinedClasses();
  }, []);

  async function fetchJoinedClasses() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Lấy danh sách lớp học thông qua class_members
      const { data, error } = await supabase
        .from('class_members')
        .select(`
          class:classes(
            *,
            teacher:profiles(full_name),
            assignments(count)
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      
      const formattedClasses = data?.map(item => ({
        ...item.class,
        teacherName: (item.class as any).teacher?.full_name,
        activeAssignmentsCount: (item.class as any).assignments?.[0]?.count || 0,
        memberCount: 0 // Ta sẽ update sau hoặc fetch thêm nếu cần
      })) || [];

      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error fetching student classes:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#00f3ff" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Lớp học <span style={{ color: '#00f3ff' }}>của tôi</span></h1>
          <p style={{ color: '#8899a6', margin: 0 }}>Tham gia lớp học và hoàn thành các thử thách xây dựng PC.</p>
        </div>
        <button 
          onClick={() => setIsJoinModalOpen(true)}
          style={{
            background: 'var(--brand-primary)', color: '#000', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> Tham gia lớp
        </button>
      </header>

      {classes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '100px 0',
          background: 'rgba(12, 20, 36, 0.5)', borderRadius: '24px',
          border: '2px dashed rgba(255,255,255,0.05)'
        }}>
          <BookOpen size={64} color="#1e293b" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: '#8899a6', margin: '0 0 24px 0' }}>Bạn chưa tham gia lớp học nào.</h3>
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            style={{
              background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: '1px solid #00f3ff',
              padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Nhập mã tham gia ngay
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              code={cls.code}
              teacherName={cls.teacherName}
              memberCount={0} // HS có thể không cần thấy chính xác tổng số này
              maxStudents={cls.max_students}
              activeAssignmentsCount={cls.activeAssignmentsCount}
              role="student"
            />
          ))}
        </div>
      )}

      <JoinClassModal 
        isOpen={isJoinModalOpen} 
        onClose={() => {
          setIsJoinModalOpen(false);
          fetchJoinedClasses(); // Refresh list sau khi join
        }} 
      />
    </div>
  );
}
