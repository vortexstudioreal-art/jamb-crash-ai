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
  const [isInTrial, setIsInTrial] = useState(false);

  // Check if user is in trial mode (logged in but no paid access and not admin)
  const shouldShowTrial = userEmail && !hasAccess && !isAdmin;

  const startTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, Date.now().toString());
    }
  }, [userEmail]);

  const getTrialStartTime = useCallback(() => {
    if (!userEmail) return null;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : null;
  }, [userEmail]);

  const resetTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    localStorage.removeItem(key);
    setIsTrialExpired(false);
    setIsInTrial(false);
    setTimeRemaining(null);
  }, [userEmail]);

  useEffect(() => {
    // Admins and paid users skip trial
    if (isAdmin || hasAccess || !userEmail) {
      setIsInTrial(false);
      setIsTrialExpired(false);
      setTimeRemaining(null);
      return;
    }

    // Start trial if not started
    startTrial();
    setIsInTrial(true);

    const checkTime = () => {
      const startTime = getTrialStartTime();
      if (!startTime) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);

      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsTrialExpired(true);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [userEmail, isAdmin, hasAccess, startTrial, getTrialStartTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: timeRemaining !== null ? formatTime(timeRemaining) : null,
    isTrialExpired,
    isInTrial: shouldShowTrial && isInTrial,
    resetTrial,
  };
};