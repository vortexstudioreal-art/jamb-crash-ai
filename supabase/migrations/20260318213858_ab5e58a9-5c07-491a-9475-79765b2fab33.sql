-- Fix 1: Restrict payments INSERT to authenticated users with email check
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
CREATE POLICY "Authenticated users can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (email = get_auth_email());

-- Fix 2: Remove duplicate leaderboard INSERT policy
DROP POLICY IF EXISTS "Users can insert own score" ON public.leaderboard_scores;