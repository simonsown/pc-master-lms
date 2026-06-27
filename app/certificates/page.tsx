'use client'

import React, { useEffect, useState } from 'react'
import { Award, Download, Share2, ShieldCheck, CheckCircle2, Star, Calendar, User, Search, Filter, Trophy, Target, Zap, Copy, ExternalLink, Swords, Diamond, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from('profiles').select('full_name, xp, level').eq('id', user.id).single()
        if (p) setProfile(p)
      }
      const { data: c } = await supabase
        .from('certificates')
        .select('*')
        .eq('is_revoked', false)
        .order('issued_at', { ascending: false })
      if (c) setCerts(c)
    } catch (e) {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px color-mix(in srgb, var(--brand-primary) 30%, transparent)',
            }}>
              <Trophy size={28} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '1px' }}>
                CHỨNG CHỈ &<span style={{ color: 'var(--brand-primary)' }}> THÀNH TỰU</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Nơi lưu giữ những nỗ lực và thành quả học tập của bạn.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {[
            { icon: <Trophy size={22} />, label: 'Chứng chỉ đạt', value: certs.length.toString(), color: 'var(--brand-primary)' },
            { icon: <Star size={22} />, label: 'Tổng XP', value: profile?.xp?.toLocaleString() || '0', color: 'var(--accent-amber)' },
            { icon: <ShieldCheck size={22} />, label: 'Cấp độ', value: `Lv.${profile?.level || 1}`, color: 'var(--accent-purple)' },
            { icon: <Target size={22} />, label: 'Có thể mở', value: `${Math.max(0, 5 - certs.length)}`, color: 'var(--primary-neon)' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '20px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '4px',
                background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${stat.color} 20%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Certificate Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: '12px' }}>
              <Swords size={32} style={{ color: 'var(--brand-primary)' }} />
            </motion.div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>ĐANG TẢI...</div>
          </div>
        ) : certs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
          }}>
            <Diamond size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Chưa có chứng chỉ nào</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Hoàn thành các khóa học và nhiệm vụ để nhận chứng chỉ. Mỗi cấp độ mới sẽ mở khóa thêm cơ hội nhận chứng chỉ!
            </p>
            <Link href="/builder" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px',
              background: 'var(--brand-primary)',
              color: 'var(--bg-base)',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}>
              <Zap size={16} /> BẮT ĐẦU HỌC NGAY
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {certs.map((cert, idx) => (
              <motion.div key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  position: 'relative', overflow: 'hidden',
                }}>
                {/* Pixel corner decorations */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: 0.5 }} />

                {/* Certificate preview */}
                <div style={{
                  padding: '24px',
                }}>
                  <div style={{
                    width: '100%', aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, #0a0c1a 0%, #1a1c2e 50%, #0a0c1a 100%)',
                    border: '1px solid rgba(212, 168, 67, 0.3)',
                    position: 'relative', overflow: 'hidden',
                    marginBottom: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* Golden border */}
                    <div style={{
                      position: 'absolute', inset: '3px',
                      border: '1px solid rgba(212, 168, 67, 0.15)',
                      pointerEvents: 'none',
                    }} />
                    {/* Top gold line */}
                    <div style={{
                      position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                      width: '50%', height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                      width: '50%', height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
                    }} />

                    {/* Trophy icon */}
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d4a843, #f5d68a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '6px',
                      }}>
                      <Award size={18} color="#0a0c1a" />
                    </motion.div>

                    <div style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '2px', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', marginBottom: '2px' }}>
                      CHỨNG CHỈ HOÀN THÀNH
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#f5d68a', textAlign: 'center', padding: '0 16px', marginBottom: '4px', lineHeight: 1.2 }}>
                      {cert.course_title}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                      {cert.student_name || 'Học viên PC Master'}
                    </div>
                    <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>{new Date(cert.issued_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                      <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '6px' }}>{cert.certificate_number}</span>
                    </div>
                    {cert.final_score && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        fontSize: '7px', fontWeight: 700,
                        color: '#d4a843',
                        border: '1px solid rgba(212,168,67,0.3)',
                        padding: '1px 6px',
                      }}>
                        {cert.final_score}%
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{cert.course_title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Calendar size={11} />
                        <span>{new Date(cert.issued_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {cert.pdf_url && (
                        <a href={cert.pdf_url} target="_blank" rel="noreferrer" style={{
                          width: '36px', height: '36px',
                          border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                          <Download size={16} />
                        </a>
                      )}
                      <button onClick={() => {
                        const link = `${window.location.origin}/verify/${cert.certificate_number}`
                        navigator.clipboard.writeText(link)
                      }} style={{
                        width: '36px', height: '36px',
                        border: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: 'transparent',
                      }}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
