import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import { User, ShieldCheck, HelpCircle, Mail, Key } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentProfilePage() {
  const user = await requireRole(['parent', 'admin'])
  const supabase = await createClient()

  // Lấy email từ auth
  const { data: authData } = await supabase.auth.getUser()
  const email = authData.user?.email || 'Chưa cập nhật'

  // Fetch số lượng con đang liên kết
  const { count } = await supabase
    .from('parent_student_links')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', user.id)
    .eq('status', 'active')

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto space-y-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <User size={24} style={{ color: 'var(--brand-primary)' }} />
          Hồ sơ của bạn
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Thông tin tài khoản phụ huynh và cấu hình hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 rounded-2xl p-6 space-y-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold uppercase" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}>
              {user.full_name?.[0] || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.full_name || 'Phụ huynh'}</h2>
              <div className="text-xs rounded-full uppercase tracking-wider inline-block mt-1 font-bold px-2 py-0.5" style={{ color: 'var(--brand-primary)', background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
                Phụ huynh
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Mail size={16} />
                Email đăng nhập
              </span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} />
                Số lượng con liên kết
              </span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count || 0} học sinh</span>
            </div>
          </div>
        </div>

        {/* Security Policy Details */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck size={16} style={{ color: 'var(--brand-primary)' }} />
            Bảo mật & Quyền riêng tư
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Để tạo môi trường học tập thoải mái, PC Master áp dụng chính sách bảo mật thông tin nghiêm ngặt:
          </p>
          <ul className="text-xs space-y-2 list-disc pl-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            <li>Phụ huynh <span style={{ color: 'var(--text-primary)' }}>chỉ được xem</span> tiến độ %, streak, giờ học, và kết quả kiểm tra quiz tổng quát của con.</li>
            <li>Phụ huynh <span style={{ color: '#ef4444' }}>không thể xem</span> chi tiết các câu trả lời cụ thể trong bài làm hoặc can thiệp bài học của con.</li>
            <li>Học sinh có quyền thu hồi quyền theo dõi của phụ huynh bất cứ lúc nào trong trang cá nhân của mình.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
