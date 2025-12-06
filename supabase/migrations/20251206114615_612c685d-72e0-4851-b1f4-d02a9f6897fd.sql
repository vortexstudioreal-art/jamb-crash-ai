-- Add collaborator muzzyothman@gmail.com with permanent access
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'collaborator'::app_role
FROM public.profiles p
WHERE p.email = 'muzzyothman@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure they're in admin_users table for access control
INSERT INTO public.admin_users (email, role)
VALUES ('muzzyothman@gmail.com', 'collaborator')
ON CONFLICT (email) DO UPDATE SET role = 'collaborator';