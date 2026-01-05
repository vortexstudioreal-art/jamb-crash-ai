-- Update existing user roles from 'collaborator' to 'admin' for team members
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE LOWER(email) IN ('muzzyothmam@gmail.com', 'saeedabdulbasit933@gmail.com')
);

-- Drop and recreate the handle_new_user function with correct role assignments
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- If this is the owner email, assign owner role
  IF NEW.email = 'vortexstudio.real@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  -- If these are admin emails, assign admin role (not collaborator)
  ELSIF LOWER(NEW.email) IN ('muzzyothmam@gmail.com', 'saeedabdulbasit933@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;