-- The rewarded-ad bonus could be granted straight from the browser:
-- increment_feature_usage(p_is_bonus => true) accepted the amount from the
-- client with no proof an ad was watched. Anyone could call it from the
-- console for unlimited bonus uses, which defeated both the daily feature
-- caps and the rewarded-ad economy that pays for them.
--
-- Fix:
--   1. The public RPC no longer grants bonus uses at all — p_is_bonus is
--      ignored so it can only ever count real usage.
--   2. Bonus uses come from grant_bonus_use(), which owns the amount and
--      enforces server-side daily and cadence limits per account.
--
-- Note: the RETURNS TABLE column names (usage_count/bonus_uses) collide with
-- real column names inside plpgsql, so every column reference below is
-- table-qualified.

CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_feature text,
  p_amount int DEFAULT 1,
  p_is_bonus boolean DEFAULT false
)
RETURNS TABLE(usage_count int, bonus_uses int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_amount int;
BEGIN
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = auth.uid();
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_amount := LEAST(GREATEST(COALESCE(p_amount, 1), 1), 100);

  -- p_is_bonus is deliberately ignored: bonus uses are granted only by
  -- grant_bonus_use(), which applies its own limits.
  RETURN QUERY
  INSERT INTO feature_usage (email, feature_type, usage_date, usage_count, bonus_uses)
  VALUES (v_email, p_feature, CURRENT_DATE, v_amount, 0)
  ON CONFLICT (email, feature_type, usage_date) DO UPDATE SET
    usage_count = feature_usage.usage_count + v_amount,
    updated_at = now()
  RETURNING feature_usage.usage_count, feature_usage.bonus_uses;
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

  -- One rewarded ad = one use. The caller cannot inflate this.
  v_amount := LEAST(GREATEST(COALESCE(p_grants, 1), 1), 1);

  SELECT f.usage_count, f.bonus_uses, f.updated_at
    INTO v_usage, v_bonus, v_last
    FROM public.feature_usage f
   WHERE f.email = v_email
     AND f.feature_type = p_feature
     AND f.usage_date = CURRENT_DATE;

  -- Cadence: a rewarded ad is never completed twice within 45 seconds.
  IF v_last IS NOT NULL AND (now() - v_last) < interval '45 seconds' THEN
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
  INSERT INTO feature_usage (email, feature_type, usage_date, usage_count, bonus_uses)
  VALUES (v_email, p_feature, CURRENT_DATE, 0, v_amount)
  ON CONFLICT (email, feature_type, usage_date) DO UPDATE SET
    bonus_uses = feature_usage.bonus_uses + v_amount,
    updated_at = now()
  RETURNING feature_usage.usage_count, feature_usage.bonus_uses, v_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_bonus_use(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_bonus_use(text, int) TO authenticated;