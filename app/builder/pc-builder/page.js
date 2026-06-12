'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useBuildStore } from '@/lib/build-store';
import PartPickerSidebarV2 from '@/components/PartPickerSidebarV2';
import { getPriorityIssues } from '@/lib/compatibility-engine';

const SketchfabViewer = dynamic(
  () => import('@/components/SketchfabViewer'),
  { ssr: false, loading: () => (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13,
    }}>Đang tải mô hình Sketchfab...</div>
  )}
);

const PERF_LABELS = { gaming: 'Gaming', productivity: 'Làm việc', workstation: 'Đồ họa', value: 'Giá trị' };
const EFF_LABELS = {
  '80plus_white': 'White', '80plus_bronze': 'Bronze', '80plus_silver': 'Silver',
  '80plus_gold': 'Gold', '80plus_platinum': 'Platinum', '80plus_titanium': 'Titanium',
};

export default function PCBuilderPage() {
  const store = useBuildStore();
  const [showPicker, setShowPicker] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const parts = useMemo(() => ({
    cpu: store.cpu, gpu: store.gpu, mainboard: store.mainboard,
    ram: store.ram, psu: store.psu, case: store.case,
    cooler: store.cooler, ssd: store.ssd,
  }), [store.cpu, store.gpu, store.mainboard, store.ram, store.psu, store.case, store.cooler, store.ssd]);

  const { errors, warnings } = useMemo(() => getPriorityIssues(store.issues), [store.issues]);

  const hasAny = useMemo(() => Object.values(parts).some(v =>
    v !== null && !(Array.isArray(v) && v.length === 0)
  ), [parts]);

  const handleSave = async () => {
    setSaving(true);
    const id = await store.saveToSupabase();
    if (id) setSavedId(id);
    setSaving(false);
    setTimeout(() => setSavedId(null), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui,sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🖥️</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>PC Builder 3D</span>
          <span style={{
            background: store.score >= 80 ? 'rgba(0,212,170,0.12)' : store.score >= 50 ? 'rgba(255,163,0,0.12)' : 'rgba(244,106,106,0.12)',
            color: store.score >= 80 ? '#00d4aa' : store.score >= 50 ? '#ffa300' : '#f46a6a',
            padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
          }}>
            {store.score}/100
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowPicker(p => !p)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-default)',
              background: showPicker ? 'var(--accent-blue)' : 'var(--bg-elevated)',
              color: showPicker ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
            }}>
            {showPicker ? '🔧 Linh kiện' : '🔧 Chọn'}
          </button>
          <button onClick={handleSave} disabled={saving || !hasAny}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--brand-primary)', cursor: 'pointer',
              background: savedId ? 'rgba(0,212,170,0.15)' : 'var(--brand-primary)',
              color: savedId ? '#00d4aa' : '#fff',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
              opacity: (!hasAny || saving) ? 0.5 : 1,
            }}>
            {saving ? '⏳ Đang lưu...' : savedId ? '✅ Đã lưu' : '💾 Lưu Build'}
          </button>
          <button onClick={() => window.history.back()}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-default)',
              background: 'transparent', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
            }}>
            ✕ Đóng
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', gap: 12, padding: 12, overflow: 'hidden',
      }}>
        {/* Left: Part Picker */}
        {showPicker && (
          <div style={{ flexShrink: 0 }}>
            <PartPickerSidebarV2 lang="vn" />
          </div>
        )}

        {/* Center: 3D View */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SketchfabViewer parts={parts} />
        </div>

        {/* Right: Build Summary */}
        <div style={{
          width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
        }}>
          {/* Issues */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)', padding: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              ⚠️ Tương thích
            </div>
            {errors.length === 0 && warnings.length === 0 ? (
              <div style={{ color: '#00d4aa', fontSize: 11, fontWeight: 600 }}>✅ Tất cả tương thích</div>
            ) : (
              <>
                {errors.map((e, i) => (
                  <div key={i} style={{ color: '#f46a6a', fontSize: 10, padding: '2px 0' }}>✕ {e}</div>
                ))}
                {warnings.map((w, i) => (
                  <div key={i} style={{ color: '#ffa300', fontSize: 10, padding: '2px 0' }}>⚠ {w}</div>
                ))}
              </>
            )}
          </div>

          {/* Performance */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)', padding: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              🚀 Hiệu năng
            </div>
            {Object.entries(store.performance).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{PERF_LABELS[key]}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{Math.round(val)}</span>
                </div>
                <div style={{
                  height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(100, val)}%`, height: '100%',
                    background: val >= 80 ? '#00d4aa' : val >= 50 ? '#ffa300' : '#f46a6a',
                    borderRadius: 2, transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Specs Summary */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)', padding: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              📊 Thông số
            </div>
            {[
              { label: 'TDP', value: store.totalTdp ? `${store.totalTdp}W` : '—' },
              { label: 'Tổng tiền', value: store.totalPrice ? `${(store.totalPrice / 1e6).toFixed(1)}tr` : '—', color: store.totalPrice > store.budget ? '#f46a6a' : undefined },
              { label: 'Ngân sách', value: store.budget ? `${(store.budget / 1e6).toFixed(1)}tr` : '—' },
              { label: 'Số linh kiện', value: Object.values(parts).filter(v => v && !(Array.isArray(v) && v.length === 0)).length + (parts.ram?.length || 0) + (parts.ssd?.length || 0) - 2 },
              ...(parts.psu ? [{ label: 'PSU', value: `${parts.psu.psu_wattage}W ${EFF_LABELS[parts.psu.psu_efficiency] || ''}` }] : []),
              ...(parts.cpu ? [{ label: 'CPU', value: `${parts.cpu.cpu_cores}C/${parts.cpu.cpu_threads}T` }] : []),
              ...(parts.gpu ? [{ label: 'GPU', value: `${parts.gpu.gpu_vram_gb}GB` }] : []),
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 10,
                padding: '2px 0', color: row.color || 'var(--text-primary)',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {hasAny && (
            <button onClick={store.clearAll}
              style={{
                padding: '8px', borderRadius: 8, border: '1px solid rgba(244,106,106,0.3)',
                background: 'rgba(244,106,106,0.06)', color: '#f46a6a',
                cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
              }}>
              🗑️ Xoá tất cả
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
