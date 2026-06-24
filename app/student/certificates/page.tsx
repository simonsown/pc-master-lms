'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Award, FileText, CheckCircle, Copy, ExternalLink, RefreshCw, Lock, ShieldCheck, Target, ArrowLeft, Sparkles, Download, Image, Star, User, Calendar, Hash } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const CERTIFICATE_TYPES = [
  {
    id: 'cert_hardware_basics',
    title: 'Kỹ Sư Phần Cứng Tập Sự',
    description: 'Nắm vững kiến thức nền tảng về các linh kiện cấu thành máy tính cá nhân.',
    mission: 'Hoàn thành 3 bài học lý thuyết cơ bản và đạt tối thiểu 70% ở bài kiểm tra CPU.',
    icon: <ShieldCheck size={28} />
  },
  {
    id: 'cert_pc_master',
    title: 'Chuyên Gia Lắp Ráp PC Master',
    description: 'Chứng nhận khả năng lắp ráp, xử lý sự cố và tương thích linh kiện thực tế.',
    mission: 'Hoàn thành toàn bộ khóa học PC Master, bao gồm giả lập Lab 3D.',
    icon: <Award size={28} />
  },
  {
    id: 'cert_troubleshooting',
    title: 'Kỹ Thuật Viên Xử Lý Sự Cố',
    description: 'Chứng nhận kỹ năng chuẩn đoán và khắc phục các lỗi hệ thống phần cứng.',
    mission: 'Trả lời đúng liên tiếp 10 câu hỏi Khắc Phục Sự Cố trong Ngân hàng đề thi.',
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
      .select('full_name, avatar_url')
      .eq('id', currentUser.id)
      .single()
    if (userProfile) setProfile(userProfile)

    const { data: c } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', currentUser.id)
      .eq('is_revoked', false)

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

  useEffect(() => {
    loadData()
  }, [])

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
          student_name: profile?.full_name || currentUser.email,
          course_title: certType.title,
          certificate_number: code,
          issued_at: new Date().toISOString(),
          is_revoked: false,
          data: { type: certType.id }
        })
        if (error) throw error
        await loadData()
        return
      } catch {
        // Not yet eligible
      }
    }
  }

  const handleRequestCertificate = async () => {
    if (!activePath) {
      toast.error('Không tìm thấy lộ trình học tập. Vui lòng tham gia lớp học trước.')
      return
    }
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
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0c1a',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save(`chung-chi-${cert.certificate_number || cert.id}.pdf`)

      toast.success('Tải xuống PDF thành công!')
    } catch (err) {
      console.error('PDF generation error:', err)
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
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0c1a',
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `chung-chi-${cert.certificate_number || cert.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Tải xuống ảnh thành công!')
    } catch (err) {
      console.error('Image generation error:', err)
      toast.error('Không thể tạo ảnh chứng chỉ.')
    }
    setShowCertModal(null)
  }

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/verify?code=${code}`
    navigator.clipboard.writeText(link)
    toast.success('Đã sao chép liên kết xác thực!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#00d4aa]" />
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang tải chứng chỉ...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#00d4aa]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Chứng chỉ & Danh hiệu</h1>
              <p className="text-xs text-gray-400 mt-0.5">Hoàn thành nhiệm vụ tự động nhận chứng chỉ ngay!</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/builder')}
            className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        <div className="grid gap-6">
          {CERTIFICATE_TYPES.map((certType) => {
            const earnedCert = certs.find(c => c.course_title === certType.title || c.certificate_number?.includes(certType.id))
            const isEarned = !!earnedCert
            const isJustEarned = justEarnedId === earnedCert?.id

            return (
              <div key={certType.id} className="relative">
                <div
                  className={`bg-[#11121d]/80 border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${isEarned ? 'border-[#00d4aa]/50' : 'border-[#1e293b]'} ${isJustEarned ? 'animate-pulse' : ''}`}
                >
                  {isJustEarned && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(0,212,170,0.1) 0%, transparent 70%)' }} />
                  )}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isEarned ? 'bg-[#00d4aa]' : 'bg-gray-800'}`}></div>

                  <div className="flex items-start gap-4 w-full md:w-auto flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${isEarned ? 'bg-[#00d4aa]/20 border border-[#00d4aa]/30 text-[#00d4aa] shadow-[0_0_15px_rgba(0,212,170,0.2)]' : 'bg-gray-800/50 border border-gray-700 text-gray-500'}`}>
                      {certType.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-black uppercase ${isEarned ? 'text-white' : 'text-gray-400'}`}>{certType.title}</h3>
                        {isEarned && <CheckCircle size={16} className="text-[#00d4aa]" />}
                        {isJustEarned && <Sparkles size={16} className="text-yellow-400" />}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{certType.description}</p>

                      <div className="bg-[#161F38] p-3 rounded-xl border border-[#1e293b]">
                        <p className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5"><Target size={14} /> Nhiệm vụ cần đạt:</p>
                        <p className="text-xs text-gray-300">{certType.mission}</p>
                      </div>

                      {isEarned && (
                        <div className="mt-3 text-xs text-gray-500">
                          Mã xác thực: <strong className="text-white font-mono">{earnedCert.certificate_number}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 justify-end mt-4 md:mt-0">
                    {isEarned ? (
                      <>
                        <button
                          onClick={() => handleDownloadImage(earnedCert)}
                          className="flex-1 md:w-44 px-4 py-2.5 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,212,170,0.15)]"
                        >
                          <Image size={14} /> Tải ảnh
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(earnedCert)}
                          className="flex-1 md:w-44 px-4 py-2.5 bg-blue-500 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
                        >
                          <FileText size={14} /> Tải PDF
                        </button>
                        <button
                          onClick={() => handleCopyLink(earnedCert.certificate_number)}
                          className="flex-1 md:w-44 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy size={14} /> Copy xác thực
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleRequestCertificate}
                        disabled={issuing}
                        className="flex-1 md:w-44 px-4 py-2.5 bg-gray-800 text-gray-400 font-bold text-xs rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        {issuing ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                        Yêu cầu kiểm tra
                      </button>
                    )}
                  </div>
                </div>

                {/* Certificate preview (hidden, used for rendering) */}
                {isEarned && (
                  <div className="fixed left-[-9999px] top-0" ref={certRef}>
                    <div id={`cert-preview-${earnedCert.id}`} style={{
                      width: '800px', height: '566px', padding: '32px',
                      background: 'linear-gradient(135deg, #0a0c1a 0%, #1a1c2e 50%, #0a0c1a 100%)',
                      position: 'relative', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {/* Gradient border overlay */}
                      <div style={{
                        position: 'absolute', inset: '0',
                        padding: '3px',
                        background: 'linear-gradient(135deg, #d4a843, #f5d68a, #d4a843, #8b6914, #d4a843)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }} />

                      {/* Inner glow */}
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px', right: '12px', bottom: '12px',
                        border: '1px solid rgba(212, 168, 67, 0.15)',
                        borderRadius: '2px',
                        pointerEvents: 'none',
                      }} />

                      {/* Corner ornaments */}
                      {[
                        { top: '24px', left: '24px', transform: 'none' },
                        { top: '24px', right: '24px', transform: 'rotate(90deg)' },
                        { bottom: '24px', left: '24px', transform: 'rotate(-90deg)' },
                        { bottom: '24px', right: '24px', transform: 'rotate(180deg)' },
                      ].map((pos, i) => (
                        <div key={i} style={{
                          position: 'absolute', ...pos, width: '40px', height: '40px',
                          border: '2px solid rgba(212, 168, 67, 0.4)',
                          borderRadius: '4px',
                          borderLeft: 'none', borderTop: 'none',
                        }} />
                      ))}

                      {/* Decorative top line */}
                      <div style={{
                        position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
                        width: '60%', height: '1px',
                        background: 'linear-gradient(90deg, transparent, #d4a843, transparent)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                        width: '60%', height: '1px',
                        background: 'linear-gradient(90deg, transparent, #d4a843, transparent)',
                      }} />

                      {/* Logo */}
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d4a843, #f5d68a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '8px', boxShadow: '0 4px 20px rgba(212,168,67,0.3)',
                      }}>
                        <Award size={28} color="#0a0c1a" />
                      </div>

                      {/* School name */}
                      <div style={{
                        fontSize: '11px', fontWeight: 600, letterSpacing: '3px',
                        color: '#d4a843', textTransform: 'uppercase', marginBottom: '4px',
                      }}>
                        TRƯỜNG THPT NGUYỄN CÔNG TRỨ
                      </div>
                      <div style={{
                        fontSize: '9px', fontWeight: 500, letterSpacing: '2px',
                        color: 'rgba(212,168,67,0.5)', textTransform: 'uppercase', marginBottom: '20px',
                      }}>
                        PC Master Builder
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: '10px', fontWeight: 600, letterSpacing: '2px',
                        color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', marginBottom: '4px',
                      }}>
                        Chứng chỉ hoàn thành
                      </div>
                      <div style={{
                        fontSize: '22px', fontWeight: 900, color: '#f5d68a',
                        textAlign: 'center', marginBottom: '16px', letterSpacing: '1px',
                      }}>
                        {earnedCert.course_title}
                      </div>

                      {/* Recipient */}
                      <div style={{
                        fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                        marginBottom: '4px', letterSpacing: '1px',
                      }}>
                        Cấp cho
                      </div>
                      <div style={{
                        fontSize: '26px', fontWeight: 800, color: '#fff',
                        marginBottom: '16px', letterSpacing: '-0.5px',
                      }}>
                        {earnedCert.student_name || profile?.full_name || user?.email?.split('@')[0]}
                      </div>

                      {/* Description */}
                      <div style={{
                        fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                        textAlign: 'center', maxWidth: '500px', lineHeight: '1.5', marginBottom: '20px',
                      }}>
                        Đã hoàn thành xuất sắc các yêu cầu của chương trình đào tạo
                        lắp ráp và kiến thức phần cứng máy tính.
                      </div>

                      {/* Bottom info */}
                      <div style={{
                        display: 'flex', gap: '32px', alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} color="#d4a843" />
                          <span style={{
                            fontSize: '10px', color: 'rgba(255,255,255,0.4)',
                          }}>
                            {new Date(earnedCert.issued_at || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Hash size={12} color="#d4a843" />
                          <span style={{
                            fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                            fontFamily: 'monospace',
                          }}>
                            {earnedCert.certificate_number}
                          </span>
                        </div>
                      </div>

                      {/* Gold seal */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        border: '2px solid #d4a843',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'radial-gradient(circle at 30% 30%, rgba(245,214,138,0.15), transparent)',
                        position: 'relative',
                      }}>
                        <Star size={20} color="#d4a843" fill="#d4a843" />
                        <div style={{
                          position: 'absolute', inset: '-4px', borderRadius: '50%',
                          border: '1px solid rgba(212,168,67,0.2)',
                        }} />
                      </div>

                      {/* Background decorative dots */}
                      <div style={{
                        position: 'absolute', top: '80px', right: '60px',
                        width: '100px', height: '100px',
                        border: '1px solid rgba(212,168,67,0.05)',
                        borderRadius: '50%',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: '80px', left: '60px',
                        width: '80px', height: '80px',
                        border: '1px solid rgba(212,168,67,0.05)',
                        borderRadius: '50%',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
