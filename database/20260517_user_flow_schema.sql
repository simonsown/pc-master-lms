-- Supabase SQL Migration: User Flow & Progress Tracking

-- 1. Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student','teacher')) NOT NULL,
  avatar_url TEXT,
  class_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lessons Table (if not exists)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  course_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DROP OLD TABLES TO AVOID COLUMN CONFLICTS
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS builder_sessions CASCADE;

-- 3. Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT DEFAULT 'not_started',
  completion_percentage INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- 4. Builder Lab Sessions
CREATE TABLE IF NOT EXISTS builder_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  components_used JSONB,
  tdp_calculated NUMERIC,
  compatibility_score INT
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_sessions ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Lesson Progress Policies
CREATE POLICY "student_own_progress" ON lesson_progress
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "teacher_view_class" ON lesson_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Builder Sessions Policies
CREATE POLICY "student_own_sessions" ON builder_sessions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "teacher_view_sessions" ON builder_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );
