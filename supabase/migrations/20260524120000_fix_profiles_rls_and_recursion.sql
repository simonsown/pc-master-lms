-- Path: supabase/migrations/20260524120000_fix_profiles_rls_and_recursion.sql
-- ==================================================================
-- SYSTEM UPGRADE: FIX PROFILES RLS INFINITE RECURSION & SIGNUP ERROR
-- ==================================================================

-- ━━━ BƯỚC 1: SỬA ĐỔI RLS CHO BẢNG PROFILES ĐỂ TRÁNH INFINITE RECURSION ━━━

-- Gỡ bỏ tất cả policies cũ trên bảng profiles để tránh xung đột
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_teacher" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_parent" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Bật Row Level Security cho profiles (đảm bảo chắc chắn đã bật)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.1. Policy SELECT: Cho phép người dùng xem profile của chính mình
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 1.2. Policy SELECT: Cho phép Admin xem tất cả profile (Sử dụng JWT metadata để tránh đệ quy)
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

-- 1.3. Policy SELECT: Cho phép Giáo viên xem profile của Học sinh trong lớp (để quản lý học tập)
CREATE POLICY "profiles_select_teacher" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'teacher' 
    AND role = 'student'
  );

-- 1.4. Policy SELECT: Cho phép Phụ huynh xem profile của con đã liên kết (trực tiếp qua bảng liên kết)
CREATE POLICY "profiles_select_parent" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'parent'
    AND EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      WHERE psl.parent_id = auth.uid() 
        AND psl.student_id = public.profiles.id 
        AND psl.status = 'active'
    )
  );

-- 2. Policy INSERT: Cho phép chèn profile mới (để tránh lỗi 'Database error saving new user' BUG-1)
-- Cho phép insert nếu user ID trùng với auth.uid() hoặc chèn từ hệ thống Auth trigger (auth.uid() is null khi trigger handle_new_user chạy dưới dạng security definer)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL 
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- 3. Policy UPDATE: Cho phép người dùng tự cập nhật thông tin cá nhân của mình
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ━━━ BƯỚC 2: CẬP NHẬT RLS CHO CÁC BẢNG LỚP HỌC & BÀI GIẢNG ĐỂ ĐẢM BẢO GIÁO VIÊN TOÀN QUYỀN ━━━

-- Đảm bảo giáo viên toàn quyền quản lý lớp học (INSERT, SELECT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Teacher sees own classes" ON public.classes;
DROP POLICY IF EXISTS "teacher_own_classes" ON public.classes;
CREATE POLICY "teacher_own_classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Đảm bảo giáo viên toàn quyền quản lý bài giảng (INSERT, SELECT, UPDATE, DELETE)
DROP POLICY IF EXISTS "teacher_own_lessons" ON public.lessons;
CREATE POLICY "teacher_own_lessons" ON public.lessons
  FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());


-- ━━━ BƯỚC 3: CÀI ĐẶT RLS VÀ CẤU TRÚC QUIZ ĐỂ SỬA LỖI TẠO ĐỀ THI & CÂU HỎI ━━━

-- Đảm bảo giáo viên toàn quyền quản lý quizzes
DROP POLICY IF EXISTS "Teachers can manage their quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "teachers_manage_quizzes" ON public.quizzes;
CREATE POLICY "teachers_manage_quizzes" ON public.quizzes
  FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Đảm bảo giáo viên toàn quyền quản lý câu hỏi trong đề thi và ngân hàng đề thi
ALTER TABLE public.questions ENABLE ROW LEVEL security;
ALTER TABLE public.question_options ENABLE ROW LEVEL security;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL security;

DROP POLICY IF EXISTS "teachers_manage_quizzes" ON public.quizzes;

DROP POLICY IF EXISTS "teachers_manage_questions" ON public.questions;
CREATE POLICY "teachers_manage_questions" ON public.questions
  FOR ALL USING (
    -- Giáo viên sở hữu ngân hàng câu hỏi
    EXISTS (
      SELECT 1 FROM public.question_banks qb
      WHERE qb.id = bank_id AND qb.teacher_id = auth.uid()
    )
    OR bank_id IS NULL -- Cho phép tạo câu hỏi tự do trong đề thi
  );

DROP POLICY IF EXISTS "teachers_manage_question_options" ON public.question_options;
CREATE POLICY "teachers_manage_question_options" ON public.question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      LEFT JOIN public.question_banks qb ON qb.id = q.bank_id
      WHERE q.id = question_id AND (qb.teacher_id = auth.uid() OR qb.id IS NULL)
    )
  );

DROP POLICY IF EXISTS "teachers_manage_quiz_questions" ON public.quiz_questions;
CREATE POLICY "teachers_manage_quiz_questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND q.teacher_id = auth.uid()
    )
  );
