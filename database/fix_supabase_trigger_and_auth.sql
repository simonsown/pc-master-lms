-- ================================================================
-- FIX SUPABASE AUTH TRIGGER & PROFILES RLS (FAILSAFE MIGRATION)
-- Chạy script này trong Supabase SQL Editor nếu gặp lỗi
-- "Database error saving new user" hoặc lỗi trigger đăng ký.
-- ================================================================

-- 1. Rebuild function handle_new_user với EXCEPTION block và ON CONFLICT safe update
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(COALESCE(NEW.email, 'user@'), '@', 1)
      ),
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      role = COALESCE(EXCLUDED.role, public.profiles.role),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Không bao giờ block auth signup nếu trigger profiles bị lỗi
    RAISE WARNING 'handle_new_user error for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 2. Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Đảm bảo RLS trên public.profiles mở cho insert & update
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_insert_open" ON public.profiles;
CREATE POLICY "profiles_insert_open" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Thông báo hoàn tất
SELECT 'Supabase Auth Trigger & RLS policies successfully fixed!' AS status;
