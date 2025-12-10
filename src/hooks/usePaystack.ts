import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaystackConfig {
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
            setIsLoading(false);
            onSuccess(response.reference);
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
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      return data.data;
    } catch (error) {
      console.error('Verification error:', error);
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
