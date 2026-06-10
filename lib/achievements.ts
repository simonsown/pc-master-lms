import { SupabaseClient } from '@supabase/supabase-js'

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_lesson',
    title: 'Khởi đầu hành trình',
    description: 'Hoàn thành bài giảng đầu tiên',
    icon: '🎯',
    condition: { type: 'lesson_completed_count', min: 1 },
    points: 10,
    rarity: 'common' as const
  },
  {
    id: 'quiz_ace',
    title: 'Xuất sắc',
    description: 'Đạt điểm tuyệt đối (100%) trong một bài quiz',
    icon: '⭐',
    condition: { type: 'quiz_perfect_score' },
    points: 50,
    rarity: 'rare' as const
  },
  {
    id: 'week_streak',
    title: 'Kiên trì 7 ngày',
    description: 'Học liên tiếp 7 ngày không nghỉ',
    icon: '🔥',
    condition: { type: 'streak_days', min: 7 },
    points: 30,
    rarity: 'uncommon' as const
  },
  {
    id: 'pc_master',
    title: 'PC Master',
    description: 'Hoàn thành tất cả bài trong lộ trình',
    icon: '🖥️',
    condition: { type: 'path_completed' },
    points: 100,
    rarity: 'legendary' as const
  },
  {
    id: 'lab_expert',
    title: 'Chuyên gia Lab',
    description: 'Dành hơn 10 giờ trong Builder Lab',
    icon: '⚙️',
    condition: { type: 'lab_time_hours', min: 10 },
    points: 40,
    rarity: 'uncommon' as const
  },
  {
    id: 'helpful_member',
    title: 'Nhiệt tình',
    description: 'Được upvote 10 lần trong diễn đàn',
    icon: '🤝',
    condition: { type: 'forum_upvotes', min: 10 },
    points: 25,
    rarity: 'common' as const
  }
]

export async function checkAndAwardAchievements(
  supabase: SupabaseClient,
  userId: string,
  triggerEvent: 'lesson_completed' | 'quiz_submitted' | 'builder_session_ended' | 'forum_upvoted'
) {
  // Get already earned achievements
  const { data: earned } = await supabase
    .from('student_achievements')
    .select('achievement_id')
    .eq('student_id', userId)

  const earnedIds = (earned || []).map(e => e.achievement_id)

  for (const ach of ACHIEVEMENT_DEFINITIONS) {
    if (earnedIds.includes(ach.id)) continue

    const isEarned = await evaluateCondition(supabase, userId, ach.condition)
    if (isEarned) {
      // Award achievement
      const { error: awardErr } = await supabase
        .from('student_achievements')
        .insert({
          student_id: userId,
          achievement_id: ach.id
        })

      if (!awardErr) {
        // Send a notification!
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'achievement_earned',
          title: 'Huy hiệu mới đã mở khóa! 🏆',
          body: `Chúc mừng! Bạn vừa nhận được huy hiệu "${ach.title}" và +${ach.points} điểm thành tích!`,
          action_url: '/student/achievements',
          data: { achievementId: ach.id, points: ach.points }
        })
      }
    }
  }
}

async function evaluateCondition(supabase: SupabaseClient, userId: string, condition: any): Promise<boolean> {
  switch (condition.type) {
    case 'lesson_completed_count': {
      const { count } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('status', 'completed')
      
      return (count || 0) >= condition.min
    }

    case 'quiz_perfect_score': {
      const { count } = await supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('score', 100)
        .eq('status', 'submitted')

      return (count || 0) >= 1
    }

    case 'streak_days': {
      // Fetch distinct activity days from lesson_progress last_accessed
      const { data } = await supabase
        .from('lesson_progress')
        .select('last_accessed')
        .eq('student_id', userId)

      if (!data || data.length === 0) return false

      const dates = data
        .map(d => new Date(d.last_accessed).toDateString())
        .filter((value, index, self) => self.indexOf(value) === index) // Unique days
        .map(d => new Date(d).getTime())
        .sort((a, b) => b - a) // Descending order

      if (dates.length < condition.min) return false

      // Check consecutive days
      let consecutive = 1
      for (let i = 0; i < dates.length - 1; i++) {
        const diffTime = dates[i] - dates[i + 1]
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          consecutive++
          if (consecutive >= condition.min) return true
        } else {
          consecutive = 1
        }
      }
      return false
    }

    case 'path_completed': {
      // Total items in path vs total completed lessons
      const { count: totalItems } = await supabase
        .from('path_items')
        .select('id', { count: 'exact', head: true })

      const { count: completedItems } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('status', 'completed')

      if (!totalItems || !completedItems) return false
      return completedItems >= totalItems
    }

    case 'lab_time_hours': {
      // Sum session durations from builder_sessions
      const { data } = await supabase
        .from('builder_sessions')
        .select('created_at, updated_at')
        .eq('user_id', userId)

      if (!data) return false

      let totalMinutes = 0
      data.forEach(s => {
        const start = new Date(s.created_at).getTime()
        const end = new Date(s.updated_at).getTime()
        if (end > start) {
          totalMinutes += (end - start) / 60000
        }
      })

      return (totalMinutes / 60) >= condition.min
    }

    case 'forum_upvotes': {
      // Sum upvotes on user's discussion threads or replies
      // Upvotes count is stored directly in thread/replies tables, let's query upvotes received
      const { data: threads } = await supabase
        .from('discussion_threads')
        .select('upvote_count')
        .eq('author_id', userId)
      
      const { data: replies } = await supabase
        .from('discussion_replies')
        .select('upvote_count')
        .eq('author_id', userId)

      const threadUpvotes = (threads || []).reduce((acc, t) => acc + (t.upvote_count || 0), 0)
      const replyUpvotes = (replies || []).reduce((acc, r) => acc + (r.upvote_count || 0), 0)

      return (threadUpvotes + replyUpvotes) >= condition.min
    }

    default:
      return false
  }
}
