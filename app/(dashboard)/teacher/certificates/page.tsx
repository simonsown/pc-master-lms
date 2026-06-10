'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Award, ArrowLeft, Loader2, Calendar, FileText, Search, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCertificatesPage() {
  const supabase = createClientComponentClient()
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      // Tải danh sách chứng chỉ
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (err) {
      console.error('Error fetching certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCerts = certificates.filter(c => 
    c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <Loader2 className="animate-spin" color="#00d4aa" size={48} />
        <div style={{ color: '#8899a6', fontSize: '14px' }}>Đang tải danh sách chứng chỉ...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px', padding: '24px', color: '#e0e6ed', fontFamily: 'var(--font-sans)', background: '#050a14', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/teacher" style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#8899a6', textDecoration: 'none'
          }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
              Quản lý <span style={{ color: '#00d4aa' }}>Chứng Chỉ</span>
            </h1>
            <p style={{ color: '#8899a6', margin: '4px 0 0 0', fontSize: '14px' }}>Cấp chứng chỉ và dán nhãn khen thưởng thành tích xuất sắc của học sinh.</p>
          </div>
        </div>
        
        <Link href="/teacher/certificates/new">
          <button style={{
            background: '#00d4aa', color: '#050a14', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <Plus size={20} /> Cấp chứng chỉ mới
          </button>
        </Link>
      </header>

      {/* Stats Summary Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(0, 212, 170, 0.1)', color: '#00d4aa', width: 'fit-content', marginBottom: '16px' }}>
            <Award size={20} />
          </div>
          <div style={{ fontSize: '13px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>Tổng số chứng chỉ đã cấp</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>{certificates.length}</div>
        </div>

        <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 'fit-content', marginBottom: '16px' }}>
            <User size={20} />
          </div>
          <div style={{ fontSize: '13px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>Số học sinh nhận thưởng</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {new Set(certificates.map(c => c.student_id)).size}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '12px', color: '#4b5563' }} size={20} />
        <input 
          type="text" 
          placeholder="Tìm tên học sinh, khóa học, mã số..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12, 20, 36, 0.5)',
            color: 'white', fontSize: '14px', outline: 'none'
          }}
        />
      </div>

      {/* Main List Table */}
      <div style={{ background: 'rgba(12, 20, 36, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}>
        {filteredCerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8899a6' }}>
            <Award size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3>Chưa tìm thấy chứng chỉ nào.</h3>
            <p style={{ fontSize: '13px' }}>Hãy thử đổi từ khóa tìm kiếm hoặc cấp chứng chỉ đầu tiên!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Tên học sinh</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Tên khóa học / Lộ trình</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Mã số</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Điểm số</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Ảnh dán / Badge</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontWeight: 600 }}>Ngày cấp</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#e0e6ed' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>{cert.student_name}</td>
                  <td style={{ padding: '16px 24px' }}>{cert.course_title}</td>
                  <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#00d4aa' }}>{cert.certificate_number}</td>
                  <td style={{ padding: '16px 24px', color: '#00d4aa', fontWeight: 800 }}>{cert.final_score}%</td>
                  <td style={{ padding: '16px 24px' }}>
                    {cert.pdf_url ? (
                      <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                        <img 
                          src={cert.pdf_url} 
                          alt="Badge" 
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', padding: '4px', border: '1px solid rgba(0,212,170,0.2)' }} 
                        />
                      </a>
                    ) : (
                      <span style={{ color: '#4b5563', fontSize: '12px' }}>Không có</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#8899a6' }}>
                    {cert.completion_date ? new Date(cert.completion_date).toLocaleDateString('vi-VN') : new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
