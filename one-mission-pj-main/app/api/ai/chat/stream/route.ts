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
      return new Response(JSON.stringify({ error: 'API Key chưa được cấu hình' }), { status: 200 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
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
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini Stream Error:', geminiRes.status, errBody);
      const msg = errBody.includes('API_KEY') ? `⚠️ API Key không hợp lệ. Chi tiết: ${errBody.substring(0, 300)}` :
                  errBody.includes('not found') || errBody.includes('not support') ? `Xin lỗi, AI hiện không khả dụng. Chi tiết: ${errBody.substring(0, 300)}` :
                  `Xin lỗi, tôi gặp sự cố kết nối. Chi tiết: ${errBody.substring(0, 300)}`;
      return new Response(JSON.stringify({ error: msg }), { status: 200 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = geminiRes.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: 'Không thể kết nối AI' }), { status: 200 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6));
                const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                  controller.enqueue(encoder.encode(JSON.stringify({ text }) + '\n'));
                }
              } catch {}
            }
          }
        }
        controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + '\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (err: any) {
    console.error('AI Stream Error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'Hệ thống đang bảo trì.' }), { status: 200 });
  }
}
