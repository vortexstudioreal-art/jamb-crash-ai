-- The server now owns the bonus amount per feature (the client only says
-- "a rewarded ad completed"), and returns what it actually granted so the UI
-- can report the truth instead of echoing the client's requested figure.
--
-- quick_quiz keeps its larger grant: practice quizzes and arcade games cost
-- no AI quota, so a watched ad is the only thing gating them and +20 matches
-- the intended freemium loop. Everything that touches Groq stays at +1.

CREATE OR REPLACE FUNCTION public.bonus_amount_for(p_feature text)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_feature
    WHEN 'quick_quiz' THEN 20
    ELSE 1
  END;
$$;

CREATE OR REPLACE FUNCTION public.grant_bonus_use(
  p_feature text,
  p_grants int DEFAULT 1
)
RETURNS TABLE(usage_count int, bonus_uses int, granted int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_amount int;
  v_usage int;
  v_bonus int;
  v_last timestamptz;
  v_bonus_today int;
BEGIN
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = auth.uid();
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- p_grants is ignored on purpose: the amount comes from the server table
  -- above so a caller cannot inflate it.
  v_amount := public.bonus_amount_for(p_feature);

  -- last_bonus_at is written only by this function, so ordinary feature usage
  -- can never make a legitimate ad reward look like a replay.
  SELECT f.usage_count, f.bonus_uses, f.last_bonus_at
    INTO v_usage, v_bonus, v_last
    FROM public.feature_usage f
   WHERE f.email = v_email
     AND f.feature_type = p_feature
     AND f.usage_date = CURRENT_DATE;

  -- Cadence: a rewarded ad is never completed twice within 30 seconds.
  IF v_last IS NOT NULL AND (now() - v_last) < interval '30 seconds' THEN
    RETURN QUERY SELECT COALESCE(v_usage, 0), COALESCE(v_bonus, 0), 0;
    RETURN;
  END IF;

  -- Daily ceiling across all features: roomy for a real student who watches
  -- a handful of ads, hostile to a script.
  SELECT COALESCE(SUM(f.bonus_uses), 0) INTO v_bonus_today
    FROM public.feature_usage f
   WHERE f.email = v_email
     AND f.usage_date = CURRENT_DATE;

  IF v_bonus_today + v_amount > 60 THEN
    RETURN QUERY SELECT COALESCE(v_usage, 0), v_bonus_today, 0;
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO feature_usage (email, feature_type, usage_date, usage_count, bonus_uses, last_bonus_at)
  VALUES (v_email, p_feature, CURRENT_DATE, 0, v_amount, now())
  ON CONFLICT (email, feature_type, usage_date) DO UPDATE SET
    bonus_uses = feature_usage.bonus_uses + v_amount,
    last_bonus_at = now(),
    updated_at = now()
  RETURNING feature_usage.usage_count, feature_usage.bonus_uses, v_amount;
END;
$$;