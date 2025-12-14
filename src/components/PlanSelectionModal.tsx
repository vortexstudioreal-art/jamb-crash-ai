import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CreditCard, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  onStartTrial: () => void;
  onContinuePayment: () => void;
  canStartTrial: boolean;
  hasTrialUsed: boolean;
}

export const PlanSelectionModal = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onStartTrial,
  onContinuePayment,
  canStartTrial,
  hasTrialUsed,
}: PlanSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-green-500 p-4 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Choose Your Path</h2>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    You selected <span className="font-bold text-foreground">{planName}</span> plan
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">₦{planPrice.toLocaleString()}</p>
                </div>

                {/* Free Trial Option */}
                {canStartTrial && !hasTrialUsed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartTrial}
                    className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          Start Free Trial
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            FREE
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Get 30 minutes of full Premium access. No payment required!
                        </p>
                        <div className="flex items-center gap-1 text-xs text-primary mt-2">
                          <Clock className="w-3 h-3" />
                          <span>One-time only • No credit card needed</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )}

                {hasTrialUsed && (
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground">
                      ⏰ You've already used your free trial
                    </p>
                  </div>
                )}

                {/* Payment Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinuePayment}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">Continue to Payment</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay ₦{planPrice.toLocaleString()} and get instant access
                      </p>
                      <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
                        <Zap className="w-3 h-3" />
                        <span>Secure payment • Instant activation</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <Button variant="ghost" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
