'use client';

import dynamic from 'next/dynamic';

const VRShowroom = dynamic(() => import('@/components/VRShowroom/VRShowroom'), { ssr: false });

export default function ShowroomPage() {
  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative">
      <VRShowroom />
    </div>
  );
}
