-- Conversion funnel events: one row per meaningful step.
-- Funnel = distinct emails per event: signup -> subjects -> quiz ->
-- paywall -> checkout -> paid.
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS funnel_events_event_idx ON public.funnel_events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS funnel_events_email_idx ON public.funnel_events (email);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log own funnel events" ON public.funnel_events
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can read own funnel events" ON public.funnel_events
  FOR SELECT TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Admins can read funnel events" ON public.funnel_events
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner(auth.uid()));
