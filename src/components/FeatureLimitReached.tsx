import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Play, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_NAMES, FeatureType, useFeatureUsage } from '@/hooks/useFeatureUsage';
import { WatchAdModal } from './WatchAdModal';
import { UpgradeModal } from './UpgradeModal';
import { isMobileApp } from '@/config/admob';
import { toast } from 'sonner';

interface FeatureLimitReachedProps {
  featureType: FeatureType;
  onBonusEarned: () => void;
  className?: string;
  compact?: boolean;
}

const BONUS_AMOUNTS: Partial<Record<FeatureType, number>> = {
  quick_quiz: 20,
};

export const FeatureLimitReached = ({
  featureType,
  onBonusEarned,
  className = '',
  compact = false,
}: FeatureLimitReachedProps) => {
  const [showAdModal, setShowAdModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { addBonusUse } = useFeatureUsage();

  const bonusAmount = BONUS_AMOUNTS[featureType] ?? 1;
  const featureName = FEATURE_NAMES[featureType];
  // Rewarded ads only exist in the native app — on web the modal renders
  // nothing, so route the tap to an explanation instead of a dead click.
  const handleWatchAdPress = () => {
    if (!isMobileApp()) {
      toast.info('Reward ads live in the mobile app — download it to earn bonus uses.');
      return;
    }
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    const success = await addBonusUse(featureType, bonusAmount);
    if (success) {
      toast.success(`+${bonusAmount} ${featureName} ${bonusAmount > 1 ? 'uses' : 'use'} added!`);
      onBonusEarned();
    } else {
      toast.error('Failed to add bonus use');
    }
    setShowAdModal(false);
  };

  const handleUpgrade = (_plan: string) => {
    setShowUpgradeModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg ${className}`}
        >
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-sm text-foreground flex-1">
            Daily limit reached
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleWatchAdPress}
              className="text-xs h-7 px-2"
            >
              <Play className="w-3 h-3 mr-1" />
              +{bonusAmount} Free
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs h-7 px-2 bg-primary"
            >
              Upgrade
            </Button>
          </div>
        </motion.div>

        <WatchAdModal
          isOpen={showAdModal}
          onClose={() => setShowAdModal(false)}
          onComplete={handleAdComplete}
          featureType={featureType}
          bonusAmount={bonusAmount}
        />
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={featureName}
          requiredPlan="pro"
          onUpgrade={handleUpgrade}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-card border border-border rounded-xl p-6 text-center ${className}`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">
          Daily Limit Reached
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          You've used all your {featureName.toLowerCase()} allowance for today.
          <br />
          Get more access now!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleWatchAdPress}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Watch Ad for +{bonusAmount} {bonusAmount > 1 ? 'Uses' : 'Use'}
          </Button>
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to ACE
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          ACE users get unlimited {featureName.toLowerCase()} access
        </p>
      </motion.div>

      <WatchAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
        featureType={featureType}
        bonusAmount={bonusAmount}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={featureName}
        requiredPlan="pro"
        onUpgrade={handleUpgrade}
      />
    </>
  );
};
