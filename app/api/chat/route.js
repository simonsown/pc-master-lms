import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from '../../../utils/aiConstants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { message, history = [], context = {} } = await req.json();

        // Build context string to inject into the user's message
        let contextPrefix = '';
        if (context.appMode && context.appMode !== 'menu') {
            const modeLabel = {
                course: 'Chế Độ Bài Giảng',
                learning: 'Chế Độ Luyện Tập',
                market: 'Chợ Máy Tính',
                mission_assembly: 'Phòng Lắp Ráp Nhiệm Vụ',
                assembly: 'Lắp Ráp Tự Do',
                multiplayer: 'Chế Độ 2 Người Chơi',
            }[context.appMode] || context.appMode;

            contextPrefix = `[Ngữ cảnh hiện tại: Người dùng đang ở "${modeLabel}"`;

            if (context.cartItems && context.cartItems.length > 0) {
                const cartSummary = context.cartItems.map(i => `${i.type}: ${i.name} (${i.price?.toLocaleString()} VNĐ)`).join(', ');
                contextPrefix += `. Giỏ hàng: ${cartSummary}`;
            }

            if (context.remainingBudget !== undefined) {
                contextPrefix += `. Ngân sách còn lại: ${context.remainingBudget.toLocaleString()} VNĐ`;
            }

            if (context.missionTitle) {
                contextPrefix += `. Nhiệm vụ: "${context.missionTitle}"`;
            }

            contextPrefix += ']\n\n';
        }

        const userMessageWithContext = contextPrefix + message;

        // Build Gemini history format (max 5 pairs = 10 items to save tokens)
        const trimmedHistory = history.slice(-10);
        const geminiHistory = trimmedHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userMessageWithContext);
        const responseText = result.response.text();

        return Response.json({ reply: responseText });
    } catch (error) {
        console.error('Chat API Error:', error);
        return Response.json(
            { error: error.message || 'Lỗi kết nối AI. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}
