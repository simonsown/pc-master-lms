import React from 'react'
import Link from 'next/link'

export default function QuizResultsPage({ params }: { params: { quizId: string } }) {
  const passed = true
  const score = 85
  const attemptId = params.quizId

  return (
    <div className="min-h-screen text-[#dde0ed] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-2xl w-full rounded-[28px] border p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl z-10" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        
        {passed && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent)' }}></div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black mb-2 uppercase tracking-tight text-white">Kết Quả Bài Kiểm Tra</h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>Mã lần làm: {attemptId}</p>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`w-36 h-36 rounded-full border-8 flex items-center justify-center mb-4 ${passed ? '' : 'border-red-500 text-red-500'}`} style={passed ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', boxShadow: '0 0 20px color-mix(in srgb, var(--brand-primary) 20%, transparent)' } as React.CSSProperties : undefined}>
            <span className="text-5xl font-black">{score}</span>
          </div>
          <h2 className={`text-2xl font-black ${passed ? '' : 'text-red-500'} uppercase tracking-widest`} style={passed ? { color: 'var(--brand-primary)' } as React.CSSProperties : undefined}>
            {passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Đúng</p>
            <p className="text-lg sm:text-xl font-black mt-1" style={{ color: 'var(--brand-primary)' }}>17/20</p>
          </div>
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Sai/Bỏ qua</p>
            <p className="text-lg sm:text-xl font-black text-red-500 mt-1">3</p>
          </div>
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Thời gian</p>
            <p className="text-lg sm:text-xl font-black text-white mt-1">12:34</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/student" className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-2xl hover:bg-gray-800/40 transition-all font-bold text-sm text-slate-300 hover:text-white">
            Về Dashboard
          </Link>
          {passed ? (
            <button className="px-6 py-3 text-[#0d0e13] rounded-2xl font-black hover:opacity-90 text-sm transition-opacity" style={{ background: 'var(--brand-primary)', boxShadow: '0 0 15px color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}>
              Nhận Chứng Chỉ
            </button>
          ) : (
            <button className="px-6 py-3 text-[#0d0e13] rounded-2xl font-black hover:opacity-90 text-sm transition-opacity" style={{ background: 'var(--brand-primary)' }}>
              Làm Lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
