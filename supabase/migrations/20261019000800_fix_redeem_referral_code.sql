-- redeem_referral_code has never worked: it INSERTed a new referrals row using
-- the same referral_code it had just matched, but referral_code carries a
-- UNIQUE constraint (referrals_referral_code_key). Every redemption therefore
-- aborted with:
--     duplicate key value violates unique constraint "referrals_referral_code_key"
-- Verified live against the deployed function, so Refer & Boost has never paid
-- out and the N1,000 referral discount has never been applied.
--
-- The intended shape is one row per code, filled in on redemption: ReferralSystem
-- counts rows by (referrer_email, is_used = true), which only makes sense if
-- the code's own row is updated rather than duplicated.
--
-- The claim is also now atomic. Previously the "already redeemed" test was per
-- buyer, not per code, so once the insert conflict was fixed a single code
-- could have been redeemed by unlimited different emails. The UPDATE's WHERE
-- clause is the lock: only the caller that observes referred_email IS NULL wins.

CREATE OR REPLACE FUNCTION public.redeem_referral_code(p_code text, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer text;
  v_id uuid;
BEGIN
  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RETURN false;
  END IF;

  -- Locate the unredeemed code.
  SELECT r.id, r.referrer_email INTO v_id, v_referrer
  FROM referrals r
  WHERE r.referral_code = UPPER(TRIM(p_code))
    AND r.referred_email IS NULL
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN false; -- unknown or already redeemed
  END IF;

  IF lower(v_referrer) = lower(btrim(p_email)) THEN
    RETURN false; -- can't refer yourself
  END IF;

  -- One account can be referred at most once, across all codes.
  IF EXISTS (
    SELECT 1 FROM referrals
    WHERE lower(referred_email) = lower(btrim(p_email))
  ) THEN
    RETURN false;
  END IF;

  -- Atomic claim: concurrent callers serialise on the row lock, and only the
  -- one that still sees referred_email IS NULL updates it.
  UPDATE referrals
     SET referred_email = lower(btrim(p_email)),
         is_used = true,
         discount_amount = 1000
   WHERE id = v_id
     AND referred_email IS NULL;

  IF NOT FOUND THEN
    RETURN false; -- someone else redeemed it first
  END IF;

  RETURN true;
END;
$$;
