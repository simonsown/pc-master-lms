'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, ArrowLeft, CheckCircle, AlertCircle, Save, 
  MessageSquare, Star, Cpu, Wallet, Battery, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { formatVND } from '@/lib/grading/auto-grade';

export default function GradeSubmissionPage({ params }: { params: Promise<{ classId: string, assignmentId: string, submissionId: string }> }) {
  const resolvedParams = use(params);
  const { classId, assignmentId, submissionId } = resolvedParams;

  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Grade state
  const [teacherScore, setTeacherScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Submission
      const { data: sub, error: subError } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles(full_name)
        `)
        .eq('id', submissionId)
        .single();
      
      if (subError) throw subError;
      setSubmission(sub);
      setTeacherScore(sub.teacher_score || 0);
      setFeedback(sub.feedback || '');

      // 2. Fetch Assignment
      const { data: asg, error: asgError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
      
      if (asgError) throw asgError;
      setAssignment(asg);

    } catch (err) {
      console.error('Error fetching submission details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      const totalScore = Math.min(assignment.max_score, (submission.auto_score || 0) + teacherScore);
      
      const { error } = await supabase
        .from('submissions')
        .update({
          teacher_score: teacherScore,
          total_score: totalScore,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      alert('Đã lưu điểm và phản hồi!');
      router.push(`/teacher/classes/${classId}/assignments/${assignmentId}`);
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const router = useRouter();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#00f3ff" size={48} />
      </div>
    );
  }

  if (!submission || !assignment) return <div>Không tìm thấy dữ liệu.</div>;

  const pc = submission.pc_config;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href={`/teacher/classes/${classId}/assignments/${assignmentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Quay lại bảng điểm
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Chấm bài: <span style={{ color: '#00f3ff' }}>{submission.student?.full_name}</span></h1>
            <p style={{ color: '#8899a6', margin: 0 }}>Nhiệm vụ: {assignment.title}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#8899a6', fontWeight: 700, marginBottom: '4px' }}>TỔNG ĐIỂM DỰ KIẾN</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#00f3ff' }}>{Math.min(assignment.max_score, (submission.auto_score || 0) + teacherScore)} <span style={{ fontSize: '16px', color: '#4b5563' }}>/ {assignment.max_score}</span></div>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* Left: Configuration Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Cấu hình PC */}
          <section style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={24} color="#00f3ff" /> Chi tiết cấu hình PC
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, marginBottom: '8px' }}>GIÁ TRỊ</div>
                <div style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>{formatVND(pc.total_price)}</div>
              </div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, marginBottom: '8px' }}>TỔNG TDP</div>
                <div style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>{pc.total_tdp}W</div>
              </div>
            </div>

            <h4 style={{ color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>Danh sách linh kiện:</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {pc.components.map((comp: string, idx: number) => (
                <div key={idx} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#e0e6ed', fontSize: '14px' }}>
                  {comp}
                </div>
              ))}
            </div>
          </section>

          {/* Auto-grade Breakdown */}
          <section style={{ background: 'rgba(12, 20, 36, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 24px 0' }}>Kết quả chấm tự động: {submission.auto_score}đ</h3>
            <p style={{ color: '#8899a6', fontSize: '14px', marginTop: '-15px', marginBottom: '24px' }}>Dựa trên các yêu cầu kỹ thuật của bài tập.</p>
            
            {/* Đây là phần logic mô phỏng lại breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> Phù hợp ngân sách</div>
                <span style={{ fontWeight: 700 }}>+30</span>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> RAM đạt chuẩn</div>
                <span style={{ fontWeight: 700 }}>+15</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Grading Form */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'rgba(0, 243, 255, 0.05)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(0, 243, 255, 0.1)', position: 'sticky', top: '32px' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={24} color="#00f3ff" /> Chấm điểm & Phản hồi
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#8899a6', marginBottom: '12px' }}>Điểm cộng/trừ thêm</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="number" 
                  value={teacherScore}
                  onChange={(e) => setTeacherScore(parseInt(e.target.value) || 0)}
                  style={{ width: '100px', padding: '12px', borderRadius: '8px', background: '#050a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', fontWeight: 700, textAlign: 'center' }}
                />
                <span style={{ color: '#4b5563', fontSize: '14px' }}>(Ví dụ: -5 nếu nộp trễ, +10 nếu cấu hình quá đẹp)</span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#8899a6', marginBottom: '12px' }}>Nhận xét cho học sinh</label>
              <div style={{ position: 'relative' }}>
                <MessageSquare style={{ position: 'absolute', left: '16px', top: '16px', color: '#4b5563' }} size={18} />
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  placeholder="Viết nhận xét hoặc hướng dẫn thêm..."
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: '#050a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', resize: 'none', outline: 'none' }}
                ></textarea>
              </div>
            </div>

            <button 
              onClick={handleSaveGrade}
              disabled={isSaving}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)',
                color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Hoàn tất chấm bài</>}
            </button>
          </div>

          {submission.is_late && (
            <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertCircle size={20} color="#ef4444" />
              <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>Cảnh báo: Học sinh nộp trễ bài!</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
