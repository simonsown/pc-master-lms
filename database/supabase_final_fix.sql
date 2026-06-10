-- Bổ sung các bảng thiếu hụt cho Lesson Course
CREATE TABLE IF NOT EXISTS public.lesson_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    drive_embed_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bật RLS
ALTER TABLE public.lesson_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép mọi người đọc sách bài giảng" ON public.lesson_books
    FOR SELECT USING (true);

CREATE POLICY "Giáo viên quản lý sách của mình" ON public.lesson_books
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.lessons WHERE id = lesson_books.lesson_id AND teacher_id = auth.uid()
    ));

-- Fix lỗi chính tả trong policy cũ (nếu có)
DROP POLICY IF EXISTS " Everyone can view quests" ON public.daily_quests;
CREATE POLICY "Everyone can view quests" ON public.daily_quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own quest progress" ON public.user_quests;
CREATE POLICY "Users can view their own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);
