-- paystack-initialize validated a coupon's usage_limit but never consumed a
-- use: increment_coupon_usage() was only ever called from claim-reward, so the
-- Paystack path could apply a single-use coupon to an unlimited number of
-- repeat purchases (each one real money at the discounted price).
--
-- Record which coupon a pending payment used, so the redemption is auditable
-- and the claim can be tied to a specific reference.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupon_codes(id);

CREATE INDEX IF NOT EXISTS idx_payments_coupon_id ON public.payments(coupon_id);
