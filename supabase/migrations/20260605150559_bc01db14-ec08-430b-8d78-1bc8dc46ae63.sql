
-- 1. coupon_codes: restrict SELECT to authenticated, hide creator_email column
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupon_codes;
CREATE POLICY "Authenticated users can view active coupons"
ON public.coupon_codes FOR SELECT
TO authenticated
USING (is_active = true);

REVOKE SELECT ON public.coupon_codes FROM anon;
REVOKE SELECT (creator_email) ON public.coupon_codes FROM authenticated;
-- Admins still see everything through the "Admins can manage coupons" ALL policy

-- 2. coupon_usage: restrict to authenticated role only
DROP POLICY IF EXISTS "Users can view their own usage" ON public.coupon_usage;
CREATE POLICY "Users can view their own usage"
ON public.coupon_usage FOR SELECT
TO authenticated
USING ((used_by_email = get_auth_email()) OR is_admin_or_owner(auth.uid()));

REVOKE SELECT ON public.coupon_usage FROM anon;

-- 3. notifications: hide created_by_email from non-admins
REVOKE SELECT (created_by_email) ON public.notifications FROM authenticated, anon;
GRANT SELECT (id, title, message, type, link, is_global, target_email, expires_at, created_at)
  ON public.notifications TO authenticated;

-- 4. leaderboard_scores: hide email column from authenticated users (admins still see via ALL)
REVOKE SELECT (email) ON public.leaderboard_scores FROM authenticated, anon;
GRANT SELECT (id, user_id, full_name, total_score, questions_answered,
              average_accuracy, best_quiz_score, rank, is_placeholder,
              created_at, updated_at)
  ON public.leaderboard_scores TO authenticated;

-- 5. user_roles: prevent privilege escalation through the display_title update policy
DROP POLICY IF EXISTS "Collaborators can update their own display_title" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.prevent_user_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Owners can change anything
  IF public.is_owner(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- For non-owners (collaborator editing own row), only display_title may change
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change role or user_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_role_self_escalation_trg ON public.user_roles;
CREATE TRIGGER prevent_user_role_self_escalation_trg
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_user_role_self_escalation();

CREATE POLICY "Users can update only their display_title"
ON public.user_roles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. topic_frequency view: run with the querying user's permissions
ALTER VIEW public.topic_frequency SET (security_invoker = true);
