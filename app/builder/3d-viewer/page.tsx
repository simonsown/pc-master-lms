'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Viewer3DPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/builder/showroom');
  }, [router]);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080818', color: '#6688aa',
      fontFamily: 'monospace', fontSize: 14,
    }}>
      Đang chuyển hướng đến Showroom 3D...
    </div>
  );
}
