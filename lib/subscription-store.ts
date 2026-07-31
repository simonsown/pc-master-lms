export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  priceLabel: string
  unit: string
  color: string
  highlight: boolean
  features: string[]
}

export interface Subscription {
  planId: string
  planName: string
  price: number
  activatedAt: string
  expiresAt: string | null
  method: 'purchase' | 'code'
  code?: string
}

export const SUBSCRIPTION_KEY = 'pcm_subscription'
export const VIP_CODE = '123'

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'student',
    name: 'Học Sinh',
    price: 20000,
    priceLabel: '20.000đ',
    unit: '/ tháng',
    color: '#06b6d4',
    highlight: false,
    features: [
      'Toàn bộ khóa học (20 chương)',
      'Học full bài học & slide 3D tương tác',
      'Video bài giảng 3D không giới hạn',
      'Lưu tiến trình học cá nhân',
    ],
  },
  {
    id: 'personal',
    name: 'Cá Nhân Pro',
    price: 39000,
    priceLabel: '39.000đ',
    unit: '/ tháng',
    color: '#00d4aa',
    highlight: true,
    features: [
      'Tất cả quyền lợi gói Học Sinh',
      'AI Tutor tư vấn chống chặt chém',
      'Tra giá linh kiện Google thật',
      'Career PC Build & so sánh cấu hình',
    ],
  },
  {
    id: 'school',
    name: 'Trường Học (B2B)',
    price: 49000,
    priceLabel: '49.000đ',
    unit: '/ học sinh / năm',
    color: '#6366f1',
    highlight: false,
    features: [
      'Tất cả quyền lợi Cá nhân Pro',
      'LMS Dashboard cho Giáo viên',
      'Bài giảng theo lớp học',
      'Báo cáo tiến độ & hỗ trợ 24/7',
    ],
  },
]

export function getSubscription(): Subscription | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY)
    if (!raw) return null
    const sub = JSON.parse(raw) as Subscription
    if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) return null
    return sub
  } catch {
    return null
  }
}

export function isVip(): boolean {
  return getSubscription() !== null
}

export function activatePlan(planId: string, months = 1): Subscription {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) throw new Error('Gói không tồn tại')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000)
  const sub: Subscription = {
    planId,
    planName: plan.name,
    price: plan.price,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    method: 'purchase',
  }
  try {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub))
  } catch {}
  return sub
}

export function redeemCode(code: string): { ok: boolean; message: string; sub?: Subscription } {
  const normalized = code.trim().toUpperCase()
  if (normalized === VIP_CODE) {
    const sub: Subscription = {
      planId: 'vip',
      planName: 'VIP (Mã giáo viên)',
      price: 0,
      activatedAt: new Date().toISOString(),
      expiresAt: null,
      method: 'code',
      code: normalized,
    }
    try {
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub))
    } catch {}
    return { ok: true, message: 'Kích hoạt VIP thành công!', sub }
  }
  return { ok: false, message: 'Mã kích hoạt không hợp lệ. Hãy kiểm tra lại.' }
}

export function getSubscriptionInfo(): { active: boolean; sub: Subscription | null; plans: SubscriptionPlan[] } {
  return { active: isVip(), sub: getSubscription(), plans: SUBSCRIPTION_PLANS }
}
