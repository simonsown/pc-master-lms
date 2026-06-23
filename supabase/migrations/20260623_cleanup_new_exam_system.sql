-- ═══ CLEANUP: Xóa Zalo columns ═══
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zalo_phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zalo_notifications;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zalo_verified;

-- ═══ ADD: exam_published notification type ═══
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'info', 'success', 'warning', 'error',
    'assignment', 'quiz', 'quiz_published',
    'achievement_earned', 'lesson_completed',
    'child_low_score', 'quiz_graded',
    'exam_published', 'class_announcement'
  )
);

-- ═══ ADD: streak tracking columns ═══
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_daily INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_last_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_exams_done INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_exams_passed INT DEFAULT 0;

-- ═══ FUNCTION: Update streak on quiz completion ═══
CREATE OR REPLACE FUNCTION public.update_streak_on_attempt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' OR NEW.status = 'graded' THEN
    UPDATE public.profiles
    SET
      streak_daily = CASE
        WHEN streak_last_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_daily + 1
        WHEN streak_last_date = CURRENT_DATE THEN streak_daily
        ELSE 1
      END,
      streak_last_date = CURRENT_DATE,
      total_exams_done = total_exams_done + 1,
      total_exams_passed = total_exams_passed + CASE WHEN NEW.score >= (SELECT passing_score FROM quizzes WHERE id = NEW.quiz_id) THEN 1 ELSE 0 END
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_attempt_submit ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_submit
  AFTER UPDATE OF status ON public.quiz_attempts
  FOR EACH ROW
  WHEN (NEW.status = 'submitted' OR NEW.status = 'graded')
  EXECUTE FUNCTION public.update_streak_on_attempt();

-- ═══ VIEW: quiz_questions_for_student (safe, hides is_correct) ═══
CREATE OR REPLACE VIEW public.quiz_questions_for_student AS
SELECT
  qq.quiz_id,
  q.id AS question_id,
  q.content,
  q.type,
  q.points,
  q.difficulty,
  q.explanation,
  qq."order",
  COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT('id', qo.id, 'content', qo.content, 'order', qo."order")
      ORDER BY qo."order"
    ) FILTER (WHERE qo.id IS NOT NULL),
    '[]'::jsonb
  ) AS options
FROM public.quiz_questions qq
JOIN public.questions q ON q.id = qq.question_id
LEFT JOIN public.question_options qo ON qo.question_id = q.id
GROUP BY qq.quiz_id, q.id, q.content, q.type, q.points, q.difficulty, q.explanation, qq."order";
