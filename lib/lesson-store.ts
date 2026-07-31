export interface LessonSection {
  id: string
  title: string
  type: 'video' | 'text' | 'image' | 'pdf' | 'embed'
  content: string
  order_index: number
}

export interface TeacherBook {
  id: string
  title: string
  cover_image_url: string
  drive_embed_url: string
  description: string
}

export interface TeacherLesson {
  id: string
  title: string
  description: string
  thumbnail_url: string
  subject: string
  category: string
  estimated_minutes: number
  is_published: boolean
  classCodes: string[]
  source_name?: string
  source_url?: string
  sections: LessonSection[]
  books?: TeacherBook[]
  createdAt: string
  updatedAt: string
}

export interface TeacherClass {
  code: string
  name: string
}

const LESSONS_KEY = 'pcm_teacher_lessons'
const CLASSES_KEY = 'pcm_classes'
const STUDENT_CLASSES_KEY = 'pcm_student_classes'
const PROGRESS_KEY = 'pcm_lesson_progress'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function uid(): string {
  return 'lsn_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

export function getAllLessons(): TeacherLesson[] {
  if (typeof window === 'undefined') return []
  return safeParse<TeacherLesson[]>(localStorage.getItem(LESSONS_KEY), []).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  )
}

export function getLesson(id: string): TeacherLesson | null {
  return getAllLessons().find(l => l.id === id) || null
}

export function saveLesson(lesson: TeacherLesson): TeacherLesson {
  const all = getAllLessons()
  const idx = all.findIndex(l => l.id === lesson.id)
  const stored = { ...lesson, updatedAt: new Date().toISOString() }
  if (idx >= 0) all[idx] = stored
  else all.unshift(stored)
  localStorage.setItem(LESSONS_KEY, JSON.stringify(all))
  return stored
}

export function createLesson(title = 'Bài giảng mới'): TeacherLesson {
  const lesson: TeacherLesson = {
    id: uid(),
    title,
    description: '',
    thumbnail_url: '',
    subject: 'Tin học',
    category: 'extended',
    estimated_minutes: 30,
    is_published: false,
    classCodes: [],
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return saveLesson(lesson)
}

export function deleteLesson(id: string): void {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(getAllLessons().filter(l => l.id !== id)))
}

export function getAssignedLessons(classCode: string): TeacherLesson[] {
  const code = (classCode || '').trim().toLowerCase()
  return getAllLessons().filter(l =>
    l.is_published && l.classCodes.some(c => c.trim().toLowerCase() === code)
  )
}

export function getMyClassCodes(): string[] {
  if (typeof window === 'undefined') return []
  return safeParse<string[]>(localStorage.getItem(STUDENT_CLASSES_KEY), [])
}

export function setMyClassCodes(codes: string[]): void {
  localStorage.setItem(STUDENT_CLASSES_KEY, JSON.stringify([...new Set(codes.map(c => c.trim()).filter(Boolean))]))
}

export function joinClass(code: string): void {
  const codes = getMyClassCodes()
  const trimmed = code.trim()
  if (!trimmed || codes.some(c => c.toLowerCase() === trimmed.toLowerCase())) return
  setMyClassCodes([...codes, trimmed])
}

export function getAllClasses(): TeacherClass[] {
  if (typeof window === 'undefined') return []
  return safeParse<TeacherClass[]>(localStorage.getItem(CLASSES_KEY), [])
}

export function saveClass(cls: TeacherClass): void {
  const all = getAllClasses()
  const idx = all.findIndex(c => c.code.toLowerCase() === cls.code.trim().toLowerCase())
  if (idx >= 0) all[idx] = { ...cls, code: cls.code.trim() }
  else all.push({ ...cls, code: cls.code.trim() })
  localStorage.setItem(CLASSES_KEY, JSON.stringify(all))
}

export function getClassNames(codes: string[]): string[] {
  const classes = getAllClasses()
  return codes.map(code => classes.find(c => c.code.toLowerCase() === code.toLowerCase())?.name || code)
}

export function getLessonProgress(lessonId: string): { completed: boolean; percentage: number } {
  if (typeof window === 'undefined') return { completed: false, percentage: 0 }
  const map = safeParse<Record<string, { completed: boolean; percentage: number }>>(
    localStorage.getItem(PROGRESS_KEY), {}
  )
  return map[lessonId] || { completed: false, percentage: 0 }
}

export function saveLessonProgress(lessonId: string, completed: boolean, percentage: number): void {
  if (typeof window === 'undefined') return
  const map = safeParse<Record<string, { completed: boolean; percentage: number }>>(
    localStorage.getItem(PROGRESS_KEY), {}
  )
  map[lessonId] = { completed, percentage }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
}

export function newSection(type: LessonSection['type'], orderIndex: number): LessonSection {
  const typeLabel: Record<string, string> = {
    video: 'VIDEO', text: 'TEXT', image: 'IMAGE', pdf: 'PDF', embed: 'EMBED',
  }
  return {
    id: uid(),
    title: `Phần ${typeLabel[type] || type.toUpperCase()} mới`,
    type,
    content: '',
    order_index: orderIndex,
  }
}
