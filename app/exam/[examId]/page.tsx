import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import ExamPlayer from './ExamPlayer'
import { startExamAttempt } from '@/lib/exam-actions'

export const dynamic = 'force-dynamic'

export default async function ExamPage({ params }: { params: { examId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Khởi tạo phiên thi (Attempt)
  const res = await startExamAttempt(params.examId)
  if (res.error) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">Lỗi: {res.error}</div>
  }

  // 2. Ngân hàng câu hỏi thật về kiến trúc máy tính và phần cứng PC (Chuẩn Tin Học Trẻ / Olympiad)
  const realQuestions: any = [
    {
      id: 'q1',
      text: "Trong kiến trúc máy tính Von Neumann, bộ xử lý trung tâm (CPU) gồm những thành phần cốt lõi nào?",
      type: 'single',
      options: [
        { id: 'A', text: "Bộ điều khiển (CU) và Bộ tính toán số học/logic (ALU)" },
        { id: 'B', text: "Bộ nhớ RAM và ROM BIOS" },
        { id: 'C', text: "Thiết bị vào (Input) và Thiết bị ra (Output)" },
        { id: 'D', text: "Ổ cứng HDD và nguồn điện PSU" }
      ]
    },
    {
      id: 'q2',
      text: "Bộ nhớ đệm (Cache) tích hợp trực tiếp trong CPU có tác dụng chính là gì?",
      type: 'single',
      options: [
        { id: 'A', text: "Tăng tốc độ truy xuất dữ liệu bằng cách lưu trữ tạm thời các lệnh/dữ liệu thường dùng từ RAM" },
        { id: 'B', text: "Tăng dung lượng lưu trữ tổng thể của hệ điều hành" },
        { id: 'C', text: "Ngăn chặn virus độc hại xâm nhập vào nhân xử lý" },
        { id: 'D', text: "Thay thế hoàn toàn bộ nhớ trong RAM khi đầy dung lượng" }
      ]
    },
    {
      id: 'q3',
      text: "Bộ nhớ RAM (Random Access Memory) là bộ nhớ chỉ đọc, không bị mất dữ liệu khi mất điện.",
      type: 'boolean'
    },
    {
      id: 'q4',
      text: "Thiết bị nào sau đây là thiết bị lưu trữ thứ cấp (Secondary Storage) không bị mất dữ liệu khi tắt nguồn điện?",
      type: 'single',
      options: [
        { id: 'A', text: "SSD (Solid State Drive)" },
        { id: 'B', text: "RAM (Random Access Memory)" },
        { id: 'C', text: "Cache L2" },
        { id: 'D', text: "Register (Thanh ghi)" }
      ]
    },
    {
      id: 'q5',
      text: "Mục đích chính của công nghệ Hyper-Threading (Siêu phân luồng) trên CPU Intel là gì?",
      type: 'single',
      options: [
        { id: 'A', text: "Cho phép một nhân vật lý (Physical Core) xử lý đồng thời hai luồng dữ liệu logic" },
        { id: 'B', text: "Tự động tăng xung nhịp cơ bản (Base Clock) của CPU lên mức tối đa" },
        { id: 'C', text: "Giảm 50% lượng điện năng tiêu thụ khi tải nặng" },
        { id: 'D', text: "Hỗ trợ CPU kết nối trực tiếp với card đồ họa rời không qua PCIe" }
      ]
    },
    {
      id: 'q6',
      text: "Đơn vị FLOPS (Floating-point Operations Per Second) thường được dùng để đo hiệu năng của linh kiện nào nhiều nhất?",
      type: 'single',
      options: [
        { id: 'A', text: "GPU (Card đồ họa rời / Bộ xử lý đồ họa)" },
        { id: 'B', text: "Tốc độ quay của Quạt tản nhiệt (RPM)" },
        { id: 'C', text: "Tốc độ truyền dữ liệu của cáp mạng Lan" },
        { id: 'D', text: "Xung nhịp hoạt động của RAM" }
      ]
    },
    {
      id: 'q7',
      text: "Chuẩn giao tiếp PCIe 4.0 x16 có băng thông lý thuyết tối đa là bao nhiêu GB/s?",
      type: 'single',
      options: [
        { id: 'A', text: "31.5 GB/s (khoảng 32 GB/s)" },
        { id: 'B', text: "15.8 GB/s (khoảng 16 GB/s)" },
        { id: 'C', text: "63.0 GB/s (khoảng 64 GB/s)" },
        { id: 'D', text: "8.0 GB/s" }
      ]
    },
    {
      id: 'q8',
      text: "Điền tên viết tắt của bộ phận cấp nguồn, chuyển đổi dòng điện xoay chiều (AC) thành một chiều (DC) để nuôi các linh kiện máy tính?",
      type: 'fill'
    },
    {
      id: 'q9',
      text: "Keo tản nhiệt (Thermal Paste) có tác dụng lấp đầy khoảng trống không khí siêu nhỏ giữa bề mặt CPU và phiến tản nhiệt nhằm tăng hiệu quả truyền nhiệt.",
      type: 'boolean'
    },
    {
      id: 'q10',
      text: "Hãy trình bày ngắn gọn (từ 2-3 câu) lý do tại sao không nên chọn bộ nguồn PSU kém chất lượng (noname) khi lắp ráp PC cấu hình cao.",
      type: 'essay'
    }
  ]

  return (
    <ExamPlayer 
      examId={params.examId} 
      attemptId={res.attemptId} 
      questions={realQuestions} 
      timeLimit={30} 
    />
  )
}
