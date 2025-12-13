-- Insert owner role for the owner email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role FROM public.profiles WHERE email = 'vortexstudio.real@gmail.com'
ON CONFLICT DO NOTHING;

-- Insert collaborator roles for collaborator emails
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'collaborator'::app_role FROM public.profiles WHERE email IN ('muzzyothmam@gmail.com', 'saeedabdulbasit933@gmail.com')
ON CONFLICT DO NOTHING;