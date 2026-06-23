'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface LevelDef {
  level: number;
  title: string;
  xp_required: number;
  color_hex: string;
  icon: string;
  description: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: string;
  difficulty: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
  expires_at: string;
}

interface UserQuest {
  id: string;
  quest_id: string;
  is_completed: boolean;
  completed_at: string;
  xp_earned: number;
  progress: number;
  daily_quests: Quest;
}

interface Title {
  id: string;
  title_id: string;
  unlocked_at: string;
  is_active: boolean;
  player_titles: {
    title: string;
    description: string;
    icon: string;
    xp_bonus: number;
  };
}

interface XpTransaction {
  id: string;
  amount: number;
  reason: string;
  reference_type: string;
  created_at: string;
}

interface RealtimeState {
    completedLessons: Set<string>;
    xp: number;
    streak: number;
    studyMinutes: number;
    weeklyActivity: number[];
    level: number;
    levelTitle: string;
    levelIcon: string;
    levelColor: string;
    levelProgress: number;
    xpToNext: number;
    xpInLevel: number;
    levelDefs: LevelDef[];
    quests: UserQuest[];
    titles: Title[];
    xpHistory: XpTransaction[];
    allQuests: Quest[];
}

interface RealtimeContextType {
    state: RealtimeState;
    refetch: () => Promise<void>;
}

const defaultLevelDefs: LevelDef[] = [
  { level: 1, title: 'Tân Thủ', xp_required: 0, color_hex: '#94a3b8', icon: '🌱', description: 'Người mới bắt đầu hành trình' },
  { level: 2, title: 'Người Học Việc', xp_required: 100, color_hex: '#64748b', icon: '📖', description: 'Bắt đầu làm quen với kiến thức' },
  { level: 3, title: 'Học Sinh Chăm Chỉ', xp_required: 300, color_hex: '#22c55e', icon: '📚', description: 'Chăm chỉ học tập mỗi ngày' },
  { level: 4, title: 'Người Hiểu Biết', xp_required: 600, color_hex: '#06b6d4', icon: '💡', description: 'Nắm vững kiến thức cơ bản' },
  { level: 5, title: 'Thợ Lắp Ráp Tập Sự', xp_required: 1000, color_hex: '#3b82f6', icon: '🔧', description: 'Bắt đầu thực hành lắp ráp' },
  { level: 6, title: 'Kỹ Thuật Viên', xp_required: 1600, color_hex: '#8b5cf6', icon: '⚙️', description: 'Có kỹ năng thực hành tốt' },
  { level: 7, title: 'Chuyên Gia PC', xp_required: 2400, color_hex: '#f59e0b', icon: '🖥️', description: 'Am hiểu về phần cứng máy tính' },
  { level: 8, title: 'Kỹ Sư Xây Dựng', xp_required: 3400, color_hex: '#f97316', icon: '🏗️', description: 'Xây dựng cấu hình PC thuần thục' },
  { level: 9, title: 'Kiến Trúc Sư Hệ Thống', xp_required: 4600, color_hex: '#ef4444', icon: '🏛️', description: 'Thiết kế hệ thống máy tính' },
  { level: 10, title: 'Bậc Thầy PC', xp_required: 6000, color_hex: '#ec4899', icon: '👑', description: 'Bậc thầy về lắp ráp máy tính' },
  { level: 11, title: 'Huyền Thoại', xp_required: 8000, color_hex: '#00d4aa', icon: '⭐', description: 'Huyền thoại trong cộng đồng' },
  { level: 12, title: 'Solo Leveling', xp_required: 10000, color_hex: '#00f3ff', icon: '⚡', description: 'Sức mạnh vô hạn - Solo Leveling!' },
  { level: 13, title: 'Rảnh Thợ Săn Hạng S', xp_required: 13000, color_hex: '#a855f7', icon: '🗡️', description: 'Thợ săn hạng S siêu cấp' },
  { level: 14, title: 'Chúa Tể Bóng Tối', xp_required: 17000, color_hex: '#7c3aed', icon: '🌑', description: 'Chúa tể bóng tối huyền thoại' },
  { level: 15, title: 'Quốc Vương', xp_required: 22000, color_hex: '#fbbf24', icon: '👑', description: 'Quốc vương của mọi loài' },
  { level: 16, title: 'Thần', xp_required: 28000, color_hex: '#ff6b6b', icon: '🔥', description: 'Thần linh tối thượng' },
  { level: 17, title: 'Vĩnh Hằng', xp_required: 35000, color_hex: '#ff4500', icon: '♾️', description: 'Sức mạnh vĩnh hằng' },
  { level: 18, title: 'Hủy Diệt', xp_required: 43000, color_hex: '#dc2626', icon: '💀', description: 'Hủy diệt mọi giới hạn' },
  { level: 19, title: 'Siêu Việt', xp_required: 52000, color_hex: '#9333ea', icon: '🌟', description: 'Siêu việt thực tại' },
  { level: 20, title: 'Bất Tử', xp_required: 65000, color_hex: '#ffd700', icon: '🏆', description: 'Bất tử trong lịch sử' },
];

function calcLevel(xp: number, levelDefs: LevelDef[]) {
  let lvl = levelDefs[0];
  for (const d of levelDefs) {
    if (xp >= d.xp_required) lvl = d;
  }
  const nextLevel = levelDefs.find(d => d.level === lvl.level + 1);
  const xpInLevel = xp - lvl.xp_required;
  const xpToNext = nextLevel ? nextLevel.xp_required - lvl.xp_required : xpInLevel + 1;
  const levelProgress = xpToNext > 0 ? Math.min((xpInLevel / xpToNext) * 100, 100) : 100;
  return { level: lvl.level, levelTitle: lvl.title, levelIcon: lvl.icon, levelColor: lvl.color_hex, levelProgress, xpToNext, xpInLevel };
}

const RealtimeContext = createContext<RealtimeContextType>({
    state: {
      completedLessons: new Set(), xp: 0, streak: 0, studyMinutes: 0, weeklyActivity: [],
      level: 1, levelTitle: 'Tân Thủ', levelIcon: '🌱', levelColor: '#94a3b8', levelProgress: 0, xpToNext: 100, xpInLevel: 0,
      levelDefs: defaultLevelDefs, quests: [], titles: [], xpHistory: [], allQuests: [],
    },
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
        levelColor: '#94a3b8',
        levelProgress: 0,
        xpToNext: 100,
        xpInLevel: 0,
        levelDefs: defaultLevelDefs,
        quests: [],
        titles: [],
        xpHistory: [],
        allQuests: [],
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
        const [
          progress, stats, profile, levelDefs, userQuests, activeQuests, titles, xpHistory,
        ] = await Promise.all([
            supabaseRef.current.from('lesson_progress').select('lesson_id').eq('student_id', userId),
            supabaseRef.current.from('learning_stats').select('*').eq('user_id', userId).single(),
            supabaseRef.current.from('profiles').select('xp, level').eq('id', userId).single(),
            supabaseRef.current.from('level_definitions').select('*').order('level', { ascending: true }),
            supabaseRef.current.from('user_quests').select('*, daily_quests(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
            supabaseRef.current.from('daily_quests').select('*').eq('is_active', true).order('xp_reward', { ascending: false }),
            supabaseRef.current.from('user_titles').select('*, player_titles(*)').eq('user_id', userId),
            supabaseRef.current.from('xp_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
        ]);

        const xp = profile?.data?.xp || stats?.data?.total_xp || 0;
        const defs = (levelDefs.data as LevelDef[]) || defaultLevelDefs;
        const levelInfo = calcLevel(xp, defs);

        setState(prev => ({
            ...prev,
            completedLessons: new Set((progress.data || []).map((p: any) => p.lesson_id)),
            xp,
            streak: stats.data?.current_streak || 0,
            studyMinutes: stats.data?.total_study_minutes || 0,
            weeklyActivity: stats.data?.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
            ...levelInfo,
            levelDefs: defs,
            quests: (userQuests.data || []) as UserQuest[],
            allQuests: (activeQuests.data || []) as Quest[],
            titles: (titles.data || []) as Title[],
            xpHistory: (xpHistory.data || []) as XpTransaction[],
        }));
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
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'xp_transactions', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_quests', filter: `user_id=eq.${userId}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_titles', filter: `user_id=eq.${userId}` },
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
