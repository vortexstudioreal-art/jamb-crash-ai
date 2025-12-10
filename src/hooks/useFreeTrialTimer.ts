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
  const [trialStarted, setTrialStarted] = useState(false);

  // Check if user is in trial mode (logged in but no paid access and not admin)
  const shouldShowTrial = userEmail && !hasAccess && !isAdmin;

  const getTrialStartTime = useCallback(() => {
    if (!userEmail) return null;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : null;
  }, [userEmail]);

  const hasTrialStarted = useCallback(() => {
    if (!userEmail) return false;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    return !!localStorage.getItem(key);
  }, [userEmail]);

  // Manual start trial function - called AFTER subject selection
  const startTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, Date.now().toString());
      setTrialStarted(true);
    }
  }, [userEmail]);

  const resetTrial = useCallback(() => {
    if (!userEmail) return;
    const key = `${TRIAL_START_KEY}_${userEmail}`;
    localStorage.removeItem(key);
    setIsTrialExpired(false);
    setIsInTrial(false);
    setTimeRemaining(null);
    setTrialStarted(false);
  }, [userEmail]);

  useEffect(() => {
    // Admins and paid users skip trial entirely
    if (isAdmin || hasAccess || !userEmail) {
      setIsInTrial(false);
      setIsTrialExpired(false);
      setTimeRemaining(null);
      return;
    }

    // Check if trial was already started
    const existingStart = getTrialStartTime();
    if (!existingStart) {
      // Trial not started yet - user needs to select subjects first
      setIsInTrial(false);
      setTrialStarted(false);
      return;
    }

    // Trial is active
    setTrialStarted(true);
    setIsInTrial(true);

    const checkTime = () => {
      const startTime = getTrialStartTime();
      if (!startTime) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);

      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsTrialExpired(true);
        setIsInTrial(false);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [userEmail, isAdmin, hasAccess, getTrialStartTime, trialStarted]);

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
    hasTrialStarted: hasTrialStarted(),
    startTrial,
    resetTrial,
  };
};
