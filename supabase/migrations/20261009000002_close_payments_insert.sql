-- Close client-side payment grants.
--
-- All legitimate payment rows are now written server-side:
--   paystack-initialize / paystack-verify / paystack-webhook (service role),
--   claim-reward (service role: 100% coupons + Refer & Boost tiers),
--   redeem_activation_pin (SECURITY DEFINER), B2B order functions (service role).
-- With no INSERT policy, PostgREST/Supabase-js inserts are denied by default,
-- so DevTools can no longer forge `status='success'` rows for free access.

DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
