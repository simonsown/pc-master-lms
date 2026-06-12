'use client';

import dynamic from 'next/dynamic';

const CommonMistakes = dynamic(
  () => import('@/components/CommonMistakes'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: '#636678' }}>Đang tải...</div> }
);

export default function CommonMistakesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0e13', position: 'relative' }}>
      <CommonMistakes lang="vn" onExit={() => window.history.back()} />
    </div>
  );
}
