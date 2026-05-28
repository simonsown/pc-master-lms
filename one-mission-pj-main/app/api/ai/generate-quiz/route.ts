import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { lessonTitle, lessonContent, count = 5 } = await req.json()

    if (!lessonContent) {
      return NextResponse.json({ error: 'Nội dung bài học không được để trống' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Bạn là một chuyên gia giáo dục về Công nghệ và Máy tính. 
      Dựa trên nội dung bài học sau đây:
      Tiêu đề: ${lessonTitle}
      Nội dung: ${lessonContent}

      Hãy tạo ra ${count} câu hỏi trắc nghiệm vui nhộn theo phong cách Kahoot.
      Yêu cầu:
      - Mỗi câu hỏi có đúng 4 lựa chọn (A, B, C, D).
      - Chỉ có 1 đáp án đúng duy nhất.
      - Câu hỏi phải bám sát kiến thức trong bài nhưng cách đặt câu hỏi phải thú vị, hấp dẫn.
      - Trả về kết quả dưới định dạng JSON thuần túy (không kèm markdown) là một mảng các đối tượng:
      [
        {
          "question": "Câu hỏi là gì?",
          "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          "correctIndex": 0,
          "explanation": "Giải thích ngắn gọn tại sao đúng"
        }
      ]
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean JSON string in case AI adds markdown code blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const quizData = JSON.parse(cleanJson)

    return NextResponse.json(quizData)

  } catch (error: any) {
    console.error('AI Quiz Error:', error)
    return NextResponse.json({ error: 'Không thể tạo Quiz từ AI: ' + error.message }, { status: 500 })
  }
}
