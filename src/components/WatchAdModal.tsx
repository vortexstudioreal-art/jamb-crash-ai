import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_NAMES, FeatureType } from '@/hooks/useFeatureUsage';
import { getAdUnitForFeature, isMobileApp } from '@/config/admob';
import { useAdAnalytics } from '@/hooks/useAdAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { errorLogger } from '@/services/errorLogger';

interface WatchAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  featureType: FeatureType;
  bonusAmount?: number;
}

const IS_MOBILE = isMobileApp();

export const WatchAdModal = ({ isOpen, onClose, onComplete, featureType, bonusAmount = 1 }: WatchAdModalProps) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [isRewarded, setIsRewarded] = useState(false);

  const { user } = useAuth();
  const { trackAdStarted, trackAdCompleted, trackAdFailed, trackRewardClaimed } = useAdAnalytics();
  const userEmail = user?.email || null;
  const rewardListenerRef = useRef<{ remove: () => void } | null>(null);
  const dismissListenerRef = useRef<{ remove: () => void } | null>(null);
  const failedListenerRef = useRef<{ remove: () => void } | null>(null);
  const rewardedRef = useRef(false);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      rewardListenerRef.current?.remove();
      dismissListenerRef.current?.remove();
      failedListenerRef.current?.remove();
    };
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoadingAd(false);
      setAdError(null);
      setIsRewarded(false);
      rewardedRef.current = false;
    }
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClaimReward = () => {
    rewardedRef.current = true;
    trackRewardClaimed(userEmail, featureType, 'admob', 0);
    setIsRewarded(true);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  const handleStartWatching = async () => {
    setAdError(null);

    // Rewarded ads only work in native mobile app via AdMob
    if (!IS_MOBILE) {
      setAdError('No ad is available right now. Please try again later.');
      trackAdFailed(userEmail, featureType, 'simulation', 'Rewarded ads require the native mobile app.');
      return;
    }

    setIsLoadingAd(true);
    trackAdStarted(userEmail, featureType, 'admob');

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      await AdMob.initialize({
        initializeForTesting: import.meta.env.DEV,
      });

      // Listen for reward event — ONLY this callback grants the reward
      const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        trackAdCompleted(userEmail, featureType, 'admob', 0);
        handleClaimReward();
        rewardListener.remove();
        dismissListenerRef.current?.remove();
        failedListenerRef.current?.remove();
      });
      rewardListenerRef.current = rewardListener;

      // Dismissed — no reward granted unless already rewarded
      const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        setIsLoadingAd(false);
        if (!rewardedRef.current) {
          setAdError('No ad is available right now. Please try again later.');
          trackAdFailed(userEmail, featureType, 'admob', 'User dismissed ad without completing');
        }
        dismissListener.remove();
      });
      dismissListenerRef.current = dismissListener;

      // Failed to load — no reward granted
      const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: unknown) => {
        setIsLoadingAd(false);
        setAdError('No ad is available right now. Please try again later.');
        trackAdFailed(userEmail, featureType, 'admob', String(error));
        failedListener.remove();
      });
      failedListenerRef.current = failedListener;

      // Prepare and show the rewarded video ad
      await AdMob.prepareRewardVideoAd({
        adId: getAdUnitForFeature(featureType),
      });

      await AdMob.showRewardVideoAd();
      setIsLoadingAd(false);

    } catch (error) {
      errorLogger.error(error, { component: 'WatchAdModal', action: 'load ad' });
      trackAdFailed(userEmail, featureType, 'admob', String(error));
      setIsLoadingAd(false);
      setAdError('No ad is available right now. Please try again later.');
    }
  };

  const handleTryAgain = () => {
    setAdError(null);
    handleStartWatching();
  };

  if (!isOpen || !IS_MOBILE) return null;

  const featureName = FEATURE_NAMES[featureType];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary/20 to-primary/10 p-6 text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            <Gift className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-bold text-foreground">Watch & Earn</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get +{bonusAmount} {featureName} {bonusAmount > 1 ? 'uses' : 'use'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {isRewarded ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-8"
              >
                <Gift className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground">Reward Claimed!</h3>
                <p className="text-muted-foreground">
                  +{bonusAmount} {featureName} {bonusAmount > 1 ? 'uses' : 'use'} added
                </p>
              </motion.div>
            ) : adError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-foreground font-medium mb-2">
                  {adError}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Rewards are available on the mobile app.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={handleTryAgain}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : isLoadingAd ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Gift className="w-16 h-16 text-primary" />
                </motion.div>
                <p className="text-foreground font-medium">Loading ad...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please wait while we prepare your ad
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
                  <div className="relative z-10 text-center">
                    <Gift className="w-16 h-16 mx-auto text-primary/70 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {IS_MOBILE ? 'A short video ad will play' : 'Available on the mobile app'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartWatching}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!IS_MOBILE}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Watch Ad
                </Button>

                {!IS_MOBILE && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Download our mobile app to earn bonus uses by watching ads
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
