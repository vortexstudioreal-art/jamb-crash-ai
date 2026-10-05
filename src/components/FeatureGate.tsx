import { ReactNode, useState } from 'react';
import { useAuth, PACKAGE_FEATURES } from '@/contexts/AuthContext';
import { useTrialContext } from '@/contexts/TrialContext';
import { useFeatureUsage, FeatureType } from '@/hooks/useFeatureUsage';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { UpgradeModal } from '@/components/UpgradeModal';

// Feature types that map to plan features
export type PlanFeature = 
  | 'fullQuiz'
  | 'miniQuiz'
  | 'studyMaterials'
  | 'studyStats'
  | 'recentProgress'
  | 'subjectPerformance'
  | 'practiceQuiz'
  | 'aiScorePrediction'
  | 'whatsAppReminders'
  | 'referralBonus'
  | 'emailReminder'
  | 'aiStudyTips'
  | 'advancedPrediction';

interface FeatureGateProps {
  children: ReactNode;
  feature: PlanFeature;
  fallback?: ReactNode;
  onUpgrade?: () => void;
}

// Map feature names to package property keys
const featureToPackageKey: Record<PlanFeature, keyof typeof PACKAGE_FEATURES.basic> = {
  fullQuiz: 'hasFullQuiz',
  miniQuiz: 'hasMiniQuiz',
  studyMaterials: 'hasStudyMaterials',
  studyStats: 'hasStudyStats',
  recentProgress: 'hasRecentProgress',
  subjectPerformance: 'hasSubjectPerformance',
  practiceQuiz: 'hasPracticeQuiz',
  aiScorePrediction: 'hasAiScorePrediction',
  whatsAppReminders: 'hasWhatsAppReminders',
  referralBonus: 'hasReferralBonus',
  emailReminder: 'hasEmailReminder',
  aiStudyTips: 'hasAiStudyTips',
  advancedPrediction: 'hasAdvancedPrediction',
};

const featureNames: Record<PlanFeature, string> = {
  fullQuiz: 'Full Quiz',
  miniQuiz: 'Mini Quiz',
  studyMaterials: 'Study Materials',
  studyStats: 'Study Stats',
  recentProgress: 'Recent Progress',
  subjectPerformance: 'Subject Performance',
  practiceQuiz: 'Practice Quiz',
  aiScorePrediction: 'AI Score Prediction',
  whatsAppReminders: 'WhatsApp Reminders',
  referralBonus: 'Refer & Boost',
  emailReminder: 'Email Reminders',
  aiStudyTips: 'AI Study Tips',
  advancedPrediction: 'Advanced Prediction',
};

const requiredPackage: Record<PlanFeature, 'basic' | 'pro' | 'premium'> = {
  fullQuiz: 'basic',
  miniQuiz: 'basic',
  studyMaterials: 'basic',
  studyStats: 'basic',
  recentProgress: 'basic',
  subjectPerformance: 'basic',
  practiceQuiz: 'basic',
  aiScorePrediction: 'pro',
  whatsAppReminders: 'premium',
  referralBonus: 'premium',
  emailReminder: 'pro',
  aiStudyTips: 'pro',
  advancedPrediction: 'premium',
};

const packageNameDisplay: Record<string, string> = {
  basic: 'Free',
  pro: 'ACE',
  premium: 'SCHOLAR',
};

// Pro features available during trial
const TRIAL_FEATURES: PlanFeature[] = [
  'fullQuiz',
  'miniQuiz',
  'studyMaterials',
  'studyStats',
  'recentProgress',
  'subjectPerformance',
  'practiceQuiz',
  'aiScorePrediction',
  'emailReminder',
  'aiStudyTips',
];

export const FeatureGate = ({ children, feature, fallback, onUpgrade }: FeatureGateProps) => {
  const { isAdmin, isOwner, packageFeatures } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Check if user is in trial using shared context
  const { isTrialActive } = useTrialContext();

  // Admins and owners have access to everything
  if (isAdmin || isOwner) {
    return <>{children}</>;
  }

  // Trial users get Pro features (full access during trial)
  if (isTrialActive && TRIAL_FEATURES.includes(feature)) {
    return <>{children}</>;
  }

  // Check if user's package includes this feature
  const packageKey = featureToPackageKey[feature];
  const hasFeatureAccess = packageFeatures[packageKey] === true;

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  // Show fallback or default locked message
  if (fallback) {
    return <>{fallback}</>;
  }

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative p-6 rounded-xl bg-muted/50 border border-border"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 rounded-xl" />
        <div className="relative text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {featureNames[feature]} Locked
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to {packageNameDisplay[requiredPackage[feature]] || requiredPackage[feature]} to unlock this feature
          </p>
          <Button onClick={handleUpgradeClick} className="gradient-primary">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to {packageNameDisplay[requiredPackage[feature]] || requiredPackage[feature]}
          </Button>
        </div>
      </motion.div>
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={featureNames[feature]}
        requiredPlan={requiredPackage[feature]}
        onUpgrade={(_plan) => {
          setShowUpgradeModal(false);
          if (onUpgrade) onUpgrade();
        }}
      />
    </>
  );
};

// Hook to check feature access without rendering
export const useFeatureAccess = () => {
  const { userPackage, packageFeatures, isAdmin, isOwner } = useAuth();
  const featureUsage = useFeatureUsage();
  
  // Check if user is in trial using shared context
  const { isTrialActive } = useTrialContext();

  const hasFeature = (feature: string): boolean => {
    // Admins and owners have all features
    if (isAdmin || isOwner) return true;

    const planFeature = feature as PlanFeature;

    // Trial users get Pro features (full access)
    if (isTrialActive && TRIAL_FEATURES.includes(planFeature)) {
      return true;
    }

    // Check package (unknown features are treated as locked)
    const packageKey = featureToPackageKey[planFeature];
    if (!packageKey) return false;
    return packageFeatures[packageKey] === true;
  };

  const getMaxQuizQuestions = (): number => {
    // Admins/owners get unlimited
    if (isAdmin || isOwner) return 60;
    // Trial users get Pro-level quiz (60 questions)
    if (isTrialActive) return 60;
    // Package-based
    return packageFeatures.maxQuizQuestions;
  };

  // Check daily usage limits
  const canUseWithLimit = (limitedFeature: FeatureType): boolean => {
    // Admins/owners have no limits
    if (isAdmin || isOwner) return true;
    // Pro/Premium have no limits
    if (userPackage === 'pro' || userPackage === 'premium') return true;
    // Trial users get Pro limits (unlimited)
    if (isTrialActive) return true;
    // Basic users check daily limits
    return featureUsage.canUseFeature(limitedFeature);
  };

  const getUsageInfo = (limitedFeature: FeatureType) => {
    return featureUsage.getUsageSummary(limitedFeature);
  };

  const trackUsage = async (limitedFeature: FeatureType): Promise<boolean> => {
    // Admins/owners don't need tracking
    if (isAdmin || isOwner) return true;
    // Pro/Premium don't need tracking
    if (userPackage === 'pro' || userPackage === 'premium') return true;
    // Trial users don't need tracking (unlimited during trial)
    if (isTrialActive) return true;
    // Basic users track usage
    return featureUsage.incrementUsage(limitedFeature);
  };

  return {
    hasFeature,
    getMaxQuizQuestions,
    canUseWithLimit,
    getUsageInfo,
    trackUsage,
    packageFeatures,
    userPackage,
    isInTrial: isTrialActive,
    refreshUsage: featureUsage.refreshUsage,
  };
};