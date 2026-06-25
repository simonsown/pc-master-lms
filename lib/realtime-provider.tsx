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

const FALLBACK_QUESTS: Quest[] = [
  { id: 'fallback-lesson', title: 'Hoàn thành 1 bài học', description: 'Hoàn thành một bài học bất kỳ', xp_reward: 50, type: 'daily', difficulty: 'easy', icon: '📚', requirement_type: 'lessons', requirement_value: 1, is_active: true, expires_at: '' },
  { id: 'fallback-pc', title: 'Lắp ráp PC', description: 'Lắp ráp một cấu hình PC trong builder', xp_reward: 30, type: 'daily', difficulty: 'easy', icon: '🔧', requirement_type: 'builds', requirement_value: 1, is_active: true, expires_at: '' },
  { id: 'fallback-quiz', title: 'Làm quiz', description: 'Hoàn thành một bài quiz', xp_reward: 20, type: 'daily', difficulty: 'easy', icon: '🧠', requirement_type: 'quizzes', requirement_value: 1, is_active: true, expires_at: '' },
  { id: 'fallback-exam', title: 'Vượt qua kỳ thi', description: 'Vượt qua một kỳ thi bất kỳ', xp_reward: 80, type: 'daily', difficulty: 'medium', icon: '📝', requirement_type: 'exams', requirement_value: 1, is_active: true, expires_at: '' },
  { id: 'fallback-streak', title: 'Đạt streak 3 ngày', description: 'Duy trì streak học tập 3 ngày liên tiếp', xp_reward: 100, type: 'daily', difficulty: 'medium', icon: '🔥', requirement_type: 'streak', requirement_value: 3, is_active: true, expires_at: '' },
  { id: 'fallback-discussion', title: 'Tham gia thảo luận', description: 'Tham gia thảo luận trong lớp học', xp_reward: 15, type: 'daily', difficulty: 'easy', icon: '💬', requirement_type: 'discussions', requirement_value: 1, is_active: true, expires_at: '' },
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

    const autoCompleteQuests = useCallback(async (supabase: any, userId: string, currentQuests: UserQuest[], allQuestsDefs: Quest[], currentXp: number, currentLevel: number) => {
        try {
            const { data: lessonProgress } = await supabase.from('lesson_progress').select('lesson_id, status').eq('student_id', userId)
            const completedLessonCount = (lessonProgress || []).filter((p: any) => p.status === 'completed').length

            const { data: quizAttempts } = await supabase.from('quiz_attempts').select('id').eq('student_id', userId)
            const quizCount = (quizAttempts || []).length

            let buildCount = 0
            try { const { data: builderSessions } = await supabase.from('builder_sessions').select('id').eq('user_id', userId); buildCount = (builderSessions || []).length } catch (e) {}

            let discussionCount = 0
            try { const { data: discussions } = await supabase.from('discussions').select('id').eq('user_id', userId); discussionCount = (discussions || []).length } catch (e) {}

            let passedExamCount = 0
            try { const { data: examAttempts } = await supabase.from('exam_attempts').select('id, status').eq('user_id', userId); passedExamCount = (examAttempts || []).filter((e: any) => e.status === 'passed').length } catch (e) {}

            const { data: stats } = await supabase.from('learning_stats').select('current_streak').eq('user_id', userId).single()
            const currentStreak = stats?.current_streak || 0

            let newXp = currentXp
            let leveledUp = false

            for (const questDef of allQuestsDefs) {
                const existingQuest = currentQuests.find((q: UserQuest) => q.quest_id === questDef.id)
                if (existingQuest?.is_completed) continue

                let requirementMet = false
                switch (questDef.requirement_type) {
                    case 'lessons': requirementMet = completedLessonCount >= questDef.requirement_value; break
                    case 'quizzes': requirementMet = quizCount >= questDef.requirement_value; break
                    case 'builds': requirementMet = buildCount >= questDef.requirement_value; break
                    case 'streak': requirementMet = currentStreak >= questDef.requirement_value; break
                    case 'discussions': requirementMet = discussionCount >= questDef.requirement_value; break
                    case 'exams': requirementMet = passedExamCount >= questDef.requirement_value; break
                    default: requirementMet = false
                }

                if (requirementMet) {
                    if (existingQuest) {
                        await supabase.from('user_quests').update({ is_completed: true, completed_at: new Date().toISOString(), xp_earned: questDef.xp_reward }).eq('id', existingQuest.id)
                    } else {
                        await supabase.from('user_quests').insert({ user_id: userId, quest_id: questDef.id, is_completed: true, completed_at: new Date().toISOString(), xp_earned: questDef.xp_reward })
                    }
                    newXp += questDef.xp_reward
                    await supabase.from('xp_transactions').insert({ user_id: userId, amount: questDef.xp_reward, reason: `Hoàn thành nhiệm vụ: ${questDef.title}`, reference_type: 'quest', reference_id: questDef.id })
                } else if (existingQuest) {
                    const progress = calculateQuestProgress(questDef, completedLessonCount, quizCount, buildCount, discussionCount, currentStreak, passedExamCount)
                    if (progress !== existingQuest.progress) {
                        await supabase.from('user_quests').update({ progress }).eq('id', existingQuest.id)
                    }
                }
            }

            if (newXp > currentXp) {
                const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', userId).single()
                const totalXp = (profile?.xp || 0) + (newXp - currentXp)
                const { data: levelDefs } = await supabase.from('level_definitions').select('level').lte('xp_required', totalXp).order('xp_required', { ascending: false }).limit(1)
                const newLevel = (levelDefs?.[0] as any)?.level || 1
                await supabase.from('profiles').update({ xp: totalXp, level: newLevel, updated_at: new Date().toISOString() }).eq('id', userId)
                await supabase.from('leaderboard_cache').upsert({ user_id: userId, total_xp: totalXp, level: newLevel, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                await supabase.from('learning_stats').update({ total_xp: totalXp, updated_at: new Date().toISOString() }).eq('user_id', userId)
                if (newLevel > currentLevel) {
                    leveledUp = true
                }
            }

            return { xp: newXp, leveledUp }
        } catch (e) {
            console.error('Auto-complete quests error:', e)
            return null
        }
    }, [])

    function calculateQuestProgress(quest: Quest, completedLessons: number, quizzes: number, builds: number, discussions: number, streak: number, exams?: number) {
        switch (quest.requirement_type) {
            case 'lessons': return Math.min(completedLessons, quest.requirement_value)
            case 'quizzes': return Math.min(quizzes, quest.requirement_value)
            case 'builds': return Math.min(builds, quest.requirement_value)
            case 'discussions': return Math.min(discussions, quest.requirement_value)
            case 'streak': return Math.min(streak, quest.requirement_value)
            case 'exams': return Math.min(exams || 0, quest.requirement_value)
            default: return 0
        }
    }

    const fetchData = useCallback(async () => {
        if (!userId || !supabaseRef.current) return;
        const supabase = supabaseRef.current;
        const [
          progress, statsRes, profile, levelDefs, userQuests, activeQuests, titles, xpHistory,
        ] = await Promise.all([
            supabase.from('lesson_progress').select('lesson_id').eq('student_id', userId),
            supabase.from('learning_stats').select('*').eq('user_id', userId).single(),
            supabase.from('profiles').select('xp, level').eq('id', userId).single(),
            supabase.from('level_definitions').select('*').order('level', { ascending: true }),
            supabase.from('user_quests').select('*, daily_quests(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
            supabase.from('daily_quests').select('*').eq('is_active', true).order('xp_reward', { ascending: false }),
            supabase.from('user_titles').select('*, player_titles(*)').eq('user_id', userId),
            supabase.from('xp_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
        ]);

        let xp = profile?.data?.xp || statsRes?.data?.total_xp || 0;
        const defs = (levelDefs.data as LevelDef[]) || defaultLevelDefs;
        const levelInfo = calcLevel(xp, defs);
        const currentQuests = (userQuests.data || []) as UserQuest[];
        const allQuestsDefs = (() => {
            const fetched = (activeQuests.data || []) as Quest[];
            return fetched.length >= 5 ? fetched : [...fetched, ...FALLBACK_QUESTS].slice(0, 5);
        })();

        // Auto-complete quests if requirements are met
        try {
            const result = await autoCompleteQuests(supabase, userId, currentQuests, allQuestsDefs, xp, levelInfo.level)
            if (result && result.xp > xp) {
                xp = result.xp
            }
        } catch (e) {
            console.error('Auto-complete error:', e)
        }

        const finalLevelInfo = calcLevel(xp, defs);

        setState(prev => ({
            ...prev,
            completedLessons: new Set((progress.data || []).map((p: any) => p.lesson_id)),
            xp,
            streak: statsRes.data?.current_streak || 0,
            studyMinutes: statsRes.data?.total_study_minutes || 0,
            weeklyActivity: statsRes.data?.weekly_activity || [0, 0, 0, 0, 0, 0, 0],
            ...finalLevelInfo,
            levelDefs: defs,
            quests: currentQuests,
            allQuests: allQuestsDefs,
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
