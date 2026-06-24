'use client'

import React, { useState } from 'react'
import { useDiscussion, Thread } from '@/hooks/useDiscussion'
import { ThreadCard } from './ThreadCard'
import { ThreadDetail } from './ThreadDetail'
import { NewThreadModal } from './NewThreadModal'
import { MessageSquare, Plus, RefreshCw } from 'lucide-react'

interface DiscussionPanelProps {
  lessonId: string
  currentUserId: string
  userRole: 'student' | 'teacher'
}

export default function DiscussionPanel({ lessonId, currentUserId, userRole }: DiscussionPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered' | 'pinned'>('all')
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [showNewThread, setShowNewThread] = useState(false)
  const { threads, isLoading, createThread } = useDiscussion(lessonId, activeTab)

  const handleCreateThread = async (title: string, body: string, type: 'question' | 'discussion' | 'announcement') => {
    await createThread(title, body, type, currentUserId)
  }

  if (selectedThread) {
    return (
      <div className="h-full">
        <ThreadDetail 
          thread={selectedThread} 
          currentUserId={currentUserId}
          onBack={() => setSelectedThread(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <MessageSquare size={16} style={{ color: 'var(--brand-primary)' }} />
          <span>Thảo luận ({threads.length})</span>
        </h3>
        <button
          onClick={() => setShowNewThread(true)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-semibold"
          style={{ background: 'var(--brand-subtle)', border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)', color: 'var(--brand-primary)' }}
        >
          <Plus size={14} /> Hỏi đáp
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 gap-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
        <button 
          onClick={() => setActiveTab('all')}
          className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
          style={activeTab === 'all' ? { background: 'var(--brand-primary)', color: '#000' } : { color: 'var(--text-muted)', background: 'transparent' }}
        >
          Tất cả
        </button>
        {userRole === 'teacher' && (
          <button 
            onClick={() => setActiveTab('unanswered')}
            className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
            style={activeTab === 'unanswered' ? { background: 'var(--brand-primary)', color: '#000' } : { color: 'var(--text-muted)', background: 'transparent' }}
          >
            Chưa trả lời
          </button>
        )}
        <button 
          onClick={() => setActiveTab('pinned')}
          className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
          style={activeTab === 'pinned' ? { background: 'var(--brand-primary)', color: '#000' } : { color: 'var(--text-muted)', background: 'transparent' }}
        >
          Ghim
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
            <span className="text-xs">Đang tải thảo luận...</span>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 text-xs" style={{ color: 'var(--text-muted)' }}>
            Không có câu hỏi nào.
          </div>
        ) : (
          threads.map(thread => (
            <ThreadCard 
              key={thread.id} 
              thread={thread} 
              onSelect={setSelectedThread} 
            />
          ))
        )}
      </div>

      {/* Modal */}
      <NewThreadModal 
        isOpen={showNewThread} 
        onClose={() => setShowNewThread(false)} 
        onSubmit={handleCreateThread}
        userRole={userRole}
      />
    </div>
  )
}
export { DiscussionPanel }
