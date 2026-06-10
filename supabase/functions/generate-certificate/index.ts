import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import QRCode from 'https://esm.sh/qrcode@1.5.3'

serve(async (req) => {
  try {
    const { certificateId } = await req.json()

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch certificate details
    const { data: cert, error: fetchErr } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single()

    if (fetchErr || !cert) {
      return new Response(JSON.stringify({ error: "Certificate not found" }), { status: 404 })
    }

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595]) // A4 Landscape

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Dark Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 842,
      height: 595,
      color: rgb(0.05, 0.06, 0.075) // #0d0e13
    })

    // Glowing Boarder
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 802,
      height: 555,
      borderColor: rgb(0, 0.83, 0.67), // #00d4aa
      borderWidth: 2
    })

    // Title
    page.drawText('CHUNG CHI HOAN THANH', {
      x: 260,
      y: 470,
      size: 28,
      font: fontBold,
      color: rgb(0, 0.83, 0.67)
    })

    page.drawText('Chung nhan hoc vien', {
      x: 350,
      y: 420,
      size: 14,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    // Student Name
    page.drawText(cert.student_name, {
      x: 300,
      y: 360,
      size: 32,
      font: fontBold,
      color: rgb(0.87, 0.88, 0.93)
    })

    // Course Title
    page.drawText(`Da hoan thanh xuat sac khoa hoc`, {
      x: 310,
      y: 310,
      size: 14,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    page.drawText(cert.course_title, {
      x: 270,
      y: 260,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.83, 0.67)
    })

    // Info
    page.drawText(`Diem: ${cert.final_score}% | Ngay cap: ${cert.completion_date}`, {
      x: 280,
      y: 200,
      size: 12,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    page.drawText(`Ma chung chi: ${cert.certificate_number}`, {
      x: 310,
      y: 160,
      size: 12,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6)
    })

    // 9. QR Code verify url
    const qrDataUrl = await QRCode.toDataURL(cert.verify_url)
    const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
    const qrImage = await pdfDoc.embedPng(qrImageBytes)
    page.drawImage(qrImage, {
      x: 700,
      y: 40,
      width: 90,
      height: 90
    })

    // Save PDF
    const pdfBytes = await pdfDoc.save()

    // 11. Upload to Supabase Storage
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('certificates')
      .upload(`${certificateId}.pdf`, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadErr) throw uploadErr

    const publicUrl = supabaseAdmin.storage
      .from('certificates').getPublicUrl(`${certificateId}.pdf`).data.publicUrl

    // 12. Update Certificate PDF url
    await supabaseAdmin
      .from('certificates')
      .update({ pdf_url: publicUrl })
      .eq('id', certificateId)

    return new Response(JSON.stringify({ pdfUrl: publicUrl }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
