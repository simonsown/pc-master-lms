'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, BookOpen, Monitor, Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, Loader2, Radio } from 'lucide-react';
import Link from 'next/link';

export default function AdminContentPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('admin-content-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, []);

  async function fetchData() {
    const { data: l } = await supabase.from('lessons').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(50);
    if (l) setLessons(l);
    const { data: e } = await supabase.from('exams').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(50);
    if (e) setExams(e);
    setLoading(false);
  }

  const allContent = [
    ...lessons.map(l => ({ ...l, contentType: 'lesson' })),
    ...exams.map(e => ({ ...e, contentType: 'exam' })),
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = tab === 'all' ? allContent : tab === 'lesson' ? allContent.filter((c: any) => c.contentType === 'lesson') : allContent.filter((c: any) => c.contentType === 'exam');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Quản lý nội dung</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
            Quản lý bài giảng và bài kiểm tra · <Radio size={12} style={{ verticalAlign: 'middle' }} /> Live
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Bài giảng', value: lessons.length, icon: BookOpen, color: 'var(--brand-primary)' },
          { label: 'Bài kiểm tra', value: exams.length, icon: FileText, color: 'var(--accent-blue)' },
        ].map((s, i) => (
          <div key={i} className="lms-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="lms-card" style={{ overflow: 'hidden', padding: '0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'lesson', label: 'Bài giảng' },
            { key: 'exam', label: 'Bài kiểm tra' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
              background: tab === t.key ? 'var(--brand-primary)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit'
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {['Tiêu đề', 'Loại', 'Tác giả', 'Trạng thái', 'Cập nhật'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={`${item.contentType}-${item.id}`} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: item.contentType === 'lesson' ? 'rgba(8,158,96,0.1)' : 'rgba(255,163,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.contentType === 'lesson' ? <BookOpen size={14} color="var(--brand-primary)" /> : <FileText size={14} color="var(--accent-amber)" />}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{item.title || 'Không tiêu đề'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ID: {item.id?.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="lms-tag" style={{ fontSize: '10px' }}>{item.contentType === 'lesson' ? 'Bài giảng' : 'Kiểm tra'}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>{item.profiles?.full_name || 'N/A'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: item.is_published ? 'var(--brand-primary)' : 'var(--accent-amber)', fontSize: '12px', fontWeight: 600 }}>
                      {item.is_published ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {item.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
