'use client';

import React, { useEffect, useState } from 'react';
import { History, BookOpen, Award, Clock, ChevronRight, Wrench } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TYPE_COLORS = {
  lesson: '#10B981', quiz: '#6366F1',
  exam: '#EF4444', builder: '#06B6D4'
};

const TYPE_ICONS = {
  lesson: BookOpen, quiz: Award,
  exam: Award, builder: Wrench
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return d.toLocaleDateString('vi-VN');
}

export default function StudentHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchHistory = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setUserId(u.id);

    const [lessonsRes, quizRes, builderRes] = await Promise.all([
      supabase.from('lesson_progress')
        .select('lesson_id, status, completed_at, last_accessed, time_spent_seconds, score, completion_percentage, lessons(title)')
        .eq('student_id', u.id)
        .not('last_accessed', 'is', null)
        .order('last_accessed', { ascending: false })
        .limit(30),
      supabase.from('quiz_attempts')
        .select('id, quiz_id, score, status, submitted_at, created_at, quizzes(title)')
        .eq('student_id', u.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('builder_sessions')
        .select('started_at, ended_at')
        .eq('student_id', u.id)
        .not('started_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(30)
    ]);

    const items: any[] = [];

    (lessonsRes.data || []).forEach((l: any) => {
      items.push({
        id: `lesson-${l.lesson_id}-${l.last_accessed}`,
        type: 'lesson',
        title: l.lessons?.title || 'Bài học',
        desc: l.status === 'completed' ? 'Hoàn thành' : `Đang học (${l.completion_percentage || 0}%)`,
        time: l.completed_at || l.last_accessed,
        score: l.score
      });
    });

    (quizRes.data || []).forEach((q: any) => {
      items.push({
        id: `quiz-${q.id}-${q.created_at}`,
        type: 'quiz',
        title: q.quizzes?.title || 'Bài kiểm tra',
        desc: q.status === 'submitted' || q.status === 'passed' || q.status === 'failed' ? `Điểm: ${q.score}/100` : 'Chưa chấm',
        time: q.submitted_at || q.created_at,
        score: q.score
      });
    });

    (builderRes.data || []).forEach((b: any) => {
      const duration = b.ended_at
        ? Math.round((new Date(b.ended_at).getTime() - new Date(b.started_at).getTime()) / 60000)
        : 0;
      items.push({
        id: `builder-${b.started_at}`,
        type: 'builder',
        title: 'Phòng thực hành lắp ráp',
        desc: duration > 0 ? `Thời gian: ${duration} phút` : 'Đã truy cập',
        time: b.started_at,
        score: null
      });
    });

    items.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setActivities(items.slice(0, 50));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('student-history-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_progress', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'builder_sessions', filter: `student_id=eq.${userId}` },
        () => fetchHistory()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--brand-primary)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <History size={22} style={{ color: 'var(--brand-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Lịch sử học tập</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Theo dõi toàn bộ hoạt động học tập theo thời gian thực</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có hoạt động học tập nào. Bắt đầu học để xem lịch sử tại đây!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activities.map((item) => {
            const Icon = TYPE_ICONS[item.type] || BookOpen;
            const color = TYPE_COLORS[item.type] || '#666';
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)', borderRadius: '10px',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: `${color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{formatTime(item.time)}</div>
                  {item.score != null && (
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.score >= 80 ? '#10B981' : item.score >= 50 ? '#F59E0B' : '#EF4444' }}>
                      {item.score}%
                    </div>
                  )}
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
