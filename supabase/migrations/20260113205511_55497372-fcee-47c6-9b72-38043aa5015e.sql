-- Create ad_analytics table for tracking ad engagement
CREATE TABLE public.ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'ad_started', 'ad_completed', 'ad_failed', 'reward_claimed'
  feature_type TEXT NOT NULL,
  ad_source TEXT NOT NULL DEFAULT 'simulation', -- 'admob' or 'simulation'
  platform TEXT, -- 'web', 'ios', 'android'
  duration_watched INTEGER, -- seconds watched
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own ad analytics"
ON public.ad_analytics
FOR INSERT
WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own ad analytics"
ON public.ad_analytics
FOR SELECT
USING (email = (SELECT auth.email()));

-- Create index for faster queries
CREATE INDEX idx_ad_analytics_email ON public.ad_analytics(email);
CREATE INDEX idx_ad_analytics_event_type ON public.ad_analytics(event_type);
CREATE INDEX idx_ad_analytics_created_at ON public.ad_analytics(created_at DESC);