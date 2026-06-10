-- ==========================================
-- 1. BẢNG TIẾN ĐỘ HỌC TẬP (Đã có, chạy lại cũng không sao vì dùng IF NOT EXISTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- 2. BẢNG BÌNH LUẬN BÀI GIẢNG (Mới)
-- ==========================================
CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bật Row Level Security (RLS) cho comments
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

-- Cho phép ai cũng được đọc bình luận
CREATE POLICY "Cho phép mọi người đọc bình luận" ON lesson_comments
  FOR SELECT USING (true);

-- Cho phép người dùng đăng nhập được viết bình luận
CREATE POLICY "Cho phép user đăng nhập tạo bình luận" ON lesson_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cho phép người dùng xóa bình luận của chính mình
CREATE POLICY "Cho phép user xóa bình luận của mình" ON lesson_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. BẢNG THÔNG BÁO TỪ GIÁO VIÊN (Mới)
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  is_global BOOLEAN DEFAULT true, -- Nếu true, tất cả học sinh đều thấy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bật Row Level Security (RLS) cho notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người đọc thông báo
CREATE POLICY "Cho phép mọi người đọc thông báo" ON notifications
  FOR SELECT USING (true);
