'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { Award, FileText, CheckCircle, Copy, RefreshCw, Lock, ShieldCheck, Target, ArrowLeft, Sparkles, Download, Image, Star, User, Calendar, Hash, Trophy, Zap, Swords, Diamond } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Link from 'next/link'

const CERTIFICATE_TYPES = [
  {
    id: 'cert_hardware_basics',
    title: 'Kỹ Sư Phần Cứng Tập Sự',
    description: 'Nắm vững kiến thức nền tảng về các linh kiện cấu thành máy tính cá nhân.',
    mission: 'Hoàn thành 3 bài học lý thuyết cơ bản và đạt tối thiểu 70% ở bài kiểm tra CPU.',
    levelReq: 3,
    icon: <ShieldCheck size={28} />
  },
  {
    id: 'cert_pc_master',
    title: 'Chuyên Gia Lắp Ráp PC Master',
    description: 'Chứng nhận khả năng lắp ráp, xử lý sự cố và tương thích linh kiện thực tế.',
    mission: 'Hoàn thành toàn bộ khóa học PC Master, bao gồm giả lập Lab 3D.',
    levelReq: 5,
    icon: <Award size={28} />
  },
  {
    id: 'cert_troubleshooting',
    title: 'Kỹ Thuật Viên Xử Lý Sự Cố',
    description: 'Chứng nhận kỹ năng chuẩn đoán và khắc phục các lỗi hệ thống phần cứng.',
    mission: 'Trả lời đúng liên tiếp 10 câu hỏi Khắc Phục Sự Cố trong Ngân hàng đề thi.',
    levelReq: 7,
    icon: <Target size={28} />
  }
]

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PCM-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function StudentCertificatesPage() {
  const router = useRouter()
  const [certs, setCerts] = useState<any[]>([])
  const [activePath, setActivePath] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [justEarnedId, setJustEarnedId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showCertModal, setShowCertModal] = useState<any>(null)
  const [userLevel, setUserLevel] = useState(1)
  const certRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { setLoading(false); return }
    setUser(currentUser)

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, level, xp')
      .eq('id', currentUser.id)
      .single()
    if (userProfile) { setProfile(userProfile); setUserLevel(userProfile.level || 1) }

    const { data: c } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', currentUser.id)
      .eq('is_revoked', false)
      .order('issued_at', { ascending: false })

    if (c) {
      const newIds = c.filter(cert => !certs.some(old => old.id === cert.id)).map(cert => cert.id)
      if (newIds.length > 0) {
        setJustEarnedId(newIds[newIds.length - 1])
        toast.success('Chúc mừng! Bạn đã nhận được chứng chỉ mới!')
      }
      setCerts(c)
    }

    const { data: path } = await supabase
      .from('learning_paths')
      .select('id, title')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    if (path) setActivePath(path)

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const sub = supabase
      .channel('certs-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'certificates' },
        (payload: any) => {
          const newCert = payload.new
          setCerts(prev => {
            if (prev.some(c => c.id === newCert.id)) return prev
            toast.success('Chứng chỉ mới đã được cấp!')
            setJustEarnedId(newCert.id)
            return [newCert, ...prev]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  const autoCheckAndIssue = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    const { data: existing } = await supabase
      .from('certificates')
      .select('course_title')
      .eq('student_id', currentUser.id)
      .eq('is_revoked', false)

    const existingTitles = (existing || []).map(e => e.course_title)

    for (const certType of CERTIFICATE_TYPES) {
      if (existingTitles.includes(certType.title)) continue
      try {
        const code = generateVerificationCode()
        const { error } = await supabase.from('certificates').insert({
          student_id: currentUser.id,
          student_name: profile?.full_name || currentUser.email?.split('@')[0] || 'Học viên',
          course_title: certType.title,
          certificate_number: code,
          issued_at: new Date().toISOString(),
          completion_date: new Date().toISOString().split('T')[0],
          final_score: 100,
          is_revoked: false,
        })
        if (error) throw error
        await loadData()
        return
      } catch {
      }
    }
  }

  const handleRequestCertificate = async () => {
    setIssuing(true)
    try {
      await autoCheckAndIssue()
      toast.success('Chúc mừng! Bạn đã nhận chứng chỉ thành công.')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Chưa đủ điều kiện. Hãy hoàn thành các nhiệm vụ được giao.')
    } finally {
      setIssuing(false)
    }
  }

  const handleDownloadPDF = async (cert: any) => {
    setShowCertModal(cert)
    await new Promise(r => setTimeout(r, 100))
    try {
      const element = document.getElementById(`cert-preview-${cert.id}`)
      if (!element) { toast.error('Không thể tạo chứng chỉ'); return }
      const canvas = await html2canvas(element, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: '#0a0c1a', logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape', unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save(`chung-chi-${cert.certificate_number || cert.id}.pdf`)
      toast.success('Tải xuống PDF thành công!')
    } catch (err) {
      toast.error('Không thể tạo PDF. Thử tải xuống ảnh.')
    }
    setShowCertModal(null)
  }

  const handleDownloadImage = async (cert: any) => {
    setShowCertModal(cert)
    await new Promise(r => setTimeout(r, 100))
    try {
      const element = document.getElementById(`cert-preview-${cert.id}`)
      if (!element) { toast.error('Không thể tạo chứng chỉ'); return }
      const canvas = await html2canvas(element, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: '#0a0c1a', logging: false,
      })
      const link = document.createElement('a')
      link.download = `chung-chi-${cert.certificate_number || cert.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Tải xuống ảnh thành công!')
    } catch (err) {
      toast.error('Không thể tạo ảnh chứng chỉ.')
    }
    setShowCertModal(null)
  }

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/verify/${code}`
    navigator.clipboard.writeText(link)
    toast.success('Đã sao chép liên kết xác thực!')
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', paddingTop: '96px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Swords size={28} style={{ color: 'var(--brand-primary)' }} />
        </motion.div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>ĐANG TẢI CHỨNG CHỈ...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '4px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px color-mix(in srgb, var(--brand-primary) 30%, transparent)',
            }}>
              <Trophy size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                CHỨNG CHỈ & DANH HIỆU
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Hoàn thành nhiệm vụ - tự động nhận chứng chỉ
              </p>
            </div>
          </div>
          <button onClick={() => router.push('/builder')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px',
            border: '1px solid var(--border-default)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <ArrowLeft size={14} /> BACK
          </button>
        </div>

        {/* User Level Badge */}
        <div style={{
          marginBottom: '24px',
          padding: '12px 16px',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '4px',
            background: 'color-mix(in srgb, var(--accent-amber) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-amber) 25%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-amber)',
            fontSize: '16px',
          }}>
            ⭐
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
              CẤP ĐỘ HIỆN TẠI
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              Level {userLevel} - {profile?.full_name || user?.email?.split('@')[0] || 'Học viên'}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
            <div>{certs.length} chứng chỉ</div>
            <div style={{ color: 'var(--brand-primary)' }}>{profile?.xp || 0} XP</div>
          </div>
        </div>

        {/* Certificate List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CERTIFICATE_TYPES.map((certType) => {
            const earnedCert = certs.find(c => c.course_title === certType.title)
            const isEarned = !!earnedCert
            const isJustEarned = justEarnedId === earnedCert?.id
            const levelMet = userLevel >= certType.levelReq

            return (
              <div key={certType.id}>
                <div style={{
                  border: `1px solid ${isEarned ? 'color-mix(in srgb, var(--brand-primary) 40%, transparent)' : 'var(--border-default)'}`,
                  background: isEarned ? 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' : 'var(--bg-surface)',
                  padding: '20px',
                  position: 'relative', overflow: 'hidden',
                  opacity: isEarned ? 1 : 0.7,
                  transition: 'all 0.3s',
                }}>
                  {/* Corner decorations */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderTop: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: isEarned ? 0.5 : 0.1 }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', borderTop: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: isEarned ? 0.5 : 0.1 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--brand-primary)', borderLeft: '2px solid var(--brand-primary)', opacity: isEarned ? 0.5 : 0.1 }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', borderBottom: '2px solid var(--brand-primary)', borderRight: '2px solid var(--brand-primary)', opacity: isEarned ? 0.5 : 0.1 }} />

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '4px',
                      background: isEarned ? 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' : 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                      border: `1px solid ${isEarned ? 'color-mix(in srgb, var(--brand-primary) 25%, transparent)' : 'var(--border-default)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      color: isEarned ? 'var(--brand-primary)' : 'var(--text-muted)',
                    }}>
                      {certType.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{
                          fontSize: '15px', fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isEarned ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}>
                          {certType.title}
                        </h3>
                        {isEarned && <CheckCircle size={16} style={{ color: 'var(--brand-primary)' }} />}
                        {isJustEarned && <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{certType.description}</p>

                      {/* Mission & Level Requirement */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '6px 10px',
                          border: '1px solid var(--border-default)',
                          background: 'var(--bg-base)',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}>
                          <span style={{ fontWeight: 700, color: levelMet ? 'var(--brand-primary)' : 'var(--accent-amber)' }}>
                            {levelMet ? '✓' : 'Lv.'}{certType.levelReq}
                          </span>
                          <span style={{ marginLeft: '4px' }}>Yêu cầu cấp độ</span>
                        </div>
                        {isEarned && earnedCert?.certificate_number && (
                          <div style={{
                            padding: '6px 10px',
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-base)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            #{earnedCert.certificate_number}
                          </div>
                        )}
                      </div>

                      {/* Mission detail */}
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 10px',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-base)',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>NHIỆM VỤ:</span>{' '}
                        {certType.mission}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      {isEarned ? (
                        <>
                          <button onClick={() => handleDownloadImage(earnedCert)}
                            style={{
                              padding: '8px 14px',
                              background: 'var(--brand-primary)',
                              color: 'var(--bg-base)',
                              border: 'none',
                              fontSize: '10px', fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            <Image size={12} /> ẢNH
                          </button>
                          <button onClick={() => handleDownloadPDF(earnedCert)}
                            style={{
                              padding: '8px 14px',
                              background: 'var(--accent-blue)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '10px', fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            <FileText size={12} /> PDF
                          </button>
                          <button onClick={() => handleCopyLink(earnedCert.certificate_number)}
                            style={{
                              padding: '8px 14px',
                              border: '1px solid var(--border-default)',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              fontSize: '10px', fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            <Copy size={12} /> COPY
                          </button>
                        </>
                      ) : (
                        <button onClick={handleRequestCertificate} disabled={issuing}
                          style={{
                            padding: '8px 14px',
                            border: '1px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            fontSize: '10px', fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            opacity: issuing ? 0.5 : 1,
                          }}>
                          {issuing ? <RefreshCw size={12} className="animate-spin" /> : <Lock size={12} />}
                          {issuing ? 'ĐANG KIỂM TRA...' : 'YÊU CẦU'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certificate preview (hidden, for rendering) */}
                {isEarned && (
                  <div className="fixed" style={{ left: '-9999px', top: 0 }} ref={certRef}>
                    <div id={`cert-preview-${earnedCert.id}`} style={{
                      width: '800px', height: '566px', padding: '28px',
                      background: 'linear-gradient(135deg, #0a0c1a 0%, #1a1c2e 50%, #0a0c1a 100%)',
                      position: 'relative', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {/* Outer gold border */}
                      <div style={{
                        position: 'absolute', inset: '0',
                        padding: '3px',
                        background: 'linear-gradient(135deg, #d4a843, #f5d68a, #d4a843, #8b6914, #d4a843)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }} />
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                        border: '1px solid rgba(212, 168, 67, 0.12)',
                        pointerEvents: 'none',
                      }} />

                      {/* Corner ornaments */}
                      {[
                        { top: '20px', left: '20px', borderRight: '2px solid rgba(212,168,67,0.4)', borderBottom: '2px solid rgba(212,168,67,0.4)', width: '30px', height: '30px' },
                        { top: '20px', right: '20px', borderLeft: '2px solid rgba(212,168,67,0.4)', borderBottom: '2px solid rgba(212,168,67,0.4)', width: '30px', height: '30px' },
                        { bottom: '20px', left: '20px', borderRight: '2px solid rgba(212,168,67,0.4)', borderTop: '2px solid rgba(212,168,67,0.4)', width: '30px', height: '30px' },
                        { bottom: '20px', right: '20px', borderLeft: '2px solid rgba(212,168,67,0.4)', borderTop: '2px solid rgba(212,168,67,0.4)', width: '30px', height: '30px' },
                      ].map((pos, i) => (
                        <div key={i} style={{ position: 'absolute', ...pos, borderRadius: '2px' }} />
                      ))}

                      {/* Decorative lines */}
                      <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', width: '55%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)' }} />
                      <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', width: '55%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)' }} />

                      {/* Background pattern */}
                      <div style={{ position: 'absolute', top: '100px', right: '50px', width: '120px', height: '120px', border: '1px solid rgba(212,168,67,0.04)', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', bottom: '100px', left: '50px', width: '80px', height: '80px', border: '1px solid rgba(212,168,67,0.04)', borderRadius: '50%' }} />

                      {/* Logo */}
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d4a843, #f5d68a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '6px', boxShadow: '0 4px 20px rgba(212,168,67,0.3)',
                      }}>
                        <Award size={26} color="#0a0c1a" />
                      </div>

                      {/* School name */}
                      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: '#d4a843', textTransform: 'uppercase', marginBottom: '3px' }}>
                        PC MASTER ACADEMY
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '2px', color: 'rgba(212,168,67,0.4)', textTransform: 'uppercase', marginBottom: '16px' }}>
                        CHỨNG NHẬN HOÀN THÀNH
                      </div>

                      {/* Certificate title */}
                      <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '2px', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', marginBottom: '3px' }}>
                        CHỨNG CHỈ
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#f5d68a', textAlign: 'center', marginBottom: '12px', padding: '0 40px', lineHeight: 1.2 }}>
                        {earnedCert.course_title}
                      </div>

                      {/* Separator */}
                      <div style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)', marginBottom: '12px' }} />

                      {/* Recipient */}
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px', letterSpacing: '1px' }}>
                        Cấp cho
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                        {earnedCert.student_name || profile?.full_name || user?.email?.split('@')[0] || 'Học viên'}
                      </div>

                      {/* Description */}
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: '480px', lineHeight: '1.4', marginBottom: '16px' }}>
                        Đã hoàn thành xuất sắc các yêu cầu của chương trình đào tạo lắp ráp và kiến thức phần cứng máy tính.
                      </div>

                      {/* Score badge */}
                      {earnedCert.final_score && (
                        <div style={{
                          marginBottom: '12px',
                          padding: '3px 14px',
                          border: '1px solid rgba(212,168,67,0.3)',
                          fontSize: '10px', fontWeight: 700, color: '#d4a843',
                        }}>
                          ĐIỂM: {earnedCert.final_score}%
                        </div>
                      )}

                      {/* Info row */}
                      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={11} color="#d4a843" />
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                            {new Date(earnedCert.issued_at || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Hash size={11} color="#d4a843" />
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                            {earnedCert.certificate_number}
                          </span>
                        </div>
                      </div>

                      {/* Gold seal */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        border: '2px solid #d4a843',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'radial-gradient(circle at 30% 30%, rgba(245,214,138,0.15), transparent)',
                        position: 'relative',
                      }}>
                        <Star size={18} color="#d4a843" fill="#d4a843" />
                        <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '1px solid rgba(212,168,67,0.2)' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Level Guide */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={16} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              HƯỚNG DẪN NHẬN CHỨNG CHỈ
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {CERTIFICATE_TYPES.map(ct => (
              <div key={ct.id} style={{
                padding: '10px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-base)',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                  {ct.title}
                </div>
                <div>Yêu cầu Level <strong style={{ color: userLevel >= ct.levelReq ? 'var(--brand-primary)' : 'var(--accent-amber)' }}>{ct.levelReq}</strong></div>
                {userLevel >= ct.levelReq ? (
                  <div style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px' }}>
                    ✓ Đủ điều kiện
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px' }}>
                    Cần thêm {ct.levelReq - userLevel} level
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <Link href="/student/level" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 20px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              fontSize: '11px', fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <Zap size={14} /> XEM CẤP ĐỘ & NHIỆM VỤ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
