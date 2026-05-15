
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX questions_topic_id_idx ON public.questions(topic_id);
CREATE INDEX topics_user_id_idx ON public.topics(user_id);
CREATE INDEX questions_user_id_idx ON public.questions(user_id);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topics_select_own" ON public.topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "topics_insert_own" ON public.topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topics_update_own" ON public.topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topics_delete_own" ON public.topics FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "questions_select_own" ON public.questions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "questions_insert_own" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "questions_update_own" ON public.questions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "questions_delete_own" ON public.questions FOR DELETE TO authenticated USING (auth.uid() = user_id);
