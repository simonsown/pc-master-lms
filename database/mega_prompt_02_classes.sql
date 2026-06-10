-- 1. Bảng lớp học
CREATE TABLE public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,               -- "Lớp 10A1 - Tin học"
  code TEXT UNIQUE NOT NULL,        -- "TIN001" (6 ký tự, tự sinh)
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  grade TEXT NOT NULL,              -- "10", "11", "12"
  school_year TEXT NOT NULL,        -- "2025-2026"
  subject TEXT DEFAULT 'Tin học',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  max_students INTEGER DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Thành viên lớp học
CREATE TABLE public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'left')),
  UNIQUE(class_id, student_id)
);

-- 3. Nhiệm vụ (assignments)
CREATE TABLE public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'build_config',      -- Lắp ráp PC theo yêu cầu
    'optimize_budget',   -- Tối ưu trong ngân sách X
    'minimize_tdp',      -- Giảm TDP xuống dưới Y watt
    'maximize_perf',     -- Tối đa hiệu năng
    'quiz',              -- Trắc nghiệm lý thuyết
    'mixed'              -- Kết hợp
  )),
  requirements JSONB NOT NULL DEFAULT '{}',
  max_score INTEGER DEFAULT 100,
  deadline TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  allow_late_submit BOOLEAN DEFAULT FALSE,
  late_penalty_percent INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bài nộp
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id),
  class_id UUID REFERENCES public.classes(id),
  pc_config JSONB,
  total_score INTEGER,
  auto_score INTEGER,           -- Điểm tính tự động từ requirements
  teacher_score INTEGER,        -- Điểm giáo viên chấm thêm
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

-- 5. RLS Policies
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Teacher chỉ thấy lớp của mình
CREATE POLICY "Teacher sees own classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid());

-- Student thấy lớp mình tham gia
CREATE POLICY "Student sees enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM class_members WHERE class_id = id AND student_id = auth.uid())
  );

-- Teacher thấy tất cả class_members trong lớp của mình
CREATE POLICY "Teacher sees own class members" ON public.class_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
  );

-- Student tự tạo member (join class) và xem member của mình
CREATE POLICY "Student sees own member status" ON public.class_members
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Student can join class" ON public.class_members
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Student chỉ thấy bài nộp của mình
CREATE POLICY "Student sees own submissions" ON public.submissions
  FOR ALL USING (student_id = auth.uid());

-- Teacher thấy tất cả submission trong lớp của mình
CREATE POLICY "Teacher sees class submissions" ON public.submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
  );

-- Teacher thấy bài tập của lớp mình, cập nhật bài tập
CREATE POLICY "Teacher manages assignments" ON public.assignments
  FOR ALL USING (teacher_id = auth.uid());

-- Student thấy bài tập của lớp mình đang tham gia
CREATE POLICY "Student sees published assignments" ON public.assignments
  FOR SELECT USING (
    is_published = TRUE AND 
    EXISTS (SELECT 1 FROM class_members WHERE class_id = assignments.class_id AND student_id = auth.uid())
  );
