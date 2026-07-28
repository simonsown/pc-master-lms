-- ==========================================
-- COURSE PRICING & PURCHASE SYSTEM
-- ==========================================

-- Add pricing columns to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_vnd INT DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS free_lesson_count INT DEFAULT 3;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS discount_price_vnd INT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS discount_end_at TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_lessons INT DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_hours INT DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS student_count INT DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'vi';

-- Course purchases table
CREATE TABLE IF NOT EXISTS public.course_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Course reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- RLS
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_purchases" ON public.course_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_purchases" ON public.course_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "view_reviews" ON public.course_reviews
  FOR SELECT USING (true);

CREATE POLICY "insert_own_reviews" ON public.course_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if user has purchased course
CREATE OR REPLACE FUNCTION public.has_purchased_course(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.course_purchases
    WHERE user_id = p_user_id AND course_id = p_course_id AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if lesson is unlocked for user
CREATE OR REPLACE FUNCTION public.is_lesson_unlocked(p_user_id UUID, p_lesson_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_course_id UUID;
  v_lesson_order INT;
  v_free_count INT;
  v_has_purchased BOOLEAN;
BEGIN
  -- Get course info
  SELECT c.id, c.free_lesson_count INTO v_course_id, v_free_count
  FROM public.courses c
  JOIN public.lessons l ON l.course_id = c.id
  WHERE l.id = p_lesson_id;

  IF v_course_id IS NULL THEN RETURN true; END IF;

  -- Get lesson order in course
  SELECT COUNT(*) INTO v_lesson_order
  FROM public.lessons
  WHERE course_id = v_course_id AND created_at <= (
    SELECT created_at FROM public.lessons WHERE id = p_lesson_id
  );

  -- First N lessons are free
  IF v_lesson_order <= v_free_count THEN RETURN true; END IF;

  -- Check purchase
  SELECT EXISTS (
    SELECT 1 FROM public.course_purchases
    WHERE user_id = p_user_id AND course_id = v_course_id AND status = 'completed'
  ) INTO v_has_purchased;

  RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
