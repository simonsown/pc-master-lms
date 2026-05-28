import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import { ChildCard } from '@/components/parent/ChildCard'
import { Users, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentChildrenPage() {
  // 1. Xác thực và bảo vệ route
  const user = await requireRole(['parent', 'admin'])
  
  // 2. Fetch danh sách con đang theo dõi
  const supabase = await createClient()
  const { data: children } = await supabase
    .from('child_summary_for_parent')
    .select('*')
    .eq('parent_id', user.id)
    .order('student_name')

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            Học sinh đang theo dõi
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Danh sách tất cả tài khoản con đã được liên kết với bạn.
          </p>
        </div>
        <a
          href="/parent/link-child"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 self-start md:self-auto"
          style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', color: 'var(--brand-primary)' }}
        >
          <Plus size={16} />
          Liên kết thêm con
        </a>
      </div>

      {(!children || children.length === 0) ? (
        <div className="rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto my-12" style={{ background: 'var(--bg-surface)', border: '1.5px dashed rgba(0, 212, 170, 0.25)' }}>
          <div className="text-5xl mb-5">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Chưa liên kết tài khoản con</h3>
          <p className="text-sm mb-6 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Nhập mã học sinh của con bạn để bắt đầu cập nhật điểm quiz, bài luyện tập và theo dõi tiến độ của con.
          </p>
          <a
            href="/parent/link-child"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150"
            style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', color: 'var(--brand-primary)' }}
          >
            Liên kết con ngay
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {children.map((child) => (
            <ChildCard key={child.student_id} child={child} />
          ))}
        </div>
      )}
    </div>
  )
}
