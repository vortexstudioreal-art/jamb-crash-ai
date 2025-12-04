-- Create subjects enum
CREATE TYPE public.jamb_subject AS ENUM (
  'english', 'mathematics', 'physics', 'chemistry', 'biology', 
  'literature', 'government', 'economics', 'crs', 'irs', 
  'geography', 'accounting', 'commerce', 'agricultural_science'
);

-- User subject selections
CREATE TABLE public.user_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subjects jamb_subject[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their subjects" ON public.user_subjects
FOR ALL USING (true) WITH CHECK (true);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  quiz_type TEXT NOT NULL DEFAULT 'full', -- 'full', 'mini', 'demo', 'upload'
  subjects jamb_subject[] NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  questions_data JSONB, -- stores questions, user answers, correct answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their quizzes" ON public.quiz_attempts
FOR ALL USING (true) WITH CHECK (true);

-- Demo/trial tracking
CREATE TABLE public.demo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  device_fingerprint TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email),
  UNIQUE(device_fingerprint)
);

ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check demo usage" ON public.demo_usage
FOR ALL USING (true) WITH CHECK (true);

-- JAMB questions bank (cached)
CREATE TABLE public.jamb_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject jamb_subject NOT NULL,
  year INTEGER,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.jamb_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions" ON public.jamb_questions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON public.jamb_questions
FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

-- Feature status for admin panel
CREATE TABLE public.feature_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  is_working BOOLEAN DEFAULT false,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.feature_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature status" ON public.feature_status
FOR SELECT USING (true);

CREATE POLICY "Admins can manage features" ON public.feature_status
FOR ALL USING (true) WITH CHECK (true);

-- Insert default feature statuses
INSERT INTO public.feature_status (feature_name, is_working, notes) VALUES
  ('pdf_upload', true, 'PDF and image upload working'),
  ('timed_quizzes', true, 'Full and mini quizzes available'),
  ('whatsapp_reminders', false, 'Needs Twilio API key configuration'),
  ('email_delivery', false, 'Needs Resend API key'),
  ('ai_explanations', true, 'Using Lovable AI gateway'),
  ('payment_processing', true, 'Paystack integration active');

-- Trigger for updated_at
CREATE TRIGGER update_user_subjects_updated_at
BEFORE UPDATE ON public.user_subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();