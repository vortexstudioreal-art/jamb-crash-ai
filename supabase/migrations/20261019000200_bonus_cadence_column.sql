-- grant_bonus_use() enforced its cadence window against feature_usage.updated_at,
-- but increment_feature_usage() also bumps updated_at on every normal use. So a
-- student who used their last daily use two seconds before tapping "Watch Ad"
-- was refused the bonus while the ad still played — the worst possible outcome
-- (reward shown, nothing granted).
--
-- Track bonus grants in their own column, which ordinary usage never touches.

ALTER TABLE public.feature_usage
  ADD COLUMN IF NOT EXISTS last_bonus_at timestamptz;

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

  -- One rewarded ad = one use. The caller cannot inflate this.
  v_amount := LEAST(GREATEST(COALESCE(p_grants, 1), 1), 1);

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

  IF v_bonus_today >= 30 THEN
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