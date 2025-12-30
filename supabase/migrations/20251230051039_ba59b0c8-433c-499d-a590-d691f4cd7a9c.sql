-- Fix coupon_usage INSERT policy to allow checkout flow
DROP POLICY IF EXISTS "Authenticated users can insert usage" ON coupon_usage;

CREATE POLICY "Anyone can insert coupon usage"
ON coupon_usage
FOR INSERT
WITH CHECK (true);