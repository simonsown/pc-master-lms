'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, ArrowLeft, ClipboardList, Info, Calendar
} from 'lucide-react';
import Link from 'next/link';
import GradeTable from '@/components/classes/GradeTable';

export default function AssignmentSubmissionsPage({ params }: { params: Promise<{ classId: string, assignmentId: string }> }) {
  const resolvedParams = use(params);
  const { classId, assignmentId } = resolvedParams;

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Assignment Info
      const { data: asg, error: asgError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
      
      if (asgError) throw asgError;
      setAssignment(asg);

      // 2. Fetch all members of the class
      const { data: members, error: memError } = await supabase
        .from('class_members')
        .select('student_id, student:profiles(full_name)')
        .eq('class_id', classId);

      if (memError) throw memError;

      // 3. Fetch all submissions for this assignment
      const { data: subs, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (subError) throw subError;

      // 4. Combine data to show who hasn't submitted
      const formattedData = members.map(m => {
        const submission = subs?.find(s => s.student_id === m.student_id);
        return {
          id: submission?.id || m.student_id,
          student_id: m.student_id,
          student_name: (m.student as any)?.full_name || 'Học sinh',
          submitted_at: submission?.submitted_at || null,
          is_late: submission?.is_late || false,
          auto_score: submission?.auto_score ?? null,
          teacher_score: submission?.teacher_score ?? null,
          total_score: submission?.total_score ?? null,
          status: submission 
            ? (submission.total_score !== null ? 'graded' : 'submitted') 
            : 'missing'
        };
      });

      setSubmissions(formattedData);

    } catch (err) {
      console.error('Error fetching submissions:', err);
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

  if (!assignment) return <div>Không tìm thấy nhiệm vụ.</div>;

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href={`/teacher/classes/${classId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Quay lại lớp học
        </Link>
        
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>Quản lý <span style={{ color: '#00f3ff' }}>Bài nộp</span></h1>
        <div style={{ display: 'flex', gap: '24px', color: '#8899a6', fontSize: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={16} /> Nhiệm vụ: <strong style={{ color: '#fff' }}>{assignment.title}</strong></span>
          {assignment.deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Hạn chót: {new Date(assignment.deadline).toLocaleString('vi-VN')}</span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={16} /> Loại: {assignment.type}</span>
        </div>
      </header>

      <GradeTable 
        data={submissions} 
        assignmentId={assignmentId} 
        classId={classId} 
      />
    </div>
  );
}
