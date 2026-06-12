'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface RealtimeState {
    completedLessons: Set<string>;
    xp: number;
    streak: number;
    studyMinutes: number;
    weeklyActivity: number[];
}

interface RealtimeContextType {
    state: RealtimeState;
    refetch: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType>({
    state: { completedLessons: new Set(), xp: 0, streak: 0, studyMinutes: 0, weeklyActivity: [] },
    refetch: async () => {},
});

export function useRealtime() {
    return useContext(RealtimeContext);
}

export function RealtimeProvider({ children, userId }: { children: React.ReactNode; userId?: string | null }) {
    const [state, setState] = useState<RealtimeState>({
        completedLessons: new Set(),
        xp: 0,
        streak: 0,
        studyMinutes: 0,
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = useCallback(async () => {
        if (!userId) return;
        const [progress, stats] = await Promise.all([
            supabase.from('lesson_progress').select('lesson_id').eq('student_id', userId),
            supabase.from('learning_stats').select('*').eq('user_id', userId).single(),
        ]);
        setState(prev => ({
            ...prev,
            completedLessons: new Set((progress.data || []).map((p: any) => p.lesson_id)),
            xp: stats.data?.total_xp || 0,
            streak: stats.data?.current_streak || 0,
            studyMinutes: stats.data?.total_study_minutes || 0,
            weeklyActivity: stats.data?.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
        }));
    }, [userId]);

    useEffect(() => {
        fetchData();
        if (!userId) return;

        const channel = supabase
            .channel('realtime-global')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'lesson_progress', filter: `student_id=eq.${userId}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'learning_stats', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    return (
        <RealtimeContext.Provider value={{ state, refetch: fetchData }}>
            {children}
        </RealtimeContext.Provider>
    );
}
