import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { toast } from 'sonner';

interface TrialBannerProps {
  userEmail: string;
  isAdmin: boolean;
  hasAccess: boolean;
  onTrialStart: () => void;
}

export const TrialBanner = ({ userEmail, isAdmin, hasAccess, onTrialStart }: TrialBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [starting, setStarting] = useState(false);
  
  const { 
    canStartTrial, 
    hasTrialUsed, 
    isTrialActive,
    loading,
    startTrial 
  } = useTrialSystem({ userEmail, isAdmin, hasAccess });

  const handleStartTrial = async () => {
    setStarting(true);
    const success = await startTrial();
    setStarting(false);
    
    if (success) {
      toast.success('🎉 Your 30-minute SCHOLAR trial has started!');
      onTrialStart();
    } else if (hasTrialUsed) {
      toast.error('You have already used your free trial');
    } else {
      toast.error('Failed to start trial. Please try again.');
    }
  };

  // Don't show banner if loading, dismissed, trial active, or user has access
  if (loading || dismissed || isTrialActive || hasAccess || isAdmin || hasTrialUsed || !canStartTrial) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-primary to-green-500 rounded-2xl p-5 shadow-2xl z-40"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-white/70 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl"
        >
          🎁
        </motion.div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">
            Try SCHOLAR FREE! ⚡
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Get 30 minutes of full SCHOLAR access. No payment required!
          </p>
          <div className="flex items-center gap-2 text-white/70 text-xs mb-3">
            <Clock className="w-3 h-3" />
            <span>30-minute trial • One time only</span>
          </div>
          <Button
            onClick={handleStartTrial}
            disabled={starting}
            className="w-full bg-white text-primary hover:bg-white/90 font-bold"
          >
            {starting ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"
                />
                Starting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Free Trial
              </>
            )}
          </Button>
        </div>
      </div>

      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute -top-2 -right-2"
      >
        <Sparkles className="w-6 h-6 text-yellow-300" />
      </motion.div>
    </motion.div>
  );
};
