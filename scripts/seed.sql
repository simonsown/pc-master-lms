-- ============================================
-- SEED: Cập nhật Level Definitions
-- ============================================
UPDATE level_definitions SET title = 'Tân Thủ', icon = '🌱' WHERE level = 1;
UPDATE level_definitions SET title = 'Người Học Việc', icon = '🔧' WHERE level = 2;
UPDATE level_definitions SET title = 'Học Sinh Chăm Chỉ', icon = '📚' WHERE level = 3;
UPDATE level_definitions SET title = 'Người Hiểu Biết', icon = '💡' WHERE level = 4;
UPDATE level_definitions SET title = 'Thợ Lắp Ráp Tập Sự', icon = '🔩' WHERE level = 5;
UPDATE level_definitions SET title = 'Kỹ Thuật Viên', icon = '🛠️' WHERE level = 6;
UPDATE level_definitions SET title = 'Chuyên Gia PC', icon = '💻' WHERE level = 7;
UPDATE level_definitions SET title = 'Kỹ Sư Xây Dựng', icon = '⚙️' WHERE level = 8;
UPDATE level_definitions SET title = 'Kiến Trúc Sư Hệ Thống', icon = '🏗️' WHERE level = 9;
UPDATE level_definitions SET title = 'Bậc Thầy PC', icon = '👑' WHERE level = 10;
UPDATE level_definitions SET title = 'Huyền Thoại', icon = '🌟' WHERE level = 11;
UPDATE level_definitions SET title = 'Solo Leveling', icon = '⚡' WHERE level = 12;
UPDATE level_definitions SET title = 'Rảnh Thẻ Săn Hàng S', icon = '🎯' WHERE level = 13;
UPDATE level_definitions SET title = 'Chúa Tể Bóng Tối', icon = '🗡️' WHERE level = 14;
UPDATE level_definitions SET title = 'Quốc Vương', icon = '👑' WHERE level = 15;
UPDATE level_definitions SET title = 'Thần', icon = '✨' WHERE level = 16;
UPDATE level_definitions SET title = 'Vinh Hằng', icon = '♾️' WHERE level = 17;
UPDATE level_definitions SET title = 'Hủy Diệt', icon = '💀' WHERE level = 18;
UPDATE level_definitions SET title = 'Siêu Việt', icon = '🔱' WHERE level = 19;
UPDATE level_definitions SET title = 'Bất Tử', icon = '🪄' WHERE level = 20;

-- ============================================
-- SEED: Daily Quests
-- ============================================
INSERT INTO daily_quests (title, description, xp_reward, type, difficulty, icon, requirement_type, requirement_value, is_active)
SELECT * FROM (VALUES
  ('Hoàn thành 1 bài học', 'Xem hết 1 bài giảng bất kỳ', 50, 'daily', 'easy', '📚', 'complete_lesson', 1, true),
  ('Lắp ráp PC hoàn chỉnh', 'Lắp đầy đủ linh kiện trong PC Builder', 80, 'daily', 'medium', '🔧', 'build_pc', 1, true),
  ('Làm bài trắc nghiệm', 'Hoàn thành 1 bài quiz bất kỳ', 30, 'daily', 'easy', '🧠', 'complete_quiz', 1, true),
  ('Tham gia thảo luận', 'Đặt câu hỏi hoặc trả lời trong diễn đàn', 20, 'daily', 'easy', '💬', 'discuss', 1, true),
  ('Đạt streak 3 ngày', 'Học liên tiếp 3 ngày không bỏ lỡ', 150, 'daily', 'hard', '🔥', 'streak', 3, true),
  ('Kiểm tra tương thích', 'Chạy kiểm tra tương thích cho 1 cấu hình PC', 40, 'daily', 'medium', '✅', 'compatibility_check', 1, true),
  ('Hoàn thành 3 bài học', 'Học liên tục 3 bài giảng trong ngày', 120, 'daily', 'hard', '📚', 'complete_lesson', 3, true),
  ('Luyện tập 15 phút', 'Dành 15 phút trong PC Builder', 60, 'daily', 'medium', '⏱️', 'study_time', 15, true)
) AS q(title, description, xp_reward, type, difficulty, icon, requirement_type, requirement_value, is_active)
WHERE NOT EXISTS (SELECT 1 FROM daily_quests LIMIT 1);

-- ============================================
-- Verify
-- ============================================
SELECT COUNT(*) AS quest_count FROM daily_quests;
SELECT level, title, icon FROM level_definitions ORDER BY level;
