-- Refine the HTML stripper to tags-only: bare "<" in maths ("x < 5")
-- is legitimate content, not markup. Re-cleans any rows still carrying
-- real tags.
CREATE OR REPLACE FUNCTION public.strip_import_html(s text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT btrim(regexp_replace(
    replace(replace(replace(replace(replace(
      regexp_replace(COALESCE(s, ''), '</?[a-zA-Z][^>]*>', '', 'g'),
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
WHERE question ~ '</?[a-zA-Z]'
   OR option_a ~ '</?[a-zA-Z]'
   OR option_b ~ '</?[a-zA-Z]'
   OR option_c ~ '</?[a-zA-Z]'
   OR option_d ~ '</?[a-zA-Z]'
   OR explanation ~ '</?[a-zA-Z]'
   OR question LIKE '%&nbsp;%' OR explanation LIKE '%&nbsp;%';
