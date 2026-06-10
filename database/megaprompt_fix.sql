-- Update profiles table to include school_name
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Ensure lessons table exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure lesson_sections table exists (for video, pdf, quiz)
CREATE TABLE IF NOT EXISTS public.lesson_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'video', 'pdf', 'quiz', 'text'
    content_url TEXT, -- for video/pdf
    content_body TEXT, -- for text/quiz data
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure assignments table exists
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Policies for lessons
CREATE POLICY "Teachers can manage their own lessons" ON public.lessons
    FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view published lessons" ON public.lessons
    FOR SELECT USING (is_published = true OR auth.uid() = teacher_id);

-- Policies for lesson_sections
CREATE POLICY "Teachers can manage sections of their lessons" ON public.lesson_sections
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.lessons WHERE id = lesson_sections.lesson_id AND teacher_id = auth.uid()
    ));
CREATE POLICY "Students can view sections of published lessons" ON public.lesson_sections
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.lessons WHERE id = lesson_sections.lesson_id AND (is_published = true OR teacher_id = auth.uid())
    ));

-- Policies for assignments
CREATE POLICY "Teachers can manage their own assignments" ON public.assignments
    FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view assignments for their classes" ON public.assignments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.class_members WHERE class_id = assignments.class_id AND student_id = auth.uid()
    ));

-- Daily Quests table
CREATE TABLE IF NOT EXISTS public.daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Quest progress
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES public.daily_quests(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, quest_id, created_at::date)
);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY " Everyone can view quests\ ON public.daily_quests FOR SELECT USING (true);
CREATE POLICY \Users can view their own quest progress\ ON public.user_quests FOR SELECT USING (auth.uid() = user_id);


-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT,
    level TEXT DEFAULT 'Co b?n',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Update lessons to belong to courses
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Update RLS for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY " Everyone can view published courses\ ON public.courses FOR SELECT USING (is_published = true OR auth.uid() = teacher_id);
CREATE POLICY \Teachers can manage their courses\ ON public.courses FOR ALL USING (auth.uid() = teacher_id);

