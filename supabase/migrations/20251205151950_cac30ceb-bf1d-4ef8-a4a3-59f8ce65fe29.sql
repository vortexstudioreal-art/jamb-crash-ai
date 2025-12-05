-- Fix admin_users SELECT policy - only admins/owners can view
DROP POLICY IF EXISTS "Authenticated users can view admins" ON public.admin_users;
CREATE POLICY "Only admins can view admin list"
ON public.admin_users FOR SELECT
TO authenticated
USING (public.is_admin_or_owner(auth.uid()));

-- Fix user_roles SELECT policy - users can only see their own role
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_owner(auth.uid()));

-- Add DELETE policies for user data tables
CREATE POLICY "Users can delete own quiz attempts"
ON public.quiz_attempts FOR DELETE
TO authenticated
USING (email = public.get_auth_email());

CREATE POLICY "Users can delete own progress"
ON public.user_progress FOR DELETE
TO authenticated
USING (email = public.get_auth_email());

CREATE POLICY "Users can delete own subjects"
ON public.user_subjects FOR DELETE
TO authenticated
USING (email = public.get_auth_email());

-- Add INSERT policy for profiles (handled by trigger but explicit policy is good)
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());