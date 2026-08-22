import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

interface RenewalNudgeProps {
  userEmail: string;
  onUpgrade: () => void;
  isAdmin: boolean;
  hasAccess: boolean;
}

interface PaymentInfo {
  access_expires_at: string | null;
  package: string | null;
  amount: number | null;
}

const formatDays = (ms: number) => {
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  if (days === 1) return '1 day';
  return `${days} days`;
};

export function RenewalNudge({ userEmail, onUpgrade, isAdmin, hasAccess }: RenewalNudgeProps) {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchPayment = useCallback(async () => {
    if (isAdmin || !userEmail) return;
    const { data, error } = await supabase
      .from('payments')
      .select('access_expires_at, package, amount')
      .eq('email', userEmail)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      errorLogger.error(error, { component: 'RenewalNudge', action: 'load subscription info' });
      return;
    }
    setPayment(data);
  }, [userEmail, isAdmin]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const expiresAt = payment?.access_expires_at ? new Date(payment.access_expires_at).getTime() : null;
  const now = Date.now();
  const msLeft = expiresAt ? expiresAt - now : null;
  const daysLeft = msLeft ? formatDays(msLeft) : null;

  const showNudge =
    !isAdmin &&
    hasAccess &&
    !dismissed &&
    !!expiresAt &&
    (msLeft === null || msLeft < 0 || (msLeft > 0 && msLeft <= 7 * 24 * 60 * 60 * 1000));

  if (!showNudge || !payment?.package) return null;

  const expired = msLeft !== null && msLeft < 0;

  return (
    <div className={`rounded-2xl p-4 border flex items-start gap-3 ${expired ? 'border-red-500/40 bg-red-500/10' : 'border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10'}`}>
      {expired ? (
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
      ) : (
        <Clock className="w-6 h-6 text-amber-500 shrink-0" />
      )}
      <div className="flex-1">
        <p className={`font-bold text-sm ${expired ? 'text-red-500' : 'text-amber-600'}`}>
          {expired
            ? `Your ${payment.package} subscription has expired`
            : `Your ${payment.package} subscription expires in ${daysLeft}`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {expired
            ? 'Renew now to keep unlimited quizzes, mock exams and study tools.'
            : `Renew to avoid losing unlimited access on ${new Date(expiresAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}.`}
        </p>
        <div className="flex gap-2 mt-2.5">
          <Button size="sm" onClick={onUpgrade} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Renew now
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
