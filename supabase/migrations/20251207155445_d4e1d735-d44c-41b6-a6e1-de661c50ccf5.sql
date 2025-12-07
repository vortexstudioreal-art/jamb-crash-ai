-- Add collaborator email to admin_users if not exists
INSERT INTO public.admin_users (email, role)
VALUES ('muzzyothmam@gmail.com', 'collaborator')
ON CONFLICT (email) DO NOTHING;

-- Update the handle_new_user function to also assign collaborator role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- If this is the owner email, assign owner role
  IF NEW.email = 'saeedabdulbasit933@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  -- If this is the collaborator email, assign collaborator role  
  ELSIF NEW.email = 'muzzyothmam@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'collaborator')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update check_user_access to recognize collaborator as admin with full access
CREATE OR REPLACE FUNCTION public.check_user_access(user_email text)
RETURNS TABLE(has_access boolean, is_admin boolean, package text, expires_at timestamp with time zone, admin_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role app_role;
BEGIN
  -- Get user_id from profiles
  SELECT p.id INTO v_user_id FROM profiles p WHERE p.email = user_email;
  
  -- Check if user has a role in user_roles table
  SELECT ur.role INTO v_role FROM user_roles ur WHERE ur.user_id = v_user_id;
  
  IF v_role IS NOT NULL THEN
    -- Owner, admin, and collaborator all get full access
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, v_role::TEXT;
    RETURN;
  END IF;
  
  -- Also check admin_users table for backward compatibility
  IF EXISTS (SELECT 1 FROM admin_users au WHERE au.email = user_email) THEN
    SELECT au.role INTO v_role FROM admin_users au WHERE au.email = user_email;
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, COALESCE(v_role, 'collaborator')::TEXT;
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