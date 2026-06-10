-- ============================================================
-- EMERGENCY FIX: Infinite recursion in classes RLS
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- BƯỚC 1: Tắt RLS tạm thời để xóa policy không bị chặn
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- BƯỚC 2: Xóa TOÀN BỘ policies cũ trên các bảng này (bắt buộc)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('classes', 'class_members', 'submissions', 'assignments')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- BƯỚC 3: Tạo helper functions với SECURITY DEFINER (bypass RLS, phá vòng lặp)
CREATE OR REPLACE FUNCTION public.fn_get_my_class_ids_as_teacher()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ARRAY(SELECT id FROM public.classes WHERE teacher_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.fn_get_my_class_ids_as_student()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ARRAY(SELECT class_id FROM public.class_members WHERE student_id = auth.uid());
$$;

-- BƯỚC 4: Bật lại RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- BƯỚC 5: Tạo policies mới KHÔNG ĐỆ QUY cho bảng classes
-- Teacher: Dùng cột trực tiếp, không join
CREATE POLICY "cls_teacher" ON public.classes
  FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Student: Dùng function SECURITY DEFINER (bypass RLS class_members)
CREATE POLICY "cls_student" ON public.classes
  FOR SELECT
  USING (id = ANY(public.fn_get_my_class_ids_as_student()));

-- BƯỚC 6: Tạo policies mới cho class_members
-- Teacher: Dùng function SECURITY DEFINER (bypass RLS classes)
CREATE POLICY "cm_teacher" ON public.class_members
  FOR ALL
  USING (class_id = ANY(public.fn_get_my_class_ids_as_teacher()));

-- Student: Dùng cột trực tiếp, không join
CREATE POLICY "cm_student_select" ON public.class_members
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "cm_student_insert" ON public.class_members
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- BƯỚC 7: Tạo policies mới cho submissions
CREATE POLICY "sub_student" ON public.submissions
  FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "sub_teacher" ON public.submissions
  FOR ALL
  USING (class_id = ANY(public.fn_get_my_class_ids_as_teacher()));

-- BƯỚC 8: Tạo policies mới cho assignments
CREATE POLICY "asgn_teacher" ON public.assignments
  FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "asgn_student" ON public.assignments
  FOR SELECT
  USING (
    is_published = TRUE
    AND class_id = ANY(public.fn_get_my_class_ids_as_student())
  );

-- XONG: Thông báo cho PostgREST reload schema cache
NOTIFY pgrst, 'reload schema';

-- Kiểm tra kết quả: Xem danh sách policies mới
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'class_members', 'submissions', 'assignments')
ORDER BY tablename, policyname;
