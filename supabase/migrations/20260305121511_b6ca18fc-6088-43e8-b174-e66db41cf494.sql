CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.user_notes FOR SELECT USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));
CREATE POLICY "Users can insert own notes" ON public.user_notes FOR INSERT WITH CHECK (email = get_auth_email());
CREATE POLICY "Users can update own notes" ON public.user_notes FOR UPDATE USING (email = get_auth_email());
CREATE POLICY "Users can delete own notes" ON public.user_notes FOR DELETE USING (email = get_auth_email());