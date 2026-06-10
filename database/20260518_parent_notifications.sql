-- ==================================================================
-- PROMPT 4 · PC MASTER LMS — PARENT NOTIFICATIONS & TRIGGERS
-- Target Path: database/20260518_parent_notifications.sql
-- ==================================================================

-- ━━━ BƯỚC 1: CẬP NHẬT USER PREFERENCES ĐỂ HỖ TRỢ OPT-OUT ━━━
-- Thêm cột notification_settings (JSONB) cho bảng user_preferences
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS notification_settings JSONB 
  DEFAULT '{"child_absent": true, "child_low_score": true, "child_completed_path": true, "lesson_completed": true, "quiz_graded": true, "achievement_earned": true}'::jsonb;

-- Tạo bảng lưu trữ thông tin cooldown gửi email
CREATE TABLE IF NOT EXISTS public.parent_email_cooldown (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id, notification_type)
);

-- Bật RLS cho bảng cooldown
ALTER TABLE public.parent_email_cooldown ENABLE ROW LEVEL SECURITY;

-- Cooldown Policy
DROP POLICY IF EXISTS "system_all_cooldown" ON public.parent_email_cooldown;
CREATE POLICY "system_all_cooldown" ON public.parent_email_cooldown
  FOR ALL USING (true);


-- ━━━ BƯỚC 2: TRIGGER KHI HỌC SINH HOÀN THÀNH BÀI HỌC ━━━
CREATE OR REPLACE FUNCTION notify_parent_on_lesson_complete()
RETURNS TRIGGER AS $$
DECLARE
  parent_rec RECORD;
  lesson_rec RECORD;
  pref_val BOOLEAN;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Lấy tên bài học
    SELECT title INTO lesson_rec FROM lessons WHERE id = NEW.lesson_id;

    -- Tìm tất cả phụ huynh đang theo dõi học sinh này
    FOR parent_rec IN
      SELECT psl.parent_id, up.notification_settings
      FROM parent_student_links psl
      LEFT JOIN user_preferences up ON up.user_id = psl.parent_id
      WHERE psl.student_id = NEW.student_id AND psl.status = 'active'
    LOOP
      -- Check opt-out setting
      pref_val := TRUE;
      IF parent_rec.notification_settings IS NOT NULL AND parent_rec.notification_settings ? 'lesson_completed' THEN
        pref_val := (parent_rec.notification_settings->>'lesson_completed')::boolean;
      END IF;

      IF pref_val THEN
        INSERT INTO notifications (user_id, type, title, body, data, action_url)
        VALUES (
          parent_rec.parent_id,
          'lesson_completed',
          'Con bạn hoàn thành bài học 📖',
          'Con bạn vừa hoàn thành bài "' || COALESCE(lesson_rec.title, 'Bài học mới') || '"',
          jsonb_build_object(
            'student_id', NEW.student_id,
            'lesson_id', NEW.lesson_id
          ),
          '/parent/children/' || NEW.student_id
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lesson_completed ON lesson_progress;
CREATE TRIGGER on_lesson_completed
  AFTER UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION notify_parent_on_lesson_complete();


-- ━━━ BƯỚC 3: TRIGGER KHI CÓ KẾT QUẢ QUIZ ━━━
CREATE OR REPLACE FUNCTION notify_parent_on_quiz_result()
RETURNS TRIGGER AS $$
DECLARE
  parent_rec RECORD;
  quiz_rec RECORD;
  pref_val BOOLEAN;
  notif_type TEXT;
  notif_title TEXT;
BEGIN
  IF NEW.status = 'graded' THEN
    SELECT title INTO quiz_rec FROM quizzes WHERE id = NEW.quiz_id;
    
    -- Quyết định loại thông báo dựa trên điểm số
    IF NEW.score < 50 THEN
      notif_type := 'child_low_score';
      notif_title := '⚠️ Con bạn có điểm thấp';
    ELSE
      notif_type := 'quiz_graded';
      notif_title := '✅ Con bạn có kết quả mới';
    END IF;

    FOR parent_rec IN
      SELECT psl.parent_id, up.notification_settings
      FROM parent_student_links psl
      LEFT JOIN user_preferences up ON up.user_id = psl.parent_id
      WHERE psl.student_id = NEW.student_id AND psl.status = 'active'
    LOOP
      -- Check opt-out setting cho loại thông báo này
      pref_val := TRUE;
      IF parent_rec.notification_settings IS NOT NULL AND parent_rec.notification_settings ? notif_type THEN
        pref_val := (parent_rec.notification_settings->>notif_type)::boolean;
      END IF;

      IF pref_val THEN
        INSERT INTO notifications (user_id, type, title, body, data, action_url)
        VALUES (
          parent_rec.parent_id,
          notif_type,
          notif_title,
          'Kết quả "' || COALESCE(quiz_rec.title, 'Bài trắc nghiệm') || '": ' || ROUND(NEW.score) || '/100 điểm',
          jsonb_build_object(
            'student_id', NEW.student_id,
            'attempt_id', NEW.id,
            'score', NEW.score
          ),
          '/parent/children/' || NEW.student_id
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_graded ON quiz_attempts;
CREATE TRIGGER on_quiz_graded
  AFTER UPDATE ON quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION notify_parent_on_quiz_result();


-- ━━━ BƯỚC 4: TRIGGER KHI ĐẠT THÀNH TÍCH MỚI (CHAMPION) ━━━
CREATE OR REPLACE FUNCTION notify_parent_on_achievement_earned()
RETURNS TRIGGER AS $$
DECLARE
  parent_rec RECORD;
  ach_rec RECORD;
  pref_val BOOLEAN;
BEGIN
  -- Tìm tất cả phụ huynh đang theo dõi học sinh này
  FOR parent_rec IN
    SELECT psl.parent_id, up.notification_settings
    FROM parent_student_links psl
    LEFT JOIN user_preferences up ON up.user_id = psl.parent_id
    WHERE psl.student_id = NEW.student_id AND psl.status = 'active'
  LOOP
    -- Check opt-out setting
    pref_val := TRUE;
    IF parent_rec.notification_settings IS NOT NULL AND parent_rec.notification_settings ? 'achievement_earned' THEN
      pref_val := (parent_rec.notification_settings->>'achievement_earned')::boolean;
    END IF;

    IF pref_val THEN
      INSERT INTO notifications (user_id, type, title, body, data, action_url)
      VALUES (
        parent_rec.parent_id,
        'achievement_earned',
        'Con bạn đạt thành tích mới! 🏆',
        'Con bạn vừa xuất sắc mở khóa huy hiệu thành tích mới trong học tập.',
        jsonb_build_object(
          'student_id', NEW.student_id,
          'achievement_id', NEW.achievement_id
        ),
        '/parent/children/' || NEW.student_id
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_achievement_earned ON student_achievements;
CREATE TRIGGER on_achievement_earned
  AFTER INSERT ON student_achievements
  FOR EACH ROW EXECUTE FUNCTION notify_parent_on_achievement_earned();
