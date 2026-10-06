-- Flag AI-generated practice questions so the app can label them honestly
-- (real past questions vs AI "likely questions").
ALTER TABLE public.jamb_questions
  ADD COLUMN IF NOT EXISTS is_ai_generated boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS jamb_questions_ai_idx
  ON public.jamb_questions (subject, is_ai_generated);
