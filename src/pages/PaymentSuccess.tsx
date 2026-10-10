import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Mail, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaystack } from '@/hooks/usePaystack';
import { useAuth } from '@/contexts/AuthContext';
import { useSeo } from '@/hooks/useSeo';
import { errorLogger } from '@/services/errorLogger';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = usePaystack();
  const { refreshAccess } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [paymentData, setPaymentData] = useState<{
    email: string;
    amount: number;
    package: string;
  } | null>(null);
  // refreshAccess is re-created every auth render; without this guard the
  // effect below re-fires and verifies the same reference repeatedly.
  const verifiedRef = useRef(false);

  useSeo({
    title: 'Payment Status | Jamb Crash AI',
    description: 'Payment confirmation for your Jamb Crash AI subscription.',
    path: '/payment-success',
    noindex: true,
  });

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) {
      setStatus('error');
      return;
    }
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      try {
        const result = await verifyPayment(reference);
        const data = result?.data || null;
        setPaymentData(data);
        setStatus(result?.success ? 'success' : 'error');
        // Refresh regardless of data shape — a success without email must
        // still unlock the dashboard.
        await refreshAccess();
      } catch (error) {
        errorLogger.error(error, { component: 'PaymentSuccess', action: 'verify payment' });
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, verifyPayment, refreshAccess]);

  const handleContinue = () => {
    // Store payment info in sessionStorage for the upload step
    if (paymentData) {
      sessionStorage.setItem('jamb_payment', JSON.stringify(paymentData));
    }
    navigate('/?step=upload');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Payment</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't verify your payment. Please try again or contact support.
          </p>
          <div className="space-y-3">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = 'mailto:support@jambcrash.ai'}
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your study plan is being prepared.
        </p>

        {paymentData && (
          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Package</span>
              <span className="font-semibold text-foreground capitalize">{paymentData.package}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-primary">₦{paymentData.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{paymentData.email}</span>
            </div>
          </div>
        )}

        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-foreground">
            <strong>Next Step:</strong> Upload your JAMB past questions to generate your personalized study plan.
          </p>
        </div>

        <Button
          variant="price"
          size="lg"
          className="w-full"
          onClick={handleContinue}
        >
          Continue to Upload
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
