import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key chưa cấu hình' }, { status: 500 });
    }

    const prompt = `Bạn là chuyên gia sửa chữa máy tính chuyên nghiệp. Người dùng mô tả triệu chứng lỗi PC như sau: "${symptoms}".
Hãy chẩn đoán lỗi phần cứng này. Trả về định dạng JSON thuần túy (không bọc trong markdown) gồm:
{
  "diagnosis": "Tên lỗi chính",
  "probability": 85,
  "suspectedComponent": "Linh kiện bị nghi ngờ hỏng (CPU, RAM, GPU, PSU, Storage, Cooler, Mainboard, etc.)",
  "reason": "Giải thích chi tiết nguyên nhân dẫn tới chẩn đoán này.",
  "steps": [
    "Các bước khắc phục 1",
    "Các bước khắc phục 2"
  ],
  "toolsNeeded": ["Tua vít", "Keo tản nhiệt"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const result = await response.json();
    const data = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Không thể chẩn đoán triệu chứng lúc này.' }, { status: 500 });
  }
}
