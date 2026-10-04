import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserPackage } from '@/contexts/AuthContext';
import { useTrialContext } from '@/contexts/TrialContext';
import { errorLogger } from '@/services/errorLogger';

export type FeatureType = 
  | 'pdf_upload'
  | 'study_plan_days'
  | 'syllabus_ai_explanation'
  | 'flashcard_generation'
  | 'quick_quiz'
  | 'subject_change';

// Daily limits per plan per feature
const FEATURE_LIMITS: Record<NonNullable<UserPackage>, Record<FeatureType, number>> = {
  basic: {
    pdf_upload: 2,
    study_plan_days: 5,
    syllabus_ai_explanation: 5,
    flashcard_generation: 3,
    quick_quiz: 3, // 1 per topic, max 3 per subject
    subject_change: 1,
  },
  pro: {
    pdf_upload: Infinity,
    study_plan_days: Infinity,
    syllabus_ai_explanation: Infinity,
    flashcard_generation: Infinity,
    quick_quiz: Infinity,
    subject_change: Infinity,
  },
  premium: {
    pdf_upload: Infinity,
    study_plan_days: Infinity,
    syllabus_ai_explanation: Infinity,
    flashcard_generation: Infinity,
    quick_quiz: Infinity,
    subject_change: Infinity,
  },
  admin: {
    pdf_upload: Infinity,
    study_plan_days: Infinity,
    syllabus_ai_explanation: Infinity,
    flashcard_generation: Infinity,
    quick_quiz: Infinity,
    subject_change: Infinity,
  },
};

interface FeatureUsageData {
  feature_type: string;
  usage_count: number;
  bonus_uses: number;
}

export const useFeatureUsage = () => {
  const { user, userPackage, isAdmin, isOwner } = useAuth();
  const [usageData, setUsageData] = useState<Record<FeatureType, number>>({
    pdf_upload: 0,
    study_plan_days: 0,
    syllabus_ai_explanation: 0,
    flashcard_generation: 0,
    quick_quiz: 0,
    subject_change: 0,
  });
  const [bonusData, setBonusData] = useState<Record<FeatureType, number>>({
    pdf_upload: 0,
    study_plan_days: 0,
    syllabus_ai_explanation: 0,
    flashcard_generation: 0,
    quick_quiz: 0,
    subject_change: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Use shared trial state from context
  const { isTrialActive } = useTrialContext();

  const userEmail = user?.email?.toLowerCase();

  // Fetch today's usage
  const fetchUsage = useCallback(async () => {
    if (!userEmail) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('feature_usage')
        .select('feature_type, usage_count, bonus_uses')
        .eq('email', userEmail)
        .eq('usage_date', today);

      if (error) {
        errorLogger.error(error, { component: 'useFeatureUsage', action: 'fetchUsage' });
        return;
      }

      const usage: Record<FeatureType, number> = {
        pdf_upload: 0,
        study_plan_days: 0,
        syllabus_ai_explanation: 0,
        flashcard_generation: 0,
        quick_quiz: 0,
        subject_change: 0,
      };

      const bonus: Record<FeatureType, number> = {
        pdf_upload: 0,
        study_plan_days: 0,
        syllabus_ai_explanation: 0,
        flashcard_generation: 0,
        quick_quiz: 0,
        subject_change: 0,
      };

      (data as FeatureUsageData[] || []).forEach((item) => {
        if (item.feature_type in usage) {
          usage[item.feature_type as FeatureType] = item.usage_count;
          bonus[item.feature_type as FeatureType] = item.bonus_uses || 0;
        }
      });

      setUsageData(usage);
      setBonusData(bonus);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Get limit for a feature based on user's package
  const getLimit = useCallback((feature: FeatureType): number => {
    // Admins/owners have no limits
    if (isAdmin || isOwner) return Infinity;
    
    // Trial users get Pro limits (unlimited)
    if (isTrialActive) return FEATURE_LIMITS.pro[feature];
    
    // Package-based limits (default to basic for unauthenticated)
    return FEATURE_LIMITS[userPackage || 'basic'][feature];
  }, [userPackage, isAdmin, isOwner, isTrialActive]);

  // Check if user can use a feature (including bonus uses)
  const canUseFeature = useCallback((feature: FeatureType): boolean => {
    const limit = getLimit(feature);
    if (limit === Infinity) return true;
    const used = usageData[feature];
    const bonus = bonusData[feature];
    return used < (limit + bonus);
  }, [getLimit, usageData, bonusData]);

  // Get remaining uses for a feature (including bonus uses)
  const getRemainingUses = useCallback((feature: FeatureType): number => {
    const limit = getLimit(feature);
    if (limit === Infinity) return Infinity;
    const totalLimit = limit + bonusData[feature];
    return Math.max(0, totalLimit - usageData[feature]);
  }, [getLimit, usageData, bonusData]);

  // Increment usage for a feature
  const incrementUsage = useCallback(async (feature: FeatureType): Promise<boolean> => {
    if (!userEmail) return false;
    
    // Check if can use first
    if (!canUseFeature(feature)) return false;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Try to upsert the usage record
      const { error } = await supabase
        .from('feature_usage')
        .upsert(
          {
            email: userEmail,
            feature_type: feature,
            usage_date: today,
            usage_count: usageData[feature] + 1,
          },
          {
            onConflict: 'email,feature_type,usage_date',
          }
        );

      if (error) {
        errorLogger.error(error, { component: 'useFeatureUsage', action: 'incrementUsage' });
        return false;
      }

      // Update local state
      setUsageData(prev => ({
        ...prev,
        [feature]: prev[feature] + 1,
      }));

      return true;
    } catch (err) {
      errorLogger.error(err, { component: 'useFeatureUsage', action: 'incrementUsage' });
      return false;
    }
  }, [userEmail, usageData, canUseFeature]);

  // Get usage summary for display
  const getUsageSummary = useCallback((feature: FeatureType): { used: number; limit: number; remaining: number; bonus: number } => {
    const limit = getLimit(feature);
    const used = usageData[feature];
    const bonus = bonusData[feature];
    const totalLimit = limit === Infinity ? -1 : limit + bonus;
    return {
      used,
      limit: limit === Infinity ? -1 : limit,
      remaining: limit === Infinity ? -1 : Math.max(0, totalLimit - used),
      bonus,
    };
  }, [getLimit, usageData, bonusData]);

  // Add bonus use after watching ad
  const addBonusUse = useCallback(async (feature: FeatureType, amount: number = 1): Promise<boolean> => {
    if (!userEmail) return false;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const newBonus = bonusData[feature] + amount;
      
      const { error } = await supabase
        .from('feature_usage')
        .upsert(
          {
            email: userEmail,
            feature_type: feature,
            usage_date: today,
            usage_count: usageData[feature],
            bonus_uses: newBonus,
          },
          {
            onConflict: 'email,feature_type,usage_date',
          }
        );

      if (error) {
        errorLogger.error(error, { component: 'useFeatureUsage', action: 'addBonusUse' });
        return false;
      }

      // Update local state
      setBonusData(prev => ({
        ...prev,
        [feature]: prev[feature] + amount,
      }));

      return true;
    } catch (err) {
      errorLogger.error(err, { component: 'useFeatureUsage', action: 'addBonusUse' });
      return false;
    }
  }, [userEmail, usageData, bonusData]);

  return {
    usageData,
    bonusData,
    isLoading,
    canUseFeature,
    getRemainingUses,
    incrementUsage,
    getUsageSummary,
    getLimit,
    refreshUsage: fetchUsage,
    addBonusUse,
  };
};

// Feature name mappings for UI display
export const FEATURE_NAMES: Record<FeatureType, string> = {
  pdf_upload: 'PDF Upload',
  study_plan_days: 'Study Plan Days',
  syllabus_ai_explanation: 'AI Explanation',
  flashcard_generation: 'Flashcard Generation',
  quick_quiz: 'Quick Quiz',
  subject_change: 'Subject Change',
};

// Required plan for each blocked feature
export const BLOCKED_FEATURE_REQUIRED_PLAN: Record<string, 'pro' | 'premium'> = {
  practice_quiz: 'pro',
  ai_score_prediction: 'pro',
  whatsapp_reminder: 'premium',
  refer_earn: 'premium',
  email_reminder: 'pro',
  ai_study_tips: 'pro',
  advanced_ai_prediction: 'premium',
};