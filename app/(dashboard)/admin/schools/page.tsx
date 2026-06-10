'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, Plus, Trash2, Loader2, Search, Users, MapPin } from 'lucide-react';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', address: '' });

  useEffect(() => { fetchSchools() }, []);

  async function fetchSchools() {
    const { data } = await supabase.from('profiles').select('school').not('school', 'is', null).not('school', 'eq', '');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(p => { counts[p.school] = (counts[p.school] || 0) + 1 });
      setSchools(Object.entries(counts).map(([name, count]) => ({ name, count })));
    }
    setLoading(false);
  }

  const filtered = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Trường học</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>{schools.length} trường trên hệ thống.</p>
        </div>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm trường..." style={{
            width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map((school, i) => (
          <div key={i} className="lms-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(var(--brand-primary-rgb),0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Book size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{school.name}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Users size={14} /> {school.count} học sinh
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Book size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p>Chưa có trường học nào.</p>
        </div>
      )}
    </div>
  );
}
