-- Create user_trials table for tracking trial usage and preventing abuse
CREATE TABLE IF NOT EXISTS public.user_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 minutes'),
  trial_used BOOLEAN NOT NULL DEFAULT true,
  subscription_plan TEXT DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Users can view their own trial status
CREATE POLICY "Users can view own trial"
ON public.user_trials FOR SELECT
USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));

-- Users can insert their own trial (but only once due to unique constraint on email)
CREATE POLICY "Users can start trial once"
ON public.user_trials FOR INSERT
WITH CHECK (email = get_auth_email());

-- Users can update their own trial record
CREATE POLICY "Users can update own trial"
ON public.user_trials FOR UPDATE
USING (email = get_auth_email());

-- Update trigger for updated_at
CREATE TRIGGER update_user_trials_updated_at
  BEFORE UPDATE ON public.user_trials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add coupon_type column to coupon_codes if it doesn't exist with proper constraints
ALTER TABLE public.coupon_codes 
  ADD COLUMN IF NOT EXISTS coupon_type TEXT DEFAULT 'admin_referral' 
  CHECK (coupon_type IN ('public', 'admin_referral', 'internal'));

-- Add discount_percentage column for percentage-based discounts
ALTER TABLE public.coupon_codes
  ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 5;

-- Add commission tracking to coupon_usage
ALTER TABLE public.coupon_usage
  ADD COLUMN IF NOT EXISTS commission_percentage INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS commission_payable BOOLEAN DEFAULT false;