import React from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0d0e13] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1c25] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Shield Header */}
        <div className="flex justify-center">
          <div className="p-3 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] rounded-2xl">
            <ShieldCheck size={36} />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Xác minh chứng chỉ PC Master</h1>
          <p className="text-xs text-gray-500 mt-1">Cổng thông tin xác thực chứng chỉ hoàn thành học tập</p>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          {!cert ? (
            <div className="space-y-3">
              <div className="flex justify-center text-red-500">
                <XCircle size={48} className="animate-bounce" />
              </div>
              <h2 className="text-lg font-bold text-red-400">Không tìm thấy chứng chỉ</h2>
              <p className="text-xs text-gray-400">
                Mã số chứng chỉ <strong className="text-white">{params.certificateNumber}</strong> không tồn tại trên hệ thống dữ liệu của chúng tôi.
              </p>
            </div>
          ) : cert.is_revoked ? (
            <div className="space-y-3">
              <div className="flex justify-center text-orange-500">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-lg font-bold text-orange-400">Chứng chỉ đã bị thu hồi</h2>
              <p className="text-xs text-gray-400">
                Chứng chỉ số <strong className="text-white">{cert.certificate_number}</strong> cấp ngày {cert.completion_date} đã bị thu hồi do vi phạm quy chế hoặc thay đổi thông tin.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex justify-center text-[#00d4aa] mb-2">
                <CheckCircle size={48} className="shadow-[0_0_12px_rgba(0,212,170,0.3)] rounded-full" />
              </div>
              <h2 className="text-md font-bold text-[#00d4aa] text-center">Chứng chỉ hợp lệ</h2>

              <div className="space-y-2 bg-[#1e202f]/50 border border-gray-800 p-4 rounded-xl text-xs">
                <p className="text-gray-400">Học viên nhận:</p>
                <p className="font-bold text-white text-sm">{cert.student_name}</p>

                <p className="text-gray-400 mt-2">Nội dung học tập:</p>
                <p className="font-bold text-white text-sm">{cert.course_title}</p>

                <p className="text-gray-400 mt-2">Kết quả đánh giá:</p>
                <p className="font-bold text-white text-sm">{cert.final_score}% điểm tối đa</p>

                <p className="text-gray-400 mt-2">Ngày cấp chứng nhận:</p>
                <p className="font-bold text-[#00d4aa]">{cert.completion_date}</p>

                <p className="text-gray-400 mt-2">Mã số tra cứu:</p>
                <p className="font-bold text-white font-mono">{cert.certificate_number}</p>
              </div>

              {cert.pdf_url && (
                <a 
                  href={cert.pdf_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-center w-full bg-[#00d4aa] text-[#0d0e13] font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-xs"
                >
                  Tải xuống bản PDF gốc
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
