-- The admin Ad Analytics dashboard reads every row, but the SELECT policy
-- only allows users to see their own events — so the dashboard always shows
-- zeros. Admins get full visibility; everyone else keeps own-only access.

DROP POLICY IF EXISTS "Admins can view all ad analytics" ON public.ad_analytics;
CREATE POLICY "Admins can view all ad analytics"
ON public.ad_analytics
FOR SELECT
TO authenticated
USING (public.is_admin_or_owner(auth.uid()));
