'use client';

import dynamic from 'next/dynamic';

const ThermalHeatmap = dynamic(
  () => import('@/components/ThermalHeatmap'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function ThermalPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <ThermalHeatmap
        lang="vn"
        build={{}}
        onExit={() => window.history.back()}
      />
    </div>
  );
}
