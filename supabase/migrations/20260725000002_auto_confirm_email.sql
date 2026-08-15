-- Auto-confirm user email (bypasses email verification)
-- SECURITY DEFINER so it can write to auth.users
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE email = user_email;
  RETURN FOUND;
END;
$$;
