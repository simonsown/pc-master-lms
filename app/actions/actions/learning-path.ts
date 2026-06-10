'use server'

import { createClient } from '@/lib/supabase-ssr-server';
import { revalidatePath } from 'next/cache';

export async function createPath(title: string, description: string, classId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('learning_paths')
    .insert({
      title,
      description,
      class_id: classId || null,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/student/learning-path');
  return data;
}

export async function updateItemOrder(pathId: string, items: { id: string, order: number }[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('path_items')
    .upsert(
      items.map(item => ({
        id: item.id,
        path_id: pathId,
        order: item.order
      }))
    );

  if (error) throw error;
  revalidatePath('/student/learning-path');
  return { success: true };
}

export async function setUnlockCondition(itemId: string, condition: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('path_items')
    .update({
      unlock_condition: condition
    })
    .eq('id', itemId);

  if (error) throw error;
  revalidatePath('/student/learning-path');
  return { success: true };
}
