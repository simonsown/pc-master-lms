'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function publishLessonAction(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('lessons')
    .update({ is_published: true })
    .eq('id', lessonId)
    .eq('teacher_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/teacher/lessons/${lessonId}`)
  revalidatePath('/teacher/lessons')
  return { success: true }
}

export async function unpublishLessonAction(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('lessons')
    .update({ is_published: false })
    .eq('id', lessonId)
    .eq('teacher_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/teacher/lessons/${lessonId}`)
  revalidatePath('/teacher/lessons')
  return { success: true }
}

export async function deleteLessonAction(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  await supabase.from('lesson_sections').delete().eq('lesson_id', lessonId)
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)
    .eq('teacher_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/teacher/lessons')
  redirect('/teacher/lessons')
}

export async function incrementViewCountAction(lessonId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_lesson_views', { lesson_id: lessonId })
}
