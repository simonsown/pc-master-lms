import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { lessonTitle, sections, type } = await req.json();

        // Build context ONLY from actual lesson content
        const textContent = (sections || [])
            .map(s => {
                if (s.type === 'text') return `[${s.title}]\n${s.content}`;
                if (s.type === 'video') return `[Video: ${s.title}]`;
                if (s.type === 'pdf') return `[Tài liệu PDF: ${s.title}]`;
                if (s.type === 'image') return `[Hình ảnh: ${s.title}]`;
                return `[${s.title}]`;
            })
            .join('\n\n');

        const context = `Tên bài học: ${lessonTitle}\n\n${textContent}`;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let prompt = '';
        if (type === 'quiz') {
            prompt = `Dựa HOÀN TOÀN vào nội dung bài học sau đây, hãy tạo 5 câu hỏi trắc nghiệm (4 đáp án A/B/C/D). TUYỆT ĐỐI không được bịa câu hỏi không liên quan đến nội dung này. Nếu nội dung quá ít, hãy tạo ít câu hơn.

NỘI DUNG BÀI HỌC:
${context}

Trả về JSON mảng, không có markdown:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctIndex":0,"explanation":"..."}]`;
        } else {
            prompt = `Dựa HOÀN TOÀN vào nội dung bài học sau đây, hãy tạo 6 thẻ flashcard ôn tập (mặt trước: khái niệm/thuật ngữ, mặt sau: giải thích). TUYỆT ĐỐI chỉ dùng nội dung có trong bài, không bịa thêm.

NỘI DUNG BÀI HỌC:
${context}

Trả về JSON mảng, không có markdown:
[{"front":"...","back":"..."}]`;
        }

        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return Response.json({ data: JSON.parse(text) });
    } catch (error) {
        console.error("lesson-ai error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
