'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] text-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#16213e] border border-[#1e293b] p-10 rounded-2xl text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-[#00d2a0]/10 text-[#00d2a0] rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={40} />
        </div>

        <h2 className="text-2xl font-bold mb-4">Kiểm tra hộp thư của bạn</h2>
        <p className="text-slate-400 mb-2 leading-relaxed">
          Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Vui lòng kiểm tra hộp thư đến (Inbox) hoặc thư mục Spam, sau đó nhấp vào liên kết xác nhận để kích hoạt tài khoản.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => window.location.href = '/builder'}
            className="w-full bg-[#00d2a0] hover:bg-[#00e6af] text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,210,160,0.2)]"
          >
            Về trang chủ
          </button>

          <Link
            href="/login"
            className="text-sm text-[#00b4d8] hover:text-[#00d2a0] transition-colors font-medium"
          >
            <ArrowLeft size={14} className="inline mr-1" />
            Quay lại đăng nhập
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
