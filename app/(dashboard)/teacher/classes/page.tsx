'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClassCard from '@/components/classes/ClassCard';
import { Plus, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClasses(); }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('classes')
        .select(`*, class_members(count), assignments(count)`)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--brand-primary)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Quản lý <span style={{ color: 'var(--brand-primary)' }}>Lớp học</span></h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tạo lớp, quản lý học sinh và giao nhiệm vụ lắp ráp PC.</p>
        </div>
        <Link href="/teacher/classes/new" style={{ textDecoration: 'none' }}>
          <button className="lms-btn lms-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
            <Plus size={20} /> Tạo lớp mới
          </button>
        </Link>
      </header>

      {classes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '100px 0',
          background: 'var(--bg-surface)', borderRadius: '24px',
          border: '2px dashed var(--border-default)'
        }}>
          <BookOpen size={64} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Bạn chưa tạo lớp học nào.</h3>
          <Link href="/teacher/classes/new" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(var(--brand-primary-rgb),0.1)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)',
              padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
            }}>
              Tạo lớp ngay
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              code={cls.code}
              memberCount={cls.class_members?.[0]?.count || 0}
              maxStudents={cls.max_students}
              activeAssignmentsCount={cls.assignments?.[0]?.count || 0}
              role="teacher"
              onDelete={fetchClasses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
