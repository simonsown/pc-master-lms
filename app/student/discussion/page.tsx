'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Thread } from '@/hooks/useDiscussion'
import { ThreadCard } from '@/components/discussion/ThreadCard'
import { ThreadDetail } from '@/components/discussion/ThreadDetail'
import { MessageSquare, Send, Bot, Sparkles, Globe, School, Loader2, Cpu, ArrowLeft } from 'lucide-react'

interface ChatMessage {
  id: string;
  sender: string;
  sender_id: string;
  avatar: string;
  role: 'student' | 'teacher' | 'assistant';
  content: string;
  time: string;
  channel: string;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export default function DiscussionDashboardPage() {
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  
  // Realtime Chat States
  const [chatChannel, setChatChannel] = useState<'global' | 'class'>('global')
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([])
  const [classMessages, setClassMessages] = useState<ChatMessage[]>([])
  const [trendingTopic, setTrendingTopic] = useState<string>('Chưa có dữ liệu')
  const [chatInput, setChatInput] = useState('')
  
  // Tiny AI Chatbot States
  const [aiInput, setAiInput] = useState('')
  const [aiReplies, setAiReplies] = useState<string[]>([
    'Tôi là Micro AI Guru. Hãy đặt bất kỳ câu hỏi nhanh nào về phần cứng PC!'
  ])
  const [aiLoading, setAiLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { setLoading(false); return }
        setUser(u)

        const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle()
        setUserProfile(prof)

        // Load threads
        const { data: threadsData } = await supabase
          .from('discussion_threads')
          .select('*, author:profiles(full_name, avatar_url, role)')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
        if (threadsData) setThreads(threadsData as any[])

        // Load persisted messages
        const { data: messages } = await supabase
          .from('discussion_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(200)
        if (messages) {
          const mapped = messages.map(m => ({
            id: m.id,
            sender: m.sender_name || 'Học viên',
            sender_id: m.sender_id || '',
            avatar: '💻',
            role: 'student' as const,
            content: m.content,
            time: formatTime(m.created_at),
            channel: m.channel
          }))
          setGlobalMessages(mapped.filter(m => m.channel === 'global'))
          setClassMessages(mapped.filter(m => m.channel !== 'global'))
        }
      } catch (err) {
        console.error('Error loading initial data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [supabase])

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('discussion_messages_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'discussion_messages' }, (payload) => {
        const m = payload.new as any
        const newMsg: ChatMessage = {
          id: m.id,
          sender: m.sender_name || 'Học viên',
          sender_id: m.sender_id || '',
          avatar: '💻',
          role: 'student' as const,
          content: m.content,
          time: formatTime(m.created_at),
          channel: m.channel
        }
        if (m.channel === 'global') {
          setGlobalMessages(prev => prev.some(x => x.id === newMsg.id) ? prev : [...prev, newMsg])
        } else {
          setClassMessages(prev => prev.some(x => x.id === newMsg.id) ? prev : [...prev, newMsg])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Trending topics from global messages
  useEffect(() => {
    if (globalMessages.length === 0) { setTrendingTopic('Chưa có dữ liệu'); return }
    const words = globalMessages.map(m => m.content).join(' ').toLowerCase().split(/\s+/)
    const stopWords = ['có','không','là','thì','mà','và','để','của','cho','những','các','một','với','khi','trong','như','đã','sẽ','này','đó','đây','bạn','mình','thầy','ơi','nhé','ạ','vậy','cái','gì','nào']
    const counts: Record<string, number> = {}
    words.forEach(w => {
      const cw = w.replace(/[^a-z0-9]/gi, '')
      if (cw.length > 2 && !stopWords.includes(cw)) counts[cw] = (counts[cw] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1])
    if (sorted.length > 0) setTrendingTopic(sorted.slice(0, 3).map(x => '#' + x[0].toUpperCase()).join(', '))
  }, [globalMessages])

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [globalMessages, classMessages])

  // Send chat - persists to DB
  const handleSendChat = async () => {
    if (!chatInput.trim() || !userProfile || !user) return
    try {
      const { error } = await supabase.from('discussion_messages').insert({
        channel: chatChannel,
        class_id: chatChannel === 'class' ? userProfile.class_id || null : null,
        sender_id: user.id,
        sender_name: userProfile.full_name || 'Học viên',
        content: chatInput.trim()
      })
      if (error) console.error('Error saving message:', error)
    } catch (err) {
      console.error('Error sending message:', err)
    }
    setChatInput('')
  }

  // Handle Micro AI Send
  const handleSendAi = async () => {
    if (!aiInput.trim()) return
    const userQ = aiInput
    setAiInput('')
    setAiReplies(prev => [...prev, `Học viên: ${userQ}`])
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQ })
      })
      const data = await res.json()
      setAiReplies(prev => [...prev, `AI Guru: ${data.reply || 'Xin lỗi, tôi gặp sự cố kết nối.'}`])
    } catch {
      setAiReplies(prev => [...prev, 'AI Guru: Tôi đang bận xử lý dữ liệu khác, vui lòng thử lại sau.'])
    } finally {
      setAiLoading(false)
    }
  }

  // Convert className hardcoded colors to inline CSS variables
  const s = {
    bgBase: 'var(--bg-base)',
    bgSurface: 'var(--bg-surface)',
    bgElevated: 'var(--bg-elevated)',
    brand: 'var(--brand-primary)',
    textMuted: 'var(--text-muted)',
    textPrimary: 'var(--text-primary)',
    border: 'var(--border-default)',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: s.bgBase, color: s.textPrimary, paddingTop: '96px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" style={{ color: s.brand }} size={32} />
          <span style={{ fontSize: '12px', color: s.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Đang kết nối diễn đàn...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bgBase, color: s.textPrimary, paddingTop: '96px', paddingBottom: '48px', paddingLeft: '16px', paddingRight: '16px', position: 'relative', overflow: 'hidden' }}>
      
      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 10 }}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 relative" style={{ borderBottom: '1px solid var(--border-default)' }}>
          
          <div className="flex items-center gap-3">
            <div style={{ padding: '10px', background: `color-mix(in srgb, ${s.brand} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${s.brand} 25%, transparent)`, color: s.brand, borderRadius: '16px' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-2" style={{ color: s.textPrimary }}>
                KHÔNG GIAN THẢO LUẬN 3D
                <span style={{ fontSize: '9px', background: `color-mix(in srgb, ${s.brand} 15%, transparent)`, color: s.brand, border: `1px solid color-mix(in srgb, ${s.brand} 25%, transparent)`, padding: '2px 8px', borderRadius: '999px', fontWeight: 900, textTransform: 'uppercase' }}>REAL-TIME</span>
              </h1>
              <p style={{ fontSize: '12px', color: s.textMuted, marginTop: '2px' }}>Nơi trao đổi kiến thức phần cứng máy tính thời gian thực giữa thầy và trò</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/builder')}
              className="relative z-50 flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer" style={{ background: `color-mix(in srgb, ${s.bgElevated} 90%, transparent)`, border: `1px solid ${s.border}`, color: s.textMuted, fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.color = s.textPrimary; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.color = s.textMuted; e.currentTarget.style.borderColor = s.border }}
            >
              <ArrowLeft size={14} /> Quay lại Dashboard
            </button>
          </div>
        </div>

        {/* Layout: Left (Discussions) & Right (Chat + AI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 relative">
            {selectedThread ? (
              <div style={{ background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '24px', padding: '24px', minHeight: '500px' }}>
                <ThreadDetail 
                  thread={selectedThread}
                  currentUserId={userProfile?.id}
                  onBack={() => setSelectedThread(null)}
                />
              </div>
            ) : (
              <div style={{ background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '24px', padding: '24px', minHeight: '500px' }}>
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid color-mix(in srgb, white 5%, transparent)' }}>
                  <h2 className="text-lg font-bold tracking-tight flex items-center gap-2" style={{ color: s.textPrimary }}>
                    <Globe size={18} style={{ color: s.brand }} />
                    Chủ đề thảo luận sôi nổi
                  </h2>
                  <span style={{ fontSize: '10px', background: `color-mix(in srgb, ${s.brand} 15%, transparent)`, color: s.brand, fontWeight: 700, padding: '4px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {threads.length} chủ đề
                  </span>
                </div>
                {threads.length === 0 ? (
                  <div style={{ padding: '80px 0', textAlign: 'center', color: s.textMuted, fontStyle: 'italic' }}>
                    Chưa có chủ đề thảo luận nào được tạo. Hãy là người đầu tiên đặt câu hỏi!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginTop: '16px' }}>
                    {threads.map(thread => (
                      <ThreadCard 
                        key={thread.id}
                        thread={thread}
                        onSelect={setSelectedThread}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative">

            {/* Realtime Chat Card */}
            <div style={{ background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '400px', overflow: 'hidden' }}>
              
              {/* Channel Tabs */}
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div className="flex gap-2">
                  {(['global', 'class'] as const).map(ch => (
                    <button key={ch} onClick={() => setChatChannel(ch)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '12px',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                        background: chatChannel === ch ? `color-mix(in srgb, ${s.brand} 10%, transparent)` : 'transparent',
                        color: chatChannel === ch ? s.brand : s.textMuted,
                      }}
                    >
                      {ch === 'global' ? <Globe size={14} /> : <School size={14} />}
                      {ch === 'global' ? 'Kênh Chung' : 'Kênh Lớp Học'}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: s.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="hidden sm:flex">
                  <div className="flex items-center gap-1"><div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} /> Trực tuyến</div>
                  <div style={{ color: s.brand, fontWeight: 700, marginTop: '2px' }}>Trending: {trendingTopic}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: `color-mix(in srgb, ${s.bgBase} 50%, transparent)` }}>
                {(chatChannel === 'global' ? globalMessages : classMessages).map(m => (
                  <div key={m.id} className="flex gap-3 text-xs items-start">
                    <span style={{ width: '32px', height: '32px', borderRadius: '12px', background: s.bgElevated, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{m.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 700, color: m.role === 'teacher' ? s.brand : 'var(--text-secondary)' }}>{m.sender}</span>
                        {m.role === 'teacher' && (
                          <span style={{ fontSize: '8px', background: `color-mix(in srgb, ${s.brand} 10%, transparent)`, color: s.brand, border: `1px solid color-mix(in srgb, ${s.brand} 20%, transparent)`, padding: '2px 6px', borderRadius: '4px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>GV</span>
                        )}
                        <span style={{ fontSize: '9px', color: s.textMuted, marginLeft: 'auto' }}>{m.time}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5, background: `color-mix(in srgb, ${s.bgElevated} 60%, transparent)`, padding: '10px', borderRadius: '16px', borderTopLeftRadius: '4px', border: `1px solid color-mix(in srgb, white 5%, transparent)` }}>
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{ padding: '12px', borderTop: `1px solid ${s.border}`, background: s.bgSurface, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: s.bgBase, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '6px 12px' }}>
                  <input 
                    type="text" 
                    placeholder={chatChannel === 'global' ? "Chat chung với học viên toàn quốc..." : "Nhắn tin cho bạn bè trong lớp..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', color: s.textPrimary }}
                  />
                  <button onClick={handleSendChat}
                    style={{ padding: '8px', background: s.brand, color: '#000', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                    <Send size={12} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>

            {/* Micro AI Assistant */}
            <div style={{ background: s.bgSurface, border: `1px solid ${s.border}`, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '230px', position: 'relative', overflow: 'hidden' }}>
              
              <div className="flex items-center justify-between" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-2">
                  <div style={{ padding: '6px', background: `color-mix(in srgb, ${s.brand} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${s.brand} 25%, transparent)`, color: s.brand, borderRadius: '8px' }}>
                    <Cpu size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-tight flex items-center gap-1.5" style={{ color: s.textPrimary }}>
                      MICRO AI GURU
                      <Sparkles size={10} style={{ color: '#eab308' }} />
                    </h4>
                    <p style={{ fontSize: '9px', color: s.brand, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Đang khóa song song</p>
                  </div>
                </div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.brand, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              </div>

              <div style={{ flex: 1, overflowY: 'auto', margin: '12px 0', padding: '12px', background: `color-mix(in srgb, ${s.bgBase} 50%, transparent)`, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', lineHeight: 1.5 }}>
                {aiReplies.map((r, i) => (
                  <div key={i} style={{
                    padding: '8px', borderRadius: '8px',
                    background: r.startsWith('AI Guru:') ? `color-mix(in srgb, ${s.brand} 5%, transparent)` : s.bgElevated,
                    color: r.startsWith('AI Guru:') ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    borderLeft: `2px solid ${r.startsWith('AI Guru:') ? s.brand : s.border}`
                  }}>
                    {r}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-1" style={{ color: s.textMuted, fontStyle: 'italic', fontSize: '10px' }}>
                    <Loader2 className="animate-spin" style={{ color: s.brand }} size={10} /> AI Guru đang tính toán cấu hình...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: s.bgBase, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '6px 12px', flexShrink: 0 }}>
                <input 
                  type="text" 
                  placeholder="Hỏi nhanh AI về socket, vga, psu..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '10px', color: s.textPrimary }}
                />
                <button onClick={handleSendAi}
                  style={{ padding: '6px', background: s.brand, color: '#000', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                  <Bot size={10} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

