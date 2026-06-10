-- ==========================================
-- CERTIFICATES DATABASE SETUP
-- ==========================================

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

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_all_certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "manage_certificates" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
