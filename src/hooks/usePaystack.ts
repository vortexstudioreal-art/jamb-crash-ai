import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaystackConfig {
  email: string;
  amount: number;
  package: string;
  couponId?: string | null;
  discountApplied?: number;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

export const usePaystack = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Load Paystack script dynamically
  const loadPaystackScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        setPaystackLoaded(true);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Paystack'));
      document.body.appendChild(script);
    });
  }, []);

  // Fetch public key from backend
  const getPublicKey = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('paystack-config');
    if (error || !data?.publicKey) {
      throw new Error('Could not fetch payment configuration');
    }
    return data.publicKey;
  }, []);

  const initializePayment = useCallback(
    async (
      config: PaystackConfig,
      onSuccess: (reference: string) => void,
      onClose: () => void
    ) => {
      setIsLoading(true);

      try {
        // Load Paystack script if not loaded
        await loadPaystackScript();

        // Get public key from backend
        const publicKey = await getPublicKey();

        // Initialize payment via edge function
        const { data, error } = await supabase.functions.invoke('paystack-initialize', {
          body: {
            email: config.email,
            amount: config.amount,
            package: config.package,
            callbackUrl: `${window.location.origin}/payment-success`,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Failed to initialize payment');
        }

        // Open Paystack popup
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: config.email,
          amount: config.amount * 100, // Convert to kobo
          currency: 'NGN',
          ref: data.reference,
          metadata: {
            package: config.package,
            couponId: config.couponId,
            discountApplied: config.discountApplied,
          },
        onClose: () => {
          setIsLoading(false);
          onClose();
        },
        callback: (response) => {
          console.log('[Payment] Paystack callback received, reference:', response.reference);
          setIsLoading(false);
          // Verify payment synchronously and pass reference to onSuccess
          // The verification will update the database, then we call onSuccess
          verifyPayment(response.reference)
            .then(() => {
              console.log('[Payment] Verification successful');
              onSuccess(response.reference);
            })
            .catch((error) => {
              console.error('[Payment] Verification failed:', error);
              toast.error('Payment verification failed. Please contact support.');
              onClose();
            });
        },
        });

        handler.openIframe();
      } catch (error) {
        setIsLoading(false);
        console.error('Payment error:', error);
        toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      }
    },
    [loadPaystackScript, getPublicKey]
  );

  const verifyPayment = useCallback(async (reference: string) => {
    console.log('[Payment] Calling paystack-verify for reference:', reference);
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
      });

      console.log('[Payment] Verify response:', { data, error });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      console.log('[Payment] Database updated successfully, access granted');
      return data.data;
    } catch (error) {
      console.error('[Payment] Verification error:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    paystackLoaded,
    initializePayment,
    verifyPayment,
  };
};
