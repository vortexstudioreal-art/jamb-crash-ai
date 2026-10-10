import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { errorLogger } from '@/services/errorLogger';

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TRIAL_CACHE_PREFIX = 'jamb_trial_cache_';

type CachedTrial = {
  trial_used: boolean;
  trial_expires_at: string;
  subscription_plan: string | null;
};

const readCachedTrial = (email: string): CachedTrial | null => {
  try {
    const raw = localStorage.getItem(TRIAL_CACHE_PREFIX + email);
    return raw ? (JSON.parse(raw) as CachedTrial) : null;
  } catch {
    return null;
  }
};

const writeCachedTrial = (email: string, data: CachedTrial) => {
  try {
    localStorage.setItem(TRIAL_CACHE_PREFIX + email, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
};

interface TrialContextValue {
  timeRemaining: number | null;
  formattedTime: string | null;
  isTrialExpired: boolean;
  isTrialActive: boolean;
  hasTrialUsed: boolean;
  canStartTrial: boolean;
  subscriptionPlan: string | null;
  loading: boolean;
  startTrial: () => Promise<boolean>;
  refreshTrialStatus: () => Promise<void>;
}

const TrialContext = createContext<TrialContextValue | null>(null);

export const TrialProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, hasAccess } = useAuth();
  const userEmail = user?.email?.toLowerCase() || null;

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [hasTrialUsed, setHasTrialUsed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const checkTrialStatus = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = readCachedTrial(userEmail);
      if (cached) {
        setHasTrialUsed(cached.trial_used);
        setSubscriptionPlan(cached.subscription_plan);
        const expiresAt = new Date(cached.trial_expires_at);
        setTrialExpiresAt(expiresAt);
        const now = new Date();
        if (expiresAt > now && cached.trial_used) {
          setIsTrialActive(true);
          setIsTrialExpired(false);
          setTimeRemaining(expiresAt.getTime() - now.getTime());
        } else if (cached.trial_used) {
          setIsTrialActive(false);
          setIsTrialExpired(true);
          setTimeRemaining(0);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_trials')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        errorLogger.error(error, { component: 'TrialContext', action: 'checkTrialStatus' });
        setLoading(false);
        return;
      }

      if (data) {
        setHasTrialUsed(data.trial_used);
        setSubscriptionPlan(data.subscription_plan);
        const expiresAt = new Date(data.trial_expires_at);
        setTrialExpiresAt(expiresAt);
        writeCachedTrial(userEmail, {
          trial_used: data.trial_used,
          trial_expires_at: data.trial_expires_at,
          subscription_plan: data.subscription_plan,
        });
        
        const now = new Date();
        if (expiresAt > now && data.trial_used) {
          setIsTrialActive(true);
          setIsTrialExpired(false);
          setTimeRemaining(expiresAt.getTime() - now.getTime());
        } else if (data.trial_used) {
          setIsTrialActive(false);
          setIsTrialExpired(true);
          setTimeRemaining(0);
        }
      } else {
        setHasTrialUsed(false);
        setIsTrialActive(false);
        setIsTrialExpired(false);
      }
    } catch (err) {
      errorLogger.error(err instanceof Error ? err : new Error(String(err)), { component: 'TrialContext', action: 'checkTrialStatus' });
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const startTrial = useCallback(async (): Promise<boolean> => {
    if (!userEmail || hasTrialUsed || isAdmin || hasAccess) {
      return false;
    }

    try {
      const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS);
      
      const { error } = await supabase
        .from('user_trials')
        .insert({
          email: userEmail,
          trial_started_at: new Date().toISOString(),
          trial_expires_at: expiresAt.toISOString(),
          trial_used: true,
          subscription_plan: 'premium',
        });

      if (error) {
        if (error.code === '23505') {
          setHasTrialUsed(true);
          return false;
        }
        errorLogger.error(error, { component: 'TrialContext', action: 'startTrial' });
        return false;
      }

      setIsTrialActive(true);
      setHasTrialUsed(true);
      setSubscriptionPlan('premium');
      setTrialExpiresAt(expiresAt);
      setTimeRemaining(TRIAL_DURATION_MS);
      setIsTrialExpired(false);
      
      return true;
    } catch (err) {
      errorLogger.error(err instanceof Error ? err : new Error(String(err)), { component: 'TrialContext', action: 'startTrial' });
      return false;
    }
  }, [userEmail, hasTrialUsed, isAdmin, hasAccess]);

  useEffect(() => {
    checkTrialStatus();
  }, [checkTrialStatus]);

  useEffect(() => {
    if (isAdmin || hasAccess) {
      setIsTrialActive(false);
      setIsTrialExpired(false);
      setTimeRemaining(null);
      return;
    }

    if (!isTrialActive || !trialExpiresAt) return;

    const checkTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, trialExpiresAt.getTime() - now);

      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsTrialExpired(true);
        setIsTrialActive(false);
      }
    };

    checkTime();
    // 30s ticks: the badge shows days/hours/minutes, so 1s precision only
    // churned re-renders across the whole context tree for 7 days.
    const interval = setInterval(checkTime, 30_000);

    return () => clearInterval(interval);
  }, [isAdmin, hasAccess, isTrialActive, trialExpiresAt]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    if (days >= 1) {
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const canStartTrial = Boolean(userEmail && !hasTrialUsed && !isAdmin && !hasAccess);
  const effectiveTrialActive = !isAdmin && !hasAccess && isTrialActive;
  const effectiveTrialExpired = !isAdmin && !hasAccess && isTrialExpired && hasTrialUsed;

  const value: TrialContextValue = {
    timeRemaining,
    formattedTime: timeRemaining !== null ? formatTime(timeRemaining) : null,
    isTrialExpired: effectiveTrialExpired,
    isTrialActive: effectiveTrialActive,
    hasTrialUsed,
    canStartTrial,
    subscriptionPlan,
    loading,
    startTrial,
    refreshTrialStatus: checkTrialStatus,
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
};

export const useTrialContext = (): TrialContextValue => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrialContext must be used within a TrialProvider');
  }
  return context;
};
