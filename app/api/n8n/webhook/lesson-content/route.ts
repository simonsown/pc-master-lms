import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const N8N_SECRET = (process.env.N8N_WEBHOOK_SECRET || '').trim()

function verifyN8nRequest(request: Request): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${N8N_SECRET}`
}

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || ''

export async function POST(request: Request) {
  try {
    if (!verifyN8nRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, difficulty, lessonId, teacherId, questionCount } = await request.json()
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const apiKey = GEMINI_API_KEY()
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const qCount = questionCount || 5
    const prompt = `Ban la chuyen gia tao noi dung giao duc ve lap rap may tinh (PC Building) bang tieng Viet.
Hay tao ${qCount} cau hoi trac nghiem ve chu de "${topic}" o do kho "${difficulty || 'trung binh'}" (de/trung binh/kho).

Yeu cau:
- Moi cau hoi co 4 dap an (A, B, C, D)
- Chi 1 dap an dung
- Noi dung chinh xac ve ky thuat phan cung may tinh
- Phu hop voi hoc sinh cap 3 Viet Nam

Tra ve JSON array:
[
  {
    "content": "Cau hoi?",
    "type": "multiple_choice",
    "difficulty": "easy|medium|hard",
    "points": 1,
    "options": [
      { "content": "Dap an A", "is_correct": false },
      { "content": "Dap an B", "is_correct": true },
      { "content": "Dap an C", "is_correct": false },
      { "content": "Dap an D", "is_correct": false }
    ]
  }
]

Chi tra ve JSON, khong co text khac.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let questions: any[] = []
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(text)
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }

    if (!questions.length) {
      return NextResponse.json({ error: 'No questions generated' }, { status: 500 })
    }

    const teacherIdValue = teacherId || '00000000-0000-0000-0000-000000000000'

    const { data: bank, error: bankErr } = await supabase
      .from('question_banks')
      .insert({
        teacher_id: teacherIdValue,
        title: `AI Generated: ${topic} - ${new Date().toLocaleDateString('vi-VN')}`,
        subject: topic
      })
      .select('id')
      .single()

    if (bankErr || !bank) {
      return NextResponse.json({ error: 'Failed to create question bank', details: bankErr }, { status: 500 })
    }

    const createdQuestions: any[] = []

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const { data: question, error: qErr } = await supabase
        .from('questions')
        .insert({
          bank_id: bank.id,
          content: q.content,
          type: q.type || 'multiple_choice',
          points: q.points || 1,
          order: i + 1
        })
        .select('id')
        .single()

      if (question && q.options) {
        const opts = q.options.map((opt: any, oi: number) => ({
          question_id: question.id,
          content: opt.content,
          is_correct: opt.is_correct,
          order: oi + 1
        }))

        const { error: optErr } = await supabase
          .from('question_options')
          .insert(opts)

        if (!optErr) {
          createdQuestions.push({ id: question.id, content: q.content, options: opts })
        }
      }
    }

    if (lessonId) {
      const { error: quizErr } = await supabase.from('quizzes').insert({
        lesson_id: lessonId,
        teacher_id: teacherIdValue,
        title: `Kiem tra: ${topic}`,
        description: `Bai kiem tra tu dong ve chu de: ${topic}`,
        time_limit_minutes: Math.ceil(qCount * 2),
        passing_score: Math.ceil(qCount * 0.6),
        max_attempts: 2,
        randomize_questions: true,
        randomize_options: true,
        is_published: true
      })

      if (quizErr) {
        console.error('Failed to create lesson quiz:', quizErr)
      }
    }

    return NextResponse.json({
      success: true,
      bankId: bank.id,
      questionsCreated: createdQuestions.length,
      questions: createdQuestions
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
