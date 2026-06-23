'use client'

import React, { useState, useTransition } from 'react'
import { Bell, Check, Trash2, Calendar, BookOpen, Award, Trophy, UserMinus } from 'lucide-react'

interface StudentProfile {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: any
  action_url: string
  is_read: boolean
  created_at: string
}

interface ParentNotificationsViewProps {
  initialNotifications: Notification[]
  students: StudentProfile[]
  markAllAsRead: () => Promise<void>
  deleteAll: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  deleteSingle: (id: string) => Promise<void>
}

type TabType = 'all' | 'lesson' | 'quiz' | 'absent'

export default function ParentNotificationsView({
  initialNotifications,
  students,
  markAllAsRead,
  deleteAll,
  markAsRead,
  deleteSingle
}: ParentNotificationsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()

  // Tạo map tra cứu học sinh theo id
  const studentMap = React.useMemo(() => {
    const map = new Map<string, StudentProfile>()
    students.forEach((s) => map.set(s.id, s))
    return map
  }, [students])

  // Lọc thông báo dựa trên tab đang chọn
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === 'all') return true
      if (activeTab === 'lesson') return notif.type === 'lesson_completed'
      if (activeTab === 'quiz') return notif.type === 'quiz_graded' || notif.type === 'child_low_score'
      if (activeTab === 'absent') return notif.type === 'child_absent'
      return false
    })
  }, [notifications, activeTab])

  // UI icon cho từng loại thông báo
  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <BookOpen size={16} className="text-blue-400" />
      case 'quiz_graded':
        return <Award size={16} className="text-[#00d4aa]" />
      case 'child_low_score':
        return <Award size={16} className="text-red-400" />
      case 'child_absent':
        return <UserMinus size={16} className="text-orange-400" />
      default:
        return <Bell size={16} className="text-[#636678]" />
    }
  }

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    })
  }

  // Xóa tất cả thông báo
  const handleDeleteAll = () => {
    if (!confirm('Bạn muốn xóa tất cả thông báo?')) return
    startTransition(async () => {
      await deleteAll()
      setNotifications([])
    })
  }

  // Đánh dấu đọc một thông báo
  const handleMarkSingleRead = async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  // Xóa một thông báo
  const handleDeleteSingle = async (id: string) => {
    await deleteSingle(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Bell size={24} style={{ color: 'var(--brand-primary)' }} />
            Thông báo Phụ huynh
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Quản lý thông báo tiến độ, điểm quiz, streaks và thành tích của con.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)', color: 'var(--brand-primary)' }}
            >
              <Check size={14} />
              Đã đọc tất cả
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
            >
              <Trash2 size={14} />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar scroll-smooth" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'lesson', label: 'Tiến độ học' },
          { key: 'quiz', label: 'Điểm số' },

          { key: 'absent', label: 'Nghỉ học' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap border"
            style={{
              background: activeTab === tab.key ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
              borderColor: activeTab === tab.key ? 'rgba(0, 212, 170, 0.3)' : 'transparent',
              color: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--text-muted)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl p-10 md:p-14 text-center my-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <Bell size={24} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Không tìm thấy thông báo
          </h3>
          <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Không có thông báo nào khớp với danh mục bộ lọc hiện tại của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const studentId = notif.data?.student_id
            const student = studentId ? studentMap.get(studentId) : null

            return (
              <div
                key={notif.id}
                className="rounded-xl p-4 transition-all flex items-start gap-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: notif.is_read ? '1px solid var(--border-subtle)' : '1px solid rgba(0, 212, 170, 0.2)',
                  opacity: notif.is_read ? 0.6 : 1
                }}
              >
                {/* Loại icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  {getIcon(notif.type)}
                </div>

                {/* Avatar & Tên học sinh */}
                {student && (
                  <div className="flex-shrink-0 relative hidden sm:block">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ border: '1px solid var(--border-default)' }}
                        alt={student.full_name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}>
                        {student.full_name[0] || 'S'}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-[10px] px-1 rounded-md font-bold uppercase scale-75" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-primary)', border: '1px solid var(--border-subtle)' }}>
                      Con
                    </span>
                  </div>
                )}

                {/* Nội dung thông báo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{notif.title}</span>
                    {student && (
                      <span className="text-[10px] font-bold sm:hidden" style={{ color: 'var(--brand-primary)' }}>
                        ({student.full_name})
                      </span>
                    )}
                  </div>
                  {student && (
                    <div className="text-[10px] font-bold mt-0.5 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                      Học sinh: <span style={{ color: 'var(--text-primary)' }}>{student.full_name}</span>
                    </div>
                  )}
                  <div className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{notif.body}</div>

                  {/* Time Footer */}
                  <div className="flex items-center gap-1.5 text-[9px] font-bold mt-3" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={11} />
                    <span>{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 self-stretch sm:self-auto justify-between items-end">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkSingleRead(notif.id)}
                      className="text-[10px] font-bold hover:underline px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{ background: 'rgba(0, 212, 170, 0.05)', border: '1px solid rgba(0, 212, 170, 0.1)', color: 'var(--brand-primary)' }}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                  {notif.action_url && (
                    <a
                      href={notif.action_url}
                      className="text-[10px] font-bold hover:underline px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      Xem chi tiết con
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteSingle(notif.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: '#ef4444' }}
                    title="Xóa thông báo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
