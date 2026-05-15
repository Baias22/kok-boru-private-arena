
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX questions_topic_id_idx ON public.questions(topic_id);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Open access policies (classroom MVP, no auth required)
CREATE POLICY "topics_all" ON public.topics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "questions_all" ON public.questions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default topic with sample questions
INSERT INTO public.topics (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'General Knowledge');
INSERT INTO public.questions (topic_id, text, options, correct_index) VALUES
  ('00000000-0000-0000-0000-000000000001', '2 + 3 = ?', '["4","5","6","7"]'::jsonb, 1),
  ('00000000-0000-0000-0000-000000000001', 'Capital of Kyrgyzstan?', '["Almaty","Tashkent","Bishkek","Osh"]'::jsonb, 2),
  ('00000000-0000-0000-0000-000000000001', '10 × 4 = ?', '["14","40","44","30"]'::jsonb, 1),
  ('00000000-0000-0000-0000-000000000001', 'Sun rises in the…', '["West","North","South","East"]'::jsonb, 3),
  ('00000000-0000-0000-0000-000000000001', 'How many legs does a horse have?', '["2","3","4","6"]'::jsonb, 2),
  ('00000000-0000-0000-0000-000000000001', '12 ÷ 3 = ?', '["2","3","4","6"]'::jsonb, 2),
  ('00000000-0000-0000-0000-000000000001', 'Largest ocean?', '["Atlantic","Indian","Arctic","Pacific"]'::jsonb, 3),
  ('00000000-0000-0000-0000-000000000001', 'Color of the sky on a clear day?', '["Green","Blue","Red","Yellow"]'::jsonb, 1),
  ('00000000-0000-0000-0000-000000000001', '9 - 4 = ?', '["3","4","5","6"]'::jsonb, 2),
  ('00000000-0000-0000-0000-000000000001', 'Kok Boru is played on…', '["Foot","Bicycles","Horses","Cars"]'::jsonb, 2);
