import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, Shield, CreditCard, Ticket, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePaystack, type PaystackConfig } from '@/hooks/usePaystack';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
  };
  onSuccess: (reference: string, email: string) => void;
  initialEmail?: string;
}

const emailSchema = z.string().email('Please enter a valid email address');

export const PaymentModal = ({ isOpen, onClose, plan, onSuccess, initialEmail }: PaymentModalProps) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [emailError, setEmailError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const { isLoading, initializePayment } = usePaystack();

  const finalPrice = Math.max(0, plan.price - appliedDiscount);
  const [couponType, setCouponType] = useState<string | null>(null);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponStatus('checking');
    
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode.trim()
      });

      if (error || !data || data.length === 0 || !data[0].valid) {
        setCouponStatus('invalid');
        setAppliedDiscount(0);
        setAppliedCouponId(null);
        setCouponType(null);
        setCommissionPercentage(0);
        toast.error('Invalid or expired coupon code');
        return;
      }

      const couponData = data[0];
      
      // Calculate discount - use percentage if available, otherwise fixed amount
      let discount = couponData.discount;
      if (couponData.discount_pct && couponData.discount_pct > 0) {
        discount = Math.floor(plan.price * (couponData.discount_pct / 100));
      }

      setCouponStatus('valid');
      setAppliedDiscount(discount);
      setAppliedCouponId(couponData.coupon_id);
      setCouponType(couponData.coupon_type_val);
      setCommissionPercentage(couponData.commission_pct || 0);
      toast.success(`Coupon applied! ₦${discount.toLocaleString()} off 🎉`);
    } catch (err) {
      setCouponStatus('invalid');
      toast.error('Failed to validate coupon');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponStatus('idle');
    setAppliedDiscount(0);
    setAppliedCouponId(null);
    setCouponType(null);
    setCommissionPercentage(0);
  };

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
        amount: finalPrice,
        package: plan.name.toLowerCase(),
        couponId: appliedCouponId,
        discountApplied: appliedDiscount,
      },
      async (reference) => {
        // Record coupon usage if applied
        if (appliedCouponId && appliedDiscount > 0) {
          try {
            // Calculate commission - only for admin_referral type
            const isAdminReferral = couponType === 'admin_referral';
            const creatorEarning = isAdminReferral 
              ? Math.floor(finalPrice * (commissionPercentage / 100))
              : 0;

            await supabase.from('coupon_usage').insert({
              coupon_id: appliedCouponId,
              used_by_email: email,
              amount_paid: finalPrice,
              discount_applied: appliedDiscount,
              creator_earning: creatorEarning,
              commission_percentage: commissionPercentage,
              commission_payable: isAdminReferral && creatorEarning > 0,
            });

            // Increment coupon usage count
            await supabase.rpc('increment_coupon_usage', { p_coupon_id: appliedCouponId });
          } catch (err) {
            console.error('Failed to record coupon usage:', err);
          }
        }
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
                <div className="text-right">
                  {appliedDiscount > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      ₦{plan.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">
                    ₦{finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center mt-2 text-green-500">
                  <span className="text-sm">Discount</span>
                  <span className="font-semibold">-₦{appliedDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="mb-4">
              <Label className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                Have a coupon code?
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponStatus !== 'idle') {
                        setCouponStatus('idle');
                      }
                    }}
                    disabled={couponStatus === 'valid'}
                    className={
                      couponStatus === 'valid' 
                        ? 'border-green-500 bg-green-500/10' 
                        : couponStatus === 'invalid' 
                          ? 'border-destructive' 
                          : ''
                    }
                  />
                  {couponStatus === 'valid' && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {couponStatus === 'invalid' && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                  )}
                </div>
                {couponStatus === 'valid' ? (
                  <Button type="button" variant="outline" onClick={removeCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={validateCoupon}
                    disabled={couponStatus === 'checking' || !couponCode.trim()}
                  >
                    {couponStatus === 'checking' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                )}
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
                      if (!initialEmail) {
                        setEmail(e.target.value);
                        setEmailError('');
                      }
                    }}
                    className={`pl-10 ${initialEmail ? 'bg-muted cursor-not-allowed' : ''}`}
                    required
                    disabled={!!initialEmail}
                    readOnly={!!initialEmail}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {initialEmail ? 'Using your account email for payment' : 'Your study plan will be sent to this email'}
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
                    Pay ₦{finalPrice.toLocaleString()}
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