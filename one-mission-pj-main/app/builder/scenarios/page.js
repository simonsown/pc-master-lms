'use client';

import dynamic from 'next/dynamic';

const BuildScenariosDashboard = dynamic(
  () => import('@/components/BuildScenariosDashboard'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function ScenariosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <BuildScenariosDashboard lang="vn" onExit={() => window.history.back()} />
    </div>
  );
}
