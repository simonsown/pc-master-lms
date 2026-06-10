'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, ArrowLeft, ClipboardList, Target, 
  Wallet, Battery, HardDrive, Cpu, CheckCircle, AlertCircle, Play
} from 'lucide-react';
import Link from 'next/link';
import { formatVND } from '@/lib/grading/auto-grade';

export default function DoAssignmentPage({ params }: { params: Promise<{ classId: string, assignmentId: string }> }) {
  const resolvedParams = use(params);
  const { classId, assignmentId } = resolvedParams;

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Assignment
      const { data: asg, error: asgError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
      
      if (asgError) throw asgError;
      setAssignment(asg);

      // 2. Check for existing submission
      const { data: sub, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .single();

      if (sub) setSubmission(sub);

    } catch (err) {
      console.error('Error fetching assignment data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitMock = async () => {
    // Đây là hàm giả lập việc nộp bài từ Simulator
    // Trong thực tế, dữ liệu này sẽ đến từ trạng thái của PC Builder
    const mockPCConfig = {
      components: ['Ryzen 5 5600X', 'RTX 3060', 'RAM 16GB DDR4', 'SSD 500GB', 'PSU 650W'],
      total_price: 14500000,
      total_tdp: 220,
      ram_gb: 16
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/classes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignmentId,
          class_id: classId,
          pc_config: mockPCConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        alert('Nộp bài thành công!');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#00f3ff" size={48} />
      </div>
    );
  }

  if (!assignment) return <div>Không tìm thấy nhiệm vụ.</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href={`/student/classes/${classId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Quay lại lớp học
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>{assignment.title}</h1>
            <p style={{ color: '#8899a6', margin: 0, maxWidth: '600px' }}>{assignment.description}</p>
          </div>
          {submission && (
            <div style={{ padding: '16px 24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>ĐIỂM CỦA BẠN</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981' }}>{submission.total_score} <span style={{ fontSize: '16px', color: '#4b5563' }}>/ {assignment.max_score}</span></div>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Left Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Action Area */}
          <div style={{ 
            background: 'rgba(12, 20, 36, 0.8)', padding: '48px', borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={40} />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0' }}>Sẵn sàng thực hiện?</h2>
              <p style={{ color: '#8899a6', margin: 0 }}>Hệ thống sẽ mở Trình mô phỏng lắp ráp PC với các yêu cầu kỹ thuật đã định sẵn.</p>
            </div>
            
            <Link href="/builder" style={{ textDecoration: 'none', width: '100%', maxWidth: '300px' }}>
              <button style={{
                width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)',
                color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}>
                <Play size={20} fill="#000" /> Bắt đầu lắp ráp
              </button>
            </Link>

            {/* Nút nộp bài tạm thời (Giả lập) */}
            {!submission && (
              <button 
                onClick={handleSubmitMock}
                disabled={isSubmitting}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#4b5563',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {isSubmitting ? 'Đang nộp...' : '(Giả lập nộp bài thành công)'}
              </button>
            )}
          </div>

          {submission && (
            <div style={{ background: 'rgba(12, 20, 36, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} color="#10b981" /> Kết quả chấm điểm
              </h3>
              {submission.feedback && (
                <div style={{ color: '#e0e6ed', fontSize: '15px', lineHeight: 1.6, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <strong>Phản hồi từ GV:</strong> {submission.feedback}
                </div>
              )}
              <p style={{ color: '#8899a6', fontSize: '14px', marginTop: '16px' }}>
                Bài làm được nộp vào lúc {new Date(submission.submitted_at).toLocaleString('vi-VN')}. 
                {submission.is_late && <span style={{ color: '#ef4444' }}> (Nộp trễ)</span>}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Requirements */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#00f3ff" /> Yêu cầu nhiệm vụ
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700 }}>NGÂN SÁCH</div>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>&le; {formatVND(assignment.requirements.budget_max || 0)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Battery size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700 }}>TDP TỐI ĐA</div>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>&le; {assignment.requirements.tdp_max || '--'} W</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardDrive size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700 }}>RAM TỐI THIỂU</div>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>&ge; {assignment.requirements.min_ram_gb || '--'} GB</div>
                </div>
              </div>

              {assignment.requirements.required_components?.length > 0 && (
                <div style={{ marginTop: '8px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                  <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 700, marginBottom: '8px' }}>LINH KIỆN BẮT BUỘC</div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', color: '#e0e6ed', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {assignment.requirements.required_components.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <h4 style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> Chú ý deadline
            </h4>
            <p style={{ color: '#8899a6', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Nộp sau thời gian quy định sẽ bị trừ 20% tổng số điểm. Hãy cân đối thời gian lắp ráp!
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
