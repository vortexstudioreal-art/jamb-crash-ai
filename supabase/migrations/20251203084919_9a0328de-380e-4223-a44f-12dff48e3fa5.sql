-- Add unique constraints for upsert to work
ALTER TABLE public.whatsapp_reminders ADD CONSTRAINT whatsapp_reminders_email_unique UNIQUE (email);
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_email_unique UNIQUE (email);