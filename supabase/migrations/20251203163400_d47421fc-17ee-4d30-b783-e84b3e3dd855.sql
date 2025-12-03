-- Allow inserting new admin users (for adding collaborators)
CREATE POLICY "Allow insert admin users"
ON public.admin_users
FOR INSERT
WITH CHECK (true);

-- Allow deleting admin users (for removing collaborators)
CREATE POLICY "Allow delete admin users"
ON public.admin_users
FOR DELETE
USING (true);