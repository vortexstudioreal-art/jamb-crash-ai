-- Create table for WhatsApp reminders
CREATE TABLE public.whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.whatsapp_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
ON public.whatsapp_reminders FOR ALL
USING (true)
WITH CHECK (true);

-- Create table for user progress and score predictions
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  questions_completed INTEGER DEFAULT 0,
  study_days_completed INTEGER DEFAULT 0,
  weak_subject TEXT,
  target_score INTEGER,
  predicted_score_min INTEGER,
  predicted_score_max INTEGER,
  plan_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
ON public.user_progress FOR ALL
USING (true)
WITH CHECK (true);

-- Create table for referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  discount_amount INTEGER DEFAULT 1000,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral codes"
ON public.referrals FOR SELECT
USING (true);

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their referrals"
ON public.referrals FOR UPDATE
USING (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  existing_code TEXT;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO existing_code FROM referrals WHERE referrer_email = user_email LIMIT 1;
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := 'JAMB' || upper(substring(md5(user_email || now()::text) from 1 for 6));
  
  INSERT INTO referrals (referrer_email, referral_code)
  VALUES (user_email, new_code);
  
  RETURN new_code;
END;
$$;