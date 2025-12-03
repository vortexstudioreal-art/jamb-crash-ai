-- Create admin_users table for permanent access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if email is admin (for access control)
CREATE POLICY "Anyone can check admin status"
ON public.admin_users
FOR SELECT
USING (true);

-- Insert admin emails
INSERT INTO public.admin_users (email) VALUES 
  ('collaborator1@gmail.com'),
  ('collaborator2@gmail.com');

-- Create function to check if user has active access
CREATE OR REPLACE FUNCTION public.check_user_access(user_email TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  is_admin BOOLEAN,
  package TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if admin first
  IF EXISTS (SELECT 1 FROM admin_users WHERE email = user_email) THEN
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Check for active payment
  RETURN QUERY
  SELECT 
    CASE WHEN p.access_expires_at > now() THEN true ELSE false END,
    false,
    p.package,
    p.access_expires_at
  FROM payments p
  WHERE p.email = user_email 
    AND p.status = 'success'
  ORDER BY p.access_expires_at DESC NULLS LAST
  LIMIT 1;
  
  -- If no payment found, return no access
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$;