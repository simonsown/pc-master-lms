'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Cpu, Loader2 } from 'lucide-react'
import ChatInput from '@/components/price-compare/ChatInput'
import ChatMessage from '@/components/price-compare/ChatMessage'
import ImageModal from '@/components/price-compare/ImageModal'

interface PriceInfo {
  site: string
  price: string
  link: string
  rating: number
}

interface Recommended {
  site: string
  price: string
  link: string
}

interface Component {
  id: string
  exact_name: string
  estimated_price: string
  image_url: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  components?: Component[]
  prices?: PriceInfo[]
  recommended?: Recommended
  error?: boolean
}

export default function PriceComparePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Chào bạn! Mình là chuyên gia PC. Hãy nhập tên linh kiện bạn muốn tra giá và so sánh.\n\nVí dụ: "So sánh giá CPU i5 12400F" hoặc "Nên mua RTX 3060 hay RTX 4060"'
  }])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Component | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(query: string) {
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setLoading(true)

    try {
      const res = await fetch('/api/pc-price-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()

      if (res.ok && data.comparison_text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.comparison_text,
          components: data.components?.map((c: any) => ({
            ...c,
            image_url: c.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80'
          })),
          prices: data.prices,
          recommended: data.recommended,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Lỗi: Không thể bóc tách dữ liệu linh kiện. Vui lòng thử lại.',
          error: true
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <header className="border-b p-4 flex items-center gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-xl font-bold transition-all cursor-pointer"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Quay lại
        </button>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cpu size={16} style={{ color: '#000' }} />
        </div>
        <div>
          <h1 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Tra giá & So sánh linh kiện</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hỏi giá, so sánh linh kiện PC thông minh</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                components={msg.components}
                prices={msg.prices}
                recommended={msg.recommended}
                error={msg.error}
                onComponentClick={(comp) => setSelectedImage(comp)}
              />
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang tra cứu...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <ChatInput onSend={handleSend} loading={loading} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Dữ liệu giá tham khảo tại thị trường Việt Nam · Kết quả do AI tạo, chỉ mang tính chất tham khảo
        </p>
      </div>

      <ImageModal component={selectedImage} onClose={() => setSelectedImage(null)} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
