'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0e13] text-[#dde0ed]">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Đã xảy ra lỗi</h2>
      <p className="text-gray-400 mb-6">{error.message}</p>
      <button onClick={() => reset()} className="bg-[#00d4aa] text-[#0d0e13] px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity">Thử lại</button>
    </div>
  )
}
