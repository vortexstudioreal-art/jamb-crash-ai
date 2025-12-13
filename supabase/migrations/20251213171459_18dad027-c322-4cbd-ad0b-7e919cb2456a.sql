-- Create trigger to automatically run handle_new_user on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- For existing users, manually create profiles and roles
-- First, insert profiles for any auth.users that don't have profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, raw_user_meta_data ->> 'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- Then insert roles for owner and collaborators
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role FROM public.profiles WHERE email = 'vortexstudio.real@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'collaborator'::app_role FROM public.profiles WHERE email IN ('muzzyothmam@gmail.com', 'saeedabdulbasit933@gmail.com')
ON CONFLICT DO NOTHING;