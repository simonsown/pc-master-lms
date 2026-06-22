import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const N8N_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').trim()

function verifyN8nRequest(request: Request): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${N8N_SECRET}`
}

export async function POST(request: Request) {
  try {
    if (!verifyN8nRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId, pathId } = await request.json()
    if (!studentId || !pathId) {
      return NextResponse.json({ error: 'Missing studentId or pathId' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: existing } = await supabase
      .from('certificates')
      .select('id, pdf_url')
      .eq('student_id', studentId)
      .eq('path_id', pathId)
      .maybeSingle()

    if (existing?.pdf_url) {
      return NextResponse.json({ success: true, certificate: existing, message: 'Certificate already exists' })
    }

    const { data: pathItems } = await supabase
      .from('path_items')
      .select('id, item_id, item_type')
      .eq('path_id', pathId)

    const lessonIds = (pathItems || []).filter(i => i.item_type === 'lesson').map(i => i.item_id)
    const quizIds = (pathItems || []).filter(i => i.item_type === 'quiz').map(i => i.item_id)

    if (lessonIds.length > 0) {
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', studentId)
        .eq('status', 'completed')

      const completedIds = (progress || []).map(p => p.lesson_id)
      const allDone = lessonIds.every(id => completedIds.includes(id))

      if (!allDone) {
        return NextResponse.json({ error: 'Not all lessons completed' }, { status: 400 })
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single()

    const { data: path } = await supabase
      .from('learning_paths')
      .select('title')
      .eq('id', pathId)
      .single()

    let totalScore = 100
    if (quizIds.length > 0) {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('student_id', studentId)
        .eq('status', 'submitted')
        .in('quiz_id', quizIds)

      const sum = (attempts || []).reduce((acc, a) => acc + (a.score || 0), 0)
      totalScore = Math.round(sum / quizIds.length)
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomPart = ''
    for (let i = 0; i < 5; i++) randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    const certNumber = `PCM-2026-${randomPart}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pc-master-lms.vercel.app'
    const verifyUrl = `${siteUrl}/verify/${certNumber}`

    const { data: cert, error: insertErr } = await supabase
      .from('certificates')
      .insert({
        student_id: studentId,
        path_id: pathId,
        certificate_number: certNumber,
        student_name: profile?.full_name || 'Hoc vien PC Master',
        course_title: path?.title || 'Lo trinh Lap rap PC Master',
        final_score: totalScore,
        verify_url: verifyUrl,
        completion_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (insertErr || !cert) {
      return NextResponse.json({ error: 'Failed to create certificate', details: insertErr }, { status: 500 })
    }

    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([842, 595])

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

      page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(0.05, 0.06, 0.075) })
      page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: rgb(0, 0.83, 0.67), borderWidth: 2 })

      page.drawText('CHUNG NHAN HOAN THANH', { x: 250, y: 460, size: 28, font: fontBold, color: rgb(0, 0.83, 0.67) })
      page.drawText('Chung chi nay duoc trao cho', { x: 330, y: 400, size: 14, font: fontRegular, color: rgb(0.6, 0.6, 0.6) })
      page.drawText(cert.student_name, { x: 260, y: 340, size: 36, font: fontBold, color: rgb(0.87, 0.88, 0.93) })
      page.drawText('Vi da hoan thanh xuat sac khoa hoc', { x: 320, y: 290, size: 12, font: fontRegular, color: rgb(0.6, 0.6, 0.6) })
      page.drawText(cert.course_title, { x: 260, y: 240, size: 20, font: fontBold, color: rgb(0, 0.83, 0.67) })
      page.drawText(`Diem so: ${cert.final_score}% | Ngay cap: ${cert.completion_date}`, { x: 280, y: 180, size: 11, font: fontRegular, color: rgb(0.5, 0.5, 0.5) })
      page.drawText(`Ma so chung chi: ${cert.certificate_number}`, { x: 300, y: 140, size: 11, font: fontRegular, color: rgb(0.5, 0.5, 0.5) })

      const qrDataUrl = await QRCode.toDataURL(verifyUrl)
      const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
      const qrImage = await pdfDoc.embedPng(qrImageBytes)
      page.drawImage(qrImage, { x: 690, y: 40, width: 90, height: 90 })

      const pdfBytes = await pdfDoc.save()

      const { error: uploadErr } = await supabase.storage
        .from('certificates')
        .upload(`${cert.id}.pdf`, pdfBytes, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) throw uploadErr

      const publicUrl = supabase.storage.from('certificates').getPublicUrl(`${cert.id}.pdf`).data.publicUrl

      await supabase.from('certificates').update({ pdf_url: publicUrl }).eq('id', cert.id)

      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'success',
        title: 'Chung chi moi!',
        body: `Chuc mung! Ban da nhan duoc chung chi "${cert.course_title}" voi so diem ${cert.final_score}%!`,
        action_url: `/verify/${certNumber}`
      })

      const { data: parentLinks } = await supabase
        .from('parent_student_links')
        .select('parent_id')
        .eq('student_id', studentId)

      if (parentLinks && parentLinks.length > 0) {
        const parentNotifs = parentLinks.map(pl => ({
          user_id: pl.parent_id,
          type: 'success',
          title: 'Con ban hoan thanh khoa hoc!',
          body: `Con ban ${cert.student_name} vua hoan thanh "${cert.course_title}" voi diem ${cert.final_score}%!`,
          action_url: `/verify/${certNumber}`
        }))
        await supabase.from('notifications').insert(parentNotifs)
      }

      const { data: studentClasses } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', studentId)
        .eq('status', 'active')

      if (studentClasses && studentClasses.length > 0) {
        const classIds = studentClasses.map(c => c.class_id)
        const { data: teachers } = await supabase
          .from('classes')
          .select('teacher_id')
          .in('id', classIds)

        if (teachers && teachers.length > 0) {
          const teacherNotifs = [...new Set(teachers.map(t => t.teacher_id))].map(tid => ({
            user_id: tid,
            type: 'success',
            title: 'Hoc sinh hoan thanh khoa hoc!',
            body: `Hoc sinh ${cert.student_name} da hoan thanh "${cert.course_title}"!`,
            action_url: `/verify/${certNumber}`
          }))
          await supabase.from('notifications').insert(teacherNotifs)
        }
      }

      await supabase.from('xp_transactions').insert({
        user_id: studentId,
        amount: 200,
        reason: 'certificate_completed',
        reference_type: 'certificate',
        reference_id: cert.id
      })

      try {
        await supabase.rpc('add_xp', { p_user_id: studentId, p_amount: 200 })
      } catch {}

      return NextResponse.json({
        success: true,
        certificate: { id: cert.id, pdf_url: publicUrl, cert_number: certNumber, score: totalScore }
      })
    } catch (pdfErr: any) {
      return NextResponse.json({
        success: true,
        certificate: cert,
        warning: 'PDF generation failed, but certificate record created: ' + pdfErr.message
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
