import { ReactNode } from 'react';
import { useAuth, PACKAGE_FEATURES, UserPackage } from '@/contexts/AuthContext';
import { useFreeTrialTimer } from '@/hooks/useFreeTrialTimer';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FeatureGateProps {
  children: ReactNode;
  feature: 'studyMaterials' | 'whatsAppReminders' | 'predictedScore' | 'subjectPractice' | 'advancedPrediction' | 'referralBonus' | 'fullQuiz';
  fallback?: ReactNode;
  onUpgrade?: () => void;
}

const featureToPackage: Record<FeatureGateProps['feature'], UserPackage[]> = {
  studyMaterials: ['pro', 'premium', 'admin'],
  whatsAppReminders: ['pro', 'premium', 'admin'],
  predictedScore: ['pro', 'premium', 'admin'],
  subjectPractice: ['pro', 'premium', 'admin'],
  advancedPrediction: ['premium', 'admin'],
  referralBonus: ['premium', 'admin'],
  fullQuiz: ['pro', 'premium', 'admin'],
};

const featureNames: Record<FeatureGateProps['feature'], string> = {
  studyMaterials: 'Study Materials',
  whatsAppReminders: 'WhatsApp Reminders',
  predictedScore: 'Score Prediction',
  subjectPractice: 'Subject Practice Mode',
  advancedPrediction: 'Advanced Prediction',
  referralBonus: 'Referral Bonus',
  fullQuiz: 'Full 60-Question Quiz',
};

const requiredPackage: Record<FeatureGateProps['feature'], string> = {
  studyMaterials: 'Pro',
  whatsAppReminders: 'Pro',
  predictedScore: 'Pro',
  subjectPractice: 'Pro',
  advancedPrediction: 'Premium',
  referralBonus: 'Premium',
  fullQuiz: 'Pro',
};

// Pro features available during trial
const PRO_FEATURES: FeatureGateProps['feature'][] = [
  'studyMaterials', 
  'whatsAppReminders', 
  'predictedScore', 
  'subjectPractice', 
  'fullQuiz'
];

export const FeatureGate = ({ children, feature, fallback, onUpgrade }: FeatureGateProps) => {
  const { userPackage, isAdmin, isOwner, hasAccess, user } = useAuth();
  
  // Check if user is in trial - trial users get FULL Pro access
  const { isInTrial } = useFreeTrialTimer({
    userEmail: user?.email || null,
    isAdmin: isAdmin || isOwner,
    hasAccess,
  });

  // Admins and owners have access to everything
  if (isAdmin || isOwner) {
    return <>{children}</>;
  }

  // Trial users get FULL Pro features (all Pro features unlocked)
  if (isInTrial && PRO_FEATURES.includes(feature)) {
    return <>{children}</>;
  }

  // Check if user's package includes this feature
  const allowedPackages = featureToPackage[feature];
  const hasFeatureAccess = userPackage && allowedPackages.includes(userPackage);

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  // Show fallback or default locked message
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
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
          Upgrade to {requiredPackage[feature]} to unlock this feature
        </p>
        {onUpgrade && (
          <Button onClick={onUpgrade} className="gradient-primary">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to {requiredPackage[feature]}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Hook to check feature access without rendering
export const useFeatureAccess = () => {
  const { userPackage, packageFeatures, isAdmin, isOwner, hasAccess, user } = useAuth();
  
  // Check if user is in trial
  const { isInTrial } = useFreeTrialTimer({
    userEmail: user?.email || null,
    isAdmin: isAdmin || isOwner,
    hasAccess,
  });

  const hasFeature = (feature: FeatureGateProps['feature']): boolean => {
    // Admins and owners have all features
    if (isAdmin || isOwner) return true;
    
    // Trial users get FULL Pro features
    if (isInTrial && PRO_FEATURES.includes(feature)) {
      return true;
    }
    
    // Check package
    if (!userPackage) return false;
    
    const allowedPackages = featureToPackage[feature];
    return allowedPackages.includes(userPackage);
  };

  const getMaxQuizQuestions = (): number => {
    // Admins/owners get unlimited
    if (isAdmin || isOwner) return 60;
    // Trial users get Pro-level quiz (60 questions)
    if (isInTrial) return 60;
    // Package-based
    return packageFeatures.maxQuizQuestions;
  };

  const getMaxPdfUploads = (): number => {
    // Admins/owners get unlimited
    if (isAdmin || isOwner) return 999;
    // Trial users get unlimited PDFs during trial
    if (isInTrial) return 999;
    // Package-based
    return packageFeatures.maxPdfUploads;
  };

  return {
    hasFeature,
    getMaxQuizQuestions,
    getMaxPdfUploads,
    packageFeatures,
    userPackage,
    isInTrial,
  };
};