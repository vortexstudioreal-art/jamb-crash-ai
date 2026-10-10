-- Atomic feature-usage increments. The client used to read its own cached
-- counter, add one, and upsert the absolute value: concurrent increments
-- lost counts (free extra uses), and the bonus path overwrote usage_count
-- with a stale client value (resetting the daily counter). This RPC bumps
-- server-side in one statement and returns the authoritative row.

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
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Bound single-call abuse (bonus grants are client-observed).
  v_amount := LEAST(GREATEST(COALESCE(p_amount, 1), 1), 100);

  RETURN QUERY
  INSERT INTO feature_usage (email, feature_type, usage_date, usage_count, bonus_uses)
  VALUES (
    v_email,
    p_feature,
    CURRENT_DATE,
    CASE WHEN p_is_bonus THEN 0 ELSE v_amount END,
    CASE WHEN p_is_bonus THEN v_amount ELSE 0 END
  )
  ON CONFLICT (email, feature_type, usage_date) DO UPDATE SET
    usage_count = CASE WHEN p_is_bonus
      THEN feature_usage.usage_count
      ELSE feature_usage.usage_count + v_amount END,
    bonus_uses = CASE WHEN p_is_bonus
      THEN feature_usage.bonus_uses + v_amount
      ELSE feature_usage.bonus_uses END,
    updated_at = now()
  RETURNING feature_usage.usage_count, feature_usage.bonus_uses;
END;
$$;
