import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePaystack } from '@/hooks/usePaystack';
import { z } from 'zod';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
  };
  onSuccess: (reference: string, email: string) => void;
}

const emailSchema = z.string().email('Please enter a valid email address');

export const PaymentModal = ({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { isLoading, initializePayment } = usePaystack();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    await initializePayment(
      {
        email,
        amount: plan.price,
        package: plan.name.toLowerCase(),
      },
      (reference) => {
        onSuccess(reference, email);
      },
      () => {
        // Payment popup closed without completing
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card-elevated w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Complete Payment</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Package</span>
                <span className="font-semibold text-foreground">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₦{plan.price.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className="pl-10"
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your study plan will be sent to this email
                </p>
              </div>

              <Button
                type="submit"
                variant="price"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₦{plan.price.toLocaleString()}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Powered by</span>
                <span className="font-semibold text-primary">Paystack</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
