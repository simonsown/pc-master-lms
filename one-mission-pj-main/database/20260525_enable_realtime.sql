-- ═══ BẬT REALTIME CHO CÁC BẢNG ═══

-- Bảng profiles (dùng cho leaderboard, online status)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;

-- Bảng messages cho discussion (nếu dùng postgres_changes)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS discussion_messages;

-- Bảng quiz_attempts (dùng cho dashboard realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS quiz_attempts;

-- Bảng lesson_progress (dùng cho dashboard realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS lesson_progress;
