-- Create coupon_codes table
CREATE TABLE public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  creator_email TEXT NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon_usage table to track usage and earnings
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupon_codes(id) ON DELETE CASCADE,
  used_by_email TEXT NOT NULL,
  payment_id UUID REFERENCES public.payments(id),
  amount_paid INTEGER NOT NULL,
  discount_applied INTEGER NOT NULL,
  creator_earning INTEGER NOT NULL DEFAULT 1000,
  is_paid_out BOOLEAN NOT NULL DEFAULT false,
  paid_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupon_codes
CREATE POLICY "Anyone can view active coupons" ON public.coupon_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON public.coupon_codes
  FOR ALL USING (is_admin_or_owner(auth.uid()));

-- RLS policies for coupon_usage
CREATE POLICY "Users can view their own usage" ON public.coupon_usage
  FOR SELECT USING (used_by_email = get_auth_email() OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Authenticated users can insert usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (used_by_email = get_auth_email());

CREATE POLICY "Only owner can update usage" ON public.coupon_usage
  FOR UPDATE USING (is_owner(auth.uid()));

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  discount INTEGER,
  coupon_id UUID,
  creator TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS valid,
    cc.discount_amount AS discount,
    cc.id AS coupon_id,
    cc.creator_email AS creator
  FROM coupon_codes cc
  WHERE cc.code = UPPER(coupon_code)
    AND cc.is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, NULL::TEXT;
  END IF;
END;
$$;