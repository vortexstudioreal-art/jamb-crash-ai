import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackFunnel } from '@/lib/funnel';

interface PaywallGateProps {
  hasAccess: boolean;
  isLoading: boolean;
  onUpgrade: () => void;
  children: ReactNode;
  userEmail?: string | null;
}

export const PaywallGate = ({ hasAccess, isLoading, onUpgrade, children, userEmail }: PaywallGateProps) => {
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !hasAccess && userEmail && !trackedRef.current) {
      trackedRef.current = true;
      trackFunnel(userEmail, 'paywall_seen');
    }
    if (hasAccess) {
      trackedRef.current = false;
    }
  }, [isLoading, hasAccess, userEmail]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Upgrade to access your personalized study plan and all SCHOLAR features.
          </p>
          <Button
            variant="default"
            size="lg"
            className="w-full gradient-primary text-primary-foreground"
            onClick={onUpgrade}
          >
            Upgrade to Access
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
