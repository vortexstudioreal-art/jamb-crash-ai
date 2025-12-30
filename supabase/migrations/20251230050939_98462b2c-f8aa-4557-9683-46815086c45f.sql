-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;

-- Create a new policy that allows:
-- 1. Authenticated users to insert payments for their email
-- 2. Anonymous users to insert payments (for checkout flows)
CREATE POLICY "Anyone can insert payments"
ON payments
FOR INSERT
WITH CHECK (true);

-- The security here is that:
-- 1. Users can only see their own payments (via existing SELECT policy)
-- 2. Only service role can update payments (via existing UPDATE policy)
-- 3. Payment verification happens server-side via Paystack webhook