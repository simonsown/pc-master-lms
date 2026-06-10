'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Users, BookOpen, FileText, Activity, Monitor, Clock, Radio, Loader2 } from 'lucide-react';
import { LineChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ users: 0, lessons: 0, exams: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const channel = supabase.channel('admin-analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => fetchStats())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, []);

  async function fetchStats() {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: lessons } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
    const { count: exams } = await supabase.from('exams').select('*', { count: 'exact', head: true });
    const { count: classes } = await supabase.from('classes').select('*', { count: 'exact', head: true });
    setStats({ users: users || 0, lessons: lessons || 0, exams: exams || 0, classes: classes || 0 });
    setLoading(false);
  }

  const monthlyData = [
    { month: 'T1', users: 0, lessons: 0, exams: 0 },
    { month: 'T2', users: 0, lessons: 0, exams: 0 },
    { month: 'T3', users: 0, lessons: 0, exams: 0 },
    { month: 'T4', users: 0, lessons: 0, exams: 0 },
    { month: 'T5', users: 0, lessons: 0, exams: 0 },
    { month: 'T6', users: stats.users, lessons: stats.lessons, exams: stats.exams },
  ];

  const categoryData = [
    { name: 'Bài giảng', value: stats.lessons, color: 'var(--brand-primary)' },
    { name: 'Bài kiểm tra', value: stats.exams, color: 'var(--accent-amber)' },
    { name: 'Lớp học', value: stats.classes, color: 'var(--accent-blue)' },
    { name: 'Người dùng', value: stats.users, color: '#6366f1' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Phân tích dữ liệu</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
          Thống kê trực tiếp từ database · <Radio size={12} style={{ verticalAlign: 'middle' }} /> Live
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Người dùng', value: stats.users, icon: Users, color: 'var(--brand-primary)' },
          { label: 'Bài giảng', value: stats.lessons, icon: BookOpen, color: 'var(--accent-blue)' },
          { label: 'Bài kiểm tra', value: stats.exams, icon: FileText, color: 'var(--accent-amber)' },
          { label: 'Lớp học', value: stats.classes, icon: Monitor, color: '#6366f1' },
        ].map((s, i) => (
          <div key={i} className="lms-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} />
              </div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div className="lms-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Tổng quan dữ liệu</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="users" stroke="var(--brand-primary)" fill="url(#colorUsers)" strokeWidth={2} name="Người dùng" />
                <Area type="monotone" dataKey="lessons" stroke="var(--accent-blue)" fill="url(#colorUsers)" strokeWidth={2} name="Bài giảng" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lms-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Phân bố</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {categoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {categoryData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                <span style={{ color: 'var(--text-muted)', flex: 1 }}>{item.name}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
