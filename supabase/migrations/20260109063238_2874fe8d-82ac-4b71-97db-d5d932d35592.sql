-- Allow collaborators to update their own display_title (but not role)
CREATE POLICY "Collaborators can update their own display_title"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());