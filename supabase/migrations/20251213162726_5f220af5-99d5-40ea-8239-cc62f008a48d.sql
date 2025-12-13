-- Add new columns to coupon_codes table
ALTER TABLE public.coupon_codes 
ADD COLUMN coupon_type text DEFAULT 'admin_referral',
ADD COLUMN discount_percentage INTEGER DEFAULT 5,
ADD COLUMN usage_limit INTEGER DEFAULT NULL,
ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN times_used INTEGER DEFAULT 0;

-- Add columns to coupon_usage table
ALTER TABLE public.coupon_usage
ADD COLUMN commission_percentage INTEGER DEFAULT 10,
ADD COLUMN commission_payable BOOLEAN DEFAULT false;