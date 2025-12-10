import { useState, useEffect, useCallback } from 'react';

const TRIAL_START_KEY = 'jamb_trial_start';
const TRIAL_SUBJECTS_KEY = 'jamb_trial_subjects';
const TRIAL_RESULTS_KEY = 'jamb_trial_results';
const TRIAL_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface UseFreeTrialTimerProps {
  userEmail: string | null;
  isAdmin: boolean;
  hasAccess: boolean;
}

export interface TrialState {
  timeRemaining: number | null;
  formattedTime: string | null;
  isTrialExpired: boolean;
  isInTrial: boolean;
  hasTrialStarted: boolean;
  hasCompletedQuiz: boolean;
  trialSubjects: string[] | null;
  trialResults: any | null;
}

export const useFreeTrialTimer = ({ userEmail, isAdmin, hasAccess }: UseFreeTrialTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialSubjects, setTrialSubjects] = useState<string[] | null>(null);
  const [trialResults, setTrialResults] = useState<any>(null);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  const getStorageKey = useCallback((key: string) => {
    return userEmail ? `${key}_${userEmail}` : key;
  }, [userEmail]);

  // Check if user should be in trial mode
  const shouldShowTrial = Boolean(userEmail && !hasAccess && !isAdmin);

  // Get trial start time from localStorage
  const getTrialStartTime = useCallback((): number | null => {
    if (!userEmail) return null;
    const stored = localStorage.getItem(getStorageKey(TRIAL_START_KEY));
    return stored ? parseInt(stored, 10) : null;
  }, [userEmail, getStorageKey]);

  // Check if trial has started
  const checkTrialStarted = useCallback((): boolean => {
    if (!userEmail) return false;
    return localStorage.getItem(getStorageKey(TRIAL_START_KEY)) !== null;
  }, [userEmail, getStorageKey]);

  // Get saved trial subjects
  const getSavedSubjects = useCallback((): string[] | null => {
    if (!userEmail) return null;
    const stored = localStorage.getItem(getStorageKey(TRIAL_SUBJECTS_KEY));
    return stored ? JSON.parse(stored) : null;
  }, [userEmail, getStorageKey]);

  // Get saved trial results
  const getSavedResults = useCallback((): any => {
    if (!userEmail) return null;
    const stored = localStorage.getItem(getStorageKey(TRIAL_RESULTS_KEY));
    return stored ? JSON.parse(stored) : null;
  }, [userEmail, getStorageKey]);

  // Save trial subjects (called after subject selection, BEFORE quiz)
  const saveTrialSubjects = useCallback((subjects: string[]) => {
    if (!userEmail) return;
    localStorage.setItem(getStorageKey(TRIAL_SUBJECTS_KEY), JSON.stringify(subjects));
    setTrialSubjects(subjects);
  }, [userEmail, getStorageKey]);

  // Start the 30-minute trial (called AFTER quiz completion)
  const startTrial = useCallback(() => {
    if (!userEmail) return;
    const key = getStorageKey(TRIAL_START_KEY);
    if (!localStorage.getItem(key)) {
      const now = Date.now();
      localStorage.setItem(key, now.toString());
      setIsInTrial(true);
      setTimeRemaining(TRIAL_DURATION_MS);
      console.log('[Trial] Dashboard timer started for', userEmail, 'at', new Date(now).toISOString());
    }
  }, [userEmail, getStorageKey]);

  // Save quiz results
  const saveTrialResults = useCallback((results: any) => {
    if (!userEmail) return;
    localStorage.setItem(getStorageKey(TRIAL_RESULTS_KEY), JSON.stringify(results));
    setTrialResults(results);
    setHasCompletedQuiz(true);
  }, [userEmail, getStorageKey]);

  // Reset trial (for testing/admin)
  const resetTrial = useCallback(() => {
    if (!userEmail) return;
    localStorage.removeItem(getStorageKey(TRIAL_START_KEY));
    localStorage.removeItem(getStorageKey(TRIAL_SUBJECTS_KEY));
    localStorage.removeItem(getStorageKey(TRIAL_RESULTS_KEY));
    setIsTrialExpired(false);
    setIsInTrial(false);
    setTimeRemaining(null);
    setTrialSubjects(null);
    setTrialResults(null);
    setHasCompletedQuiz(false);
    console.log('[Trial] Reset for', userEmail);
  }, [userEmail, getStorageKey]);

  // Load saved state on mount
  useEffect(() => {
    if (!userEmail) return;
    
    const savedSubjects = getSavedSubjects();
    const savedResults = getSavedResults();
    
    if (savedSubjects) {
      setTrialSubjects(savedSubjects);
    }
    if (savedResults) {
      setTrialResults(savedResults);
      setHasCompletedQuiz(true);
    }
  }, [userEmail, getSavedSubjects, getSavedResults]);

  // Main effect to manage trial timer
  useEffect(() => {
    // Admins and paid users skip trial
    if (isAdmin || hasAccess) {
      setIsInTrial(false);
      setIsTrialExpired(false);
      setTimeRemaining(null);
      return;
    }

    if (!userEmail) {
      setIsInTrial(false);
      return;
    }

    const startTime = getTrialStartTime();
    
    if (!startTime) {
      // Trial dashboard timer not started yet
      setIsInTrial(false);
      setTimeRemaining(null);
      return;
    }

    // Trial was started - check if still active
    const checkTime = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);

      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsTrialExpired(true);
        setIsInTrial(false);
        console.log('[Trial] Expired for', userEmail);
      } else {
        setIsInTrial(true);
        setIsTrialExpired(false);
      }
    };

    // Check immediately
    checkTime();
    
    // Then check every second
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [userEmail, isAdmin, hasAccess, getTrialStartTime]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasTrialStartedValue = checkTrialStarted();

  return {
    timeRemaining,
    formattedTime: timeRemaining !== null ? formatTime(timeRemaining) : null,
    isTrialExpired: shouldShowTrial && isTrialExpired,
    isInTrial: shouldShowTrial && isInTrial,
    hasTrialStarted: hasTrialStartedValue,
    hasCompletedQuiz,
    trialSubjects,
    trialResults,
    startTrial,
    resetTrial,
    saveTrialSubjects,
    saveTrialResults,
    getSavedSubjects,
    getSavedResults,
  };
};
