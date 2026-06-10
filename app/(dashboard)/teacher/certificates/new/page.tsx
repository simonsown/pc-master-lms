'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Award, Users, BookOpen, Layers } from 'lucide-react'
import Link from 'next/link'
import { issueCustomCertificate } from '@/lib/certificates'

// Danh sách các sticker/badge ảnh dán mẫu đẹp cho chứng chỉ phần cứng
const BADGE_TEMPLATES = [
  { id: 'cpu', name: 'Bậc Thầy CPU (CPU Master)', url: '/badges/cpu_master.png', color: '#00f3ff' },
  { id: 'gpu', name: 'Chiến Thần GPU (GPU Gladiator)', url: '/badges/gpu_gladiator.png', color: '#f43f5e' },
  { id: 'ram', name: 'Siêu Cấp RAM (RAM Champion)', url: '/badges/ram_champion.png', color: '#eab308' },
  { id: 'pc_builder', name: 'Kỹ Sư Lắp Ráp PC (PC Assembly Guru)', url: '/badges/pc_builder.png', color: '#10b981' },
  { id: 'master', name: 'PC Master Vô Địch (LMS Grandmaster)', url: '/badges/grandmaster.png', color: '#a855f7' }
]

export default function NewCertificatePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data lists
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  
  // Selections
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [courseTitle, setCourseTitle] = useState('Khóa học Lắp ráp PC Master')
  const [finalScore, setFinalScore] = useState(100)
  const [selectedBadge, setSelectedBadge] = useState('pc_builder')
  const [customStickerUrl, setCustomStickerUrl] = useState('')
  const [useCustomUrl, setUseCustomUrl] = useState(false)
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchTeacherClasses()
  }, [])

  const fetchTeacherClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      // Lấy danh sách lớp học của giáo viên
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setClasses(data || [])
      
      if (data && data.length > 0) {
        setSelectedClassId(data[0].id)
        fetchStudentsForClass(data[0].id)
      } else {
        setInitialLoading(false)
      }
    } catch (err) {
      console.error('Error loading teacher classes:', err)
      setInitialLoading(false)
    }
  }

  const fetchStudentsForClass = async (classId: string) => {
    setStudents([])
    setSelectedStudentId('')
    try {
      // Lấy danh sách thành viên trong lớp học cùng profile của học sinh
      const { data, error } = await supabase
        .from('class_members')
        .select('student_id, profiles!inner(id, full_name, email)')
        .eq('class_id', classId)

      if (error) throw error
      
      const studentProfiles = (data || []).map((m: any) => m.profiles)
      setStudents(studentProfiles)
      
      if (studentProfiles.length > 0) {
        setSelectedStudentId(studentProfiles[0].id)
      }
    } catch (err) {
      console.error('Error loading students for class:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    fetchStudentsForClass(classId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) {
      setError('Vui lòng chọn học sinh nhận chứng chỉ!')
      return
    }

    setLoading(true)
    setError(null)

    // Xác định URL sticker/ảnh dán
    let badgeUrl = ''
    if (useCustomUrl) {
      badgeUrl = customStickerUrl.trim()
      if (!badgeUrl) {
        setError('Vui lòng nhập đường dẫn ảnh dán tùy chỉnh!')
        setLoading(false)
        return
      }
    } else {
      const template = BADGE_TEMPLATES.find(b => b.id === selectedBadge)
      badgeUrl = template ? template.url : '/badges/pc_builder.png'
    }

    try {
      // Gọi Server Action để cấp chứng chỉ dán nhãn
      await issueCustomCertificate({
        studentId: selectedStudentId,
        courseTitle,
        finalScore: Number(finalScore),
        stickerUrl: badgeUrl,
        completionDate
      })

      // Thành công, chuyển về trang danh sách
      router.push('/teacher/certificates')
      router.refresh()
    } catch (err: any) {
      console.error('Error issuing certificate:', err)
      setError(err.message || 'Lỗi khi lưu và cấp chứng chỉ.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(5, 10, 20, 0.5)',
    color: 'white', fontSize: '15px', outline: 'none'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 700, color: '#8899a6', marginBottom: '8px'
  }

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <Loader2 className="animate-spin" color="#00d4aa" size={48} />
        <div style={{ color: '#8899a6', fontSize: '14px' }}>Đang nạp cấu hình giảng dạy...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '850px', margin: '0 auto', color: '#e0e6ed', fontFamily: 'var(--font-sans)', background: '#050a14', minHeight: '100vh' }}>
      <Link href="/teacher/certificates" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '32px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Quay lại danh sách
      </Link>

      <div style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(0, 212, 170, 0.1)', color: '#00d4aa', padding: '10px', borderRadius: '12px' }}>
            <Award size={28} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#fff' }}>Cấp Chứng Chỉ Ảnh Dán Cho Học Sinh</h1>
        </div>

        {classes.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            Bạn chưa tạo lớp học nào! Giáo viên cần có lớp học chứa học sinh để cấp chứng chỉ. Hãy quay lại trang Quản lý lớp học để thiết lập.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Lớp & Học sinh */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Chọn lớp học</label>
                <select 
                  value={selectedClassId} 
                  onChange={(e) => handleClassChange(e.target.value)} 
                  style={inputStyle}
                  required
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.grade} - {c.school_year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Chọn học sinh</label>
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)} 
                  style={inputStyle}
                  required
                >
                  {students.length === 0 ? (
                    <option value="">Lớp này chưa có học sinh nào</option>
                  ) : (
                    students.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Tên chứng chỉ & Điểm */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Tên chứng chỉ / Khóa học</label>
                <input 
                  type="text" 
                  value={courseTitle} 
                  onChange={(e) => setCourseTitle(e.target.value)} 
                  placeholder="Ví dụ: Khóa học Lắp ráp PC Master"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Điểm tốt nghiệp (%)</label>
                <input 
                  type="number" 
                  value={finalScore} 
                  onChange={(e) => setFinalScore(Number(e.target.value))} 
                  min={0} max={100}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Ngày cấp */}
            <div>
              <label style={labelStyle}>Ngày cấp chứng nhận</label>
              <input 
                type="date" 
                value={completionDate} 
                onChange={(e) => setCompletionDate(e.target.value)} 
                style={inputStyle}
                required
              />
            </div>

            {/* Chọn Ảnh Dán / Badge */}
            <div>
              <label style={labelStyle}>Chọn Huy hiệu / Ảnh dán Khen Thưởng</label>
              
              {/* Grid các huy hiệu có sẵn */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {BADGE_TEMPLATES.map((badge) => (
                  <div 
                    key={badge.id}
                    onClick={() => {
                      setSelectedBadge(badge.id)
                      setUseCustomUrl(false)
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: selectedBadge === badge.id && !useCustomUrl 
                        ? `2px solid ${badge.color}` 
                        : '1.5px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedBadge === badge.id && !useCustomUrl 
                        ? `0 0 16px rgba(${badge.id === 'cpu' ? '0,243,255' : badge.id === 'ram' ? '234,179,8' : '16,185,129'}, 0.2)`
                        : 'none'
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 12px auto', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: badge.color }}>
                      <Award size={36} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: selectedBadge === badge.id && !useCustomUrl ? '#fff' : '#8899a6', lineHeight: 1.3 }}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tùy chọn nhập ảnh dán bên ngoài */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e0e6ed', cursor: 'pointer', marginBottom: '12px' }}>
                  <input 
                    type="checkbox" 
                    checked={useCustomUrl} 
                    onChange={(e) => setUseCustomUrl(e.target.checked)} 
                  />
                  Sử dụng đường dẫn ảnh dán tùy chỉnh (External URL)
                </label>
                
                {useCustomUrl && (
                  <input 
                    type="text" 
                    value={customStickerUrl} 
                    onChange={(e) => setCustomStickerUrl(e.target.value)} 
                    placeholder="Nhập link ảnh (PNG/JPG) huy hiệu bên ngoài..."
                    style={inputStyle}
                  />
                )}
              </div>
            </div>

            {error && (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px', borderRadius: '12px', background: '#00d4aa',
              color: '#050a14', fontSize: '16px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px'
            }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Cấp chứng chỉ & Dán nhãn</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
