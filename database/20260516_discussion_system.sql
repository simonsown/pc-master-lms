-- 1. Đảm bảo bảng bình luận tồn tại và có cấu trúc phân tầng
CREATE TABLE IF NOT EXISTS public.lesson_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE, -- Cho phép phản hồi (Reply)
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Realtime cho bình luận
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_comments;

-- RLS cho bình luận
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.lesson_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.lesson_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.lesson_comments FOR DELETE USING (auth.uid() = user_id);
