-- Lesson progress writes fail silently for accounts whose auth email has
-- any uppercase characters: the client sends a lowercased email while the
-- policies compare exact equality. Case-insensitive comparison fixes it for
-- every client without touching app code.

DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (lower(auth.email()) = lower(email));

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (lower(auth.email()) = lower(email));

DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  TO authenticated
  USING (lower(auth.email()) = lower(email))
  WITH CHECK (lower(auth.email()) = lower(email));
