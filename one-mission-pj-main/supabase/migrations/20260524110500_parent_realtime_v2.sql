-- Path: supabase/migrations/20260524110500_parent_realtime_v2.sql
-- ==================================================================
-- SYSTEM UPGRADE: PARENT MONITORING REALTIME SYSTEM
-- ==================================================================

-- ━━━ BƯỚC 1: THÊM STUDENT_CODE VÀ PARENT ROLE VÀO PROFILES ━━━
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- Thêm các cột bổ sung nếu chưa tồn tại
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Function sinh student_code ngẫu nhiên 8 ký tự không nhầm lẫn
CREATE OR REPLACE FUNCTION generate_student_code() 
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Loại bỏ I, O, 0, 1
  result TEXT := 'PCM-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger: tự sinh student_code khi đăng ký role student
CREATE OR REPLACE FUNCTION trigger_auto_student_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' AND NEW.student_code IS NULL THEN
    LOOP
      NEW.student_code := generate_student_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE student_code = NEW.student_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_student_code ON public.profiles;
CREATE TRIGGER auto_student_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_auto_student_code();

-- Backfill mã cho các học sinh chưa có
UPDATE public.profiles 
SET student_code = generate_student_code() 
WHERE role = 'student' AND student_code IS NULL;


-- ━━━ BƯỚC 2: BẢNG LIÊN KẾT PHỤ HUYNH - HỌC SINH ━━━
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent'
    CHECK (relationship IN ('father','mother','guardian','sibling','other')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','active','revoked')),
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.profiles(id),
  UNIQUE(parent_id, student_id)
);

-- Bật RLS
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Cài đặt RLS Policies
DROP POLICY IF EXISTS "parent_manage_own_links" ON public.parent_student_links;
CREATE POLICY "parent_manage_own_links" ON public.parent_student_links
  FOR ALL USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "student_view_own_links" ON public.parent_student_links;
CREATE POLICY "student_view_own_links" ON public.parent_student_links
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_update_link_status" ON public.parent_student_links;
CREATE POLICY "student_update_link_status" ON public.parent_student_links
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (status IN ('active','revoked'));


-- ━━━ BƯỚC 3: BẢNG THEO DÕI TIẾN ĐỘ HỌC TẬP (LESSON PROGRESS) ━━━
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started','in_progress','completed')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  time_spent_seconds INT DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_own_progress" ON public.lesson_progress;
CREATE POLICY "student_own_progress" ON public.lesson_progress
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "parent_view_child_progress" ON public.lesson_progress;
CREATE POLICY "parent_view_child_progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      WHERE psl.parent_id = auth.uid()
        AND psl.student_id = lesson_progress.student_id
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "teacher_view_class_progress" ON public.lesson_progress;
CREATE POLICY "teacher_view_class_progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );


-- ━━━ BƯỚC 4: BẢNG KẾT QUẢ THI CỦA HỌC SINH (QUIZ ATTEMPTS) ━━━
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  quiz_id UUID NOT NULL,
  quiz_title TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  max_score INT DEFAULT 100,
  status TEXT DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','submitted','graded')),
  attempt_number INT DEFAULT 1
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_own_attempts" ON public.quiz_attempts;
CREATE POLICY "student_own_attempts" ON public.quiz_attempts
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "parent_view_child_quiz" ON public.quiz_attempts;
CREATE POLICY "parent_view_child_quiz" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      WHERE psl.parent_id = auth.uid()
        AND psl.student_id = quiz_attempts.student_id
        AND psl.status = 'active'
    )
  );


-- ━━━ BƯỚC 5: BẢNG THÔNG BÁO (NOTIFICATIONS) ━━━
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'quiz_graded','lesson_completed','achievement_earned',
    'child_absent_3days','child_low_score','child_completed_path',
    'parent_link_request','parent_link_confirmed','teacher_message','system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());


-- ━━━ BƯỚC 6: HÀM TÌM HỌC SINH QUA MÃ AN TOÀN ━━━
-- Drop trước nếu tồn tại với signature cũ (tránh lỗi "cannot change return type")
DROP FUNCTION IF EXISTS public.find_student_by_code(TEXT);

CREATE OR REPLACE FUNCTION public.find_student_by_code(input_code TEXT)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  school_name TEXT,
  avatar_url TEXT,
  class_info TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT
      p.id,
      p.full_name,
      p.school_name,
      p.avatar_url,
      COALESCE(c.name, 'Chưa có lớp') as class_info
    FROM public.profiles p
    LEFT JOIN public.class_members cm ON cm.student_id = p.id
    LEFT JOIN public.classes c ON c.id = cm.class_id
    WHERE p.student_code = UPPER(TRIM(input_code))
      AND p.role = 'student';
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_student_by_code TO authenticated;


-- ━━━ BƯỚC 7: TRIGGERS BẮN THÔNG BÁO TỰ ĐỘNG CHO PHỤ HUYNH ━━━

-- Trigger 1: Thông báo khi con hoàn thành bài học
CREATE OR REPLACE FUNCTION notify_parents_on_lesson_complete()
RETURNS TRIGGER AS $$
DECLARE parent_rec RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    FOR parent_rec IN
      SELECT psl.parent_id, p.full_name as student_name
      FROM public.parent_student_links psl
      JOIN public.profiles p ON p.id = NEW.student_id
      WHERE psl.student_id = NEW.student_id AND psl.status = 'active'
    LOOP
      INSERT INTO public.notifications
        (user_id, type, title, body, data, action_url)
      VALUES (
        parent_rec.parent_id,
        'lesson_completed',
        '📖 Con bạn hoàn thành bài học',
        parent_rec.student_name || ' vừa hoàn thành 1 bài học mới',
        jsonb_build_object('student_id', NEW.student_id, 'lesson_id', NEW.lesson_id),
        '/parent/children/' || NEW.student_id::text
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lesson_completed ON public.lesson_progress;
CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION notify_parents_on_lesson_complete();

-- Trigger 2: Thông báo điểm thi
CREATE OR REPLACE FUNCTION notify_parents_on_quiz_graded()
RETURNS TRIGGER AS $$
DECLARE parent_rec RECORD;
BEGIN
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    FOR parent_rec IN
      SELECT psl.parent_id, p.full_name as student_name
      FROM public.parent_student_links psl
      JOIN public.profiles p ON p.id = NEW.student_id
      WHERE psl.student_id = NEW.student_id AND psl.status = 'active'
    LOOP
      INSERT INTO public.notifications
        (user_id, type, title, body, data, action_url)
      VALUES (
        parent_rec.parent_id,
        CASE WHEN NEW.score < 50 THEN 'child_low_score' ELSE 'quiz_graded' END,
        CASE WHEN NEW.score < 50
          THEN '⚠️ Con bạn có điểm thấp: ' || ROUND(NEW.score) || '/' || NEW.max_score
          ELSE '✅ Kết quả bài thi: ' || ROUND(NEW.score) || '/' || NEW.max_score
        END,
        parent_rec.student_name || ' ' ||
        CASE WHEN NEW.score < 50 THEN 'chỉ đạt ' ELSE 'đạt ' END ||
        ROUND(NEW.score) || ' điểm trong bài "' || NEW.quiz_title || '"',
        jsonb_build_object(
          'student_id', NEW.student_id,
          'attempt_id', NEW.id,
          'score', NEW.score,
          'quiz_title', NEW.quiz_title
        ),
        '/parent/children/' || NEW.student_id::text
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_graded ON public.quiz_attempts;
CREATE TRIGGER on_quiz_graded
  AFTER INSERT OR UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION notify_parents_on_quiz_graded();


-- ━━━ BƯỚC 8: ENABLE REALTIME CHO CÁC BẢNG LIÊN QUAN ━━━
-- Bật realtime cho lesson_progress, quiz_attempts, profiles, notifications, parent_student_links
-- (Lưu ý: Dòng lệnh ALTER PUBLICATION an toàn khi chạy trong local migration)
DO $$
BEGIN
  -- Thêm tables vào realtime publication nếu publication tồn tại
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_student_links;
  END IF;
END $$;
