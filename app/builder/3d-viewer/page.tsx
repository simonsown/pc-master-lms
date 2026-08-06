'use client';

import dynamic from 'next/dynamic';

const PCExplodedViewer = dynamic(() => import('@/components/PCExplodedViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-400 font-mono gap-3">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span>Đang khởi tạo môi trường 3D Bóc Tách Linh Kiện...</span>
    </div>
  )
});

export default function Viewer3DPage() {
  return <PCExplodedViewer />;
}

