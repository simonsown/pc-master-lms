-- ==========================================
-- QUIZ & QUESTION BANK MODULE SETUP
-- ==========================================

-- 1. Question Banks (Ngân hàng đề thi)
CREATE TABLE IF NOT EXISTS public.question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions (Câu hỏi)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'fill_blank')),
  points INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Question Options (Đáp án trắc nghiệm)
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Quizzes (Bài kiểm tra)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL, -- Liên kết với bài giảng
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL, -- Hoặc liên kết với nhiệm vụ
  title TEXT NOT NULL,
  time_limit_minutes INTEGER DEFAULT 15,
  passing_score INTEGER DEFAULT 5,
  randomize BOOLEAN DEFAULT TRUE,
  max_attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quiz Attempts (Lần làm bài)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out'))
);

-- 6. Quiz Answers (Chi tiết bài làm)
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  text_answer TEXT, -- Dùng cho fill_blank
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR QUESTION BANKS (Teacher only)
CREATE POLICY "Teachers can manage their own question banks" ON public.question_banks
  FOR ALL USING (teacher_id = auth.uid());

-- POLICIES FOR QUESTIONS (Inherit from Bank)
CREATE POLICY "Teachers can manage questions in their banks" ON public.questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.question_banks WHERE id = bank_id AND teacher_id = auth.uid())
  );

-- POLICIES FOR OPTIONS (Inherit from Question)
CREATE POLICY "Teachers can manage options for their questions" ON public.question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.question_banks b ON q.bank_id = b.id
      WHERE q.id = question_id AND b.teacher_id = auth.uid()
    )
  );

-- Students can only read options for quizzes they are part of (but NOT is_correct)
CREATE POLICY "Students can view options" ON public.question_options
  FOR SELECT USING (true); -- We will filter is_correct in the API/Server Action

-- POLICIES FOR QUIZZES
CREATE POLICY "Teachers can manage their quizzes" ON public.quizzes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Students can view quizzes" ON public.quizzes
  FOR SELECT USING (true);

-- POLICIES FOR ATTEMPTS
CREATE POLICY "Students can manage own attempts" ON public.quiz_attempts
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class attempts" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- POLICIES FOR ANSWERS
CREATE POLICY "Students can manage own answers" ON public.quiz_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND student_id = auth.uid())
  );

CREATE POLICY "Teachers can view answers" ON public.quiz_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
