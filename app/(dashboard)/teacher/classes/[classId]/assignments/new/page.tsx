'use client';

import React, { useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Save, FileText, Target, 
  Wallet, Battery, HardDrive, Cpu, AlertCircle, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function NewAssignmentPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.classId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState('build_config');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;
    const maxScore = parseInt(formData.get('max_score') as string) || 100;

    // Requirements JSON
    const requirements = {
      budget_max: parseInt(formData.get('budget_max') as string) || undefined,
      tdp_max: parseInt(formData.get('tdp_max') as string) || undefined,
      min_ram_gb: parseInt(formData.get('min_ram_gb') as string) || undefined,
      required_components: (formData.get('required_components') as string).split(',').map(s => s.trim()).filter(s => s !== '')
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập lại.');

      const { error: insertError } = await supabase
        .from('assignments')
        .insert({
          class_id: classId,
          teacher_id: user.id,
          title,
          description,
          type: assignmentType,
          requirements,
          max_score: maxScore,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          is_published: true
        });

      if (insertError) throw insertError;

      router.push(`/teacher/classes/${classId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(5, 10, 20, 0.5)',
    color: 'white', fontSize: '16px', outline: 'none'
  };

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: 600, color: '#8899a6', marginBottom: '8px'
  };

  const iconStyle = {
    position: 'absolute' as const, left: '16px', top: '14px', color: '#4b5563'
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <Link href={`/teacher/classes/${classId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '32px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Quay lại lớp học
      </Link>

      <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 40px 0', color: '#fff' }}>Giao nhiệm vụ mới</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Thông tin chung */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#00f3ff', fontSize: '18px', fontWeight: 700, margin: 0 }}>1. Thông tin chung</h3>
            
            <div>
              <label style={labelStyle}>Tiêu đề nhiệm vụ</label>
              <div style={{ position: 'relative' }}>
                <FileText style={iconStyle} size={20} />
                <input name="title" required placeholder="VD: Lắp PC Gaming 15 triệu" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Mô tả chi tiết</label>
              <textarea name="description" rows={3} style={{ ...inputStyle, paddingLeft: '16px', resize: 'none' }} placeholder="Mô tả bối cảnh hoặc hướng dẫn chi tiết cho học sinh..."></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Loại nhiệm vụ</label>
                <div style={{ position: 'relative' }}>
                  <Target style={iconStyle} size={20} />
                  <select 
                    value={assignmentType} 
                    onChange={(e) => setAssignmentType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="build_config">Lắp ráp PC đạt chuẩn</option>
                    <option value="optimize_budget">Tối ưu ngân sách</option>
                    <option value="minimize_tdp">Tiết kiệm điện năng</option>
                    <option value="maximize_perf">Tối đa hiệu năng</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hạn chót (Deadline)</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={iconStyle} size={20} />
                  <input name="deadline" type="datetime-local" style={inputStyle} />
                </div>
              </div>
            </div>
          </section>

          {/* Yêu cầu kỹ thuật */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: 'rgba(0, 243, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(0, 243, 255, 0.1)' }}>
            <h3 style={{ color: '#00f3ff', fontSize: '18px', fontWeight: 700, margin: 0 }}>2. Yêu cầu kỹ thuật (Auto-grading)</h3>
            <p style={{ color: '#4b5563', fontSize: '13px', margin: '-10px 0 10px 0' }}>Hệ thống sẽ dựa vào các thông số này để tự động chấm điểm bài nộp của học sinh.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Ngân sách tối đa (VNĐ)</label>
                <div style={{ position: 'relative' }}>
                  <Wallet style={iconStyle} size={20} />
                  <input name="budget_max" type="number" placeholder="15000000" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>TDP tối đa (Watt)</label>
                <div style={{ position: 'relative' }}>
                  <Battery style={iconStyle} size={20} />
                  <input name="tdp_max" type="number" placeholder="300" style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>RAM tối thiểu (GB)</label>
                <div style={{ position: 'relative' }}>
                  <HardDrive style={iconStyle} size={20} />
                  <input name="min_ram_gb" type="number" placeholder="16" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Điểm tối đa</label>
                <div style={{ position: 'relative' }}>
                  <Target style={iconStyle} size={20} />
                  <input name="max_score" type="number" defaultValue="100" style={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Linh kiện bắt buộc (phân cách bằng dấu phẩy)</label>
              <div style={{ position: 'relative' }}>
                <Cpu style={iconStyle} size={20} />
                <input name="required_components" placeholder="RTX 3060, SSD NVMe, i5-12400F" style={inputStyle} />
              </div>
            </div>
          </section>

          {error && (
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '10px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '18px', borderRadius: '12px', background: 'var(--brand-primary)',
            color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Đăng nhiệm vụ</>}
          </button>
        </form>
      </div>
    </div>
  );
}
