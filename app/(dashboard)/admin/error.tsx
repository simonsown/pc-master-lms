// Path: app/(dashboard)/admin/error.tsx
'use client'
import { useEffect } from 'react'

export default function Error({
  error, reset
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-4xl">⚠️</div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#d8dbe8] mb-2">Có lỗi xảy ra</h2>
        <p className="text-sm text-[#5a5d72] mb-4">{error.message || 'Vui lòng thử lại'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#00d4aa]/15 border border-[#00d4aa]/30
                     text-[#00d4aa] rounded-lg text-sm font-medium hover:bg-[#00d4aa]/25 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
