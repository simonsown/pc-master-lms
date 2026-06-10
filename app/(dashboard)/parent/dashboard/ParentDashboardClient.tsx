// Path: app/(dashboard)/parent/dashboard/ParentDashboardClient.tsx
'use client'

import { useState } from 'react'
import { useChildRealtime } from '@/hooks/useChildRealtime'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'

interface LinkedChild {
  id: string
  relationship: string
  student: {
    id: string
    full_name: string
    avatar_url: string | null
    student_code: string
    school_name: string | null
    xp: number
    level: number
    is_online: boolean
    last_seen_at: string | null
  }
}

export function ParentDashboardClient({
  parentName,
  linkedChildren,
}: {
  parentName: string
  linkedChildren: LinkedChild[]
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    linkedChildren[0]?.student?.id ?? null
  )

  // Subscribes to real-time websocket monitoring for the selected child
  const realtimeData = useChildRealtime(selectedChildId)

  const currentChildLink = linkedChildren.find(
    l => l.student?.id === selectedChildId
  )
  const selectedChild = currentChildLink?.student

  // Format connection status badge styling
  const getConnectionBadgeClass = () => {
    switch (realtimeData.connectionStatus) {
      case 'connected':
        return {
          bg: 'rgba(0, 212, 170, 0.1)',
          border: 'rgba(0, 212, 170, 0.3)',
          text: 'var(--brand-primary)',
          dot: 'var(--brand-primary)',
          label: '⚡ Realtime'
        }
      case 'connecting':
        return {
          bg: 'rgba(240, 160, 48, 0.1)',
          border: 'rgba(240, 160, 48, 0.3)',
          text: '#f0a030',
          dot: '#f0a030',
          label: 'Đang kết nối...'
        }
      case 'disconnected':
        return {
          bg: 'rgba(240, 48, 96, 0.1)',
          border: 'rgba(240, 48, 96, 0.3)',
          text: '#f03060',
          dot: '#f03060',
          label: 'Mất kết nối'
        }
      case 'error':
      default:
        return {
          bg: 'rgba(240, 48, 96, 0.1)',
          border: 'rgba(240, 48, 96, 0.3)',
          text: '#f03060',
          dot: '#f03060',
          label: 'Lỗi kết nối'
        }
    }
  }

  const badge = getConnectionBadgeClass()

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Xin chào, {parentName} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Theo dõi {linkedChildren.length} học sinh trong không gian học tập PC Master
          </p>
        </div>

        {/* Realtime WebSocket connection badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '50px',
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          color: badge.text,
          fontSize: '12px',
          fontWeight: 600
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: badge.dot,
            boxShadow: realtimeData.connectionStatus === 'connected' || realtimeData.connectionStatus === 'connecting' ? `0 0 8px ${badge.dot}` : 'none',
            display: 'inline-block',
            animation: realtimeData.connectionStatus === 'connected' || realtimeData.connectionStatus === 'connecting' ? 'blink 2s infinite' : 'none'
          }} />
          {badge.label}
        </div>
      </header>

      {/* Tabs Selector for Multi-Children links */}
      {linkedChildren.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {linkedChildren.map(link => {
            const isSelected = selectedChildId === link.student?.id
            return (
              <button
                key={link.student?.id}
                onClick={() => setSelectedChildId(link.student?.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid rgba(0, 212, 170, 0.4)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: 'rgba(0, 212, 170, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#fff' 
                }}>
                  {link.student?.full_name[0].toUpperCase()}
                </div>
                {link.student?.full_name}
                {/* Real-time Online indicators inside tabs */}
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: (realtimeData.isOnline && isSelected) || (link.student?.is_online && !isSelected) ? 'var(--brand-primary)' : '#4a4d62'
                }} />
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State: No linked children */}
      {linkedChildren.length === 0 && (
        <div style={{ 
          background: 'var(--bg-surface)', 
          border: '1.5px dashed rgba(0, 212, 170, 0.25)', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '48px' }}>👨‍👩‍👧‍👦</span>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Chưa liên kết tài khoản con
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px', margin: 0, lineHeight: 1.6 }}>
            Nhập mã học sinh cá nhân của con (PCM-XXXXXXXX) để đồng bộ và giám sát kết quả thực hành của con realtime.
          </p>
          <Link 
            href="/parent/link-child" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 28px', 
              background: 'var(--brand-primary)', 
              color: '#000', 
              borderRadius: '12px', 
              fontWeight: 700, 
              textDecoration: 'none',
              marginTop: '8px'
            }}
          >
            + Liên kết tài khoản con
          </Link>
        </div>
      )}

      {/* Active Child Dashboard */}
      {selectedChild && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Child Header Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '24px', 
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Avatar & Online status indicator */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              {selectedChild.avatar_url ? (
                <img 
                  src={selectedChild.avatar_url} 
                  alt={selectedChild.full_name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  background: 'rgba(0, 212, 170, 0.1)', 
                  color: 'var(--brand-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 800
                }}>
                  {selectedChild.full_name[0].toUpperCase()}
                </div>
              )}
              {/* Active real-time online green dot */}
              <span style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '0', 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: realtimeData.isOnline ? 'var(--brand-primary)' : '#4a4d62',
                border: '3px solid var(--bg-surface)',
                boxShadow: realtimeData.isOnline ? '0 0 8px var(--brand-primary)' : 'none'
              }} />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {selectedChild.full_name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 8px 0' }}>
                🏫 {selectedChild.school_name ?? 'Chưa cập nhật trường học'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontFamily: 'monospace', 
                  background: 'var(--bg-base)', 
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 8px', 
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {selectedChild.student_code}
                </span>
                
                <span style={{ fontSize: '12px', color: realtimeData.isOnline ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                  {realtimeData.isOnline ? (
                    '🟢 Đang online & học tập trực tuyến'
                  ) : realtimeData.lastSeen ? (
                    `Hoạt động ${formatDistanceToNow(new Date(realtimeData.lastSeen), { locale: vi, addSuffix: true })}`
                  ) : (
                    'Chưa ghi nhận hoạt động'
                  )}
                </span>
              </div>
            </div>

            {/* Level & XP Box */}
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Cấp độ học
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--brand-primary)', lineHeight: 1.1 }}>
                {selectedChild.level}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {selectedChild.xp} XP
              </div>
            </div>
          </div>

          {/* Realtime Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Bài Đã Hoàn Thành
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                {realtimeData.lessonsCompleted}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>bài</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Bài Học Đang Tiến Hành
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6' }}>
                {Math.max(0, realtimeData.totalLessonsStarted - realtimeData.lessonsCompleted)}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>bài</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Tổng Giờ Thực Hành
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#a855f7' }}>
                {Math.round((realtimeData.totalTimeSeconds / 3600) * 10) / 10}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>giờ</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Điểm Trắc Nghiệm TB
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 800, 
                color: realtimeData.averageQuizScore === null 
                  ? 'var(--text-muted)' 
                  : realtimeData.averageQuizScore < 50 ? '#ef4444' : '#10b981' 
              }}>
                {realtimeData.averageQuizScore !== null ? Math.round(realtimeData.averageQuizScore) : '--'}
                {realtimeData.averageQuizScore !== null && (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '2px' }}>/100</span>
                )}
              </div>
            </div>

          </div>

          {/* Realtime Recent Activity Feed */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '24px', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Nhật Ký Học Tập Trực Tuyến
              </h3>
              
              {realtimeData.connectionStatus === 'connected' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--brand-primary)',
                    display: 'inline-block',
                    animation: 'blink 1.5s infinite'
                  }} />
                  Cập nhật tức thời
                </div>
              )}
            </div>

            {realtimeData.recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                🏜️ Chưa có hoạt động thực hành nào được ghi nhận.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {realtimeData.recentActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {/* Activity Icon */}
                    <div style={{ 
                      fontSize: '20px', 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: activity.type === 'lesson_completed' ? 'rgba(16, 185, 129, 0.1)' : 
                                  activity.type === 'quiz_graded' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {activity.type === 'lesson_completed' ? '📖' :
                       activity.type === 'quiz_graded' ? '📝' : '🔵'}
                    </div>

                    {/* Activity Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        margin: '0 0 4px 0',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {activity.title}
                      </p>
                      
                      {activity.score !== undefined && (
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          color: activity.score >= 50 ? '#10b981' : '#ef4444',
                          background: activity.score >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {activity.score} điểm
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatDistanceToNow(new Date(activity.timestamp), { locale: vi, addSuffix: true })}
                    </span>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Embedded inline keyframes styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      ` }} />

    </div>
  )
}
