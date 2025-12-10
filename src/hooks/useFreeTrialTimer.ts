import { useState, useEffect, useCallback } from 'react';

const TRIAL_START_KEY = 'jamb_trial_start';
const TRIAL_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface UseFreeTrialTimerProps {
  userEmail: string | null;
  isAdmin: boolean;
  hasAccess: boolean;
}

export const useFreeTrialTimer = ({ userEmail, isAdmin, hasAccess }: UseFreeTrialTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isInTrialState, setIsInTrialState] = useState(false);
  const [trialStartedState, setTrialStartedState] = useState(false);

  // Check if user should be in trial mode (logged in but no paid access and not admin)
  const shouldShowTrial = Boolean(userEmail && !hasAccess && !isAdmin);

  // Check localStorage directly for trial start
  const getTrialStartTime = useCallback((): number | null => {
    if (!userEmail) return null;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : null;
  }, [userEmail]);

  // Check if trial has started (reads localStorage directly)
  const checkTrialStarted = useCallback((): boolean => {
    if (!userEmail) return false;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    return localStorage.getItem(key) !== null;
  }, [userEmail]);

  // Start the 30-minute trial - called AFTER subject selection
  const startTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    if (!localStorage.getItem(key)) {
      const now = Date.now();
      localStorage.setItem(key, now.toString());
      setTrialStartedState(true);
      setIsInTrialState(true);
      setTimeRemaining(TRIAL_DURATION_MS);
      console.log('[Trial] Started for', userEmail, 'at', new Date(now).toISOString());
    }
  }, [userEmail]);

  // Reset trial (for testing/admin)
  const resetTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    localStorage.removeItem(key);
    setIsTrialExpired(false);
    setIsInTrialState(false);
    setTimeRemaining(null);
    setTrialStartedState(false);
    console.log('[Trial] Reset for', userEmail);
  }, [userEmail]);

  // Main effect to manage trial state and timer
  useEffect(() => {
    // Admins and paid users skip trial entirely
    if (isAdmin || hasAccess) {
      setIsInTrialState(false);
      setIsTrialExpired(false);
      setTimeRemaining(null);
      return;
    }

    if (!userEmail) {
      setIsInTrialState(false);
      setTrialStartedState(false);
      return;
    }

    // Check if trial was already started
    const startTime = getTrialStartTime();
    
    if (!startTime) {
      // Trial not started yet - user needs to select subjects first
      setIsInTrialState(false);
      setTrialStartedState(false);
      setTimeRemaining(null);
      return;
    }

    // Trial was started - check if still active
    setTrialStartedState(true);
    
    const checkTime = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);

      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsTrialExpired(true);
        setIsInTrialState(false);
        console.log('[Trial] Expired for', userEmail);
      } else {
        setIsInTrialState(true);
        setIsTrialExpired(false);
      }
    };

    // Check immediately
    checkTime();
    
    // Then check every second
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [userEmail, isAdmin, hasAccess, getTrialStartTime, trialStartedState]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Compute final values
  const hasTrialStartedValue = checkTrialStarted();
  const isInTrialValue = shouldShowTrial && isInTrialState && !isTrialExpired;

  return {
    timeRemaining,
    formattedTime: timeRemaining !== null ? formatTime(timeRemaining) : null,
    isTrialExpired: shouldShowTrial && isTrialExpired,
    isInTrial: isInTrialValue,
    hasTrialStarted: hasTrialStartedValue,
    startTrial,
    resetTrial,
  };
};
