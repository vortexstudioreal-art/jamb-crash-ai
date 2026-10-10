-- Admin panel relied on these and silently failed:
-- 1. No UPDATE policy on user_roles, so the owner's role changes on users
--    who already had a role were always denied (first-time grants worked).
-- 2. Non-owner admins could not read the roles table, so UserManagement
--    showed every user as role-less to admins.

DROP POLICY IF EXISTS "Owner can update roles" ON public.user_roles;
CREATE POLICY "Owner can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_owner(auth.uid()))
WITH CHECK (public.is_owner(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin_or_owner(auth.uid()));
