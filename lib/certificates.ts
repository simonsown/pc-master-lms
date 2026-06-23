'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export async function issueCertificate(userId: string, pathId: string) {
  const supabase = await createClient()

  // 1. Check if certificate already exists
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, pdf_url')
    .eq('student_id', userId)
    .eq('path_id', pathId)
    .maybeSingle()

  if (existing) return existing

  // 2. Validate all lessons completed
  const { data: pathItems } = await supabase
    .from('path_items')
    .select('id, item_id, item_type')
    .eq('path_id', pathId)

  const lessons = (pathItems || []).filter(i => i.item_type === 'lesson')
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('student_id', userId)
    .eq('status', 'completed')

  const completedLessonIds = (progress || []).map(p => p.lesson_id)
  const allCompleted = lessons.every(l => completedLessonIds.includes(l.item_id))

  if (!allCompleted) {
    throw new Error('Bạn chưa hoàn thành tất cả bài học cần thiết.')
  }

  // 3. Snapshot student and course information
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  const { data: path } = await supabase
    .from('learning_paths')
    .select('title')
    .eq('id', pathId)
    .single()

  // Calculate final score based on student's quizzes in this path
  const quizzes = (pathItems || []).filter(i => i.item_type === 'quiz')
  let totalScore = 0
  if (quizzes.length > 0) {
    const quizIds = quizzes.map(q => q.item_id)
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('student_id', userId)
      .eq('status', 'submitted')
      .in('quiz_id', quizIds)
    
    const sum = (attempts || []).reduce((acc, a) => acc + (a.score || 0), 0)
    totalScore = sum / (quizzes.length || 1)
  } else {
    totalScore = 100
  }

  // Generate certificate number
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomPart = ''
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const certNumber = `PCM-2026-${randomPart}`
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/verify/${certNumber}`

  // Create certificate record
  const { data: cert, error: insertErr } = await supabase
    .from('certificates')
    .insert({
      student_id: userId,
      path_id: pathId,
      certificate_number: certNumber,
      student_name: profile?.full_name || 'Học viên PC Master',
      course_title: path?.title || 'Lộ trình Lắp ráp PC Master',
      final_score: totalScore,
      verify_url: verifyUrl,
      completion_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

  if (insertErr || !cert) throw insertErr

  // 4. Node.js Direct PDF Generation Fallback (Ensures it works immediately!)
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595]) // A4 Landscape

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Background
    page.drawRectangle({
      x: 0, y: 0, width: 842, height: 595,
      color: rgb(0.05, 0.06, 0.075) // #0d0e13
    })

    // Glowing border
    page.drawRectangle({
      x: 20, y: 20, width: 802, height: 555,
      borderColor: rgb(0, 0.83, 0.67), // #00d4aa
      borderWidth: 2
    })

    // Content text drawing
    page.drawText('CHUNG NHAN HOAN THANH', {
      x: 250, y: 460, size: 28, font: fontBold,
      color: rgb(0, 0.83, 0.67)
    })

    page.drawText('Chung chi nay duoc trao cho', {
      x: 330, y: 400, size: 14, font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    page.drawText(cert.student_name, {
      x: 260, y: 340, size: 36, font: fontBold,
      color: rgb(0.87, 0.88, 0.93)
    })

    page.drawText('Vi da hoan thanh xuat sac khoa hoc', {
      x: 320, y: 290, size: 12, font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    page.drawText(cert.course_title, {
      x: 260, y: 240, size: 20, font: fontBold,
      color: rgb(0, 0.83, 0.67)
    })

    page.drawText(`Diem so: ${cert.final_score}% | Ngay cap: ${cert.completion_date}`, {
      x: 280, y: 180, size: 11, font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    })

    page.drawText(`Ma so chung chi: ${cert.certificate_number}`, {
      x: 300, y: 140, size: 11, font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    })

    // Generate QR Code verify url
    const qrDataUrl = await QRCode.toDataURL(verifyUrl)
    const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
    const qrImage = await pdfDoc.embedPng(qrImageBytes)
    
    page.drawImage(qrImage, {
      x: 690, y: 40, width: 90, height: 90
    })

    const pdfBytes = await pdfDoc.save()

    // Upload to Supabase Storage Bucket 'certificates'
    const { error: uploadErr } = await supabase.storage
      .from('certificates')
      .upload(`${cert.id}.pdf`, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadErr) throw uploadErr

    const publicUrl = supabase.storage
      .from('certificates').getPublicUrl(`${cert.id}.pdf`).data.publicUrl

    // Update pdf_url in DB
    await supabase
      .from('certificates')
      .update({ pdf_url: publicUrl })
      .eq('id', cert.id)

    return { id: cert.id, pdf_url: publicUrl }
  } catch (err) {
    console.error("PDF Generation error:", err)
    return cert
  }
}

export async function issueCustomCertificate(data: {
  studentId: string;
  courseTitle: string;
  finalScore: number;
  stickerUrl: string;
  completionDate: string;
}) {
  const supabase = await createClient()

  // Generate certificate number
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomPart = ''
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const certNumber = `PCM-2026-${randomPart}`
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/verify/${certNumber}`

  // Get student profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.studentId)
    .single()

  const { data: cert, error: insertErr } = await supabase
    .from('certificates')
    .insert({
      student_id: data.studentId,
      certificate_number: certNumber,
      student_name: profile?.full_name || 'Học viên PC Master',
      course_title: data.courseTitle,
      final_score: data.finalScore,
      pdf_url: data.stickerUrl, // Lưu ảnh dán/sticker vào trường pdf_url
      verify_url: verifyUrl,
      completion_date: data.completionDate || new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

  if (insertErr || !cert) throw insertErr
  return cert
}
