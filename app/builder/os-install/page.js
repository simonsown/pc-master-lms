'use client';

import dynamic from 'next/dynamic';

const OSInstallationSimulator = dynamic(
  () => import('@/components/OSInstallationSimulator'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function OSInstallPage() {
  return (
    <OSInstallationSimulator
      lang="vn"
      build={{}}
      onComplete={() => {
        window.location.href = '/builder';
      }}
      onExit={() => window.history.back()}
    />
  );
}
