-- Script tạo sample data cho trang Tiến Độ Học Tập (/student/progress)
-- THAY THẾ `<student_uuid_here>` bằng ID thực tế của bạn từ bảng auth.users

DO $$ 
DECLARE
  student_uid UUID := '00000000-0000-0000-0000-000000000000'; -- Điền ID thực tế vào đây!
BEGIN

  -- 1. Xóa dữ liệu mẫu cũ (nếu có)
  DELETE FROM builder_sessions WHERE student_id = student_uid;
  DELETE FROM quiz_attempts WHERE student_id = student_uid;
  DELETE FROM lesson_progress WHERE student_id = student_uid;

  -- 2. Thêm dữ liệu lesson_progress (30 ngày gần đây)
  FOR i IN 1..25 LOOP
    INSERT INTO lesson_progress (student_id, lesson_id, status, completion_percentage, time_spent_seconds, last_accessed, completed_at)
    VALUES (
      student_uid, 
      gen_random_uuid(), -- Mock lesson ID
      CASE WHEN i <= 15 THEN 'completed' WHEN i <= 20 THEN 'in_progress' ELSE 'not_started' END,
      CASE WHEN i <= 15 THEN 100 WHEN i <= 20 THEN (i * 5) ELSE 0 END,
      CASE WHEN i <= 15 THEN 1200 + (i * 60) WHEN i <= 20 THEN 300 ELSE 0 END,
      NOW() - (i || ' days')::INTERVAL,
      CASE WHEN i <= 15 THEN NOW() - (i || ' days')::INTERVAL ELSE NULL END
    );
  END LOOP;

  -- 3. Thêm dữ liệu quiz_attempts
  FOR i IN 1..5 LOOP
    INSERT INTO quiz_attempts (id, student_id, quiz_id, status, score, created_at)
    VALUES (
      gen_random_uuid(),
      student_uid,
      gen_random_uuid(),
      'graded',
      (60 + (i * 8)), -- Điểm: 68, 76, 84, 92, 100
      NOW() - (i * 2 || ' days')::INTERVAL
    );
  END LOOP;

  -- 4. Thêm dữ liệu builder_sessions (Heatmap 90 ngày)
  FOR i IN 1..40 LOOP
    INSERT INTO builder_sessions (student_id, started_at, ended_at, components_used, tdp_calculated, compatibility_score)
    VALUES (
      student_uid,
      NOW() - (i * 2 || ' days')::INTERVAL,
      (NOW() - (i * 2 || ' days')::INTERVAL) + ((10 + (i % 50)) || ' minutes')::INTERVAL,
      '[]'::jsonb,
      350.5,
      100
    );
  END LOOP;

END $$;
