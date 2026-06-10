'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, GraduationCap, Calendar, Users, Type } from 'lucide-react';
import Link from 'next/link';


export default function NewClassPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const grade = formData.get('grade') as string;
    const schoolYear = formData.get('school_year') as string;
    const description = formData.get('description') as string;
    const maxStudents = parseInt(formData.get('max_students') as string) || 40;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập lại.');

      // Tự sinh mã lớp 6 chữ số (dễ nhập)
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { data, error: insertError } = await supabase
        .from('classes')
        .insert({
          name,
          grade,
          school_year: schoolYear,
          description,
          max_students: maxStudents,
          teacher_id: user.id,
          code
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/teacher/classes/${data.id}`);
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
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/teacher/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '32px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Quay lại danh sách
      </Link>

      <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 40px 0', color: '#fff' }}>Tạo lớp học mới</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={labelStyle}>Tên lớp học</label>
            <div style={{ position: 'relative' }}>
              <Type style={iconStyle} size={20} />
              <input name="name" required placeholder="Lớp 10A1 - Tin học" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Khối lớp</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap style={iconStyle} size={20} />
                <select name="grade" required style={inputStyle}>
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Năm học</label>
              <div style={{ position: 'relative' }}>
                <Calendar style={iconStyle} size={20} />
                <input name="school_year" required placeholder="2025-2026" style={inputStyle} defaultValue="2025-2026" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Sĩ số tối đa</label>
              <div style={{ position: 'relative' }}>
                <Users style={iconStyle} size={20} />
                <input name="max_students" type="number" required defaultValue="40" style={inputStyle} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Mô tả lớp học (không bắt buộc)</label>
            <textarea name="description" rows={4} style={{ ...inputStyle, paddingLeft: '16px', resize: 'none' }} placeholder="Mô tả mục tiêu của lớp hoặc thông tin cần lưu ý..."></textarea>
          </div>

          {error && (
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)',
            color: '#000', fontSize: '16px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px'
          }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Lưu & Tạo lớp</>}
          </button>
        </form>
      </div>
    </div>
  );
}
