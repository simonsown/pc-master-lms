-- 1. Bảng thông báo (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'assignment', 'quiz')),
    link TEXT, -- Link dẫn đến bài học/bài tập liên quan
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật realtime cho bảng notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- RLS cho notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System/Teachers can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Cấu trúc Lộ trình học tập (Prerequisites)
-- Thêm cột bài học tiên quyết vào bảng lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS prerequisite_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS min_score_to_unlock INTEGER DEFAULT 5;
