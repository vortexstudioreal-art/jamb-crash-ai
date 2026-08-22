import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, CheckCircle, Wallet, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { errorLogger } from '@/services/errorLogger';

interface ReferralSystemProps {
  userEmail: string;
}

export const ReferralSystem = ({ userEmail }: ReferralSystemProps) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [referralCredits, setReferralCredits] = useState(0);
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

        // Get referral count (successful conversions)
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_email', userEmail)
          .eq('is_used', true);

        setReferralCount(count || 0);

        // Get referral credits from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('referral_credits')
          .eq('email', userEmail)
          .single();

        setReferralCredits(profileData?.referral_credits || 0);
      } catch (err) {
        errorLogger.error(err, { component: 'ReferralSystem', action: 'load referral data' });
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
      `🎯 I'm preparing for JAMB with Jamb Crash AI!\n\nUse my code "${referralCode}" to get ₦1,000 OFF your purchase! 🚀\n\nGet your personalized study plan now!`
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
          <p className="text-sm text-muted-foreground">Give ₦1,000 off, earn ₦500!</p>
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Friends Referred</span>
            </div>
            <p className="text-xl font-bold text-primary mt-1">{referralCount}</p>
          </div>
          
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Your Credits</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">Credits can be used as discount on your next purchase!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xl font-bold text-primary mt-1">₦{referralCredits.toLocaleString()}</p>
          </div>
        </div>

        <Button
          onClick={shareOnWhatsApp}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Share on WhatsApp
        </Button>

        {/* How it works */}
        <div className="text-xs text-center space-y-1 text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium text-foreground">How Refer & Earn Works:</p>
          <p>1. Share your code with friends</p>
          <p>2. They get ₦1,000 off when they pay</p>
          <p>3. You earn ₦500 credit when they pay! 💰</p>
        </div>
      </div>
    </motion.div>
  );
};
