'use client'

import React, { useState } from 'react'
import { Thread, useThreadReplies } from '@/hooks/useDiscussion'
import { ArrowLeft, Send, User, ChevronRight } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-[#16213e]/20 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-[#16213e]/50 flex-shrink-0">
        <button onClick={onBack} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs text-gray-400 font-medium">Chi tiết thảo luận</span>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main OP Thread */}
        <div className="space-y-3 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {thread.author?.avatar_url ? (
              <img src={thread.author.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <User size={12} className="text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-[#dde0ed] flex items-center gap-1">
                {thread.author?.full_name || 'Ẩn danh'}
                {thread.author?.role === 'teacher' && (
                  <span className="text-[9px] bg-[#00d4aa]/10 text-[#00d4aa] px-1 rounded uppercase font-bold border border-[#00d4aa]/20">GV</span>
                )}
              </p>
              <p className="text-[10px] text-gray-500">{new Date(thread.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white">{thread.title}</h3>
          
          <div className="prose prose-invert max-w-none text-sm text-gray-300">
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
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phản hồi ({replies.length})</h4>
          
          {replies.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              Chưa có phản hồi nào. Hãy là người đầu tiên trả lời!
            </div>
          ) : (
            <div className="space-y-4 pl-2 border-l border-gray-800">
              {replies.map(reply => (
                <div key={reply.id} className="space-y-2 p-3 bg-[#1e202f]/30 border border-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      {reply.author?.avatar_url ? (
                        <img src={reply.author.avatar_url} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
                          <User size={8} className="text-gray-400" />
                        </div>
                      )}
                      <span className="font-semibold text-gray-300">{reply.author?.full_name || 'Ẩn danh'}</span>
                      {reply.is_teacher_answer && (
                        <span className="text-[8px] bg-[#00d4aa]/15 text-[#00d4aa] px-1 rounded uppercase font-bold border border-[#00d4aa]/30">Câu trả lời từ Giáo viên</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(reply.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <div className="prose prose-invert max-w-none text-xs text-gray-300">
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
      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-[#16213e]/30 flex-shrink-0">
        {error && (
          <div className="p-2 mb-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
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
            className="flex-1 bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors"
          />
          <button 
            type="submit"
            disabled={submitting}
            className="p-2.5 bg-[#00d4aa] text-[#0d0e13] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
