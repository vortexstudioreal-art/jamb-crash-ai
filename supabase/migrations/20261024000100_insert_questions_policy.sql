-- Allow authenticated users to insert geography questions.
-- Needed for one-time import of real JAMB past questions from schoolngr.com.
-- Questions are public domain educational content; low risk to allow inserts.
CREATE POLICY "Authenticated users can insert questions"
  ON public.jamb_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);
