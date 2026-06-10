-- ═══ NGÂN HÀNG CÂU HỎI ═══
CREATE TABLE IF NOT EXISTS public.question_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'Tin học - Lắp ráp PC',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'single_choice',
    'multiple_choice',
    'true_false',
    'fill_blank',
    'ordering'
  )) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'medium',
  points INT DEFAULT 10,
  explanation TEXT,
  image_url TEXT,
  tags TEXT[],
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  "order" INT DEFAULT 0
);

-- ═══ ĐỀ THI ═══
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id),
  class_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INT,
  passing_score INT DEFAULT 70,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  max_attempts INT DEFAULT 3,
  show_answers_after TEXT DEFAULT 'after_submit'
    CHECK (show_answers_after IN ('never', 'after_submit', 'after_deadline')),
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  "order" INT,
  PRIMARY KEY (quiz_id, question_id)
);

-- ═══ BÀI LÀM ═══
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id),
  student_id UUID REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INT,
  score NUMERIC(5,2),
  max_score INT,
  status TEXT DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','submitted','graded','expired')),
  attempt_number INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  selected_option_ids UUID[],
  text_answer TEXT,
  ordering_answer UUID[],
  is_correct BOOLEAN,
  points_earned NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INT
);

-- ═══ RLS POLICIES ═══
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_own_attempts" ON public.quiz_attempts
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "student_own_answers" ON public.quiz_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE id = attempt_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "teacher_view_attempts" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- VIEW an toàn cho học sinh
CREATE OR REPLACE VIEW public.quiz_questions_for_student AS
  SELECT
    q.id, q.content, q.type, q.points, q.image_url,
    q.tags, qq.order,
    json_agg(
      json_build_object(
        'id', qo.id,
        'content', qo.content,
        'order', qo.order
      ) ORDER BY qo.order
    ) AS options,
    qq.quiz_id
  FROM public.questions q
  JOIN public.quiz_questions qq ON qq.question_id = q.id
  JOIN public.question_options qo ON qo.question_id = q.id
  GROUP BY q.id, q.content, q.type, q.points, q.image_url, q.tags, qq.order, qq.quiz_id;
