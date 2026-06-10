'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Search, Clock, Users, BookOpen, FileText, RefreshCw, Radio, Loader2 } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  user_name: string;
  role: string;
  created_at: string;
  detail?: string;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
    const channel = supabase.channel('admin-activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const u = payload.new as any;
        setLogs(prev => [{
          id: `profile-${u.id}`,
          action: 'Đăng ký mới',
          user_name: u.full_name || 'Unknown',
          role: u.role || 'student',
          created_at: new Date().toISOString(),
          detail: `Email: ${u.email}`,
        }, ...prev].slice(0, 100));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lessons' }, (payload) => {
        const l = payload.new as any;
        setLogs(prev => [{
          id: `lesson-${l.id}`,
          action: 'Tạo bài giảng',
          user_name: l.teacher_id?.slice(0, 8) || 'System',
          role: 'teacher',
          created_at: new Date().toISOString(),
          detail: l.title || 'Bài giảng mới',
        }, ...prev].slice(0, 100));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exams' }, (payload) => {
        const e = payload.new as any;
        setLogs(prev => [{
          id: `exam-${e.id}`,
          action: 'Tạo bài kiểm tra',
          user_name: 'System',
          role: 'teacher',
          created_at: new Date().toISOString(),
          detail: e.title || 'Kiểm tra mới',
        }, ...prev].slice(0, 100));
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel) };
  }, []);

  async function fetchLogs() {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, role, email, created_at').order('created_at', { ascending: false }).limit(20);
    if (profiles) {
      const mapped: LogEntry[] = profiles.map(p => ({
        id: `profile-${p.id}`,
        action: p.role === 'admin' ? 'Đăng nhập Admin' : 'Đăng ký mới',
        user_name: p.full_name || 'Unknown',
        role: p.role || 'student',
        created_at: p.created_at,
        detail: `Email: ${p.email}`,
      }));
      setLogs(mapped);
    }
    setLoading(false);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vài giây trước';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  }

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Nhật ký hoạt động</h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
            borderRadius: '99px', fontSize: '10px', fontWeight: 700,
            background: connected ? 'rgba(8,158,96,0.1)' : 'rgba(244,106,106,0.1)',
            color: connected ? 'var(--brand-primary)' : 'var(--danger)',
          }}>
            <Radio size={10} /> {connected ? 'Live' : 'Off'}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Theo dõi hoạt động realtime trên hệ thống.</p>
      </header>

      <div className="lms-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm hoạt động..." style={{
              padding: '8px 12px 8px 36px', borderRadius: '8px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box'
            }} />
          </div>
          <button onClick={fetchLogs} style={{
            padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit'
          }}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {['Hoạt động', 'Người dùng', 'Chi tiết', 'Vai trò', 'Thời gian'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-default)', animation: i < 3 ? 'fadeIn 0.3s ease' : undefined }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: log.role === 'admin' ? 'rgba(244,106,106,0.1)' : log.role === 'teacher' ? 'rgba(40,156,249,0.1)' : 'rgba(8,158,96,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {log.role === 'admin' ? <Activity size={14} color="var(--danger)" /> : log.role === 'teacher' ? <BookOpen size={14} color="var(--accent-blue)" /> : <Users size={14} color="var(--brand-primary)" />}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{log.action}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-primary)', fontSize: '13px' }}>{log.user_name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>{log.detail || '-'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="lms-tag" style={{ fontSize: '10px' }}>{log.role}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {timeAgo(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; background: rgba(var(--brand-primary-rgb),0.04); } to { opacity: 1; background: transparent; } }`}</style>
    </div>
  );
}
