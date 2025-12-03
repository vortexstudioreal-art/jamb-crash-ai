-- Add role column to admin_users table
ALTER TABLE public.admin_users ADD COLUMN role TEXT DEFAULT 'collaborator';

-- Clear existing test data and insert real admins
DELETE FROM public.admin_users;

INSERT INTO public.admin_users (email, role) VALUES
  ('loaborejim@gmail.com', 'owner'),
  ('favourgoodnews@gmail.com', 'collaborator'),
  ('onuchionwuegbusi@gmail.com', 'collaborator');