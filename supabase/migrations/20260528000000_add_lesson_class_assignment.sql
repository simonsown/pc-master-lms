-- Add lesson-class assignment junction table
CREATE TABLE IF NOT EXISTS public.lesson_class_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, class_id)
);

ALTER TABLE public.lesson_class_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage assignments for their lessons
CREATE POLICY "Teacher manages lesson class assignments" ON public.lesson_class_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.lessons WHERE id = lesson_id AND teacher_id = auth.uid())
    );

-- Students see assignments for classes they belong to
CREATE POLICY "Student sees own class lesson assignments" ON public.lesson_class_assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.class_members WHERE class_id = lesson_class_assignments.class_id AND student_id = auth.uid())
    );

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_class_assignments;
