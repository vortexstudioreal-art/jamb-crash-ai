-- Scholarship waitlist: one row per interested student.
-- P1 of the scholarship engine: working Notify Me + merit qualification
-- (top-100 leaderboard rank) instead of a dead button.
CREATE TABLE IF NOT EXISTS public.scholarship_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join the waitlist" ON public.scholarship_interest
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can see own waitlist entry" ON public.scholarship_interest
  FOR SELECT TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Admins can read the waitlist" ON public.scholarship_interest
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner(auth.uid()));
