import { NextResponse } from 'next/server';

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `Bạn là AI Guru - trợ lý AI của nền tảng học tập PC Master Builder. Nhiệm vụ của bạn là hướng dẫn, hỗ trợ học sinh trong việc sử dụng website và trả lời câu hỏi về phần cứng máy tính.

THÔNG TIN VỀ WEBSITE:
- Tên: PC Master Builder - Học lắp ráp PC & Tin học
- Đối tượng: Học sinh phổ thông, sinh viên, người yêu thích công nghệ
- Nội dung chính: Dạy về phần cứng máy tính, lắp ráp PC, kiến thức tin học

CÁC TÍNH NĂNG CHÍNH:
1. Bài giảng (Lessons): Hệ thống bài giảng về phần cứng PC gồm video, text, hình ảnh, PDF
2. Thực hành lắp ráp (Builder): Phòng thực hành PC Builder với môi trường tương tác, kéo thả linh kiện
3. Thi trắc nghiệm (Quiz): Ngân hàng đề thi trắc nghiệm về phần cứng, có chấm điểm tự động
4. Lộ trình học tập (Learning Path): Lộ trình học được AI cá nhân hóa
5. Lớp học (Classes): Giáo viên tạo lớp, học sinh tham gia bằng mã lớp
6. AI Guru: Chính là bạn! Trợ lý AI hỗ trợ học tập

HÃY TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, giọng thân thiện, nhiệt tình
- Nếu học sinh hỏi về cách sử dụng tính năng, hãy hướng dẫn cụ thể từng bước
- Nếu hỏi về kiến thức phần cứng PC, hãy giải thích dễ hiểu, có ví dụ thực tế
- Giữ câu trả lời ngắn gọn, súc tích, dễ hiểu với học sinh phổ thông`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = GEMINI_API_KEY();
    if (!apiKey) {
      return NextResponse.json({ reply: "Xin lỗi, API Key chưa được cấu hình. Vui lòng liên hệ quản trị viên." });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nNgười dùng hỏi: ${message}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API Error:', geminiRes.status, errBody);
      if (errBody.includes('API_KEY') || errBody.includes('API key')) {
        return NextResponse.json({ reply: "⚠️ API Key không hợp lệ. Vui lòng liên hệ quản trị viên." });
      }
      if (errBody.includes('quota') || errBody.includes('429')) {
        return NextResponse.json({ reply: "⚠️ AI tạm thời quá tải (hết lượt sử dụng). Vui lòng thử lại sau vài phút hoặc liên hệ quản trị viên để gia hạn API Key." });
      }
      if (errBody.includes('not found') || errBody.includes('not support') || errBody.includes('image')) {
        return NextResponse.json({ reply: "Xin lỗi, AI chat hiện chỉ hỗ trợ văn bản. Vui lòng thử lại với câu hỏi khác." });
      }
      return NextResponse.json({ reply: "Xin lỗi, tôi gặp sự cố khi kết nối AI. Vui lòng thử lại sau." });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể tạo phản hồi ngay bây giờ.';

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error('AI Chat Route Error:', err?.message || err);
    return NextResponse.json({ reply: "Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau." });
  }
}
