-- Allow owner/admin to see all profiles for admin dashboard
CREATE POLICY "Owners and admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

-- Add referral_credits column for refer & earn rewards
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_credits integer DEFAULT 0;