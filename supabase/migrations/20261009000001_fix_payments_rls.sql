-- Fix payments INSERT policy: restrict to authenticated users inserting their own email
-- Service role (edge functions) bypasses RLS entirely

DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;

-- Authenticated users can only insert payments for their own email
CREATE POLICY "Users can insert own payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Note: Service role (paystack-webhook, paystack-verify edge functions) bypasses RLS
-- and can insert payments for any verified email. This is the intended flow.