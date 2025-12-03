import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralSystemProps {
  userEmail: string;
}

export const ReferralSystem = ({ userEmail }: ReferralSystemProps) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrCreateCode = async () => {
      try {
        // Try to get or create referral code
        const { data, error } = await supabase.rpc('generate_referral_code', {
          user_email: userEmail,
        });

        if (error) throw error;
        setReferralCode(data);

        // Get referral count
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_email', userEmail)
          .eq('is_used', true);

        setReferralCount(count || 0);
      } catch (err) {
        console.error('Error with referral:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userEmail) {
      fetchOrCreateCode();
    }
  }, [userEmail]);

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🎯 I'm preparing for JAMB with JAMB 48-Hour Crash!\n\nUse my code "${referralCode}" to get ₦1,000 OFF your purchase! 🚀\n\nGet your personalized study plan now!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="card-elevated p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Refer & Earn</h3>
          <p className="text-sm text-muted-foreground">Give ₦1,000 off, earn rewards!</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Your Referral Code</label>
          <div className="flex gap-2">
            <Input
              value={referralCode || ''}
              readOnly
              className="font-mono text-lg font-semibold"
            />
            <Button
              variant="outline"
              onClick={copyCode}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Friends referred</span>
          </div>
          <span className="text-xl font-bold text-primary">{referralCount}</span>
        </div>

        <Button
          onClick={shareOnWhatsApp}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Share on WhatsApp
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your friend gets ₦1,000 off. You earn rewards when they pay!
        </p>
      </div>
    </motion.div>
  );
};
