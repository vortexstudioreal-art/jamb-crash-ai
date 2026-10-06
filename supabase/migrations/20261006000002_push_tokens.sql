-- Device push tokens for remote push (Firebase FCM).
-- Tokens are captured on-device after the user opts into notifications;
-- broadcasts are sent later (Firebase console or a send function with
-- the FCM service-account key).
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  platform text NOT NULL DEFAULT 'android',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_tokens_email_idx ON public.push_tokens (email);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
  FOR ALL TO authenticated
  USING (email = public.get_auth_email())
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Admins can read all push tokens" ON public.push_tokens
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner(auth.uid()));
