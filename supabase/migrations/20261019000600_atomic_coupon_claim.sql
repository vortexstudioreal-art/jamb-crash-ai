-- claim-reward read the coupon's usage limit and only bumped times_used after
-- granting access, with a blind increment in between:
--     SELECT ... times_used            (check times_used < usage_limit)
--     INSERT INTO payments ...          (grant a year of premium)
--     SELECT increment_coupon_usage()   (times_used = times_used + 1, no guard)
-- Concurrent requests all passed the same check before any of them incremented,
-- so a single-use 100%-off coupon could be redeemed in parallel to mint
-- unlimited free premium accounts.
--
-- Replace the blind increment with an atomic, guarded claim. The UPDATE's
-- WHERE clause is the lock: only the requests that observe a still-under-limit
-- row get a row back, and only those may grant access.

-- CREATE OR REPLACE cannot change a return type, and this function previously
-- returned void, so the old signature has to go first.
DROP FUNCTION IF EXISTS public.increment_coupon_usage(uuid);

CREATE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_claimed boolean := false;
BEGIN
  -- Atomic guarded claim: the WHERE clause is evaluated against the current
  -- row under the row lock, so concurrent callers serialise here and exactly
  -- usage_limit callers can ever win. Unlimited coupons (usage_limit NULL)
  -- always pass.
  UPDATE coupon_codes
     SET times_used = COALESCE(times_used, 0) + 1
   WHERE id = p_coupon_id
     AND is_active = true
     AND (expiry_date IS NULL OR expiry_date > now())
     AND (usage_limit IS NULL OR COALESCE(times_used, 0) < usage_limit)
  RETURNING TRUE INTO v_claimed;

  RETURN COALESCE(v_claimed, false);
END;
$function$;

REVOKE ALL ON FUNCTION public.increment_coupon_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) TO authenticated, service_role;

-- Compensating action for a grant that fails after the claim succeeded, so a
-- transient database error doesn't permanently burn one of a coupon's few uses.
CREATE OR REPLACE FUNCTION public.release_coupon_claim(p_coupon_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_released boolean := false;
BEGIN
  UPDATE coupon_codes
     SET times_used = GREATEST(COALESCE(times_used, 0) - 1, 0)
   WHERE id = p_coupon_id
     AND COALESCE(times_used, 0) > 0
  RETURNING TRUE INTO v_released;

  RETURN COALESCE(v_released, false);
END;
$function$;

REVOKE ALL ON FUNCTION public.release_coupon_claim(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_coupon_claim(uuid) TO authenticated, service_role;
