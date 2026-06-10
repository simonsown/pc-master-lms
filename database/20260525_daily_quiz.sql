-- ═══ THÊM CỘT is_daily CHO BẢNG quizzes ═══
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_daily BOOLEAN DEFAULT FALSE;

-- ═══ VIEW: daily_quiz_info (lấy bài quiz hằng ngày cho hôm nay) ═══
CREATE OR REPLACE VIEW public.daily_quiz_info AS
SELECT 
  q.id,
  q.title,
  q.description,
  q.time_limit_minutes,
  q.passing_score,
  q.created_at,
  (SELECT COUNT(*)::int FROM public.quiz_attempts qa 
   WHERE qa.quiz_id = q.id AND qa.student_id = auth.uid() 
   AND qa.status = 'submitted')::int AS student_attempts
FROM public.quizzes q
WHERE q.is_daily = TRUE 
  AND q.is_published = TRUE
  AND q.created_at::date = CURRENT_DATE
ORDER BY q.created_at DESC
LIMIT 1;

-- ═══ RLS: cho phép tài khoản service role và admin tạo quiz daily ═══
CREATE POLICY IF NOT EXISTS "service_role_insert_daily" ON public.quizzes
  FOR INSERT WITH CHECK (is_daily = TRUE);

CREATE POLICY IF NOT EXISTS "select_daily_quiz" ON public.quizzes
  FOR SELECT USING (is_daily = TRUE OR is_daily = FALSE);
