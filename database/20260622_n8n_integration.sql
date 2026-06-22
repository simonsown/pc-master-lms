-- ============================================
-- PC Master Builder - n8n Integration
-- Database Functions & Triggers
-- ============================================

-- ----------------------------------------
-- Function: check_completed_paths()
-- n8n calls this to find students who completed
-- all lessons in a path but have no certificate
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.check_completed_paths()
RETURNS TABLE (
  student_id UUID,
  path_id UUID,
  full_name TEXT,
  path_title TEXT,
  lesson_count INT,
  completed_count INT,
  avg_score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH path_stats AS (
    SELECT
      lp.student_id,
      pi.path_id,
      COUNT(DISTINCT pi.id)::INT AS total_lessons,
      COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'completed')::INT AS completed_lessons
    FROM path_items pi
    CROSS JOIN LATERAL (
      SELECT lp_in.student_id, lp_in.id, lp_in.status
      FROM lesson_progress lp_in
      WHERE lp_in.lesson_id = pi.item_id
        AND pi.item_type = 'lesson'
    ) lp
    GROUP BY lp.student_id, pi.path_id
    HAVING COUNT(DISTINCT pi.id) = COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'completed')
  )
  SELECT
    ps.student_id,
    ps.path_id,
    p.full_name,
    lp.title AS path_title,
    ps.total_lessons,
    ps.completed_lessons,
    COALESCE(
      (SELECT AVG(qa.score)::NUMERIC(5,2)
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = ps.student_id
         AND qa.status = 'submitted'
      ), 0
    ) AS avg_score
  FROM path_stats ps
  JOIN profiles p ON p.id = ps.student_id
  JOIN learning_paths lp ON lp.id = ps.path_id
  WHERE NOT EXISTS (
    SELECT 1 FROM certificates c
    WHERE c.student_id = ps.student_id
      AND c.path_id = ps.path_id
      AND c.is_revoked = false
  );
END;
$$;

-- ----------------------------------------
-- Function: get_students_low_performance()
-- n8n calls this for student alerts
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_students_low_performance()
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  email TEXT,
  class_id UUID,
  avg_score NUMERIC,
  recent_quiz_count INT,
  weakest_topic TEXT,
  last_active_date DATE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH recent_scores AS (
    SELECT
      qa.student_id,
      AVG(qa.score)::NUMERIC(5,2) AS avg_score,
      COUNT(qa.id)::INT AS quiz_count,
      MAX(qa.created_at)::DATE AS last_quiz_date
    FROM quiz_attempts qa
    WHERE qa.status = 'submitted'
      AND qa.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY qa.student_id
  ),
  weakest AS (
    SELECT DISTINCT ON (qa.student_id)
      qa.student_id,
      l.title AS weakest_lesson
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN lessons l ON l.id = q.lesson_id
    WHERE qa.status = 'submitted'
      AND qa.score < 40
      AND qa.created_at >= NOW() - INTERVAL '14 days'
    ORDER BY qa.student_id, qa.score ASC
  )
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.class_id,
    COALESCE(rs.avg_score, 0),
    COALESCE(rs.quiz_count, 0),
    COALESCE(w.weakest_lesson, 'Chua co du lieu'),
    p.last_quest_date
  FROM profiles p
  LEFT JOIN recent_scores rs ON rs.student_id = p.id
  LEFT JOIN weakest w ON w.student_id = p.id
  WHERE p.role = 'student'
    AND (
      rs.avg_score IS NOT NULL AND rs.avg_score < 50
    )
  ORDER BY rs.avg_score ASC NULLS LAST
  LIMIT 100;
END;
$$;

-- ----------------------------------------
-- Function: get_weekly_stats_summary()
-- n8n calls this for weekly reports
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_weekly_stats_summary()
RETURNS TABLE (
  metric TEXT,
  value BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  week_start TIMESTAMPTZ := DATE_TRUNC('week', NOW()) - INTERVAL '1 week';
  week_end TIMESTAMPTZ := DATE_TRUNC('week', NOW());
BEGIN
  RETURN QUERY
  SELECT 'active_students'::TEXT, COUNT(DISTINCT user_id)::BIGINT
  FROM activity_logs
  WHERE created_at >= week_start AND created_at < week_end

  UNION ALL
  SELECT 'new_lessons_completed'::TEXT, COUNT(*)::BIGINT
  FROM lesson_progress
  WHERE completed_at >= week_start AND completed_at < week_end
    AND status = 'completed'

  UNION ALL
  SELECT 'quizzes_submitted'::TEXT, COUNT(*)::BIGINT
  FROM quiz_attempts
  WHERE submitted_at >= week_start AND submitted_at < week_end
    AND status = 'submitted'

  UNION ALL
  SELECT 'certificates_issued'::TEXT, COUNT(*)::BIGINT
  FROM certificates
  WHERE issued_at >= week_start AND issued_at < week_end

  UNION ALL
  SELECT 'new_registrations'::TEXT, COUNT(*)::BIGINT
  FROM profiles
  WHERE created_at >= week_start AND created_at < week_end

  UNION ALL
  SELECT 'total_xp_earned'::TEXT, COALESCE(SUM(amount), 0)::BIGINT
  FROM xp_transactions
  WHERE created_at >= week_start AND created_at < week_end;
END;
$$;

-- ----------------------------------------
-- Function: get_student_weekly_summary()
-- For parent weekly reports - passes student_id
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_weekly_summary(
  p_student_id UUID
) RETURNS TABLE (
  completed_lessons INT,
  quiz_count INT,
  avg_score NUMERIC,
  total_xp_earned INT,
  streak_days INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  week_start TIMESTAMPTZ := DATE_TRUNC('week', NOW()) - INTERVAL '1 week';
  week_end TIMESTAMPTZ := DATE_TRUNC('week', NOW());
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM lesson_progress
     WHERE student_id = p_student_id
       AND status = 'completed'
       AND completed_at >= week_start AND completed_at < week_end) AS completed_lessons,

    (SELECT COUNT(*)::INT FROM quiz_attempts
     WHERE student_id = p_student_id
       AND status = 'submitted'
       AND submitted_at >= week_start AND submitted_at < week_end) AS quiz_count,

    COALESCE(
      (SELECT AVG(score)::NUMERIC(5,2) FROM quiz_attempts
       WHERE student_id = p_student_id
         AND status = 'submitted'
         AND submitted_at >= week_start AND submitted_at < week_end)
    , 0) AS avg_score,

    COALESCE(
      (SELECT SUM(amount)::INT FROM xp_transactions
       WHERE user_id = p_student_id
         AND created_at >= week_start AND created_at < week_end)
    , 0) AS total_xp_earned,

    COALESCE(
      (SELECT quest_streak FROM profiles WHERE id = p_student_id)
    , 0) AS streak_days;
END;
$$;

-- ----------------------------------------
-- Function: add_xp()
-- Safely add XP and update level/leaderboard
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.add_xp(
  p_user_id UUID,
  p_amount INT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_xp INT;
  current_level INT;
  new_level INT;
BEGIN
  SELECT xp, level INTO current_xp, current_level
  FROM profiles WHERE id = p_user_id;

  current_xp := COALESCE(current_xp, 0) + p_amount;

  SELECT MAX(l.level) INTO new_level
  FROM level_definitions l
  WHERE l.xp_required <= current_xp;

  new_level := COALESCE(new_level, 1);

  UPDATE profiles SET
    xp = current_xp,
    level = new_level,
    updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO leaderboard_cache (user_id, total_xp, level, updated_at)
  VALUES (p_user_id, current_xp, new_level, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = current_xp,
    level = new_level,
    updated_at = NOW();

  UPDATE learning_stats SET
    total_xp = current_xp,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- ----------------------------------------
-- Function: get_n8n_pending_events()
-- Returns pending events that n8n should process
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.get_n8n_pending_events()
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_type,
    e.payload,
    e.created_at
  FROM n8n_events e
  WHERE e.status = 'pending'
  ORDER BY e.created_at ASC
  LIMIT 50;
END;
$$;

-- ----------------------------------------
-- Table: n8n_events
-- Queue for events that need processing
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.n8n_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS but allow service role only
ALTER TABLE public.n8n_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "n8n service role only" ON public.n8n_events
  FOR ALL USING (true) WITH CHECK (true);

-- Index for n8n polling
CREATE INDEX IF NOT EXISTS idx_n8n_events_status ON public.n8n_events(status, created_at);

-- ----------------------------------------
-- Function: queue_n8n_event()
-- Called by triggers to queue events for n8n
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.queue_n8n_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  event_type TEXT;
  payload JSONB;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'lesson_progress' THEN
      IF NEW.status = 'completed' THEN
        event_type := 'lesson_completed';
        payload := jsonb_build_object(
          'student_id', NEW.student_id,
          'lesson_id', NEW.lesson_id,
          'completed_at', NEW.completed_at
        );
      ELSE
        RETURN NULL;
      END IF;

    WHEN 'quiz_attempts' THEN
      IF NEW.status = 'submitted' THEN
        event_type := 'quiz_submitted';
        payload := jsonb_build_object(
          'student_id', NEW.student_id,
          'quiz_id', NEW.quiz_id,
          'attempt_id', NEW.id,
          'score', NEW.score
        );
      ELSE
        RETURN NULL;
      END IF;

    WHEN 'certificates' THEN
      event_type := 'certificate_issued';
      payload := jsonb_build_object(
        'student_id', NEW.student_id,
        'certificate_id', NEW.id,
        'path_id', NEW.path_id
      );

    ELSE
      RETURN NULL;
  END CASE;

  INSERT INTO public.n8n_events (event_type, payload)
  VALUES (event_type, payload);

  RETURN NULL;
END;
$$;

-- ----------------------------------------
-- Triggers: auto-queue events for n8n
-- ----------------------------------------
DROP TRIGGER IF EXISTS trg_n8n_lesson_complete ON public.lesson_progress;
CREATE TRIGGER trg_n8n_lesson_complete
  AFTER INSERT OR UPDATE OF status ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_n8n_event();

DROP TRIGGER IF EXISTS trg_n8n_quiz_submit ON public.quiz_attempts;
CREATE TRIGGER trg_n8n_quiz_submit
  AFTER INSERT OR UPDATE OF status ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_n8n_event();

DROP TRIGGER IF EXISTS trg_n8n_certificate ON public.certificates;
CREATE TRIGGER trg_n8n_certificate
  AFTER INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_n8n_event();

-- ----------------------------------------
-- Function: mark_event_processed()
-- n8n calls this after processing an event
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.mark_event_processed(
  p_event_id UUID,
  p_status TEXT DEFAULT 'completed'
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE n8n_events
  SET status = p_status, processed_at = NOW()
  WHERE id = p_event_id;
  RETURN FOUND;
END;
$$;

-- ----------------------------------------
-- Grant permissions for n8n
-- ----------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_completed_paths() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_students_low_performance() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_weekly_stats_summary() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_student_weekly_summary(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_xp(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_n8n_pending_events() TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_event_processed(UUID, TEXT) TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.n8n_events TO service_role;
