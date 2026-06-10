-- 1. View tính toán tiến độ học tập của từng học sinh
-- Dựa trên số lượng bài học đã hoàn thành và quiz đã đạt
CREATE OR REPLACE VIEW public.student_course_progress AS
SELECT 
    p.id as student_id,
    p.full_name,
    l.id as lesson_id,
    l.title as lesson_title,
    EXISTS (
        SELECT 1 FROM quiz_attempts qa 
        JOIN quizzes q ON qa.quiz_id = q.id 
        WHERE qa.student_id = p.id 
        AND q.lesson_id = l.id 
        AND qa.score >= q.passing_score
    ) as is_completed,
    COALESCE(
        (SELECT MAX(score) FROM quiz_attempts qa 
         JOIN quizzes q ON qa.quiz_id = q.id 
         WHERE qa.student_id = p.id AND q.lesson_id = l.id), 
        0
    ) as best_score
FROM profiles p
CROSS JOIN lessons l;

-- 2. View tổng hợp hiệu suất lớp học cho Giáo viên
CREATE OR REPLACE VIEW public.teacher_class_stats AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    COUNT(DISTINCT cm.student_id) as total_students,
    AVG(qa.score) as avg_quiz_score,
    COUNT(DISTINCT qa.id) as total_submissions
FROM classes c
LEFT JOIN class_members cm ON c.id = cm.class_id
LEFT JOIN quizzes q ON q.lesson_id IS NOT NULL -- Giả định quiz gắn với lesson
LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = cm.student_id
GROUP BY c.id, c.name;

-- 3. Bảng lưu vết hoạt động gần đây (Activity Log)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'login', 'complete_lesson', 'submit_quiz', 'join_class'
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
