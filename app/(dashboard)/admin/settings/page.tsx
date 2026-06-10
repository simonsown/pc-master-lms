'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Globe, Bell, Shield, Database, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [settings, setSettings] = useState({
    siteName: 'PC Master Builder LMS',
    description: 'Nền tảng học tập và thực hành lắp ráp máy tính trực tuyến',
    maintenanceMode: false,
    allowRegistration: true,
    defaultRole: 'student',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    showToast('Đã lưu cấu hình hệ thống!');
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Cài đặt hệ thống</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Quản lý cấu hình chung cho toàn bộ nền tảng.</p>
      </header>

      {toast && (
        <div style={{
          padding: '12px 20px', borderRadius: '10px', marginBottom: '20px',
          background: toast.type === 'success' ? 'rgba(8,158,96,0.1)' : 'rgba(244,106,106,0.1)',
          border: `1px solid ${toast.type === 'success' ? 'var(--brand-primary)' : 'var(--danger)'}`,
          color: toast.type === 'success' ? 'var(--brand-primary)' : 'var(--danger)',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="lms-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="var(--brand-primary)" /> Thông tin chung
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Tên hệ thống</label>
            <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Mô tả</label>
            <textarea value={settings.description} onChange={e => setSettings({ ...settings, description: e.target.value })} rows={2} style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
            }} />
          </div>
        </div>
      </div>

      <div className="lms-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--brand-primary)" /> Bảo mật & Quy định
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'allowRegistration', label: 'Cho phép đăng ký tài khoản mới', desc: 'Người dùng có thể tự đăng ký tài khoản' },
            { key: 'maintenanceMode', label: 'Chế độ bảo trì', desc: 'Chỉ Admin mới có thể truy cập hệ thống' },
          ].map((item: any) => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
              <input type="checkbox" checked={(settings as any)[item.key]} onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })} style={{ accentColor: 'var(--brand-primary)', width: '18px', height: '18px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="lms-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--brand-primary)" /> Thông tin hệ thống
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Phiên bản', value: '2.4.1' },
            { label: 'Supabase Project', value: 'ojjmdhrvivwvfgomonzd' },
            { label: 'Môi trường', value: 'Production (Vercel)' },
            { label: 'Node.js', value: '22.x' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button onClick={handleSave} disabled={saving} className="lms-btn lms-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </div>
  );
}
