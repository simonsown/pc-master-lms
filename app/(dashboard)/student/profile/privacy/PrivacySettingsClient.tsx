// Path: app/(dashboard)/student/profile/privacy/PrivacySettingsClient.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-ssr-client'
import { confirmParentLink, revokeParentLink } from '@/lib/parent-actions'
import { RealtimeChannel } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  UserCheck, 
  UserMinus, 
  ShieldCheck, 
  Clock, 
  Users, 
  HelpCircle,
  AlertCircle
} from 'lucide-react'

interface ParentLink {
  id: string
  relationship: string
  status: 'pending' | 'active' | 'revoked'
  linked_at: string
  confirmed_at: string | null
  parent: {
    id: string
    full_name: string
    avatar_url: string | null
    phone: string | null
  }
}

export default function PrivacySettingsClient({
  studentId,
  studentName,
  studentCode,
  initialLinks,
}: {
  studentId: string
  studentName: string
  studentCode: string
  initialLinks: ParentLink[]
}) {
  const [links, setLinks] = useState<ParentLink[]>(initialLinks)
  const [copied, setCopied] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // 1. Fetch updated parent links helper (to sync joined fields easily)
  async function fetchLinks() {
    try {
      const { data, error } = await supabase
        .from('parent_student_links')
        .select(`
          id,
          relationship,
          status,
          linked_at,
          confirmed_at,
          parent:profiles!parent_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('student_id', studentId)
        .order('linked_at', { ascending: false })

      if (error) throw error
      setLinks((data ?? []).map((l: any) => ({
        id: l.id,
        relationship: l.relationship,
        status: l.status,
        linked_at: l.linked_at,
        confirmed_at: l.confirmed_at,
        parent: l.parent
      })))
    } catch (err) {
      console.error('Error fetching parent student links:', err)
    }
  }

  // 2. Realtime WebSocket subscription to parent_student_links updates
  useEffect(() => {
    setConnectionStatus('connecting')

    const channelName = `student-privacy-${studentId}`
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parent_student_links',
        filter: `student_id=eq.${studentId}`,
      }, () => {
        // Trigger a re-fetch of links to automatically grab parent profile fields
        fetchLinks()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error')
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected')
        } else {
          setConnectionStatus('connecting')
        }
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [studentId])

  // 3. Action Handlers
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(studentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  async function handleAccept(parentId: string) {
    setLoadingId(parentId)
    try {
      const res = await confirmParentLink(parentId)
      if (res.error) {
        alert(res.error)
      } else {
        await fetchLinks()
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đồng ý liên kết')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDeclineOrRevoke(parentId: string, confirmMessage: string) {
    if (!window.confirm(confirmMessage)) return
    setLoadingId(parentId)
    try {
      const res = await revokeParentLink(parentId)
      if (res.error) {
        alert(res.error)
      } else {
        await fetchLinks()
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thực hiện thao tác')
    } finally {
      setLoadingId(null)
    }
  }

  // Helpers
  const translateRelationship = (rel: string) => {
    const map: Record<string, string> = {
      father: 'Cha',
      mother: 'Mẹ',
      guardian: 'Người giám hộ',
      sibling: 'Anh/Chị/Em',
      other: 'Khác',
      parent: 'Phụ huynh'
    }
    return map[rel] || 'Phụ huynh'
  }

  const getConnectionBadgeClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.2)',
          text: '#10b981',
          dot: '#10b981',
          label: '⚡ Realtime'
        }
      case 'connecting':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.2)',
          text: '#f59e0b',
          dot: '#f59e0b',
          label: 'Đang kết nối...'
        }
      default:
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.2)',
          text: '#ef4444',
          dot: '#ef4444',
          label: 'Mất kết nối'
        }
    }
  }

  const badge = getConnectionBadgeClass()
  const pendingRequests = links.filter(l => l.status === 'pending')
  const activeLinks = links.filter(l => l.status === 'active')

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Quyền riêng tư & Liên kết Phụ huynh
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Quản lý mã học sinh PCM và kiểm soát các tài khoản phụ huynh được quyền theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* Realtime WebSocket connection status */}
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
            boxShadow: connectionStatus === 'connected' || connectionStatus === 'connecting' ? `0 0 8px ${badge.dot}` : 'none',
            display: 'inline-block',
            animation: connectionStatus === 'connected' || connectionStatus === 'connecting' ? 'blink 2s infinite' : 'none'
          }} />
          {badge.label}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
        
        {/* Step 1 Card: Copy Student Code */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '24px',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(0, 198, 174, 0.05)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--brand-primary)" />
                Mã học sinh cá nhân của bạn
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Cung cấp mã PCM này cho cha mẹ của bạn. Cha mẹ có thể nhập mã này trên ứng dụng phụ huynh để gửi yêu cầu theo dõi quá trình học tập và kết quả lắp ráp của bạn.
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              background: 'var(--bg-base)',
              padding: '16px 24px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              alignSelf: 'flex-start',
              minWidth: '280px',
              justifyContent: 'space-between'
            }}>
              <code style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '18px', 
                fontWeight: 700, 
                letterSpacing: '2px', 
                color: 'var(--brand-primary)' 
              }}>
                {studentCode}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: copied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-default)',
                  color: copied ? '#10b981' : 'var(--text-primary)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Đã chép!' : 'Sao chép'}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              background: 'rgba(59, 130, 246, 0.05)', 
              border: '1px solid rgba(59, 130, 246, 0.15)',
              padding: '14px 18px',
              borderRadius: '14px',
              fontSize: '12px',
              color: '#60a5fa',
              lineHeight: 1.5
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Lưu ý bảo mật:</strong> Chỉ chia sẻ mã này với cha mẹ hoặc người giám hộ đáng tin cậy. Bạn có quyền từ chối hoặc thu hồi quyền truy cập bất kỳ lúc nào nếu thấy cần thiết.
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Pending Requests Panel */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '24px',
          padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#f59e0b" />
            Yêu cầu liên kết đang chờ ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 0', 
              color: 'var(--text-muted)', 
              fontSize: '13px',
              background: 'rgba(255,255,255,0.01)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)'
            }}>
              Hiện tại không có yêu cầu liên kết nào đang chờ duyệt.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingRequests.map(link => (
                <div 
                  key={link.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px',
                    background: 'var(--bg-base)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {link.parent.avatar_url ? (
                      <img 
                        src={link.parent.avatar_url} 
                        alt={link.parent.full_name} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'rgba(245, 158, 11, 0.1)', 
                        color: '#f59e0b', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {link.parent.full_name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {link.parent.full_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Mối quan hệ đề xuất: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{translateRelationship(link.relationship)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDeclineOrRevoke(link.parent.id, 'Bạn chắc chắn muốn từ chối yêu cầu liên kết này?')}
                      disabled={loadingId !== null}
                      style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <UserMinus size={14} />
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleAccept(link.parent.id)}
                      disabled={loadingId !== null}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '8px 18px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loadingId === link.parent.id ? (
                        <div style={{ width: '14px', height: '14px', border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <UserCheck size={14} />
                      )}
                      Đồng ý
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Linked Parents list */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '24px',
          padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--brand-primary)" />
            Tài khoản phụ huynh đang liên kết ({activeLinks.length})
          </h2>

          {activeLinks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '36px 0', 
              color: 'var(--text-muted)', 
              fontSize: '13px',
              background: 'rgba(255,255,255,0.01)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)'
            }}>
              Bạn chưa liên kết với bất kỳ tài khoản phụ huynh nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeLinks.map(link => (
                <div 
                  key={link.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px',
                    background: 'var(--bg-base)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {link.parent.avatar_url ? (
                      <img 
                        src={link.parent.avatar_url} 
                        alt={link.parent.full_name} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'rgba(0, 198, 174, 0.1)', 
                        color: 'var(--brand-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {link.parent.full_name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {link.parent.full_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Vai trò: <strong style={{ color: 'var(--brand-primary)' }}>{translateRelationship(link.relationship)}</strong></span>
                        {link.confirmed_at && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            • Bắt đầu từ {formatDistanceToNow(new Date(link.confirmed_at), { locale: vi, addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleDeclineOrRevoke(link.parent.id, 'Bạn chắc chắn muốn thu hồi quyền giám sát của phụ huynh này? Họ sẽ không thể xem tiến độ thực hành của bạn nữa.')}
                      disabled={loadingId !== null}
                      style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
                      }}
                    >
                      {loadingId === link.parent.id ? (
                        <div style={{ width: '12px', height: '12px', border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <UserMinus size={13} />
                      )}
                      Thu hồi quyền
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded inline keyframes styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` }} />

    </div>
  )
}
