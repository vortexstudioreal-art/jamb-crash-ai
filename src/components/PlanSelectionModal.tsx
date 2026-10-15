import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CreditCard, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  onContinuePayment: () => void;
  canStartTrial?: boolean;
  onStartTrial?: () => void;
  /** When provided, renders a plan switcher so users can compare and pick
      between Basic / ACE / SCHOLAR instead of being stuck on one plan. */
  planKey?: string;
  availablePlans?: Array<{ key: string; name: string; price: number }>;
  onSelectPlan?: (key: string) => void;
}

export const PlanSelectionModal = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onContinuePayment,
  canStartTrial,
  onStartTrial,
  planKey,
  availablePlans,
  onSelectPlan,
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md lg:max-w-2xl pointer-events-auto bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-green-500 p-4 lg:p-6 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg lg:text-xl">Choose Your Path</h2>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8 space-y-4">
                {availablePlans && availablePlans.length > 1 && onSelectPlan && (
                  <div className="grid grid-cols-3 gap-2">
                    {availablePlans.map((p) => {
                      const active = planKey ? p.key === planKey : p.name === planName;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => onSelectPlan(p.key)}
                          className={`rounded-xl border-2 px-2 py-3 text-center transition-all ${
                            active
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ₦{p.price.toLocaleString()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    You selected <span className="font-bold text-foreground">{planName}</span> plan
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-primary mt-1">₦{planPrice.toLocaleString()}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinuePayment}
                  className="w-full p-4 lg:p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-muted/50 transition-all text-left h-full"
                >
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-3">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 lg:w-7 lg:h-7 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">Continue to Payment</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Pay ₦{planPrice.toLocaleString()} and get instant access
                      </p>
                      <div className="flex items-center justify-center lg:justify-start gap-1 text-xs text-green-500 mt-3">
                        <Zap className="w-3 h-3" />
                        <span>Secure payment • Instant activation</span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {canStartTrial && onStartTrial && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartTrial}
                    className="w-full p-4 lg:p-6 rounded-xl border-2 border-dashed border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left h-full"
                  >
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-3">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Timer className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Try 7 Days Free</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Full SCHOLAR access, no card required. One trial per account.
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 lg:px-8 pb-6 lg:pb-8">
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
