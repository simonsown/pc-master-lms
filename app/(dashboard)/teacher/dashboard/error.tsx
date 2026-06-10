'use client'

import React from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="text-3xl">⚠️</div>
      <p className="text-[#d8dbe8] font-medium">{error.message || 'Có lỗi xảy ra'}</p>
      <button onClick={reset}
        className="px-4 py-2 bg-[#00d4aa]/12 border border-[#00d4aa]/30 text-[#00d4aa] rounded-lg text-sm">
        Thử lại
      </button>
    </div>
  )
}
