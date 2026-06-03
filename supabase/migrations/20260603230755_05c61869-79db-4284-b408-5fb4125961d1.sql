
-- 1. Add full-book PDF fields to novels
ALTER TABLE public.novels
  ADD COLUMN IF NOT EXISTS full_book_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS full_book_pdf_path TEXT;

-- 2. Subject books (recommended textbook PDFs per subject)
CREATE TABLE IF NOT EXISTS public.subject_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  year INTEGER,
  description TEXT,
  pdf_url TEXT,
  pdf_path TEXT,
  cover_image_url TEXT,
  uploaded_by TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subject_books TO anon, authenticated;
GRANT ALL ON public.subject_books TO service_role;
ALTER TABLE public.subject_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subject books"
  ON public.subject_books FOR SELECT
  USING (is_active = true OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Admins can manage subject books"
  ON public.subject_books FOR ALL
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE TRIGGER set_subject_books_updated_at
  BEFORE UPDATE ON public.subject_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Airtime rewards (replacing cash referral credits)
CREATE TABLE IF NOT EXISTS public.airtime_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 200,
  phone TEXT,
  network TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | claimed | sent | failed
  source TEXT NOT NULL DEFAULT 'referral',
  referral_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE ON public.airtime_rewards TO authenticated;
GRANT ALL ON public.airtime_rewards TO service_role;
ALTER TABLE public.airtime_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own airtime rewards"
  ON public.airtime_rewards FOR SELECT
  USING (email = public.get_auth_email() OR public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can claim own airtime (update phone/network/status to claimed)"
  ON public.airtime_rewards FOR UPDATE
  USING (email = public.get_auth_email() AND status IN ('pending','claimed'))
  WITH CHECK (email = public.get_auth_email() AND status IN ('pending','claimed'));

CREATE POLICY "Admins can manage airtime rewards"
  ON public.airtime_rewards FOR ALL
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- 4. App settings (exam date etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Seed JAMB exam date (admin can change later via UI)
INSERT INTO public.app_settings (key, value)
VALUES ('jamb_exam_date', '"2027-04-24T08:00:00Z"'::jsonb)
ON CONFLICT (key) DO NOTHING;
