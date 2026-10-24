-- Allow authenticated and anon users to insert questions.
-- Needed for one-time import of real JAMB past questions from schoolngr.com.
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON public.jamb_questions;
DROP POLICY IF EXISTS "Anon users can insert questions" ON public.jamb_questions;
CREATE POLICY "Authenticated users can insert questions"
  ON public.jamb_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);
CREATE POLICY "Anon users can insert questions"
  ON public.jamb_questions FOR INSERT
  TO anon
  WITH CHECK (true);
