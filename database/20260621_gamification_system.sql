-- ==========================================
-- GAMIFICATION SYSTEM: Levels, Titles, Ranks
-- Solo Leveling Inspired
-- ==========================================

-- 1. Add columns to profiles table for level system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER DEFAULT 0;

-- 2. Level definitions table
CREATE TABLE IF NOT EXISTS public.level_definitions (
  level INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  color_hex TEXT DEFAULT '#00d4aa',
  icon TEXT DEFAULT '⚡',
  description TEXT
);

INSERT INTO public.level_definitions (level, title, xp_required, color_hex, icon, description) VALUES
  (1, 'Tân Thủ', 0, '#94a3b8', '🌱', 'Người mới bắt đầu hành trình'),
  (2, 'Người Học Việc', 100, '#64748b', '📖', 'Bắt đầu làm quen với kiến thức'),
  (3, 'Học Sinh Chăm Chỉ', 300, '#22c55e', '📚', 'Chăm chỉ học tập mỗi ngày'),
  (4, 'Người Hiểu Biết', 600, '#06b6d4', '💡', 'Nắm vững kiến thức cơ bản'),
  (5, 'Thợ Lắp Ráp Tập Sự', 1000, '#3b82f6', '🔧', 'Bắt đầu thực hành lắp ráp'),
  (6, 'Kỹ Thuật Viên', 1600, '#8b5cf6', '⚙️', 'Có kỹ năng thực hành tốt'),
  (7, 'Chuyên Gia PC', 2400, '#f59e0b', '🖥️', 'Am hiểu về phần cứng máy tính'),
  (8, 'Kỹ Sư Xây Dựng', 3400, '#f97316', '🏗️', 'Xây dựng cấu hình PC thuần thục'),
  (9, 'Kiến Trúc Sư Hệ Thống', 4600, '#ef4444', '🏛️', 'Thiết kế hệ thống máy tính'),
  (10, 'Bậc Thầy PC', 6000, '#ec4899', '👑', 'Bậc thầy về lắp ráp máy tính'),
  (11, 'Huyền Thoại', 8000, '#00d4aa', '⭐', 'Huyền thoại trong cộng đồng'),
  (12, 'Solo Leveling', 10000, '#00f3ff', '⚡', 'Sức mạnh vô hạn - Solo Leveling!'),
  (13, 'Rảnh Thợ Săn Hạng S', 13000, '#a855f7', '🗡️', 'Thợ săn hạng S siêu cấp'),
  (14, 'Chúa Tể Bóng Tối', 17000, '#7c3aed', '🌑', 'Chúa tể bóng tối huyền thoại'),
  (15, 'Quốc Vương', 22000, '#fbbf24', '👑', 'Quốc vương của mọi loài'),
  (16, 'Thần', 28000, '#ff6b6b', '🔥', 'Thần linh tối thượng'),
  (17, 'Vĩnh Hằng', 35000, '#ff4500', '♾️', 'Sức mạnh vĩnh hằng'),
  (18, 'Hủy Diệt', 43000, '#dc2626', '💀', 'Hủy diệt mọi giới hạn'),
  (19, 'Siêu Việt', 52000, '#9333ea', '🌟', 'Siêu việt thực tại'),
  (20, 'Bất Tử', 65000, '#ffd700', '🏆', 'Bất tử trong lịch sử')
ON CONFLICT (level) DO UPDATE SET
  title = EXCLUDED.title,
  xp_required = EXCLUDED.xp_required,
  color_hex = EXCLUDED.color_hex,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 3. Titles/Achievements table
CREATE TABLE IF NOT EXISTS public.player_titles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏅',
  how_to_get TEXT,
  xp_bonus INTEGER DEFAULT 0
);

INSERT INTO public.player_titles (id, title, description, icon, how_to_get, xp_bonus) VALUES
  ('first_lesson', 'Khởi Đầu', 'Hoàn thành bài học đầu tiên', '🎯', 'Hoàn thành 1 bài học', 50),
  ('diligent', 'Cần Cù', 'Học 7 ngày liên tiếp', '🔥', 'Duy trì streak 7 ngày', 100),
  ('perfect_score', 'Hoàn Hảo', 'Đạt điểm 10 tuyệt đối', '⭐', 'Đạt 100% trong 1 bài quiz', 150),
  ('pc_builder', 'Thợ PC', 'Lắp ráp thành công PC đầu tiên', '🖥️', 'Hoàn thành 1 bài Builder Lab', 100),
  ('social', 'Nổi Tiếng', 'Nhận 10 upvote từ diễn đàn', '🤝', 'Có 10 upvote', 80),
  ('speed_demon', 'Tốc Độ', 'Hoàn thành quiz trong 2 phút', '⚡', 'Làm quiz nhanh dưới 2 phút', 120),
  ('scholar', 'Học Giả', 'Hoàn thành 10 bài học', '📚', 'Hoàn thành 10 bài học', 200),
  ('collector', 'Nhà Sưu Tập', 'Đạt 5000 XP', '💎', 'Tích lũy 5000 XP', 300),
  ('champion', 'Nhà Vô Địch', 'Đứng top 1 bảng xếp hạng', '🏆', 'Đạt hạng 1 leaderboard', 500),
  ('quest_master', 'Vua Nhiệm Vụ', 'Hoàn thành 50 nhiệm vụ ngày', '📋', 'Hoàn thành 50 quest', 250)
ON CONFLICT (id) DO NOTHING;

-- 4. Player unlocked titles
CREATE TABLE IF NOT EXISTS public.user_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id TEXT REFERENCES public.player_titles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  UNIQUE(user_id, title_id)
);

-- 5. Enhanced daily quests table
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'daily';
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy';
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📋';
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS requirement_type TEXT;
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS requirement_value INTEGER DEFAULT 1;
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.daily_quests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 6. Add XP tracking fields to user_quests
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- 7. User quest streak tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_quest_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quest_streak INTEGER DEFAULT 0;

-- 8. Learning stats table (for realtime tracking)
CREATE TABLE IF NOT EXISTS public.learning_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,
  weekly_activity INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0],
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. XP transaction log
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Leaderboard cache table
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  title TEXT,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view levels" ON public.level_definitions FOR SELECT USING (true);
CREATE POLICY "Everyone can view titles" ON public.player_titles FOR SELECT USING (true);
CREATE POLICY "Users can view their titles" ON public.user_titles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their titles" ON public.user_titles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their stats" ON public.learning_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view leaderboard" ON public.leaderboard_cache FOR SELECT USING (true);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_titles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xp_transactions;
