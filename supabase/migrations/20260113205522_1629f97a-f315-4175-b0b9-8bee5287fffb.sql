-- Drop and recreate the INSERT policy with proper email check
DROP POLICY IF EXISTS "Users can insert their own ad analytics" ON public.ad_analytics;

CREATE POLICY "Users can insert their own ad analytics"
ON public.ad_analytics
FOR INSERT
WITH CHECK (email = (SELECT auth.email()));