-- Turn on row level security for real.
--
-- 20260811000000 already contained ALTER TABLE ... ENABLE ROW LEVEL SECURITY, but
-- the remote project never executed it: the lessons table was created out-of-band
-- and the migration version was recorded as applied without running. Result: RLS
-- was OFF, so the policies added by 20260814000000 were inert and an
-- unauthenticated PATCH on lessons still returned 204.
--
-- ENABLE ROW LEVEL SECURITY is idempotent, so re-stating it is safe.

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- The service role bypasses RLS, but `postgres` (used by `supabase db push` to
-- apply migrations) is not guaranteed to on every project, so name it explicitly
-- in the write policies. Without this a future seed migration could be blocked by
-- its own RLS.
DROP POLICY IF EXISTS "Service role full access on lessons" ON public.lessons;
CREATE POLICY "Service role full access on lessons"
  ON public.lessons FOR ALL
  TO service_role, postgres
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on lesson_progress" ON public.lesson_progress;
CREATE POLICY "Service role full access on lesson_progress"
  ON public.lesson_progress FOR ALL
  TO service_role, postgres
  USING (true)
  WITH CHECK (true);

-- Fail loudly instead of silently leaving the tables wide open.
DO $$
DECLARE
  lessons_rls boolean;
  progress_rls boolean;
BEGIN
  SELECT relrowsecurity INTO lessons_rls
  FROM pg_class WHERE oid = 'public.lessons'::regclass;

  SELECT relrowsecurity INTO progress_rls
  FROM pg_class WHERE oid = 'public.lesson_progress'::regclass;

  IF NOT lessons_rls OR NOT progress_rls THEN
    RAISE EXCEPTION 'RLS still disabled (lessons=%, lesson_progress=%)', lessons_rls, progress_rls;
  END IF;
END $$;
