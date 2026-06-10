-- =======================================================
-- THÊM CỘT NGUỒN (SOURCE) CHO LESSON_SECTIONS
-- THÊM VIDEO CPU I GỐC VÀO BÀI 2
-- Chạy trong Supabase SQL Editor
-- =======================================================

-- 1. Thêm cột source (nguồn tham khảo) nếu chưa có
ALTER TABLE public.lesson_sections 
ADD COLUMN IF NOT EXISTS source TEXT;

-- 2. Cập nhật nguồn cho các section hiện có (nếu có dữ liệu)
UPDATE public.lesson_sections 
SET source = 'Sách giáo khoa Tin học 10 - Kết nối tri thức, Bài 2'
WHERE lesson_id IN (SELECT id FROM public.lessons WHERE title LIKE '%CPU%' OR title LIKE '%Lắp ráp CPU%')
AND (source IS NULL OR source = '');

UPDATE public.lesson_sections 
SET source = 'Intel ARK Database & Tài liệu kỹ thuật'
WHERE lesson_id IN (SELECT id FROM public.lessons WHERE title LIKE '%CPU%' OR title LIKE '%Bộ vi xử lý%')
AND (source IS NULL OR source = '');

-- 3. Thêm section video CPU Intel Core i vào Bài 2 (Thực hành Lắp ráp CPU)
-- Nếu bài 2 chưa có section video CPU
DO $$
DECLARE
    lesson2_id UUID;
    existing_count INT;
BEGIN
    SELECT id INTO lesson2_id FROM public.lessons 
    WHERE title LIKE '%Lắp ráp CPU%' OR title LIKE '%CPU%' 
    LIMIT 1;

    IF lesson2_id IS NOT NULL THEN
        SELECT COUNT(*) INTO existing_count 
        FROM public.lesson_sections 
        WHERE lesson_id = lesson2_id AND title LIKE '%Intel Core%';

        IF existing_count = 0 THEN
            INSERT INTO public.lesson_sections (lesson_id, title, type, content, order_index, source)
            VALUES (
                lesson2_id,
                'Video: CPU Intel Core i thế hệ mới nhất',
                'video',
                'https://www.youtube.com/watch?v=6PAh4WYIqJY',
                0,
                'Intel Official - YouTube Channel'
            );
        END IF;
    END IF;
END $$;

-- 4. Cập nhật nguồn cho tất cả các section khác
UPDATE public.lesson_sections 
SET source = 'Sách giáo khoa Tin học 10 - Kết nối tri thức'
WHERE source IS NULL OR source = '';
