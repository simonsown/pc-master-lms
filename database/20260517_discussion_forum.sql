-- ==========================================
-- DISCUSSION FORUM SETUP
-- ==========================================

CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'question' CHECK (type IN ('question','discussion','announcement')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','resolved','pinned','closed')),
  upvote_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_teacher_answer BOOLEAN DEFAULT FALSE,
  upvote_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_upvotes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_target CHECK (
    (thread_id IS NULL) != (reply_id IS NULL)
  ),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, reply_id)
);

-- Trigger to increment reply_count
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.discussion_threads
  SET reply_count = reply_count + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reply_insert ON public.discussion_replies;
CREATE TRIGGER on_reply_insert
  AFTER INSERT ON public.discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_reply_count();

-- RLS Enable
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_threads" ON public.discussion_threads FOR SELECT USING (true);
CREATE POLICY "create_thread" ON public.discussion_threads FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "delete_own_or_teacher_thread" ON public.discussion_threads FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

CREATE POLICY "view_replies" ON public.discussion_replies FOR SELECT USING (true);
CREATE POLICY "create_reply" ON public.discussion_replies FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "delete_own_or_teacher_reply" ON public.discussion_replies FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

CREATE POLICY "manage_upvotes" ON public.discussion_upvotes FOR ALL USING (user_id = auth.uid());
