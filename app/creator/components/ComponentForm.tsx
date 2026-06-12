'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase-client';
import { COMPONENT_SPECS, type ComponentRenderSpec } from '@/data/componentSpecs';
import ComponentRenderer2D from '@/components/builder/ComponentRenderer2D';
import { useComponentLock } from '@/hooks/useComponentUpdates';

interface ComponentFormProps {
  componentId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const COMPONENT_TYPES = ['cpu', 'gpu', 'ram', 'motherboard', 'psu', 'case', 'cooler', 'ssd', 'hdd'] as const;

export default function ComponentForm({ componentId, onSave, onCancel }: ComponentFormProps) {
  const existingSpec = componentId ? COMPONENT_SPECS.find((s) => s.id === componentId) : null;

  const [form, setForm] = useState({
    name: existingSpec?.name || '',
    type: existingSpec?.type || 'cpu',
    brand: existingSpec?.brand || '',
    model: existingSpec?.model || '',
    width_mm: existingSpec?.dimensions.width_mm || 100,
    height_mm: existingSpec?.dimensions.height_mm || 100,
    depth_mm: existingSpec?.dimensions.depth_mm || 10,
    pcbColor: existingSpec?.colors.pcb || '#1a1a2e',
    heatsinkColor: existingSpec?.colors.heatsink || '#c0c0c0',
    shroudColor: existingSpec?.colors.shroud || '#333333',
    connectorColor: existingSpec?.colors.connector || '#d4af37',
    accentColor: existingSpec?.colors.accent || '#00d4aa',
    ledColor: existingSpec?.colors.led || '#00d4aa',
  });

  const [saving, setSaving] = useState(false);
  const [lockAcquired, setLockAcquired] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const { lockComponent, releaseLock, heartbeat } = useComponentLock(componentId || null);

  useEffect(() => {
    if (!componentId || componentId === 'new') return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const ok = await lockComponent(user.id);
      if (!ok) { onCancel(); return; }
      setLockAcquired(true);
      heartbeatRef.current = setInterval(async () => {
        await heartbeat(user.id);
      }, 4 * 60 * 1000);
    })();
    return () => {
      cancelled = true;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      (async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && componentId) await releaseLock(user.id);
      })();
    };
  }, [componentId]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const previewSpec: ComponentRenderSpec = {
    id: 'preview',
    name: form.name || 'Preview',
    type: form.type as ComponentRenderSpec['type'],
    brand: form.brand || 'Brand',
    model: form.model || 'Model',
    dimensions: { width_mm: form.width_mm, height_mm: form.height_mm, depth_mm: form.depth_mm },
    colors: {
      pcb: form.pcbColor,
      heatsink: form.heatsinkColor,
      shroud: form.shroudColor,
      connector: form.connectorColor,
      accent: form.accentColor,
      led: form.ledColor,
    },
    connectors: [],
    techSpecs: {},
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (componentId && componentId !== 'new') {
        await supabase.from('components').update({
          name: form.name,
          type: form.type,
          brand: form.brand,
          model: form.model,
          dimensions: { width_mm: form.width_mm, height_mm: form.height_mm, depth_mm: form.depth_mm },
          colors: {
            pcb: form.pcbColor,
            heatsink: form.heatsinkColor,
            shroud: form.shroudColor,
            connector: form.connectorColor,
            accent: form.accentColor,
            led: form.ledColor,
          },
          updated_at: new Date().toISOString(),
        }).eq('id', componentId);
      } else {
        await supabase.from('components').insert({
          name: form.name,
          type: form.type,
          brand: form.brand,
          model: form.model,
          dimensions: { width_mm: form.width_mm, height_mm: form.height_mm, depth_mm: form.depth_mm },
          colors: {
            pcb: form.pcbColor,
            heatsink: form.heatsinkColor,
            shroud: form.shroudColor,
            connector: form.connectorColor,
            accent: form.accentColor,
            led: form.ledColor,
          },
          created_by: user?.id,
          status: 'draft',
        });
      }
      onSave();
    } catch (err) {
      console.error('Save failed:', err);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13, outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, display: 'block',
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          {componentId === 'new' ? 'Tạo linh kiện mới' : 'Chỉnh sửa linh kiện'}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{
              padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
              background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              opacity: saving ? 0.6 : 1,
            }}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Tên linh kiện</label>
            <input style={inputStyle} value={form.name}
              onChange={(e) => updateField('name', e.target.value)} placeholder="VD: Intel Core i5-13600K" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Loại</label>
            <select style={inputStyle} value={form.type}
              onChange={(e) => updateField('type', e.target.value)}>
              {COMPONENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Hãng</label>
            <input style={inputStyle} value={form.brand}
              onChange={(e) => updateField('brand', e.target.value)} placeholder="VD: Intel, AMD, NVIDIA" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Model</label>
            <input style={inputStyle} value={form.model}
              onChange={(e) => updateField('model', e.target.value)} placeholder="VD: Core i5-13600K" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Kích thước (mm)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Rộng</div>
                <input type="number" style={inputStyle} value={form.width_mm}
                  onChange={(e) => updateField('width_mm', Number(e.target.value))} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Cao</div>
                <input type="number" style={inputStyle} value={form.height_mm}
                  onChange={(e) => updateField('height_mm', Number(e.target.value))} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Sâu</div>
                <input type="number" style={inputStyle} value={form.depth_mm}
                  onChange={(e) => updateField('depth_mm', Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Màu sắc</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { key: 'pcbColor', label: 'PCB' },
                { key: 'heatsinkColor', label: 'Tản nhiệt' },
                { key: 'shroudColor', label: 'Vỏ bọc' },
                { key: 'connectorColor', label: 'Connector' },
                { key: 'accentColor', label: 'Nhấn' },
                { key: 'ledColor', label: 'LED' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" value={(form as any)[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      style={{ width: 32, height: 32, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0 }} />
                    <input style={{ ...inputStyle, flex: 1 }} value={(form as any)[key]}
                      onChange={(e) => updateField(key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Xem trước 2D</label>
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            minHeight: 300,
          }}>
            <ComponentRenderer2D
              spec={previewSpec}
              scale={1}
              showConnectors={true}
              showDimensions={true}
              viewMode="top"
            />
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
            Kích thước: {form.width_mm}mm × {form.height_mm}mm × {form.depth_mm}mm
          </div>
        </div>
      </div>
    </div>
  );
}
