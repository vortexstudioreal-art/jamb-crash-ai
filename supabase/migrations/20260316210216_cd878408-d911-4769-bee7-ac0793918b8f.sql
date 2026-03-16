-- Fix 1: Privilege escalation - drop overly broad collaborator update policy and create a restricted one
DROP POLICY IF EXISTS "Collaborators can update their own display_title" ON user_roles;
CREATE POLICY "Collaborators can update their own display_title"
ON user_roles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  role = (SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid() LIMIT 1)
);

-- Fix 2: Coupon usage fraud - drop permissive insert policy and create authenticated one
DROP POLICY IF EXISTS "Anyone can insert coupon usage" ON coupon_usage;
CREATE POLICY "Authenticated users can insert coupon usage"
ON coupon_usage FOR INSERT TO authenticated
WITH CHECK (used_by_email = get_auth_email());