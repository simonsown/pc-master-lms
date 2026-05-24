import React from 'react'

export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-[#1d1f2a] rounded-lg w-44" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#1d1f2a] rounded-xl" />)}
      </div>
      <div className="h-60 bg-[#1d1f2a] rounded-xl" />
    </div>
  )
}
export default function StudentDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080910] p-6 md:p-8 lg:p-10">
      <div className="max-w-[1440px] mx-auto space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-36 rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr]">
          <div className="h-[340px] rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
          <div className="space-y-4">
            <div className="h-48 rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
            <div className="h-56 rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
          </div>
        </div>
        <div className="h-[340px] rounded-3xl bg-[#0f1018] border border-[#1d1f2a]" />
      </div>
    </div>
  )
}
