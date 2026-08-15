-- Fix RLS policies for payments and coupon_usage tables.
-- The previous policies allowed anyone to INSERT, which is a security risk.
-- 
-- Risk: An attacker could insert fake payment records to gain access,
-- or insert fake coupon usage to defraud collaborators.
--
-- Fix: Restrict INSERT to authenticated users matching their own email.

-- ===================== PAYMENTS TABLE =====================

DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;

-- Authenticated users can insert payments for their own email
CREATE POLICY "Users can insert own payments"
ON payments
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND email = auth.email()
);

-- Service role bypasses RLS entirely (used by webhook & edge functions)
-- Anonymous users go through signup first, then return as authenticated

-- Enhance SELECT policy to ensure users see only their own
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
ON payments
FOR SELECT
USING (email = auth.email() OR is_admin_or_owner(auth.uid()));

-- ===================== COUPON_USAGE TABLE =====================

DROP POLICY IF EXISTS "Anyone can insert coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Authenticated users can insert usage" ON coupon_usage;

-- Authenticated users can record coupon usage for themselves
CREATE POLICY "Users can insert own coupon usage"
ON coupon_usage
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND used_by_email = auth.email()
);

-- Users can view their own coupon usage; admins can view all
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
CREATE POLICY "Users can view own coupon usage"
ON coupon_usage
FOR SELECT
USING (used_by_email = auth.email() OR is_admin_or_owner(auth.uid()));
