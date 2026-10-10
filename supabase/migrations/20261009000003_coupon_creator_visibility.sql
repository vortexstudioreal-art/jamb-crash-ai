-- Collaborators (content creators) need to see their own coupons (including
-- inactive ones) and the usage/earnings those coupons generated. Existing
-- policies only let admins see everything and everyone see active coupons,
-- so a collaborator's earnings dashboard silently shows zeros.

DROP POLICY IF EXISTS "Creators can view own coupons" ON public.coupon_codes;
CREATE POLICY "Creators can view own coupons"
ON public.coupon_codes
FOR SELECT
TO authenticated
USING (lower(creator_email) = lower(public.get_auth_email()));

DROP POLICY IF EXISTS "Creators can view usage of own coupons" ON public.coupon_usage;
CREATE POLICY "Creators can view usage of own coupons"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coupon_codes cc
    WHERE cc.id = coupon_usage.coupon_id
      AND lower(cc.creator_email) = lower(public.get_auth_email())
  )
);
