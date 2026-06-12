'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import ComponentForm from './components/ComponentForm';
import { COMPONENT_SPECS } from '@/data/componentSpecs';

interface ComponentItem {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  status: string;
  is_published: boolean;
  created_at: string;
}

export default function CreatorDashboard() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'review' | 'published'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to local data if Supabase table doesn't exist
        setComponents(COMPONENT_SPECS.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          brand: s.brand,
          model: s.model,
          status: 'published',
          is_published: true,
          created_at: new Date().toISOString(),
        })));
      } else {
        setComponents(data || []);
      }
    } catch (err) {
      // Fallback to local data
      setComponents(COMPONENT_SPECS.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        brand: s.brand,
        model: s.model,
        status: 'published',
        is_published: true,
        created_at: new Date().toISOString(),
      })));
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? components : components.filter((c) => c.status === filter);

  const statusColors: Record<string, string> = {
    draft: '#64748b',
    review: '#f59e0b',
    published: '#22c55e',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', color: '#e2e8f0' }}>
      <div style={{
        width: 320, borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🔧</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Component Creator Studio</span>
          </div>
          <div style={{
            display: 'inline-flex', padding: '2px 10px', borderRadius: 100,
            background: 'rgba(168,85,247,0.2)', color: '#a855f7',
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Creator Mode
          </div>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['all', 'draft', 'review', 'published'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#00d4aa' : '#94a3b8',
                border: `1px solid ${filter === f ? '#00d4aa' : 'transparent'}`,
              }}>
              {f === 'all' ? 'Tất cả' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {loading && <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading...</div>}
          {filtered.map((comp) => (
            <div key={comp.id} onClick={() => setEditingId(comp.id)}
              style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                background: editingId === comp.id ? 'rgba(0,212,170,0.08)' : 'transparent',
                border: `1px solid ${editingId === comp.id ? 'rgba(0,212,170,0.3)' : 'transparent'}`,
              }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{comp.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{comp.type.toUpperCase()}</span>
                <span style={{
                  padding: '1px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600,
                  background: `${statusColors[comp.status]}20`,
                  color: statusColors[comp.status],
                }}>
                  {comp.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setEditingId('new')}
            style={{
              width: '100%', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
              color: '#fff', border: 'none', fontWeight: 600, fontSize: 13,
            }}>
            + Tạo linh kiện mới
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editingId ? (
          <ComponentForm
            componentId={editingId === 'new' ? null : editingId}
            onSave={() => { setEditingId(null); loadComponents(); }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chọn một linh kiện để chỉnh sửa</div>
            <div style={{ fontSize: 14 }}>hoặc nhấn "Tạo linh kiện mới" để bắt đầu</div>
          </div>
        )}
      </div>
    </div>
  );
}
