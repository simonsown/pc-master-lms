'use client'

import React, { useState } from 'react'
import { changePassword } from '@/actions/profile'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { LogOut } from 'lucide-react'

export function SecurityForm() {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPass !== confirmPass) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPass, newPass)
      toast.success('Đổi mật khẩu thành công!')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đổi mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (!error) {
      toast.success('Đã đăng xuất khỏi tất cả thiết bị!')
      window.location.href = '/login'
    } else {
      toast.error('Lỗi khi đăng xuất.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đổi mật khẩu an toàn</h4>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
          <input 
            type="password" 
            required
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu mới</label>
          <input 
            type="password" 
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
            className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
          <input 
            type="password" 
            required
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Đang thực thi...' : 'Cập nhật mật khẩu'}
        </button>
      </form>

      {/* Global Signout */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Phiên đăng nhập & Bảo mật</h4>
        <p className="text-[10px] text-gray-500">Nếu nghi ngờ tài khoản bị lộ mật khẩu, bạn có thể thực hiện đăng xuất khỏi mọi thiết bị di động, web, máy tính khác ngay lập tức.</p>
        
        <button 
          onClick={handleLogoutAllDevices}
          className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={14} /> Đăng xuất khỏi tất cả thiết bị
        </button>
      </div>

    </div>
  )
}
