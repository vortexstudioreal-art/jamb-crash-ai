-- Referral codes at payment time.
--
-- Problem: referral codes live in `referrals`, but RLS only lets the
-- *referrer* see their row — a friend entering the code at checkout could
-- never validate it, so `is_used` was never set and referrers never earned.
-- These SECURITY DEFINER helpers let any signed-in buyer validate + redeem
-- a code at the moment payment succeeds. One code works for many friends;
-- each redemption inserts its own used row (the master row with
-- referred_email NULL stays as the code registry).

-- Validate a code for display (discount preview). Returns the referrer.
CREATE OR REPLACE FUNCTION public.check_referral_code(p_code text)
RETURNS TABLE(referrer_email text, valid boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.referrer_email, true
  FROM referrals r
  WHERE r.referral_code = UPPER(TRIM(p_code))
    AND r.referred_email IS NULL
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::text, false;
  END IF;
END;
$$;

-- Redeem a code at payment success. Idempotent per (code, buyer).
CREATE OR REPLACE FUNCTION public.redeem_referral_code(p_code text, p_email text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer text;
BEGIN
  SELECT r.referrer_email INTO v_referrer
  FROM referrals r
  WHERE r.referral_code = UPPER(TRIM(p_code))
    AND r.referred_email IS NULL
  LIMIT 1;

  IF v_referrer IS NULL THEN
    RETURN false;
  END IF;
  IF lower(v_referrer) = lower(p_email) THEN
    RETURN false; -- can't refer yourself
  END IF;
  IF EXISTS (
    SELECT 1 FROM referrals
    WHERE referral_code = UPPER(TRIM(p_code))
      AND lower(referred_email) = lower(p_email)
  ) THEN
    RETURN false; -- already redeemed by this buyer
  END IF;

  INSERT INTO referrals (referrer_email, referral_code, referred_email, is_used, discount_amount)
  VALUES (v_referrer, UPPER(TRIM(p_code)), lower(p_email), true, 1000);
  RETURN true;
END;
$$;
