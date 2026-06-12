'use client'

import React from 'react'
import PageTransition from '@/components/PageTransition'
import FeatureSidebar from '@/components/FeatureSidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <FeatureSidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
