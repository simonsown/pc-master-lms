'use client'

import React, { useState } from 'react'
import { Thread, useThreadReplies } from '@/hooks/useDiscussion'
import { ArrowLeft, Send, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

interface Props {
  thread: Thread
  currentUserId: string
  onBack: () => void
}

export function ThreadDetail({ thread, currentUserId, onBack }: Props) {
  const { replies, addReply } = useThreadReplies(thread.id)
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return

    setSubmitting(true)
    setError('')
    try {
      await addReply(commentBody, currentUserId)
      setCommentBody('')
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi bình luận.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
        <button 
          onClick={onBack} 
          className="p-1 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Chi tiết thảo luận</span>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main OP Thread */}
        <div className="space-y-3 pb-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {thread.author?.avatar_url ? (
              <img src={thread.author.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                <User size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <div>
              <p className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                {thread.author?.full_name || 'Ẩn danh'}
                {thread.author?.role === 'teacher' && (
                  <span className="text-[9px] px-1 rounded uppercase font-bold" style={{ background: 'var(--brand-subtle)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>GV</span>
                )}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(thread.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{thread.title}</h3>
          
          <div className="prose prose-invert max-w-none text-sm" style={{ color: 'var(--text-secondary)' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeSanitize]}
            >
              {thread.body}
            </ReactMarkdown>
          </div>
        </div>

        {/* Replies List */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Phản hồi ({replies.length})</h4>
          
          {replies.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              Chưa có phản hồi nào. Hãy là người đầu tiên trả lời!
            </div>
          ) : (
            <div className="space-y-4 pl-2" style={{ borderLeft: '1px solid var(--border-default)' }}>
              {replies.map(reply => (
                <div key={reply.id} className="space-y-2 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      {reply.author?.avatar_url ? (
                        <img src={reply.author.avatar_url} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                          <User size={8} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{reply.author?.full_name || 'Ẩn danh'}</span>
                      {reply.is_teacher_answer && (
                        <span className="text-[8px] px-1 rounded uppercase font-bold" style={{ background: 'var(--brand-subtle)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}>Câu trả lời từ Giáo viên</span>
                      )}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(reply.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <div className="prose prose-invert max-w-none text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {reply.body}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSend} className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
        {error && (
          <div className="p-2 mb-2 text-xs rounded-lg" style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text"
            required
            disabled={submitting}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Nhập nội dung câu trả lời..."
            className="flex-1 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <button 
            type="submit"
            disabled={submitting}
            className="p-2.5 rounded-xl transition-opacity disabled:opacity-50 flex items-center justify-center"
            style={{ background: 'var(--brand-primary)', color: '#000' }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
