-- Fix: Cho phép học sinh tìm lớp theo mã code để join
-- Tạo SECURITY DEFINER function (bypass RLS) để lookup class by code an toàn

CREATE OR REPLACE FUNCTION public.fn_lookup_class_by_code(p_code TEXT)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id, name FROM public.classes WHERE code = p_code;
$$;

NOTIFY pgrst, 'reload schema';
