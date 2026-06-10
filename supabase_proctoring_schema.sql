-- Bảng lưu trữ nhật ký giám sát thi cử
CREATE TABLE IF NOT EXISTS public.exam_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'tab_switch', 'snapshot', 'fullscreen_exit', 'identity_verify'
    event_data TEXT, -- Lưu URL ảnh snapshot hoặc thông tin chi tiết
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cho phép học sinh thêm log nhưng không được sửa/xóa
ALTER TABLE public.exam_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own logs" ON public.exam_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can view all logs" ON public.exam_logs FOR SELECT USING (true);
