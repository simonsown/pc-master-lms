'use client';

import dynamic from 'next/dynamic';

const CableManagementGame = dynamic(
  () => import('@/components/CableManagementGame'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function CableGamePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <CableManagementGame
        lang="vn"
        onComplete={(data) => {
          console.log('Cable game complete:', data);
          window.location.href = '/builder';
        }}
        onExit={() => window.history.back()}
      />
    </div>
  );
}
