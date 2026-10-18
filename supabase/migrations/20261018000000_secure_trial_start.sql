-- Trial rows were fully client-writable, which granted free premium:
--   * "Users can update own trial" had USING but no WITH CHECK, so any
--     authenticated user could UPDATE their own trial_expires_at (or
--     subscription_plan) to any value — trial extended indefinitely.
--   * "Users can start trial once" allowed INSERT with arbitrary column
--     values, and the browser computed the duration, so the expiry could be
--     set to any future date on first use.
-- Trial state drives isTrialActive, which unlocks premium features client-side
-- and grants unlimited feature usage. Close both paths: trials are started by a
-- SECURITY DEFINER function that owns the duration, and the client can only
-- read its own row.

DROP POLICY IF EXISTS "Users can update own trial" ON public.user_trials;
DROP POLICY IF EXISTS "Users can start trial once" ON public.user_trials;

-- One trial per account, duration owned by the server.
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS TABLE(started boolean, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := get_auth_email();
  v_existing timestamptz;
  v_expires timestamptz := now() + interval '7 days';
BEGIN
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  -- Already has a trial row (active or long expired): never grant a second.
  SELECT t.trial_expires_at INTO v_existing
  FROM public.user_trials t
  WHERE t.email = v_email;

  IF FOUND THEN
    RETURN QUERY SELECT false, v_existing;
    RETURN;
  END IF;

  INSERT INTO public.user_trials
    (email, trial_started_at, trial_expires_at, trial_used, subscription_plan)
  VALUES
    (v_email, now(), v_expires, true, 'premium');

  RETURN QUERY SELECT true, v_expires;
END;
$$;

REVOKE ALL ON FUNCTION public.start_trial() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;

-- Admins may still correct a trial by hand (audit/repair), not self-service.
DROP POLICY IF EXISTS "Admins can manage trials" ON public.user_trials;
CREATE POLICY "Admins can manage trials"
  ON public.user_trials FOR ALL
  USING (is_admin_or_owner(auth.uid()))
  WITH CHECK (is_admin_or_owner(auth.uid()));