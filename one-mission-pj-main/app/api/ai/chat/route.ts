import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Xin lỗi, API Key chưa được cấu hình. Tôi không thể trả lời lúc này." });
    }

    const systemPrompt = `Bạn là AI Guru - trợ lý AI của nền tảng học tập PC Master Builder (https://pc-master-lms.vercel.app). Nhiệm vụ của bạn là hướng dẫn, hỗ trợ học sinh trong việc sử dụng website và trả lời câu hỏi về phần cứng máy tính.

THÔNG TIN VỀ WEBSITE:
- Tên: PC Master Builder - Học lắp ráp PC & Tin học
- Đối tượng: Học sinh phổ thông, sinh viên, người yêu thích công nghệ
- Nội dung chính: Dạy về phần cứng máy tính, lắp ráp PC, kiến thức tin học

CÁC TÍNH NĂNG CHÍNH:
1. Bài giảng (Lessons): Hệ thống bài giảng về phần cứng PC gồm video, text, hình ảnh, PDF. Chủ đề: CPU, RAM, Mainboard, GPU, PSU, Case,...
2. Thực hành lắp ráp 3D (Builder): Phòng thực hành PC Builder với môi trường 3D tương tác, kéo thả linh kiện, kiểm tra tương tương thích, nhận diện bàn tay qua webcam
3. Thi trắc nghiệm (Quiz): Ngân hàng đề thi trắc nghiệm về phần cứng, có chấm điểm tự động
4. Lộ trình học tập (Learning Path): Lộ trình học được AI cá nhân hóa dựa trên sở thích và tiến độ
5. Lớp học (Classes): Giáo viên tạo lớp, học sinh tham gia bằng mã lớp
6. Chứng chỉ (Certificates): Nhận chứng chỉ sau khi hoàn thành bài học
7. Bảng xếp hạng (Leaderboard): Xếp hạng học sinh dựa trên điểm XP
8. Diễn đàn (Discussion): Thảo luận thời gian thực với bạn bè
9. AI Guru: Chính là bạn! Trợ lý AI hỗ trợ học tập
10. Multiplayer: Chế độ 2 người chơi thi lắp ráp PC qua webcam

HÃY TRẢ LỜI:
- Nếu học sinh hỏi về cách sử dụng tính năng nào đó, hãy hướng dẫn cụ thể từng bước
- Nếu hỏi về kiến thức phần cứng PC, hãy giải thích dễ hiểu, có ví dụ thực tế
- Luôn trả lời bằng tiếng Việt, giọng thân thiện, nhiệt tình như người bạn đồng hành
- Nếu không biết câu trả lời, hãy thành thật và gợi ý hỏi giáo viên
- Giữ câu trả lời ngắn gọn, súc tích, dễ hiểu với học sinh phổ thông`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nCâu hỏi của học sinh: ${message}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json({ reply: "Hệ thống AI đang quá tải, vui lòng thử lại sau." });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
