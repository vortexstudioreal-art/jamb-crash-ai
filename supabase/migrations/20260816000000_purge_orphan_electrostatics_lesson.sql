-- Remove the orphaned lesson left behind by an earlier out-of-band seed.
--
-- The 2026-08-11 seed wrote a lesson as physics || 'Electrostatics'. The live
-- jamb_syllabus taxonomy has no such topic (it has 'Electric fields'), so the
-- syllabus deep link can never reach it, and the current corpus supersedes it
-- with the Coulomb's Law lesson on physics || 'Electric fields'.
--
-- lesson_progress.lesson_id is ON DELETE CASCADE, so deleting the lesson would
-- silently destroy any student's progress on it. Check first and refuse if
-- there is any, rather than assume.

DO $$
DECLARE
  target_id uuid;
  progress_rows integer;
BEGIN
  SELECT id INTO target_id
  FROM public.lessons
  WHERE subject = 'physics' AND topic = 'Electrostatics';

  IF target_id IS NULL THEN
    RAISE NOTICE 'no physics/Electrostatics lesson present, nothing to purge';
    RETURN;
  END IF;

  SELECT count(*) INTO progress_rows
  FROM public.lesson_progress
  WHERE lesson_id = target_id;

  IF progress_rows > 0 THEN
    RAISE EXCEPTION 'refusing to purge physics/Electrostatics: % progress row(s) would be cascade-deleted', progress_rows;
  END IF;

  DELETE FROM public.lessons WHERE id = target_id;
  RAISE NOTICE 'purged physics/Electrostatics (0 progress rows)';
END $$;
