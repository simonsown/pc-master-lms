import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchKnowledge } from "../../../utils/searchKnowledge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { lang, topic, level } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Bước 1: Lấy kiến thức từ Knowledge Base (RAG)
        const context = searchKnowledge(topic);

        const topicInfo = topic ? ` về ${topic}` : ` về phần cứng máy tính`;
        const levelInfo = level ? ` ở độ khó Cấp ${level}` : ` cho người mới học`;

        const prompt = lang === 'vn'
            ? `Dựa trên tài liệu sau đây:\n\n"${context}"\n\nHãy tạo 10 câu hỏi trắc nghiệm${topicInfo}${levelInfo}. Trả về JSON mảng: [ { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A", "explanation": "..." } ]. Chỉ trả về JSON thuần, không markdown.`
            : `Based on the following documentation:\n\n"${context}"\n\nGenerate 10 multiple-choice questions about ${topic || 'computer hardware'}. Return JSON array: [ { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A", "explanation": "..." } ]. Return raw JSON only, no markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return Response.json(JSON.parse(text));
    } catch (error) {
        console.error("Gemini API Error:", error);
        return Response.json({ error: error.message || "Failed to generate question" }, { status: 500 });
    }
}
