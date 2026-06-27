import React from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck, Award, Star, Calendar, Hash, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VerifyCertificatePage({ params }: { params: { certificateNumber: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_number', params.certificateNumber)
    .maybeSingle()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0c1a 0%, #0d0e13 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#1a1c25',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '2px solid #00d4aa', borderLeft: '2px solid #00d4aa' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '2px solid #00d4aa', borderRight: '2px solid #00d4aa' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '2px solid #00d4aa', borderLeft: '2px solid #00d4aa' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '2px solid #00d4aa', borderRight: '2px solid #00d4aa' }} />

        {/* Shield Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {!cert ? (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={32} style={{ color: '#ef4444' }} />
            </div>
          ) : cert.is_revoked ? (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={32} style={{ color: '#f59e0b' }} />
            </div>
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={32} style={{ color: '#00d4aa' }} />
            </div>
          )}
        </div>

        <h1 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', letterSpacing: '0.5px' }}>
          XÁC MINH CHỨNG CHỈ
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
          Cổng thông tin xác thực chứng chỉ PC Master Academy
        </p>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
          {!cert ? (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                KHÔNG TÌM THẤY CHỨNG CHỈ
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                Mã số <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{params.certificateNumber}</strong> không tồn tại trên hệ thống.
              </p>
              <div style={{
                padding: '12px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Vui lòng kiểm tra lại mã số chứng chỉ hoặc liên hệ bộ phận hỗ trợ.
              </div>
            </div>
          ) : cert.is_revoked ? (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                CHỨNG CHỈ ĐÃ BỊ THU HỒI
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                Chứng chỉ số <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{cert.certificate_number}</strong> cấp ngày {cert.completion_date} đã bị thu hồi.
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px',
                border: '1px solid rgba(0,212,170,0.3)',
                color: '#00d4aa',
                fontSize: '11px', fontWeight: 700,
                fontFamily: 'monospace',
                marginBottom: '16px',
              }}>
                <CheckCircle size={14} /> HỢP LỆ
              </div>

              {/* Certificate Preview */}
              <div style={{
                background: 'linear-gradient(135deg, #0a0c1a 0%, #1a1c2e 50%, #0a0c1a 100%)',
                border: '1px solid rgba(212,168,67,0.3)',
                padding: '20px',
                marginBottom: '16px',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', bottom: '4px', border: '1px solid rgba(212,168,67,0.1)', pointerEvents: 'none' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4a843, #f5d68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Award size={16} color="#0a0c1a" />
                  </div>
                  <div style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '2px', color: 'rgba(212,168,67,0.5)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    PC MASTER ACADEMY
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#f5d68a', marginBottom: '8px' }}>
                    {cert.course_title}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                    {cert.student_name}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={8} /> {cert.completion_date || new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Hash size={8} /> {cert.certificate_number}
                    </span>
                  </div>
                  {cert.final_score && (
                    <div style={{ marginTop: '6px', fontSize: '8px', color: '#d4a843', border: '1px solid rgba(212,168,67,0.2)', display: 'inline-block', padding: '2px 8px' }}>
                      ĐIỂM: {cert.final_score}%
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', textAlign: 'left' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>Học viên</div>
                  <div style={{ fontWeight: 700 }}>{cert.student_name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>Khóa học</div>
                  <div style={{ fontWeight: 700 }}>{cert.course_title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>Điểm số</div>
                  <div style={{ fontWeight: 700, color: '#00d4aa' }}>{cert.final_score}%</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>Ngày cấp</div>
                  <div style={{ fontWeight: 700 }}>{cert.completion_date || new Date(cert.issued_at).toLocaleDateString('vi-VN')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>Mã số</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '10px' }}>{cert.certificate_number}</div>
                </div>
              </div>

              {cert.pdf_url && (
                <a href={cert.pdf_url} target="_blank" rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    width: '100%', padding: '10px',
                    background: '#00d4aa',
                    color: '#0d0e13',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                    fontFamily: 'monospace',
                  }}>
                  <Download size={14} /> TẢI PDF GỐC
                </a>
              )}

              <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#00d4aa' }} />
                Chứng chỉ này được xác thực bởi PC Master Academy
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
