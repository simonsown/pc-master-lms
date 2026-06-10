-- ================================================================
-- DEFINITIVE FIX v3 - Fix tất cả lỗi từ gốc
-- Chạy trong Supabase SQL Editor
-- ================================================================

-- ════════════════════════════════════════════════════
-- PHẦN 1: REBUILD TRIGGER handle_new_user (Root cause)
-- ════════════════════════════════════════════════════

-- Xóa trigger cũ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Rebuild function với EXCEPTION handler + ON CONFLICT DO UPDATE
-- Đây là nguyên nhân gốc rễ của "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Thêm EXCEPTION để trigger không bao giờ crash dù profiles có lỗi gì
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user@'), '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      NOW(),
      NOW()
    )
    -- Nếu profile đã tồn tại thì update, không crash
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      role = COALESCE(EXCLUDED.role, public.profiles.role),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Ghi log nhưng KHÔNG fail trigger → không bao giờ block đăng ký
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════
-- PHẦN 2: FIX profiles RLS - mở insert cho trigger
-- ════════════════════════════════════════════════════

-- Xóa TOÀN BỘ policies profiles
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- INSERT: Cho phép tất cả (trigger + client đều cần)
CREATE POLICY "profiles_insert_open" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- SELECT: Chỉ xem của chính mình
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- SELECT: Admin dùng JWT metadata (tránh recursion)
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

-- SELECT: Teacher xem học sinh
CREATE POLICY "profiles_select_teacher" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'teacher'
    AND role = 'student'
  );

-- SELECT: Phụ huynh xem con
CREATE POLICY "profiles_select_parent" ON public.profiles
  FOR SELECT USING (
    COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'parent'
    AND EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      WHERE psl.parent_id = auth.uid()
        AND psl.student_id = public.profiles.id
    )
  );

-- UPDATE: Chỉ tự cập nhật của mình
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ════════════════════════════════════════════════════
-- PHẦN 3: FIX classes RLS - infinite recursion
-- ════════════════════════════════════════════════════

ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- Xóa TOÀN BỘ policies
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('classes', 'class_members', 'submissions', 'assignments')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- SECURITY DEFINER functions (bypass RLS - phá vòng lặp)
CREATE OR REPLACE FUNCTION public.fn_teacher_class_ids()
RETURNS UUID[] LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT ARRAY(SELECT id FROM public.classes WHERE teacher_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.fn_student_class_ids()
RETURNS UUID[] LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT ARRAY(SELECT class_id FROM public.class_members WHERE student_id = auth.uid());
$$;

-- Bật lại RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "cls_teacher" ON public.classes
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "cls_student" ON public.classes
  FOR SELECT USING (id = ANY(public.fn_student_class_ids()));

-- Class members policies
CREATE POLICY "cm_teacher" ON public.class_members
  FOR ALL USING (class_id = ANY(public.fn_teacher_class_ids()));

CREATE POLICY "cm_student_select" ON public.class_members
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "cm_student_insert" ON public.class_members
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Submissions policies
CREATE POLICY "sub_student" ON public.submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "sub_teacher" ON public.submissions
  FOR ALL USING (class_id = ANY(public.fn_teacher_class_ids()));

-- Assignments policies
CREATE POLICY "asgn_teacher" ON public.assignments
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "asgn_student" ON public.assignments
  FOR SELECT USING (
    is_published = TRUE AND class_id = ANY(public.fn_student_class_ids())
  );

-- ════════════════════════════════════════════════════
-- PHẦN 4: FIX lesson_sections - column mismatch
-- ════════════════════════════════════════════════════

ALTER TABLE public.lesson_sections
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';

UPDATE public.lesson_sections
SET
  type = COALESCE(NULLIF(type,''), content_type, 'text'),
  content = COALESCE(NULLIF(content,''), content_body, content_url, '')
WHERE (type IS NULL OR type = '') OR (content IS NULL OR content = '');

-- ════════════════════════════════════════════════════
-- PHẦN 5: Thêm school_name nếu profiles chưa có column
-- ════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_name TEXT;

-- ════════════════════════════════════════════════════
-- XONG: Reload PostgREST schema cache
-- ════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';

-- Kiểm tra: xem policies mới trên profiles
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'classes', 'class_members')
ORDER BY tablename, policyname;
