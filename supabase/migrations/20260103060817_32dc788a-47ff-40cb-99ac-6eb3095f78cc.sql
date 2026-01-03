-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT DEFAULT 'info',
  is_global BOOLEAN DEFAULT true,
  target_email TEXT,
  created_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create user notification reads table
CREATE TABLE public.user_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email TEXT NOT NULL,
  UNIQUE(email, notification_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can read global or targeted notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (is_global = true OR target_email = get_auth_email());

CREATE POLICY "Admins/owners can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_owner(auth.uid()));

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (is_admin_or_owner(auth.uid()));

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (is_admin_or_owner(auth.uid()));

-- RLS Policies for user_notification_reads
CREATE POLICY "Users can read their own notification reads"
  ON public.user_notification_reads FOR SELECT TO authenticated
  USING (email = get_auth_email());

CREATE POLICY "Users can mark notifications as read"
  ON public.user_notification_reads FOR INSERT TO authenticated
  WITH CHECK (email = get_auth_email());