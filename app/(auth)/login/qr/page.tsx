'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QrCode, ArrowLeft, RefreshCcw, Smartphone, Monitor, CheckCircle2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRLoginPage() {
  const [timeLeft, setTimeLeft] = useState(30)
  const [qrValue, setQrValue] = useState('pcmaster-login-' + Math.random().toString(36).substring(7))

  useEffect(() => {
    if (timeLeft === 0) {
      setQrValue('pcmaster-login-' + Math.random().toString(36).substring(7))
      setTimeLeft(30)
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#16213e] border border-[#1e293b] p-8 md:p-10 rounded-3xl shadow-2xl text-center"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Quay lại Đăng nhập</span>
        </Link>

        <div className="mb-6 inline-flex p-4 bg-[#00d2a0]/10 text-[#00d2a0] rounded-2xl">
          <QrCode size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Đăng nhập bằng mã QR</h2>
        <p className="text-slate-400 text-sm mb-8">Quét mã bằng ứng dụng di động PC Master để đăng nhập ngay lập tức.</p>

        <div className="relative inline-block p-6 bg-white rounded-3xl mb-8">
          <QRCodeSVG value={qrValue} size={200} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-[#0f0f1a] rounded-xl flex items-center justify-center border-4 border-white">
               <img src="/logo.png" alt="Logo" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mb-8">
          <RefreshCcw size={16} className={`transition-transform duration-1000 ${timeLeft < 5 ? 'animate-spin' : ''}`} />
          <span>Mã sẽ hết hạn sau <span className="text-white font-bold">{timeLeft}s</span></span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
            <Smartphone size={20} className="text-[#00d2a0] mb-2" />
            <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Bước 1</p>
            <p className="text-xs leading-relaxed text-slate-300">Mở PC Master trên điện thoại của bạn.</p>
          </div>
          <div className="p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
            <Monitor size={20} className="text-[#00d2a0] mb-2" />
            <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Bước 2</p>
            <p className="text-xs leading-relaxed text-slate-300">Quét mã QR trên màn hình này.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1e293b]">
          <p className="text-xs text-slate-500">
            Gặp khó khăn? <Link href="/login" className="text-[#00d2a0] hover:underline">Thử cách đăng nhập khác</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
