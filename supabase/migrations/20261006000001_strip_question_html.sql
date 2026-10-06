-- Strip leftover HTML tags/entities from imported questions
-- (ALOC dump rows contain <i>/<b> markup that renders raw in the app).
CREATE OR REPLACE FUNCTION public.strip_import_html(s text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT btrim(regexp_replace(
    replace(replace(replace(replace(replace(
      regexp_replace(COALESCE(s, ''), '<[^>]+>', '', 'g'),
      '&nbsp;', ' '),
      '&amp;', '&'),
      '&lt;', '<'),
      '&gt;', '>'),
      '&quot;', '"'),
    '\s+', ' ', 'g'
  ), ' ')
$$;

UPDATE public.jamb_questions
SET question = public.strip_import_html(question),
    option_a = public.strip_import_html(option_a),
    option_b = public.strip_import_html(option_b),
    option_c = public.strip_import_html(option_c),
    option_d = public.strip_import_html(option_d),
    explanation = CASE WHEN explanation IS NULL THEN NULL ELSE public.strip_import_html(explanation) END
WHERE question ~ '<[^>]+>'
   OR option_a ~ '<[^>]+>' OR option_b ~ '<[^>]+>'
   OR option_c ~ '<[^>]+>' OR option_d ~ '<[^>]+>'
   OR explanation ~ '<[^>]+>'
   OR question LIKE '%&nbsp;%' OR explanation LIKE '%&nbsp;%';
