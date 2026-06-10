'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Shield, GraduationCap, Trash2, Mail, UserX, Loader2, ChevronDown, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    const channel = supabase.channel('admin-users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Xóa người dùng ${email}?`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert('Lỗi: ' + error.message);
    else fetchUsers();
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Quản lý người dùng</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>{users.length} người dùng trên hệ thống.</p>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm người dùng..." style={{
            width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
          }} />
        </div>
        {['all', 'student', 'teacher', 'admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
            background: roleFilter === r ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: roleFilter === r ? '#fff' : 'var(--text-muted)',
            fontWeight: 600, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit'
          }}>
            {r === 'all' ? 'Tất cả' : r === 'student' ? 'Học sinh' : r === 'teacher' ? 'Giáo viên' : 'Admin'}
          </button>
        ))}
      </div>

      <div className="lms-card" style={{ overflow: 'hidden', padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                {['Người dùng', 'Email', 'Vai trò', 'Ngày tham gia', 'Hành động'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-blue))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '12px', flexShrink: 0
                      }}>
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px' }}>{user.full_name || 'Chưa có tên'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ID: {user.id?.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-primary)', fontSize: '13px' }}>{user.email || 'N/A'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                      background: user.role === 'admin' ? 'rgba(244,106,106,0.15)' : user.role === 'teacher' ? 'rgba(40,156,249,0.15)' : 'rgba(8,158,96,0.15)',
                      color: user.role === 'admin' ? 'var(--danger)' : user.role === 'teacher' ? 'var(--accent-blue)' : 'var(--brand-primary)'
                    }}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => deleteUser(user.id, user.email)} style={{
                      padding: '6px 10px', borderRadius: '6px', background: 'rgba(244,67,54,0.1)', border: 'none',
                      color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      <Trash2 size={14} />
                    </button>
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
