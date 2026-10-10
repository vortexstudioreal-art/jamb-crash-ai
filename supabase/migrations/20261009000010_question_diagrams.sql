-- Diagrams/graphs attached to questions (physics circuits, geometry figures,
-- commerce/economics charts). SVG markup stored inline; the client sanitizes
-- before rendering. Nullable so the whole existing bank is unaffected.
ALTER TABLE public.jamb_questions
  ADD COLUMN IF NOT EXISTS diagram_svg text;
