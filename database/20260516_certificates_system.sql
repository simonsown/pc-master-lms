-- 1. Bảng Chứng chỉ (Certificates)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_name TEXT NOT NULL,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT, -- Link đến file PDF hoặc trang web xác minh
    verification_code TEXT UNIQUE NOT NULL
);

-- RLS cho certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = student_id);

-- 2. Cập nhật cột Onboarded cho Profile (nếu command trước chưa chạy)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;
