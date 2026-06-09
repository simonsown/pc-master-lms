'use client';

import dynamic from 'next/dynamic';

const DiagnosisMode = dynamic(
  () => import('@/components/DiagnosisMode'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function DiagnosisPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <DiagnosisMode
        lang="vn"
        onComplete={(results) => {
          console.log('Diagnosis complete:', results);
          window.location.href = '/builder';
        }}
        onExit={() => window.history.back()}
      />
    </div>
  );
}
