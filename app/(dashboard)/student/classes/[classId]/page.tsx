'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, Loader2, ArrowLeft, 
  Info, Calendar, User
} from 'lucide-react';
import Link from 'next/link';
import AssignmentCard from '@/components/classes/AssignmentCard';

export default function StudentClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.classId;

  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  async function fetchClassInfo() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Class Info
      const { data: cls, error: clsError } = await supabase
        .from('classes')
        .select('*, teacher:profiles(full_name)')
        .eq('id', classId)
        .single();
      
      if (clsError) throw clsError;
      setClassData(cls);

      // 2. Fetch Assignments & My Submissions
      const { data: asgs, error: asgsError } = await supabase
        .from('assignments')
        .select(`
          *,
          submissions(id, total_score)
        `)
        .eq('class_id', classId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (asgsError) throw asgsError;

      // Filter submissions for current user manually because of how Supabase returns it
      const formattedAsgs = asgs?.map(asg => ({
        ...asg,
        hasSubmitted: (asg.submissions as any[]).length > 0
      })) || [];

      setAssignments(formattedAsgs);

    } catch (err) {
      console.error('Error fetching student class info:', err);
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

  if (!classData) return <div>Không tìm thấy lớp học hoặc bạn không có quyền truy cập.</div>;

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/student/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Lớp học của tôi
        </Link>
        
        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>{classData.name}</h1>
        <div style={{ display: 'flex', gap: '24px', color: '#8899a6', fontSize: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> GV: <strong style={{ color: '#fff' }}>{classData.teacher?.full_name}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={16} /> Mã lớp: <strong style={{ color: '#00f3ff' }}>{classData.code}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Năm học: {classData.school_year}</span>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <ClipboardList size={24} color="#00f3ff" />
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Nhiệm vụ cần hoàn thành</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {assignments.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#4b5563', background: 'rgba(12, 20, 36, 0.5)', borderRadius: '24px' }}>
            <p>Hiện lớp học này chưa có nhiệm vụ nào dành cho bạn.</p>
          </div>
        ) : (
          assignments.map(asg => (
            <AssignmentCard
              key={asg.id}
              id={asg.id}
              classId={classId}
              title={asg.title}
              type={asg.type}
              deadline={asg.deadline}
              requirements={asg.requirements}
              hasSubmitted={asg.hasSubmitted}
              role="student"
            />
          ))
        )}
      </div>
    </div>
  );
}
