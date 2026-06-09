'use client';

import dynamic from 'next/dynamic';

const MacCompatibilityChecker = dynamic(
  () => import('@/components/MacCompatibilityChecker'),
  { ssr: false, loading: () => <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> }
);

export default function MacCheckPage() {
  return <MacCompatibilityChecker lang="vn" />;
}
