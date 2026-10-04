-- Restate RLS policies on lessons / lesson_progress with explicit role scoping.
--
-- Why a new migration: 20260811000000 is already recorded as applied on the remote
-- project, so edits to that file never take effect. It shipped these policies:
--
--   CREATE POLICY "Service role full access on lessons"
--     ON lessons FOR ALL USING (true) WITH CHECK (true);
--
-- With no TO clause, Postgres grants a FOR ALL policy to every role, including
-- anon and authenticated. Any client holding only the public publishable key could
-- therefore UPDATE or DELETE every lesson row. Verified live: an unauthenticated
-- PATCH against lessons returned 204.
--
-- Writes go through the service role (migrations and seed functions), and the app
-- writes lesson_progress as the signed-in user, so scoping these two policies to
-- service_role breaks nothing.

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('lessons', 'lesson_progress')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Anyone may read published lessons.
CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons FOR SELECT
  TO anon, authenticated, service_role
  USING (status = 'published');

-- Drafts stay server-side: no client policy exposes them.
CREATE POLICY "Service role full access on lessons"
  ON lessons FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Progress is per-account. auth.email() is NULL for anon, so scoping to
-- authenticated also stops an unauthenticated write attempt outright.
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (auth.email() = email);

CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = email);

CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  TO authenticated
  USING (auth.email() = email)
  WITH CHECK (auth.email() = email);

CREATE POLICY "Service role full access on lesson_progress"
  ON lesson_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
