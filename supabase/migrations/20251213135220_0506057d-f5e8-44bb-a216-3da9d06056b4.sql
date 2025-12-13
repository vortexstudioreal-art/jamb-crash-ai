-- Create feature usage tracking table for daily limits
CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  feature_type TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email, feature_type, usage_date)
);

-- Enable RLS
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own feature usage"
ON public.feature_usage
FOR SELECT
USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));

-- Users can insert their own usage
CREATE POLICY "Users can insert own feature usage"
ON public.feature_usage
FOR INSERT
WITH CHECK (email = get_auth_email());

-- Users can update their own usage
CREATE POLICY "Users can update own feature usage"
ON public.feature_usage
FOR UPDATE
USING (email = get_auth_email());

-- Users can delete their own usage (for cleanup)
CREATE POLICY "Users can delete own feature usage"
ON public.feature_usage
FOR DELETE
USING (email = get_auth_email());

-- Create index for faster lookups
CREATE INDEX idx_feature_usage_email_date ON public.feature_usage(email, usage_date);
CREATE INDEX idx_feature_usage_feature_type ON public.feature_usage(feature_type);

-- Trigger for updated_at
CREATE TRIGGER update_feature_usage_updated_at
BEFORE UPDATE ON public.feature_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();