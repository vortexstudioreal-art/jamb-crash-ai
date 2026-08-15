import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Gift, CreditCard, Clock } from 'lucide-react';

interface PaymentCancelledModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  onRetryPayment: () => void;
  canStartTrial: boolean;
}

export const PaymentCancelledModal = ({
  isOpen,
  onClose,
  onStartTrial,
  onRetryPayment,
  canStartTrial,
}: PaymentCancelledModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="p-6 pt-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Payment Cancelled
              </h2>
              <p className="text-muted-foreground text-sm">
                No worries! What would you like to do?
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {canStartTrial && (
                <Button
                  onClick={onStartTrial}
                  variant="hero"
                  className="w-full gap-2 py-6"
                >
                  <Gift className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Start Free Trial</div>
                    <div className="text-xs opacity-80">30 minutes of SCHOLAR access</div>
                  </div>
                </Button>
              )}

              <Button
                onClick={onRetryPayment}
                variant={canStartTrial ? "outline" : "hero"}
                className="w-full gap-2 py-6"
              >
                <CreditCard className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Complete Payment</div>
                  <div className="text-xs opacity-80">Continue with your purchase</div>
                </div>
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};