'use client'

import { useEffect } from 'react'

export default function StudentDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#080910] p-6 md:p-8 lg:p-10 flex items-center justify-center">
      <div className="max-w-xl rounded-3xl border border-[#1d1f2a] bg-[#0f1018] p-10 text-center">
        <div className="text-5xl">⚠️</div>
        <h2 className="mt-4 text-2xl font-semibold text-[#d8dbe8]">Có lỗi xảy ra</h2>
        <p className="mt-3 text-sm text-[#5a5d72]">Vui lòng thử lại hoặc quay lại sau ít phút.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded-full bg-[#00d4aa] px-6 py-3 text-sm font-semibold text-[#080910] transition hover:bg-[#00b89c]"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
