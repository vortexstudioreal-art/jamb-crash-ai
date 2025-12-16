import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FEATURE_NAMES, FeatureType } from '@/hooks/useFeatureUsage';

interface WatchAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  featureType: FeatureType;
}

const AD_DURATION = 15; // seconds to watch

export const WatchAdModal = ({ isOpen, onClose, onComplete, featureType }: WatchAdModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = Math.min((timeWatched / AD_DURATION) * 100, 100);
  const canClaim = timeWatched >= AD_DURATION;

  useEffect(() => {
    if (isPlaying && !canClaim) {
      intervalRef.current = setInterval(() => {
        setTimeWatched(prev => {
          if (prev >= AD_DURATION) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return AD_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, canClaim]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setTimeWatched(0);
      setIsCompleted(false);
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

  const handleStartWatching = () => {
    setIsPlaying(true);
  };

  const handleClaimReward = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

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
              Get +1 bonus {featureName} use
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground">Reward Claimed!</h3>
                <p className="text-muted-foreground">+1 {featureName} use added</p>
              </motion.div>
            ) : !isPlaying ? (
              <div className="text-center">
                {/* Video placeholder */}
                <div className="relative aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
                  <div className="relative z-10 text-center">
                    <Play className="w-16 h-16 mx-auto text-primary/70 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {AD_DURATION} second video
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartWatching}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Watching
                </Button>

                <p className="text-xs text-muted-foreground mt-3">
                  Watch the full video to unlock your bonus use
                </p>
              </div>
            ) : (
              <div>
                {/* Video playing state */}
                <div className="relative aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse" />
                  <div className="relative z-10 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Gift className="w-12 h-12 mx-auto text-primary mb-2" />
                    </motion.div>
                    <p className="text-foreground font-medium">
                      Watching ad...
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {timeWatched}s / {AD_DURATION}s
                    </span>
                    <span className="text-primary font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Button
                  onClick={handleClaimReward}
                  disabled={!canClaim}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {canClaim ? (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Claim +1 {featureName} Use
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Keep Watching...
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
