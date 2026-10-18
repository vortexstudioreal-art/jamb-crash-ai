-- Removes test pollution left by verifying the redeem_referral_code fix.
-- The probe redeemed a real user's code (JAMBC97FD8) against a throwaway
-- example.com address to prove the function works; that redemption is not a
-- genuine referral and must not count toward that user's Refer & Boost tiers.
--
-- Scoped deliberately to example.com probe addresses so it can never touch a
-- real referral. Idempotent.
UPDATE public.referrals
   SET referred_email = NULL,
       is_used = false,
       discount_amount = 1000
 WHERE referred_email LIKE '%@example.com'
   AND referred_email LIKE 'probe-redeem-%';
