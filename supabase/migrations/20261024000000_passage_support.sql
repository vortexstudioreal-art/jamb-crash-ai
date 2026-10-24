-- Passage support for unseen-poem/extract questions in Mock Exam Mode.
-- Questions with a passage render as: Instruction → Passage → Question → Options
-- Questions without a passage render as: Instruction → Question → Options
-- Passage questions only exist in Mock Exam Mode (not practice mode).
ALTER TABLE public.jamb_questions
  ADD COLUMN IF NOT EXISTS passage text;

-- Index for passage questions lookup in mock mode.
CREATE INDEX IF NOT EXISTS idx_jamb_questions_passage_not_null ON public.jamb_questions(passage) WHERE passage IS NOT NULL;
