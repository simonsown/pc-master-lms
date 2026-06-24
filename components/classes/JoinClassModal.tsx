'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, KeySquare, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JoinClassModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classInfo, setClassInfo] = useState<{ id: string; name: string; teacherName?: string } | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const lookUpClass = async () => {
    if (code.length !== 6) {
      setError('Mã lớp phải có đúng 6 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);
    setClassInfo(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Vui lòng đăng nhập.');

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, teacher_id')
        .eq('code', code.toUpperCase())
        .single();

      if (classError || !classData) {
        throw new Error('Không tìm thấy lớp học với mã này.');
      }

      let teacherName = 'Giáo viên';
      if (classData.teacher_id) {
        const { data: teacherProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', classData.teacher_id)
          .single();
        if (teacherProfile?.full_name) {
          teacherName = teacherProfile.full_name;
        }
      }

      setClassInfo({ ...classData, teacherName });

      const { error: joinError } = await supabase
        .from('class_members')
        .insert({
          class_id: classData.id,
          student_id: userData.user.id,
          status: 'active'
        });

      if (joinError) {
        if (joinError.code === '23505') throw new Error('Bạn đã tham gia lớp này rồi.');
        throw new Error('Không thể tham gia lớp: ' + joinError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.push(`/student/classes/${classData.id}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'color-mix(in srgb, var(--bg-base) 85%, transparent)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px', width: '100%', maxWidth: '440px',
        border: '1px solid var(--border-strong)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>

        <div style={{ padding: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--brand-subtle)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <KeySquare size={28} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Tham gia lớp học</h2>
          <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Nhập mã lớp gồm 6 ký tự do giáo viên cung cấp để bắt đầu thực hành.
          </p>

          {success ? (
            <div style={{ background: 'var(--brand-subtle)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--brand-primary)' }}>
              <CheckCircle size={24} />
              <span style={{ fontWeight: 600 }}>Tham gia thành công! Đang chuyển hướng...</span>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); lookUpClass(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <input
                  type="text"
                  placeholder="VD: TIN001"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().slice(0, 6));
                    setClassInfo(null);
                    setError(null);
                  }}
                  style={{
                    width: '100%', padding: '16px', background: 'var(--bg-base)', border: '2px solid var(--border-default)',
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800, textAlign: 'center',
                    letterSpacing: '4px', textTransform: 'uppercase', outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                />
              </div>

              {classInfo && !error && !success && (
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-subtle)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{classInfo.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Giáo viên: <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{classInfo.teacherName}</span></p>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)',
                  color: 'var(--bg-base)', fontSize: '16px', fontWeight: 700, border: 'none',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  opacity: (loading || code.length !== 6) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Xác nhận tham gia'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
