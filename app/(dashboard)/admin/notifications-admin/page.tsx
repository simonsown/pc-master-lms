'use client';

import React, { useState } from 'react';
import { Bell, Send, Users, BookOpen, Megaphone, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Thông báo</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Gửi thông báo đến người dùng trong hệ thống.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="lms-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={18} color="var(--brand-primary)" /> Tạo thông báo mới
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>Tiêu đề</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="lms-input" placeholder="Nhập tiêu đề thông báo" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>Nội dung</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="lms-input" style={{ padding: '12px 16px', height: 'auto', resize: 'vertical', minHeight: '100px' }} placeholder="Nhập nội dung thông báo..." />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>Đối tượng</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'Tất cả', icon: Users },
                  { value: 'students', label: 'Học sinh', icon: Users },
                  { value: 'teachers', label: 'Giáo viên', icon: BookOpen },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setTarget(opt.value)} style={{
                    padding: '8px 16px', borderRadius: '8px', border: `2px solid ${target === opt.value ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    background: target === opt.value ? 'var(--brand-subtle)' : 'transparent',
                    color: target === opt.value ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontWeight: 600, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                  }}>
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--brand-primary)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={18} /> Gửi thông báo
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent-amber)" /> Thông báo đã gửi
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { title: 'Lịch thi giữa kỳ', time: '2 giờ trước', status: 'Đã gửi', target: 'Tất cả', type: 'info' },
              { title: 'Bảo trì hệ thống', time: '1 ngày trước', status: 'Đã gửi', target: 'Tất cả', type: 'warning' },
              { title: 'Bài giảng mới', time: '2 ngày trước', status: 'Đã gửi', target: 'Giáo viên', type: 'success' },
              { title: 'Kết quả thi học kỳ', time: '3 ngày trước', status: 'Đã gửi', target: 'Học sinh', type: 'info' },
            ].map((notif, i) => (
              <div key={i} className="lms-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: notif.type === 'success' ? 'rgba(8,158,96,0.1)' : notif.type === 'warning' ? 'rgba(255,163,0,0.1)' : 'rgba(40,156,249,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notif.type === 'success' ? <CheckCircle size={16} color="var(--brand-primary)" /> : notif.type === 'warning' ? <AlertTriangle size={16} color="var(--accent-amber)" /> : <Info size={16} color="var(--accent-blue)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{notif.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span><Clock size={10} /> {notif.time}</span>
                    <span>{notif.target}</span>
                  </div>
                </div>
                <span className="lms-tag lms-tag-green" style={{ fontSize: '10px' }}>{notif.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
