import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TRIAL_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface UseTrialSystemProps {
  userEmail: string | null;
  isAdmin: boolean;
  hasAccess: boolean;
}

export interface TrialState {
  timeRemaining: number | null;
  formattedTime: string | null;
  isTrialExpired: boolean;
  isTrialActive: boolean;
  hasTrialUsed: boolean;
  canStartTrial: boolean;
  subscriptionPlan: string | null;
  loading: boolean;
}

export const useTrialSystem = ({ userEmail, isAdmin, hasAccess }: UseTrialSystemProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [hasTrialUsed, setHasTrialUsed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Check trial status from database
  const checkTrialStatus = useCallback(async () => {
    if (!userEmail) {
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
        console.error('Error checking trial:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setHasTrialUsed(data.trial_used);
        setSubscriptionPlan(data.subscription_plan);
        const expiresAt = new Date(data.trial_expires_at);
        setTrialExpiresAt(expiresAt);
        
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
        // No trial record - user can start trial
        setHasTrialUsed(false);
        setIsTrialActive(false);
        setIsTrialExpired(false);
      }
    } catch (err) {
      console.error('Trial check error:', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Start the 30-minute trial
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
          subscription_plan: 'premium', // Full premium access during trial
        });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - trial already used
          console.log('Trial already used for this email');
          setHasTrialUsed(true);
          return false;
        }
        console.error('Error starting trial:', error);
        return false;
      }

      setIsTrialActive(true);
      setHasTrialUsed(true);
      setSubscriptionPlan('premium');
      setTrialExpiresAt(expiresAt);
      setTimeRemaining(TRIAL_DURATION_MS);
      setIsTrialExpired(false);
      
      console.log('[Trial] Started for', userEmail, 'expires at', expiresAt.toISOString());
      return true;
    } catch (err) {
      console.error('Start trial error:', err);
      return false;
    }
  }, [userEmail, hasTrialUsed, isAdmin, hasAccess]);

  // Load trial status on mount
  useEffect(() => {
    checkTrialStatus();
  }, [checkTrialStatus]);

  // Timer effect
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
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [isAdmin, hasAccess, isTrialActive, trialExpiresAt]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const canStartTrial = Boolean(userEmail && !hasTrialUsed && !isAdmin && !hasAccess);

  // Effective trial state - admins and paid users bypass trial
  const effectiveTrialActive = !isAdmin && !hasAccess && isTrialActive;
  const effectiveTrialExpired = !isAdmin && !hasAccess && isTrialExpired && hasTrialUsed;

  return {
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
};
