import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FreeTrialBannerProps {
  onStartTrial: () => void;
  userEmail?: string;
}

export const FreeTrialBanner = ({ onStartTrial, userEmail }: FreeTrialBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [canUseTrial, setCanUseTrial] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkTrialUsage = async () => {
      try {
        // Check by email if provided
        if (userEmail) {
          const { data: emailCheck } = await supabase
            .from('demo_usage')
            .select('id')
            .eq('email', userEmail)
            .single();
          
          if (emailCheck) {
            setCanUseTrial(false);
            setChecking(false);
            return;
          }
        }

        // Check by device fingerprint (simple version using localStorage)
        const deviceId = localStorage.getItem('jamb_device_id');
        if (deviceId) {
          const { data: deviceCheck } = await supabase
            .from('demo_usage')
            .select('id')
            .eq('device_fingerprint', deviceId)
            .single();
          
          if (deviceCheck) {
            setCanUseTrial(false);
          }
        } else {
          // Generate new device ID
          const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('jamb_device_id', newDeviceId);
        }
      } catch (error) {
        // No record found means trial is available
        console.log('Trial check:', error);
      } finally {
        setChecking(false);
      }
    };

    checkTrialUsage();
  }, [userEmail]);

  const handleStartTrial = async () => {
    // Record trial usage
    try {
      const deviceId = localStorage.getItem('jamb_device_id');
      await supabase.from('demo_usage').insert({
        email: userEmail || null,
        device_fingerprint: deviceId
      });
    } catch (error) {
      console.error('Error recording trial:', error);
    }
    
    onStartTrial();
  };

  if (dismissed || checking || !canUseTrial) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-primary to-green-500 rounded-2xl p-5 shadow-2xl z-40"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-white/70 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl"
        >
          🎁
        </motion.div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">
            Free Trial Available! 🎉
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Test 20 real JAMB questions for FREE! No payment needed.
          </p>
          <Button
            onClick={handleStartTrial}
            className="w-full bg-white text-primary hover:bg-white/90 font-bold"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Free Trial
          </Button>
        </div>
      </div>

      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute -top-2 -right-2"
      >
        <Sparkles className="w-6 h-6 text-yellow-300" />
      </motion.div>
    </motion.div>
  );
};
