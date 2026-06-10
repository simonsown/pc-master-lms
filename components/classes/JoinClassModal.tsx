'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, KeySquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JoinClassModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Mã lớp phải có đúng 6 ký tự.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Vui lòng đăng nhập.');

      // 1. Tìm lớp
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('code', code.toUpperCase())
        .single();

      if (classError || !classData) {
        throw new Error('Không tìm thấy lớp học với mã này.');
      }

      // 2. Tham gia lớp
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
      background: 'rgba(5, 10, 20, 0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#0a0f1a', borderRadius: '24px', width: '100%', maxWidth: '440px',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#8899a6', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>

        <div style={{ padding: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <KeySquare size={28} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: '#fff' }}>Tham gia lớp học</h2>
          <p style={{ margin: '0 0 24px 0', color: '#8899a6', fontSize: '14px', lineHeight: 1.5 }}>
            Nhập mã lớp gồm 6 ký tự do giáo viên cung cấp để bắt đầu thực hành.
          </p>

          {success ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981' }}>
              <CheckCircle size={24} />
              <span style={{ fontWeight: 600 }}>Tham gia thành công! Đang chuyển hướng...</span>
            </div>
          ) : (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <input
                  type="text"
                  placeholder="VD: TIN001"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                  style={{
                    width: '100%', padding: '16px', background: '#050a14', border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#fff', fontSize: '24px', fontWeight: 800, textAlign: 'center',
                    letterSpacing: '4px', textTransform: 'uppercase', outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00f3ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--brand-primary)',
                  color: '#000', fontSize: '16px', fontWeight: 700, border: 'none',
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
