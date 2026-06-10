import { createClient } from '@/lib/supabase-ssr-server';

export interface PathItemWithUnlock {
  id: string;
  path_id: string;
  item_type: 'lesson' | 'quiz' | 'lab_session' | 'milestone';
  item_id: string | null;
  title: string;
  description: string;
  order: number;
  unlock_condition: any;
  estimated_minutes: number;
  is_optional: boolean;
  is_unlocked: boolean;
  unlock_reason: string;
  completed?: boolean;
}

export async function fetchStudentPathItems(pathId: string): Promise<PathItemWithUnlock[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Call postgrest rpc function get_unlocked_items
  const { data: unlockStates, error: rpcError } = await supabase.rpc('get_unlocked_items', {
    p_student_id: user.id,
    p_path_id: pathId
  });

  if (rpcError) throw rpcError;

  // Load the original path items
  const { data: items, error: itemsError } = await supabase
    .from('path_items')
    .select('*')
    .eq('path_id', pathId)
    .order('order', { ascending: true });

  if (itemsError) throw itemsError;

  // Check lesson completions if lesson
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status')
    .eq('student_id', user.id);

  return (items || []).map((item: any) => {
    const state = (unlockStates || []).find((s: any) => s.id === item.id);
    const lessonProg = (progress || []).find((p: any) => p.lesson_id === item.item_id);

    return {
      ...item,
      is_unlocked: state ? state.is_unlocked : true,
      unlock_reason: state ? state.unlock_reason : 'always_available',
      completed: lessonProg?.status === 'completed'
    };
  });
}
