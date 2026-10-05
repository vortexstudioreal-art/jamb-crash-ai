import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, CheckCircle, Medal, Trophy, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';
import { cn } from '@/lib/utils';

interface ReferralSystemProps {
  userEmail: string;
}

interface BoostTier {
  id: 'bronze' | 'silver' | 'gold';
  name: string;
  refsRequired: number;
  rewardDays: number;
  rewardLabel: string;
}

// Refer & Boost ladder: referrals unlock free premium days.
const BOOST_TIERS: BoostTier[] = [
  { id: 'bronze', name: 'Bronze Booster', refsRequired: 1, rewardDays: 3, rewardLabel: '3 days premium' },
  { id: 'silver', name: 'Silver', refsRequired: 3, rewardDays: 14, rewardLabel: '14 days premium' },
  { id: 'gold', name: 'Gold', refsRequired: 5, rewardDays: 30, rewardLabel: '1 month premium' },
];

const tierIcon = (id: BoostTier['id'], className: string) =>
  id === 'gold'
    ? <Trophy className={className} />
    : <Medal className={className} />;

const tierColor = (id: BoostTier['id']) =>
  id === 'gold'
    ? 'text-yellow-400'
    : id === 'silver'
      ? 'text-slate-300'
      : 'text-amber-600';

const claimReference = (tierId: string, email: string) =>
  `BOOST-${tierId.toUpperCase()}-${email.toLowerCase()}`;

export const ReferralSystem = ({ userEmail }: ReferralSystemProps) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const { refreshAccess } = useAuth();

  const emailKey = userEmail.toLowerCase();

  useEffect(() => {
    const load = async () => {
      try {
        // Get or create referral code
        const { data, error } = await supabase.rpc('generate_referral_code', {
          user_email: userEmail,
        });
        if (error) throw error;
        setReferralCode(data);

        // Successful referrals (friend signed up AND paid)
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_email', userEmail)
          .eq('is_used', true);
        setReferralCount(count || 0);

        // Which boost tiers were already claimed (one claim per tier)
        const { data: claims } = await supabase
          .from('payments')
          .select('paystack_reference')
          .eq('email', emailKey)
          .eq('status', 'success')
          .like('paystack_reference', 'BOOST-%');
        const claimedMap: Record<string, boolean> = {};
        (claims || []).forEach((c) => {
          const match = c.paystack_reference?.match(/^BOOST-(BRONZE|SILVER|GOLD)-/);
          if (match) claimedMap[match[1].toLowerCase()] = true;
        });
        setClaimed(claimedMap);
      } catch (err) {
        errorLogger.error(err, { component: 'ReferralSystem', action: 'load boost data' });
      } finally {
        setIsLoading(false);
      }
    };

    if (userEmail) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const claimTier = async (tier: BoostTier) => {
    if (claimingId) return;
    setClaimingId(tier.id);
    try {
      const reference = claimReference(tier.id, emailKey);

      // Idempotency: already claimed?
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('email', emailKey)
        .eq('paystack_reference', reference)
        .eq('status', 'success')
        .limit(1);
      if (existing && existing.length > 0) {
        setClaimed((prev) => ({ ...prev, [tier.id]: true }));
        toast.info('Already claimed! ✅');
        return;
      }

      // Re-verify eligibility (count may have changed since load)
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_email', userEmail)
        .eq('is_used', true);
      const freshCount = count || 0;
      setReferralCount(freshCount);
      if (freshCount < tier.refsRequired) {
        toast.error(`You need ${tier.refsRequired - freshCount} more referral${tier.refsRequired - freshCount === 1 ? '' : 's'} to claim ${tier.name}.`);
        return;
      }

      // Grant premium days. check_user_access reads the latest-expiring
      // success row, so a short boost never shadows a longer paid plan.
      const expires = new Date();
      expires.setDate(expires.getDate() + tier.rewardDays);
      const { error } = await supabase.from('payments').insert({
        email: emailKey,
        package: 'premium',
        amount: 0,
        currency: 'NGN',
        status: 'success',
        paystack_reference: reference,
        access_expires_at: expires.toISOString(),
      });
      if (error) throw error;

      setClaimed((prev) => ({ ...prev, [tier.id]: true }));
      await refreshAccess();
      toast.success(`🎉 ${tier.name} claimed! Enjoy ${tier.rewardLabel}!`);
    } catch (err) {
      errorLogger.error(err, { component: 'ReferralSystem', action: 'claim boost tier' });
      toast.error(err instanceof Error ? err.message : 'Could not claim reward. Try again.');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="card-elevated p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  const topTier = BOOST_TIERS[BOOST_TIERS.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Refer & Boost</h3>
          <p className="text-sm text-muted-foreground">Invite friends, unlock free premium days!</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall progress to Gold */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Referrals</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {Math.min(referralCount, topTier.refsRequired)}/{topTier.refsRequired}
            </span>
          </div>
          <Progress value={(Math.min(referralCount, topTier.refsRequired) / topTier.refsRequired) * 100} className="h-2" />
        </div>

        {/* Boost ladder */}
        <div className="space-y-2">
          {BOOST_TIERS.map((tier) => {
            const isClaimed = !!claimed[tier.id];
            const isEligible = referralCount >= tier.refsRequired;
            const remaining = Math.max(0, tier.refsRequired - referralCount);
            return (
              <div
                key={tier.id}
                className={cn(
                  'p-3 rounded-lg border flex items-center gap-3',
                  isClaimed
                    ? 'border-green-500/40 bg-green-500/5'
                    : isEligible
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-card'
                )}
              >
                <div className={cn('w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0', tierColor(tier.id))}>
                  {tierIcon(tier.id, 'w-5 h-5')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">
                    {tier.name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {tier.refsRequired} ref{tier.refsRequired === 1 ? '' : 's'} → {tier.rewardLabel}
                    </span>
                  </p>
                  {!isClaimed && !isEligible && (
                    <Progress
                      value={(Math.min(referralCount, tier.refsRequired) / tier.refsRequired) * 100}
                      className="h-1.5 mt-2"
                    />
                  )}
                  {!isClaimed && !isEligible && (
                    <p className="text-xs text-muted-foreground mt-1">{remaining} more to go</p>
                  )}
                </div>
                {isClaimed ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    Claimed
                  </span>
                ) : isEligible ? (
                  <Button
                    size="sm"
                    onClick={() => void claimTier(tier)}
                    disabled={claimingId === tier.id}
                    className="shrink-0"
                  >
                    {claimingId === tier.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-1" />
                        Claim
                      </>
                    )}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">Locked</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Code + share */}
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

        <Button
          onClick={shareOnWhatsApp}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Share on WhatsApp
        </Button>

        {/* How it works */}
        <div className="text-xs text-center space-y-1 text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium text-foreground">How Refer & Boost Works:</p>
          <p>1. Share your code — friends get ₦1,000 off</p>
          <p>2. They count once they pay for a plan</p>
          <p>3. Hit 1 / 3 / 5 refs to claim Bronze / Silver / Gold 🚀</p>
        </div>
      </div>
    </motion.div>
  );
};
