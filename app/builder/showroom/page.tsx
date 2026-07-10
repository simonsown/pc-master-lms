'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ShowroomScene = dynamic(() => import('@/components/ShowroomScene'), { ssr: false });

export default function ShowroomPage() {
  const [component, setComponent] = useState<string | null>(null);

  return (
    <div className="w-full h-screen bg-[#080818] relative">
      <ShowroomScene component={component} onBack={() => setComponent(null)} />
    </div>
  );
}
