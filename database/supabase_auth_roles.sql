-- 1. Bảng schools
CREATE TABLE public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  code TEXT UNIQUE NOT NULL, -- mã trường 6 ký tự
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng profiles (mở rộng từ auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  avatar_url TEXT,
  phone TEXT,
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Liên kết phụ huynh - học sinh
CREATE TABLE public.parent_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id),
  student_id UUID REFERENCES public.profiles(id),
  relationship TEXT DEFAULT 'parent', -- 'parent', 'guardian'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 4. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Mỗi user chỉ đọc được profile của mình
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin đọc tất cả profile
CREATE POLICY "Admin read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users tự update profile của mình
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public schools
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);

-- Phụ huynh xem con của mình
CREATE POLICY "Parents view own children links" ON public.parent_student_links
  FOR SELECT USING (parent_id = auth.uid());

-- Học sinh xem phụ huynh của mình
CREATE POLICY "Students view own parent links" ON public.parent_student_links
  FOR SELECT USING (student_id = auth.uid());

-- 5. Trigger tự tạo profile khi đăng ký (Dùng raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Xoá trigger nếu tồn tại trước khi tạo mới để tránh lỗi
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
