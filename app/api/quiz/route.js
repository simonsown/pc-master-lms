import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { lang, topic, level } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const topicInfo = topic ? ` about ${topic}` : ` about computer hardware`;
        const levelInfo = level ? ` at difficulty level ${level} (1 is easiest, 10 is hardest)` : ` for a beginner`;

        const topicInfoVn = topic ? ` về ${topic}` : ` về phần cứng máy tính`;
        const levelInfoVn = level ? ` ở độ khó Cấp ${level} (1 là dễ nhất, 10 là khó nhất)` : ` cho người mới học`;

        const prompt = lang === 'vn'
            ? `Tạo một danh sách gồm 10 câu hỏi trắc nghiệm ngắn${topicInfoVn}${levelInfoVn}. Trả về định dạng JSON là một hằng số mảng: [ { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A", "explanation": "..." }, ... ]. Chỉ trả về JSON thuần, không markdown.`
            : `Generate a list of 10 short multiple-choice questions${topicInfo}${levelInfo}. Return JSON format as a constant array: [ { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A", "explanation": "..." }, ... ]. Return raw JSON only, no markdown.`;

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
