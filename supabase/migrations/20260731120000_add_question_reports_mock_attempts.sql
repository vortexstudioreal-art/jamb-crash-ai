-- Question error reports + full UTME CBT mock attempts
-- Follows project conventions: email-based RLS via public.get_auth_email(),
-- admin access via public.is_admin_or_owner(auth.uid()).

-- Question reports (students flag wrong/confusing questions)
CREATE TABLE IF NOT EXISTS public.question_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,
  email text NOT NULL,
  reason text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS question_reports_status_idx ON public.question_reports (status);
CREATE INDEX IF NOT EXISTS question_reports_question_idx ON public.question_reports (question_id);
CREATE INDEX IF NOT EXISTS question_reports_email_idx ON public.question_reports (email);

-- Full UTME CBT mock attempts (180-question simulation)
CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  mock_name text NOT NULL DEFAULT 'UTME Mock',
  total_score int NOT NULL DEFAULT 0,
  max_score int NOT NULL DEFAULT 400,
  english_score int NOT NULL DEFAULT 0,
  english_total int NOT NULL DEFAULT 60,
  section_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  questions_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_taken_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mock_attempts_email_idx ON public.mock_attempts (email);
CREATE INDEX IF NOT EXISTS mock_attempts_created_idx ON public.mock_attempts (created_at DESC);

-- RLS
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own question reports" ON public.question_reports
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can read own question reports" ON public.question_reports
  FOR SELECT TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Admins can manage question reports" ON public.question_reports
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own mock attempts" ON public.mock_attempts
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can read own mock attempts" ON public.mock_attempts
  FOR SELECT TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Admins can read all mock attempts" ON public.mock_attempts
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner(auth.uid()));
