'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-ssr-client';

export function useClassroomUpdates(teacherId: string) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!teacherId) return;

    // 1. Subscribe to quiz attempts
    const quizChannel = supabase
      .channel('classroom-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts',
        },
        (payload) => {
          console.log('Real-time Quiz Update:', payload);
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_progress',
        },
        (payload) => {
          console.log('Real-time Progress Update:', payload);
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizChannel);
    };
  }, [teacherId, supabase]);

  return { lastUpdate };
}
