-- ==========================================
-- LEARNING PATH & PROGRESSIVE UNLOCKING SETUP
-- ==========================================

CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.path_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('lesson','quiz','lab_session','milestone')),
  item_id UUID,           -- Nullable if milestone
  title TEXT NOT NULL,    
  description TEXT,
  "order" INT NOT NULL,
  unlock_condition JSONB,
  estimated_minutes INT,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, "order")
);

-- PostgreSQL Function to calculate unlock states server-side
CREATE OR REPLACE FUNCTION public.get_unlocked_items(
  p_student_id UUID,
  p_path_id UUID
) RETURNS TABLE (
  id UUID,
  item_id UUID,
  is_unlocked BOOLEAN,
  unlock_reason TEXT
) AS $$
DECLARE
  item RECORD;
  cond JSONB;
  cond_type TEXT;
  cond_item_id UUID;
  min_sc NUMERIC;
  prev_completed BOOLEAN;
  quiz_passed BOOLEAN;
BEGIN
  FOR item IN
    SELECT * FROM public.path_items WHERE path_id = p_path_id ORDER BY "order"
  LOOP
    cond := item.unlock_condition;
    is_unlocked := TRUE;
    unlock_reason := 'always_available';

    IF cond IS NOT NULL THEN
      cond_type := cond->>'type';

      -- 1. Complete previous item
      IF cond_type = 'complete_previous' THEN
        SELECT EXISTS (
          SELECT 1 FROM public.lesson_progress lp
          JOIN public.path_items pi ON pi.item_id = lp.lesson_id
          WHERE lp.student_id = p_student_id
            AND lp.status = 'completed'
            AND pi.path_id = p_path_id
            AND pi.order = item.order - 1
        ) INTO prev_completed;

        IF NOT prev_completed THEN
          is_unlocked := FALSE;
          unlock_reason := 'need_complete_previous';
        END IF;

      -- 2. Score quiz above threshold
      ELSIF cond_type = 'score_above' THEN
        cond_item_id := (cond->>'item_id')::UUID;
        min_sc := (cond->>'min_score')::NUMERIC;

        SELECT EXISTS (
          SELECT 1 FROM public.quiz_attempts
          WHERE student_id = p_student_id
            AND quiz_id = cond_item_id
            AND score >= min_sc
            AND status = 'submitted'
        ) INTO quiz_passed;

        IF NOT quiz_passed THEN
          is_unlocked := FALSE;
          unlock_reason := 'need_quiz_score_above_' || min_sc::TEXT;
        END IF;
      END IF;
    END IF;

    id := item.id;
    item_id := item.item_id;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Enable
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_paths" ON public.learning_paths FOR SELECT USING (true);
CREATE POLICY "manage_paths" ON public.learning_paths FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

CREATE POLICY "view_path_items" ON public.path_items FOR SELECT USING (true);
CREATE POLICY "manage_path_items" ON public.path_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
