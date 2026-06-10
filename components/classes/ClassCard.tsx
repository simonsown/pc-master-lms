'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Monitor, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClassCardProps {
  id: string;
  name: string;
  code: string;
  teacherName?: string;
  memberCount: number;
  maxStudents: number;
  activeAssignmentsCount: number;
  role: 'teacher' | 'student';
  onDelete?: () => void;
}

export default function ClassCard({ id, name, code, teacherName, memberCount, maxStudents, activeAssignmentsCount, role, onDelete }: ClassCardProps) {
  const linkHref = `/${role}/classes/${id}`;

  const deleteClass = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Xóa lớp học này?')) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('classes').delete().eq('id', id).eq('teacher_id', user.id);
    if (error) { alert('Lỗi: ' + error.message); return; }
    if (onDelete) onDelete();
  };

  return (
    <div className="lms-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: 'rgba(var(--brand-primary-rgb),0.05)', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--brand-primary-rgb),0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Monitor size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Mã: <strong style={{ color: 'var(--brand-primary)', letterSpacing: '1px' }}>{code}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {memberCount}/{maxStudents}</span>
          </p>
          {teacherName && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>GV: {teacherName}</p>
          )}
        </div>
        {role === 'teacher' && (
          <button onClick={deleteClass} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244,67,54,0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', flexShrink: 0 }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeAssignmentsCount > 0 ? 'var(--brand-primary)' : 'var(--text-muted)' }}></div>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {activeAssignmentsCount > 0 ? `${activeAssignmentsCount} nhiệm vụ đang mở` : 'Không có nhiệm vụ mới'}
          </span>
        </div>

        <Link href={linkHref} style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(var(--brand-primary-rgb),0.1)'; e.currentTarget.style.color = 'var(--brand-primary)'; e.currentTarget.style.borderColor = 'rgba(var(--brand-primary-rgb),0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          >
            Vào lớp <ChevronRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}
