import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');

interface EmailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerAccess: (email: string) => void;
  onProceedToPayment: (email: string) => void;
}

export const EmailPromptModal = ({ 
  isOpen, 
  onClose, 
  onOwnerAccess,
  onProceedToPayment 
}: EmailPromptModalProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    try {
      emailSchema.parse(email);
    } catch {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsChecking(true);

    try {
      // Check if user is owner/admin with access
      const { data, error } = await supabase.rpc('check_user_access', {
        user_email: email.toLowerCase().trim()
      });

      if (error) throw error;

      const accessData = data?.[0];

      // If owner or has active access, skip payment
      if (accessData?.is_admin && accessData?.admin_role === 'owner') {
        onOwnerAccess(email.toLowerCase().trim());
        return;
      }

      // If has active paid access, also skip
      if (accessData?.has_access) {
        onOwnerAccess(email.toLowerCase().trim());
        return;
      }

      // Otherwise, proceed to payment
      onProceedToPayment(email.toLowerCase().trim());
    } catch (error) {
      console.error('Error checking access:', error);
      // On error, default to payment flow
      onProceedToPayment(email.toLowerCase().trim());
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card-elevated w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Enter Your Email</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We'll check your access and get you started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className="w-full text-center text-lg"
                  disabled={isChecking}
                />
                {emailError && (
                  <p className="text-destructive text-sm mt-1 text-center">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
                disabled={isChecking || !email}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking Access...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Crown className="w-3 h-3 text-yellow-500" />
              <span>Owners & paid users get instant access</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

