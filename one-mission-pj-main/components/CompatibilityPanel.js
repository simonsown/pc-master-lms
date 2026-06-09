'use client';

import { useBuildStore } from '@/lib/build-store';

const SEVERITY_CONFIG = {
  error: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', text: '#ef4444', icon: '✗', label: 'Lỗi' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', text: '#f59e0b', icon: '⚠', label: 'Cảnh báo' },
  info: { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', text: '#3b82f6', icon: 'ℹ', label: 'Thông tin' },
};

export default function CompatibilityPanel({ lang = 'vn' }) {
  const issues = useBuildStore(s => s.issues);
  const score = useBuildStore(s => s.score);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  const scoreColor = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const scoreLabel = score >= 90 ? 'Hoàn hảo' : score >= 70 ? 'Tốt' : score >= 50 ? 'Trung bình' : 'Kém';

  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: '12px',
      border: '1px solid var(--border-default)', overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Score Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
      }}>
        {/* Circular score */}
        <div style={{
          position: 'relative', width: '56px', height: '56px', flexShrink: 0,
        }}>
          <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-subtle)" strokeWidth="2.5"/>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={scoreColor} strokeWidth="2.5"
              strokeDasharray={`${score * 0.97} 100`}
              strokeLinecap="round"/>
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, color: scoreColor,
          }}>
            {score}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            {lang === 'en' ? 'Compatibility Check' : 'Kiểm tra tương thích'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {issues.length === 0
              ? (lang === 'en' ? 'No issues found — perfect build!' : 'Không có vấn đề — build hoàn hảo!')
              : `${issues.length} ${lang === 'en' ? 'issue(s) found' : 'vấn đề'} · ${scoreLabel}`}
          </div>
        </div>
      </div>

      {/* Issues list */}
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        {issues.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '20px',
            color: 'var(--success)', fontSize: '13px', fontWeight: 600,
          }}>
            {lang === 'en' ? '✓ All components compatible!' : '✓ Tất cả linh kiện tương thích!'}
          </div>
        )}
        {[...errors, ...warnings, ...infos].map((issue, i) => {
          const cfg = SEVERITY_CONFIG[issue.severity];
          return (
            <div key={i} style={{
              display: 'flex', gap: '10px', padding: '10px 12px',
              background: cfg.bg, borderRadius: '8px',
              borderLeft: `3px solid ${cfg.border}`,
            }}>
              <span style={{ fontSize: '14px', color: cfg.text, flexShrink: 0, marginTop: '2px' }}>{cfg.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px', fontWeight: 700, color: cfg.text,
                  marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>
                  {lang === 'en' ? issue.message : issue.message}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic',
                  padding: '4px 8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px',
                }}>
                  {lang === 'en' ? 'Fix' : 'Khắc phục'}: {issue.fix}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
