-- Add bonus_uses column to feature_usage table for video ad rewards
ALTER TABLE public.feature_usage ADD COLUMN IF NOT EXISTS bonus_uses INTEGER DEFAULT 0;