-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'collaborator');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- Security definer function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'admin')
  )
$$;

-- Function to get user's email from auth
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Trigger to auto-create profile and assign owner role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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
    VALUES (NEW.id, 'owner');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- RLS Policies for user_roles (only owner can manage)
CREATE POLICY "Anyone can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only owner can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Only owner can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_owner(auth.uid()));

-- Drop old admin_users policies and create secure ones
DROP POLICY IF EXISTS "Allow delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can check admin status" ON public.admin_users;

CREATE POLICY "Authenticated users can view admins"
ON public.admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only owner can insert admins"
ON public.admin_users FOR INSERT
TO authenticated
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Only owner can delete admins"
ON public.admin_users FOR DELETE
TO authenticated
USING (public.is_owner(auth.uid()));

-- Fix payments table policies - restrict to authenticated users viewing their own
DROP POLICY IF EXISTS "Users can view payments by reference" ON public.payments;
DROP POLICY IF EXISTS "Allow updating payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Only service role can update payments"
ON public.payments FOR UPDATE
TO authenticated
USING (public.is_owner(auth.uid()));

-- Fix quiz_attempts policies
DROP POLICY IF EXISTS "Users can manage their quizzes" ON public.quiz_attempts;

CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own quiz attempts"
ON public.quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can update own quiz attempts"
ON public.quiz_attempts FOR UPDATE
TO authenticated
USING (email = public.get_auth_email());

-- Fix user_progress policies
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own progress"
ON public.user_progress FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can update own progress"
ON public.user_progress FOR UPDATE
TO authenticated
USING (email = public.get_auth_email());

-- Fix user_subjects policies
DROP POLICY IF EXISTS "Users can manage their subjects" ON public.user_subjects;

CREATE POLICY "Users can view own subjects"
ON public.user_subjects FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own subjects"
ON public.user_subjects FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can update own subjects"
ON public.user_subjects FOR UPDATE
TO authenticated
USING (email = public.get_auth_email());

-- Fix whatsapp_reminders policies
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.whatsapp_reminders;

CREATE POLICY "Users can view own reminders"
ON public.whatsapp_reminders FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own reminders"
ON public.whatsapp_reminders FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can update own reminders"
ON public.whatsapp_reminders FOR UPDATE
TO authenticated
USING (email = public.get_auth_email());

CREATE POLICY "Users can delete own reminders"
ON public.whatsapp_reminders FOR DELETE
TO authenticated
USING (email = public.get_auth_email());

-- Fix demo_usage policies
DROP POLICY IF EXISTS "Anyone can check demo usage" ON public.demo_usage;

CREATE POLICY "Authenticated users can view demo usage"
ON public.demo_usage FOR SELECT
TO authenticated
USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Authenticated users can insert demo usage"
ON public.demo_usage FOR INSERT
TO authenticated
WITH CHECK (email = public.get_auth_email());

-- Fix referrals policies
DROP POLICY IF EXISTS "Anyone can view referral codes" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can update their referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (referrer_email = public.get_auth_email() OR referred_email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (referrer_email = public.get_auth_email());

CREATE POLICY "Users can update own referrals"
ON public.referrals FOR UPDATE
TO authenticated
USING (referrer_email = public.get_auth_email());

-- Fix feature_status policies
DROP POLICY IF EXISTS "Admins can manage features" ON public.feature_status;
DROP POLICY IF EXISTS "Anyone can read feature status" ON public.feature_status;

CREATE POLICY "Authenticated users can read feature status"
ON public.feature_status FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage features"
ON public.feature_status FOR ALL
TO authenticated
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Update check_user_access function to use proper auth
CREATE OR REPLACE FUNCTION public.check_user_access(user_email TEXT)
RETURNS TABLE(has_access BOOLEAN, is_admin BOOLEAN, package TEXT, expires_at TIMESTAMP WITH TIME ZONE, admin_role TEXT)
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
  
  -- Check if user has a role
  SELECT ur.role INTO v_role FROM user_roles ur WHERE ur.user_id = v_user_id;
  
  IF v_role IS NOT NULL THEN
    RETURN QUERY SELECT true, true, 'admin'::TEXT, NULL::TIMESTAMP WITH TIME ZONE, v_role::TEXT;
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