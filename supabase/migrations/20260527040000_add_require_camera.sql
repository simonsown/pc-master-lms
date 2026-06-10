ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS require_camera BOOLEAN DEFAULT false;
