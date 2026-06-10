-- Bảng discussion_messages cho realtime chat
CREATE TABLE IF NOT EXISTS public.discussion_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'global' CHECK (channel IN ('global', 'class')),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN DROP POLICY IF EXISTS "view_messages" ON public.discussion_messages; EXCEPTION WHEN OTHERS THEN RAISE NOTICE '%', SQLERRM; END; $$;
CREATE POLICY "view_messages" ON public.discussion_messages
  FOR SELECT USING (true);
DO $$ BEGIN DROP POLICY IF EXISTS "insert_messages" ON public.discussion_messages; EXCEPTION WHEN OTHERS THEN RAISE NOTICE '%', SQLERRM; END; $$;
CREATE POLICY "insert_messages" ON public.discussion_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Bảng certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  verify_url TEXT,
  student_name TEXT,
  course_title TEXT,
  completion_date DATE DEFAULT CURRENT_DATE,
  final_score NUMERIC(5,2),
  is_revoked BOOLEAN DEFAULT FALSE
);

-- Function to generate safe, random certificate number
CREATE OR REPLACE FUNCTION generate_cert_number()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'PCM-2026-';
  i INT;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "view_all_certificates" ON public.certificates;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'view_all_certificates drop: %', SQLERRM;
END;
$$;

CREATE POLICY "view_all_certificates" ON public.certificates
  FOR SELECT USING (true);

DO $$
BEGIN
  DROP POLICY IF EXISTS "manage_certificates" ON public.certificates;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'manage_certificates drop: %', SQLERRM;
END;
$$;

CREATE POLICY "manage_certificates" ON public.certificates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Bật realtime cho tất cả bảng mới
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE discussion_messages;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'discussion_messages already in publication';
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE certificates;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'certificates already in publication';
END;
$$;
