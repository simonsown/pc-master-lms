'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  FileQuestion, ArrowRight,
  GraduationCap, BarChart3,
  Home
} from 'lucide-react'

const TABS = [
  { id: 'exams', label: 'Kỳ Thi', icon: FileQuestion, color: '#6366f1', desc: 'Đề thi do giáo viên giao', link: '/exams' },
  { id: 'quiz', label: 'Trắc Nghiệm', icon: BarChart3, color: '#f59e0b', desc: 'Ngân hàng câu hỏi trắc nghiệm', link: '/quiz' },
]

export default function PracticePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('exams')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: isMobile ? '24px 12px' : '48px 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 900 }}>Thi Thử</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
            Kiểm tra kiến thức phần cứng với đề thi, ngân hàng câu hỏi và bảng xếp hạng
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', gap: isMobile ? '8px' : '12px',
            marginBottom: '32px', flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: isMobile ? '10px 16px' : '12px 24px',
                  borderRadius: '12px', border: '1px solid',
                  borderColor: isActive ? tab.color : 'var(--border-default)',
                  background: isActive ? `${tab.color}12` : 'var(--bg-surface)',
                  color: isActive ? tab.color : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: isMobile ? '12px' : '14px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={isMobile ? 16 : 18} />
                {isMobile ? tab.label.split(' ')[0] : tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {TABS.filter(t => t.id === activeTab).map(tab => {
            const Icon = tab.icon
            return (
              <div
                key={tab.id}
                style={{
                  borderRadius: '20px', border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', padding: isMobile ? '24px' : '40px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: `${tab.color}15`, color: tab.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <Icon size={36} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{tab.label}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  {tab.desc}
                </p>
                <button
                  onClick={() => router.push(tab.link)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 28px', borderRadius: '12px', border: 'none',
                    background: tab.color, color: '#fff', fontWeight: 700,
                    fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  Vào ngay <ArrowRight size={18} />
                </button>
              </div>
            )
          })}
        </motion.div>

        {/* Bottom nav - Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            marginTop: '32px', flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => router.push('/student')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)', color: 'var(--text-muted)',
              fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 500
            }}
          >
            <Home size={14} /> Trang chủ <ArrowRight size={14} />
          </button>
          {TABS.filter(t => t.id !== activeTab).map(tab => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.link)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 500
              }}
            >
              <tab.icon size={14} /> {tab.label} <ArrowRight size={14} />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
