-- =======================================================
-- SAMPLE PROGRESS SEED DATA FOR TESTING PROGRESS VIEW
-- Run this in the Supabase SQL Editor
-- =======================================================

-- 1. Insert sample lessons if they do not exist
INSERT INTO public.lessons (id, title, content, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Bài 1: Giới thiệu phần cứng Máy tính', 'Nội dung lý thuyết về các bộ phận cơ bản của PC...', NOW() - INTERVAL '15 days'),
  ('22222222-2222-2222-2222-222222222222', 'Bài 2: Thực hành Lắp ráp CPU', 'Lab hướng dẫn lắp CPU vào socket trên Mainboard...', NOW() - INTERVAL '10 days'),
  ('33333333-3333-3333-3333-333333333333', 'Bài 3: Bo mạch chủ (Mainboard)', 'Chi tiết kiến thức về chipsets, các khe cắm mở rộng...', NOW() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444444', 'Quiz: Phần cứng cơ bản', 'Bài kiểm tra tổng hợp kiến thức từ bài 1 đến bài 3...', NOW() - INTERVAL '3 days'),
  ('55555555-5555-5555-5555-555555555555', 'Bài 5: Lắp ráp RAM và Tản nhiệt', 'Lab hướng dẫn lắp thanh RAM và tra keo tản nhiệt...', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample quizzes if they do not exist
INSERT INTO public.quizzes (id, lesson_id, title, passing_score, created_at)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '44444444-4444-4444-4444-444444444444', 'Quiz: Tổng quan phần cứng', 70, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert mock progress data for the CURRENT LOGGED-IN USER
-- Note: Replace 'YOUR_USER_UUID' with the actual user id if running manually, 
-- or use the query below which automatically targets all profiles as sample data.

DO $$
DECLARE
    user_rec RECORD;
BEGIN
    FOR user_rec IN SELECT id FROM public.profiles LOOP
        
        -- Lesson 1: Completed 12 days ago
        INSERT INTO public.lesson_progress (student_id, lesson_id, status, completion_percentage, time_spent_seconds, last_accessed, completed_at)
        VALUES (
            user_rec.id, 
            '11111111-1111-1111-1111-111111111111', 
            'completed', 
            100, 
            3600, -- 1 hour
            NOW() - INTERVAL '12 days', 
            NOW() - INTERVAL '12 days'
        ) ON CONFLICT (student_id, lesson_id) DO UPDATE 
        SET status = 'completed', completion_percentage = 100, completed_at = NOW() - INTERVAL '12 days';

        -- Lesson 2: Completed 10 days ago
        INSERT INTO public.lesson_progress (student_id, lesson_id, status, completion_percentage, time_spent_seconds, last_accessed, completed_at)
        VALUES (
            user_rec.id, 
            '22222222-2222-2222-2222-222222222222', 
            'completed', 
            100, 
            4200, -- 1.16 hours
            NOW() - INTERVAL '10 days', 
            NOW() - INTERVAL '10 days'
        ) ON CONFLICT (student_id, lesson_id) DO UPDATE 
        SET status = 'completed', completion_percentage = 100, completed_at = NOW() - INTERVAL '10 days';

        -- Lesson 3: In progress
        INSERT INTO public.lesson_progress (student_id, lesson_id, status, completion_percentage, time_spent_seconds, last_accessed, completed_at)
        VALUES (
            user_rec.id, 
            '33333333-3333-3333-3333-333333333333', 
            'in_progress', 
            45, 
            1800, 
            NOW() - INTERVAL '2 days', 
            NULL
        ) ON CONFLICT (student_id, lesson_id) DO UPDATE 
        SET status = 'in_progress', completion_percentage = 45;

        -- Quiz Attempt
        INSERT INTO public.quiz_attempts (quiz_id, student_id, started_at, submitted_at, score, status)
        VALUES (
            'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
            user_rec.id,
            NOW() - INTERVAL '3 days 1 hour',
            NOW() - INTERVAL '3 days',
            85, -- 85 score
            'submitted' -- matches CHECK constraints or standard submitted status
        );

        -- Builder Lab Sessions (Past 3 months heatmap simulation)
        -- Session 1: 5 days ago (45 minutes)
        INSERT INTO public.builder_sessions (student_id, lesson_id, started_at, ended_at, compatibility_score)
        VALUES (
            user_rec.id, 
            '22222222-2222-2222-2222-222222222222', 
            NOW() - INTERVAL '5 days 45 minutes', 
            NOW() - INTERVAL '5 days', 
            95
        );

        -- Session 2: 3 days ago (75 minutes)
        INSERT INTO public.builder_sessions (student_id, lesson_id, started_at, ended_at, compatibility_score)
        VALUES (
            user_rec.id, 
            '22222222-2222-2222-2222-222222222222', 
            NOW() - INTERVAL '3 days 75 minutes', 
            NOW() - INTERVAL '3 days', 
            100
        );

        -- Session 3: Today (20 minutes)
        INSERT INTO public.builder_sessions (student_id, lesson_id, started_at, ended_at, compatibility_score)
        VALUES (
            user_rec.id, 
            '55555555-5555-5555-5555-555555555555', 
            NOW() - INTERVAL '20 minutes', 
            NOW(), 
            90
        );

    END LOOP;
END $$;
