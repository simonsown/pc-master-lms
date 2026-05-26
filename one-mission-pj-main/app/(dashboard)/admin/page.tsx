'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Shield, Activity, Database, 
  Settings, Search, Filter, Loader2, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, teachers: 0, students: 0, activeClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAdminData(); }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(profiles || []);
      const teachers = profiles?.filter(u => u.role === 'teacher').length || 0;
      const students = profiles?.filter(u => u.role === 'student').length || 0;
      const { count: classesCount } = await supabase.from('classes').select('*', { count: 'exact', head: true });
      setStats({ totalUsers: profiles?.length || 0, teachers, students, activeClasses: classesCount || 0 });
    } catch (err) { console.error('Admin Data Error:', err); }
    finally { setLoading(false); }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} /></div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Admin Console</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Quản lý người dùng, lớp học và giám sát hoạt động toàn hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
            <Activity size={18} /> Logs
          </button>
          <button style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--brand-primary)', color: '#fff', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            <Settings size={18} /> Cấu hình
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Tổng người dùng', value: stats.totalUsers, icon: <Users size={20} />, color: '#6366f1' },
          { label: 'Giáo viên', value: stats.teachers, icon: <Shield size={20} />, color: 'var(--accent-blue)' },
          { label: 'Học sinh', value: stats.students, icon: <Users size={20} />, color: 'var(--brand-primary)' },
          { label: 'Lớp học hoạt động', value: stats.activeClasses, icon: <Database size={20} />, color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="lms-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="lms-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Quản lý người dùng</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input placeholder="Tìm kiếm..." style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '200px' }} />
            </div>
            <button style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
              <Filter size={16} /> Lọc
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Người dùng', 'Vai trò', 'Trường học', 'Ngày tham gia', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, var(--brand-primary), var(--accent-blue))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '14px' }}>
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px' }}>{user.full_name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`lms-tag lms-tag-${user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'info' : 'success'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>{user.school_id ? 'Đã liên kết' : 'Tự do'}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontSize: '13px', fontWeight: 600 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }}></div> Online
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>Không tìm thấy người dùng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
