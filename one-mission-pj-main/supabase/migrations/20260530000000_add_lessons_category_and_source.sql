-- Add missing columns to lessons table for save functionality
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'extended';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS source_url TEXT;
