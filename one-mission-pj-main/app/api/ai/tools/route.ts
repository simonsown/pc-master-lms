import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

const ALLOWED_API_KEYS = [process.env.AI_API_KEY].filter(Boolean)

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized: missing or invalid x-api-key header' }, { status: 401 })
}

function errorResponse(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

function success(data: any) {
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (ALLOWED_API_KEYS.length > 0 && (!apiKey || !ALLOWED_API_KEYS.includes(apiKey))) {
    return unauthorized()
  }

  let body: any
  try { body = await req.json() } catch { return errorResponse('Invalid JSON body') }

  const { action, params = {} } = body
  if (!action) return errorResponse('Missing "action" field')

  const supabase = createServiceClient()

  try {
    switch (action) {

      // ─── LESSONS ───
      case 'list_lessons': {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      case 'get_lesson': {
        const { id } = params
        if (!id) return errorResponse('Missing "id" param')
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return success(data)
      }

      // ─── QUIZZES ───
      case 'list_quizzes': {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      case 'get_quiz': {
        const { id } = params
        if (!id) return errorResponse('Missing "id" param')
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return success(data)
      }

      // ─── CLASSES ───
      case 'list_classes': {
        const { data, error } = await supabase
          .from('classes')
          .select('*, profiles:teacher_id(full_name, email)')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      case 'get_class': {
        const { id } = params
        if (!id) return errorResponse('Missing "id" param')
        const { data, error } = await supabase
          .from('classes')
          .select('*, profiles:teacher_id(full_name, email)')
          .eq('id', id)
          .single()
        if (error) throw error
        return success(data)
      }

      // ─── COURSES ───
      case 'list_courses': {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      case 'get_course': {
        const { id } = params
        if (!id) return errorResponse('Missing "id" param')
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return success(data)
      }

      // ─── EXAMS ───
      case 'list_exams': {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      // ─── ACHIEVEMENTS ───
      case 'list_achievements': {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('title')
        if (error) throw error
        return success(data)
      }

      // ─── CERTIFICATES ───
      case 'list_certificates': {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return success(data)
      }

      // ─── BUILDER PARTS ───
      case 'list_builder_parts': {
        const { type } = params
        let query = supabase.from('pc_parts').select('*')
        if (type) query = query.eq('type', type)
        const { data, error } = await query.order('name')
        if (error) throw error
        return success(data)
      }

      // ─── LEARNING PATHS ───
      case 'list_learning_paths': {
        const { data, error } = await supabase
          .from('learning_paths')
          .select('*')
          .order('order')
        if (error) throw error
        return success(data)
      }

      // ─── STUDENT PROGRESS ───
      case 'get_student_progress': {
        const { student_id } = params
        if (!student_id) return errorResponse('Missing "student_id" param')
        const [lessonProgress, quizAttempts, builderSessions] = await Promise.all([
          supabase.from('lesson_progress')
            .select('*, lessons(title)')
            .eq('student_id', student_id)
            .order('last_accessed', { ascending: false }),
          supabase.from('quiz_attempts')
            .select('*, quizzes(title)')
            .eq('student_id', student_id)
            .order('submitted_at', { ascending: false }),
          supabase.from('builder_sessions')
            .select('*')
            .eq('student_id', student_id)
            .order('started_at', { ascending: false }),
        ])
        return success({
          lessonProgress: lessonProgress.data,
          quizAttempts: quizAttempts.data,
          builderSessions: builderSessions.data,
          stats: {
            completedLessons: lessonProgress.data?.filter(l => l.status === 'completed').length ?? 0,
            totalLessons: lessonProgress.data?.length ?? 0,
            avgScore: quizAttempts.data?.length
              ? quizAttempts.data.reduce((s, q) => s + (q.score ?? 0), 0) / quizAttempts.data.length
              : null,
          }
        })
      }

      // ─── USERS ───
      case 'list_users': {
        const { role, limit: userLimit = 50 } = params
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(userLimit)
        if (role) query = query.eq('role', role)
        const { data, error } = await query
        if (error) throw error
        return success(data)
      }

      // ─── SEARCH ───
      case 'search': {
        const { q, type: searchType } = params
        if (!q) return errorResponse('Missing "q" (search query) param')
        const results: any = {}
        if (!searchType || searchType === 'lessons') {
          const { data } = await supabase.from('lessons').select('id, title, description').ilike('title', `%${q}%`).limit(5)
          if (data) results.lessons = data
        }
        if (!searchType || searchType === 'quizzes') {
          const { data } = await supabase.from('quizzes').select('id, title, description').ilike('title', `%${q}%`).limit(5)
          if (data) results.quizzes = data
        }
        if (!searchType || searchType === 'classes') {
          const { data } = await supabase.from('classes').select('id, name, code, subject').ilike('name', `%${q}%`).limit(5)
          if (data) results.classes = data
        }
        if (!searchType || searchType === 'courses') {
          const { data } = await supabase.from('courses').select('id, title, description, level').ilike('title', `%${q}%`).limit(5)
          if (data) results.courses = data
        }
        if (!searchType || searchType === 'users') {
          const { data } = await supabase.from('profiles').select('id, full_name, email, role').ilike('full_name', `%${q}%`).limit(5)
          if (data) results.users = data
        }
        return success(results)
      }

      // ─── SYSTEM INFO ───
      case 'system_info': {
        const [
          { count: userCount },
          { count: lessonCount },
          { count: classCount },
          { count: quizCount },
          { count: certCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('lessons').select('*', { count: 'exact', head: true }),
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('quizzes').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
        ])
        return success({
          name: 'PC Master Builder LMS',
          version: '1.0.0',
          stats: {
            users: userCount ?? 0,
            lessons: lessonCount ?? 0,
            classes: classCount ?? 0,
            quizzes: quizCount ?? 0,
            certificates: certCount ?? 0,
          },
          features: [
            'Trình mô phỏng lắp ráp PC 2D',
            'Trợ lý AI Gemini (AI Guru)',
            'Nhận diện cử chỉ tay (MediaPipe)',
            'Hệ thống bài kiểm tra trắc nghiệm',
            'Lộ trình học tập cá nhân hóa',
            'Chứng chỉ PDF có mã QR',
            'Thi đấu multiplayer',
            'Bảng xếp hạng & thành tích',
          ],
          available_actions: [
            'list_lessons', 'get_lesson',
            'list_quizzes', 'get_quiz',
            'list_classes', 'get_class',
            'list_courses', 'get_course',
            'list_exams',
            'list_achievements',
            'list_certificates',
            'list_builder_parts',
            'list_learning_paths',
            'get_student_progress',
            'list_users',
            'search',
            'system_info',
          ]
        })
      }

      default:
        return errorResponse(`Unknown action "${action}". Available: system_info`)
    }
  } catch (err: any) {
    console.error('AI Tools API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get('api_key')
  if (ALLOWED_API_KEYS.length > 0 && (!apiKey || !ALLOWED_API_KEYS.includes(apiKey))) {
    return unauthorized()
  }
  return NextResponse.json({
    name: 'PC Master Builder - AI Tools API',
    description: 'Hidden API for Claude AI to access all system features.',
    usage: 'POST /api/ai/tools with JSON body: { "action": "...", "params": {...} }',
    auth: 'Set header "x-api-key" or query param "api_key"',
    actions: [
      { action: 'system_info', description: 'Get system overview and available actions' },
      { action: 'list_lessons', description: 'List all lessons' },
      { action: 'get_lesson', params: { id: 'string' }, description: 'Get lesson by ID' },
      { action: 'list_quizzes', description: 'List all quizzes' },
      { action: 'get_quiz', params: { id: 'string' }, description: 'Get quiz by ID' },
      { action: 'list_classes', description: 'List all classes' },
      { action: 'get_class', params: { id: 'string' }, description: 'Get class by ID' },
      { action: 'list_courses', description: 'List all courses' },
      { action: 'get_course', params: { id: 'string' }, description: 'Get course by ID' },
      { action: 'list_exams', description: 'List all exams' },
      { action: 'list_achievements', description: 'List all achievements' },
      { action: 'list_certificates', description: 'List all certificates' },
      { action: 'list_builder_parts', params: { type: 'string (optional)' }, description: 'List PC builder parts' },
      { action: 'list_learning_paths', description: 'List all learning paths' },
      { action: 'get_student_progress', params: { student_id: 'string' }, description: 'Get student progress' },
      { action: 'list_users', params: { role: 'string (optional)', limit: 'number (optional)' }, description: 'List users' },
      { action: 'search', params: { q: 'string', type: 'string (optional)' }, description: 'Search across features' },
    ]
  })
}