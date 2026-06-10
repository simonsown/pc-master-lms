-- ==========================================
-- PROFILE EXTENSION & USER PREFERENCES SETUP
-- ==========================================

-- 1. Extend profiles table safely (RULE 1)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  show_profile_public BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  language TEXT DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Preferences Policy
DROP POLICY IF EXISTS "own_preferences" ON public.user_preferences;
CREATE POLICY "own_preferences" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid());

-- 3. Storage Avatars policy setup (RULE 2)
-- Make sure the bucket 'avatars' is created under storage.buckets first.
-- This policy allows users to only upload inside their own folder.
-- Note: Create policy on storage.objects:
-- CREATE POLICY "own_avatar" ON storage.objects
--   FOR ALL USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
