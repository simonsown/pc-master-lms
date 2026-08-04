-- ==================================================================
-- FACE ATTENDANCE (Điểm danh nhận diện khuôn mặt)
-- 1) attendance_faces   : khuôn mặt (descriptor) đã lưu của học sinh
-- 2) attendance_records : lịch sử điểm danh (mỗi học sinh/ngày 1 dòng)
-- ==================================================================

-- ━━━ Bảng 1: attendance_faces ━━━
CREATE TABLE IF NOT EXISTS public.attendance_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  descriptor JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

COMMENT ON TABLE public.attendance_faces IS 'Khuôn mặt (descriptor) đã lưu của học sinh cho từng lớp';

-- ━━━ Bảng 2: attendance_records ━━━
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recognized_by TEXT NOT NULL DEFAULT 'face',
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, session_date)
);

COMMENT ON TABLE public.attendance_records IS 'Bảng điểm danh: mỗi học sinh mỗi ngày 1 dòng duy nhất';

CREATE INDEX IF NOT EXISTS attendance_records_class_date_idx ON public.attendance_records(class_id, session_date);
CREATE INDEX IF NOT EXISTS attendance_records_student_idx ON public.attendance_records(student_id);

-- ━━━ RLS ━━━
ALTER TABLE public.attendance_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Giáo viên sở hữu lớp → toàn quyền khuôn mặt trong lớp mình
DROP POLICY IF EXISTS "teacher_manage_attendance_faces" ON public.attendance_faces;
CREATE POLICY "teacher_manage_attendance_faces" ON public.attendance_faces
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = attendance_faces.class_id AND c.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = attendance_faces.class_id AND c.teacher_id = auth.uid()
  ));

-- Học sinh xem được khuôn mặt của chính mình
DROP POLICY IF EXISTS "student_read_own_face" ON public.attendance_faces;
CREATE POLICY "student_read_own_face" ON public.attendance_faces
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Giáo viên quản lý điểm danh lớp mình
DROP POLICY IF EXISTS "teacher_manage_attendance_records" ON public.attendance_records;
CREATE POLICY "teacher_manage_attendance_records" ON public.attendance_records
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = attendance_records.class_id AND c.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = attendance_records.class_id AND c.teacher_id = auth.uid()
  ));

-- Học sinh xem điểm danh của chính mình
DROP POLICY IF EXISTS "student_read_own_attendance" ON public.attendance_records;
CREATE POLICY "student_read_own_attendance" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ━━━ Realtime: để danh sách điểm danh cập nhật live ━━━
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'attendance_records already in publication';
    END;
  END IF;
END $$;
