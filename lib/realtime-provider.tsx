'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface RealtimeState {
    completedLessons: Set<string>;
    xp: number;
    streak: number;
    studyMinutes: number;
    weeklyActivity: number[];
    level: number;
    levelTitle: string;
    levelIcon: string;
    levelProgress: number;
    xpToNext: number;
    xpInLevel: number;
}

interface RealtimeContextType {
    state: RealtimeState;
    refetch: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType>({
    state: { completedLessons: new Set(), xp: 0, streak: 0, studyMinutes: 0, weeklyActivity: [], level: 1, levelTitle: 'Tân Thủ', levelIcon: '🌱', levelProgress: 0, xpToNext: 100, xpInLevel: 0 },
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
        level: 1,
        levelTitle: 'Tân Thủ',
        levelIcon: '🌱',
        levelProgress: 0,
        xpToNext: 100,
        xpInLevel: 0,
    });

    const supabaseRef = useRef<any>(null);
    const [clientReady, setClientReady] = useState(false);
    useEffect(() => {
        import('@supabase/ssr').then(({ createBrowserClient }) => {
            supabaseRef.current = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            setClientReady(true);
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (!userId || !supabaseRef.current) return;
        const [progress, stats, profile] = await Promise.all([
            supabaseRef.current.from('lesson_progress').select('lesson_id').eq('student_id', userId),
            supabaseRef.current.from('learning_stats').select('*').eq('user_id', userId).single(),
            supabaseRef.current.from('profiles').select('xp, level').eq('id', userId).single(),
        ]);

        const xp = profile?.data?.xp || stats?.data?.total_xp || 0;
        const levelNumber = profile?.data?.level || 1;

        try {
            const levels = [
              { level: 1, title: 'Tân Thủ', icon: '🪴', min_xp: 0, max_xp: 499 },
              { level: 2, title: 'Học Viên', icon: '📘', min_xp: 500, max_xp: 1499 },
              { level: 3, title: 'Kỹ Thuật Viên', icon: '🔧', min_xp: 1500, max_xp: 3499 },
            ];
            const lvl = levels[Math.min(Math.floor(xp / 500), levels.length - 1)];
            const xpToNext = lvl.max_xp - lvl.min_xp;
            const xpInLevel = xp - lvl.min_xp;

            setState(prev => ({
                ...prev,
                completedLessons: new Set((progress.data || []).map((p: any) => p.lesson_id)),
                xp,
                streak: stats.data?.current_streak || 0,
                studyMinutes: stats.data?.total_study_minutes || 0,
                weeklyActivity: stats.data?.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
                level: lvl.level,
                levelTitle: lvl.title,
                levelIcon: lvl.icon,
                levelProgress: xpInLevel / xpToNext * 100,
                xpToNext,
                xpInLevel,
            }));
        } catch {
            setState(prev => ({
                ...prev,
                completedLessons: new Set((progress.data || []).map((p: any) => p.lesson_id)),
                xp,
                streak: stats.data?.current_streak || 0,
                studyMinutes: stats.data?.total_study_minutes || 0,
                weeklyActivity: stats.data?.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
            }));
        }
    }, [userId]);

    useEffect(() => {
        if (!supabaseRef.current) return;
        fetchData();
        if (!userId) return;

        const channel = supabaseRef.current
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

        return () => { supabaseRef.current?.removeChannel(channel); };
    }, [userId, clientReady]);

    return (
        <RealtimeContext.Provider value={{ state, refetch: fetchData }}>
            {children}
        </RealtimeContext.Provider>
    );
}
