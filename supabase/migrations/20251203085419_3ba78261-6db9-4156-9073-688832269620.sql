-- Drop and recreate check_user_access with admin_role
DROP FUNCTION IF EXISTS public.check_user_access(text);

CREATE FUNCTION public.check_user_access(user_email text)
RETURNS TABLE(has_access boolean, is_admin boolean, package text, expires_at timestamp with time zone, admin_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if admin first
  SELECT role INTO v_role FROM admin_users WHERE email = user_email;
  IF v_role IS NOT NULL THEN
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, v_role;
    RETURN;
  END IF;
  
  -- Check for active payment
  RETURN QUERY
  SELECT 
    CASE WHEN p.access_expires_at > now() THEN true ELSE false END,
    false,
    p.package,
    p.access_expires_at,
    NULL::TEXT
  FROM payments p
  WHERE p.email = user_email 
    AND p.status = 'success'
  ORDER BY p.access_expires_at DESC NULLS LAST
  LIMIT 1;
  
  -- If no payment found, return no access
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
  END IF;
END;
$$;