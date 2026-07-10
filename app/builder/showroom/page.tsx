'use client';

import dynamic from 'next/dynamic';

const ShowroomScene = dynamic(() => import('@/components/ShowroomScene'), { ssr: false });

export default function ShowroomPage() {
  return (
    <div className="w-full h-screen bg-[#080818] relative">
      <ShowroomScene />
    </div>
  );
}
